# myteam — Agent Execution Harness

A Claude Code harness that turns a product requirements document into commits — through a loop of specialist agents, quality gates, and a shared knowledge base that grows with every story.

---

## What it is

| Phase | Command | Role |
|---|---|---|
| Plan | `/myteam-plan` | Generates ordered `prd.json` with stories, acceptance criteria, and agent assignments. Never touches code. |
| Execute | `/myteam-execute` | Picks stories one by one, dispatches assigned agents in fresh context, runs quality gates, commits, checkpoints. |
| Archive | `/myteam-archive` | Moves completed PRD to `prds/archive/`. Learnings stay in `AGENT.md` + `SKILL.md`. |

---

## Quick start

```
/myteam-onboard    # Read repo → generate workspace-parts.yaml, AGENT.md, CLAUDE.md, SKILL.md per part
/myteam-plan       # Describe feature → get prd.json with ordered stories
/myteam-execute    # Run the loop: stories → agents → gates → commit → checkpoint
/myteam-archive    # Move PRD to archive when complete
```

For full backlog automation: `/myteam-run` drives `backlog-tasks.csv` end-to-end.

---

## Harness patterns

### Planner / Executor (primary)
Strict phase separation. `/myteam-plan` produces the plan; `/myteam-execute` consumes it. The planner never touches code; the executor never rewrites scope.

### Supervisor
The orchestrator reads `prd.json`, dispatches each story to specialist agents, aggregates output through quality gates, and decides whether the story passes.

### Single Agent per story
Each story runs in its own fresh-context subagent — isolated context, scoped to the part directory, no accumulated transcript from prior stories.

### Hierarchical
`workspace-parts.yaml` encodes a two-level part tree (e.g. `Services → Basket`). Agents are scoped to a part's directory; the orchestrator navigates between parts across stories.

### Blackboard
`prd.json` is the shared state board every agent reads and the orchestrator writes. `progress.txt` is the append-only knowledge log — the `## Codebase Patterns` section is read before every story.

### Workflow
`/myteam-run` drives a full `backlog-tasks.csv` end-to-end — one task at a time via plan → execute → archive. Each cycle is an independent workflow.

### Long-Running / Checkpointing
`passes: true` in `prd.json` is the checkpoint. Stop mid-PRD, resume later — the loop re-reads state and picks up at the first story where `passes: false`. `maxStoryAttempts` bounds runaway retries.

### Swarm / Parallel
Parallel agents per story are supported via `count > 1` in `agents[]`. An `events/` directory exists for inter-story event contracts.

---

## Execution loop

```
1.  Guard check      → prd.json exists with userStories
2.  Read state       → prd.json + progress.txt (Codebase Patterns section first)
3.  Pick story       → highest priority where passes: false
4.  Dispatch agents  → fresh context, scoped to part.dir, load part rules/skills/AGENT.md
5.  Implement        → story acceptance criteria
6.  Quality gates    → typecheck, lint, test, playwright (from config.yaml)
7.  Commit           → feat: [US-001] - Story title
8.  Checkpoint       → set passes: true in prd.json
9.  Learn            → append to progress.txt, update AGENT.md + SKILL.md + part rules
10. Loop             → back to step 3 until all stories pass
11. Stop             → emit <promise>COMPLETE</promise>
```

### Invariants

- One story per iteration. Fresh context per agent. No accumulated transcript between stories.
- `prd.json` is the source of truth for `passes`. `progress.txt` is append-only.
- `agents[].role` must exist in `.claude/agents/` — never invent roles.
- Never commit broken code. Quality gates must pass before every commit.
- Stop after `maxStoryAttempts` failures. Leave `passes: false` and log the blocker.

---

## Agent registry

| Role | Responsibilities | Scope |
|---|---|---|
| `product-manager` | Owns `/myteam-plan` — turns intent into `prd.json` | Planning phase only |
| `backend-architect` | Services, data models, gRPC/REST APIs, infra design | `Services/` · `ApiGateways/` |
| `frontend-developer` | React micro-frontends (Nx Module Federation), Angular SPA | `micro-frontends/` · `client/` |
| `api-tester` | API functional, contract, security, and performance validation | `tools/postman/` · `tests/` |
| `devops-automator` | CI/CD, EKS/ECR, Helm, Istio, Terraform, observability | `Deployments/` · `terraform/` · `monitoring/` |
| `code-reviewer` | Correctness, security, maintainability review | Cross-cutting |
| `evidence-collector` | Screenshot-backed QA; browser verification for UI stories | `micro-frontends/` · `client/` |

