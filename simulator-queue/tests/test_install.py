import importlib.util
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/install.py'
spec = importlib.util.spec_from_file_location('installer', SCRIPT)
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


class InstallTests(unittest.TestCase):
    def test_idempotent_and_preserves_global_files_exactly(self):
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
                self.assertEqual(text, prefix + "\n")
            self.assertTrue((home/'.local/bin/apple-session').stat().st_mode & 0o100)
            self.assertEqual((home/'.local/share/apple-session/apple_session.py').read_bytes(),
                             (SCRIPT.parent/'apple_session.py').read_bytes())

    def test_symlink_rule_file_is_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory).resolve()
            target = home/'original'
            target.write_text('preserved')
            (home/'AGENTS.md').symlink_to(target)
            installer.install(home)
            self.assertTrue((home/'AGENTS.md').is_symlink())
            self.assertEqual(target.read_text(), 'preserved')

    def test_fresh_install_does_not_create_global_rules(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            installer.install(home)
            self.assertFalse((home/'AGENTS.md').exists())
            self.assertFalse((home/'.codex').exists())

    def test_old_managed_block_is_not_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            content = ('<!-- BEGIN SHARED APPLE SIMULATOR QUEUE -->\n'
                       'User-edited guidance\n'
                       '<!-- END SHARED APPLE SIMULATOR QUEUE -->\n')
            for path in (home/'AGENTS.md', home/'.codex/AGENTS.md'):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content)
            installer.install(home)
            for path in (home/'AGENTS.md', home/'.codex/AGENTS.md'):
                self.assertEqual(path.read_text(), content)


if __name__ == '__main__':
    unittest.main()
