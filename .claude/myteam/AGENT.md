# myteam — harness agent guidance

The execution loop has **one source of truth**: `.claude/skills/myteam-harness/SKILL.md`.
Load that skill when executing a PRD; do not re-describe the loop here (it used to be duplicated,
which wasted context). This file only states the invariants an agent must never break.

@.claude/skills/myteam-harness/SKILL.md

## Invariants

- **One story per iteration, in its own fresh-context subagent (Agent tool).** The orchestrator hands
  a story only what it needs (the story, the touched parts' `CLAUDE.md`, recent `git log` for those
  paths, and a one-line summary of prior stories) — never the accumulated transcript.
- **`prd.json` is the source of truth for `passes`;** `progress.txt` is append-only.
- **`agents[].role` must exist in `.claude/agents/`** — never invent roles. Spawn each via the Agent
  tool with `subagent_type: "<role>"`. Default count/parallelism is 1; raise only for genuinely
  complex, independent work.
- **Never commit broken code.** Quality gates pass before commit; one story per commit.
- **Stop** when every story has `passes: true` → reply `<promise>COMPLETE</promise>`.
