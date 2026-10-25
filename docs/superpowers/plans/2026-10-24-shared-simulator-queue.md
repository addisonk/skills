# Shared Simulator Queue Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serialize native verification across all local apps/worktrees with visible FIFO status.

**Architecture:** A standard-library Python supervisor and context manager share the existing native-session lock. Node adapters join before touching devices and keep admission through preview cleanup. An installer deploys the runtime and shared agent rule.

**Tech Stack:** Python 3, POSIX flock/process groups, Node child_process, existing Expo launchers.

**Spec:** docs/superpowers/specs/2026-10-24-shared-simulator-queue-design.md

## Global Constraints

Preserve Duo/18 Pro Max and saved app data. No Docker, extra simulator, daemon, or schedule. Never kill another app's session. Queue once per physical Mac; no remote coverage claims without deployment.

### Task 1: Runtime and installation

Files: simulator-queue/scripts/apple_session.py, install.py, join-queue.mjs;
simulator-queue/tests/test_queue.py; simulator-queue/RULE.md and SKILL.md.

Interface: `session(app, worktree, state, wait_seconds)`; `apple-session status`;
`apple-session run --app NAME --worktree PATH -- COMMAND`; `joinQueue(app, worktree)`.

- [x] Exercise multiple real subprocesses with temporary state: FIFO order, visible owner/waiters, cancellation, timeout, inherited nested lease, legacy mutex, crash and symlink refusal.
- [x] Implement private file validation, monotonic tickets, owner receipt, gated process-group startup, signal forwarding, and no forced cleanup of unknown processes.
- [x] Test installer twice against a temporary home; assert unrelated rules survive and managed blocks occur once.
- [x] Run `python3 -m unittest discover -s simulator-queue/tests -v` and commit the source, rules and installation workflow.

### Task 2: Existing app entrypoints

Files: HiFi/Diem scripts/dev-mobile-browser.mjs, scripts/join-queue.mjs,
root/mobile AGENTS.md; Old Sport scripts/ios_session.py and tests/docs.

- [ ] Add `await joinQueue(app, repoRoot)` after help handling and before setup/native work. Refuse conflicting occupied Metro/preview resources; remove startup takeover and uninstall fallback.
- [ ] Bridge Old Sport's context to installed `session`, with verified inherited lease adoption and existing explicit-test-state/CI fallback.
- [ ] Run Node syntax checks and fake-launcher nested lease smoke tests; run Old Sport Python hygiene tests.
- [ ] Commit, push and open PRs for each repository; install the tested shared runtime locally and verify owner/waiting status with harmless commands.

### Task 3: Delivery

- [ ] Verify PR checks, merge approved workflow changes, deploy adapters only to clean inactive checkouts, and remove this task's temporary worktrees.
- [ ] Report local coverage, tests, live owner/status, and separate remote-host rollout limitation.

## Workspace responsibility

The native create_worktree tool returned “Not a git repository” for this projectless
maintenance chat. This task owns four manual worktrees outside Codex-managed roots:
`/Users/addisonkowalski/Projects/{skills,old-sport,hifi,diem}-simulator-queue`.
Remove them after changes are committed, pushed and delivered; preserve their branches.
