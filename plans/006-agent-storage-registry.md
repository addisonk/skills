# Plan 006: Replace the prose root list with a declarative agent-storage registry

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3dc4d30..HEAD -- disk-cleanup/RUN-DETAILS.md disk-cleanup/MACOS.md disk-cleanup/scripts disk-cleanup/tests`
> Plan 004 must be merged. If `RUN-DETAILS.md` lines 27–37 differ from the excerpt below, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (a wrong `action` on an entry could delete app data; every new entry defaults to `report`)
- **Depends on**: plans/004-deterministic-cleanup-script.md (plan 005 optional)
- **Category**: direction
- **Planned at**: commit `3dc4d30`, 2026-11-14

## Why this matters

AI coding tools each leave their own storage behind: T3 Code, Codex, Claude
Code, Claude Desktop, Cursor, VS Code, Windsurf, Antigravity, Zed, Conductor.
The skill lists four of them in prose, and agents spent weeks rediscovering
the rest. Measured on one Mac: Codex ~38 GiB, Claude Code ~13.5 GiB, Cursor
~12 GiB (10 GiB under `User`), Claude Desktop ~10.8 GiB (9.3 GiB
`vm_bundles`), plus a 1.5 GiB `node-compile-cache` in the per-user temp
directory. A single JSON registry, read by the script and the agent, makes
coverage explicit and reviewable, keeps everything `report`-only by default,
and allows exactly one verified cache to be age-pruned per child directory
(fixing the rule where a whole cache directory never qualifies because some
file in it was touched this week).

## Current state

- `disk-cleanup/RUN-DETAILS.md:27-37`:

  ```markdown
  Common checkout roots to investigate when those tools are installed:
  - T3: `~/.t3/worktrees/*/*` and `~/.t3/scratch/*`
  - Codex: `~/.codex/worktrees/*/*` and `~/.codex-workspaces/worktrees/*/*`
  - Claude Code subagents: `<repo>/.claude/worktrees/agent-*` for every primary
    repository (discover with `find <projects root> -maxdepth 3 -path
    '*/.claude/worktrees'`)
  - Conductor: discover its configured workspace root (often `~/conductor/workspaces`).
  - Recovery: `~/.t3/worktree-recovery/*` and `~/.codex/worktree-recovery/*`

  A configured root that exists but measures as absent is a discovery failure;
  report it as an actionable failure.
  ```

- `disk-cleanup/RUN-DETAILS.md:110` (standalone caches rule):
  "Verified regenerable, inactive, and newest contained file older than seven
  days. A directory mtime alone is insufficient. Use narrow subdirectories."
- `disk-cleanup/scripts/cleanup.py` (plan 004) — Step 5 measures a hardcoded
  list of six categories (`t3-worktrees`, `t3-scratch`, `t3-recovery`,
  `codex-worktrees`, `codex-workspaces`, `codex-recovery`) with `du -sk`.
  Its done criteria forbid `rmtree` in `cleanup.py`; keep it that way.
- On macOS the per-user temp directory is `getconf DARWIN_USER_TEMP_DIR`
  (e.g. `/var/folders/xx/.../T/`). `node-compile-cache/` there contains one
  child per Node version (`v24.22.0-arm64-<hash>-<uid>`), regenerated on demand by Node.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Tests | `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` | `OK` |
| Registry is valid JSON | `python3 -m json.tool disk-cleanup/storage-registry.json > /dev/null` | exit 0 |

## Scope

**In scope**:
- `disk-cleanup/storage-registry.json` (create)
- `disk-cleanup/scripts/registry.py` (create) — load, validate, expand, measure
- `disk-cleanup/scripts/cache_prune.py` (create) — the only module allowed to delete a cache child
- `disk-cleanup/scripts/cleanup.py` — replace the hardcoded category list with the registry; call `cache_prune` only under `--apply`
- `disk-cleanup/tests/test_registry.py`, `disk-cleanup/tests/test_cache_prune.py` (create)
- `disk-cleanup/RUN-DETAILS.md` — lines 27–34 only

**Out of scope**:
- Making any entry other than `node-compile-cache` prunable. All others stay `report`.
- Conversation/history stores (`~/.codex/sessions`, `~/.claude/projects`):
  `kind: history`, `protected: true`, report only — the skill's hard protections forbid removal.
- Deleting simulator runtime assets (need admin rights; report only).
- MACOS.md wording beyond what Step 5 says.

## Git workflow

- Branch: `advisor/006-agent-storage-registry`
- Message style: `Track agent and IDE storage in a registry`.
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Create `disk-cleanup/storage-registry.json`

Shape: `{"version": 1, "entries": [ ... ]}`. Each entry:

```json
{"id": "t3-worktrees", "tool": "T3 Code", "path": "~/.t3/worktrees/*/*",
 "kind": "checkout", "action": "retire-t3", "protected": false,
 "notes": "Retired by cleanup.py per WORKTREES.md."}
