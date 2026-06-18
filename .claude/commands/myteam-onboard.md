---
description: Research the repo and fill nested CLAUDE.md onboarding docs (one per part, in its real repo dir) plus a top-level map
argument-hint: [optional path to scope onboarding | "refresh"]
---

Populate per-part onboarding artifacts for **every part** of this repository by using codebase-onboarding-engineer agent,
grounded in the actual code. The authoritative part tree comes from
`.claude/myteam/config.yaml > workspace.parts`; falls back to deriving from the repo only if that
key is absent or empty.

**First run** fills every part. **Re-run** checks the input prompt to decide its mode — never
silently re-does everything. Never clobbers hand-written notes without surfacing the change first.

**Input (re-run modes — read the prompt, pick one, or ask):**
- **`re-search [scope]`** — re-research specified parts (or all if no scope) from scratch,
  regardless of what changed. Use when the research was wrong or a part needs deepening.
- **`just-changes`** (or no explicit directive) — derive the work set from git history and
  `.claude/myteam/` progress notes: `git log` since the recorded commit
    + any part names mentioned in `.claude/myteam/prds/current/*/progress.txt`. Only those parts
      are re-researched; unchanged at-bar parts are skipped.
- **`interactive`** (or ambiguous prompt on a re-run) — use **AskUserQuestion** to let the user
  choose the mode, confirm the work set, or override specific parts before any research begins.

---

## Approach

Each part of the repo produces **three artifacts**, all grounded in inspected source:

### 1 — `<part.dir>/AGENT.md` (lives in the repo, not in `.claude/`)
The full onboarding reference doc for this part — lives **inside the part's own directory**
what & why; where it lives; tech stack; build/run/test; configuration; interfaces & contracts;
data & state; dependencies; patterns; gotchas; owners.

### 2 — `<part.dir>/CLAUDE.md` (Claude Code per-directory rule)
A plain-markdown file placed inside the part's own repo directory. Claude Code auto-loads it
when working in any file under that directory tree. No frontmatter needed. Examples:
- `Services` → `Services/CLAUDE.md`
- `Services/Basket` → `Services/Basket/CLAUDE.md`
- `micro-frontends/packages/app-injector` → `micro-frontends/packages/app-injector/CLAUDE.md`

**Attachment by part type:**
- **Leaf parts**: `<part.dir>/CLAUDE.md` auto-loads when Claude Code opens any file under that
  directory. Write a focused, actionable do/don't reference for working in that part.
- **Parent parts**: `<part.dir>/CLAUDE.md` auto-loads for all files in its subtree. Summarize the
  parent's own patterns and cross-link each child's `CLAUDE.md`. Do not duplicate child content.

**Best practices**
Good CLAUDE.md files are focused, actionable, and scoped.
- Keep files under 500 lines
- Split large files into multiple composable CLAUDE.md files (one per sub-part)
- Provide concrete examples or referenced files
- Avoid vague guidance — write like clear internal docs
- Reference files instead of copying their contents — this keeps CLAUDE.md short and prevents staleness

**What to avoid**
- **Copying entire style guides:** Use a linter instead. Agent already knows common conventions.
- **Documenting every possible command:** Agent knows common tools like npm, git, and pytest.
- **Adding instructions for edge cases that rarely apply:** Keep focused on frequently-used patterns.
- **Duplicating what's already in your codebase:** Point to canonical examples instead.

Body: grouped, concrete do/don'ts distilled from AGENT.md (architecture, data,
messaging/contracts, security, config, top gotchas) — substantive, not 3-4 lines — ending with
`@<relative-path-to-AGENT.md>`.

### 3 — `.claude/skills/workspace/<part-kebab-path>/SKILL.md` (skill file, mirrors part hierarchy)
A skill file nested to match the part hierarchy using lowercase kebab names. The **folder name must
match the `name` frontmatter field** (Claude Code requirement). Examples:
- `Services` → `.claude/skills/workspace/services/SKILL.md` (`name: services`)
- `Services/Basket` → `.claude/skills/workspace/services/basket/SKILL.md` (`name: basket`)
- `micro-frontends/packages/app-injector` → `.claude/skills/workspace/micro-frontends/packages/app-injector/SKILL.md` (`name: app-injector`)

