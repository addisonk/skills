# Plan 003: Add a fake-home fixture that reproduces agent worktree states

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3dc4d30..HEAD -- disk-cleanup/tests`
> If files exist there that this plan does not expect (other than those from
> plans 001–002), compare before proceeding; on conflict, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-run-record-schema.md, plans/002-generated-file-classifier.md (test layout only)
- **Category**: tests
- **Planned at**: commit `3dc4d30`, 2026-11-14

## Why this matters

The cleanup rules in `disk-cleanup` decide whether an AI agent's leftover Git
worktree can be deleted. Today nothing can test those decisions: the only
evidence is live runs on one person's Mac. Plan 004 builds a script that
deletes worktrees; it must be developed test-first against a disposable
"home directory" that contains real Git worktrees and a fake T3 Code database
in every state that matters (finished, pinned, running, dirty, unmerged,
squash-merged, local files present). This plan builds only that fixture and
proves it works; no deletion code.

## Current state

- `disk-cleanup/tests/` contains `test_record.py` (plan 001) and
  `test_generated.py` (plan 002). No fixture exists.
- Real T3 Code storage layout (macOS):
  - Worktrees: `~/.t3/worktrees/<project>/<name>/` — each a Git linked worktree
    (contains a `.git` **file**, not a directory) of a primary repo elsewhere.
  - State DB: `~/.t3/userdata/statev2.sqlite`. The two tables the cleanup reads
    (verified schema, extra columns omitted are irrelevant):

    ```sql
    CREATE TABLE orchestration_v2_projection_threads (
      thread_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL,
      default_provider TEXT NOT NULL, runtime_mode TEXT NOT NULL,
      interaction_mode TEXT NOT NULL, active_provider_thread_id TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      archived_at TEXT, deleted_at TEXT, payload_json TEXT NOT NULL,
      provider_instance_id TEXT);
    CREATE TABLE orchestration_v2_projection_runs (
      run_id TEXT PRIMARY KEY, thread_id TEXT NOT NULL, ordinal INTEGER NOT NULL,
      provider TEXT NOT NULL, provider_thread_id TEXT, status TEXT NOT NULL,
      requested_at TEXT NOT NULL, completed_at TEXT, payload_json TEXT NOT NULL,
      provider_instance_id TEXT);
    ```

  - `payload_json` keys the cleanup uses: `worktreePath` (absolute),
    `branch`, `title`, `updatedAt`, `archivedAt`, `deletedAt`, `pinnedAt`,
    `settledOverride` (observed values: null or `"settled"`), `settledAt`,
    `unsettledAt`. Run `status` values observed: `completed`, `running`,
    `cancelled`, `failed`, `interrupted`.
  - Observed invariant: `settledOverride == "settled"` never coexists with
    `unsettledAt`; a re-opened thread has `unsettledAt` set and `settledAt` null.
- Test convention: stdlib `unittest`, everything under
  `tempfile.TemporaryDirectory()`; exemplar `simulator-queue/tests/test_install.py`.
- `git` 2.39+ is available on the developer Mac; tests may shell out to `git`.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Tests | `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` | `OK` |

## Scope

**In scope**:
- `disk-cleanup/tests/fakehome.py` (create) — fixture builder, importable by tests
- `disk-cleanup/tests/test_fakehome.py` (create) — proves the fixture

**Out of scope**:
- Any file under `disk-cleanup/scripts/` and any skill Markdown.
- Codex fixtures (Codex worktrees are report-only in plan 004).
- Network: the "remote" is a local bare repo.

## Git workflow

- Branch: `advisor/003-fake-home-test-fixture`
- Message style: `Add a fake home fixture for disk-cleanup tests`.
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Create `disk-cleanup/tests/fakehome.py`

Provide `class FakeHome` used as a context manager:

```python
with FakeHome() as h:
    h.home          # Path to temp home (resolved)
    h.repo          # primary repo at h.home/'Projects/app', origin = bare repo h.home/'remotes/app.git'
    h.db_path       # h.home/'.t3/userdata/statev2.sqlite'
    wt = h.add_worktree('t3-aaaa', state='finished')   # returns Path
