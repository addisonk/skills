#!/usr/bin/env python3
"""Install the local shared queue and its managed agent rule, preserving other rules."""
import argparse
import hashlib
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
BEGIN = '<!-- BEGIN SHARED APPLE SIMULATOR QUEUE -->'
END = '<!-- END SHARED APPLE SIMULATOR QUEUE -->'


def atomic(path, data, mode):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_symlink():
        raise RuntimeError(f'Refusing to replace symlink: {path}')
    temporary = path.with_name(path.name + '.install-' + str(os.getpid()))
    fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, mode)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def install(home):
    home = home.resolve()
    source = (ROOT / 'scripts/apple_session.py').read_bytes()
    rule = (ROOT / 'RULE.md').read_text().strip()
    runtime = home / '.local/share/apple-session/apple_session.py'
    entry = home / '.local/bin/apple-session'
    # The stable runtime is loaded once by each process. Atomic replacement does
    # not alter a running owner's code, metadata or lock inode.
    atomic(runtime, source, 0o700)
    wrapper = ('#!/usr/bin/env python3\nimport os,sys\n'
               f'os.execv(sys.executable,[sys.executable,{str(runtime)!r},*sys.argv[1:]])\n')
    atomic(entry, wrapper.encode(), 0o700)
    for path in (home / 'AGENTS.md', home / '.codex/AGENTS.md'):
        text = path.read_text() if path.exists() else ''
        if (BEGIN in text) != (END in text):
            raise RuntimeError(f'Incomplete managed block in {path}; left intact.')
        if BEGIN in text:
            start = text.index(BEGIN)
            finish = text.index(END, start) + len(END)
            text = text[:start] + rule + text[finish:]
        else:
            text = text.rstrip() + '\n\n' + rule + '\n'
        atomic(path, text.encode(), 0o644)
    print(f'Installed apple-session ({hashlib.sha256(source).hexdigest()[:12]}); global rules updated.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--home', type=Path, default=Path.home(), help=argparse.SUPPRESS)
    install(parser.parse_args().home)
