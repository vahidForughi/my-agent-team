---
name: /myteam-run
id: myteam-run
category: Harness
description: Drive the whole backlog-tasks CSV to done — one task at a time via /myteam-task, /myteam-do, /myteam-archive
---

Run the backlog: repeatedly pick the top‑priority `todo` task from the backlog CSV and take it all
the way to `done` using the harness commands, updating the CSV status at each step — until every
task is `done`.

**Input**: optional path to the backlog CSV. Default: `.cursor/myteam/backlog-tasks.csv`.

The CSV has columns: `id, title, description, priority, status`.
- `priority`: integer, **lower = higher priority** (1 is top).
- `status`: one of `todo`, `inprogress`, `done`.

**Steps**

0. **Scaffold once.** Run `/myteam-task` to ensure the harness state tree exists/repairs. Read the CSV.

1. **Pick the next task.** Among rows with `status == todo`, choose the one with the **lowest
   `priority`** number. Tie‑break by `id` ascending. If there are **no `todo` rows**, go to **Done**.

2. **Mark in progress.** Set that row's `status` to `inprogress` and save the CSV immediately
   (one row changed; preserve all other rows, columns, and quoting).

3. **Plan + execute the task — in a fresh session.** Run `/myteam-do` with the task's `title` +
   `description` as the feature input, in its **own fresh-context session/subagent** so one task's
   work never piles into the next. Let it generate `prds/current/<feature-kebab>/prd.json` (use the
   backlog `id` in the PRD `description`/`prdId` for traceability) and run the execution loop until it
   emits `<promise>COMPLETE</promise>`. Back in the runner, keep only the CSV status and a **one-line
   summary** of the task — not the task's full transcript.

4. **Archive.** Once the PRD is complete, run `/myteam-archive <feature-kebab>` to move it to
   `prds/archive/YYYY-MM-DD-<feature-kebab>/`.

5. **Mark done.** Set the backlog row's `status` to `done` and save the CSV. Report: backlog `id`,
   PRD archived path, stories passed.

6. **Loop.** Go back to step 1 for the next top‑priority `todo`.

**Done**

When no `todo` rows remain, print a summary (counts of `done` / total, and any rows left
`inprogress`) and emit `<promise>COMPLETE</promise>`.

**Guardrails**
- Update the CSV **one row at a time**: `inprogress` before work, `done` only after the PRD is
  archived. Never rewrite or drop other rows; keep the header and field quoting intact.
- If a task blocks or its quality gates fail, **leave it `inprogress`**, report the blocker, and
  stop (do not advance to the next task).
- Do not touch rows already `done`.
- Skip the `_[name-part]` / `_example-prd` templates — they are not backlog tasks.
- Run each task in a **fresh-context session**; the runner carries only CSV status + a one-line
  per-task summary across iterations, never accumulated task transcripts.