```

Implementation details:
- `__enter__`: create temp dir; `git init --bare remotes/app.git`; `git init -b main Projects/app`;
  set local `user.name`/`user.email` (`git -C ... config user.email test@example.com`);
  commit a `package.json` and a `.gitignore` containing `node_modules/`, `.env*`,
  `dist/`, `.local/`; push `main` to origin; create the SQLite DB with the two
  `CREATE TABLE` statements above.
- Set `GIT_CONFIG_GLOBAL=/dev/null` and `GIT_CONFIG_NOSYSTEM=1` in the env for all
  git calls so the developer's global config cannot leak in.
- `add_worktree(name, state, project='app')` creates
  `h.home/'.t3/worktrees'/project/name` via `git -C repo worktree add -b t3/<name> <path> origin/main`,
  creates `node_modules/pkg/index.js` inside it, inserts one thread row whose
  `payload_json.worktreePath` is the worktree's resolved path, then applies the state:

  | state | What the fixture does |
  |---|---|
  | `finished` | thread `settledOverride="settled"`, `settledAt` set, `updatedAt` 3 days ago; one `completed` run |
  | `archived` | `archived_at` column and `archivedAt` set, not settled |
  | `deleted` | `deleted_at` column and `deletedAt` set |
  | `recent` | like `finished` but `updatedAt` = now |
  | `pinned` | finished + `pinnedAt` set |
  | `running` | finished + a run with `status='running'` |
  | `reopened` | `settledOverride` null, `settledAt` null, `unsettledAt` set |
  | `dirty` | finished + an uncommitted edit to `package.json` |
  | `untracked` | finished + new untracked file `notes.txt` |
  | `unmerged` | finished + a commit on the worktree branch that is not on origin/main and not pushed |
  | `squash-merged` | finished + a commit on the branch, pushed as `origin/t3/<name>`, and the same tree change committed separately on main and pushed (HEAD not an ancestor of origin/main) |
  | `local-files` | finished + ignored `.local/state.json` and `.env.local` |
  | `protected-build` | finished + ignored `dist/App.ipa` |
  | `no-owner` | worktree created but no thread row |
  | `shared` | two thread rows point to the same path: one finished, one `reopened` |

- Return the resolved `Path`. Expose `h.thread_id(name)` for assertions.
- `__exit__`: remove the temp dir (`TemporaryDirectory.cleanup()`).

**Verify**: `python3 -c "import sys; sys.path.insert(0,'disk-cleanup/tests'); import fakehome; print('ok')"` → `ok`.

### Step 2: Write `disk-cleanup/tests/test_fakehome.py`

Import with `sys.path.insert(0, str(Path(__file__).parent))` then `import fakehome`.
Tests:
1. Every state in the table builds without error inside one `FakeHome`.
2. `finished`: `git -C wt status --porcelain --untracked-files=all` is empty and
   `git -C wt merge-base --is-ancestor HEAD origin/main` exits 0.
3. `dirty` and `untracked`: status is non-empty.
4. `unmerged`: `merge-base --is-ancestor` exits 1.
5. `squash-merged`: `merge-base --is-ancestor HEAD origin/main` exits 1 **and**
   `git rev-parse origin/t3/<name>` equals `git rev-parse HEAD`.
6. `local-files`: `git status --porcelain --ignored=matching` lists `.local/` and `.env.local` with `!! `.
7. DB: `pinned` row's `json_extract(payload_json,'$.pinnedAt')` is not null;
   `running` has one run with status `running`; `shared` path has two rows.
8. `no-owner`: no thread row references its path.
9. All paths are inside `h.home`; after the `with` block, `h.home` no longer exists.

**Verify**: test command → `OK`, ≥ 9 new tests, and total runtime under 60 s
(`time python3 -m unittest ...`).

## Test plan

This plan is the test infrastructure; its own tests are Step 2.

## Done criteria

- [ ] `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` → `OK`
- [ ] `grep -rn "Users/\|/home/" disk-cleanup/tests/fakehome.py` → no hardcoded real-home paths
- [ ] `grep -n "GIT_CONFIG_GLOBAL" disk-cleanup/tests/fakehome.py` → at least one match
- [ ] `git status --porcelain` shows only the two in-scope files and `plans/README.md`
- [ ] `plans/README.md` row 003 updated

## STOP conditions

- `git worktree add` behaves differently from the table (e.g. refuses because of
  global hooks) even with the isolated git env — report the git version and error.
- The suite takes more than 120 s.
- You would need to read the real `~/.t3` to make a test pass.

## Maintenance notes

- When T3 changes its schema, update the `CREATE TABLE` text here first; plan
  004's tests then show what breaks.
- Add new states here before adding new eligibility rules to the script.
