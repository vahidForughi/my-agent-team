---
description: Turn a backlog-task description into a prd.json of specific technical tasks (product-manager leads, specialist subagents help). Writes the current PRD only — no scaffolding, no execution, no commits.
argument-hint: <backlog-task description (free text, or a backlog-tasks.csv row)>
---

Follow **Steps** to Turn a task into an implementation-ready `prd.json`. This command **only writes the
current PRD** — no code, no scaffolding, no branch/commit, no execution (`/myteam-execute` runs it later).

**Input** (`$ARGUMENTS`): the **backlog-task description** (free text). It may come straight from a
`backlog-tasks.csv` row (`id` + `title` + `description`).

## Steps

0. **Guard** — check `.claude/myteam/workspace-parts.yaml` exists and is non-empty. See **Guard**.
1. Spawn the **product-manager** agent (Agent tool, `subagent_type: "product-manager"`) as lead.
2. Load the **`prd`** skill (`.claude/skills/prd/SKILL.md`). See **Interactive Mode** for when to
   ask clarifying questions.
3. Decompose the task into grounded, technical user stories. See **Story Rules**.
4. Assign agents per story. See **Agent Assignment**.
5. Apply the completeness guarantee. See **Completeness Rule**.
6. Write the PRD (only output). See **PRD Output**.
7. Print the PRD path and a one-line story list; suggest `/myteam-execute` to run it.

## Guard

If `.claude/myteam/workspace-parts.yaml` does **not** exist or is empty, STOP:

> Stop. This repo hasn't been onboarded yet. Run `/myteam-onboard` first, then re-run `/myteam-plan`.

Planning needs the workspace part docs to break the task down technically.

## Interactive Mode

If `config.yaml > defaults.interactive` is `true` and the task is ambiguous, ask the `prd` skill's
clarifying questions via the **AskUserQuestion** tool before decomposing.

If `interactive` is `false` (the default), **do not block** — make the most reasonable assumption
and record it in the PRD `description` / story `notes`.

## Story Rules

- Stories are **grounded in the real architecture** (paths, stack, interfaces, gotchas).
- Load `.claude/myteam/workspace-parts.yaml` and the relevant part contexts:
  `.claude/skills/workspace/<part-dir>/SKILL.md`, `.claude/rules/workspace/<part-dir>/<part-name>.mdc`,
  and `./<part-dir>/AGENT.md`. Consult specialist agents in `.claude/agents/` (spawn via the Agent
  tool as needed).
- Assign a `part` from `workspace-parts.yaml` to each story — closest leaf part, or top-level parent
  if no leaf fits. Each story relates to exactly one part.
- Stories ordered by `priority` with **no forward dependencies**.
- Each story sized for one focused session; acceptance criteria are verifiable and end with
  `Typecheck passes`; UI stories include a browser-verify line.

## Agent Assignment

Assign `agents: [{ "role": "..." }]` per story using roles from `.claude/agents/` (registry in
`config.yaml`), chosen by the story's part category:

| part category                  | default agents |
|-------------------------------|---|
| `micro-service`, `api-gateway` | `backend-architect`, `api-tester` |
| `shared-lib`                   | `backend-architect` |
| `micro-frontend`, `frontend`   | `frontend-developer`, `evidence-collector` |
| `infra`, `observability`       | `devops-automator` |
| `testing`                      | `api-tester`, `evidence-collector` |
| `automation`, `tools`          | `devops-automator` / `api-tester` |
| `docs`                         | `code-reviewer` |

## Completeness Rule

The set of user stories **must fully cover** the backlog task: when every story has `passes: true`,
the backlog task is satisfied — no gap, nothing unstated. Record the backlog task's done-definition
in the PRD `description` and ensure the union of all stories' acceptance criteria delivers it.
If you can't cover it without a gap, add the missing story rather than leaving it implied.

## PRD Output

Write `.claude/myteam/prds/current/prd.json` matching `.claude/myteam/prds/prd.json.example`
exactly:

- `project`, `prdId` (carry the backlog `id` for traceability)
- `description` = backlog task + its done-definition
- `defaultParallelism`
- `userStories[]` — each with `part` (from `workspace-parts.yaml`) and `agents[]`

Seed an empty `progress.txt` next to it with the `## Codebase Patterns` header. Validate JSON
matches the example.

Show the PRD summary and ask the user to confirm before suggesting `/myteam-execute`.

## Guardrails

- Write **only** the current PRD dir (`prd.json` + seeded `progress.txt`). Make **no other changes**.
- Every story must map back to the backlog task; the **union of stories = the backlog done-definition**.
- Stories dependency-ordered and right-sized; every story has a valid `part` and `agents[]`.
- Valid JSON matching `prd.json.example`.
- Do not start implementing — this is planning only.
