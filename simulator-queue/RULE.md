<!-- BEGIN SHARED APPLE SIMULATOR QUEUE -->
## Shared simulator queue (every app and worktree on this Mac)

Before native builds, simulator tests, boot/install/launch, UI automation, screenshots,
recordings, or Metro/serve-sim takeover, inspect `~/.local/bin/apple-session status`.
Acquire one machine-wide FIFO session with:

```sh
~/.local/bin/apple-session run --app "App name" --worktree "$PWD" -- <whole-session-command>
```

Keep that command alive through verification and cleanup. For interactive work,
wrap a shell (`-- /bin/zsh -f`), do the whole session inside it, stop only the
processes you started, then exit. A running preview owns the slot even when idle.
Use a verified queue-aware launcher directly (its source calls `joinQueue` or the installed shared `session`). Older worktrees need the adapter update first; wrapping an older native mutex client would deadlock on its own outer lease.
Waiters can edit code and run checks that do not build native targets or use a simulator.
Show the owner and ordered waiters with `apple-session status`; wait for the owner
instead of killing its Metro/preview, replacing its app, or creating another device.

Inspect available simulators on the current Mac and reuse a suitable existing
device. Device names, OS versions, and app-specific preferences belong in the
current repository's instructions, not global rules. Preserve all shared app data.
Do not create a simulator per app, worktree, task, or agent. Disable Xcode parallel
testing and cloned test runners (`-parallel-testing-enabled NO -maximum-concurrent-test-simulator-destinations 1`).
Only one agent may control shared devices at a time. Do not erase or uninstall
shared app data.

If the queue is missing, install the versioned `simulator-queue/scripts/install.py`
from `addisonk/skills`; inspect it before execution and require runtime-only
installation. Installation must not create or rewrite global agent instructions.
Keep working on code until it is installed. A crash receipt
blocks handover until its owned processes finish and its identity is inspected;
never unlink lock files or clear another agent's receipt to bypass waiting.
The queue is per physical Mac. Install it separately on any other build host.
<!-- END SHARED APPLE SIMULATOR QUEUE -->
