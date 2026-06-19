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

fresh-context `prd.json > userStories` loop, with **agent orchestration** per-story.

## The loop (one story per iteration, fresh context, scoped in part dir)

0. check `.claude/myteam/prds/current/prd.json` exists and includes a filled `userStories` property.
   If missing, STOP and do not execute next steps:
> Stop. The execute isn't initialized. Run `/myteam-plan` first (and `/myteam-onboard` before that if
> you haven't), then re-run `/myteam-execute`.

1. Read the current PRD at `.claude/myteam/prds/current/prd.json`.
2. Read the progress log at `.claude/myteam/prds/current/progress.txt` (check Codebase Patterns section first)
3. Pick the highest priority user story where passes: false, If none remain, go to **Stop**.
4. Dispatch that single user story's assigned agents with fresh context and scoped in part's dir,
   that can hands-off with another ones if needed.
5. Load part's rules, skills and AGENT.md, (paths exists under **Part's Definition** section)
6. Implement that single user story.
7. Dispatch a testing agent to run quality checks from `config.yaml > defaults.qualityGates` each one needed (e.g., typecheck, lint, test,
   verify in the browser using available browser skill - use whatever your project requires). Collaborate to fix if needed.
8. Commit all changes: `feat: [US-id] - [Story Title]`. Never commit broken code.
9. Set `passes: true` for the story in `prd.json`.
10. APPEND (never replace, just append) the dated entry to the PRD `progress.txt` with Progress Log Patterns
11. Learn If you discover any reusable facts and preferences, update:
    - patterns that future iterations should know into `## Codebase Patterns` section at the top of the PRD `progress.txt`;
    - part's rule `.claude/rules/workspace/<part.dir>/<part.name>.mdc`.
    - part's skill `.claude/skills/workspace/<part.dir>/SKILL.md`.
    - part's AGENT.md `<part.dir>/AGENT.md`.
12. Write summary of steps 10-11 changes and learnings in the output.
13. Repeat until every story passes, then emit `<promise>COMPLETE</promise>`.

## Codebase Patterns

`## Codebase Patterns` section at the TOP of `progress.txt` (create it if it doesn't exist):

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

- List of parts: `.claude/myteam/workspace-parts.yaml`
- Part's dir: `./<part.dir>/`
- Part's rules: `.claude/rules/workspace/<part.dir>/`
- Part's skill: `.claude/skills/workspace/<part.dir>/`
- Part's AGENT.md: `./<part.dir>/AGENT.md`

## Learn Rules

Good rules are focused, actionable, and scoped.

- Keep rules under 500 lines
- Split large rules into multiple, composable rules
- Provide concrete examples or referenced files
- Avoid vague guidance — write rules like clear internal docs
- Reference files instead of copying their contents

**Avoid in rules:**
- Copying entire style guides (use a linter instead)
- Documenting every possible command (agent already knows common tools)
- Adding instructions for edge cases that rarely apply
- Duplicating what's already in your codebase (point to canonical examples)

## Learn Skill

Check if any edited files have learnings worth preserving in the part's skill files.

A skill is a portable, version-controlled package that teaches agents how to perform domain-specific
tasks — it may include scripts, templates, and references that agents can act on with their tools.

## Learn AGENT.md

Check if any edited files have learnings worth preserving in the part's AGENT.md:

1. **Identify directories with edited files** — look at which directories you modified.
2. **Check for existing AGENT.md** — look for AGENT.md in those directories or parent directories.
3. **Add valuable learnings** — if you discovered something future agents should know:
   - API patterns or conventions specific to that module
   - Gotchas or non-obvious requirements
   - Dependencies between files
   - Testing approaches for that area
   - Configuration or environment requirements

**Examples of good AGENT.md additions:**
- "When modifying X, also update Y to keep them in sync"
- "This module uses pattern Z for all API calls"
- "Tests require the dev server running on PORT 3000"

**Do NOT add:** story-specific details, debugging notes, or anything already in `progress.txt`.

Only update AGENT.md if you have **genuinely reusable knowledge** that would help future work.

## Quality Requirements

- ALL commits must pass your project's quality checks (typecheck, lint, test)
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns
- Don't loop indefinitely — **STOP** after `config.yaml > defaults.maxStoryAttempts` failures,
  leave the story `passes: false`, append the blocker (and a split suggestion) to `progress.txt`

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
