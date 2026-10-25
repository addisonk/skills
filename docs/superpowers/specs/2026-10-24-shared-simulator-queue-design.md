# Shared simulator queue design

Approved: one FIFO queue per physical Mac, shared by every app and worktree, with
an owner and ordered waiting status until verification and cleanup finish.
Independent code editing and non-native checks remain parallel.

Use a Python standard-library CLI/context manager, private disk metadata and OS
flock tickets. Keep the existing AppleDevelopment/native-session.lock inode for
compatibility. A guard assigns monotonically ordered tickets. Kernel locks identify
live waiters; a durable owner receipt blocks unsafe crash handover. The CLI starts
one supervised process group only after writing its identity and retains the lease
until the group exits. Nested adapters verify the inherited lease descriptor.

Install the runtime and a shared rule locally; version all installation sources.
Integrate existing Expo launchers without changing their development-client flow.
Bridge Old Sport's session context to the installed queue while preserving its CI
fallback and its one-device managed test pool. Preserve Duo/18 Pro Max and all saved
app data. No additional device, daemon, schedule, Docker, or service is needed.
Remote hosts require separate installation; do not claim local deployment covers them.
