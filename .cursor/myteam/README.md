# myteam — custom harness

A lightweight agentic harness for this repo, **inspired by**:

- **Ralph** (`prd.json` loop + append-only `progress.txt` + branch-based archiving + `<promise>COMPLETE</promise>` stop signal)
- **OpenSpec** (`.cursor/commands/*.md` + `.cursor/skills/<name>/SKILL.md` conventions, and a propose → run → archive mental model)

It reuses the agent definitions already in `.cursor/agents/*.md` and `.cursor/rules/*.mdc` — it does **not** redefine roles.

## Commands

| Command | What it does |
|---|---|
| `/myteam-init` | Scaffold / repair this `.cursor/myteam/` state tree. |
| `/myteam-run` | **product-manager** + the `prd` skill generate a `prd.json` (with per-story agent assignments + parallel counts), then the harness loop implements the stories. |
| `/myteam-archive` | Move a completed/superseded PRD (its `prd.json` + `progress.txt`) to `prds/archive/YYYY-MM-DD-<name>/`. |

## Flow

```
/myteam-init      → scaffold state (once per repo)
       │
/myteam-run       → product-manager (prd skill) writes prds/current/<prd>/prd.json
       │            then myteam-harness loop:
       │              pick highest-priority story with passes:false
       │              → spawn its assigned agents (up to count/parallelism)
       │              → quality gates → commit → set passes:true
       │              → append learnings to progress.txt
       │            ...repeat until all stories pass → <promise>COMPLETE</promise>
       │
/myteam-archive   → prds/archive/YYYY-MM-DD-<prd>/
```

## Layout

```
.cursor/myteam/
  config.yaml        shared context + agent registry + defaults
  README.md          this file
  AGENT.md           harness-level agent guidance (the loop strategy)
  prds/              prd.json.example + current/ + archive/

.cursor/rules/workspace/   big-picture map of the repo + per-part _<part>/ dirs (filled at onboarding)
```

The merged execution strategy lives in `.cursor/skills/myteam-harness/SKILL.md` and is summarized in `AGENT.md`.
