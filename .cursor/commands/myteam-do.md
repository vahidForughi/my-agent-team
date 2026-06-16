---
name: /myteam-do
id: myteam-do
category: Harness
description: Product-manager generates a prd.json (with agent assignments), then the harness loop implements it
---

Create and execute a PRD with the **myteam** harness.

This command has two phases: **plan** (generate `prd.json`) then **execute** (the merged loop).

**Input**: the argument after `/myteam-do` is a feature description, OR an existing PRD name
under `prds/current/` to resume.

**Step 0 — Guard — require scaffolding (hard stop).** Before anything else, check the harness
scaffold exists: `.cursor/myteam/config.yaml` and `.cursor/myteam/prds/`. If either is missing, STOP
and do not generate or execute a PRD:
> Stop. The harness isn't initialized. Run `/myteam-task` first (and `/myteam-onboard` before that if
> you haven't), then re-run `/myteam-do`.
Only continue to Phase 1 when the scaffold is present. (`/myteam-task` itself requires onboarding, so
this transitively guarantees the repo was onboarded.)

**Phase 1 — Plan (product-manager + `prd` skill)**

1. Adopt the **product-manager** role (`.cursor/agents/product-manager.md`).
2. Load the **`prd`** skill (`.cursor/skills/prd/SKILL.md`). Ask its clarifying questions
   (lettered options) unless the description is already unambiguous.
3. Produce a `prd.json` that follows `prds/prd.json.example`:
   - Stories ordered by `priority` with **no forward dependencies**.
   - Each story sized for one focused session; acceptance criteria verifiable and ending with
     `Typecheck passes`; UI stories include a browser-verify line.
   - **Assign agents per story**: `agents: [{ "role", "count" }]` using roles from
     `.cursor/agents/` (registry in `config.yaml`), plus a `parallelism` cap. Pick roles by the
     work (e.g. backend-architect for services/APIs, frontend-developer for UI,
     api-tester / evidence-collector for verification).
4. Write it to `prds/current/<feature-kebab>/prd.json` and create an empty
   `progress.txt` (seed the `## Codebase Patterns` header). Confirm `branchName` is `myteam/<feature-kebab>`.
5. Show the PRD summary and ask the user to confirm before executing.

**Phase 2 — Execute (myteam-harness loop)**

6. Load the **`myteam-harness`** skill (`.cursor/skills/myteam-harness/SKILL.md`) and run the loop:
   pick the highest-priority story with `passes: false` → read each touched part's
   `.cursor/rules/workspace/_<part>/AGENT.md` and hand it to the agents → spawn its assigned agents
   (up to `count` / `parallelism`) → reconcile → quality gates → commit `feat: [US-id] - [title]` →
   set `passes: true` → append a dated **Learnings** block to the PRD `progress.txt`, promoting
   durable part-specific learnings into that part's `AGENT.md`.
7. Repeat until every story passes, then emit `<promise>COMPLETE</promise>`.

**Output**: the PRD location, per-story status, and the stop signal when complete.
Suggest `/myteam-archive` once the PRD is done.

**Guardrails**
- Do not start implementing during Phase 1 — only produce the `prd.json`.
- One story per iteration in Phase 2; never commit broken code; keep CI green.
