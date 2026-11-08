---
name: disk-cleanup
description: Audit disk usage, reclaim disposable files, or set up recurring disk cleanup.
---

# Disk cleanup

For installation or schedule changes, follow [Setup](SETUP.md). For an audit or
cleanup, follow the checklist below. Resolve references from this skill's folder.

Use read-only mode for an audit. For authorized cleanup, remove eligible items
at any free-space level. Use the alert threshold only when deciding whether
to notify.

1. **Measure.** Identify the host, account, target volume, local rules, and prior
   record. Skip overlapping cleanup runs. On macOS, follow the [Mac baseline](MACOS.md#baseline).
   **Done when** the baseline contains current free space, swap if available,
   and a comparable prior measurement or its absence.

2. **Inventory.** Discover paths from app settings, Git, and prior records. Start
   with top-level sizes, then inspect the largest or fastest-growing children.
   For agent workspaces and scheduled jobs, follow [Inventory](RUN-DETAILS.md#inventory).
   On macOS, use the [app, build, and simulator checks](MACOS.md).

   | Look here | Look for |
   | --- | --- |
   | Projects and agent storage | Worktrees inside repos, scratch clones, duplicate dependencies, and builds inside checkouts |
   | Schedules and jobs | Repeated checkout creation, downloads, and temporary output |
   | Developer tools and app storage | Build caches, simulator assets, package stores, app caches, old updates, and large logs |
   | Media and project output | Completed exports, benchmark output, temporary copies, and idle projects with rebuildable dependencies |
   | Recovery folders, user libraries, and installed apps | Large backups, app data, older app versions, and sound or media libraries to report |

   **Done when** each category has a size and prior delta where available, or a
   specific reason it could not be measured. Identify the largest sources and
   any recurring job behind them.

3. **Classify.** Apply the [cleanup rules](RUN-DETAILS.md#eligible-cleanup) and
   [hard protections](RUN-DETAILS.md#hard-protections).
   For checkout retirement, follow [Worktrees](WORKTREES.md). For large retained
   chat checkouts, use the [ownership and alert checks](RUN-DETAILS.md#flag-chats-that-use-substantial-disk-space).
   **Done when** each candidate has an exact path and evidence of ownership,
   inactivity, age where required, and recoverability, or a recorded blocker.

4. **Clean and verify.** In cleanup mode, repeat the safety checks immediately
   before each mutation. Prefer supported commands. Skip uncertain candidates
   and continue with eligible ones.
   **Done when** each attempted removal has a verified outcome and the volume
   has a fresh free-space and swap reading. In audit mode, record proposed
   actions and finish with a fresh measurement.

5. **Log and report.** Use the [record format](RUN-DETAILS.md#record). Save it privately
   for cleanup runs. Return it in the response for a read-only audit.
   For scheduled runs, apply the [notification rules](RUN-DETAILS.md#recurring-notifications).
   **Done when** the record distinguishes removals, moves, skips, and measured
   free-space change, and names the owner or next action for material findings.
