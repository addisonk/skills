# Set up disk cleanup on a machine

Use this process when the user requests setup, recurring cleanup, or a change to
an existing cleanup schedule. Like a repository setup skill, explore the current
state first, resolve only missing choices, then write and verify a small local
configuration. Setup itself does not authorize unrelated cleanup or a schedule.

## 1. Discover

Identify the host, OS, account, target volume, available space, and installed agent
apps/tooling. Read machine and repository instructions. Locate current cleanup
schedules through the scheduler's supported interface and configuration readback;
identify their execution host and owning chat. Discover actual storage roots,
ownership interfaces, native cleanup settings, media receipts, and simulator
coordination. Record unsupported or unavailable interfaces as blockers.

Completion: a short inventory distinguishes verified paths/settings from unknowns
and identifies an existing schedule to reuse, if present.

## 2. Resolve missing choices

Use the user's existing authorization and preferences. Summarize the discovered
scope, protections, cadence, and record location. Ask only for a material missing
choice: ambiguous execution host, additional protected output, or whether the user
wants recurring cleanup when they requested only a one-time run. Skip questions
already answered by the task. Present concrete settings before requesting any
necessary approval.

Default recurring name: **Safe disk cleanup every 30 minutes**. Default cadence:
every 30 minutes, only when recurring cleanup is authorized. Keep an existing
cadence or notification policy unless the user requested a change.

Done when the host, scope, cadence, and record location are known.

## 3. Save machine configuration

Use a private, owner-only location outside project source, for example
`~/.config/disk-cleanup/`. Discover and update an existing cleanup configuration
instead of introducing a competing one. Keep a small Markdown configuration with:

- Physical host, account, OS, volume, and supported measurement commands.
- Installed skill path; storage roots and supported ownership/lifecycle tools.
- Protected project outputs, media delivery/worker receipts, recovery locations.
- Cache age (default seven days), simulator retention (default over 60 days),
  backup byte limit and required free-space reserve, and alert thresholds.
- Existing schedule ID, host, owning chat, cadence, and notification policy.
- Private record location, last baseline, and known unresolved blockers.

Set a bounded backup limit and free-space reserve based on current headroom;
record them before retirement. If required backups exceed either limit, preserve
the checkout. Keep all prior recovery folders and receipts.

Completion: the saved configuration contains metadata only, is owner-readable/
writable, and can be read by the scheduler on this physical host.

## 4. Install and connect the schedule

Install from the public repository using the skills CLI:

```sh
npx skills add addisonk/skills --skill disk-cleanup --global
```

Use the environment's normal skill installation mechanism if different. Verify
the actual installed SKILL.md and its sibling references are readable on each
machine. An installation on one Mac is not an installation on another. Respect
agent skill allowlists instead of exposing an entire library incidentally.

Use the scheduler's supported create/update action. Update a matching existing
schedule in place; create one only when authorized and none exists. Preserve its
execution host, owning chat, status, cadence, and notification settings unless
explicitly changing them. A remote schedule must be updated on its actual host;
an unverified controller-side card is not proof of success.

Use a short scheduled prompt that loads the installed skill at run time:

> On this machine, read the installed disk-cleanup SKILL.md and its required
> references, then follow its run checklist using the existing private machine
> configuration at [verified absolute path]. Continue the compact cleanup record
> across runs. Autonomously clean only verified disposable candidates; preserve
> protected work and skip uncertainty. Keep this single schedule and its existing
> cadence. Report meaningful results using this scheduler's notification format.
> If the skill or configuration is unavailable, report the blocker and skip
> deletion.

Replace the placeholder and include the verified absolute SKILL.md path so the
scheduler does not rely on discovery alone. Keep safety rules in the skill;
machine configuration holds exceptions and the prompt holds invocation.

Done when the installed skill resolves its references and the intended schedule
has been saved with the verified local paths.

## 5. Verify and maintain

Read back persisted schedule name, prompt, cadence, host, target, and status.
Confirm exactly one matching schedule exists. Verify installed references and
configuration paths from the execution host. Report the schedule ID and any
blocker. Run cleanup only when separately authorized by the task or scheduled run.

To update behavior later, edit this public skill and publish it through the repo's
normal workflow, then update the installed skill on **each** machine. Verify the
installed content/revision before claiming rollout. Scheduled prompts keep their
stable skill pointer; they do not download or execute new remote code on every
run. Machine-specific protections remain in the private configuration. Re-run
setup when storage roots, execution host, or scheduler settings change.

Done when the execution host confirms the installed revision, local paths, and
persisted schedule, or the report names the blocking check.
