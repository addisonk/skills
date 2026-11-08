# macOS cache and simulator checks

Discover configured paths on this Mac; examples below are leads, not deletion
allowlists. Inspect metadata only. Standalone caches require verified regenerability,
inactivity, safe paths/ownership, and newest contained file older than seven days.
Repeat these checks immediately before a narrow deletion.

## Baseline

Record free space on the target volume with `df -k` (usually
`/System/Volumes/Data`), swap with `sysctl vm.swapusage`, VM volume capacity
consumed with `diskutil apfs list`, and local snapshots with
`tmutil listlocalsnapshots` for the target volume. Record unavailable measurements.
Compare free space and VM usage separately. A change in either can coincide
with unrelated disk activity.

## App caches

Measure shallow sizes under `~/Library/Caches`, then inspect the largest relevant
subdirectories. Include Codex, `com.openai.codex`, Chrome/Google,
`claude-cli-nodejs`, Spotify, Adobe, and Loom, Wispr Flow, Notion, Figma, T3,
CodexBar, and Granola updaters when present.

Eligible targets are independently verified disposable HTTP/disk/code caches and
obsolete unused downloaded update archives. Preserve entire app roots, app data,
databases, sessions/cookies, offline media, pending updates, unique diagnostics,
and installed tools/browsers. Skip caches associated with running apps/updaters,
even when no files are open. Recent root contents do not prove every child is
recent: inspect narrow subtrees independently when material space is at stake.

## Developer build caches

Inspect ignored/untracked `.next` and `.turbo` within configured checkout roots;
establish Git classification and checkout inactivity before standalone deletion.
Also find Xcode build caches inside checkouts: `find <checkout roots>
-maxdepth 4 -type d -path '*/build/DerivedData'`. Apply the project-registered
[build cache rule](RUN-DETAILS.md#eligible-cleanup) to each one. A project that sets `-derivedDataPath`
inside its checkout keeps almost nothing in the central DerivedData folder, so
an empty central folder doesn't mean there's nothing to clean.
Inspect `~/Library/Developer/Xcode/DerivedData`, configured XcodeBuildMCP
workspaces, and `node-compile-cache` under the actual user temporary directory
(discover with `getconf DARWIN_USER_TEMP_DIR`).

Separate build caches from source packages, products, archives, dSYMs, result
bundles, logs, screenshots, and recordings. Preserve the latter protected outputs;
never delete an entire XcodeBuildMCP workspace indiscriminately. Keep active builds
and recent caches intact. Inspect large Codex storage categories read-only to
explain growth; preserve packages, local automations, worktree recovery, and all
conversation/history/state files.

## Simulator runtimes

Before simulator operations, inspect the machine-wide Apple session queue. On a
machine using `simulator-queue`, run `~/.local/bin/apple-session status` and follow
that skill's installed rule. Respect owners, ordered waiters, and crash receipts;
skip routine inspection when safe admission is unavailable. Keep the whole
inspection/removal inside one queue session. Never bypass another owner.

Within the session, inspect Apple's installed tooling help and inventory **all**
devices, runtimes, and runtime images with supported `xcrun simctl` commands.
Dry-run runtime cleanup first; supported versions provide
`simctl runtime delete --notUsedSinceDays 60 --dry-run`.

Also compare the runtime assets on disk with CoreSimulator's registry, using
metadata only. List
`/System/Library/AssetsV2/com_apple_MobileAsset_*SimulatorRuntime/*.asset`
(version from each asset's `Info.plist`) and check each against the `path`
entries in `/Library/Developer/CoreSimulator/Images/images.plist`. An asset
missing from the registry is invisible to `simctl`, so the dry-run can never
match it. Report it as orphaned with its version and size, and flag it for
the user (removal needs admin rights or Apple tooling). Never delete it
directly.

Remove only exact runtimes proven unused for over 60 days with no associated
device. Preserve every runtime used by any existing device, the newest installed
runtime, and active-build requirements. Recheck these immediately before removal
and verify the result. A broad age-based deletion command is insufficient if it
cannot enforce these exclusions. Skip unsupported tooling or elevated operations.
Preserve every simulator device and its data; leave system-owned runtime assets
and swap files to the OS.
