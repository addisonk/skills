#!/usr/bin/env python3
"""Inventory, or explicitly authorize expiry of, simulator testmanagerd temp files."""
import argparse
import datetime
import fcntl
import json
import os
from pathlib import Path
import plistlib
import shutil
import socket
import stat
import subprocess
import time


def stamp():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def snapshot(info):
    return [info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_uid]


def inspect(devices_root, cutoff, uid):
    """Read metadata only; unfamiliar layouts and links are never followed."""
    result = []
    if devices_root.is_symlink() or devices_root.resolve() != devices_root:
        raise ValueError('Devices root must be a real canonical directory')
    if not devices_root.exists():
        return result
    for device in sorted(devices_root.iterdir()):
        internal = device / 'data/Containers/Data/InternalDaemon'
        if device.is_symlink() or not device.is_dir() or not internal.is_dir():
            continue
        if internal.resolve() != internal:
            continue
        for container in sorted(internal.iterdir()):
            metadata = container / '.com.apple.mobile_container_manager.metadata.plist'
            if container.is_symlink() or not metadata.is_file() or metadata.is_symlink():
                continue
            if plistlib.loads(metadata.read_bytes()).get('MCMMetadataIdentifier') != 'com.apple.testmanagerd':
                continue
            root = container / 'tmp/Attachments'
            if not root.is_dir() or root.is_symlink() or root.resolve() != root:
                continue
            if root.stat().st_uid != uid:
                raise ValueError('Unexpected attachment-directory owner')
            entry = {'device': device.name, 'root': str(root), 'container': str(container),
                     'files': [], 'recentFiles': 0, 'blocked': []}
            for path in sorted(root.iterdir()):
                info = path.lstat()
                if not stat.S_ISREG(info.st_mode) or info.st_uid != uid:
                    entry['blocked'].append('Non-regular entry or unexpected owner: ' + path.name)
                elif info.st_mtime >= cutoff:
                    entry['recentFiles'] += 1
                else:
                    entry['files'].append({'name': path.name, 'snapshot': snapshot(info),
                                           'allocatedBytes': info.st_blocks * 512})
            result.append(entry)
    return result


