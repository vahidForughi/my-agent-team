---
name: myteam-harness
description: "The merged execution loop for the myteam harness — inspired by Ralph's prd.json loop and OpenSpec discipline. Use when executing a PRD: iterate stories by priority, delegate each to its assigned agents in parallel, run quality gates, commit, and append learnings to progress.txt. Triggered by /myteam-run phase 2."
license: MIT
compatibility: Reads .cursor/myteam/config.yaml, a prds/current/<prd>/prd.json + progress.txt, and .cursor/agents/.
metadata:
  author: myteam
  version: "1.0"
  inspiredBy: "ralph CLAUDE.md loop + openspec propose/apply/archive"
---

# myteam harness — execution loop

The merged strategy: Ralph's fresh-context `prd.json` loop, with per-story **agent orchestration**
and OpenSpec's habit of leaving a clean, traceable trail.

## Inputs

- Active PRD: `.cursor/myteam/prds/current/<prd>/prd.json` and its `progress.txt`.
- Defaults & quality gates: `.cursor/myteam/config.yaml`.
- Agent roles: `.cursor/agents/<role>.md` (+ `.cursor/rules/<role>.mdc`).

## The loop (one story per iteration, fresh context)

1. **Read state.** Open `prd.json` and `progress.txt`. Read the `## Codebase Patterns` section
   at the top of `progress.txt` **first** — it carries forward what earlier iterations learned.
2. **Branch.** Ensure you are on `prd.json.branchName` (`myteam/<feature>`). If not, check it out
   or create it from `main`.
3. **Pick the story.** Choose the **highest-priority** story (lowest `priority` number) where
   `passes: false`. If none remain, go to **Stop**.
4. **Delegate to assigned agents.** Read the story's `agents[]`. For each `{ role, count }`,
   engage that role from `.cursor/agents/` with `count` parallel instances, capped by the story's
   `parallelism` (fallback `config.yaml > defaults.defaultParallelism`). Give each agent the story
   title, description, acceptance criteria, and relevant `.cursor/rules/workspace/_<part>/AGENT.md`.
   - Run independent agents concurrently; serialize where one depends on another's output.
5. **Reconcile.** Merge the agents' work into a single coherent change that satisfies **all** of
   the story's acceptance criteria. Resolve conflicts; keep the change focused and minimal.
6. **Quality gates.** Run `config.yaml > defaults.qualityGates` (typecheck / lint / test). For UI
   stories, verify in the browser and capture a screenshot for the log. Do not proceed on failure.
7. **Commit.** Commit all changes: `feat: [US-id] - [Story Title]`. Never commit broken code.
8. **Mark done.** Set `passes: true` for the story in `prd.json`.
9. **Log progress.** APPEND (never overwrite) to `progress.txt`:
   ```
   ## [YYYY-MM-DD HH:MM] - US-00X
   - What was implemented (and which agents did what)
   - Files changed
   - **Learnings for future iterations:**
     - Patterns discovered
     - Gotchas encountered
   ---
   ```
10. **Consolidate.** Promote general, reusable learnings to the `## Codebase Patterns` section at
    the top of `progress.txt`; promote part-specific patterns to `.cursor/rules/workspace/_<part>/AGENT.md`.

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