---

## State model

### `prd.json` — mutable, source of truth for `passes`

```json
{
  "prdId": "PRD-004",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add favorites data model",
      "priority": 1,
      "passes": true,
      "part": { "name": "Services", "dir": "Services" },
      "agents": [{ "role": "backend-architect" }]
    },
    {
      "id": "US-002",
      "passes": false,
      "agents": [
        { "role": "frontend-developer" },
        { "role": "evidence-collector" }
      ]
    }
  ]
}
```

### `progress.txt` — append-only, knowledge accumulator

```
## Codebase Patterns
# Read before every story. General, reusable learnings only.
- MFE routes: run `nx run account:routes:generate` after adding route files
- Never edit routeTree.gen.ts manually
- registerRemotes() needs a Set guard to prevent duplicate registration

## [2026-06-18 14:32] - US-004
- Implemented favorites list page in account MFE
- Files: FavoritesPage.tsx, routes/favorites.ts
- **Learnings for future iterations:**
  - TanStack Router file-based routing requires route generation step
  - useFavorites hook pattern reusable across account MFE
---
```

---

## Long-running guarantees

| Feature | How |
|---|---|
| Checkpointing | `passes: true` in `prd.json`; resume from any story boundary |
| Bounded retry | `maxStoryAttempts: 2` — stops and logs blocker instead of churning |
| Fresh context isolation | Each story agent gets only: story spec, part CLAUDE.md, recent git log, one-line prior-story summary |
| Quality gates | Configurable in `config.yaml` — typecheck, lint, test, playwright |
| Self-updating knowledge | Learnings written back to `AGENT.md`, `SKILL.md`, part rules after each story |
| Non-interactive default | `interactive: false` — makes reasonable assumptions, records them in story notes |

---

## Configuration reference

```yaml
# .claude/myteam/config.yaml

defaults:
  branchPrefix: myteam/
  defaultParallelism: 1      # raise only for genuinely parallel sub-work
  interactive: false         # skip clarifying prompts; assume and record
  maxStoryAttempts: 2        # bound retries before logging blocker
  model: inherit             # story agents inherit session model
  qualityGates:
    - typecheck
    - lint
    - test
    - playwright

agents:
  - role: product-manager
  - role: backend-architect
  - role: frontend-developer
  - role: api-tester
  - role: devops-automator
  - role: code-reviewer
  - role: evidence-collector
```

---

## File structure

```
.claude/myteam/
├── config.yaml              # Harness configuration and agent registry
├── workspace-parts.yaml     # Repo part tree (generated by /myteam-onboard)
├── AGENT.md                 # Execution loop invariants → loads SKILL.md
├── README.md                # This file
├── prds/
│   ├── current/
│   │   ├── prd.json         # Active PRD (source of truth for passes)
│   │   └── progress.txt     # Append-only knowledge log
│   └── archive/             # Completed PRDs (moved by /myteam-archive)
└── events/                  # Inter-story event contracts (future extension)

.claude/agents/              # Role definitions (subagent_type registry)
├── backend-architect.md
├── frontend-developer.md
└── ...

.claude/skills/workspace/    # Part-specific agent skills
.claude/rules/workspace/     # Part-specific agent rules
```

---

## Context management

Each story agent receives exactly what it needs — no more:

1. **Story spec** — the full user story from `prd.json`
2. **Part context** — the touched part's `CLAUDE.md` (auto-loaded by Claude Code from the part directory)
3. **Recent history** — `git log` for paths relevant to the story
4. **Prior summary** — one-line summary of completed stories in this PRD
5. **Codebase patterns** — the `## Codebase Patterns` section from `progress.txt`

This bounds context size and prevents story N's debugging output from polluting story N+1's reasoning.

---

## Related commands

| Command | When to use |
|---|---|
| `/myteam-onboard` | First time on a new repo, or after major structural changes |
| `/myteam-plan` | Starting any new feature or bugfix batch |
| `/myteam-execute` | Running or resuming a PRD |
| `/myteam-archive` | After `<promise>COMPLETE</promise>` |
| `/myteam-run` | Automating a full `backlog-tasks.csv` end-to-end |