```

Allowed values — `kind`: `checkout`, `recovery`, `cache`, `history`, `app-data`,
`store`, `installed`, `system-asset`, `unknown`. `action`: `report`,
`retire-t3`, `age-prune-children`. Path tokens: leading `~`, `$TMPDIR`
(macOS user temp dir), `{projects}` (each configured projects root). Globs allowed.

Include exactly these entries (all `action: "report"` unless stated):

| id | tool | path | kind | protected | action |
|---|---|---|---|---|---|
| t3-worktrees | T3 Code | `~/.t3/worktrees/*/*` | checkout | false | retire-t3 |
| t3-scratch | T3 Code | `~/.t3/scratch/*` | checkout | false | report |
| t3-recovery | T3 Code | `~/.t3/worktree-recovery/*` | recovery | true | report |
| codex-worktrees | Codex | `~/.codex/worktrees/*/*` | checkout | false | report |
| codex-workspaces | Codex | `~/.codex-workspaces/worktrees/*/*` | checkout | false | report |
| codex-recovery | Codex | `~/.codex/worktree-recovery/*` | recovery | true | report |
| codex-sessions | Codex | `~/.codex/sessions` | history | true | report |
| claude-subagent-worktrees | Claude Code | `{projects}/*/.claude/worktrees/agent-*` | checkout | false | report |
| claude-projects | Claude Code | `~/.claude/projects` | history | true | report |
| claude-jobs | Claude Code | `~/.claude/jobs` | unknown | true | report |
| claude-plugins | Claude Code | `~/.claude/plugins` | installed | true | report |
| claude-cli-cache | Claude Code | `~/Library/Caches/claude-cli-nodejs` | cache | false | report |
| claude-desktop-vm-bundles | Claude Desktop | `~/Library/Application Support/Claude/vm_bundles` | unknown | true | report |
| cursor-user | Cursor | `~/Library/Application Support/Cursor/User` | app-data | true | report |
| cursor-snapshots | Cursor | `~/Library/Application Support/Cursor/snapshots` | unknown | true | report |
| cursor-home | Cursor | `~/.cursor` | installed | true | report |
| vscode-app | VS Code | `~/Library/Application Support/Code` | app-data | true | report |
| vscode-extensions | VS Code | `~/.vscode` | installed | true | report |
| windsurf-app | Windsurf | `~/Library/Application Support/Windsurf` | app-data | true | report |
| windsurf-home | Windsurf | `~/.windsurf` | installed | true | report |
| codeium-home | Windsurf | `~/.codeium` | unknown | true | report |
| antigravity-app | Antigravity | `~/Library/Application Support/Antigravity` | app-data | true | report |
| antigravity-home | Antigravity | `~/.antigravity` | unknown | true | report |
| gemini-home | Antigravity / Gemini CLI | `~/.gemini` | unknown | true | report |
| zed-app | Zed | `~/Library/Application Support/Zed` | app-data | true | report |
| conductor-workspaces | Conductor | `~/conductor/workspaces/*` | checkout | false | report |
| pnpm-store | pnpm | `~/Library/pnpm/store` | store | true | report |
| xcode-derived-data | Xcode | `~/Library/Developer/Xcode/DerivedData` | cache | false | report |
| playwright-browsers | Playwright | `~/Library/Caches/ms-playwright` | installed | true | report |
| node-compile-cache | Node.js | `$TMPDIR/node-compile-cache` | cache | false | age-prune-children |
| simulator-runtime-assets | Xcode | `/System/Library/AssetsV2/com_apple_MobileAsset_*SimulatorRuntime/*.asset` | system-asset | true | report |

Codex worktrees are `<name>/<repo>`; a `<name>` folder holding only a `.codex-worktree-name` marker is a leftover worth reporting. Give each a one-sentence `notes` value (what it is; why report-only). For
Antigravity, Windsurf and Gemini entries add "path unverified; confirm on a
machine where the tool is installed".

**Verify**: `python3 -m json.tool disk-cleanup/storage-registry.json > /dev/null` → exit 0;
`python3 -c "import json;d=json.load(open('disk-cleanup/storage-registry.json'));print(len(d['entries']))"` → `31`.

### Step 2: Create `disk-cleanup/scripts/registry.py`

- `load(path=None) -> list[dict]` (default: sibling `../storage-registry.json`).
- `validate(entries) -> list[str]`: unique `id`; allowed `kind`/`action`;
  `age-prune-children` only with `kind == 'cache'` and `protected == false`;
  `retire-t3` only on id `t3-worktrees`; any entry with `protected: true` must
  have `action == 'report'`. Return problems; `load` raises `ValueError` if any.
- `expand(entry, home, tmpdir, projects_roots) -> list[Path]`: replace tokens,
  `glob.glob`, drop symlinks, return sorted real paths. `{projects}` with an
  empty roots list → `[]`.
- `measure(paths, timeout=300) -> (kib|None, count, reason|None)` via `du -sk`;
  absent → `(None, 0, 'absent')`; timeout → `(None, n, 'timeout')`.
- `tmpdir()`: `getconf DARWIN_USER_TEMP_DIR` output, falling back to `tempfile.gettempdir()`.

**Verify**: `python3 -m py_compile disk-cleanup/scripts/registry.py` → exit 0.

### Step 3: Create `disk-cleanup/scripts/cache_prune.py`

`prune_children(root, older_than_days=7, apply=False, now=None) -> list[dict]`:
for each immediate child of `root` (directories only, no symlinks, owned by
`os.getuid()`): walk with `os.walk(followlinks=False)`; if any symlink or
non-regular file → skip `'special-file'`; compute newest `st_mtime` of any
file (an empty child uses the child's own mtime); if newer than the cutoff →
skip `'recent'`. Otherwise (and only if `apply`) re-stat the newest file
immediately before deleting (still older than the cutoff) and
`shutil.rmtree(child)`. Return one dict per child:
`{'path','kib','action':'removed'|'retained','reason'}`. Never delete `root` itself.

**Verify**: compile → exit 0.

### Step 4: Wire into `cleanup.py`

- Config gains `"projects_roots": ["Projects"]` (relative to home; list). Update
  the unknown-key check accordingly.
- Replace the hardcoded six categories with: for every registry entry,
  `categories[entry.id] = measure(expand(...))`.
- After T3 retirement, for entries with `action == 'age-prune-children'`, call
  `cache_prune.prune_children(path, apply=args.apply)`; add removed children to
  `record['removed']` with `kind='cache-child'`, retained ones are not listed
  (avoid noise) unless reason is `special-file`.
- Add an alert string when an entry with `kind == 'unknown'` measures ≥ 5 GiB:
  `"<id> is <n> GiB and unclassified; review"`.

**Verify**: existing plan-004 tests still pass; test command → `OK`.

### Step 5: Point RUN-DETAILS.md at the registry

Replace lines 27–34 (the "Common checkout roots…" list through the Recovery
bullet) with:

```markdown
Known agent, IDE and package-manager storage is listed in
[storage-registry.json](storage-registry.json), with each entry's kind,
whether it is protected, and the only automatic action allowed. Entries are
report-only unless marked otherwise. Add a tool by adding an entry with
`action: "report"`; making anything removable needs its own reviewed change.
Claude Code subagent worktrees live under each repository's
`.claude/worktrees/agent-*`; configure the projects roots in machine config.
```

Keep lines 36–37 ("A configured root that exists but measures as absent…").

**Verify**: `grep -c 'storage-registry.json' disk-cleanup/RUN-DETAILS.md` → `1`;
`grep -c '~/.t3/worktrees' disk-cleanup/RUN-DETAILS.md` → `0`.

## Test plan

- `test_registry.py`: real registry loads with zero problems and 31 entries;
  validation rejects duplicate ids, `protected:true` + non-report action,
  `age-prune-children` on a non-cache; `expand` handles `~`, `$TMPDIR`,
  `{projects}` (with and without roots), skips symlinks; `measure` reports `absent`.
- `test_cache_prune.py` (temp dirs, set mtimes with `os.utime`): old child
  removed only with `apply=True`; child with one recent file retained `recent`;
  child containing a symlink retained `special-file`; root never removed;
  dry run removes nothing.
- Pattern: `simulator-queue/tests/test_install.py`.

## Done criteria

- [ ] `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` → `OK`
- [ ] `grep -n "rmtree" disk-cleanup/scripts/*.py` → only in `cache_prune.py`
- [ ] `python3 -c "import json;e=json.load(open('disk-cleanup/storage-registry.json'))['entries'];print(sorted({x['action'] for x in e}))"` → `['age-prune-children', 'report', 'retire-t3']`
- [ ] `grep -rn -e "$(id -un)" -e "/Users/" disk-cleanup/` → no matches
- [ ] `git status --porcelain` shows only in-scope paths and `plans/README.md`
- [ ] `plans/README.md` row 006 updated

## STOP conditions

- Plan 004's `cleanup.py` has no single place where categories are measured
  (would require restructuring beyond Step 4).
- You want to mark any entry other than `node-compile-cache` as prunable.
- A test needs the real home directory or real `$TMPDIR`.

## Maintenance notes

- Adding a tool = one registry entry with `action: "report"` and a test that
  the registry still validates. Promoting an entry to an automatic action needs
  evidence (regenerable, inactive, per-child age) in its own PR.
- Reviewers: check every `protected`/`action` pair; scrutinize `cache_prune.py`
  for symlink handling and the recheck before `rmtree`.
- Follow-up candidates (not in this plan): investigate whether Claude Desktop
  `vm_bundles` and Cursor `snapshots` keep superseded versions that are safe to
  prune per child; verify Antigravity/Windsurf paths on machines that have them.
