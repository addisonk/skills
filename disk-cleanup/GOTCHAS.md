# Cleanup gotchas

These are investigation leads, not additional deletion authority. Apply the
eligibility checks and machine-specific protections to each exact candidate.

## Find what is actually taking space

- **Worktree layouts vary.** A checkout may be directly under `worktrees/`,
  nested under a project or generated ID, or inside an automation directory.
  Compare the measured root with Git's registered worktrees and inspect large
  unmatched children. Fixed-depth globs can miss the largest checkout. A `.git`
  file usually indicates a linked worktree; a `.git` directory may be a primary
  repository or standalone clone. Do not retire either based on its name alone.
- **Codex storage includes more than worktrees.** Measure managed, manual,
  scratch, and automation checkouts separately from history, databases,
  attachments, packages, and recovery. A large `.codex` total is not a cache
  total. Trace automation output to its task and distinguish retained evidence
  from rebuildable dependencies; an enabled task does not make every old child
  active, and a paused task does not make its output disposable.
- **Simulator devices can dwarf installed runtimes.** Report device data,
  runtime images, and build caches separately. Runtime cleanup does not reclaim
  a simulator's app containers. Within the Apple session, identify a large
  device and its main contributors without erasing it or reading user content.
  Device data stays protected unless separately authorized.
- **An empty central build cache proves little.** Look inside checkouts and
  configured build workspaces. Classify their source, build caches, symbols,
  archives, and test outputs separately. Do not delete a whole workspace to
  remove one regenerable cache.

## Make the right retention decision

- **Live SQLite state includes its WAL.** Use a normal read-only connection
  (`mode=ro`) for ownership databases, with WAL/SHM accessible. Do not use
  `immutable=1` on a running app's database: recent ownership changes may exist
  only in the WAL. An unreadable or inconsistent view blocks retirement.
- **A suffix does not establish uniqueness or reproducibility.** Keep app
  archives, app-build dSYMs, recordings, and unique test results protected.
  A third-party symbol bundle inside generated dependencies can follow the
  dependency rule only when its exact package/version, available restoration
  source, and absence of local changes are verified, and the containing
  checkout is otherwise eligible. Unknown provenance stays protected.
- **A recent cache parent can contain old eligible children.** Check narrow
  subtrees independently, including newest contained-file time, process use,
  safe paths, and reproducibility. Conversely, an old parent mtime does not
  make recent children eligible. Never blanket-delete an app cache root.
- **Large directory sizes are not reclaimed bytes.** Clones and hardlinks can
  share blocks. A move into recovery on the same volume frees no space. Measure
  actual volume free space after removal and retain backup headroom.

## Keep recurring runs useful

- **Read current rules, not remembered outcomes.** Compare machine exceptions
  with dated updates. Apply a user's authorized superseding change explicitly;
  never silently drop a protection. Verify the installed files on the execution
  host, even when both Macs appear to use a shared skill folder.
- **A successful scheduler turn is not a completed checklist.** Inventory-only
  categories still need classification or an exact safety blocker. Helpers may
  cover only worktrees while omitting caches or automation outputs. Record those
  gaps as incomplete work, not an unchanged successful cleanup.
- **Full access does not prevent command-review prompts.** Prefer simple
  read-only commands or a short `pathlib` script to nested shell substitutions
  and shell-specific globs. If review pauses a command, preserve that pending
  state and use the supported decline/rewrite flow; never approve it on the
  user's behalf or disable the gate. Report the exact blocked action and thread.
- **A pending start record is not proof of a running cleaner.** Reconcile the
  task's live run/request state and processes before treating it as overlapping.
  A run waiting for review needs attention; do not leave every later scheduled
  run silently skipping forever. Do not start competing mutations or rewrite
  history to manufacture completion.
