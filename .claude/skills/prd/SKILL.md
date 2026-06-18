---
name: prd
description: "Generate a PRD and emit prd.json for the myteam harness. Each user story is assigned agent roles (from .claude/agents/) with parallel counts. Use when planning a feature or when asked to create a PRD / spec out work. Triggers: create a prd, plan this feature, requirements for, spec out, /myteam-do."
---

# PRD Generator (myteam)

Produce a clear, implementation-ready PRD and emit it as `prd.json` for the harness.
`prd` skill, **extended** so every story is assigned agent roles + a parallel count.

**Do NOT implement.** This skill only produces the PRD.

## Step 1 — Clarifying questions

Only when `config.yaml > defaults.interactive` is `true`: ask 3–5 essential questions where the
request is ambiguous, using the **AskUserQuestion** tool. When `interactive` is `false` (the default),
do **not** block — make the most reasonable assumption and record it in the PRD `description` / story
`notes`. Focus on:

- **Problem/Goal** — what problem does this solve?
- **Core functionality** — key actions?
- **Scope/Boundaries** — what should it NOT do?
- **Success criteria** — how do we know it's done?

## Step 2 — Draft the stories

For each story:

- **Title** — short.
- **Description** — `As a [user], I want [feature] so that [benefit].`
- **Acceptance criteria** — verifiable checklist. Bad: "works correctly". Good: "Button shows
  confirmation dialog before deleting". Always end with `Typecheck passes`. For UI stories add
  `Verify in browser (screenshot for the progress log)`.

Rules:

- **Right-size**: each story completable in one focused session (a column + migration, one
  endpoint, one component). Too big: "build the dashboard", "add auth", "refactor the API".
- **Order by dependency**: schema → backend logic → API → UI. `priority` ascending, no forward deps.

## Step 3 — Assign agents per story (the myteam extension)

For every story, choose the agent roles that should do the work and how many run in parallel.
Roles MUST come from `.claude/agents/` (registry in `.claude/myteam/config.yaml`); the harness spawns
each via the Agent tool with `subagent_type: "<role>"`:

| Work in the story | Likely roles |
|---|---|
| Services, data models, APIs, infra design | `backend-architect` |
| `client/` or `micro-frontends/` UI | `frontend-developer` |
| API validation (functional/perf/security) | `api-tester` |
| CI/CD, deploy, infra automation | `devops-automator` |
| Correctness/security/maintainability review | `code-reviewer` |
| Screenshot-backed QA / reality check | `evidence-collector` |

Set `count` (parallel instances of that role) and a story-level `parallelism` cap (≥ sum of counts
is fine; it bounds concurrency). When unsure, use `config.yaml > defaults.defaultParallelism`.

## Step 4 — Emit prd.json

Write `prd.json` matching `.claude/myteam/prds/prd.json.example` exactly:

```json
{
  "project": "cloud-native-ecommerce-platform",
  "prdId": "PRD-XYZ",
  "branchName": "myteam/<feature-kebab>",
  "description": "...",
  "defaultParallelism": 2,
  "userStories": [
    {
      "id": "US-001",
      "title": "...",
      "description": "As a ..., I want ... so that ...",
      "acceptanceCriteria": ["...", "Typecheck passes"],
      "priority": 1,
      "passes": false,
      "notes": "",
      "agents": [{ "role": "backend-architect", "count": 2 }, { "role": "api-tester", "count": 1 }],
      "parallelism": 3
    }
  ]
}
```

## Output

- **Location**: `.claude/myteam/prds/current/<feature-kebab>/prd.json`
- Also create `progress.txt` in the same dir with the `## Codebase Patterns` header seeded.

## Checklist

- [ ] Asked clarifying questions (only if interactive) and incorporated answers
- [ ] Stories small, specific, dependency-ordered (no forward deps)
- [ ] Acceptance criteria verifiable; each ends with `Typecheck passes`; UI stories browser-verify
- [ ] Every story has `agents[]` (valid roles) + `parallelism`
- [ ] Valid JSON, matches `prd.json.example`; `branchName` is `myteam/<feature-kebab>`
- [ ] Did NOT start implementing
