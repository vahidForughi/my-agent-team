---
name: /myteam-plan
id: myteam-plan
category: Myteam
description: Turn a backlog-task description into a prd.json of specific technical tasks (product-manager leads, specialist subagents help). Writes the current PRD only — no scaffolding, no execution, no commits.
---

Turn **one backlog task** into an implementation-ready `prd.json`: decompose it into **specific
technical tasks** (the `userStories`) such that **completing every task means the backlog task is
done** — nothing left implied. This command **only writes the current PRD**; it makes no other
changes (no scaffolding, no code, no branch/commit, no execution — `/myteam-execute` runs it later).

**Input**: the argument after `/myteam-plan` is the **backlog-task description** (free text). It may
come straight from a `backlog-tasks.csv` row (`id` + `title` + `description`).

**Steps**

0. **Guard — require onboarding (hard stop).** Check for `.cursor/myteam/workspace-parts.yaml`. If it
   does **not** exist or is empty, STOP:
   > Stop. This repo hasn't been onboarded yet. Run `/myteam-onboard` first, then re-run `/myteam-plan`.
   Planning needs the workspace part docs to break the task down technically.

1. Adopt the **product-manager** role (`.cursor/agents/product-manager.md`).
2. Load the **`prd`** skill (`.cursor/skills/prd/SKILL.md`). Ask its clarifying questions
   (lettered options) unless the description is already unambiguous.
3. Produce a `prd.json` that follows `prds/prd.json.example`:
   - **Breakdown Task** to grounded and technical use stories in the real architecture (paths, stack, interfaces,
     gotchas). Can use `.cursor/myteam/workspace-parts.yaml` and its relevant contexts:
     `.cursor/skills/workspace/<part-dir>/SKILL.md`, `.cursor/rules/workspace/<part-dir>/<part-name>.md`
     and `./<part-dir>/AGENT.md`. If the task is ambiguous, ask the `prd` skill's clarifying questions (lettered options)
     before decomposing.
   - relate task to the `part` from `.cursor/myteam/workspace-parts.yaml`. Each user story should relate to one part.
   - Stories ordered by `priority` with **no forward dependencies**.
   - Each story sized for one focused session; acceptance criteria verifiable and ending with
     `Typecheck passes`; UI stories include a browser-verify line.
   - **Assign agents per story**: `agents: [{ "role" }]` using roles from
     `.cursor/agents/` (registry in `config.yaml`) and considering `part`. Pick roles by the
     work considering part's category and type, Example:

   | part category                  | default agents |
   |--------------------------------|---|
   | `micro-service`, `api-gateway` | `backend-architect`, `api-tester` |
   | `shared-lib`                   | `backend-architect` |
   | `micro-frontend`, `frontend`   | `frontend-developer`, `evidence-collector` |
   | `infra`, `observability`       | `devops-automator` |
   | `testing`                      | `api-tester`, `evidence-collector` |
   | `automation`, `tools`          | `devops-automator` / `api-tester` |
   | `docs`                         | `code-reviewer` |
   | all                            | `code-reviewer` |

4. Write it to `prds/current/<feature-kebab>/prd.json` and create an empty
   `progress.txt` (seed the `## Codebase Patterns` header). Confirm `branchName` is `myteam/<feature-kebab>`.
5. Show the PRD summary and ask the user to confirm before executing.

6. **Guarantee completeness (the key rule).** The set of technical tasks **must fully cover** the
   backlog task: when every story has `passes: true`, the backlog task is satisfied — no gap, nothing
   unstated. Make this explicit — record the backlog task's done-definition in the PRD `description`
   and ensure the union of all stories' acceptance criteria delivers it. If you can't cover it
   without a gap, add the missing story rather than leaving it implied.

4. **Write the current PRD (only output).** Write
   `.cursor/myteam/prds/current/<task-kebab>/prd.json` matching `prd.json.example` exactly:
   `project`, `prdId` (carry the backlog `id` for traceability), `branchName: myteam/<task-kebab>`,
   `description` (= the backlog task + its done-definition), `defaultParallelism`, and
   `userStories[]` = the technical tasks. Each story must include `part` (from workspace-parts.yaml)
   and `agents[]` (roles derived from that part's category). Seed an empty `progress.txt` next to it
   with the `## Codebase Patterns` header. Validate it is JSON and matches the example. Print the PRD
   path and a one-line task list; suggest `/myteam-execute` to execute it.

**Guardrails**
- Write **only** the current PRD dir (`prd.json` + seeded `progress.txt`). Make **no other changes**
  — no code, no scaffolding, no branch/commit, no execution.
- Every story must map back to the backlog task; the **union of stories = the backlog done-definition**.
- Stories dependency-ordered and right-sized; every story has a valid `part` and `agents[]` (roles
  from the part's category); valid JSON matching `prd.json.example`; `branchName` is `myteam/<task-kebab>`.
- Do not start implementing — this is planning only.
