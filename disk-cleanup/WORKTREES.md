# Retire finished checkouts

Use only for an exact enumerated checkout. Preserve primary repositories and every
branch ref. Keep native “any local files” protections enabled. A clean status,
settled badge, deleted chat, or retention setting does not prove disposability.

## 1. Reconcile all owners

Discover registered checkouts and their owning tasks through current supported
interfaces. Group references by the exact real checkout path. Include attachments
as well as thread cwd; cwd alone is incomplete. Retain a shared checkout if any
owner is active, unarchived where archival is required, pinned, unsettled, or
unknown. Preserve conversations instead of changing their status to qualify work.

- **Codex:** keep managed automatic cleanup enabled. Use supported ownership-aware
  lifecycle operations for archived/completed owners. Preserve unarchived/active
  owners. Do not attach another chat's checkout to the cleanup chat or fabricate
  ownership. If safe lifecycle removal is unavailable, record that exact blocker;
  preserve application state, history, and recovery data.
- **T3 Code:** when available, inspect current
  `orchestration_v2_projection_threads` and `orchestration_v2_projection_runs` in
  the configured `statev2.sqlite` read-only; legacy `projection_threads` is stale.
  Validate the current schema. Enumerate only registered linked worktrees within
  the configured T3 worktree root. Require every referencing thread to be settled,
  archived, or deleted, none pinned/unsettled, and no active run. Retain uncertain
  status transitions. Keep **Any local files** protection enabled.
- **T3 scheduled-run threads:** a thread created by a recurring scheduled task
  may finish its run without ever being settled, so it never passes the
  settled-or-archived gate. Don't treat it as settled. Report the task title,
  its cadence and the checkouts its threads hold, and suggest the user run that
  task in the main checkout or have it settle its own thread. T3's
  `schedule_task` tool can change a task's prompt but not its workspace; new
  tasks it creates also get a worktree. Moving a task to the main checkout
  needs T3's own settings.
- **Claude Code subagent worktrees** (`<repo>/.claude/worktrees/agent-*`): Claude
  Code removes these automatically only when they have no changes, so any
  subagent that commits leaves one behind. Its periodic sweep also skips
  worktrees with commits, edits or untracked files. Record branch, HEAD, status,
  last commit date, newest edit date and whether HEAD is reachable from a remote
  branch. The owning session is usually unknown, so don't remove them
  automatically. Report them as a known culprit with a removal recommendation
  (SKILL.md, Known culprits).
- **Manual checkouts:** discover configured locations and supported ownership
  records; establish every owner has finished. A missing owner blocks automatic
  removal but is not a reason to stay quiet. Report an ownerless checkout as a
  known culprit with its merge state and idle time. Apply the same recovery
  checks below.

Completion: each existing checkout has a recorded owner classification and every
retirement candidate has only verified finished owners.

## 2. Validate Git and inactivity

Validate user ownership, real paths without symlink traversal, and Git
registration. Retain checkouts with submodules, embedded repositories, ambiguous
registration, tracked changes, or untracked files. Require HEAD to be reachable
from a verified main branch and all checkout commits safely recoverable from a
retained repository/remote. Preserve unpushed commits; uncertainty about merge or
remote recovery blocks removal. Preserve branches even when merged.

Check associated runs, processes, cwd, open files, previews, development servers,
builds, media workers, and simulator sessions. Both application/task state and OS
evidence must establish inactivity. An open-file command failure is uncertainty.

Completion: recorded HEAD, clean tracked/untracked status, verified recovery,
registration, and no active association.

## 3. Inspect ignored files and preserve local data

Enumerate ignored files separately. Classify contents rather than trusting names.
Verified generated dependencies/caches such as `node_modules`, `.next`, `.turbo`,
and `__pycache__` may be discarded with an otherwise eligible finished checkout;
the standalone seven-day cache rule does not apply to this retirement branch.

Regenerable build caches (for example DerivedData, including project-registered
caches) count as generated: discard them with the checkout. Never move them into
recovery. A move within the same volume frees nothing.

Preserve every other ignored file, including private environment/configuration,
assets, and unique outputs, in a dated owner-only recovery directory. Use the
configured recovery root (for T3, typically `~/.t3/worktree-recovery`). Check total
backup size and sufficient free-space reserve before copying. Verify regular-file
hashes and symlink targets without following links. Reject special files,
ownership ambiguity, symlink escapes, and unsafe backup paths; conservatively
retain unhandled links. Keep contents and secrets out of reports.

Completion: every ignored file is either verified generated or covered by a
verified backup receipt; all backup limits and headroom requirements pass.

## 4. Recheck, remove, verify

Immediately before removal, refresh all thread/run/attachment state, HEAD, Git
status, ignored-file inventory, processes/open files, and backup verification.
Require these to match the approved candidate. If anything changes, retain it.

Use the supported app lifecycle operation. For an eligible registered Git linked
worktree where standard retirement is supported, use `git worktree remove` on its
exact path **without `--force`**. Keep branch refs intact. Never use `git clean`,
manual app-database edits, or arbitrary folder removal to bypass a refusal. A
supported lifecycle tool that snapshots changes still requires the ignored-file
backup gate above.

Verify the checkout is actually absent, registration is consistent, branch refs
remain, and recovery receipts are intact. Record removed checkouts, backed-up
file count/bytes, and retained dirty/unmerged/shared/active/unknown categories.
Counts and directory sizes do not establish unique bytes reclaimed.
