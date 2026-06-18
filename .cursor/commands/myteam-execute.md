---
name: /myteam-execute
id: myteam-execute
category: Myteam
description: Product-manager generates a prd.json (with agent assignments), then the execute loop implements it
---

This command has steps to **execute** the `prd.json > userStories` in a loop.

**Input**: the argument after `/myteam-execute` is a feature description, OR an existing PRD name
under `prds/current/` to resume.

**Steps**

0. **Guard — require scaffolding (hard stop).** Before anything else, check the execute
scaffold exists: `.cursor/myteam/config.yaml` and `.cursor/myteam/prds/current/prd.json` and include userStories property. 
If either is missing, STOP and do not generate or execute a PRD:
> Stop. The execute isn't initialized. Run `/myteam-plan` first (and `/myteam-onboard` before that if
> you haven't), then re-run `/myteam-execute`.
Only continue to Phase 1 when the scaffold is present. (`/myteam-plan` itself requires onboarding, so
this transitively guarantees the repo was onboarded.)

1. Load the **`myteam-execute`** skill (`.cursor/skills/myteam-execute/SKILL.md`) and run the loop.
2. Repeat until every story passes, then emit `<promise>COMPLETE</promise>`.

**Output**: the PRD location, per-story status, and the stop signal when complete.
Suggest `/myteam-archive` once the PRD is done.

**Guardrails**
