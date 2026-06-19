---
description: Research the repo and fill nested CLAUDE.md onboarding docs (one per part, in its real repo dir) plus a top-level map
argument-hint: [optional path to scope onboarding | "refresh"]
---

Populate per-part onboarding artifacts for **every part** of this repository, grounded in the
actual code. The authoritative part tree comes from `.claude/myteam/config.yaml > workspace.parts`;
falls back to deriving from the repo only if that key is absent or empty.

**First run** fills every part. **Re-run** checks the input prompt to decide its mode — never
silently re-does everything. Never clobbers hand-written notes without surfacing the change first.

## Steps

0. Determine mode from the input prompt. See **Re-run Modes**.
1. Resolve the full part tree from `config.yaml > workspace.parts`. See **Part Tree**.
2. Write `.claude/myteam/events/.bus-meta.json` before dispatching any agents. See **Event Bus**.
3. Dispatch one `codebase-onboarding-engineer` agent per top-level part, all in parallel, fresh
   context each. See **Research Agents**.
4. Run the listener concurrently — upsert `workspace-parts.yaml` from completion events. See **Listener**.
5. Update the top-level workspace overview files. See **Top-Level Overview**.
6. Run the verify gate; re-dispatch failing parts (max 2 retries per part). See **Verify Gate**.
7. Mark onboarding complete: finalize `workspace-parts.yaml`, write `.onboarded`, archive events.
   See **Completion**.

## Re-run Modes

Read the prompt after `/myteam-onboard`, pick one mode, or ask:

- **`re-search [scope]`** — re-research specified parts (or all if no scope) from scratch,
  regardless of what changed. Use when the research was wrong or a part needs deepening.
- **`just-changes`** (or no explicit directive) — derive the work set from git history and
  `.claude/myteam/` progress notes: `git log` since the recorded commit + any part names mentioned
  in `.claude/myteam/prds/current/*/progress.txt`. Only those parts are re-researched; unchanged
  parts are skipped.
- **`interactive`** (or ambiguous prompt on a re-run) — use **AskUserQuestion** to let the user
  choose the mode, confirm the work set, or override specific parts before any research begins.

## Part Tree

- **Primary source:** Read `.claude/myteam/config.yaml > workspace.parts`. Each entry defines a
  part: `name`, `dir` (repo path), `category`, `type`, and optional nested `parts`. Flatten into a
  list of (name, dir, parent, isLeaf, children[]) tuples. A part is a **leaf** when it has no
  sub-`parts` or its sub-`parts` are empty.
- **Fallback:** Derive parts by reading the repo tree if `workspace.parts` is absent or empty.
- **Compute kebab paths** for skills: lowercase the hierarchy, join with `/`
  (e.g. `MicroFrontends > AppInjector` → `micro-frontends/app-injector`). Use `dir` for CLAUDE.md
  and AGENT.md paths verbatim (preserving case from config.yaml).
- **Confirm with user** before proceeding when the tree looks unexpected.
- **Seed `workspace-parts.yaml`** with the resolved part list (empty `parts:` entries). See
  **Workspace Parts Registry**.

## Artifacts

Each part produces three artifacts, all grounded in inspected source.

### 1 — `<part.dir>/AGENT.md`

The full onboarding reference doc. Lives **inside the part's own directory** (not in `.claude/`).
Covers: what & why; where it lives; tech stack; build/run/test; configuration; interfaces & contracts;
data & state; dependencies; patterns; gotchas; owners. All 11 sections must be present and non-empty,
or marked `_not found in <where>_` — never omitted.

### 2 — `<part.dir>/CLAUDE.md`

A plain-markdown file placed inside the part's own repo directory. Claude Code auto-loads it when
working in any file under that directory tree. No frontmatter needed. Examples:
- `Services` → `Services/CLAUDE.md`
- `Services/Basket` → `Services/Basket/CLAUDE.md`
- `micro-frontends/packages/app-injector` → `micro-frontends/packages/app-injector/CLAUDE.md`

**Attachment by part type:**
- **Leaf parts**: `<part.dir>/CLAUDE.md` auto-loads for any file under that directory. Write
  focused, actionable do/don'ts for working in that part.
- **Parent parts**: `<part.dir>/CLAUDE.md` auto-loads for all files in its subtree. Summarize the
  parent's own patterns and cross-link each child's `CLAUDE.md`. Do not duplicate child content.

Body: grouped, concrete do/don'ts distilled from AGENT.md (architecture, data, messaging/contracts,
security, config, top gotchas) — substantive, not 3-4 lines — ending with `@<relative-path-to-AGENT.md>`.

