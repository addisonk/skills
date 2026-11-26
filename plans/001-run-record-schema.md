# Plan 001: Give disk-cleanup run records a versioned, validated schema

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3dc4d30..HEAD -- disk-cleanup/RUN-DETAILS.md disk-cleanup/scripts disk-cleanup/tests`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live files before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `3dc4d30`, 2026-11-14

## Why this matters

`disk-cleanup` is a Markdown skill that AI agents follow to reclaim disk space
on a developer Mac. Every run appends one JSON line to a private log (on the
author's machine, `~/.config/disk-cleanup/runs.jsonl`). The skill tells agents
to "compare against the preceding run" and to alert on growth, but it never
defines the record's fields. In the real log, the last five records use five
different key sets (`trigger` vs `trigger_type`, `status` missing in older
records, size categories under different names), so run-to-run deltas are
always null and growth alerts never fire. A fixed, versioned schema with a
validator is the foundation for the deterministic script in later plans
(002–006), which will write these records.

## Current state

- `disk-cleanup/SKILL.md` — 55-line entry point; step 5 says
  "Use the [record format](RUN-DETAILS.md#record)".
- `disk-cleanup/RUN-DETAILS.md:65-77` — the only description of the record:

  ```markdown
  ## Record

  Keep a private record with host, timestamp, exact paths, reasons, category sizes,
  removed and skipped counts, recovery receipts, and before-and-after volume and
  swap measurements. Compare against the preceding run when measurements match.
  Record bytes moved on the same volume separately from removals. Store metadata
  only. Exclude credentials, environment values, conversations, and log contents.
  ```

- `disk-cleanup/scripts/` and `disk-cleanup/tests/` do not exist yet.
- Repo convention for executable helpers: stdlib-only Python 3 under
  `<skill>/scripts/`, tests with `unittest` under `<skill>/tests/`, loading the
  script by path. Exemplar: `simulator-queue/tests/test_install.py:1-10`:

  ```python
  import importlib.util
  from pathlib import Path
  import tempfile
  import unittest

  SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/install.py'
  spec = importlib.util.spec_from_file_location('installer', SCRIPT)
  installer = importlib.util.module_from_spec(spec)
  spec.loader.exec_module(installer)
  ```

  Match this loading pattern, single quotes, and `unittest.TestCase` classes.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Tests (this skill) | `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` | `OK` |
| Tests (existing skill, regression) | `python3 -m unittest discover -s simulator-queue/tests` | `OK` |
| Byte-compile | `python3 -m py_compile disk-cleanup/scripts/record.py` | exit 0, no output |

There is no CI, linter, or package manager in this repo. Python 3.11+ is assumed
(`python3 --version`).

## Scope

**In scope** (the only files you should modify or create):
- `disk-cleanup/scripts/record.py` (create)
- `disk-cleanup/tests/test_record.py` (create)
- `disk-cleanup/RUN-DETAILS.md` — only the `## Record` section (lines 65–77)

**Out of scope**:
- Any other section of `RUN-DETAILS.md`, `SKILL.md`, `SETUP.md`, `WORKTREES.md`, `MACOS.md`.
- Any real machine file such as `~/.config/disk-cleanup/runs.jsonl` — never read
  or write it from tests.
- Migrating old records. Old lines stay as they are; the validator only governs
  new records (`schema_version` present).

## Git workflow

- Branch: `advisor/001-run-record-schema`
- One commit per step is fine. Message style matches `git log`: sentence-case
  imperative subject, no prefix, e.g. `Add a versioned disk-cleanup run record schema`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `disk-cleanup/scripts/record.py`

Stdlib only. Define:

```python
SCHEMA_VERSION = 1

# key -> (type or tuple of types, required)
FIELDS = {
    'schema_version': (int, True),
    'run_id': (str, True),            # uuid4 hex
    'started_utc': (str, True),       # ISO 8601 with offset, e.g. 2026-11-15T02:20:55+00:00
    'finished_utc': ((str, type(None)), True),  # None while running
    'status': (str, True),            # one of STATUSES
    'mode': (str, True),              # 'audit' | 'cleanup'
    'trigger': (str, True),           # 'launchd' | 'scheduled-agent' | 'manual'
    'host': (str, True),              # hostname only, never a username
    'volume': (str, True),            # e.g. /System/Volumes/Data
    'free_before_kib': (int, True),
    'free_after_kib': ((int, type(None)), True),
    'swap_used_before_mib': ((float, int, type(None)), True),
    'swap_used_after_mib': ((float, int, type(None)), True),
    'categories': (dict, True),       # name -> {'kib': int|None, 'count': int|None, 'reason': str|None}
    'removed': (list, True),          # list of item dicts, see ITEM_KEYS
    'retained': (list, True),         # list of item dicts with 'reason'
    'moved_not_freed_kib': (int, True),
    'alerts': (list, True),           # list of str
    'errors': (list, True),           # list of str
}
STATUSES = {'running', 'completed', 'partial', 'skipped-overlap', 'failed'}
ITEM_KEYS = {'path': str, 'kind': str, 'kib': (int, type(None)), 'reason': (str, type(None))}
# token-shaped patterns only; bare prefixes like 'sk-' would match ordinary paths such as 'task-'
FORBIDDEN_PATTERNS = (r'BEGIN [A-Z ]*PRIVATE KEY', r'AKIA[0-9A-Z]{16}', r'gh[pousr]_[A-Za-z0-9]{30,}',
                      r'sk-[A-Za-z0-9_-]{20,}', r'xox[abpr]-[A-Za-z0-9-]{10,}')
```

Functions:

