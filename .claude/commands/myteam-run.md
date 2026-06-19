---
description: Drive the whole backlog-tasks CSV to done — one task at a time via /myteam-plan, /myteam-execute, /myteam-archive
argument-hint: [path to backlog CSV] (default .claude/myteam/backlog-tasks.csv)
---

Follow **Steps** to repeatedly pick backlog tasks from the CSV and take it all the way to `done` one by one — until 
every task is `done`.

**Input** (`$ARGUMENTS`): optional path to the backlog CSV. Default: `.claude/myteam/backlog-tasks.csv`.

The CSV has columns: `id, title, description, priority, status`.
- `priority`: integer, **lower = higher priority** (1 is top).
- `status`: one of `todo`, `inprogress`, `done`.

**Steps**

0. Run `/myteam-plan` to ensure the execute state tree exists/repairs.
1. Read the CSV.
2. Pick the next task. Among rows with `status == todo`, choose the one with the lowest
   `priority` number. Tie‑break by `id` ascending. If there are **no `todo` rows**, go to **Done**.
3. Set that row's `status` to `inprogress` and save the CSV immediately
   (one row changed; preserve all other rows, columns, and quoting).
4. Dispatch a product-manager agent with fresh-context to run `/myteam-plan` with the task's `title` + `description` 
   as the feature input. 
5. Run `/myteam-execute` to loop in its own fresh-context subagent and. 
6. Update summary of the task in CSV — not the task's full transcript.
7. Run `/myteam-archive <feature-kebab>` to move it to `prds/archive/YYYY-MM-DD-<feature-kebab>/`.
8. Set the backlog row's `status` to `done` and fill `summary` and save the CSV. Report: backlog `id`,
   PRD archived path, stories passed.
9. Go back to step 1 for the next top‑priority `todo`.

**Done**

When no `todo` rows remain, print a summary (counts of `done` / total, and any rows left
`inprogress`) and emit `<promise>COMPLETE</promise>`.

**Guardrails**
- Update the CSV **one row at a time**: `inprogress` before work, `done` only after the PRD is
  archived. Never rewrite or drop other rows; keep the header and field quoting intact.
- If a task blocks or its quality gates fail, **leave it `inprogress`**, report the blocker, and
  stop (do not advance to the next task).
- Do not touch rows already `done`.
- Skip `_[name-part]` template dirs — they are not backlog tasks.
- Run each task in a **fresh-context subagent**; the runner carries only CSV status + a one-line
  per-task summary across iterations, never accumulated task transcripts.
