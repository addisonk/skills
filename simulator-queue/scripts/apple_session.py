#!/usr/bin/env python3
"""Machine-wide FIFO admission for cooperating native Apple development sessions."""
import argparse
from contextlib import contextmanager
import fcntl
import json
import math
import os
from pathlib import Path
import signal
import stat
import subprocess
import sys
import time
import uuid

STATE = Path.home() / 'Library/Application Support/AppleDevelopment'
_depth = 0
_current = None


def private_dir(path):
    path = Path(path).absolute()
    if any(p.is_symlink() for p in (path, *path.parents)):
        raise RuntimeError('Queue paths must not traverse symlinks.')
    path.mkdir(mode=0o700, parents=True, exist_ok=True)
    info = path.stat()
    if info.st_uid != os.getuid() or info.st_mode & 0o077:
        raise RuntimeError('Queue directory must be private to the current user.')
    return path


def private_fd(path):
    fd = os.open(path, os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    info = os.fstat(fd)
    if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077 or info.st_nlink != 1:
        os.close(fd)
        raise RuntimeError('Queue file must be a private, singly linked regular file.')
    return fd


def read(path):
    fd = private_fd(path)
    try:
        with os.fdopen(fd, 'r') as stream:
            return json.load(stream)
    except json.JSONDecodeError as error:
        raise RuntimeError(f'Invalid queue metadata: {path.name}; leave it intact for inspection.') from error


def write(path, value):
    temporary = path.with_name(path.name + '.' + uuid.uuid4().hex)
    fd = private_fd(temporary)
    try:
        with os.fdopen(fd, 'w') as stream:
            json.dump(value, stream)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


@contextmanager
def guard(state):
    fd = private_fd(state / 'queue.lock')
    try:
        fcntl.flock(fd, fcntl.LOCK_EX)
        yield
    finally:
        os.close(fd)


def tickets(state):
    """Reap abandoned waiters using OS locks, never PID age or an expiring TTL."""
    result = []
    for path in (state / 'tickets').glob('*.json'):
        fd = private_fd(path.with_suffix('.lock'))
        try:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                result.append(read(path))
            else:
                path.unlink()
                # Keep lock inodes: an open-but-unlinked lock can split ownership.
        finally:
            os.close(fd)
    return sorted(result, key=lambda ticket: ticket['sequence'])


def group_alive(pgid):
    if not pgid:
        return False
    try:
        os.killpg(pgid, 0)
        return True
    except ProcessLookupError:
        return False


def snapshot(state=STATE):
    state = private_dir(state)
    private_dir(state / 'tickets')
    with guard(state):
        waiting = tickets(state)
        owner = read(state / 'owner.json') if (state / 'owner.json').exists() else None
        # A leftover owner receipt is deliberately fail-closed after a crash.
        legacy_fd = private_fd(state / 'native-session.lock')
        try:
            try:
                fcntl.flock(legacy_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                legacy_busy = False
            except BlockingIOError:
                legacy_busy = owner is None
        finally:
            os.close(legacy_fd)
        return {'legacy_owner_unknown': legacy_busy, 'owner': owner, 'waiting': [t for t in waiting if not owner or t['id'] != owner['id']],
                'recovery_required': bool(owner and not any(t['id'] == owner['id'] for t in waiting))}


def inherited(state):
    """Accept only an inherited descriptor for the exact held legacy lock inode."""
    try:
        fd = int(os.environ['APPLE_SESSION_FD'])
        token = os.environ['APPLE_SESSION_ID']
        info = os.fstat(fd)
        actual = (state / 'native-session.lock').lstat()
        if not stat.S_ISREG(actual.st_mode) or (info.st_dev, info.st_ino) != (actual.st_dev, actual.st_ino):
            return False
        owner = read(state / 'owner.json')
        if owner['id'] != token:
            return False
        # A descriptor number alone is not proof that an exclusive lease is held.
        probe = private_fd(state / 'native-session.lock')
        try:
            try:
                fcntl.flock(probe, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return False
            except BlockingIOError:
                # Re-locking the same inherited open-file description succeeds;
                # an independently opened fd for somebody else's lease fails.
                try:
                    fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                    return True
                except BlockingIOError:
                    return False
        finally:
            os.close(probe)
    except (KeyError, ValueError, OSError, RuntimeError):
        return False


@contextmanager
def session(app=None, worktree=None, state=STATE, wait_seconds=1800):
    global _depth, _current
    if not math.isfinite(wait_seconds) or wait_seconds < 0:
        raise ValueError('Wait must be finite and nonnegative.')
    state = private_dir(state)
    private_dir(state / 'tickets')
    if _depth or inherited(state):
        _depth += 1
        try:
            yield _current
        finally:
            _depth -= 1
        return
    token = uuid.uuid4().hex
    ticket_path = state / 'tickets' / (token + '.json')
    ticket_fd = private_fd(ticket_path.with_suffix('.lock'))
    lease_fd = private_fd(state / 'native-session.lock')
    fcntl.flock(ticket_fd, fcntl.LOCK_EX)
    owned = False
    try:
        with guard(state):
            counter = state / 'sequence.json'
            sequence = read(counter) + 1 if counter.exists() else 1
            write(counter, sequence)
            ticket = {'id': token, 'sequence': sequence, 'app': app or Path.cwd().name,
                      'worktree': str(Path(worktree or Path.cwd()).absolute()), 'pid': os.getpid(),
                      'queued_at': time.time(), 'phase': 'waiting'}
            write(ticket_path, ticket)
        deadline = time.monotonic() + wait_seconds
        announced = False
        while not owned:
            with guard(state):
                queue = tickets(state)
                # Preserve crash receipts until the session is explicitly inspected.
                if queue and queue[0]['id'] == token and not (state / 'owner.json').exists():
                    try:
                        fcntl.flock(lease_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                        ticket.update(phase='owned', acquired_at=time.time())
                        write(state / 'owner.json', ticket)
                        owned = True
                    except BlockingIOError:
                        pass  # Existing Old Sport checkouts still hold this same lock.
            if not owned:
                if not announced:
                    print('Simulator session queued. Use apple-session status for owner and waiting order. Continue independent code work; do not take over the simulator.', file=sys.stderr, flush=True)
                    announced = True
                if time.monotonic() >= deadline:
                    raise RuntimeError('Simulator queue wait expired; no native work started. Inspect apple-session status.')
                time.sleep(min(0.1, max(0, deadline - time.monotonic())))
        _depth = 1
        _current = {'fd': lease_fd, 'ticket_fd': ticket_fd, 'ticket': ticket, 'state': state}
        print(f"Simulator owner: {ticket['app']} ({ticket['worktree']})", file=sys.stderr, flush=True)
        try:
            yield _current
        finally:
            _depth = 0
            _current = None
    finally:
        with guard(state):
            if owned:
                owner = read(state / 'owner.json')
                # CLI children can outlive their parent. Never silently hand over.
                if not group_alive(owner.get('pgid')):
                    (state / 'owner.json').unlink()
            ticket_path.unlink(missing_ok=True)
        os.close(lease_fd)
        os.close(ticket_fd)


def run(command, app=None, worktree=None, state=STATE, wait_seconds=1800):
    if inherited(Path(state)):
        # Keep the outer session and its cleanup boundary intact.
        return subprocess.call(command, pass_fds=(int(os.environ['APPLE_SESSION_FD']),))
    with session(app, worktree, state, wait_seconds) as lease:
        env = dict(os.environ, APPLE_SESSION_FD=str(lease['fd']), APPLE_SESSION_ID=lease['ticket']['id'])
        old_handlers = {}
        child = None
        pending = []
        def forward(signum, _frame):
            pending.append(signum)
            if child is not None:
                try:
                    os.killpg(child.pid, signum)
                except ProcessLookupError:
                    pass
        for sig in (signal.SIGINT, signal.SIGTERM, signal.SIGHUP):
            old_handlers[sig] = signal.signal(sig, forward)
        try:
            # Record the group BEFORE exec: no crash gap where native work exists
            # without a receipt. A pipe gates child startup until metadata is durable.
            ready_r, ready_w = os.pipe()
            gate = 'import os,sys; ready=os.read(int(sys.argv[1]),1); os.close(int(sys.argv[1])); sys.exit(125) if ready != b"1" else os.execvpe(sys.argv[2],sys.argv[2:],os.environ)'
            try:
                child = subprocess.Popen([sys.executable, '-c', gate, str(ready_r), *command],
                                         start_new_session=True, env=env,
                                         pass_fds=(lease['fd'], lease['ticket_fd'], ready_r))
                with guard(lease['state']):
                    owner = read(lease['state'] / 'owner.json')
                    owner.update(pgid=child.pid, phase='verification / cleanup')
                    write(lease['state'] / 'owner.json', owner)
                os.write(ready_w, b'1')
            finally:
                os.close(ready_r)
                os.close(ready_w)
            for sig in list(pending):
                forward(sig, None)
            result = child.wait()
            # Normal completion may leave grandchildren; keep the slot until they
            # exit. Do not kill them or declare cleanup complete on the parent's exit.
            announced = False
            while group_alive(child.pid):
                if not announced:
                    print('Owner command exited; waiting for its remaining processes to finish cleanup.', file=sys.stderr, flush=True)
                    announced = True
                time.sleep(0.2)
            return result if result >= 0 else 128 - result
        finally:
            for sig, handler in old_handlers.items():
                signal.signal(sig, handler)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state', type=Path, default=STATE, help=argparse.SUPPRESS)
    sub = parser.add_subparsers(dest='action', required=True)
    sub.add_parser('status')
    sub.add_parser('check-lease', help=argparse.SUPPRESS)
    execute = sub.add_parser('run')
    execute.add_argument('--app', required=True)
    execute.add_argument('--worktree', default=os.getcwd())
    execute.add_argument('--wait-seconds', type=float, default=1800)
    execute.add_argument('command', nargs=argparse.REMAINDER)
    recovery = sub.add_parser('recover', help='Clear an inspected crash receipt only after all owned work has stopped')
    recovery.add_argument('--confirm-id', required=True)
    args = parser.parse_args()
    if args.action == 'check-lease':
        return 0 if inherited(args.state) else 1
    if args.action == 'status':
        print(json.dumps(snapshot(args.state), indent=2))
        return 0
    if args.action == 'recover':
        state = private_dir(args.state)
        private_dir(state / 'tickets')
        with guard(state):
            owner = read(state / 'owner.json')
            if owner['id'] != args.confirm_id or any(t['id'] == owner['id'] for t in tickets(state)) or group_alive(owner.get('pgid')):
                raise RuntimeError('Owner identity differs or its processes are still active; recovery refused.')
            if not owner.get('pgid'):
                raise RuntimeError('This library session has no supervised process group. Inspect its build processes manually; automatic recovery is unavailable.')
            fd = private_fd(state / 'native-session.lock')
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                (state / 'owner.json').unlink()
            finally:
                os.close(fd)
        return 0
    command = args.command[1:] if args.command[:1] == ['--'] else args.command
    if not command:
        parser.error('Supply a command after --.')
    return run(command, args.app, args.worktree, args.state, args.wait_seconds)


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
    except (RuntimeError, OSError, ValueError) as error:
        print(f'apple-session: {error}', file=sys.stderr)
        raise SystemExit(1)
