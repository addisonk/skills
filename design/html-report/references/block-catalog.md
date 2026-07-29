# Block catalog

Every block requires `type`, `id`, and `title`. IDs use lowercase ASCII letters, numbers, and hyphens, start with a letter, and are unique.

Open `../templates/report-blocks.html` to see every block rendered together. Read or copy from `../templates/report-blocks.json` when the data shape is easier to understand as a complete example.

## Narrative

```jsonc
{ "type": "prose", "id": "summary", "title": "Summary", "html": "<p>...</p>" }

{ "type": "callout", "id": "decision", "title": "Decision", "tone": "success", "html": "<p>...</p>" }

{ "type": "quote", "id": "principle", "title": "Principle", "text": "...", "attribution": "..." }
```

Callout tones: `info`, `success`, `warning`, `error`.

## Structured information

```jsonc
{ "type": "stats", "id": "signals", "title": "Signals", "items": [
  { "label": "Checks", "value": "18/18", "detail": "Required suite" }
] }

{ "type": "table", "id": "risks", "title": "Risks",
  "columns": ["Risk", "Impact", "Owner"],
  "rows": [["Ambiguous rollback signal", "High", "On-call"]]
}

{ "type": "comparison", "id": "options", "title": "Options", "items": [
  { "label": "Selected", "title": "Structured model", "detail": "Consistent and portable." }
] }

{ "type": "checklist", "id": "criteria", "title": "Acceptance criteria", "items": [
  { "label": "Opens without the app", "detail": "One portable file.", "done": true }
] }

{ "type": "timeline", "id": "sequence", "title": "Sequence", "items": [
  { "time": "09:00", "title": "Freeze release", "detail": "Use the verified commit." }
] }
```

## Technical material

```jsonc
{ "type": "code", "id": "contract", "title": "Contract", "language": "json", "code": "{\n  ...\n}" }

{ "type": "diagram", "id": "flow", "title": "Flow", "svg": "<svg viewBox=\"0 0 800 300\" ...>...</svg>" }
```

Diagrams use inline SVG. Include `role="img"` and an `aria-label` on the root SVG.

## Evidence

```jsonc
{ "type": "verdict", "id": "verdict", "title": "Verdict", "status": "pass", "lead": "Ready to release.", "detail": "..." }

{ "type": "flow-results", "id": "flows", "title": "Flow results", "flows": [
  { "name": "Guest checkout", "status": "pass", "detail": "Payment and receipt verified." }
] }

{ "type": "gallery", "id": "screens", "title": "Screenshots", "items": [
  { "image": "media/checkout.png", "alt": "Completed checkout", "caption": "Desktop confirmation" }
] }

{ "type": "recording", "id": "recording", "title": "Recording",
  "video": "media/run.mp4", "poster": "media/poster.png", "label": "Critical path · 01:42",
  "links": [{ "label": "Trace", "url": "https://example.com/trace" }]
}

{ "type": "gaps", "id": "gaps", "title": "Gaps", "items": [
  { "title": "Tablet not covered", "severity": "medium", "detail": "Desktop and phone only." }
] }
```

Statuses: `pass`, `partial`, `fail`. Gap severity can be `low`, `medium`, or `high`.

## Sources and controlled escape hatch

```jsonc
{ "type": "sources", "id": "sources", "title": "Sources", "items": [
  { "label": "Release runbook", "url": "https://example.com/runbook", "note": "Deploy and rollback" }
] }

{ "type": "custom-html", "id": "special-layout", "title": "Special layout",
  "html": "<div class=\"custom-grid\"><article>...</article></div>"
}
```

`custom-html` may use semantic HTML and the shell's existing classes. It may not contain `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, event-handler attributes, remote stylesheets, or `javascript:` URLs.
