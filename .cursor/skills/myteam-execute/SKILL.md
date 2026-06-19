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

fresh-context `prd.json > userStories` loop, with **agent orchestration** per-story.

## The loop (one story per iteration, fresh context, scoped in part dir)

0. check `.cursor/myteam/prds/current/prd.json` is exists and include filled userStories property.
   If is missing, STOP and do not execute next steps:
> Stop. The execute isn't initialized. Run `/myteam-plan` first (and `/myteam-onboard` before that if
> you haven't), then re-run `/myteam-execute`.

1. Read the current PRD at `.cursor/myteam/prds/current/prd.json`.
2. Read the progress log at `.cursor/myteam/prds/current/progress.txt` (check Codebase Patterns section first)
3. Pick the highest priority user story where passes: false, If none remain, go to **Stop**.
4. Dispatch that single user story's first assigned agent with fresh context and scoped in part's dir,
   that can hands-off with another ones if needed.
5. Load part's rules, skills and AGENT.md, (paths exists under **Part's Definition** section) 
6. Implement that single user story.
7. Run quality checks from `config.yaml > defaults.qualityGates` each one needed (e.g., typecheck, lint, test,
   verify in the browser - use whatever your project requires).
8. Commit all changes: `feat: [US-id] - [Story Title]`. Never commit broken code.
9. Set `passes: true` for the story in `prd.json`.
10. APPEND (never replace, just append) the dated entry to the PRD `progress.txt` with Progress Log Patterns
11. Learn If you discover any reusable facts and preferences, update:
   - patterns that future iterations should know into `## Codebase Patterns` section at the top of the PRD `progress.txt`; 
   - part's rule `.cursor/rules/workspace/<part.dir>/<part.name>.mdc`.
   - part's skill `.cursor/skills/workspace/<part.dir>/SKILL.md`.
   - part's AGENT.md `<part.dir>/AGENT.md`.
12. Write summary of steps 10-11 changes and learnings in the output.
13. Repeat until every story passes, then emit `<promise>COMPLETE</promise>`.

## Codebase Patterns

`## Codebase Patterns` section at the TOP of progress.txt (create it if it doesn't exist). This section should consolidate the most important learnings:

```
## Codebase Patterns
- Example: Use `sql<number>` template for aggregations
- Example: Always use `IF NOT EXISTS` for migrations
- Example: Export types from actions.ts for UI components
```

Only add patterns that are **general and reusable**, not story-specific details.

## Progress Log Patterns

```
   ## [YYYY-MM-DD HH:MM] - US-00X
   - What was implemented (and which agents did what)
   - Files changed
   - **Learnings for future iterations:**
     - Patterns discovered
     - Gotchas encountered
   ---
```

## Part's Definition

- List of the parts can see in myteam directory `.cursor/myteam/workspace-parts.yaml`
- Part's dir in `./<part.dir>/`
- Part's rules in `.cursor/rules/workspace/<part.dir>/`
- Part's skill in `.cursor/skills/workspace/<part.dir>/`
- Part's AGENT.md in `./<part.dir>/`

## Learn Rules

Good rules are focused, actionable, and scoped.

- Keep rules under 500 lines
- Split large rules into multiple, composable rules
- Provide concrete examples or referenced files
- Avoid vague guidance. Write rules like clear internal docs
- Reuse rules when repeating prompts in chat
- Reference files instead of copying their contents—this keeps rules short and prevents them from becoming stale as code changes

**Avoid in rules:**
- Copying entire style guides: Use a linter instead. Agent already knows common style conventions.
- Documenting every possible command: Agent knows common tools like npm, git, and pytest.
- Adding instructions for edge cases that rarely apply: Keep rules focused on patterns you use frequently.
- Duplicating what's already in your codebase: Point to canonical examples instead of copying code.

## Learn Skill

check if any edited files have learnings worth preserving in nearby part's skill files:

A skill is a portable:
- version-controlled package teaches agents how to perform domain-specific tasks
- include scripts, templates, and references that agents may act on using their tools

## Learn AGENT.md

check if any edited files have learnings worth preserving in nearby part's rules files:

1. **Identify directories with edited files** - Look at which directories you modified
2. **Check for existing AGENT.md** - Look for AGENT.md in those directories or parent directories
3. **Add valuable learnings** - If you discovered something future developers/agents should know:
   - API patterns or conventions specific to that module
   - Gotchas or non-obvious requirements
   - Dependencies between files
   - Testing approaches for that area
   - Configuration or environment requirements

**Examples of good AGENT.md additions:**
- "When modifying X, also update Y to keep them in sync"
- "This module uses pattern Z for all API calls"
- "Tests require the dev server running on PORT 3000"
- "Field names must match the template exactly"

**Do NOT add:**
- Story-specific implementation details
- Temporary debugging notes
- Information already in progress.txt

Only update AGENT.md if you have **genuinely reusable knowledge** that would help future work in that directory.

## Quality Requirements

- ALL commits must pass your project's quality checks (typecheck, lint, test)
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns
- don't indefinitely loop. **STOP the loop** after failure `config.yaml > defaults.maxStoryAttempts` times,
  leave the story `passes: false`, append the blocker (and a split suggestion) to `progress.txt`

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