import importlib.util
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/apple_session.py'
spec = importlib.util.spec_from_file_location('queue_runtime', SCRIPT)
queue = importlib.util.module_from_spec(spec)
spec.loader.exec_module(queue)


class QueueTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name).resolve()
        self.state = self.root / 'state'
        self.children = []

    def tearDown(self):
        for child in self.children:
            if child.poll() is None:
                child.terminate()
            child.communicate(timeout=5)
        self.tmp.cleanup()

    def launch(self, app, code, wait=4):
        child = subprocess.Popen([sys.executable, str(SCRIPT), '--state', str(self.state), 'run',
                                  '--app', app, '--worktree', str(self.root / app),
                                  '--wait-seconds', str(wait), '--', sys.executable, '-c', code],
                                 stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        self.children.append(child)
        return child

    def until(self, predicate):
        deadline = time.monotonic() + 5
        while time.monotonic() < deadline:
            if predicate():
                return
            time.sleep(.02)
        self.fail('Condition not reached')

    def test_fifo_owner_and_ordered_waiters_across_apps(self):
        events = self.root / 'events'
        release = self.root / 'release'
        first = self.launch('Old Sport', f'import pathlib,time; p=pathlib.Path({str(release)!r}); print("ready",flush=True);\nwhile not p.exists(): time.sleep(.02)')
        self.assertEqual(first.stdout.readline().strip(), 'ready')
        second = self.launch('HiFi', f'open({str(events)!r},"a").write("HiFi\\n")')
        self.until(lambda: len(queue.snapshot(self.state)['waiting']) == 1)
        third = self.launch('Diem', f'open({str(events)!r},"a").write("Diem\\n")')
        self.until(lambda: len(queue.snapshot(self.state)['waiting']) == 2)
        status = queue.snapshot(self.state)
        self.assertEqual(status['owner']['app'], 'Old Sport')
        self.assertEqual([t['app'] for t in status['waiting']], ['HiFi', 'Diem'])
        release.touch()
        for child in (first, second, third):
            self.assertEqual(child.wait(timeout=5), 0)
        self.assertEqual(events.read_text().splitlines(), ['HiFi', 'Diem'])
        self.assertIsNone(queue.snapshot(self.state)['owner'])

    def test_cancelled_waiter_is_removed_and_timeout_starts_no_work(self):
        marker = self.root / 'forbidden'
        with queue.session('owner', state=self.state):
            child = self.launch('cancelled', 'print("forbidden")')
            self.until(lambda: len(queue.snapshot(self.state)['waiting']) == 1)
            child.terminate()
            child.wait(timeout=3)
            blocked = self.launch('timeout', f'open({str(marker)!r},"w").write("bad")', wait=.1)
            self.assertNotEqual(blocked.wait(timeout=3), 0)
        self.assertFalse(marker.exists())
        self.assertEqual(queue.snapshot(self.state)['waiting'], [])

    def test_legacy_lock_blocks_new_queue(self):
        import fcntl
        state = queue.private_dir(self.state)
        fd = queue.private_fd(state / 'native-session.lock')
        try:
            fcntl.flock(fd, fcntl.LOCK_EX)
            self.assertTrue(queue.snapshot(self.state)['legacy_owner_unknown'])
            child = self.launch('new app', 'print("must not run")', wait=.1)
            self.assertNotEqual(child.wait(timeout=3), 0)
            self.assertEqual(child.stdout.read(), '')
        finally:
            os.close(fd)

    def test_child_survives_supervisor_crash_without_handover(self):
        release = self.root / 'release'
        first = self.launch('crashed owner', f'import pathlib,time; p=pathlib.Path({str(release)!r}); print("ready",flush=True);\nwhile not p.exists(): time.sleep(.02)')
        self.assertEqual(first.stdout.readline().strip(), 'ready')
        first.kill()
        first.wait(timeout=3)
        blocked = self.launch('waiting', 'print("must not run")', wait=.1)
        self.assertNotEqual(blocked.wait(timeout=3), 0)
        status = queue.snapshot(self.state)
        self.assertEqual(status['owner']['app'], 'crashed owner')
        release.touch()
        self.until(lambda: queue.snapshot(self.state)['recovery_required'])

    def test_owner_held_until_grandchild_cleanup(self):
        done = self.root / 'done'
        code = f'import subprocess,sys; p=subprocess.Popen([sys.executable,"-c",{("import time,pathlib; time.sleep(.3); pathlib.Path("+repr(str(done))+").touch()")!r}])'
        first = self.launch('cleanup', code)
        self.until(lambda: queue.snapshot(self.state)['owner'] is not None)
        second = self.launch('next', f'import pathlib; assert pathlib.Path({str(done)!r}).exists()')
        self.assertEqual(first.wait(timeout=5), 0)
        self.assertEqual(second.wait(timeout=5), 0)

    def test_inherited_nested_wrapper_does_not_deadlock(self):
        nested = [sys.executable, str(SCRIPT), '--state', str(self.state), 'run', '--app', 'nested', '--', sys.executable, '-c', 'print("nested ok")']
        code = f'import os,subprocess; subprocess.run({nested!r},pass_fds=(int(os.environ["APPLE_SESSION_FD"]),),check=True)'
        child = self.launch('outer', code)
        out, err = child.communicate(timeout=5)
        self.assertEqual(child.returncode, 0, err)
        self.assertIn('nested ok', out)

    def test_symlink_directory_and_lock_fail_closed(self):
        actual = self.root / 'actual'
        actual.mkdir(mode=0o700)
        alias = self.root / 'alias'
        alias.symlink_to(actual, target_is_directory=True)
        with self.assertRaises(RuntimeError), queue.session(state=alias):
            pass
        (actual / 'native-session.lock').symlink_to(self.root / 'untouched')
        with self.assertRaises(OSError), queue.session(state=actual):
            pass
        self.assertFalse((self.root / 'untouched').exists())

    def test_independent_fd_and_copied_owner_id_cannot_impersonate_owner(self):
        with queue.session('real owner', state=self.state):
            owner = queue.snapshot(self.state)['owner']
            code = ('import os,importlib.util; '
                    f'spec=importlib.util.spec_from_file_location("q",{str(SCRIPT)!r}); '
                    'q=importlib.util.module_from_spec(spec); spec.loader.exec_module(q); '
                    f'state=q.Path({str(self.state)!r}); '
                    'fd=q.private_fd(state/"native-session.lock"); '
                    f'os.environ.update(APPLE_SESSION_FD=str(fd),APPLE_SESSION_ID={owner["id"]!r}); '
                    'assert not q.inherited(state)')
            result = subprocess.run([sys.executable, '-c', code], capture_output=True, text=True, timeout=5)
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_private_metadata_has_no_command_arguments(self):
        with queue.session('app', state=self.state):
            status = queue.snapshot(self.state)
            self.assertNotIn('command', json.dumps(status))
            self.assertEqual((self.state.stat().st_mode & 0o777), 0o700)
        with self.assertRaises(ValueError), queue.session(state=self.state, wait_seconds=float('nan')):
            pass


if __name__ == '__main__':
    unittest.main()
