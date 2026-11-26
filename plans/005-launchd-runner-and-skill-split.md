# Plan 005: Run routine cleanup from launchd and make the skill the judgment layer

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3dc4d30..HEAD -- disk-cleanup/SKILL.md disk-cleanup/SETUP.md disk-cleanup/scripts disk-cleanup/tests`
> Plan 004 must be merged (`python3 disk-cleanup/scripts/cleanup.py run --help` exits 0).
> If SKILL.md or SETUP.md differ from the excerpts below beyond plan 001–004 edits, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (installs a recurring job on the user's machine; must never duplicate or silently replace one)
- **Depends on**: plans/004-deterministic-cleanup-script.md
- **Category**: direction
- **Planned at**: commit `3dc4d30`, 2026-11-14

## Why this matters

Today the only recurring runner is an AI agent on a schedule (every 30
minutes), which spends tokens re-deriving the same facts and, in practice,
reclaimed almost nothing. Plan 004 adds `scripts/cleanup.py`, which does the
mechanical work deterministically. This plan (a) installs that script as a
macOS launchd job so routine cleanup costs zero tokens, and (b) rewrites the
skill's framing so the AI agent runs rarely (daily, or when the script raises
an alert) and handles only what the script cannot decide: checkouts retained
for local files, unmerged or ownerless checkouts, Codex worktrees, caches,
chats worth archiving, and partial/orphan directories.

## Current state

- `disk-cleanup/SKILL.md:8-13`:

  ```markdown
  For installation or schedule changes, follow [Setup](SETUP.md). For an audit or
  cleanup, follow the checklist below. Resolve references from this skill's folder.

  Use read-only mode for an audit. For authorized cleanup, remove eligible items
  at any free-space level. Use the alert threshold only when deciding whether
  to notify.
  ```

- `disk-cleanup/SETUP.md:29-31`:

  ```markdown
  Default recurring name: **Safe disk cleanup every 30 minutes**. Default cadence:
  every 30 minutes, only when recurring cleanup is authorized. Keep an existing
  cadence or notification policy unless the user requested a change.
  ```

- `disk-cleanup/SETUP.md:56-91` — "## 4. Install and connect the schedule":
  installs the skill with `npx skills add addisonk/skills --skill disk-cleanup --global`
  and gives a scheduled-agent prompt template (lines 77–84) that says
  "read the installed disk-cleanup SKILL.md and its required references".
- Plan 004's script: `python3 <skill>/scripts/cleanup.py run [--apply] [--trigger launchd]`,
  dry run by default, takes an `fcntl` lock at `~/.config/disk-cleanup/run.lock`,
  writes schema-v1 records to `~/.config/disk-cleanup/runs.jsonl`, prints a
  one-line JSON summary, exit 0 on completed/partial/skipped-overlap.
- Retained-reason values the script emits (from plan 004): `no-owner`,
  `run-active`, `pinned`, `unsettled`, `recent`, `dirty`, `no-main`,
  `unmerged`, `local-files`, `git-error`, `changed`, `process-cwd`,
  `process-check-failed`, `git-refused`, `budget`, `orphan-partial`.
- Real-machine hazards to design for:
  - `python3` on PATH is often a shim (pyenv, mise, asdf) that does not work
    under launchd's minimal environment. Resolve an absolute interpreter.
  - A machine may already have an unrelated or stale LaunchAgent whose label
    contains `disk-cleanup` (one real machine had one pointing at a deleted
    shell script). Never overwrite or unload it automatically.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Tests | `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` | `OK` |
| Plist lint (manual, macOS) | `plutil -lint <file>` | `<file>: OK` |

## Scope

**In scope**:
- `disk-cleanup/scripts/launchd.py` (create)
- `disk-cleanup/tests/test_launchd.py` (create)
- `disk-cleanup/SKILL.md` — add one section after line 13 (Step 3)
- `disk-cleanup/SETUP.md` — lines 29–31 and section 4 (Step 4)

**Out of scope**:
- Calling `launchctl` from tests, or loading anything on the developer's machine during the plan.
- Changing `cleanup.py` behaviour (file a follow-up instead).
- Any machine-specific path, label, or username in committed files.

## Git workflow

- Branch: `advisor/005-launchd-runner-and-skill-split`
- Message style: `Run routine disk cleanup from launchd`.
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Create `disk-cleanup/scripts/launchd.py`

Stdlib only (`plistlib`, `shutil`, `subprocess`, `argparse`).

```
python3 launchd.py install [--home PATH] [--interval 1800] [--label dev.skills.disk-cleanup]
                           [--python PATH] [--dry-run-only] [--load] [--replace]
