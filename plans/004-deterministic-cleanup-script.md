# Plan 004: Add a deterministic cleanup script that retires finished T3 worktrees safely

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3dc4d30..HEAD -- disk-cleanup/WORKTREES.md disk-cleanup/scripts disk-cleanup/tests`
> Plans 001–003 must already be merged (`ls disk-cleanup/scripts/record.py disk-cleanup/scripts/generated.py disk-cleanup/tests/fakehome.py`).
> If WORKTREES.md sections 1–4 differ from the excerpts below, STOP.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH (this code deletes directories; every gate below is mandatory)
- **Depends on**: plans/001-run-record-schema.md, plans/002-generated-file-classifier.md, plans/003-fake-home-test-fixture.md
- **Category**: direction
- **Planned at**: commit `3dc4d30`, 2026-11-14

## Why this matters

On the author's Mac, six scheduled runs of the Markdown-only `disk-cleanup`
skill reclaimed about 0.3 GiB in total: every run re-derived the whole
inventory, hit its time bound, and retained everything. A one-off set of
prototype scripts applying the same rules freed about 65 GiB in one afternoon
by retiring ~130 finished T3 Code worktrees. The prototypes also had real
safety holes found in review: ownership and process data captured once and
reused for 20+ minutes (time-of-check/time-of-use), a timeout that could kill
`git worktree remove` mid-deletion, results written only at the end, and no
lock against overlapping runs. This plan turns the rules in `WORKTREES.md` into
one tested, dry-run-by-default script so routine cleanup needs no AI tokens.
Scope is T3 worktrees plus a read-only inventory; other tools come in plan 006.

## Current state

- `disk-cleanup/WORKTREES.md` — the rules this script must implement. Key
  excerpts (lines 47–54, 85–96):

  ```markdown
  Validate user ownership, real paths without symlink traversal, and Git
  registration. Retain checkouts with submodules, embedded repositories, ambiguous
  registration, tracked changes, or untracked files. Require HEAD to be reachable
  from a verified main branch and all checkout commits safely recoverable from a
  retained repository/remote. Preserve unpushed commits; uncertainty about merge or
  remote recovery blocks removal. Preserve branches even when merged.
  ...
  Immediately before removal, refresh all thread/run/attachment state, HEAD, Git
  status, ignored-file inventory, processes/open files, and backup verification.
  Require these to match the approved candidate. If anything changes, retain it.

  Use the supported app lifecycle operation. For an eligible registered Git linked
  worktree where standard retirement is supported, use `git worktree remove` on its
  exact path **without `--force`**. Keep branch refs intact. Never use `git clean`,
  manual app-database edits, or arbitrary folder removal to bypass a refusal.
  ```

- T3 ownership rule (WORKTREES.md section 1, T3 bullet): every thread whose
  `payload_json.worktreePath` resolves to the checkout must be settled,
  archived or deleted; none pinned; no run with `status='running'`.
  **Exact "finished" definition for this script** (verified against real data:
  `settledOverride` is only ever null or `"settled"`):
  `deleted_at or deletedAt or archived_at or archivedAt or (settledOverride == "settled" and not unsettledAt)`.
  Any other combination, including an unknown `settledOverride` value, is not finished.
- Available modules from earlier plans:
  - `disk-cleanup/scripts/record.py`: `new_record`, `validate`, `append`, `last_record`, `delta`.
  - `disk-cleanup/scripts/generated.py`: `classify_all(entries, root, extra_generated)` → buckets `generated`/`protected`/`unknown`.
  - `disk-cleanup/tests/fakehome.py`: `FakeHome` with states `finished, archived, deleted, recent, pinned, running, reopened, dirty, untracked, unmerged, squash-merged, local-files, protected-build, no-owner, shared`.
- Measured behaviour: `git worktree remove` (without `--force`) deletes ignored
  files such as `node_modules` and refuses on tracked or untracked changes. A
  removal with a large `node_modules` takes ~20 s; never put a timeout on it.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Tests | `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` | `OK` |
| Dry run against fake home (manual check) | `python3 disk-cleanup/scripts/cleanup.py run --home /tmp/x --config /dev/null` | exit 0, JSON summary on stdout |

## Scope

**In scope**:
- `disk-cleanup/scripts/cleanup.py` (create)
- `disk-cleanup/tests/test_cleanup.py` (create)
- `disk-cleanup/WORKTREES.md` — append one short paragraph to section 4 (Step 6)

**Out of scope**:
- Deleting anything other than registered T3 linked worktrees (no caches, no
  Codex, no Claude Code worktrees, no recovery folders, no pnpm store). Those
  are inventoried read-only.
- Backing up `unknown` ignored files. A checkout with any `unknown` or
  `protected` ignored entry is **retained** with reason `local-files`; the AI
  skill handles backups.
- launchd installation (plan 005) and the multi-tool registry (plan 006).
- Writing to the T3 database, or calling any T3 API.

## Git workflow

- Branch: `advisor/004-deterministic-cleanup-script`
- Commit after each green step; message style `Add a dry-run-first disk cleanup script`.
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: CLI skeleton, config, and lock

Create `disk-cleanup/scripts/cleanup.py` (stdlib only; import siblings with
`sys.path.insert(0, str(Path(__file__).resolve().parent))`).

```
python3 cleanup.py run [--apply] [--home PATH] [--config PATH]
                       [--max-seconds N] [--trigger manual|launchd|scheduled-agent]
