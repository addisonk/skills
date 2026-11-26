# Plan 002: Define "generated files" with a protected-first classifier

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3dc4d30..HEAD -- disk-cleanup/WORKTREES.md disk-cleanup/scripts/generated.py disk-cleanup/tests/test_generated.py`
> On any change to an in-scope file, compare the "Current state" excerpts
> against the live files; on a mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (a list that is too broad deletes protected output; too narrow only retains more)
- **Depends on**: plans/001-run-record-schema.md (only for the `scripts/` + `tests/` layout; no imports)
- **Category**: bug
- **Planned at**: commit `3dc4d30`, 2026-11-14

## Why this matters

`disk-cleanup` retires finished Git worktrees created by AI coding agents.
Before removing one, it must decide whether each Git-ignored file is
"generated" (safe to discard, e.g. `node_modules`) or must be backed up.
The skill says "classify contents rather than trusting names" but gives no
operational rule, so every agent improvises. A prototype script used during a
real cleanup classified by directory name only, treating anything under
`build/`, `dist/`, `out/`, `test-results/` or `playwright-report/` as
disposable — which would discard `build/App.ipa`, Android `.apk` files and test
evidence that the skill's hard protections require keeping. Two prototype
scripts also disagreed with each other. One shared, tested classifier where
**protected always wins** removes that risk and lets the future script
(plan 004) reuse it.

## Current state

- `disk-cleanup/WORKTREES.md:63-83` (section "## 3. Inspect ignored files and preserve local data"):

  ```markdown
  Enumerate ignored files separately. Classify contents rather than trusting names.
  Verified generated dependencies/caches such as `node_modules`, `.next`, `.turbo`,
  and `__pycache__` may be discarded with an otherwise eligible finished checkout;
  the standalone seven-day cache rule does not apply to this retirement branch.

  Regenerable build caches (for example DerivedData, including project-registered
  caches) count as generated: discard them with the checkout. Never move them into
  recovery. A move within the same volume frees nothing.

  Preserve every other ignored file, including private environment/configuration,
  assets, and unique outputs, in a dated owner-only recovery directory. ...
  ```

- `disk-cleanup/RUN-DETAILS.md:125-127` (hard protections):

  ```markdown
  - Preserve app archives, dSYMs, test results, screenshots, recordings, and any
    machine-specific deliverables. Report their growth read-only. ...
  ```

- Real ignored-file entries observed across ~140 finished worktrees (all
  Node/Next.js monorepos): `node_modules/`, `.husky/_/*` (husky hook stubs),
  `apps/web/next-env.d.ts`, `.impeccable/hook.cache.json`, `.turbo/`,
  `.next/`; plus files that must NOT count as generated: `.local/`,
  `packages/trigger/.trigger/`, `glance.config.json`,
  `apps/web/public/hyperframes-studio/`.
- Input format: `git status --porcelain=v1 --ignored=matching --untracked-files=normal`
  prints ignored entries as `!! <relative path>`; directories end with `/`.
  This is the list the classifier receives.
- Convention: stdlib-only Python in `<skill>/scripts/`, `unittest` tests in
  `<skill>/tests/` loading the module by path (see
  `simulator-queue/tests/test_install.py:1-10`).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Tests | `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` | `OK` |
| Compile | `python3 -m py_compile disk-cleanup/scripts/generated.py` | exit 0 |

## Scope

**In scope**:
- `disk-cleanup/scripts/generated.py` (create)
- `disk-cleanup/tests/test_generated.py` (create)
- `disk-cleanup/WORKTREES.md` — section 3 only

**Out of scope**:
- `RUN-DETAILS.md` hard-protection wording (the classifier implements it; do not loosen it).
- Any deletion or Git command. This plan only classifies paths.
- Project-specific names from one machine (e.g. `.impeccable/`); keep the
  generated list generic. Machine-specific additions belong in private config,
  which plan 004 loads.

## Git workflow

- Branch: `advisor/002-generated-file-classifier`
- Commit message style: sentence-case imperative, e.g. `Classify ignored worktree files with protected-first rules`.
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Create `disk-cleanup/scripts/generated.py`

Public API:

```python
GENERATED, PROTECTED, UNKNOWN = 'generated', 'protected', 'unknown'

def classify(relpath: str, root: str | None = None, extra_generated: tuple[str, ...] = ()) -> str: ...
def classify_all(entries: list[str], root: str | None = None, extra_generated=()) -> dict[str, list[str]]: ...
```

Rules, applied in this order (first match wins):

1. **Protected** if any path segment or the file name matches:
   - extensions: `.ipa .xcarchive .dSYM .apk .aab .app .dmg .pkg .mov .mp4 .m4a .wav .png .jpg .jpeg .heic .gif .webm .trace .xcresult .har .sqlite .db .key .pem .p12 .mobileprovision`
   - names/prefixes: `.env`, `.env.*`, `*.local` config files (`.local` directory is UNKNOWN, see rule 3),
     `test-results`, `playwright-report`, `screenshots`, `recordings`, `fastlane/report.xml`,
     `.trigger` (Trigger.dev local state), `*.xcresult`.
2. **Generated** if the path's first matching segment is in the dependency/cache set
   **and** no protected rule matched:
   `node_modules`, `.pnpm-store`, `.next`, `.turbo`, `.nuxt`, `.svelte-kit`,
   `.parcel-cache`, `.vite`, `.swc`, `.expo`, `.gradle`, `__pycache__`,
   `.pytest_cache`, `.mypy_cache`, `.ruff_cache`, `.venv`, `venv`, `.tox`,
   `DerivedData`, `.husky/_` (the two-segment prefix exactly), plus file names
   `next-env.d.ts`, `*.tsbuildinfo`, `*.pyc`, `.DS_Store`, `.eslintcache`, and
   anything in `extra_generated` (exact relative-path prefixes).
3. **Build-output directories need content proof.** `build/`, `dist/`, `out/`,
   `.output/`, `target/`, `coverage/`, `storybook-static/`: classify as GENERATED
   only when `root` is given and a walk of `os.path.join(root, relpath)` (with
   `os.walk(..., followlinks=False)`) finds no file that rule 1 marks protected
   and no symlink. If `root` is None, the walk finds a protected file, or the
   walk finds a symlink → PROTECTED for a protected hit, otherwise UNKNOWN.
4. Everything else → **UNKNOWN** (the caller must back it up or retain the checkout).

Normalize input: strip a leading `!! `, strip trailing `/` for matching, reject
absolute paths and any `..` segment by returning UNKNOWN. `classify_all`
returns `{'generated': [...], 'protected': [...], 'unknown': [...]}` preserving input order.

Do not walk dependency directories in rule 2 (too slow: hundreds of thousands
of files in `node_modules`).

**Verify**: `python3 -m py_compile disk-cleanup/scripts/generated.py` → exit 0.

### Step 2: Write `disk-cleanup/tests/test_generated.py`

Use `tempfile.TemporaryDirectory()` for any `root`. Cases (at least these 12):

1. `node_modules/` → generated; `apps/web/node_modules/` → generated.
2. `.husky/_/pre-commit` → generated; `.husky/pre-commit` → unknown.
3. `apps/web/next-env.d.ts`, `tsconfig.tsbuildinfo`, `pkg/__pycache__/` → generated.
4. `build/App.ipa` → protected (even though `build` is listed).
5. `android/app/build/outputs/apk/release/app.apk` → protected.
6. `test-results/trace.zip`, `playwright-report/index.html` → protected.
7. `.env.local`, `apps/api/.env` → protected.
8. `packages/trigger/.trigger/` → protected.
9. `dist/` with root=None → unknown; `dist/` with a temp root containing only
   `dist/main.js` → generated; with `dist/icon.png` added → protected; with a
   symlink inside → unknown.
10. `.local/`, `glance.config.json`, `apps/web/public/hyperframes-studio/` → unknown.
11. `../escape`, `/abs/path` → unknown.
12. `extra_generated=('.impeccable/hook.cache.json',)` makes that path generated;
    without it → unknown.
13. `classify_all` preserves order and buckets correctly for a mixed list.

**Verify**: test command → `OK`.

### Step 3: Point WORKTREES.md section 3 at the classifier

Keep the heading text exactly (`## 3. Inspect ignored files and preserve local data`).
Replace the sentence "Classify contents rather than trusting names." and the
`node_modules`… sentence with:

```markdown
Classify each ignored entry with `scripts/generated.py`. Protected output
(archives, app bundles, test results, screenshots, recordings, `.env` files)
always wins over a generated name. Dependency and cache directories such as
`node_modules`, `.next`, `.turbo`, `__pycache__` and DerivedData are generated.
Build-output folders (`build`, `dist`, `out`, `target`, `coverage`) count as
generated only after a walk finds no protected file and no symlink inside.
Treat every `unknown` entry as local data. Generated entries may be discarded
with an otherwise eligible finished checkout; the standalone seven-day cache
rule does not apply to this retirement branch.
```

Leave the DerivedData and "Preserve every other ignored file…" paragraphs as they are.

**Verify**: `grep -c 'scripts/generated.py' disk-cleanup/WORKTREES.md` → `1`;
`grep -c '^## 3. Inspect ignored files and preserve local data' disk-cleanup/WORKTREES.md` → `1`.

## Test plan

Step 2's 13 cases. The regression this plan fixes is case 4–6 (protected files
under generated-looking folders). Pattern: `simulator-queue/tests/test_install.py`.

## Done criteria

- [ ] `python3 -m unittest discover -s disk-cleanup/tests -t disk-cleanup` → `OK`, ≥ 13 tests in `test_generated.py`
- [ ] `python3 -c "import importlib.util as u; s=u.spec_from_file_location('g','disk-cleanup/scripts/generated.py'); m=u.module_from_spec(s); s.loader.exec_module(m); assert m.classify('build/App.ipa')=='protected'; assert m.classify('node_modules/')=='generated'; print('ok')"` → `ok`
- [ ] `git status --porcelain` shows only the in-scope paths and `plans/README.md`
- [ ] `plans/README.md` row 002 updated

## STOP conditions

- WORKTREES.md section 3 has been rewritten since `3dc4d30` (excerpt mismatch).
- A test requires walking a real home directory or network access.
- You find yourself adding a project-specific name (anything not a widely used
  tool's convention) to the built-in generated list — use `extra_generated` instead and report.

## Maintenance notes

- Plan 004's cleanup script calls `classify_all(entries, root=checkout, extra_generated=config_extras)`.
  Any `protected` or `unknown` entry means: back up per WORKTREES.md or retain the checkout.
- When adding a generated name, add a test proving a protected file beneath it still wins.
- Reviewers: scrutinize additions to the generated set more than additions to the protected set.