python3 launchd.py status  [--home PATH] [--label ...]
python3 launchd.py uninstall [--home PATH] [--label ...] [--unload]
```

- `resolve_python(explicit)`: use `--python` if given; else `sys.executable`
  resolved with `os.path.realpath`; reject a path containing `/shims/` or
  `/.pyenv/shims` and fall back to `/usr/bin/python3` if it exists and runs
  `-c "import sqlite3"`; otherwise exit 2 with a message asking for `--python`.
- `build_plist(home, label, interval, python, script, apply) -> dict`:

  ```python
  {
    'Label': label,
    'ProgramArguments': [python, '-I', script, 'run', *(['--apply'] if apply else []), '--trigger', 'launchd'],
    'StartInterval': interval,
    'RunAtLoad': False,
    'ProcessType': 'Background',
    'LowPriorityIO': True,
    'Nice': 10,
    'StandardOutPath': f'{home}/.config/disk-cleanup/launchd.out.log',
    'StandardErrorPath': f'{home}/.config/disk-cleanup/launchd.err.log',
    'EnvironmentVariables': {'PATH': '/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin'},
  }
  ```

  `script` is the absolute realpath of the sibling `cleanup.py`.
- `install`: target `<home>/Library/LaunchAgents/<label>.plist`.
  1. Scan `<home>/Library/LaunchAgents/*.plist` for any other file whose `Label`
     contains `disk-cleanup`. If found: print each path and its
     `ProgramArguments[0]` (and whether that file exists), exit 3, change nothing.
     The user decides what to do with it.
  2. If the target exists and differs and `--replace` not given → exit 3 with a diff summary.
  3. Write with `plistlib.dump` to a temp file in the same dir, `os.replace` into place, mode `0o644`.
  4. Only with `--load`: `launchctl bootout gui/<uid>/<label>` (ignore "not found"),
     then `launchctl bootstrap gui/<uid> <plist>`; print the command output.
- `status`: print whether the plist exists, its interval and arguments, and
  (if `launchctl print gui/<uid>/<label>` succeeds) `runs` and `last exit code`.
- `uninstall`: `--unload` → `launchctl bootout`; then remove only `<label>.plist`.
- Wrap `launchctl` calls in a function `_launchctl(args)` so tests can monkeypatch it.

**Verify**: `python3 -m py_compile disk-cleanup/scripts/launchd.py` → exit 0.

### Step 2: Tests in `disk-cleanup/tests/test_launchd.py`

With a `tempfile.TemporaryDirectory()` home and `_launchctl` monkeypatched to record calls:
1. `install` writes a plist that `plistlib.load` parses, with `--apply` present and `StartInterval == 1800`.
2. `--dry-run-only` omits `--apply`.
3. Second `install` with identical settings is a no-op (exit 0, file unchanged mtime allowed to differ only if content same).
4. Different settings without `--replace` → exit 3, file unchanged.
5. A pre-existing `com.example.disk-cleanup.plist` with another label → exit 3, nothing written, message names that file.
6. `--load` calls `_launchctl` with `bootstrap`; without it, no calls.
7. `resolve_python('/x/.pyenv/shims/python3')` is rejected.
8. `uninstall` removes only its own plist and leaves the foreign one.

**Verify**: test command → `OK`.

### Step 3: Add "Script and agent roles" to `disk-cleanup/SKILL.md`

Insert after line 13 (after the paragraph ending "…deciding whether to notify."):

```markdown
## Script and agent roles

Routine cleanup runs from `scripts/cleanup.py`, usually every 30 minutes via
launchd ([Setup](SETUP.md)). It retires only registered T3 worktrees that pass
every check in [Worktrees](WORKTREES.md), inventories other roots read-only,
and writes one record per run.

When you run as an agent, start from the latest records instead of re-deriving
the inventory. Spend effort on what the script retained or flagged:
`local-files` (back up per Worktrees section 3, then retire),
`unmerged` and `no-owner` (report the owner and next step), `orphan-partial`
(report), `budget` (let the next script run continue), large retained chat
checkouts, Codex and Claude Code worktrees, caches, and recurring growth. If
the script is not installed, follow the checklist below in full.
```

**Verify**: `grep -c '^## Script and agent roles' disk-cleanup/SKILL.md` → `1`;
`wc -l < disk-cleanup/SKILL.md` → under 80.

### Step 4: Update `disk-cleanup/SETUP.md`

1. Replace lines 29–31 with:

   ```markdown
   Default recurring setup: the launchd job **Safe disk cleanup every 30 minutes**
   (`scripts/launchd.py install`) plus one agent review, daily or when a record
   contains alerts. Keep an existing cadence or notification policy unless the
   user requested a change.
   ```

2. In "## 4. Install and connect the schedule", after the `npx skills add` block,
   add:

   ~~~markdown
   Install the routine runner on each Mac. First run a dry run and read its record:

   ```sh
   python3 ~/.agents/skills/disk-cleanup/scripts/cleanup.py run
   python3 ~/.agents/skills/disk-cleanup/scripts/launchd.py install --load
   ```

   Adjust the path to wherever the skill is installed. `install` refuses when
   another LaunchAgent label contains `disk-cleanup`; report that job to the user
   and let them decide. Use `--python` when the default interpreter is a shim.
   ~~~

3. In the scheduled-agent prompt template (lines 77–84), change
   "read the installed disk-cleanup SKILL.md and its required references" to
   "read the installed disk-cleanup SKILL.md and every reference file it links to,
   then start from the latest records written by `scripts/cleanup.py`".

**Verify**: `grep -c 'launchd.py install' disk-cleanup/SETUP.md` → `1` or more;
`grep -c 'every reference file it links to' disk-cleanup/SETUP.md` → `1`.

## Test plan

Step 2 (8 cases). Pattern: `simulator-queue/tests/test_install.py` (temp home,
idempotent install, symlink/foreign file preserved).

## Done criteria

- [ ] `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` → `OK`
- [ ] `grep -rn -e "$(id -un)" -e "/Users/" disk-cleanup/` → no matches
- [ ] `grep -n "launchctl" disk-cleanup/tests/test_launchd.py` → appears only in monkeypatch assertions, never executed
- [ ] `git status --porcelain` shows only in-scope paths and `plans/README.md`
- [ ] `plans/README.md` row 005 updated

## STOP conditions

- Plan 004's CLI flags differ from "Current state".
- You would need to run `launchctl` against the real user domain to make a test pass.
- SKILL.md would exceed ~80 lines; report instead of trimming other sections.

## Maintenance notes

- The installed skill path differs per machine; the plist stores the realpath
  of `cleanup.py` at install time. Re-run `install --replace` after moving or
  updating the skill install.
- Reviewers: confirm `install` can never overwrite or unload a plist it did not create.
- Deferred: notifications from the launchd run. For now alerts live in the
  record and the daily agent review surfaces them.
