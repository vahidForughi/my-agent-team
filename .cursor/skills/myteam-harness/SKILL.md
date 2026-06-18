---
name: myteam-harness
description: "The merged execution loop for the myteam harness. Use when executing a PRD: iterate stories by priority, delegate each to its assigned agents in parallel, run quality gates, commit, and append learnings to progress.txt. Triggered by /myteam-do phase 2."
license: MIT
compatibility: Reads .cursor/myteam/config.yaml, a prds/current/<prd>/prd.json + progress.txt, and .cursor/agents/.
metadata:
  author: myteam
  version: "1.0"
---

# myteam harness — execution loop

The merged strategy: fresh-context `prd.json` loop, with per-story **agent orchestration**
and habit of leaving a clean, traceable trail.

## Inputs

- Active PRD: `.cursor/myteam/prds/current/<prd>/prd.json` and its `progress.txt`.
- Per-part context: `.cursor/rules/workspace/_<part>/AGENT.md` (curated doc) for every part a story touches.
- Recent history: `git log` for the paths a story touches (see step 1) — cheaper and more current
  than re-reading prose.
- Defaults & quality gates: `.cursor/myteam/config.yaml`.
- Agent roles: `.cursor/agents/<role>.md` (+ `.cursor/rules/<role>.mdc`).

## Context isolation (why this loop stays cheap)

loop is cheap because **each iteration is a fresh process**. Reproduce that here: run **each
story in its own fresh-context subagent** — this is required, not optional. The orchestrator stays
small by **re-deriving remaining work from disk at the start of every iteration** — re-read
`prd.json` (`passes` flags) and the `progress.txt` `## Codebase Patterns` section — rather than
keeping a running narrative in context. It must **not** carry previous stories' full transcripts,
file dumps, or agent outputs into the next iteration. When a story finishes, the runner writes its
one-line summary to `progress.txt` and that summary is then **dropped from the orchestrator's
context** — it is not accumulated into an in-context list that grows with the story count.

**Keep briefs prompt-cache-friendly.** Order every agent brief **stable prefix first** — the harness
rules, the `config.yaml` context block, and the touched part's `AGENT.md` — then the **variable,
story-specific bits last** (title/description/acceptance criteria/`git log` findings). A stable prefix
can be cache-reused across stories and agents; leading with the variable parts defeats that.

## The loop (one story per iteration, fresh context)

1. **Read state.** Open `prd.json` and the PRD `progress.txt`. Read the `## Codebase Patterns`
   section at the top of `progress.txt` **first** — it carries forward what earlier iterations
   learned. Then, for each part the story touches, read that part's
   `.cursor/rules/workspace/_<part>/AGENT.md`, and check recent history for the paths it will
   touch (e.g. `git log --oneline -n 15 -- <path>`, `git log -p -n 3 -- <file>`) to see how that
   code recently changed and why.
2. **Branch.** Ensure you are on `prd.json.branchName` (`myteam/<feature>`). If not, check it out
   or create it from `main`.
3. **Pick the story.** Choose the **highest-priority** story (lowest `priority` number) where
   `passes: false`. If none remain, go to **Stop**.
4. **Delegate to assigned agents (mandatory fresh-context subagent each).** Read the story's
   `agents[]`. For each `{ role, count }`, engage that role from `.cursor/agents/` with `count`
   instances, capped by the story's `parallelism` (fallback `config.yaml > defaults.defaultParallelism`,
   now **1**). Default is a single agent; only fan out when the story is genuinely complex with
   independent sub-work. Run each on the story's `model` if set, else `config.yaml > defaults.model`
   (agents carry `model: inherit`, so this overrides per run — keep grunt stories on the cheaper tier).
   Give each agent a **scoped, self-contained brief, ordered prefix-first** (stable: harness rules,
   `config.yaml` context, the relevant part's `.cursor/rules/workspace/_<part>/AGENT.md`; then variable:
   story title, description, acceptance criteria, and the `git log` findings from step 1) — **not** the
   orchestrator's wider context or prior stories' transcripts.
   - Run independent agents concurrently; serialize where one depends on another's output.
   - Each agent returns a concise result (what changed, files, learnings); the orchestrator reconciles
     those summaries — it does not absorb every agent's full working transcript.
5. **Reconcile.** Merge the agents' work into a single coherent change that satisfies **all** of
   the story's acceptance criteria. Resolve conflicts; keep the change focused and minimal.
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
10. **Consolidate.** Promote general, reusable learnings to the `## Codebase Patterns` section at
    the top of the PRD `progress.txt`; promote durable part-specific patterns into that part's
    `.cursor/rules/workspace/_<part>/AGENT.md` (which the part's `<part>.mdc` surfaces to Cursor).

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