**Frontmatter fields**:

| Field | Type | Required | Use |
|---|---|---|---|
| `name` | string | yes | Lowercase letters, numbers, hyphens only. **Must match the parent folder name.** Used for `/name` invocation. |
| `description` | string | yes | What the skill does and when to use it. Agent reads this to decide relevance. |
| `paths` | string or list | no | Glob patterns scoping when the skill is visible. Prefer over legacy `globs`. |
| `disable-model-invocation` | boolean | no | `true` = skill only loads via explicit `/name` call, never auto-applied. |
| `metadata` | object | no | Arbitrary key-value pairs for additional context (e.g. `author`, `version`, `part-dir`). |

**Invocation modes**: auto (agent judges from `description`), manual (`/skill-name` in chat), or
explicit-only (`disable-model-invocation: true`). Workspace part skills should default to auto so
agents pick them up when working in that part's files.

Body: a concise agent briefing — what the part is, key files to read first, top patterns, top
gotchas, and a link to the full AGENT.md. Written for an agent that needs to work in this part:
give it what to read, not what to do.

### Top-level workspace overview (always present)
Two files that survive across re-runs as the cross-cutting index:
- `.claude/rules/workspace/AGENT.md` — big-picture part map (table: Part | Repo path | Summary)
  covering all top-level parts, the nesting convention, and cross-cutting patterns.
- `.claude/skills/workspace/SKILL.md` — top-level workspace skill (description-based auto-attach),
  listing all parts and linking to their sub-skills. Ends with `@.claude/rules/workspace/AGENT.md`.
- `.claude/rules/workspace/.onboarded` — empty marker file written after Phase C passes.

### Workspace parts registry (`.claude/myteam/workspace-parts.yaml`)
The persisted manifest **grown incrementally** during a run — one entry upserted per part as it
completes (via the event bus listener), not batch-written at the end. Tracks every part from
config.yaml, its three artifact paths, onboarding status, and the commit SHA. Incremental re-runs
diff against the recorded `commit` to find changed parts.

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
  - 
