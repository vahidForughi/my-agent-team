---
name: /myteam-task
id: myteam-task
category: Harness
description: Turn a backlog-task description into a prd.json of specific technical tasks (product-manager leads, specialist subagents help). Writes the current PRD only — no scaffolding, no execution, no commits.
---

Turn **one backlog task** into an implementation-ready `prd.json`: decompose it into **specific
technical tasks** (the `userStories`) such that **completing every task means the backlog task is
done** — nothing left implied. This command **only writes the current PRD**; it makes no other
changes (no scaffolding, no code, no branch/commit, no execution — `/myteam-do` runs it later).

**Input**: the argument after `/myteam-task` is the **backlog-task description** (free text). It may
come straight from a `backlog-tasks.csv` row (`id` + `title` + `description`).

**Steps**

0. **Guard — require onboarding (hard stop).** Check for `.cursor/rules/workspace/.onboarded`. If it
   does **not** exist, STOP:
   > Stop. This repo hasn't been onboarded yet. Run `/myteam-onboard` first, then re-run `/myteam-task`.
   Planning needs the workspace part docs to break the task down technically.

1. **Understand the backlog task.** Load the **`prd`** skill (`.cursor/skills/prd/SKILL.md`) and the
   output contract `.cursor/myteam/prds/prd.json.example`. Read the relevant workspace part docs
   (`.cursor/rules/workspace/_<part>/AGENT.md`) so the breakdown is grounded in the real architecture
   (paths, stack, interfaces, gotchas). If the task is ambiguous, ask the `prd` skill's clarifying
   questions (lettered options) before decomposing.

2. **Break it into technical tasks — product-manager leads, subagents help.** Adopt the
   **product-manager** role (`.cursor/agents/product-manager.md`) as lead. Consult the specialist
   subagents that exist in `.cursor/agents/` to decompose the backlog task into *specific, technical*
   user stories — e.g. `backend-architect` (services/APIs/data/infra), `frontend-developer`
   (`client/` + `micro-frontends/`), `api-tester` / `evidence-collector` (verification),
   `devops-automator` (CI/CD & deploy), `code-reviewer` (review gates). Each story = **one focused
   technical task**: dependency-ordered (schema → backend → API → UI, no forward deps), sized for one
   session, with verifiable acceptance criteria ending in `Typecheck passes` (+ a browser-verify line
   for UI), and assigned `agents[] {role,count}` + a `parallelism` cap.

3. **Guarantee completeness (the key rule).** The set of technical tasks **must fully cover** the
   backlog task: when every story has `passes: true`, the backlog task is satisfied — no gap, nothing
   unstated. Make this explicit — record the backlog task's done-definition in the PRD `description`
   and ensure the union of all stories' acceptance criteria delivers it. If you can't cover it
   without a gap, add the missing story rather than leaving it implied.

4. **Write the current PRD (only output).** Write
   `.cursor/myteam/prds/current/<task-kebab>/prd.json` matching `prd.json.example` exactly:
   `project`, `prdId` (carry the backlog `id` for traceability), `branchName: myteam/<task-kebab>`,
   `description` (= the backlog task + its done-definition), `defaultParallelism`, and
   `userStories[]` = the technical tasks. Seed an empty `progress.txt` next to it with the
   `## Codebase Patterns` header. Validate it is JSON and matches the example. Print the PRD path and
   a one-line task list; suggest `/myteam-do` to execute it.

**Guardrails**
- Write **only** the current PRD dir (`prd.json` + seeded `progress.txt`). Make **no other changes**
  — no code, no scaffolding, no branch/commit, no execution.
- Every story must map back to the backlog task; the **union of stories = the backlog done-definition**.
- Stories dependency-ordered and right-sized; valid agent roles + `parallelism`; valid JSON matching
  `prd.json.example`; `branchName` is `myteam/<task-kebab>`.
- Do not start implementing — this is planning only.
