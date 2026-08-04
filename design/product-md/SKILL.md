---
name: product-md
description: Use when a repository needs a new, updated, audited, or resynchronized PRODUCT.md; when a teammate or LLM needs a current user-facing product explanation; or when product docs mix shipped behavior with plans, implementation detail, or marketing claims.
---

# ProductMd

Create the canonical explanation of the product people can use today. A new teammate or LLM should understand the user, value, experience, capabilities, boundaries, and product vocabulary without reading the codebase.

## Workflow

1. **Find the source of truth.** Read repository instructions, the existing `PRODUCT.md`, README, product or marketing context, user-facing routes and copy, primary flows, tests, schemas, and recent product decisions.
2. **Build an evidence ledger in working notes.** Give every material claim a source and a status: `current`, `planned`, or `unknown`. Current UI and runtime behavior outrank stale plans. Keep marketing claims as positioning until current evidence proves them.
3. **Choose the mode.** A working product describes demonstrated current behavior. A brief or prototype describes only supplied commitments and demonstrated capabilities. Ask only when an unknown would materially change the product story; otherwise omit it and report the uncertainty after writing.
4. **Write the content contract below.** Prefer product nouns and user-visible behavior over files, services, schemas, or architecture.
5. **Verify and report.** Recheck every current-tense claim against the ledger. Report the path, material facts added or changed, and unresolved conflicts.

## File Setup

- Create `PRODUCT.md` at the repository root unless the project already uses another canonical location such as `docs/PRODUCT.md`.
- Resynchronize an existing file in place. Preserve custom headings only when their content satisfies a slot in the contract.
- Use one canonical `PRODUCT.md`; link to adjacent documents instead of duplicating them.

## Content Contract

Every file must satisfy each **Required** row. Headings may vary, but the content must be easy to locate.

| Content | Default heading | Requirement |
|---|---|---|
| Identity | Title and opening | **Required.** Product name, one- or two-sentence current value description, intended reader, and `Last reviewed: YYYY-MM-DD`. |
| Definition | `What it is` | **Required.** Category, user promise, current maturity or availability when material, and the distinction most likely to prevent misreading. |
| Audience | `Who it's for` | **Required.** Primary users, their situation or problem, and the outcome they seek. |
| Value delivery | `Core loop` or `How it works` | **Required.** Explain the main experience from the user's point of view. For a non-interactive product, explain how it delivers value. |
| Capabilities | `What it does today` or `Features` | **Required.** Group demonstrated user-visible capabilities by product concept. |
| Boundaries | `What it doesn't do today` | **Required when current evidence establishes a limitation or likely false assumption.** Otherwise omit the section and report that no confirmed boundaries were found. |
| Vocabulary | `Glossary` | **Required when the product uses two or more domain terms, or one term that readers could easily confuse.** Define each term once. |

## Conditional Content

Add these only when current evidence makes them important to product understanding:

- status or distribution when availability is limited or uneven
- reliability behavior users notice
- product principles explicitly adopted by the team
- a source or catalog note when provenance shapes the experience
- `Considering` for explicitly named candidate ideas

Give every future claim one home. Use `What it doesn't do today` to correct a likely false assumption, or `Considering` to record a candidate idea, without repeating it in both.

## Separate Documents Contain

`PRODUCT.md` owns the current user-facing product truth. Keep adjacent concerns in their own canonical documents and link them when useful.

| Content | Better home |
|---|---|
| Installation, development, and contributor commands | `README.md`, `CONTRIBUTING.md`, or `AGENTS.md` |
| System design, services, code paths, schemas, and APIs | Architecture or technical documentation |
| Requirements, acceptance criteria, and delivery tasks | PRD, specification, issue, or implementation plan |
| Milestones, launch phases, and future commitments | Roadmap or launch plan |
| Research, competitor analysis, and open discovery | Research brief |
| Targets, KPIs, and measurement plans | Product strategy or analytics documentation |
| Operational procedures and incident recovery | Runbook |
| Visual tokens and interface rules | `DESIGN.md` |
| Persuasive positioning and campaign copy | Product-marketing context or marketing surfaces |

## Writing Rules

- Lead with what the user gets. Connect each capability to its use or outcome.
- Use active voice, concrete nouns, direct verbs, and one term per product concept.
- Write current capabilities in the present tense and future ideas as future.
- Include technical detail only when users notice it or it changes privacy, trust, availability, reliability, or a product boundary.
- Treat unsupported behavior as unknown, not as a requirement or reasonable assumption.
- Keep paragraphs to one or two sentences. Turn three or more peer facts into a list or table.
- Use the smallest complete document. Most product overviews need roughly 500–1,500 words; a narrow product may need less.

## Resynchronizing an Existing File

Preserve accurate product language and meaningful distinctions. Re-evidence current claims, remove contradicted behavior, move explicit future work out of current scope, update the review date, and report unresolved source conflicts.

## Example: Mixed Current and Future Brief

Source: “Nudge records or imports audio, transcribes it on device, extracts tasks, and lets users edit or delete them. Calendar sync, reminders, sharing, and Android are ideas for later.”

```markdown
# Nudge

Nudge is an iOS app that turns spoken notes into an editable action list. Written for a new teammate or LLM. Last reviewed: YYYY-MM-DD.

## What it is

Nudge converts recorded or imported audio into proposed tasks that the user controls.

## Who it's for

Nudge is for people who capture ideas or obligations by voice and want clear next actions.

## How it works

1. Record a voice note or import audio.
2. Nudge transcribes the audio and extracts proposed tasks.
3. Review the list, then edit or delete tasks.

## What it does today

- Records or imports audio
- Transcribes speech on device
- Extracts, edits, and deletes proposed tasks

## Considering

These named ideas are candidates, not current capabilities or commitments:

- Calendar sync
- Reminders
- Team sharing
- Android
```

The brief does not establish saved history, task completion, analytics, accounts, cloud sync, or data retention, so those claims stay out of the file and are reported as unknown after writing.

## Final Check

- Every required contract row is present and easy to locate.
- Every current-tense claim has current evidence.
- Current, planned, and unknown behavior cannot be confused.
- Conditional sections meet their stated predicate.
- Adjacent technical, planning, research, metrics, and marketing content remains in its canonical document.
- The review date and reported file path are accurate.
