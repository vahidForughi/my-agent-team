---
description: Turn a backlog-task description into a prd.json of specific technical tasks (product-manager leads, specialist subagents help). Writes the current PRD only — no scaffolding, no execution, no commits.
argument-hint: <backlog-task description (free text, or a backlog-tasks.csv row)>
---

Turn **one backlog task** into an implementation-ready `prd.json`: decompose it into **specific
technical tasks** (the `userStories`) such that **completing every task means the backlog task is
done** — nothing left implied. This command **only writes the current PRD**; it makes no other
changes (no scaffolding, no code, no branch/commit, no execution — `/myteam-do` runs it later).

**Input** (`$ARGUMENTS`): the **backlog-task description** (free text). It may come straight from a
`backlog-tasks.csv` row (`id` + `title` + `description`).

**Steps**

0. **Guard — require onboarding (hard stop).** Check for `.cursor/myteam/workspace-parts.yaml`. If it
   does **not** exist or is empty, STOP:
   > Stop. This repo hasn't been onboarded yet. Run `/myteam-onboard` first, then re-run `/myteam-task`.
   Planning needs the workspace part docs to break the task down technically.

1. **Understand the backlog task.** Load the **`prd`** skill (`.claude/skills/prd/SKILL.md`) and the
   output contract `.claude/myteam/prds/prd.json.example`. Load `.cursor/myteam/workspace-parts.yaml`
   to build a map of available parts (name, dir, category, kebab). Read the relevant parts' docs:
   `.cursor/skills/workspace/<part-dir>/SKILL.md`, `.cursor/rules/workspace/<part-dir>/<part-name>.md`,
   and `./<part-dir>/AGENT.md` — so the breakdown is grounded in the real architecture (paths, stack,
   interfaces, gotchas). If the task is ambiguous and `config.yaml > defaults.interactive` is `true`,
   ask the `prd` skill's clarifying questions via the **AskUserQuestion** tool before decomposing. If
   `interactive` is `false` (the default), **do not block** — make the most reasonable assumption,
   record it in the PRD `description` / story `notes`, and decompose.

2. **Break it into technical tasks — product-manager leads, subagents help.** Spawn the
   **product-manager** agent (Agent tool, `subagent_type: "product-manager"`) as lead. Consult the
   specialist agents in `.claude/agents/` (spawn via the Agent tool as needed) to decompose the backlog
   task into *specific, technical* user stories — e.g. `backend-architect` (services/APIs/data/infra),
   `frontend-developer` (`client/` + `micro-frontends/`), `api-tester` / `evidence-collector`
   (verification), `devops-automator` (CI/CD & deploy), `code-reviewer` (review gates). Each story =
   **one focused technical task**: dependency-ordered (schema → backend → API → UI, no forward deps),
   sized for one session, with verifiable acceptance criteria ending in `Typecheck passes` (+ a
   browser-verify line for UI).

   Every story must be assigned a **`part`** from `workspace-parts.yaml` — the closest matching leaf
   part, or its top-level parent if no leaf is a better fit. Use the part's `category` to select
   agents (`agents[]` entries are `{"role": "..."}` — no `count`):

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

   A story touching multiple categories may list roles from both. Leave stories on
   `config.yaml > defaults.model`; set a story's optional `model` to a stronger tier only for
   genuinely hard stories, justified in `notes`.

3. **Guarantee completeness (the key rule).** The set of technical tasks **must fully cover** the
   backlog task: when every story has `passes: true`, the backlog task is satisfied — no gap, nothing
   unstated. Make this explicit — record the backlog task's done-definition in the PRD `description`
   and ensure the union of all stories' acceptance criteria delivers it. If you can't cover it
   without a gap, add the missing story rather than leaving it implied.

4. **Write the current PRD (only output).** Write
   `.claude/myteam/prds/current/<task-kebab>/prd.json` matching `prd.json.example` exactly:
   `project`, `prdId` (carry the backlog `id` for traceability), `branchName: myteam/<task-kebab>`,
   `description` (= the backlog task + its done-definition), `defaultParallelism`, and
   `userStories[]` = the technical tasks. Each story must include `part` (from workspace-parts.yaml)
   and `agents[]` (roles derived from that part's category). Seed an empty `progress.txt` next to it
   with the `## Codebase Patterns` header. Validate it is JSON and matches the example. Print the PRD
   path and a one-line task list; suggest `/myteam-do` to execute it.

**Guardrails**
- Write **only** the current PRD dir (`prd.json` + seeded `progress.txt`). Make **no other changes**
  — no code, no scaffolding, no branch/commit, no execution.
- Every story must map back to the backlog task; the **union of stories = the backlog done-definition**.
- Stories dependency-ordered and right-sized; every story has a valid `part` and `agents[]` (roles
  from the part's category); valid JSON matching `prd.json.example`; `branchName` is `myteam/<task-kebab>`.
- Do not start implementing — this is planning only.
