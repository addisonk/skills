# Run on Vercel

Harbor's [Vercel integration](https://vercel.com/kb/guide/run-terminal-bench-harbor-benchmarks-vercel-sandbox) runs trials concurrently, each in its own [Vercel Sandbox](https://vercel.com/docs/sandbox), and caches built task environments. Model calls go through [AI Gateway](https://vercel.com/docs/ai-gateway): one key and one budget across providers.

## job.yaml

Each entry in `agents` is one variant. Check current model ids in the AI Gateway model list before writing them.

```yaml
job_name: sfbeans-baseline
n_attempts: 5            # trials per task, per variant
n_concurrent_trials: 10  # sandboxes at once (Hobby max)

environment:
  type: vercel

agents:
  - name: claude-code
    model_name: anthropic/claude-opus-5.5
    env:
      ANTHROPIC_AUTH_TOKEN: ${VERCEL_OIDC_TOKEN}
      ANTHROPIC_API_KEY: ""
      ANTHROPIC_BASE_URL: https://ai-gateway.vercel.sh/claude-code
  - name: codex
    model_name: openai/gpt-6-astra
    env:
      OPENAI_API_KEY: ${VERCEL_OIDC_TOKEN}
      OPENAI_BASE_URL: https://ai-gateway.vercel.sh/codex/v1

datasets:
  - path: tasks/
```

Gateway setup per harness: [Claude Code](https://vercel.com/docs/ai-gateway/coding-agents/claude-code), [Codex](https://vercel.com/docs/ai-gateway/coding-agents/openai-codex).

## Commands

```bash
uv tool install --python 3.12 'harbor[vercel]==0.24.0' --with 'vercel==0.10.0'  # versions the post tested

vercel login
vercel link       # the team + project the user chose
vercel env pull   # writes VERCEL_OIDC_TOKEN to .env.local (valid 12h)

harbor run -c job.yaml
harbor view jobs
```

## Smoke test, then the full run

1. Run every task's `solution/solve.sh` through Harbor's oracle/solution agent (see `harbor run --help`); each must score `reward: 1`.
2. Run one trial of one variant (`n_attempts: 1`, one agent) to prove the sandbox, gateway auth and verifier work end to end. Read its trajectory.
3. Propose the full run to the user: trials = tasks × variants × attempts, estimated cost = smoke-test cost per trial × trials, estimated time = trials ÷ concurrency × smoke-test duration. Wait for the go-ahead.

## Limits

- Hobby: 10 concurrent sandboxes, 45-minute session cap per trial. Pro: `n_concurrent_trials` up to 10,000. See [Sandbox pricing and limits](https://vercel.com/docs/sandbox/pricing).

## Credentials

Passing the OIDC token as an env var exposes it to the agent; acceptable only for a demo. Beyond that:

- Use short-lived tokens.
- Set [Sandbox firewall](https://vercel.com/docs/sandbox/concepts/firewall) rules through Harbor's Vercel integration so each trial reaches only the hosts it needs, like AI Gateway.
- Use [credentials brokering](https://vercel.com/docs/sandbox/concepts/firewall#credentials-brokering) to attach credentials to outgoing requests, keeping keys out of the agent's environment.
