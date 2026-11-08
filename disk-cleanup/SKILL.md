---
name: disk-cleanup
description: Find what is using disk space, safely remove disposable files, and catch recurring storage growth on any computer.
---

# Disk cleanup

Run this checklist on the computer you are cleaning. Use its configured paths and
tools. Clean verified disposable files on every run, regardless of free space.
The default 25 GiB threshold is for alerts.

Read [RUN-DETAILS.md](RUN-DETAILS.md) for cleanup rules, protections, and reporting.
Use [SETUP.md](SETUP.md) for installation or scheduling, [WORKTREES.md](WORKTREES.md)
before retiring a checkout, and [MACOS.md](MACOS.md) for Mac-specific checks.
Resolve links from this skill's directory.

1. **Measure free space.** Identify the host, user, and target volume. Read local
   protections and the last cleanup record. Record free space and swap if
   available. Skip overlapping runs.
2. **Check the usual spots.** Find actual paths from app and tool settings,
   project roots, and prior records. Measure the top folders first, then open
   the largest or fastest-growing ones. Record missing or inaccessible locations.

   | Look here | Look for |
   | --- | --- |
   | Project folders and agent storage | Linked worktrees, scratch clones, old agent checkouts inside repositories, repeated dependency installs, and builds inside checkouts. List Git worktrees and check for standalone clones separately. |
   | Schedules and jobs | New workspaces, repeated downloads, and temporary outputs left behind after a run. Record the task that keeps creating them. |
   | Developer tools and app storage | Build caches, simulator assets, package stores, app caches, old update downloads, and oversized logs. |
   | Media and project outputs | Completed exports, benchmark output, temporary copies, and idle projects with rebuildable dependencies. |
   | Recovery folders, user libraries, and installed apps | Large backups, app data, old app versions, and sound or media libraries. Report these separately from routine cleanup candidates. |

3. **Decide what can go.** For each candidate, verify its exact path, ownership,
   inactivity, age where applicable, and how it can be rebuilt or recovered.
   Check running tasks, apps, builds, and open files. Protect unique work,
   history, credentials, originals, and backups. Flag a large checkout whose
   owner or recovery status is unknown. A cleaner app's label is a lead.
4. **Clean and verify.** Recheck each target immediately before removal. Prefer
   the tool's supported cleanup command. Skip uncertain items and continue with
   eligible ones. Confirm each removal, then measure free space and swap again.
5. **Log the result.** Record what was removed, moved, or skipped, with exact
   paths, reasons, and before-and-after free space. Folder sizes can include
   shared blocks. Report meaningful changes and the source of repeated growth,
   with a concrete next step for large items that need attention.
