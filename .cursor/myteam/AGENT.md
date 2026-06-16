# myteam — harness agent guidance

This is the condensed loop strategy for any agent executing a PRD under this harness.
The full version lives in `.cursor/skills/myteam-harness/SKILL.md`.

## Each iteration (fresh context)

1. Read the active `prds/current/<prd>/prd.json` and its `progress.txt` (read the **Codebase Patterns** section at the top first). For each part the story touches, also read `.cursor/rules/workspace/_<part>/AGENT.md`.
2. Verify you are on the branch named in `prd.json.branchName` (`myteam/<feature>`). If not, check it out or create it from `main`.
3. Pick the **highest-priority** user story where `passes: false`.
4. Read that story's `agents[]`. Delegate the work to those roles (defined in `.cursor/agents/`), spawning up to each role's `count`, capped by the story's `parallelism` (fallback: `config.yaml > defaults.defaultParallelism`).
5. Reconcile the agents' output into one coherent change for that story.
6. Run the quality gates from `config.yaml` (typecheck / lint / test); for UI stories, verify in the browser.
7. Commit all changes: `feat: [US-id] - [Story Title]`.
8. Set `passes: true` for that story in `prd.json`.
9. **Append** (never overwrite) a dated entry to the PRD `progress.txt` with what changed and a **Learnings** block.
10. Promote any reusable, general pattern to the `## Codebase Patterns` section at the top of the PRD `progress.txt`, and promote durable part-specific patterns into that part's `.cursor/rules/workspace/_<part>/AGENT.md`.

## Stop condition

When **all** stories have `passes: true`, reply with `<promise>COMPLETE</promise>`. Otherwise end normally — the next iteration picks up the next story.

## Rules

- One story per iteration. Keep changes focused and minimal; follow existing patterns.
- Never commit broken code. Keep CI green.
- `agents[].role` must exist in `.cursor/agents/`. Don't invent roles.
