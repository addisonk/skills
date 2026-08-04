---
name: product-md
description: Use when a repository needs a new, updated, audited, or resynchronized PRODUCT.md; when a teammate or LLM needs a current user-facing product explanation; or when product docs mix shipped behavior with plans, implementation detail, or marketing claims.
---

# ProductMd

Create the smallest evidence-bounded explanation of the product people can use today. A new teammate or LLM should understand the promise, audience, core loop, capabilities, and boundaries without reading the codebase.

## Workflow

1. **Set the contract.** Read repository instructions and the existing `PRODUCT.md`, if present. Use the repository root unless the project already keeps product docs elsewhere. The reader is a new teammate or LLM; the result is product understanding, not implementation instructions.
2. **Gather current evidence.** Read the README, product or marketing context, user-facing routes and copy, primary flows, tests, schemas, and recent product decisions. Inspect runtime code when documents disagree about what users can do.
3. **Build an evidence ledger in working notes.** For every material claim, record its source and status: `current`, `planned`, or `unknown`. Current UI and runtime behavior outrank stale plans. Keep marketing claims as positioning until the product proves them. Do not put the ledger in `PRODUCT.md` unless the user asks.
4. **Choose the document mode.** For a working product, describe demonstrated current behavior. For a brief or prototype, describe only supplied commitments and demonstrated capabilities; put named ideas in an optional `Considering` section. If a central claim remains unknown and would change the product story, ask. Otherwise omit it and report the uncertainty after writing.
5. **Draft to the contract below.** Use the smallest set of sections that fully explains the product. Prefer product nouns and user-visible behavior over file names, services, schemas, or architecture.
6. **Verify and report.** Recheck every current-tense claim against the ledger. Report the file path, material facts added or changed, and unresolved conflicts.

## PRODUCT.md Contract

Start with:

```markdown
# Product name

A user-facing description of what the product is and what people can use today. Written for a new teammate or LLM. Last reviewed: YYYY-MM-DD.
```

Use these sections when the evidence supports them:

| Section | Job |
|---|---|
| `What it is` | State the category, promise, and important distinction in concrete language. |
| `Who it's for` | Name the primary users, their situation, and the outcome they seek. |
| `Core loop` or `How it works` | Walk through the main experience from the user's point of view. |
| `Features` or `What it does` | Group current user-visible capabilities by product concept. |
| `What it doesn't do today` | Protect boundaries and correct likely assumptions. |
| `Glossary` | Define product nouns that code, UI, or teammates could use inconsistently. |

Optional sections earn their place through evidence: current status or distribution, reliability behavior users notice, product principles, a source/catalog note, or `Considering` for explicitly named future ideas. Give each future claim one home: use `What it doesn't do today` to correct a likely false assumption, or `Considering` to record a candidate idea, without repeating it in both.

The file is a product overview. Requirements, technical architecture, data models, launch plans, research, success metrics, and detailed roadmaps belong in separate documents unless the user explicitly asks for a combined brief.

## Writing Rules

- Lead with what the user gets. Connect each feature to its use or outcome.
- Use active voice, concrete nouns, direct verbs, and one term per product concept.
- Write current capabilities in the present tense. Label future ideas as future; never blend them into current scope.
- Include technical detail only when users notice it or it changes privacy, trust, availability, reliability, or a product boundary.
- Make uncertainty visible. Prefer “not established by the repository” to a confident guess.
- Keep paragraphs to one or two sentences. Turn three or more peer facts into a list or table.
- Use the smallest complete document. Most product overviews need roughly 500–1,500 words; a narrow product may need less.

## Resynchronizing an Existing File

Preserve accurate product language, useful custom sections, and meaningful distinctions. Re-evidence current-tense claims, remove contradicted behavior, move explicit future work out of current scope, update the review date, and report unresolved source conflicts. Standardize headings only when doing so makes the product easier to understand.

## Example: Mixed Current and Future Brief

Source: “Nudge records or imports audio, transcribes it on device, extracts tasks, and lets users edit or delete them. Calendar sync, reminders, sharing, and Android are ideas for later.”

```markdown
# Nudge

Nudge is an iOS app that turns spoken notes into an editable action list.

## How it works

1. Record a voice note or import audio.
2. Nudge transcribes the audio and extracts proposed tasks.
3. Review the list, then edit or delete tasks.

## What it doesn't do today

- Calendar sync
- Reminders
- Team sharing
- Android
```

This brief does not establish saved history, task completion, analytics, accounts, cloud sync, or data-retention behavior, so the product document does not invent them.

## Common Mistakes

| Mistake | Correction |
|---|---|
| Turning the file into a PRD | Return to the product promise, user, loop, current capabilities, and boundaries. |
| Listing the stack | Translate implementation into user-visible behavior or omit it. |
| Treating plans as shipped | Move explicit ideas to `Considering` or `What it doesn't do today`. |
| Repeating marketing copy as fact | Verify the claim or present it only as positioning. |
| Replacing a useful existing structure | Preserve it and repair stale claims locally. |

## Final Check

- Every current-tense claim has current evidence.
- The opening explains the product before implementation details appear.
- The primary user and core loop are explicit.
- Current, planned, and unknown behavior cannot be confused.
- Product nouns are consistent and defined where needed.
- No dense paragraph hides a sequence, comparison, or boundary.
- The review date and reported file path are accurate.
