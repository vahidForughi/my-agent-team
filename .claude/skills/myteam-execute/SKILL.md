---
name: myteam-execute
description: "The merged execution loop for the myteam execute. Use when executing a PRD: iterate stories by priority, delegate each to its assigned agents (spawned via the Agent tool) in parallel, run quality gates, commit, and append learnings to progress.txt. Triggered by /myteam-execute phase 2."
license: MIT
compatibility: Reads .claude/myteam/config.yaml, a prds/current/<prd>/prd.json + progress.txt, and .claude/agents/.
metadata:
  author: myteam
  version: "1.0"
---

# myteam execution loop

The merged strategy: fresh-context `prd.json` loop, with per-story **agent orchestration**
and habit of leaving a clean, traceable trail.

## Inputs

- Active PRD: `.claude/myteam/prds/current/<prd>/prd.json` and its `progress.txt`.
- Per-part context: `.cursor/rules/workspace/<part-dir>/<part-name>.mdc`, `.cursor/skills/workspace/<part-dir>/SKILL.md`,
  `./<part-dir>/AGENT.md` (curated doc) for every part a story touches.
- Recent history: `git log` for the paths a story touches (see step 1) — cheaper and more current
  than re-reading prose.
- Defaults & quality gates: `.claude/myteam/config.yaml`.
- Agent roles: `.claude/agents/<role>.md`, spawned via the Agent tool with `subagent_type: "<role>"`.

## Context isolation (why this loop stays cheap)

The loop is cheap because **each iteration is a fresh process**. Reproduce that here: run **each
story in its own fresh-context subagent via the Agent tool** — this is required, not optional. The
orchestrator stays small by **re-deriving remaining work from disk at the start of every iteration** —
re-read `prd.json` (`passes` flags) and the `progress.txt` `## Codebase Patterns` section — rather than
keeping a running narrative in context. It must **not** carry previous stories' full transcripts,
file dumps, or agent outputs into the next iteration. When a story finishes, the runner writes its
one-line summary to `progress.txt` and that summary is then **dropped from the orchestrator's
context** — it is not accumulated into an in-context list that grows with the story count.

**Keep briefs prompt-cache-friendly.** Order every agent brief **stable prefix first** — the execute
rules, the `config.yaml` context block, and the touched part's context — then the **variable,
story-specific bits last** (title/description/acceptance criteria/`git log` findings). A stable prefix
can be cache-reused across stories and agents; leading with the variable parts defeats that.

## The loop (one story per iteration, fresh context, specific part)

1. **Read state.** Open `prd.json` and the PRD `progress.txt`. Read the `## Codebase Patterns`
   section at the top of `progress.txt` **first** — it carries forward what earlier iterations
   learned. Then, for each part the story touches, check recent history for the paths it will touch
   (e.g. `git log --oneline -n 15 -- <path>`, `git log -p -n 3 -- <file>`).
2. **Branch.** Ensure you are on `prd.json.branchName` (`myteam/<feature>`). If not, check it out
   or create it from `main`.
3. **Pick the story.** Choose the **highest-priority** story (lowest `priority` number) where
   `passes: false`. If none remain, go to **Stop**.
4. **Dispatch assigned agents with fresh-context (mandatory, via the Agent tool).** Read the story's
   `agents[]` and `part`. For each `{ role }`, spawn that role using the **Agent tool** with
   `subagent_type: "<role>"` (the role names a file in `.claude/agents/`).
   - **Agent scoped** to the story's `part.dir`.
   - **Agent loads**: `.cursor/rules/workspace/<part.dir>/<part.name>.mdc`,
     `.cursor/skills/workspace/<part.kebab>/SKILL.md`, `<part.dir>/AGENT.md`.
   - Run on the story's `model` if set, else `config.yaml > defaults.model`.
   - Give each agent a **scoped, self-contained brief, ordered prefix-first** (stable: execute rules,
     `config.yaml` context, part context; then variable: story title, description, acceptance criteria,
     and `git log` findings from step 1) — **not** the orchestrator's wider context or prior stories'
     transcripts.
   - Run independent agents concurrently (multiple Agent tool calls in a single message); serialize
     where one depends on another's output.
   - Each agent returns a concise result (what changed, files, learnings); the orchestrator reconciles
     those summaries — it does not absorb every agent's full working transcript.
