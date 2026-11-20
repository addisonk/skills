# Harbor task

[Harbor](https://github.com/harbor-framework/harbor) (from the Terminal-Bench authors) runs agents in containers, verifies results and records trajectories. One task is one folder:

```text
tasks/<task-name>/
├── instruction.md        # the user's request
├── task.toml             # timeouts, verifier mode, artifacts
├── environment/          # Docker build context
│   ├── Dockerfile
│   └── …                 # the tool under test + seed data
├── solution/
│   └── solve.sh          # known-good answer
└── tests/
    ├── test.sh           # the verifier entry point
    └── check_*.py
```

## Instruction

The user's request in their words, plus:

- **Name the tool** ("Use the sfbeans CLI to…"). Otherwise the first run scores 0% because agents never discover it: a *Discovery* failure, not *Success*.
- **State the current time** when the task depends on it, and freeze it only inside the tool (e.g. an env var the CLI reads). The sandbox system clock stays real.

```markdown
Use the sfbeans CLI to get me a large iced latte with whole milk, ready for
pickup by 9:00am today, under $8 including tip. I'm in the Mission.
It's 8:30am now.
```

## Environment

Real tool, seeded data, frozen clock, so every trial starts on the same morning:

```docker
FROM python:3.12-slim
COPY sfbeans /usr/local/bin/sfbeans
COPY cafes.json /opt/sfbeans/cafes.json
ENV SFBEANS_DATA=/opt/sfbeans/cafes.json \
    SFBEANS_ORDERS=/opt/sfbeans/orders.json \
    SFBEANS_NOW="08:30"
```

Agents **reward hack** when it helps them pass (editing inventory, writing `orders.json` directly). Make seed data and verifier code read-only to the agent's user, and make the checked state writable only through the product's own tools (for example, the CLI writes as a separate user or to a path the agent cannot write).

## Verifier

Harbor runs `tests/test.sh` after the agent finishes and reads scores from `/logs/verifier/reward.json`. `reward` is the trial's main score.

```bash
python3 /tests/check_orders.py /opt/sfbeans/orders.json > /logs/verifier/reward.json
```

Score **each constraint separately**, then set `reward` to 1 only if all pass, so a failed trial shows exactly what broke:

```python
import json, os, sys

path = sys.argv[1]
orders = json.load(open(path)) if os.path.exists(path) else []
o = orders[0] if len(orders) == 1 else {}

reward = {
    "one_order": int(len(orders) == 1),
    "right_drink": int(o.get("drink") == "latte" and o.get("size") == "l"
                       and o.get("temp") == "iced" and o.get("milk") == "whole"),
    "on_time": int(o.get("ready_at", "99:99") <= "09:00"),
    "on_budget": int(o.get("total", 99) <= 8.00),
}
reward["reward"] = int(all(reward.values()))
print(json.dumps(reward))
```

**Impossible request**: check that nothing was placed *and* that the agent searched first, by reading a command log the tool writes and the agent cannot. Checking only "no order" turns giving up without looking into a pass.

## Solution

A known-good run that proves the task is solvable. Run it before any agent; it must score `reward: 1`.

```bash
sfbeans quote cafe_val07 --drink drink_lat_l --size l --temp iced --milk whole --tip 15%
sfbeans order cafe_val07 --drink drink_lat_l --size l --temp iced --milk whole --pickup 08:50 --tip 15%
```

## task.toml

```toml
artifacts = ["/opt/sfbeans/orders.json"]   # saved per trial for analysis

[task]
name = "sfbeans/iced-latte-mission"

[agent]
timeout_sec = 600

[verifier]
timeout_sec = 60
environment_mode = "shared"  # verify in the agent's sandbox, where the state lives
```

Harbor's schema moves between versions; confirm keys against `harbor --help` and the repo's docs for the installed version.
