---
name: simulator-queue
description: Serialize native builds, simulator verification, and interactive previews across multiple apps and worktrees on one Mac, with FIFO waiting and owner status.
---

# Shared simulator queue

Install once on each Mac: `python3 scripts/install.py` from this skill directory.
This installs `~/.local/bin/apple-session` and adds the managed rule to home and
Codex AGENTS.md, preserving existing instructions. No server or schedule is added.

Follow [RULE.md](RULE.md) for every native session. Run `apple-session status` for
JSON owner/worktree/phase and ordered waiters. Metadata contains no command arguments
or environment. The implementation uses Python's standard library and OS locks.

For a Node launcher, copy `scripts/join-queue.mjs` beside it and call
`await joinQueue('App name', repoRoot)` before native work or port cleanup. Preserve
`--help` without admission. A missing runtime fails closed. For Python, import the
installed `apple_session.py` and use `session(app=..., worktree=...)`; retain a
repository's existing mutex fallback only on hosts without this installation.
Do not nest a legacy, non-queue-aware mutex command inside `apple-session run`:
upgrade its adapter first, or it will wait for its own outer lock.

Hold the lease through the complete verification and cleanup session. The CLI
supervises one process group and forwards terminal signals to it; leftover child
processes retain ownership until they finish. Daemonized helpers that leave the
process group must be stopped by the owning launcher before it exits. A detached
preview is not proof of cleanup. Inspect and leave unknown helpers alone.

After a supervisor crash, status retains the owner receipt. After confirming its
work finished, `apple-session recover --confirm-id <id-from-status>` clears only
a matching supervised session with no live owner, descendants, or legacy lock.
Library-only crash receipts have no supervised group and require manual inspection;
automatic recovery refuses them. Never expire a live lease by time or PID age.

This is cooperative admission, not an OS sandbox: direct Xcode/simctl commands can
bypass it. Use the rule and queue-aware launchers consistently. Existing old mutex
clients still exclude queued clients via the same `native-session.lock`; their
owner names and FIFO order are unavailable until their adapters are upgraded.

Run tests: `python3 -m unittest discover -s simulator-queue/tests -v` from the repo.
Tests use temporary directories and fake processes; they never touch real devices.
