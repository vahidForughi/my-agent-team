---
name: /myteam-execute
id: myteam-execute
category: Myteam
description: Product-manager generates a prd.json (with agent assignments), then the execute loop implements it
---

This command steps to **execute** the `prd.json > userStories` in a loop.

Load the **`myteam-execute`** skill (`.cursor/skills/myteam-execute/SKILL.md`) and run the loop.

**Output**: the PRD location, per-story status, and the stop signal when complete.
Suggest `/myteam-archive` once the PRD is done.

**Guardrails**
