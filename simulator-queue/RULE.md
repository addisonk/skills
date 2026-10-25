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

Reuse the existing iPhone Duo or iPhone 18 Pro Max. Preserve personal app data and
Old Sport's existing Duo data. Never create a simulator per app, worktree, task, or
agent. At most one disposable automated-test simulator may exist on this Mac;
reuse an approved managed test wrapper that records exact ownership and removes
its own device before releasing the queue. Disable Xcode parallel testing and
cloned test runners (`-parallel-testing-enabled NO -maximum-concurrent-test-simulator-destinations 1`).
Other apps' installs can coexist on the shared persistent devices; only one agent
may control either device at a time. Do not erase or uninstall shared app data.

If the queue is missing, install the versioned `simulator-queue/scripts/install.py`
from `addisonk/skills`; keep working on code until it is installed. A crash receipt
blocks handover until its owned processes finish and its identity is inspected;
never unlink lock files or clear another agent's receipt to bypass waiting.
The queue is per physical Mac. Install it separately on any other build host.
<!-- END SHARED APPLE SIMULATOR QUEUE -->