- `new_record(*, mode, trigger, host, volume, free_before_kib, swap_used_before_mib) -> dict`
  returns a dict with every key in `FIELDS`, `status='running'`, empty
  lists/dicts, `moved_not_freed_kib=0`, `run_id=uuid.uuid4().hex`,
  `started_utc=datetime.now(timezone.utc).isoformat(timespec='seconds')`.
- `validate(record) -> list[str]` returns human-readable problems (empty list =
  valid). Check: unknown keys, missing required keys, types per `FIELDS`,
  `status in STATUSES`, `mode in {'audit','cleanup'}`, each item in
  `removed`/`retained` has exactly `ITEM_KEYS` with the right types, every
  `categories` value has exactly `kib`, `count`, `reason`, and no string value
  anywhere in the record (walk recursively) matches a `FORBIDDEN_PATTERNS`
  regex (`re.search`). `bool` must not pass as `int` (check `type(x) is bool` first).
- `append(path, record)` — calls `validate`; raises `ValueError` listing the
  problems if any; otherwise opens `path` with `os.open(path, O_WRONLY|O_CREAT|O_APPEND, 0o600)`
  and writes `json.dumps(record, sort_keys=True) + '\n'`. Create parent dir with
  mode `0o700` if missing.
- `last_record(path) -> dict | None` — returns the last line that parses as JSON
  **and** has `schema_version == SCHEMA_VERSION`; skips older free-form lines and
  blank/corrupt lines; returns `None` if the file is missing.
- `delta(prev, cur) -> dict` — `{'free_kib': cur.free_after - prev.free_after or None,
  'categories': {name: cur.kib - prev.kib}}` only for categories present with
  integer `kib` in both; missing values yield `None`, never an exception.

**Verify**: `python3 -m py_compile disk-cleanup/scripts/record.py` → exit 0.

### Step 2: Write `disk-cleanup/tests/test_record.py`

Load `record.py` with the importlib pattern above. Use `tempfile.TemporaryDirectory()`
for every file path. Tests (one method each):

1. `new_record(...)` output passes `validate` with zero problems.
2. Unknown key → one problem mentioning the key name.
3. Missing `status` → problem; `status='weird'` → problem.
4. `free_before_kib=True` (bool) → type problem.
5. Removed item missing `reason` key → problem.
6. An item path containing `'ghp_' + 'a' * 36` → problem; a path containing `task-sk-notes` (not token-shaped) → no problem.
7. `append` writes one line, file mode is `0o600` (`stat.S_IMODE(os.stat(p).st_mode) == 0o600`),
   and raises `ValueError` without writing for an invalid record.
8. `last_record` skips a trailing legacy line without `schema_version` and a
   corrupt line, returning the last valid v1 record; returns `None` for a missing file.
9. `delta` computes free-space and per-category differences and returns `None`
   for a category whose `kib` is `None` in either record.

**Verify**: `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` → `Ran 9 tests` (or more) and `OK`.

### Step 3: Replace the `## Record` section in `disk-cleanup/RUN-DETAILS.md`

Keep the heading `## Record` (other files link to `RUN-DETAILS.md#record`).
Keep the existing two paragraphs' rules (metadata only; moved-not-freed separate;
reclaimed bytes unknown when not isolated). Add, after the first paragraph:

```markdown
Write records with `scripts/record.py` (schema version 1). Each line in the
private log is one JSON object that passes `record.validate`. Required keys:
`schema_version`, `run_id`, `started_utc`, `finished_utc`, `status`
(`running`, `completed`, `partial`, `skipped-overlap`, `failed`), `mode`,
`trigger`, `host`, `volume`, `free_before_kib`, `free_after_kib`,
`swap_used_before_mib`, `swap_used_after_mib`, `categories`, `removed`,
`retained`, `moved_not_freed_kib`, `alerts`, `errors`. Compare runs with
`record.delta(record.last_record(log), current)`; older free-form lines are
ignored. An agent that cannot run Python writes the same keys by hand.
```

**Verify**: `grep -n '^## Record' disk-cleanup/RUN-DETAILS.md` → exactly one match;
`grep -c 'schema_version' disk-cleanup/RUN-DETAILS.md` → `1` or more.

## Test plan

Covered in Step 2 (9 cases: valid baseline, unknown key, bad status, bool-as-int,
bad item, secret-looking string, append permissions + rejection, legacy-line
skipping, delta with missing values). Structural pattern:
`simulator-queue/tests/test_install.py`.

## Done criteria

- [ ] `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` prints `OK` with ≥ 9 tests
- [ ] `python3 -m unittest discover -s simulator-queue/tests` still prints `OK`
- [ ] `python3 -c "import ast,sys; ast.parse(open('disk-cleanup/scripts/record.py').read())"` exits 0
- [ ] `grep -rn "import requests\|import yaml" disk-cleanup/scripts` returns nothing (stdlib only)
- [ ] `git status --porcelain` lists only the three in-scope paths and `plans/README.md`
- [ ] `plans/README.md` status row for 001 updated

## STOP conditions

- `RUN-DETAILS.md` no longer has a `## Record` heading, or it has moved to a different file.
- `disk-cleanup/scripts/` already exists with a different record writer — reconcile instead of duplicating; report.
- Any test would need to touch a path outside a temporary directory.

## Maintenance notes

- Plans 004–006 import `record.py`. Adding a field means bumping
  `SCHEMA_VERSION`, keeping `last_record` able to read the previous version, and
  updating the RUN-DETAILS key list in the same change.
- Reviewers: confirm no field can carry file contents, environment values, or a
  username (host is `socket.gethostname()` only).
- Deferred: a migration of legacy records. Not worth it; deltas restart from the
  first v1 record.