```

### Event bus (`.claude/myteam/events/`)
Lightweight file-based bus used **only** to signal part completion so the listener can upsert the
registry. Agent dispatch is unchanged — parallel batches as always.

```
.claude/myteam/events/
├── .bus-meta.json                         ← orchestrator writes before dispatching
└── research-complete-<part-kebab>.json    ← each part agent writes when done
```

**`.bus-meta.json`** (orchestrator writes once, before any agents start):
```json
{
  "run-id": "<timestamp-based id>",
  "commit": "<sha>",
  "mode": "changes",
  "total-parts": 24
}
```

**`research-complete-<part-kebab>.json`** (each part agent writes after finishing its artifacts):
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

---

## Steps

Each step

### 1 — Resolve the part tree
- **Primary source:** Read `.claude/myteam/config.yaml > workspace.parts`. Each entry defines a
  part: `name`, `dir` (repo path), `category`, `type`, and optional nested `parts`. Flatten into a
  list of (name, dir, parent, isLeaf, children[]) tuples. A part is a **leaf** when it has no
  sub-`parts` or its sub-`parts` are empty. The orchestrator uses only **top-level entries** for
  initial dispatch; each agent receives its full subtree in its brief and handles all children
  itself — the orchestrator does not dispatch separate agents for nested parts.
- **Fallback:** Read and consider `config.yaml > workspace.parts`, derive parts by reading
  the repo tree.
- **Compute kebab paths** for skills: lowercase the hierarchy, join with `/` (e.g.
  `MicroFrontends > AppInjector` → `micro-frontends/app-injector`). Use `dir` for CLAUDE.md and
  AGENT.md paths verbatim (preserving case from config.yaml).
- **Apply Tree:** interactive with user to apply workspace part tree.
- **Workspace Parts:** generate `.claude/myteam/workspace-parts.yaml` file with empty parts:.

### 2 — Research (per-part, fresh context, read-only)
Before dispatching any agents, write `.claude/myteam/events/.bus-meta.json` with the current
`run-id` (timestamp), `commit` (from `git rev-parse HEAD`), `mode`, and `total-parts` count.

The orchestrator dispatches one **`codebase-onboarding-engineer`** agent per **top-level parent**
in `.claude/myteam/workspace-parts.yaml > parts` — all in parallel, fresh context each.

**Each agent is scoped to its entire subtree** (parent + all nested children). It researches every
part in that subtree itself, in one session — no sub-dispatch. Having full subtree context lets the
parent AGENT.md accurately cross-reference its children.

Within its session, each agent:
1. Researches children first (leaf nodes), writing each child's 3 artifacts.
2. Emits `research-complete-<child-kebab>.json` for each child as it completes.
3. Assembles the parent's own 3 artifacts (summary + cross-links to children).
4. Emits `research-complete-<parent-kebab>.json` last.

Top-level parts with no children (e.g. `Client`, `Diagrams`) skip steps 1-2 — they emit one event.

Do not write any part's docs from orchestrator memory — only agents write artifacts.

Brief each agent with:
- The top-level part's `dir` as the canonical scope root.
- The part's full `parts` subtree from config.yaml (children + their dirs, kebab paths, and
  target artifact paths), so the agent knows every node it must cover.
- The target output paths for each node: `<dir>/AGENT.md`, `<dir>/CLAUDE.md`,
  `.claude/skills/workspace/<kebab-path>/SKILL.md`.
- The output formats from `.claude/agents/codebase-onboarding-engineer.md` (AGENT.md and CLAUDE.md
  live in the repo dir, not in `.claude/`).
- After writing each part's three artifacts, **emit**
  `.claude/myteam/events/research-complete-<part-kebab>.json` (schema in Approach → Event bus).
  Events outside the part directory are the agent's only writes to shared state.

Each agent's total deliverable (for its full subtree):
- One `AGENT.md` per node (all 11 sections, grounded in source, real paths).
- One `CLAUDE.md` per node (plain markdown, grouped do/don'ts, ends with `@<AGENT.md path>`).
- One `SKILL.md` per node (frontmatter + concise briefing + AGENT.md link).
- One `research-complete-*.json` event per node in `.claude/myteam/events/`.

**Retry:** If an agent returns thin output (below depth bar), re-dispatch with the specific gaps
before moving on. The re-dispatched agent overwrites the same artifacts and re-emits its event (max_retry_times: 3).

### 3 — Listener: upsert workspace-parts.yaml from completion events
Runs **concurrently** with Step 2 part agents — does not block them and is not blocked by them.
Watches `.claude/myteam/events/` for new `research-complete-*.json` files. For each one:
1. Read the event file.
2. Upsert the part's entry in `.claude/myteam/workspace-parts.yaml` (insert if new, update
   `status` / `artifacts` / `depth-bar` if the entry already exists from a prior run).
3. Log progress: `[N/total] <part-name> — <status>` (where total comes from `.bus-meta.json`).

Continues until the count of processed `research-complete-*` files equals `.bus-meta.total-parts`.
Each upsert is a targeted write to that part's YAML block — never rewrites the whole file from
scratch so concurrent writes from fast vs. slow agents don't clobber each other.

### 6 — Phase B: Assemble and write each part's artifacts
Write only parts in the work set:

**For each leaf part** — write all three artifacts from the research agent's returned content (not
from memory):
- `<part.dir>/AGENT.md` — all 11 sections; mark not-found fields as `_not found in <where>_`,
  never omit.
- `<part.dir>/CLAUDE.md` — plain markdown, no frontmatter; body: grouped do/don'ts; ends with
  `@<relative path to AGENT.md>`.
- `.claude/skills/workspace/<part-kebab-path>/SKILL.md` — frontmatter: `name: <folder-name>`,
  `description: <one-line>`, `metadata: { part-dir: <dir> }`; body: briefing + AGENT.md link.

**For each parent part** — write artifacts that summarize and link to the now-completed sub-parts:
- `<part.dir>/AGENT.md` — its own all 11 sections; mark not-found fields as `_not found in <where>_`,
  never omit + summary table linking each sub-part's AGENT.md.
- `<part.dir>/CLAUDE.md` — plain markdown, no frontmatter; body: summarizes parent patterns, lists
  sub-parts with links to their `CLAUDE.md` files; same do/don'ts + `@<relative AGENT.md path>`.
- `.claude/skills/workspace/<part-kebab>/SKILL.md` — frontmatter: `name: <folder-name>`,
  `description: <one-line>`; body: briefing + AGENT.md link + lists sub-part skills and links to them.

If a part has hand-written notes in its AGENT.md or CLAUDE.md, surface what changed before overwriting.

### 7 — Update the top-level workspace overview
- **`.claude/rules/workspace/AGENT.md`**: full part map (table: Part | Repo path | Summary) over
  all top-level parts from config.yaml; cross-cutting patterns (shared libs, messaging, persistence,
  observability, config, auth). Sync the table — add rows for new parts, remove stale ones.
- **`.claude/skills/workspace/SKILL.md`**: description-based auto-attach skill; lists all
  top-level parts with one-line summaries and links to their `.claude/skills/workspace/<part>/SKILL.md`.
  Ends with `@.claude/rules/workspace/AGENT.md`.

### 8 — Phase C: Verify gate (read-only checks + re-run loop)
This is a **hard gate**.

**Completeness against config.yaml:** Every part in `config.yaml > workspace.parts` must have all
three artifacts on disk. Report any missing as `needs-attention`.

**Structure per part:**
- `<part.dir>/AGENT.md` exists and is non-empty.
- `<part.dir>/CLAUDE.md` exists and is non-empty.
- `.claude/skills/workspace/<part-kebab-path>/SKILL.md` exists with valid frontmatter.

**Depth bar** (from `.claude/agents/codebase-onboarding-engineer.md`):
- Every AGENT.md section present and non-empty (or `_not found_`).
- `Where it lives`, `Interfaces & contracts`, `Configuration` each cite at least one path that
  actually exists on disk.
- `Build / run / test` has a real command with port(s).
- Each `CLAUDE.md` has ≥ 2 grouped do/don't headings with ≥ 6 bullets total and ends with `@<path>`.
- Each `SKILL.md` has `name` matching its parent folder name (lowercase-kebab) and a `description`.

**Re-run loop:** any part that fails → re-dispatch its `codebase-onboarding-engineer` agent with
the specific gaps, rewrite its files, re-check. Capped at **2 re-runs per part**; if still failing,
mark `needs-attention` in `workspace-parts.yaml` and the status table.

**Status table** (emit before step 10):
```
Part | status | sections filled | paths verified | pass/fail
```
Only work-set parts are re-verified; skipped parts carry their prior status.

### 10 — Mark onboarding complete
Once the Phase C gate passes (or remaining failures are listed as `needs-attention`):
- Verify `.claude/myteam/workspace-parts.yaml` has an entry for every config.yaml part (the
  listener should have populated all of them incrementally). Update only the top-level
  `commit: <git rev-parse HEAD>` field — do not rewrite the whole file.
- Write `.claude/rules/workspace/.onboarded` (empty marker file) to signal completion.
- Archive or clear the event bus: move `.claude/myteam/events/` contents to
  `.claude/myteam/events/archive/<run-id>/`, or delete them. The run-id comes from `.bus-meta.json`.

---

## Guardrails

- **AGENT.md lives in the repo, not `.claude/`** — write it to `<part.dir>/AGENT.md` so it travels with the code.
- **CLAUDE.md lives in the part's own directory** — write it to `<part.dir>/CLAUDE.md` so Claude Code auto-loads it when working in that area.
- **Skills mirror the part hierarchy** — `.claude/skills/workspace/<part-kebab-path>/SKILL.md`.
- Facts must be grounded in files (real paths, real commands). Anything uncertain → `_not found in <where>_`.
- CLAUDE.md body must be file patterns (`<path>/**/*`) so Claude Code auto-attaches reliably.