**CLAUDE.md best practices:** keep under 500 lines; split into composable files (one per sub-part);
provide concrete examples or referenced files; avoid vague guidance; reference files instead of
copying them; don't duplicate what's already in the codebase.

### 3 — `.claude/skills/workspace/<part-kebab-path>/SKILL.md`

A skill file mirroring the part hierarchy using lowercase kebab names. **The folder name must match
the `name` frontmatter field.** Examples:
- `Services` → `.claude/skills/workspace/services/SKILL.md` (`name: services`)
- `Services/Basket` → `.claude/skills/workspace/services/basket/SKILL.md` (`name: basket`)
- `micro-frontends/packages/app-injector` → `.claude/skills/workspace/micro-frontends/packages/app-injector/SKILL.md` (`name: app-injector`)

**Frontmatter fields:**

| Field | Type | Required | Use |
|---|---|---|---|
| `name` | string | yes | Lowercase letters, numbers, hyphens only. Must match parent folder name. |
| `description` | string | yes | What the skill does and when to use it. |
| `paths` | string or list | no | Glob patterns scoping when the skill is visible. |
| `disable-model-invocation` | boolean | no | `true` = explicit `/name` only, never auto-applied. |
| `metadata` | object | no | Arbitrary key-value pairs (e.g. `author`, `version`, `part-dir`). |

Workspace part skills default to auto (agent picks them up from `description`) so agents load them
when working in that part's files.

Body: concise agent briefing — what the part is, key files to read first, top patterns, top gotchas,
and a link to the full AGENT.md.

## Workspace Parts Registry

`.claude/myteam/workspace-parts.yaml` — persisted manifest grown **incrementally** during a run.
One entry upserted per part as it completes (via the listener), not batch-written at the end.

```yaml
# generated by /myteam-onboard — do not edit by hand
generated: "<date>"
commit: "<sha>"
source: config.yaml   # or: repo-derived
parts:
  - Basket:
      dir: Services/Basket
      category: backend
      type: aspnet
      parent: Services
      kebab: basket
      status: done   # done | pending | needs-attention
      agent_md: Services/Basket/AGENT.md
      claude_md: Services/Basket/CLAUDE.md
      skill: .claude/skills/workspace/services/basket/SKILL.md
```

## Event Bus

Lightweight file-based bus in `.claude/myteam/events/` used only to signal part completion so the
listener can upsert the registry.

```
.claude/myteam/events/
├── .bus-meta.json                         ← orchestrator writes before dispatching
└── research-complete-<part-kebab>.json    ← each part agent writes when done
```

**`.bus-meta.json`** — written once by the orchestrator before any agents start:
```json
{
  "run-id": "<timestamp-based id>",
  "commit": "<sha>",
  "mode": "changes",
  "total-parts": 24
}
```

**`research-complete-<part-kebab>.json`** — written by each part agent after finishing its artifacts:
```json
{
  "type": "research-complete",
  "run-id": "<matches .bus-meta run-id>",
  "part": "Basket",
  "dir": "Services/Basket",
  "kebab": "basket",
  "parent": "Services",
  "status": "done",
  "artifacts": {
    "agent_md": "Services/Basket/AGENT.md",
    "claude_md": "Services/Basket/CLAUDE.md",
    "skill": ".claude/skills/workspace/services/basket/SKILL.md"
  },
  "depth-bar": "pass",
  "sections-filled": 11,
  "paths-verified": true,
  "notes": ""
}
```

## Research Agents

The orchestrator dispatches one **`codebase-onboarding-engineer`** agent per **top-level part** in
`workspace-parts.yaml` — all in parallel, fresh context each. Skip any part that already has a
`research-complete-<part-kebab>.json` event from this run.

**Each agent is scoped to its entire subtree** (parent + all nested children). It researches every
part in that subtree itself, in one session — no sub-dispatch.

Within its session, each agent:
1. Researches children first (leaf nodes), writing each child's three artifacts.
2. Emits `research-complete-<child-kebab>.json` for each child as it completes.
3. Assembles the parent's own three artifacts (summary + cross-links to children).
4. Emits `research-complete-<parent-kebab>.json` last.

Top-level parts with no children skip steps 1–2 and emit one event.

**Brief each agent with:**
- The top-level part's `dir` as the canonical scope root.
- The part's full subtree from config.yaml (children + their dirs, kebab paths, target artifact paths).
- Target output paths for each node: `<dir>/AGENT.md`, `<dir>/CLAUDE.md`,
  `.claude/skills/workspace/<kebab-path>/SKILL.md`.
