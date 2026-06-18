---
name: /myteam-archive
id: myteam-archive
category: Harness
description: Archive a completed or superseded PRD to prds/archive/YYYY-MM-DD-<name>/
---

Archive a PRD with the **myteam** harness.

**Input**: the argument after `/myteam-archive` is the PRD name under `prds/current/`.
If omitted and exactly one PRD is in `current/`, use it; otherwise ask which one.

**Steps**

1. Select the PRD dir under `prds/current/<name>/`.
2. Check completion: read `prd.json` and report how many stories have `passes: true`.
   - If some stories are still `false`, warn and ask whether to archive anyway (superseded/abandoned)
     or stop.
3. Move the whole dir to `prds/archive/<YYYY-MM-DD>-<name>/` (date = today), keeping `prd.json`
   and `progress.txt` together.
4. Promote any durable, general learnings from the PRD's `progress.txt` into
   `.cursor/rules/workspace/AGENT.md` (or the relevant `.cursor/rules/workspace/_<part>/AGENT.md`) before archiving.
5. Print the archive path and a one-line summary (stories passed / total, branch).

**Guardrails**
- Never delete PRD content — only move it.
- Do not archive the `_example-prd/` template.
- Use today's date for the prefix; do not overwrite an existing archive dir of the same name
  (append a numeric suffix if it already exists).
