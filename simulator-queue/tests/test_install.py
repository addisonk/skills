import importlib.util
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/install.py'
spec = importlib.util.spec_from_file_location('installer', SCRIPT)
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


class InstallTests(unittest.TestCase):
    def test_idempotent_and_preserves_unrelated_rules(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory).resolve()
            (home / 'AGENTS.md').write_text('Existing home rules.\n')
            (home / '.codex').mkdir()
            (home / '.codex/AGENTS.md').write_text('Existing Codex rules.\n')
            installer.install(home)
            installer.install(home)
            for path, prefix in [(home/'AGENTS.md', 'Existing home rules.'),
                                 (home/'.codex/AGENTS.md', 'Existing Codex rules.')]:
                text = path.read_text()
                self.assertTrue(text.startswith(prefix))
                self.assertEqual(text.count(installer.BEGIN), 1)
            self.assertTrue((home/'.local/bin/apple-session').stat().st_mode & 0o100)
            self.assertEqual((home/'.local/share/apple-session/apple_session.py').read_bytes(),
                             (SCRIPT.parent/'apple_session.py').read_bytes())

    def test_symlink_rule_file_is_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory).resolve()
            target = home/'original'
            target.write_text('preserved')
            (home/'AGENTS.md').symlink_to(target)
            with self.assertRaises(RuntimeError):
                installer.install(home)
            self.assertEqual(target.read_text(), 'preserved')


if __name__ == '__main__':
    unittest.main()
