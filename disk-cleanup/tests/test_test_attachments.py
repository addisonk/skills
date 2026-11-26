import importlib.util
import json
import os
from pathlib import Path
import plistlib
import socket
import subprocess
import sys
import tempfile
import time
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/test_attachments.py'
spec = importlib.util.spec_from_file_location('test_attachments', SCRIPT)
cleaner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cleaner)


class AttachmentCleanupTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.home = Path(self.temp.name).resolve()
        self.devices = self.home / 'Library/Developer/CoreSimulator/Devices'
        self.container = self.devices / 'device/data/Containers/Data/InternalDaemon/test-daemon'
        self.root = self.container / 'tmp/Attachments'
        self.root.mkdir(parents=True)
        self.metadata = self.container / '.com.apple.mobile_container_manager.metadata.plist'
        self.metadata.write_bytes(plistlib.dumps({'MCMMetadataIdentifier': 'com.apple.testmanagerd'}))
        self.old = self.root / 'old-attachment'
        self.old.write_bytes(b'old test attachment')
        self.old_time = time.time() - 31 * 86400
        os.utime(self.old, (self.old_time, self.old_time))
        self.recent = self.root / 'recent-attachment'
        self.recent.write_bytes(b'recent test attachment')
        self.cutoff = time.time() - 30 * 86400

    def entries(self):
        return cleaner.inspect(self.devices, self.cutoff, os.getuid())

    def test_expiry_preserves_recent_files_app_data_and_exports(self):
        app = self.devices / 'device/data/Containers/Data/Application/app/Documents/saved.mov'
        app.parent.mkdir(parents=True)
        app.write_bytes(b'app data')
        exported = self.home / 'saved-test.xcresult/recording.mov'
        exported.parent.mkdir()
        exported.write_bytes(b'intentional export')
        entries = self.entries()
        removed = cleaner.remove_entry(entries[0], self.cutoff, lambda *_: None)
        self.assertEqual(removed, [self.old.name])
        self.assertFalse(self.old.exists())
        self.assertTrue(self.root.is_dir())
        self.assertEqual(self.recent.read_bytes(), b'recent test attachment')
        self.assertEqual(app.read_bytes(), b'app data')
        self.assertEqual(exported.read_bytes(), b'intentional export')

    def test_read_only_cli_reports_without_removing(self):
        result, receipt = self.cli(apply=False)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(receipt['mode'], 'inspect')
        self.assertEqual(len(receipt['targets'][0]['files']), 1)
        self.assertTrue(self.old.exists())

    def test_disabled_policy_refuses_apply(self):
        result, _ = self.cli(apply=True, enabled=False)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('not authorized', result.stderr)
        self.assertTrue(self.old.exists())

    def test_apply_without_owned_apple_session_refuses(self):
        result, _ = self.cli(apply=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertTrue(self.old.exists())

    def test_busy_device_or_open_file_guard_prevents_removal(self):
        def busy(*_):
            raise ValueError('Device booted or attachment open')
        with self.assertRaises(ValueError):
            cleaner.remove_entry(self.entries()[0], self.cutoff, busy)
        self.assertTrue(self.old.exists())

    def test_changed_file_is_preserved(self):
        entry = self.entries()[0]
        self.old.write_bytes(b'changed since inventory')
        with self.assertRaises(ValueError):
            cleaner.remove_entry(entry, self.cutoff, lambda *_: None)
        self.assertEqual(self.old.read_bytes(), b'changed since inventory')

    def test_symlink_entry_blocks_container_without_following(self):
        outside = self.home / 'valuable-file'
        outside.write_bytes(b'keep')
        (self.root / 'link').symlink_to(outside)
        with self.assertRaises(ValueError):
            cleaner.remove_entry(self.entries()[0], self.cutoff, lambda *_: None)
        self.assertTrue(self.old.exists())
        self.assertEqual(outside.read_bytes(), b'keep')

    def test_symlink_container_is_not_traversed(self):
        linked = self.devices / 'other/data/Containers/Data/InternalDaemon'
        linked.parent.mkdir(parents=True)
        linked.symlink_to(self.container.parent)
        self.assertEqual(len(self.entries()), 1)

    def test_wrong_daemon_identity_is_ignored(self):
        self.metadata.write_bytes(plistlib.dumps({'MCMMetadataIdentifier': 'some.app'}))
        self.assertEqual(self.entries(), [])
        self.assertTrue(self.old.exists())

    def test_changed_container_identity_refuses_removal(self):
        entry = self.entries()[0]
        self.metadata.write_bytes(plistlib.dumps({'MCMMetadataIdentifier': 'some.app'}))
        with self.assertRaises(ValueError):
            cleaner.remove_entry(entry, self.cutoff, lambda *_: None)
        self.assertTrue(self.old.exists())

    def test_unknown_subdirectory_blocks_root(self):
        (self.root / 'unique-results.xcresult').mkdir()
        with self.assertRaises(ValueError):
            cleaner.remove_entry(self.entries()[0], self.cutoff, lambda *_: None)
        self.assertTrue(self.old.exists())

    def test_repeat_inventory_after_cleanup_is_empty(self):
        cleaner.remove_entry(self.entries()[0], self.cutoff, lambda *_: None)
        self.assertEqual(self.entries()[0]['files'], [])

    def cli(self, apply, enabled=True):
        policy = self.home / 'policy.json'
        policy.write_text(json.dumps({'host': socket.gethostname(), 'enabled': enabled, 'retentionDays': 30}))
        receipt = self.home / 'receipt.json'
        env = {k: v for k, v in os.environ.items() if not k.startswith('APPLE_SESSION_')}
        env['HOME'] = str(self.home)
        args = [sys.executable, str(SCRIPT), '--policy', str(policy), '--receipt', str(receipt)]
        if apply:
            args.append('--apply')
        result = subprocess.run(args, env=env, capture_output=True, text=True)
        return result, json.loads(receipt.read_text()) if receipt.exists() else None


if __name__ == '__main__':
    unittest.main()
