---
description: Turn a backlog-task description into a prd.json of specific technical tasks (product-manager leads, specialist subagents help). Writes the current PRD only — no scaffolding, no execution, no commits.
argument-hint: <backlog-task description (free text, or a backlog-tasks.csv row)>
---

Turn **one backlog task** into an implementation-ready `prd.json`: decompose it into **specific
technical tasks** (the `userStories`) such that **completing every task means the backlog task is
done** — nothing left implied. This command **only writes the current PRD**; it makes no other
changes (no scaffolding, no code, no branch/commit, no execution — `/myteam-execute` runs it later).

**Input** (`$ARGUMENTS`): the **backlog-task description** (free text). It may come straight from a
`backlog-tasks.csv` row (`id` + `title` + `description`).

**Steps**

0. **Guard — require onboarding (hard stop).** Check for `.cursor/myteam/workspace-parts.yaml`. If it
   does **not** exist or is empty, STOP:
   > Stop. This repo hasn't been onboarded yet. Run `/myteam-onboard` first, then re-run `/myteam-plan`.
   Planning needs the workspace part docs to break the task down technically.

1. Spawn the **product-manager** agent (Agent tool, `subagent_type: "product-manager"`) as lead.
2. Load the **`prd`** skill (`.claude/skills/prd/SKILL.md`). If the task is ambiguous and
   `config.yaml > defaults.interactive` is `true`, ask the `prd` skill's clarifying questions via the
   **AskUserQuestion** tool before decomposing. If `interactive` is `false` (the default), **do not
   block** — make the most reasonable assumption and record it in the PRD `description` / story `notes`.
3. Produce a `prd.json` that follows `.claude/myteam/prds/prd.json.example`:
   - **Break down the task** into grounded, technical user stories using the real architecture (paths,
     stack, interfaces, gotchas). Load `.cursor/myteam/workspace-parts.yaml` and the relevant part
     contexts: `.cursor/skills/workspace/<part-dir>/SKILL.md`,
     `.cursor/rules/workspace/<part-dir>/<part-name>.md`, and `./<part-dir>/AGENT.md`. Consult
     specialist agents in `.claude/agents/` (spawn via the Agent tool as needed).
   - **Assign a `part`** from `workspace-parts.yaml` to each story — closest leaf part, or top-level
     parent if no leaf fits. Each user story must relate to one part.
   - Stories ordered by `priority` with **no forward dependencies**.
   - Each story sized for one focused session; acceptance criteria verifiable and ending with
     `Typecheck passes`; UI stories include a browser-verify line.
   - **Assign agents per story**: `agents: [{ "role": "..." }]` using roles from `.claude/agents/`
     (registry in `config.yaml`), chosen by the part's `category`:

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

4. Write to `.claude/myteam/prds/current/<task-kebab>/prd.json` and create an empty `progress.txt`
   (seed the `## Codebase Patterns` header). Confirm `branchName` is `myteam/<task-kebab>`. Validate
   it is JSON and matches the example.
5. Print the PRD path and a one-line story list; suggest `/myteam-execute` to execute it.
6. **Guarantee completeness (the key rule).** The set of technical tasks **must fully cover** the
   backlog task: when every story has `passes: true`, the backlog task is satisfied — no gap, nothing
   unstated. Make this explicit — record the backlog task's done-definition in the PRD `description`
   and ensure the union of all stories' acceptance criteria delivers it. If you can't cover it
   without a gap, add the missing story rather than leaving it implied.

**Guardrails**
- Write **only** the current PRD dir (`prd.json` + seeded `progress.txt`). Make **no other changes**
  — no code, no scaffolding, no branch/commit, no execution.
- Every story must map back to the backlog task; the **union of stories = the backlog done-definition**.
- Stories dependency-ordered and right-sized; every story has a valid `part` and `agents[]` (roles
  from the part's category); valid JSON matching `prd.json.example`; `branchName` is `myteam/<task-kebab>`.
- Do not start implementing — this is planning only.
