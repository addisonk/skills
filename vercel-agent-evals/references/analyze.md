# Analyze traces

A run leaves one folder per trial:

```text
jobs/<job_name>/
├── result.json                 # across all variants and tasks
└── <task>__<suffix>/
    ├── config.json             # agent, model, task
    ├── result.json             # trial scores, cost, timing
    ├── trial.log               # runner logs, for broken trials
    ├── agent/trajectory.json   # what the agent saw, said and did
    ├── verifier/reward.json    # per-constraint scores
    ├── verifier/test-stdout.txt
    └── artifacts/…             # files saved by task.toml
```

`harbor view jobs` browses them.

## Report

1. **Table**: per variant, success rate and the lead metric computed per task, then averaged with each task weighted equally; plus average steps on successful trials and cost per success including failed trials. Also show the per-task breakdown.
2. **Failures**: for each failed trial, read `verifier/reward.json` for the broken constraint, the artifact for the actual state, then `agent/trajectory.json` for the step where it went wrong. Compare against a passing trial of the same variant and task. Group failures by root cause ("ordered from the menu price without running `quote`"), each with trial ids and the trajectory step as evidence.
3. **Funnel check**: label failures that are *Discovery* (never found the tool) or *Access* (looked for it as a connected tool instead of the shell) separately; they point at the instruction or the product's docs, not at task success.
4. **Misleading passes**: read a sample of passing trajectories. A pass only means the verifier was satisfied: flag passes reached the wrong way (gave up without searching on the impossible request, edited state directly) and tighten that verifier.
5. **One fix**: propose the single change the strongest root cause points to, product-side when possible (e.g. a `--max-total` flag so `order` refuses anything over budget), to rerun against this baseline.

## Large runs

When reading every trial by hand gets slow, fan out: cheap, fast reader agents each summarize a batch of trajectories in parallel; a stronger coordinator merges the summaries, sends readers back for more context where needed, and writes the report. Keep the coordinator's brief in an `analysis.md` so the workflow repeats across runs.
