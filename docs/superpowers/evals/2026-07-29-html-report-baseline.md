# HTML Report Baseline Evaluation

**Date:** 2026-07-29
**Skill under test:** none; `html-report` did not exist

## Method

Three fresh agents received independent HTML document requests and separate temporary output directories. They could use the repository and existing installed skills, but they did not see the proposed `html-report` design or an expected solution.

The prompts covered:

1. A project status report with statistics, milestones, risks, decisions, and sources.
2. An implementation spec with an approach comparison, TypeScript interface, inline SVG flow, tests, and risks.
3. A QA evidence report with a verdict, story results, screenshots, a recording, failure details, and gaps.

## Results

| Evaluation | Authoring path | Source model | Verification | Result |
| --- | --- | --- | --- | --- |
| Status report | `html-artifact` | Hand-authored HTML plus metadata-only frontmatter JSON | Desktop light/dark and 400 px mobile | Attractive and valid, but no reusable content manifest, validator, or publishing path |
| Implementation spec | `html-artifact` | Hand-authored HTML plus metadata-only frontmatter JSON | Desktop, mobile, dark mode, anchors, and console | Complete content, but 23 px of horizontal overflow remained at 400 px |
| QA evidence | E2E QA template discovered from the repository | Embedded `report-data` block engine | Desktop, 400 px mobile, console, and remote media status | Strongest structure, but tied to QA-only blocks and an authoring-oriented catalog shell |

## Observed baseline failures

### 1. The same request class produced different architectures

The status and spec agents authored page markup directly. The QA agent found the E2E template and edited embedded report data. A future edit therefore requires different knowledge for each artifact, despite all three being structured HTML documents.

### 2. Reusable document data was inconsistent

The status and spec artifacts contained only metadata JSON; their actual content lived in HTML. The QA artifact contained structured report data. None produced a separate source manifest that could be validated, regenerated, or republished without editing the generated page.

### 3. Validation depended on agent diligence

Each agent invented its own checks. No artifact came with a reusable source validator or rendered-output validator. The spec agent reported the concrete regression: “the 400 px viewport measured 23 px of horizontal overflow.”

### 4. “Shareable” still meant a local file

All agents returned local files. The QA report referenced already-hosted media, but none offered a repeatable path for uploading the HTML, rewriting local media references, or verifying a hosted document.

### 5. Proven QA blocks did not generalize

The QA template handled verdicts, flows, screenshots, recordings, and gaps well. The status and spec agents could not reuse those rendering primitives for statistics, comparisons, timelines, technical diagrams, or implementation sections.

## Baseline strengths to preserve

- All three artifacts were visually polished and information-dense.
- The status report passed desktop, dark-mode, mobile, anchor, resource, and console checks.
- The QA artifact used structured data, surfaced unavailable evidence honestly, and verified every remote media URL.
- The spec included a complete comparison, code contract, diagram, test matrix, and risks.

## GREEN target

`html-report` should preserve that visual and editorial quality while making the process predictable:

- One JSON source model across document types.
- One shell and block catalog across document types.
- One source/output validation loop.
- One explicit browser-verification contract.
- One optional, repeatable CDN publishing branch.
- Zero horizontal page overflow at 400 px; intentionally scrollable code and tables stay contained within their blocks.
