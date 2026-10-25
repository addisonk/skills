import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class NodeAdapterTests(unittest.TestCase):
    def test_launcher_enters_once_and_keeps_inherited_descriptor(self):
        if not shutil.which('node'):
            self.skipTest('Node is not installed')
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory).resolve()
            installed = subprocess.run([sys.executable, str(ROOT/'scripts/install.py'), '--home', str(home)],
                                       capture_output=True, text=True)
            self.assertEqual(installed.returncode, 0, installed.stderr)
            adapter = home/'join-queue.mjs'
            shutil.copyfile(ROOT/'scripts/join-queue.mjs', adapter)
            launcher = home/'launcher.mjs'
            launcher.write_text('import {joinQueue} from "./join-queue.mjs";\n'
                                'await joinQueue("fake Expo app", process.cwd());\n'
                                'console.log("verified under queue");\n')
            env = dict(os.environ, HOME=str(home))
            # macOS Python and Node both honor HOME for Path.home()/homedir().
            result = subprocess.run(['node', str(launcher)], env=env, cwd=home,
                                    capture_output=True, text=True, timeout=10)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(result.stdout.strip(), 'verified under queue')
            self.assertEqual(result.stderr.count('Simulator owner:'), 1)
            self.assertFalse((home/'Library/Application Support/AppleDevelopment/owner.json').exists())

    def test_forged_inherited_marker_cannot_bypass_admission(self):
        if not shutil.which('node'):
            self.skipTest('Node is not installed')
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory).resolve()
            subprocess.run([sys.executable, str(ROOT/'scripts/install.py'), '--home', str(home)],
                           capture_output=True, check=True)
            shutil.copyfile(ROOT/'scripts/join-queue.mjs', home/'join-queue.mjs')
            (home/'launcher.mjs').write_text('import {joinQueue} from "./join-queue.mjs"; await joinQueue("fake",process.cwd()); console.log("bad");')
            env = dict(os.environ, HOME=str(home), APPLE_SESSION_FD='999', APPLE_SESSION_ID='fake')
            result = subprocess.run(['node', str(home/'launcher.mjs')], env=env,
                                    capture_output=True, text=True, timeout=10)
            self.assertNotEqual(result.returncode, 0)
            self.assertNotIn('bad', result.stdout)


if __name__ == '__main__':
    unittest.main()
