#!/usr/bin/env python3
"""Install the portable skill and a managed global Codex discovery hint."""
import argparse
import hashlib
import os
from pathlib import Path
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BEGIN = '<!-- BEGIN CODEX INLINE VISUALS -->'
END = '<!-- END CODEX INLINE VISUALS -->'
FILES = ('SKILL.md', 'RULE.md', 'assets/pele.html', 'scripts/find_visualize.py', 'scripts/install.py')


def atomic(path, data):
    # Resolve existing instruction/skill symlinks rather than breaking shared setups.
    path = path.resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = path.stat().st_mode & 0o777 if path.exists() else 0o644
    fd, temporary = tempfile.mkstemp(prefix='.inline-visuals-', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, mode)
        os.replace(temporary, path)
    finally:
        Path(temporary).unlink(missing_ok=True)


def install(home, codex_home):
    destination = home / '.agents/skills/codex-inline-visuals'
    rule = (ROOT / 'RULE.md').read_text().strip()
    # Prepare and validate instruction edits before making any changes.
    updates = []
    for path in dict.fromkeys((home / 'AGENTS.md', codex_home / 'AGENTS.md')):
        text = path.read_text() if path.exists() else ''
        if text.count(BEGIN) != text.count(END) or text.count(BEGIN) > 1:
            raise RuntimeError(f'Incomplete or duplicated managed block in {path}; left intact.')
        if BEGIN in text:
            start, finish = text.index(BEGIN), text.index(END) + len(END)
            if finish < start:
                raise RuntimeError(f'Reversed managed block in {path}; left intact.')
            text = text[:start] + rule + text[finish:]
        else:
            text = text.rstrip() + '\n\n' + rule + '\n'
        updates.append((path, text.encode()))
    contents = [(name, (ROOT / name).read_bytes()) for name in FILES]
    for name, data in contents:
        atomic(destination / name, data)
    # Both standard skill locations discover the same files; preserve existing entries.
    entry = codex_home / 'skills/codex-inline-visuals'
    if entry.resolve() != destination.resolve():
        for name, data in contents:
            atomic(entry / name, data)
    for path, data in updates:
        atomic(path, data)
    digest = hashlib.sha256((destination / 'SKILL.md').read_bytes()).hexdigest()[:12]
    print(f'Installed codex-inline-visuals ({digest}); global discovery hints updated.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--home', type=Path, default=Path.home())
    parser.add_argument('--codex-home', type=Path)
    args = parser.parse_args()
    home = args.home.expanduser().resolve()
    codex_home = args.codex_home or Path(os.environ.get('CODEX_HOME', str(home / '.codex'))).expanduser()
    install(home, codex_home)
