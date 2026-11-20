---
name: codex-inline-visuals
description: Render interactive diagrams, charts, and explainers inline in Codex conversations. Use for Pele diagrams, clickable workflow walkthroughs, or requests for the inline HTML charts surface. Finds the bundled Visualize instructions even when absent from the skill catalog.
---

# Inline visuals in Codex

Codex Desktop supports interactive HTML response fragments. Pele supplies diagram
layout; Codex supplies the inline surface. T3's `html_render` tool is not needed.

## Load the host contract first

Before creating or updating a visualization, locate and read the **complete**
current bundled `visualize/SKILL.md`, including any truncated ranges. Prefer a
Visualize skill listed by the current harness. Otherwise run:

```sh
python3 <this-skill-dir>/scripts/find_visualize.py
```

The helper searches the current Codex home, without pinning the plugin cache
version. Follow that host skill and its relevant guides. Copy its reread reminder
into compaction summaries. Do not conclude that inline HTML is unavailable just
because `html_render` or Visualize is missing from the callable tool/skill list.
If neither the host contract nor a supported renderer is available, report the
specific missing capability; do not claim a static image is interactive.

## Native response handoff

- Write literal HTML **fragment** markup in an explicitly writable, durable,
  task-owned location, preferably the supplied thread visualization directory.
  No document wrapper. Read the file back.
- Scope CSS and DOM queries to a unique root ID; do not use `document.currentScript`.
- Use the host theme variables and native control utilities. Keep interactions
  local; no API calls, secrets, or external data requests from the fragment.
- Include the exact absolute executor-side path in the **same turn's final**:

```text
visualize{"path":"/absolute/task-owned/diagram.html"}
```

- A Markdown HTML link, code fence, or screenshot does not create this surface.
  Do not publish, install dependencies, or start a server merely to show it inline.
  Use a browser preview only when needed and permitted. Distinguish programmatic
  checks from actually inspecting/clicking the rendered result.

## Pele diagrams

Use Pele when requested. For a static nodes-and-edges explanation with no library
preference, follow the host's Mermaid guidance. Current primary references:
[API](https://pele.run/api), [theming](https://pele.run/theming),
[source](https://github.com/obsidianmd/pele).

The verified browser build is
`https://cdn.jsdelivr.net/npm/pele@1.13.0/dist/pele.global.js`, exposing `pele`.
Keep a tested exact version rather than a floating major. Confirm the CDN remains
allowed by the current host contract. Start from [the fragment](assets/pele.html)
when useful, replace its sample labels, and give each copy a unique root ID.

`pele.mount(element, mermaidSource, options)` responds to container width;
`mounted.update(source, options)` changes the selected view. `pele.render()`
returns SVG synchronously for offline layout checks. Reflow/wrap rather than
shrinking a wide fixed viewBox until labels are unreadable. Check at 320px and
normal conversation width, with visible text at least 11 screen pixels.

Validate every view and control. In sequence labels, `#` can start comment parsing;
use an unambiguous label and verify its rendered text. Use `<br/>` for line breaks.

## Install on another machine

Install this skill globally with the normal skills installer or skills sync.
For the global Codex discovery hint as well, run
`python3 <this-skill-dir>/scripts/install.py`. It preserves other instructions.
