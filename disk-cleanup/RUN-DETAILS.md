# Disk cleanup reference

## Inventory

On every run, inventory both Codex and T3 storage, even when disk space is
ample or the registered worktree inventory has not changed. Measure shallow
sizes under their configured roots and inspect the largest relevant children.
Include managed worktrees, manual checkouts, T3 scratch clones, Codex
automation-created worktrees, app caches, and protected state and recovery
directories. Check automation worktree subdirectories separately from the
automation root. Record each category's size and change from the prior run,
or state why it is absent or could not be measured. Record the prior size as
unavailable when there is no comparable measurement.

For each known project repository, enumerate registered checkouts with
`git worktree list --porcelain`. Separately inspect configured agent and scratch
roots for standalone clones or leftovers missing from Git's inventory. Flag
unfamiliar roots and ownerless checkouts with size, branch recovery, local
changes and last activity. Unknown ownership blocks automatic retirement.

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

Inventory scheduled work that creates checkouts. For T3, read
`scheduled_tasks` read-only for enabled tasks whose `workspace_strategy_json`
is a worktree. Count the checkouts each task created since the prior run.
Report any recurring task that created two or more since its last alert, with
the task title, cadence, next run and the checkout paths.

Classify generated dependencies and build output separately from the checkout
that contains them. Look for build caches inside checkouts as well as in
central caches (for example `<checkout>/build/DerivedData`). Apply the
dormant-project rules before removing generated files and the checkout
retirement rules before removing a checkout. Inventory protected state and
recovery data read-only, and report regenerable content found inside
recovery roots (such as DerivedData) as its own line.

**Shared storage.** Directory totals can count shared blocks more than once.
Where supported, compare sampled dependency files across checkouts to
investigate hardlink or clone sharing. Treat those samples as evidence about
the files sampled. Measure volume free space after cleanup to see the net
change.

Track checkout churn from the package store when it keeps a project
registry. For pnpm, count the live and dead symlinks in
`<store>/v10/projects/`, resolving each link relative to that directory.
Report the change in both counts since the prior run. Fast growth in dead
entries means checkouts are being created, installed into and thrown away.

## Record

Keep a private record with host, timestamp, exact paths, reasons, category sizes,
removed and skipped counts, recovery receipts, and before-and-after volume and
swap measurements. Compare against the preceding run when measurements match.
Record bytes moved on the same volume separately from removals. Store metadata
only. Exclude credentials, environment values, conversations, and log contents.

Report net free-space change separately from item sizes and concurrent activity.
Record reclaimed bytes as unknown when they cannot be isolated. Track recurring
checkout creation, downloads, cache regeneration, and recovery growth. Verify
supported native cleanup remains enabled. Keep changes to project code, settings,
workers, and schedules within their separately authorized scope.

## Flag chats that use substantial disk space

On every run, rank the largest retained T3 and Codex checkouts, including active,
pinned, shared, and archived checkouts. Use measured directory sizes and the
ownership checks in WORKTREES.md. Group by physical checkout so a shared
directory counts once. Record the owning chat titles and links when verified,
the project and host, total measured size, major contributors such as
dependencies or build output, change since the previous run, and why the
checkout stays. Report uncertain ownership as unknown.

By default, flag a checkout when first measured at 3 GiB or more, when it grows
by at least 1 GiB since the last alert while above that threshold, or when its
cleanup blocker materially changes. Allow the machine configuration to override
these thresholds. Alert regardless of overall free space. Limit notifications to
the three largest newly actionable findings per host, and record what was
reported so unchanged findings stay quiet.

If a chat looks finished or has a practical stopping point, suggest reviewing
it for archival or starting a fresh chat after saving needed work and context.
For active or shared work, explain the size and why it is still needed, and
suggest a handoff only when there is a safe stopping point. If the checkout is
already archived, state the specific blocker and the next safe step. Explain
that archival may leave the checkout on disk and that measured directory size
is not a prediction of reclaimed bytes. Leave chat archival, restart, and
handoff decisions to the user. An alert never makes a checkout eligible for
automatic removal.

