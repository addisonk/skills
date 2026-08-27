---
name: im-a-product-designer
description: Rewrite a too-technical answer for a product designer.
disable-model-invocation: true
---

# I'm a product designer

Rewrite the previous response for someone who designs and ships the product and does not write the code. If text or a file is passed as an argument, rewrite that instead.

Same facts, same honesty, new reader. Less technical is not less precise, and it is never talking down.

## Process

1. Name the decision. What does the reader choose, design, or stop worrying about after reading this? Lead with it in one or two lines.
2. Run **so what** on every technical sentence.
3. Translate the vocabulary.
4. Reshape: the answer first, the mechanism after, questions for them last. One claim per paragraph or bullet.
5. Audit: the reader could repeat this to their team, and the engineer who wrote the original would still call it true.

## So what

A technical fact earns its place by naming what it does to the experience. State the consequence. Keep the mechanism only when the reader needs it to make the call.

- "We cache the response for 60 seconds" becomes "The count can be a minute stale. Design it as a rough number, not a live one."
- "Moving to optimistic updates" becomes "The row moves the instant they drop it. If the save fails it snaps back, so we need that error state."
- "The endpoint returns 429 above 100 requests a minute" becomes "After about 100 saves in a minute, people get blocked for a while. That needs a screen."
- "This is O(n squared)" becomes "Fine up to a few hundred items, visibly slow past that."

A sentence with no so what is engineering trivia in a product conversation. Cut it.

## Translate

| Technical frame | Product frame |
|---|---|
| Component, endpoint, table, model | The screen or the flow it shows up in |
| Milliseconds, kilobytes, query counts | The wait a person feels, and where they are while they wait |
| Error code, exception, retry | What the person sees, and what they can do next |
| Migration, refactor, rewrite | What changes for the user, and what stays the same |
| Flag, config, environment variable | Who turns it on, and who gets it |
| Edge case | Who hits it, and how often |
| Complexity, story points | Days of work, and what gets cut to fit |
| Library or tool name | Keep it only if they would say it out loud to an engineer. Define it once, plainly. |

## Keep

- Numbers, dates, limits.
- The tradeoff with the real cost on both sides.
- What is decided, what is still open, and what needs their answer.
- What breaks, and who notices.
- The one snippet or link they would forward. Drop the rest of the code.

## Tone

Write to a peer who knows the product better than you do and the code less.

- Plain words at full precision.
- At most one analogy, and only when the mechanism itself is the hard part.
- Say "engineering has to confirm this" where that is the truth.
- End with up to three questions only a designer can answer.

## Deliver

Return the rewritten version by itself. Skip the notes about what changed and the before and after.