```

- Default is **dry run**: compute everything, remove nothing, still write a record with `mode='audit'`.
- `--home` defaults to `Path.home()`; every path below is relative to it (tests pass the fake home).
- Config: JSON at `--config` or `<home>/.config/disk-cleanup/config.json`; missing file or `/dev/null` → defaults:

  ```json
  {"t3_worktrees": ".t3/worktrees", "t3_db": ".t3/userdata/statev2.sqlite",
   "record_path": ".config/disk-cleanup/runs.jsonl", "volume": "/System/Volumes/Data",
   "recent_hours": 24, "extra_generated": [], "allow_remote_branch_recovery": false,
   "max_seconds": 1500}
  ```

  Unknown config keys → exit 2 with a message (typos must not silently weaken gates).
- Lock: open `<home>/.config/disk-cleanup/run.lock` (create dir 0o700) and take
  `fcntl.flock(fd, LOCK_EX | LOCK_NB)`. If held: write a record with
  `status='skipped-overlap'` and exit 0. Hold the lock for the whole run.

**Verify**: a test that holds the lock in-process and runs `main(['run','--home',h])`
gets a `skipped-overlap` record. Tests → `OK`.

### Step 2: Candidate discovery and ownership (read-only)

- Enumerate `<home>/<t3_worktrees>/*/*` directories. Skip symlinks.
- Open the DB read-only: `sqlite3.connect(f'file:{db}?mode=ro', uri=True)`.
  Build `owners[realpath] = [thread payloads + row archived_at/deleted_at]` and
  `running = {thread_id with a run status='running'}`.
- Function `owner_status(rows, running, now, recent_hours) -> (ok: bool, reason: str)`:
  no rows → `(False,'no-owner')`; any running → `'run-active'`; any pinned →
  `'pinned'`; any not finished (definition above) → `'unsettled'`; any
  `updatedAt` within `recent_hours` → `'recent'`; else `(True,'')`.
- Re-open the DB **per candidate** inside `owner_status` callers (Step 4), not once per run.

**Verify**: unit tests for `owner_status` covering finished/archived/deleted (ok),
recent, pinned, running, reopened, shared, no-owner. Tests → `OK`.

### Step 3: Git eligibility (read-only)

Function `git_check(path, allow_remote) -> dict` returning `{'ok', 'reason', 'head', 'branch', 'primary', 'ignored'}`:
1. `os.stat(path).st_uid == os.getuid()`, path is a real directory, `<path>/.git` is a **file**.
2. No `<path>/.gitmodules`.
3. `git -C path rev-parse --path-format=absolute --git-common-dir` → `primary = dirname(common)`;
   path appears in `git -C primary worktree list --porcelain` (compare realpaths).
4. `git -C path status --porcelain=v1 --untracked-files=all` must be empty → else `'dirty'`.
5. Main ref: first of `origin/main`, `origin/master` that verifies; none → `'no-main'`.
   `git merge-base --is-ancestor HEAD <main>` exit 0 → ok. Otherwise, if
   `allow_remote` and `branch` is set and `git rev-parse origin/<branch>` equals
   HEAD → ok with reason `'pushed-branch'`; else `'unmerged'`.
6. Ignored entries from `git status --porcelain=v1 --ignored=matching --untracked-files=normal`
   (lines starting `!! `) → `generated.classify_all(..., root=path, extra_generated=cfg)`.
   Any `protected` or `unknown` → `'local-files'`.
7. Any git command non-zero (other than the expected 1 from merge-base) → `'git-error'`.
All git calls use `subprocess.run([...], capture_output=True, text=True, timeout=180)`
**except** `worktree remove` (Step 4), which has no timeout.

**Verify**: tests on FakeHome states: finished → ok; dirty/untracked → dirty;
unmerged → unmerged; squash-merged → unmerged with allow false, ok with allow true;
local-files and protected-build → local-files. Tests → `OK`.

### Step 4: Per-candidate recheck and removal (only with `--apply`)

Process candidates **one at a time** in sorted path order:
1. If `time.monotonic() - start > max_seconds`: stop starting new removals; record
   remaining candidates as retained with reason `'budget'`. Never interrupt a removal in progress.
2. Fresh owner check (re-open DB) and fresh `git_check`. HEAD must equal the
   HEAD seen at discovery, otherwise `'changed'`.
3. Process check: do not use `lsof +D <path>` (far too slow on `node_modules`). Run
   `lsof -n -w -d cwd -Fn` once per candidate (fast) and retain with `'process-cwd'`
   if any `n` line equals the path or starts with `path + '/'`. If `lsof` exits
   non-zero with no output → retain `'process-check-failed'`.
4. `git -C primary worktree remove <path>` (no `--force`, **no timeout**).
   Non-zero → retain with `'git-refused'` + first stderr line.
5. Verify: path no longer exists; `git -C primary worktree list --porcelain` no longer lists it;
   if `branch`, `git -C primary rev-parse --verify refs/heads/<branch>` still succeeds.
   Record item `{'path','kind':'t3-worktree','kib','reason':None}` in `removed`.
   `kib` comes from a `du -sk` taken at discovery (may be `None` if it failed); it is apparent size.
6. **Append progress after every candidate**: rewrite nothing; keep the in-memory record and
   at the end call `record.append`. Additionally write `<record_path>.progress` (one JSON line per
   candidate outcome, mode 0o600) so a killed run leaves evidence. Delete the progress file after
   the final record is appended.
7. Orphan detection (report only): any directory under the T3 root that has no `.git` file
   but is non-empty → item in `retained` with reason `'orphan-partial'` and an alert string.
   Never delete it.

**Verify**: with `--apply` on a FakeHome containing every state: only `finished`,
`archived`, `deleted` worktrees are gone; all others exist; branches `t3/<name>`
still exist for removed ones. A test where the thread becomes pinned between
discovery and removal (monkeypatch a hook `_before_remove(path)` that updates the
DB) → that worktree retained with `'pinned'`. Tests → `OK`.

### Step 5: Read-only inventory and final record

- Measure `free_before_kib`/`free_after_kib` with `os.statvfs(volume)` (`f_bavail * f_frsize // 1024`);
  in tests pass `--config` with `"volume"` set to the temp dir.
- Swap: parse `sysctl -n vm.swapusage` (`used = 1234.56M`) → float MiB; on failure `None`.
- Categories (`du -sk` each, `timeout=300`, failures → `kib: None` with reason):
  `t3-worktrees`, `t3-scratch` (`.t3/scratch`), `t3-recovery` (`.t3/worktree-recovery`),
  `codex-worktrees` (`.codex/worktrees`), `codex-workspaces` (`.codex-workspaces/worktrees`),
  `codex-recovery` (`.codex/worktree-recovery`). Missing dir → `kib: None, reason: 'absent'`.
- Status: `completed` if no errors and no `budget` retentions, else `partial`.
- Print a one-line JSON summary to stdout: `{"status","removed","retained","free_delta_kib"}`.
- Exit code 0 on completed/partial/skipped-overlap, 1 on failed.

**Verify**: the record written in the apply test passes `record.validate`; a
second run's `record.delta(record.last_record(p), cur)` returns numbers. Tests → `OK`.

### Step 6: Document the script in WORKTREES.md section 4

Append to the end of `## 4. Recheck, remove, verify`:

```markdown
`scripts/cleanup.py run --apply` implements sections 1–4 for registered T3
worktrees. It rechecks ownership, Git state and process cwd immediately before
each removal, never times out a removal, retains any checkout with protected or
unknown ignored files, and writes a schema-v1 record. Without `--apply` it is a
dry run. Codex, Claude Code, caches and recovery folders stay report-only.
```

**Verify**: `grep -c 'scripts/cleanup.py' disk-cleanup/WORKTREES.md` → `1`.

## Test plan

`disk-cleanup/tests/test_cleanup.py`, built on `fakehome.FakeHome`, pattern
`simulator-queue/tests/test_install.py`. Required cases: lock overlap; each
owner state; each git state; squash-merged with both config values; apply run
removes exactly finished/archived/deleted; recheck catches a pin added after
discovery; budget of 0 seconds removes nothing and marks `budget`; orphan
partial directory reported not deleted; dry run removes nothing; record validates;
unknown config key exits 2. Expect ≥ 15 tests, suite < 120 s.

## Done criteria

- [ ] `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` → `OK`
- [ ] `grep -n -e "--force" -e "'-f'" disk-cleanup/scripts/cleanup.py` → no matches
- [ ] `grep -n "rmtree\|os.remove\|unlink\|git clean" disk-cleanup/scripts/cleanup.py` → only the lock/progress-file cleanup (`os.remove(progress)`), nothing else
- [ ] `grep -n "worktree\", \"remove\"\|'worktree', 'remove'" disk-cleanup/scripts/cleanup.py` → exactly one call site, without `timeout=`
- [ ] Dry run is the default: `python3 disk-cleanup/scripts/cleanup.py run --help` shows `--apply` as optional
- [ ] `git status --porcelain` shows only the three in-scope paths and `plans/README.md`
- [ ] `plans/README.md` row 004 updated

## STOP conditions

- Plans 001–003 are not merged or their APIs differ from "Current state".
- `git worktree remove` without `--force` deletes a worktree that has untracked
  files in the fixture (would mean git behaves differently than assumed).
- Any test needs the real home directory, the real T3 database, or network.
- You are tempted to add `--force`, `shutil.rmtree`, a removal timeout, or a write to the T3 DB to make a test pass.

## Maintenance notes

- Plan 005 runs this from launchd; plan 006 replaces the hardcoded inventory
  categories with a registry. Keep `owner_status` and `git_check` pure enough to reuse.
- `allow_remote_branch_recovery` changes policy (squash-merged branches become
  removable when the remote branch holds HEAD). It defaults to false; turning it
  on is the machine owner's decision, recorded in private config.
- Reviewers: read every early-`continue` path and confirm it records a reason;
  confirm the recheck uses fresh DB/git/lsof data, not discovery-time values.
