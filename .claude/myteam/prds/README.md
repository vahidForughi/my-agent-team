# PRDs

Each PRD is a directory. Active PRDs live in `current/`, finished ones in `archive/`.

```
prds/
  prd.json.example            reference schema (copy when starting a PRD)
  current/
    <prd-name>/
      prd.json                the PRD: stories + per-story agent assignments
      progress.txt            append-only log of what was done + Learnings
  archive/
    YYYY-MM-DD-<prd-name>/     moved here by /myteam-archive when done/superseded
      prd.json
      progress.txt
```

## prd.json schema

`prd.json`, extended with **per-story agent assignment + parallelism**.

| Field | Meaning |
|---|---|
| `project` | Repo / product name. |
| `prdId` | Stable id, e.g. `PRD-001`. |
| `branchName` | Working branch, `myteam/<feature-kebab>`. |
| `description` | One-line feature summary. |
| `defaultParallelism` | Fallback concurrency when a story omits `parallelism`. |
| `userStories[]` | Ordered stories (see below). |

Each `userStories[]` item:

| Field | Meaning |
|---|---|
| `id` | `US-001`, `US-002`, … |
| `title` | Short title. |
| `description` | `As a …, I want … so that …` |
| `acceptanceCriteria[]` | Verifiable checks; end with `Typecheck passes`; UI stories add a browser-verify line. |
| `priority` | Execution order (1 = highest). Order so dependencies come first — no forward deps. |
| `passes` | `false` until the story is complete and committed. |
| `notes` | Free-form. |
| `agents[]` | `{ "role": "<.claude/agents role>", "count": <parallel instances> }`. |
| `parallelism` | Max concurrent agents for this story (caps the sum of `count`). |

`agents[].role` must match a file in `.claude/agents/` and the registry in `config.yaml`. The harness
spawns each role via the Agent tool with `subagent_type: "<role>"`.

## progress.txt

Append-only. Top of file holds a `## Codebase Patterns` section (general, reusable learnings).
Below it, one dated block per completed story with a **Learnings** sub-section.
See `current/_example-prd/progress.txt`.
