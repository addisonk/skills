---
name: disk-cleanup
description: Reclaim disposable developer and media disk space, investigate recurring storage growth, or set up conservative recurring cleanup on a machine.
---

# Disk cleanup

Reclaim verified disposable space without losing work. Run autonomously within the
user's authorized scope; skip uncertain candidates and continue with safe ones.
This skill supplies a process, not a recursive deletion script.

On every run, clean all candidates that pass the safety checks, even when the
volume has plenty of free space. The 25 GiB threshold controls notifications
only. Available space still matters for safety checks such as backup headroom.

For installation, machine discovery, or recurring cleanup setup, follow
[SETUP.md](SETUP.md). Otherwise use the existing machine configuration and run the
checklist below. Read [WORKTREES.md](WORKTREES.md) before retiring any checkout.
On macOS, read [MACOS.md](MACOS.md) before app-cache, Xcode, or simulator cleanup.
Resolve these references from this skill's directory, not the current project.

## Run checklist

Mark each step complete with measured evidence or a specific skip reason.

1. **Establish a baseline.** Identify the physical host, user, target volume, prior
   cleanup record, and machine-specific protections. Measure available space and
   swap before mutations. On macOS use `df -k /System/Volumes/Data` and
   `sysctl vm.swapusage`. If a cleanup is already running on this host, skip the
   overlapping run. Record a missing baseline rather than inventing a comparison.

2. **Locate growth.** Discover configured storage locations for Codex, T3 Code,
   Claude Code, package managers, build tools, and media workers. Start with
   shallow directory sizes and prior candidates, then inspect the largest relevant
   subdirectories. Rank changes since the prior run. Inspect stale worktrees,
   abandoned checkouts, duplicated dependencies, builds, temporary files, caches,
   oversized logs, outdated installers, dormant projects, completed exports,
   benchmark output, and temporary media copies. Expand inspection only when
   measurements justify it; avoid repeated whole-disk scans.

   On every run, inventory both Codex and T3 storage, even when disk space is
   ample or the registered worktree inventory has not changed. Measure shallow
   sizes under their configured roots and inspect the largest relevant children.
   Include managed worktrees, manual checkouts, T3 scratch clones, Codex
   automation-created worktrees, app caches, and protected state and recovery
   directories. Check automation worktree subdirectories separately from the
   automation root. Record each category's size and change from the prior run,
   or state why it is absent or could not be measured. Record the prior size as
   unavailable when there is no comparable measurement.

   Classify generated dependencies and build output separately from the checkout
   that contains them. Apply the dormant-project rules before removing generated
   files and the checkout retirement rules before removing a checkout. Inventory
   protected state and recovery data read-only.

3. **Classify candidates.** Enumerate exact paths and the evidence that each is
   disposable. Check current tasks, ownership, running apps/workers/builds/servers,
   previews, and open files. A lack of open files alone does not establish
   inactivity. Finish checkout classification with WORKTREES.md; a sidebar badge,
   clean Git status, or an enabled retention setting is insufficient.

4. **Clean eligible categories.** Apply the rules below and use supported cleanup
   commands where available. Immediately before every mutation, repeat the path,
   ownership, age, inactivity, local-file, and recovery checks that apply. Leave a
   candidate untouched if its identity changed or a check failed. Record each
   removal or blocker; continue with independent safe candidates.

5. **Verify and record.** Confirm targeted paths are absent or the supported
   command achieved its stated result. Remeasure volume free space and swap after
   all operations finish. Keep a compact record with host, timestamp, exact paths,
   reasons, category sizes, removed/skipped counts, backup receipts, before/after
   measurements, and deltas from the preceding run. Store metadata privately;
   exclude credentials, environment values, conversations, and log contents.

6. **Report and prevent recurrence.** Separate verified cleanup results from net
   free-space movement and concurrent swap changes. Directory sizes may include
   shared/cloned blocks; they are not guaranteed reclaimable bytes. State
   reclaimed bytes as unknown when they cannot be isolated. Track repeated
   checkout creation, downloads, and cache regeneration. Verify supported native
   cleanup remains enabled. Report a concrete cause or blocker, not a speculative
   fix; changes to project code, settings, workers, or schedules need task scope.

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
| Package stores | Discover the canonical store and use its supported prune/garbage-collection command only when no installation or store operation is active. For pnpm, use `pnpm store prune` without `--force`. |
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
prior run, an actionable failure, or a substantial new growth source. Include
current free space, measured results, and material skipped items. Stay quiet on
unchanged, already-reported, non-actionable results; follow the scheduler's required
response format. At critical space, name the blocking category and safe next
action, such as freeing backup headroom or resolving unmerged work.
