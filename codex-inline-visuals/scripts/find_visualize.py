#!/usr/bin/env python3
"""Locate the current locally installed Codex Visualize contract."""
import os
from pathlib import Path
import re
import sys


def find():
    home = Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex'))).expanduser()
    candidates = list((home / 'plugins/cache/openai-bundled/visualize').glob('*/skills/visualize/SKILL.md'))
    # Prefer the newest numeric package version, not lexicographic 1.0.9 > 1.0.10.
    def version(path):
        return tuple(int(part) for part in re.findall(r'\d+', path.parents[2].name))
    if candidates:
        return max(candidates, key=version)
    for path in (home / 'skills/visualize/SKILL.md', Path.home() / '.agents/skills/visualize/SKILL.md'):
        if path.is_file():
            return path
    raise FileNotFoundError('No bundled or globally installed Visualize SKILL.md found in this Codex home.')


if __name__ == '__main__':
    try:
        print(find())
    except FileNotFoundError as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
