---
name: vercel-agent-evals
description: Build and run end-to-end agent evals with Harbor on Vercel Sandbox and AI Gateway, measuring whether agents (Claude Code, Codex) complete real user tasks with your CLI, API, MCP server or SDK. Use when asked to eval, benchmark or A/B test agent success on a product; to compare models, prompts or skills; to write Harbor tasks, verifiers or job.yaml; or to analyze agent trajectories and pass rates.
---

# Vercel agent evals

An **eval** is a test you run many times and score: not "did it work?" but "how often, and how well?" This skill builds an **E2E eval**: the agent works through a whole task in a sandbox, then a verifier checks the final state against the user's requirements. Source: [Agents are users, so your software needs evals](https://vercel.com/blog/agent-evals) (Vercel, 2026-11-16).

Pick the lowest **pyramid** tier that catches the problem: deterministic test (0 LLM calls: does the software behave?), one-turn eval (1 call: right command and arguments?), E2E eval (2+ calls: right outcome?). A wrong outcome built from individually reasonable steps only shows at the E2E tier. If a lower tier catches the problem, write that instead and stop here.

## Vocabulary

- **Task**: one problem with a fixed starting environment and a verifier.
- **Variant**: the agent setup under test (harness, model, prompt, tools, skills).
- **Trial**: one variant's attempt at one task. **Run** (Harbor *job*): every variant × every task × n attempts.
- **Trace** (Harbor *trajectory*): everything recorded in a trial.
- **Funnel**: agents reach *Success* only after *Discovery*, *Selection* and *Access*. This eval measures *Success*; a failure from an earlier stage is a different problem, so label it as such.

## Steps

Run them in order. Each ends on its completion criterion.

### 1. Goal

Explore the repo, then ask the user which user task and failure mode matter most. Look for evidence in three places: observability (which agents use the product, where they fail), customers (support tickets, churn), roadmap (hypotheses to validate).

**Done when** the user has approved one goal table: goal (one measurable outcome), agents, in scope, out of scope, done-when bar.

### 2. Metrics

Choose the lead metric from what a failure costs the user:

| Failure cost | Lead with |
| --- | --- |
| Irreversible or paid for (orders, payments, deploys) | **pass^k**: chance all k trials pass, p^k |
| Cheap retry with feedback (coding agent with tests) | **pass@k**: chance at least one passes, 1 − (1 − p)^k |
| User reviews before it matters (drafts) | success rate |

Also track steps, time and cost **on successful trials only** (failures are short because they skip work), plus cost per success including failed trials. Compute metrics **per task** first, then average across tasks with equal weight; an overall average hides a task that fails often. With 5 trials, 100% means "no failures seen yet."

**Done when** the lead metric and its reason are written down.

### 3. Tasks

Write 3–5 Harbor tasks in `tasks/`: the common case, edge cases that trip agents, and one **impossible request** where the right move is to tell the user and place nothing. Follow [`references/harbor-task.md`](references/harbor-task.md) for the folder layout, verifier and solution.

**Done when** every task has an instruction, environment, verifier and known-good solution, and each solution scores `reward: 1` while a no-op scores `reward: 0`.

### 4. Run

Ask the user which Vercel team and project to use before creating anything. Then follow [`references/vercel-run.md`](references/vercel-run.md): write `job.yaml`, smoke test (solutions, then one trial of one variant), propose the full run with trial count, estimated cost from the smoke test and time, and wait for the user's go-ahead.

**Done when** the approved full run has finished and `jobs/<job_name>/result.json` exists.

### 5. Analyze

Scores say how often agents fail; traces say why. Follow [`references/analyze.md`](references/analyze.md).

**Done when** the report has a per-task × per-variant table, every failed trial's root cause grouped with evidence (trial id plus the trajectory step), misleading passes flagged, and exactly one proposed fix to rerun against this baseline.

## Iterate

Apply the fix the traces point to, rerun the same job, and compare with the baseline: did targeted failures drop without new ones? Keep the eval for regressions on every release and for testing prompt, skill and model changes. When every variant passes every task, the eval has **saturated**: it still catches regressions, but add harder tasks to learn what to improve next.
