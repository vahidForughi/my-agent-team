# myteam — custom harness (Claude Code)

A lightweight agentic harness for this repo, **inspired by**:

- (`prd.json` loop + append-only `progress.txt` + branch-based archiving + `<promise>COMPLETE</promise>` stop signal)
- (`.claude/commands/*.md` + `.claude/skills/<name>/SKILL.md` conventions, and a propose → run → archive mental model)

It reuses the agent definitions in `.claude/agents/*.md` (spawned as fresh-context subagents via the
Agent tool with `subagent_type: "<role>"`) — it does **not** redefine roles. This is the Claude Code
port of the Cursor harness under `.cursor/myteam/`.

## Commands

| Command | What it does |
|---|---|
| `/myteam-onboard` | Research the repo and fill nested `CLAUDE.md` docs (one per part, in its real repo dir) + a top-level map. |
| `/myteam-task` | Turn one backlog task into an implementation-ready `prd.json` (planning only; no code). |
| `/myteam-do` | **product-manager** + the `prd` skill generate a `prd.json` (with per-story agent assignments + parallel counts), then the harness loop implements the stories. |
| `/myteam-archive` | Move a completed/superseded PRD (its `prd.json` + `progress.txt`) to `prds/archive/YYYY-MM-DD-<name>/`. |
| `/myteam-run` | Drive the whole `backlog-tasks.csv` to done — pick the top‑priority `todo` task, run task → do → archive, update its status, and loop until all tasks are `done`. |

## Flow

```
/myteam-onboard   → fill nested CLAUDE.md docs across the repo (once per repo; re-runnable)
       │
/myteam-task      → decompose a backlog task into prds/current/<task>/prd.json (planning only)
       │
/myteam-do        → product-manager (prd skill) writes prds/current/<prd>/prd.json
       │            then myteam-harness loop (one fresh-context subagent per story):
       │              pick highest-priority story with passes:false
       │              → spawn its assigned agents via the Agent tool (up to count/parallelism, default 1)
       │              → quality gates → commit → set passes:true
       │              → append learnings to progress.txt
       │            ...repeat until all stories pass → <promise>COMPLETE</promise>
       │
/myteam-archive   → prds/archive/YYYY-MM-DD-<prd>/

/myteam-run       → backlog runner: for each top‑priority todo in backlog-tasks.csv,
                    set inprogress → /myteam-task → /myteam-do → /myteam-archive → set done; loop until all done
```

## Layout

```
.claude/myteam/
  config.yaml        shared context + agent registry + defaults
  README.md          this file
  AGENT.md           harness-level agent guidance (the loop strategy)
  backlog-tasks.csv  backlog driven by /myteam-run (id,title,description,priority,status)
  prds/              prd.json.example + current/ + archive/

.claude/rules/workspace/   top-level repo map + .onboarded marker (filled at onboarding)
<repo>/**/CLAUDE.md         per-part onboarding docs, auto-loaded by Claude Code
```

The merged execution strategy lives in `.claude/skills/myteam-harness/SKILL.md` and is summarized in `AGENT.md`.