## Eligible cleanup

| Category | Required evidence and action |
| --- | --- |
| Standalone caches | Verified regenerable, inactive, and newest contained file older than seven days. A directory mtime alone is insufficient. Use narrow subdirectories. |
| Package stores | Discover the canonical store and use its supported prune/garbage-collection command only when no installation or store operation is active. For pnpm, use `pnpm store prune` without `--force`, and only when the store imports by hardlink. **Skip pnpm prune when clone import is in use or hardlink import cannot be verified.** A link count of one cannot distinguish a clone from a standalone file. On one Mac, repeated pruning coincided with new full dependency copies and minimal immediate gains. If a prune reports removing at least half of the store's packages, record it as a fault and stop pruning on this host until reviewed. |
| Project-registered build caches | When a project marks a cache with an ownership file, require the marker to match the cache's real path and inode. Also require that the newest contained file is older than seven days, that no build process (`xcodebuild`, `XCBBuildService`, `swift-frontend`, `clang`, `xctest`) is running, and that the cache contains no symlinks. Then delete only that cache directory. Example: Old Sport's `<checkout>/build/DerivedData/.old-sport-cache-owner.json`. Copies inside recovery roots no longer match their marker; report them, don't delete. Never touch archives, `.ipa` files or TestFlight exports beside the cache. |
| Dormant-project dependencies/builds | Establish the project is unused by tasks and processes, every removed file is reproducible, no local modifications or unique outputs are included, and exact restoration is possible from preserved source, lockfiles, and available packages. Prefer supported commands. Preserve retained active checkouts' installed dependencies. |
| Installers/updates | Verify an archive is obsolete and unused. Preserve pending updates and installation payloads unless obsolescence is proven. |
| Logs | Treat size as an inspection lead. Preserve unique diagnostics; remove only verified disposable duplicates or regenerable logs with established inactivity and retention eligibility. |
| Media/benchmarks | Verify delivery and processing receipts, a retained delivered copy or exact reproducibility, and retirement of the associated worker. Preserve incomplete jobs, reusable assets, source media, and unique outputs. |
| Finished checkouts | Apply WORKTREES.md, including ownership reconciliation, commit recovery, ignored-file inspection, verified backups, and supported removal. |

## Hard protections

- Preserve source, unpushed commits, branch refs, active/shared work, conversation
  history, application databases (including SQLite WAL/SHM), credentials, cookies,
  sessions, local storage, IndexedDB, offline media, attachments, personal files,
  downloads, Trash, reusable assets, unique diagnostics, and recovery snapshots.
- Preserve app archives, dSYMs, test results, screenshots, recordings, and any
  machine-specific deliverables. Report their growth read-only. A cleaner app's
  “junk” label is a lead, never proof of disposability.
- Preserve installed browsers, tools, bundled runtimes, and packages. Dependency
  stores are eligible only through supported pruning, not blanket cache deletion.
- Validate exact real paths, owner, allowed root, and file types. Reject symlink
  traversal, ambiguous/special files, filesystem boundaries, and unexpected
  contents; independently validate a narrower subtree if possible. Revalidate
  immediately before mutation. Prefer bounded operations over broad wildcards.
- Keep apps and processes running; leave system settings, system-owned assets,
  swap files, and recovery/history/state intact. Skip operations requiring elevated
  privileges. Low space never weakens these protections.

## Recurring notifications

Use the machine's configured thresholds. Defaults: meaningful verified cleanup
of at least 5 GiB, free space below 25 GiB, a drop of at least 10 GiB since the
prior run, an actionable failure, or a substantial new growth source. Substantial
new growth includes a recurring scheduled task that created two or more
checkouts, a new physical dependency copy, and recovery growth of at least 1 GiB.
Include current free space, measured results, and material skipped items. Stay quiet on
unchanged, already-reported, non-actionable results; follow the scheduler's required
response format. At critical space, name the blocking category and safe next
action, such as freeing backup headroom or resolving unmerged work.
