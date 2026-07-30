---
name: simple-copy
description: Write or tighten product copy so people understand it quickly. Use for UI text, titles, headings, labels, descriptions, helper text, buttons, empty states, errors, settings, reports, and internal product language that feels long, vague, repetitive, or hard to scan. Preserve the product's meaning, domain nouns, hierarchy, and voice. Do not use for sales, advertising, or conversion copy.
---

# Simple Copy

Write product copy as part of the interface. Help the reader recognize what something is, understand why it matters, or know what to do next—with no extra language.

Short is not the goal. Fast understanding is.

## Principles

1. **Give each string one job.** A title identifies. A description clarifies. A button acts. Do not make one field carry all three.
2. **Use less, but keep the meaning.** Remove words before adding them. Keep necessary distinctions, constraints, and domain nouns.
3. **Make it self-explanatory.** Use active voice, positive phrasing, concrete nouns, and direct verbs. Keep related words together. Copy should reduce the need for instructions.
4. **Stay unobtrusive and honest.** Do not add hype, personality, urgency, benefits, or certainty the source does not support.
5. **Protect the hierarchy.** Do not repeat the title in the description or turn an eyebrow into a second headline.

## Workflow

### 1. Find the job

Identify the reader, their current moment, and the one thing this copy must help them understand or do. Read adjacent interface or document copy when available.

If the intended meaning or action is genuinely unknowable, ask one short question. Otherwise infer it from context and proceed.

### 2. Question the text

Before rewriting, ask:

- Does this string need to exist?
- Is another nearby string already saying it?
- Is it explaining the product, or exposing the team's internal thinking?
- What would the reader misunderstand if it were removed?

Delete redundant copy. Do not solve every copy problem by writing more.

### 3. Draft three ways internally

Draft a shortest version, a clearest version, and a most natural version. Choose the shortest one that preserves the full meaning and sounds human.

Return one recommendation. Show up to two alternatives only when they express a real product or tone tradeoff, or when the user asks.

### 4. Check the result

- **Scan:** Can a new reader grasp it on the first pass?
- **Deletion:** Can any word disappear without changing meaning?
- **Overlap:** Do the title, description, and action each add something new?
- **Expectation:** Does the copy accurately predict what the product will do?
- **Force:** Is the sentence active, positive, specific, and direct?

## Copy shapes

### Eyebrow

Name the category, not the message.

- One or two words; usually no more than 24 characters.
- No subtitles, project names, or punctuation-linked phrases.
- Put the subject in the title and context in the description.

```text
Bad:  Target operating model · Alignment artifact
Good: Architecture
```

### Title

Name the thing, state, or outcome.

- Prefer one to seven words.
- Use one idea and front-load the distinguishing words.
- Do not stuff a title and subtitle into one line.

```text
Bad:  Manage notification preferences for your account
Good: Notifications
```

### Description

Answer the most important question the title leaves open.

- Use one short sentence; use two only when the second prevents a real misunderstanding.
- Usually stay under 24 words.
- Do not restate the title, announce the section, or narrate process.

```text
Title: Notifications
Bad:   Manage your notification preferences and choose your notification settings.
Good:  Choose which updates you receive.
```

### Label

Use the familiar noun a reader expects. Prefer one to three words. Do not explain behavior inside a label.

### Button

State the action or result with a direct verb, usually in two to four words. Use `Save changes`, not `Submit`; `Create report`, not `Continue`, when the result is known.

### Helper text

Give the constraint or format the reader needs before acting. Do not describe the field again.

### Error

Say what happened and what the reader can do next. Be specific, calm, and blame-free.

```text
Bad:  An unexpected error has occurred while attempting to save your changes.
Good: Couldn't save changes. Try again.
```

### Empty state

Name the state, then offer one useful next action. Do not add cheerleading or a product pitch.

```text
No reports yet.
Create your first report.
```

## What to cut

- Preambles such as “This section allows you to” or “Here you can.”
- Repeated nouns, synonyms, and title-description echo.
- Weak qualifiers and filler: `very`, `really`, `just`, `actually`, `in order to`.
- Corporate verbs when plain ones work: `utilize`, `leverage`, `facilitate`, `enable`.
- Empty product adjectives: `powerful`, `seamless`, `robust`, `innovative`, `intuitive`.
- Internal framing: `target operating model`, `alignment artifact`, `strategic initiative`, unless those are established product terms the reader needs.

## What to preserve

- Precise product and domain nouns.
- Differences between similar concepts.
- Safety, legal, accessibility, and technical constraints.
- Specific evidence and honest uncertainty.
- The author's established voice when it does not reduce clarity.

Do not invent claims, benefits, proof, urgency, or emotional stakes. Do not replace precise language with generic simplicity.

## Scope

Edit only the requested copy. Preserve the existing field count and hierarchy unless the hierarchy itself causes the confusion. Do not turn a title request into a page rewrite or silently rewrite adjacent product decisions.

This skill is for product understanding. Use a marketing copy skill when the goal is persuasion, conversion, campaign messaging, or sales.

## Output

Lead with the recommended copy exactly as it should appear. Skip preamble and long rationale.

For one string:

```text
Recommended
Notifications
```

For several strings, preserve their labels:

```text
Eyebrow
Architecture

Title
Full Trigger-native Newsroom

Description
One Newsroom owns the path from source posts to publication. Specialists keep Digg's domain nouns and output contracts precise.
```

Add one short `Why` note only when the edit changes meaning, removes a meaningful claim, or depends on an assumption the user should review.
