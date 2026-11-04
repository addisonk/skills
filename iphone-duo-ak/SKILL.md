---
name: iphone-duo-ak
description: Handle requests to remove or change iPhone Duo side navigation, choose the SwiftUI vertical-bar behavior, and teach Apple's terminology.
---

# iPhone Duo — AK

## Name the control

When the user calls Duo's side-mounted system navigation the "right sidebar"
or "side nav", briefly explain: **Apple calls this the vertical bar.** Use that
term in the handoff so the user learns it. Distinguish it from an app's own
sidebar when inspecting the affected screen.

## Match the requested behavior

For a request to remove the system's right-side navigation on the closed Duo,
use `.toolbarVerticalBehavior(.disabled)` on the affected navigation or
presentation content. Explain that controls move to horizontal top/bottom bars.
Let the system update the status bar and safe-area insets.

For other intents, choose the corresponding API:

| User intent | SwiftUI approach |
| --- | --- |
| Hide app navigation controls | `.toolbarVisibility(_:for:)` with the relevant bar placement. |
| Extend artwork under the bar while retaining controls | `.backgroundExtensionEffect()`; keep interactive foreground content within safe areas. |
| Keep one toolbar item horizontal | `.axisBehavior(.horizontalOnly)` on the item. It is absent if no horizontal bar is available. |

The vertical-bar opt-out and item axis behavior require iOS 27.1. Use runtime
availability checks and compile-time guards when supporting older SDKs.
Keep the preference stable for the affected interface across transient state
changes and opening or closing the device. Preserve the requested scope;
a sheet's opt-out need not change the whole app.

For custom bar alignment, `toolbarVerticalEdge` reports the system's preferred
edge, even when the bar is hidden. Use it for placement rather than visibility
detection.

After a UI change, verify the affected screen closed and open, following the
host project's simulator and screenshot rules. In the handoff, identify the
vertical bar, state whether controls moved or were hidden, and report the states
actually verified.

## References

- [Apple: toolbarVerticalBehavior(_:)](https://developer.apple.com/documentation/swiftui/view/toolbarverticalbehavior(_:)) — opt-out behavior, availability, and container resolution.
- [Apple: Preparing your app for iPhone Duo](https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo) — bars, sheets, and background extension.
- [Apple: toolbarVisibility(_:for:)](https://developer.apple.com/documentation/swiftui/view/toolbarvisibility(_:for:)) — hide specific bars.
- [Apple: axisBehavior(_:)](https://developer.apple.com/documentation/swiftui/toolbarcontent/axisbehavior(_:)) — control an item's eligible axes.
- [Apple: toolbarVerticalEdge](https://developer.apple.com/documentation/swiftui/environmentvalues/toolbarverticaledge) — preferred edge semantics.
