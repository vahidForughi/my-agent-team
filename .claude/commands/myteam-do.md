---
description: Product-manager generates a prd.json (with agent assignments), then the harness loop implements it
argument-hint: <feature description> | <existing PRD name under prds/current/>
---

Create and execute a PRD with the **myteam** harness.

This command has two phases: **plan** (generate `prd.json`) then **execute** (the merged loop).

**Input** (`$ARGUMENTS`): a feature description, OR an existing PRD name under `prds/current/` to resume.

**Step 0 — Guard — require scaffolding (hard stop).** Before anything else, check the harness
scaffold exists: `.claude/myteam/config.yaml` and `.claude/myteam/prds/`. If either is missing, STOP
and do not generate or execute a PRD:
> Stop. The harness isn't initialized. Run `/myteam-task` first (and `/myteam-onboard` before that if
> you haven't), then re-run `/myteam-do`.
Only continue to Phase 1 when the scaffold is present. (`/myteam-task` itself requires onboarding, so
this transitively guarantees the repo was onboarded.)

**Phase 1 — Plan (product-manager + `prd` skill)**

1. Spawn the **product-manager** agent (Agent tool, `subagent_type: "product-manager"`) to lead PRD
   authoring.
2. Load the **`prd`** skill (`.claude/skills/prd/SKILL.md`). If `config.yaml > defaults.interactive`
   is `true`, ask its clarifying questions via the **AskUserQuestion** tool unless the description is
   already unambiguous. If `interactive` is `false` (the default), **do not block** — make the most
   reasonable assumption, record it in the PRD `description` / story `notes`, and proceed.
3. Produce a `prd.json` that follows `prds/prd.json.example`:
   - Stories ordered by `priority` with **no forward dependencies**.
   - Each story sized for one focused session; acceptance criteria verifiable and ending with
     `Typecheck passes`; UI stories include a browser-verify line.
   - **Assign agents per story**: `agents: [{ "role", "count" }]` using roles from
     `.claude/agents/` (registry in `config.yaml`), plus a `parallelism` cap. Pick roles by the
     work (e.g. backend-architect for services/APIs, frontend-developer for UI,
     api-tester / evidence-collector for verification). **Default count and parallelism to 1**;
     raise either only for genuinely complex stories with independent sub-work, and say why in `notes`.
   - **Model tier**: leave grunt stories on `config.yaml > defaults.model` (cheaper); set a story's
     optional `model` to a stronger tier only for genuinely hard stories, justified in `notes`.
4. Write it to `prds/current/<feature-kebab>/prd.json` and create an empty
   `progress.txt` (seed the `## Codebase Patterns` header). Confirm `branchName` is `myteam/<feature-kebab>`.
5. Show the PRD summary. If `config.yaml > defaults.interactive` is `true`, ask the user to confirm
   before executing; if `false` (the default), proceed straight to Phase 2 unattended (the summary is
   for the log, not a gate).

**Phase 2 — Execute (myteam-harness loop)**

6. Load the **`myteam-harness`** skill (`.claude/skills/myteam-harness/SKILL.md`) and run the loop,
   **one story per fresh-context subagent** (see the skill's *Context isolation*). For each iteration:
   pick the highest-priority story with `passes: false` → read each touched part's repo-dir `CLAUDE.md`
   and the recent `git log` for its paths → hand the agents a scoped, self-contained brief (not prior
   stories' transcripts) → spawn its assigned agents via the **Agent tool** (`subagent_type` = role,
   up to `count` / `parallelism`, default 1) → reconcile their summaries → quality gates →
   commit `feat: [US-id] - [title]` → set `passes: true` → append a dated **Learnings** block to the
   PRD `progress.txt`, promoting durable part-specific learnings into that part's `CLAUDE.md`. Keep
   only a one-line summary per completed story in the orchestrator's context.
7. Repeat until every story passes, then emit `<promise>COMPLETE</promise>`.

**Output**: the PRD location, per-story status, and the stop signal when complete.
Suggest `/myteam-archive` once the PRD is done.

**Guardrails**
- Do not start implementing during Phase 1 — only produce the `prd.json`.
- One story per iteration in Phase 2; never commit broken code; keep CI green.