- Output formats from `.claude/agents/codebase-onboarding-engineer.md` (AGENT.md and CLAUDE.md live
  in the repo dir, not in `.claude/`).
- Instruction to emit `research-complete-<part-kebab>.json` after each node's artifacts are written.

**Retry:** If an agent returns thin output (below depth bar), re-dispatch with the specific gaps
before moving on. Re-dispatched agent overwrites the same artifacts and re-emits its event
(max 3 retries).

## Listener

Runs **concurrently** with Step 3 — does not block agents and is not blocked by them. Watches
`.claude/myteam/events/` for new `research-complete-*.json` files. For each one:

1. Read the event file.
2. Upsert the part's entry in `workspace-parts.yaml` — targeted write to that part's YAML block,
   never rewrite the whole file (concurrent fast/slow agents must not clobber each other).
3. Log progress: `[N/total] <part-name> — <status>` (total from `.bus-meta.json`).

Continues until processed event count equals `.bus-meta.total-parts`.

If a part has hand-written notes in its existing AGENT.md or CLAUDE.md, surface what changed before
overwriting.

## Top-Level Overview

Three files that survive across re-runs as the cross-cutting index (always regenerated):

- **`.claude/rules/workspace/AGENT.md`** — big-picture part map: table of Part | Repo path | Summary
  over all top-level parts; cross-cutting patterns (shared libs, messaging, persistence, observability,
  config, auth). Sync the table — add rows for new parts, remove stale ones.
- **`.claude/skills/workspace/SKILL.md`** — description-based auto-attach skill; lists all top-level
  parts with one-line summaries and links to their `.claude/skills/workspace/<part>/SKILL.md`. Ends
  with `@.claude/rules/workspace/AGENT.md`.
- **`.claude/rules/workspace/.onboarded`** — empty marker file written after the verify gate passes.

## Verify Gate

This is a **hard gate** — must pass before completion.

**Completeness:** Every part in `config.yaml > workspace.parts` must have all three artifacts on
disk. Report any missing as `needs-attention`.

**Structure per part:**
- `<part.dir>/AGENT.md` exists and is non-empty.
- `<part.dir>/CLAUDE.md` exists and is non-empty.
- `.claude/skills/workspace/<part-kebab-path>/SKILL.md` exists with valid frontmatter.

**Depth bar:**
- Every AGENT.md section present and non-empty (or `_not found_`).
- `Where it lives`, `Interfaces & contracts`, `Configuration` each cite at least one path that
  actually exists on disk.
- `Build / run / test` has a real command with port(s).
- Each `CLAUDE.md` has ≥ 2 grouped do/don't headings with ≥ 6 bullets total and ends with `@<path>`.
- Each `SKILL.md` has `name` matching its parent folder name (lowercase-kebab) and a `description`.

**Re-run loop:** any part that fails → re-dispatch its agent with the specific gaps, rewrite its
files, re-check. Capped at **2 re-runs per part**; if still failing, mark `needs-attention` in
`workspace-parts.yaml`.

**Status table** (emit before Completion):
```
Part | status | sections filled | paths verified | pass/fail
```
Only work-set parts are re-verified; skipped parts carry their prior status.

## Completion

Once the verify gate passes (or remaining failures are listed as `needs-attention`):

- Verify `.claude/myteam/workspace-parts.yaml` has an entry for every config.yaml part (the
  listener should have populated all of them incrementally).
- Update only the top-level `commit: <git rev-parse HEAD>` field — do not rewrite the whole file.
- Write `.claude/rules/workspace/.onboarded` (empty marker) to signal completion.
- Archive the event bus: move `.claude/myteam/events/` contents to
  `.claude/myteam/events/archive/<run-id>/`, or delete them. The run-id comes from `.bus-meta.json`.

## Guardrails

- **AGENT.md lives in the repo, not `.claude/`** — write it to `<part.dir>/AGENT.md` so it travels with the code.
- **CLAUDE.md lives in the part's own directory** — write it to `<part.dir>/CLAUDE.md` so Claude Code auto-loads it when working in that area.
- **Skills mirror the part hierarchy** — `.claude/skills/workspace/<part-kebab-path>/SKILL.md`.
- Facts must be grounded in files (real paths, real commands). Anything uncertain → `_not found in <where>_`.
- Do not write any part's docs from orchestrator memory — only agents write artifacts.
