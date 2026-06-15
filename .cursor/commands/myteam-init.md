---
name: /myteam-init
id: myteam-init
category: Harness
description: Scaffold or repair the .cursor/myteam/ harness state tree for this repo
---

Initialize the **myteam** harness state under `.cursor/myteam/`.

Idempotent: creates anything missing, never clobbers existing content.

**Input**: none (optional: a note about the project to seed `config.yaml > context`).

**Steps**

1. Ensure the state tree exists (create only what is missing):
   ```
   .cursor/myteam/
     config.yaml
     README.md
     AGENT.md
     prds/prd.json.example
     prds/README.md
     prds/current/      (keep with .gitkeep if empty)
     prds/archive/.gitkeep

   .cursor/rules/workspace/
     README.md
     AGENT.md
     _[name-part]/{README.md,AGENT.md,suggest/.gitkeep}
   ```
2. If `config.yaml > context` is still the placeholder, ask the user (AskUserQuestion) for the
   tech stack / conventions and fill it in. Otherwise leave it.
3. Confirm the agent registry in `config.yaml` matches the files in `.cursor/agents/`. Report any drift.
4. Print the resulting tree and the next step: "Run `/myteam-run` to create and execute a PRD."

**Guardrails**
- Never overwrite an existing `prd.json`, `progress.txt`, or a real `workspace/_<part>/` dir.
- Do not delete the `_[name-part]/` or `_example-prd/` templates.