5. **Reconcile.** Merge agents' work into a single coherent change satisfying **all** acceptance
   criteria. Resolve conflicts; keep the change focused and minimal.
6. **Quality gates (bounded retries).** Run `config.yaml > defaults.qualityGates` (typecheck / lint /
   test). For UI stories, verify in the browser and capture a screenshot for the log. Do not proceed on
   failure: re-delegate the fix up to `config.yaml > defaults.maxStoryAttempts` times. If the gates
   still fail after that — or the story proves too large to satisfy **all** its acceptance criteria in
   one focused pass — **STOP the loop**: leave the story `passes: false`, append the blocker (and a
   split suggestion if oversized) to `progress.txt`, and surface it. Never churn indefinitely and never
   commit broken code.
7. **Commit.** Commit all changes: `feat: [US-id] - [Story Title]`. Never commit broken code.
8. **Mark done.** Set `passes: true` for the story in `prd.json`.
9. **Log progress.** APPEND (never overwrite) the dated entry to the PRD `progress.txt`:
   ```
   ## [YYYY-MM-DD HH:MM] - US-00X
   - What was implemented (and which agents did what)
   - Files changed
   - **Learnings for future iterations:**
     - Patterns discovered
     - Gotchas encountered
   ---
   ```
10. **Consolidate.** Promote general, reusable learnings:
    - General patterns → `## Codebase Patterns` section at the top of the PRD `progress.txt`.
    - Part-specific patterns → that part's `.cursor/rules/workspace/<part.dir>/<part.name>.mdc`.
    - Part-specific skills → that part's `.cursor/skills/workspace/<part.dir>/SKILL.md`.
    - Durable architectural notes → that part's `<part.dir>/AGENT.md`.

## Codebase Patterns

`## Codebase Patterns` section at the TOP of progress.txt (create it if it doesn't exist). This section should consolidate the most important learnings:

```
## Codebase Patterns
- Example: Use `sql<number>` template for aggregations
- Example: Always use `IF NOT EXISTS` for migrations
- Example: Export types from actions.ts for UI components
```

Only add patterns that are **general and reusable**, not story-specific details.

## Update part's SKILL.md Files

Before committing, check if any edited files have learnings worth preserving in part context files:

1. **Identify directories with edited files** — look at which directories you modified.
2. **Check for existing context files** — look for `.cursor/rules/workspace/`, `.cursor/skills/workspace/`, and `<part-dir>/AGENT.md`.
3. **Add valuable learnings** — if you discovered something future agents should know:
   - API patterns or conventions specific to that module
   - Gotchas or non-obvious requirements
   - Dependencies between files
   - Testing approaches for that area
   - Configuration or environment requirements

**Examples of good additions:**
- "When modifying X, also update Y to keep them in sync"
- "This module uses pattern Z for all API calls"
- "Tests require the dev server running on PORT 3000"
- "Field names must match the template exactly"

**Do NOT add:**
- Story-specific implementation details
- Temporary debugging notes
- Information already in progress.txt

Only update these files if you have **genuinely reusable knowledge** that would help future work in that area.

## Quality Requirements

- ALL commits must pass your project's quality checks (typecheck, lint, test)
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns

## Browser Testing (If Available)

For any story that changes UI, verify it works in the browser if you have browser testing tools configured:

1. Navigate to the relevant page
2. Verify the UI changes work as expected
3. Take a screenshot if helpful for the progress log

If no browser tools are available, note in your progress report that manual browser verification is needed.

## Stop

After a story completes, check `prd.json`. If **every** story has `passes: true`, reply with:

```
<promise>COMPLETE</promise>
```

Otherwise end normally — the next iteration picks up the next story. When complete, suggest
`/myteam-archive` to move the PRD to `prds/archive/`.

## Rules

- One story per iteration. Keep CI green. Follow existing code patterns.
- `agents[].role` must exist in `.claude/agents/` — never invent roles; spawn via the Agent tool.
- `progress.txt` is append-only; `prd.json` is the source of truth for `passes`.
- Read the Codebase Patterns section in `progress.txt` before starting.