def remove_entry(entry, cutoff, check_idle, removed=None):
    """Remove only an inspected, still-identical list; preserve the directory."""
    if entry['blocked']:
        raise ValueError('Unfamiliar attachment contents; preserve this container')
    root = Path(entry['root'])
    if root.is_symlink() or root.resolve() != root:
        raise ValueError('Attachment path changed')
    metadata = Path(entry['container']) / '.com.apple.mobile_container_manager.metadata.plist'
    if metadata.is_symlink() or plistlib.loads(metadata.read_bytes()).get('MCMMetadataIdentifier') != 'com.apple.testmanagerd':
        raise ValueError('Container identity changed')
    check_idle(entry['device'], root)
    removed = [] if removed is None else removed
    fd = os.open(root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        # Validate the whole selected list before the first unlink.
        for item in entry['files']:
            name = item['name']
            if Path(name).name != name or name in ('.', '..'):
                raise ValueError('Unsafe attachment name')
            info = os.stat(name, dir_fd=fd, follow_symlinks=False)
            if snapshot(info) != item['snapshot'] or not stat.S_ISREG(info.st_mode) or info.st_mtime >= cutoff:
                raise ValueError('An attachment changed; re-inventory before retrying')
        for item in entry['files']:
            info = os.stat(item['name'], dir_fd=fd, follow_symlinks=False)
            if snapshot(info) != item['snapshot'] or not stat.S_ISREG(info.st_mode):
                raise ValueError('An attachment changed immediately before removal')
            os.unlink(item['name'], dir_fd=fd)
            removed.append(item['name'])
    finally:
        os.close(fd)
    if any((root / name).exists() for name in removed):
        raise RuntimeError('Selected attachment still exists')
    return removed


def run(argv):
    return subprocess.run(argv, capture_output=True, text=True, timeout=30)


def require_lease():
    """Use the queue's live identity, not merely an environment marker."""
    fd = int(os.environ['APPLE_SESSION_FD'])
    os.fstat(fd)
    status = run([str(Path.home() / '.local/bin/apple-session'), 'status'])
    status.check_returncode()
    state = json.loads(status.stdout)
    owner = state.get('owner') or {}
    if (state.get('recovery_required') or state.get('legacy_owner_unknown') or
            owner.get('id') != os.environ.get('APPLE_SESSION_ID') or owner.get('pgid') != os.getpgrp()):
        raise ValueError('This process does not own the current Apple session')


def check_idle(device_id, root):
    require_lease()
    listed = run(['xcrun', 'simctl', 'list', 'devices', '--json'])
    listed.check_returncode()
    devices = {d['udid']: d for group in json.loads(listed.stdout)['devices'].values() for d in group}
    if devices.get(device_id, {}).get('state') != 'Shutdown':
        raise ValueError('Target simulator is not shut down')
    processes = run(['ps', '-axo', 'comm='])
    processes.check_returncode()
    if any(Path(line.strip()).name in ('xcodebuild', 'xctest', 'swift-frontend', 'clang')
           or Path(line.strip()).name.endswith('XCTRunner') for line in processes.stdout.splitlines()):
        raise ValueError('Build or test work is active')
    # Run before opening our own directory handle, which would appear in lsof.
    opened = run(['lsof', '-nP', '+D', str(root)])
    if opened.returncode != 1 or opened.stdout.strip() or opened.stderr.strip():
        raise ValueError('Attachments are open or open-file verification failed')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--policy', type=Path, required=True)
    parser.add_argument('--receipt', type=Path, required=True)
    parser.add_argument('--apply', action='store_true', help='Requires enabled host policy and the held Apple session')
    args = parser.parse_args()
    policy = json.loads(args.policy.read_text())
    days = policy.get('retentionDays', 30)
    if isinstance(days, bool) or not isinstance(days, int) or days < 1:
        raise ValueError('Retention days must be a positive integer')
    if policy.get('host') != socket.gethostname():
        raise ValueError('Cleanup policy belongs to another host')
    if args.apply and policy.get('enabled') is not True:
        raise ValueError('Temporary test-attachment cleanup is not authorized')
    if args.apply:
        require_lease()
    if args.receipt.exists():
        raise ValueError('Use a new receipt path; preserve earlier evidence')
    args.receipt.parent.mkdir(parents=True, exist_ok=True)
    cutoff = time.time() - days * 86400
    devices_root = Path.home() / 'Library/Developer/CoreSimulator/Devices'
    report = {'host': socket.gethostname(), 'startedAt': stamp(), 'mode': 'apply' if args.apply else 'inspect',
              'retentionDays': days, 'freeBytesBefore': shutil.disk_usage(Path.home()).free,
              'targets': inspect(devices_root, cutoff, os.getuid()), 'removed': [], 'blocked': [], 'status': 'running'}

    def save():
        temp = args.receipt.with_name('.' + args.receipt.name + '.tmp')
        temp.write_text(json.dumps(report, indent=2) + '\n')
        os.chmod(temp, 0o600)
        temp.replace(args.receipt)

    save()
    try:
        if args.apply:
            lock_path = args.policy.parent / 'test-attachments.cleanup.lock'
            with lock_path.open('a') as lock:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                for entry in report['targets']:
                    if not entry['files']:
                        continue
                    names = []
                    report['removed'].append({'root': entry['root'], 'files': names})
                    try:
                        remove_entry(entry, cutoff, check_idle, names)
                    except (ValueError, OSError, subprocess.SubprocessError) as error:
                        report['blocked'].append({'root': entry['root'], 'reason': str(error)})
                    save()
        report['status'] = 'completed_with_skips' if report['blocked'] else 'completed'
    except Exception:
        report['status'] = 'failed'
        raise
    finally:
        report['finishedAt'] = stamp()
        report['freeBytesAfter'] = shutil.disk_usage(Path.home()).free
        report['netFreeBytesChange'] = report['freeBytesAfter'] - report['freeBytesBefore']
        save()
    print(json.dumps({'status': report['status'], 'expiredFiles': sum(len(x['files']) for x in report['targets']),
                      'removedFiles': sum(len(x['files']) for x in report['removed']), 'blocked': report['blocked'],
                      'receipt': str(args.receipt)}))


if __name__ == '__main__':
    main()
