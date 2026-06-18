---
name: prd
description: "Generate a PRD and emit prd.json for the myteam harness. Each user story is assigned a workspace part and agent roles derived from that part's category. Use when planning a feature or when asked to create a PRD / spec out work. Triggers: create a prd, plan this feature, requirements for, spec out, /myteam-do."
license: MIT
compatibility: Reads .cursor/myteam/config.yaml and .cursor/agents/. Output follows .cursor/myteam/prds/prd.json.example.
metadata:
  author: myteam
  version: "1.0"
---

# PRD Generator (myteam)

Produce a clear, implementation-ready PRD and emit it as `prd.json` for the harness.
`prd` skill, **extended** so every story is linked to a workspace part and assigned agent roles
derived from that part's category.

**Do NOT implement.** This skill only produces the PRD.

## Step 1 — Clarifying questions

Ask 3–5 essential questions only where the request is ambiguous. Use lettered options so the
user can answer quickly ("1A, 2C, 3B"). Focus on:

- **Problem/Goal** — what problem does this solve?
- **Core functionality** — key actions?
- **Scope/Boundaries** — what should it NOT do?
- **Success criteria** — how do we know it's done?

```
1. What is the primary goal?
   A. ...
   B. ...
   C. Other: [specify]
```

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

## Step 3 — Assign part + agents per story (the myteam extension)

For every story, assign a **`part`** from `.cursor/myteam/workspace-parts.yaml` — the closest
matching leaf part, or the top-level parent if no leaf is a better fit. Include these fields from
the part entry: `name`, `dir`, `category`, `kebab`.

Use the part's `category` to select agent roles (MUST come from `.cursor/agents/`):

| part category | default agents |
|---|---|
| `micro-service`, `api-gateway` | `backend-architect`, `api-tester` |
| `shared-lib` | `backend-architect`, `code-reviewer` |
| `micro-frontend`, `frontend` | `frontend-developer`, `evidence-collector` |
| `infra`, `observability` | `devops-automator` |
| `testing` | `api-tester`, `evidence-collector` |
| `automation`, `tools` | `devops-automator` / `api-tester` |
| `docs` | `code-reviewer` |

`agents[]` entries are `{"role": "..."}` — no `count`, no story-level `parallelism`. A story
touching multiple categories may list roles from both.

## Step 4 — Emit prd.json

Write `prd.json` matching `.cursor/myteam/prds/prd.json.example` exactly:

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
      "part": {
        "name": "Services",
        "dir": "Services",
        "category": "micro-service",
        "kebab": "services"
      },
      "agents": [{ "role": "backend-architect" }, { "role": "api-tester" }]
    }
  ]
}
```

## Output

- **Location**: `.cursor/myteam/prds/current/<feature-kebab>/prd.json`
- Also create `progress.txt` in the same dir with the `## Codebase Patterns` header seeded.

## Checklist

- [ ] Asked lettered clarifying questions and incorporated answers
- [ ] Stories small, specific, dependency-ordered (no forward deps)
- [ ] Acceptance criteria verifiable; each ends with `Typecheck passes`; UI stories browser-verify
- [ ] Valid JSON, matches `prd.json.example`; `branchName` is `myteam/<feature-kebab>`
- [ ] Did NOT start implementing
