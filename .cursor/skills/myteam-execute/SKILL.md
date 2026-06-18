---
name: myteam-execute
description: "The merged execution loop for the myteam execute. Use when executing a PRD: iterate stories by priority, delegate each to its assigned agents in parallel, run quality gates, commit, and append learnings to progress.txt. Triggered by /myteam-execute phase 2."
license: MIT
compatibility: Reads .cursor/myteam/config.yaml, a prds/current/<prd>/prd.json + progress.txt, and .cursor/agents/.
metadata:
  author: myteam
  version: "1.0"
---

# myteam execution loop

The merged strategy: fresh-context `prd.json` loop, with per-story **agent orchestration**
and habit of leaving a clean, traceable trail.

## Inputs

- Active PRD: `.cursor/myteam/prds/current/<prd>/prd.json` and its `progress.txt`.
- Per-part context: `.cursor/rules/workspace/<part-dir>/<part-name>.md`, `.cursor/skills/workspace/<part-dir>/SKILL.md`,
  `./<part-dir>/AGENT.md` (curated doc) for every part a story touches.
- Recent history: `git log` for the paths a story touches (see step 1) — cheaper and more current
  than re-reading prose.
- Defaults & quality gates: `.cursor/myteam/config.yaml`.
- Agent roles: `.cursor/agents/<role>.md` (+ `.cursor/rules/<role>.mdc`).

## The loop (one story per iteration, fresh context, specific part)

1. Read the PRD at `.cursor/myteam/prds/current/<prd>/prd.json`.
2. Read the progress log at `.cursor/myteam/prds/current/<prd>/progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD branchName. If not, check it out or create from main.
4. Pick the highest priority user story where passes: false
5. Implement that single user story
6. Run quality checks (e.g., typecheck, lint, test - use whatever your project requires)


1. **Read state:** Open `prd.json` and the PRD `progress.txt`. Read the `## Codebase Patterns`
   section at the top of `progress.txt` **first** — it carries forward what earlier iterations
   learned. Then, for each part the story touches, 
2. **Branch.** Ensure you are on `prd.json.branchName` (`myteam/<feature>`). If not, check it out
   or create it from `main`.
3. **Pick the story.** Choose the **highest-priority** story (lowest `priority` number) where
   `passes: false`. If none remain, go to **Stop**.
4. **dispatch assigned agents with fresh-context.** Read the story's
   `agents[]` and `part`, engage that role from `.cursor/agents/`.
   - **Agent Scoped** in story's `part` `dir`
   - **Agent Load**: `.cursor/rules/workspace/<part.dir>/<part.name>.mdc`, `.cursor/skills/workspace/<part-kebab>/SKILL.md`
     `<part-kebab>/AGENT.md`
5. Implement that single user story.
6. **Quality gates (bounded retries).** Run `config.yaml > defaults.qualityGates` (typecheck / lint /
   test). For UI stories, verify in the browser. Do not proceed on failure: re-delegate 
   the fix up to `config.yaml > defaults.maxStoryAttempts` times. If the gates
   still fail after that — or the story proves too large to satisfy **all** its acceptance criteria in
   one focused pass — **STOP the loop**: leave the story `passes: false`, append the blocker (and a
   split suggestion if oversized) to `progress.txt`, and surface it. Never churn indefinitely and never
   commit broken code.
7. **Commit.** Commit all changes: `feat: [US-id] - [Story Title]`. Never commit broken code.
8. **Mark done.** Set `passes: true` for the story in `prd.json`.
9. **Log progress.** APPEND (never replace, just append) the dated entry to the PRD `progress.txt`:
   ```
   ## [YYYY-MM-DD HH:MM] - US-00X
   - What was implemented (and which agents did what)
   - Files changed
   - **Learnings for future iterations:**
     - Patterns discovered
     - Gotchas encountered
   ---
   ```
10. **Consolidate.** Promote general, If you discover any reusable learnings , add it:
   - patterns that future iterations should know into `## Codebase Patterns` section at the top of the PRD `progress.txt`; 
   - part's rule `.cursor/rules/workspace/<part.dir>/<part.name>.mdc`.
   - part's skill `.cursor/skills/workspace/<part.dir>/SKILL.md`.
   - part's AGENT.md `<part.dir>/AGENT.md`.

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

Before committing, check if any edited files have learnings worth preserving in nearby CLAUDE.md files:

1. **Identify directories with edited files** - Look at which directories you modified
2. **Check for existing CLAUDE.md** - Look for CLAUDE.md in those directories or parent directories
3. **Add valuable learnings** - If you discovered something future developers/agents should know:
   - API patterns or conventions specific to that module
   - Gotchas or non-obvious requirements
   - Dependencies between files
   - Testing approaches for that area
   - Configuration or environment requirements

**Examples of good CLAUDE.md additions:**
- "When modifying X, also update Y to keep them in sync"
- "This module uses pattern Z for all API calls"
- "Tests require the dev server running on PORT 3000"
- "Field names must match the template exactly"

**Do NOT add:**
- Story-specific implementation details
- Temporary debugging notes
- Information already in progress.txt

Only update CLAUDE.md if you have **genuinely reusable knowledge** that would help future work in that directory.

## Quality Requirements

- ALL commits must pass your project's quality checks (typecheck, lint, test)
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns

## Browser Testing (If Available)

For any story that changes UI, verify it works in the browser if you have browser testing tools configured (e.g., via MCP):

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
- `agents[].role` must exist in `.cursor/agents/` — never invent roles.
- `progress.txt` is append-only; `prd.json` is the source of truth for `passes`.
- Read the Codebase Patterns section in `progress.txt` before starting