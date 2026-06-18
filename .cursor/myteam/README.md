# myteam — custom harness

A lightweight agentic harness for this repo, **inspired by**:

- (`prd.json` loop + append-only `progress.txt` + branch-based archiving + `<promise>COMPLETE</promise>` stop signal)
- (`.cursor/commands/*.md` + `.cursor/skills/<name>/SKILL.md` conventions, and a propose → run → archive mental model)

It reuses the agent definitions already in `.cursor/agents/*.md` and `.cursor/rules/*.mdc` — it does **not** redefine roles.

## Commands

| Command | What it does |
|---|---|
| `/myteam-task` | Scaffold / repair this `.cursor/myteam/` state tree. |
| `/myteam-do` | **product-manager** + the `prd` skill generate a `prd.json` (with per-story agent assignments + parallel counts), then the harness loop implements the stories. |
| `/myteam-archive` | Move a completed/superseded PRD (its `prd.json` + `progress.txt`) to `prds/archive/YYYY-MM-DD-<name>/`. |
| `/myteam-run` | Drive the whole `backlog-tasks.csv` to done — pick the top‑priority `todo` task, run task → do → archive, update its status, and loop until all tasks are `done`. |

## Flow

```
/myteam-task      → scaffold state (once per repo)
       │
/myteam-do       → product-manager (prd skill) writes prds/current/<prd>/prd.json
       │            then myteam-harness loop:
       │              pick highest-priority story with passes:false
       │              → spawn its assigned agents (up to count/parallelism)
       │              → quality gates → commit → set passes:true
       │              → append learnings to progress.txt
       │            ...repeat until all stories pass → <promise>COMPLETE</promise>
       │
/myteam-archive   → prds/archive/YYYY-MM-DD-<prd>/

/myteam-run       → backlog runner: for each top‑priority todo in backlog-tasks.csv,
                    set inprogress → /myteam-do → /myteam-archive → set done; loop until all done
```

## Layout

```
.cursor/myteam/
  config.yaml        shared context + agent registry + defaults
  README.md          this file
  AGENT.md           harness-level agent guidance (the loop strategy)
  backlog-tasks.csv  backlog driven by /myteam-run (id,title,description,priority,status)
  prds/              prd.json.example + current/ + archive/

.cursor/rules/workspace/   big-picture map of the repo + per-part _<part>/ dirs (filled at onboarding)
```

The merged execution strategy lives in `.cursor/skills/myteam-harness/SKILL.md` and is summarized in `AGENT.md`.
