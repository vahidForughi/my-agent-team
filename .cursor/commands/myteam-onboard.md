---
name: /myteam-onboard
id: myteam-onboard
category: Harness
description: Research the repo and fill part AGENT.md files, .cursor/rules/workspace/<part>/*.mdc rules, and .cursor/skills/workspace/<part>/SKILL.md for every part in config.yaml
---

Populate per-part onboarding artifacts for **every part** of this repository by using codebase-onboarding-engineer agent,
grounded in the actual code. The authoritative part tree comes from
`.cursor/myteam/config.yaml > workspace.parts`; falls back to deriving from the repo only if that
key is absent or empty.

**First run** fills every part. **Re-run** checks the input prompt to decide its mode — never
silently re-does everything. Never clobbers hand-written notes without surfacing the change first.

**Input (re-run modes — read the prompt, pick one, or ask):**
- **`re-search [scope]`** — re-research specified parts (or all if no scope) from scratch,
  regardless of what changed. Use when the research was wrong or a part needs deepening.
- **`just-changes`** (or no explicit directive) — derive the work set from git history and
  `.cursor/myteam/` progress notes: `git log` since the recorded commit
  + any part names mentioned in `.cursor/myteam/prds/current/*/progress.txt`. Only those parts
  are re-researched; unchanged at-bar parts are skipped.
- **`interactive`** (or ambiguous prompt on a re-run) — use **AskUserQuestion** to let the user
  choose the mode, confirm the work set, or override specific parts before any research begins.

---

## Approach

Each part of the repo produces **three artifacts**, all grounded in inspected source:

### 1 — `<part.dir>/AGENT.md` (lives in the repo, not in `.cursor/`)
The full onboarding reference doc for this part — lives **inside the part's own directory**
what & why; where it lives; tech stack; build/run/test; configuration; interfaces & contracts; 
data & state; dependencies; patterns; gotchas; owners.

### 2 — `.cursor/rules/workspace/<part.dir>/<part.name>.mdc` (Cursor rule, mirrors repo path)
A Cursor-native rule file, placed at a path that mirrors the part's repo location under
`.cursor/rules/`. Examples:
- `Services` → `.cursor/rules/Services/services.mdc`
- `Services/Basket` → `.cursor/rules/Services/Basket/basket.mdc`
- `micro-frontends/packages/app-injector` → `.cursor/rules/micro-frontends/packages/app-injector/app-injector.mdc`

**Frontmatter fields**:

| Field | Type | Use |
|---|---|---|
| `description` | string | Agent reads this to decide relevance (required for agent-requested rules) |
| `globs` | string | Comma-separated glob patterns; rule auto-attaches when a matching file is in context |
| `alwaysApply` | boolean | `true` = included in every session; `false` = conditional |

**Attachment mode by part type** — always set `alwaysApply: false`:
- **Leaf parts**: set `globs: <part.dir>/**/*` (file pattern, not bare `dir/**`). Rule auto-attaches when the user opens any file under that part. Omit `description`.
- **Parent parts**: omit `globs`; set `description` only. Agent includes the rule when it judges it relevant. Never set `globs` on a parent — it would double-attach with child rules.
- **Explicit-only** (rare): omit both `globs` and `description`. User must `@`-mention the rule manually.

**Best practices**
Good rules are focused, actionable, and scoped.
- Keep rules under 500 lines
- Split large rules into multiple, composable rules
- Provide concrete examples or referenced files
- Avoid vague guidance. Write rules like clear internal docs
- Reference files instead of copying their contents—this keeps rules short and prevents them from becoming stale as code changes

**What to avoid in rules**
- **Copying entire style guides:** Use a linter instead. Agent already knows common style conventions.
- **Documenting every possible command:** Agent knows common tools like npm, git, and pytest.
- **Adding instructions for edge cases that rarely apply:** Keep rules focused on patterns you use frequently.
- **Duplicating what's already in your codebase:** Point to canonical examples instead of copying code.


Body: grouped, concrete do/don'ts distilled from AGENT.md (architecture, data,
messaging/contracts, security, config, top gotchas) — substantive, not 3-4 lines — ending with
`@<relative-path-to-AGENT.md>`.

### 3 — `.cursor/skills/workspace/<part-kebab-path>/SKILL.md` (skill file, mirrors part hierarchy)
A skill file nested to match the part hierarchy using lowercase kebab names. The **folder name must
match the `name` frontmatter field** (Cursor requirement). Examples:
- `Services` → `.cursor/skills/workspace/services/SKILL.md` (`name: services`)
- `Services/Basket` → `.cursor/skills/workspace/services/basket/SKILL.md` (`name: basket`)
- `micro-frontends/packages/app-injector` → `.cursor/skills/workspace/micro-frontends/packages/app-injector/SKILL.md` (`name: app-injector`)

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
- `.cursor/rules/workspace/AGENT.md` — big-picture part map (table: Part | Repo path | Summary)
  covering all top-level parts, the nesting convention, and cross-cutting patterns.
- `.cursor/rules/workspace/workspace.mdc` — repo-wide Cursor rule (`description`-based,
  `alwaysApply: false`), ending with `@AGENT.md`.
- `.cursor/skills/workspace/SKILL.md` — top-level workspace skill listing all parts and linking to
  their sub-skills.

### Workspace parts registry (`.cursor/myteam/workspace-parts.yaml`)
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
      mdc: .cursor/rules/Services/Basket/basket.mdc
      skill: .cursor/skills/workspace/services/basket/SKILL.md
```

### Event bus (`.cursor/myteam/events/`)
Lightweight file-based bus used **only** to signal part completion so the listener can upsert the
registry. Agent dispatch is unchanged — parallel batches as always.

```
.cursor/myteam/events/
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
    "mdc": ".cursor/rules/Services/Basket/basket.mdc",
    "skill": ".cursor/skills/workspace/services/basket/SKILL.md"
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
- **Primary source:** Read `.cursor/myteam/config.yaml > workspace.parts`. Each entry defines a
  part: `name`, `dir` (repo path), `category`, `type`, and optional nested `parts`. Flatten into a
  list of (name, dir, parent, isLeaf) tuples. A part is a **leaf** when it has no sub-`parts`, or
  when its sub-`parts` are empty.
- **Fallback:** Read and consider `config.yaml > workspace.parts`, derive parts by reading
  the repo tree.
- **Compute kebab paths** for skills: lowercase the hierarchy, join with `/` (e.g.
  `MicroFrontends > AppInjector` → `micro-frontends/app-injector`). Use `dir` for rule and AGENT.md
  paths verbatim (preserving case from config.yaml).
- **Apply Tree:** interactive with user to apply workspace part tree.
- generate `.cursor/myteam/workspace-parts.yaml` file with empty parts:.

### 2 — Research (per-part, fresh context, read-only)
Before dispatching any agents, write `.cursor/myteam/events/.bus-meta.json` with the current
`run-id` (timestamp), `commit` (from `git rev-parse HEAD`), `mode`, and `total-parts` count.

For each **leaf part** in the work set, dispatch one **`codebase-onboarding-engineer`** agent
(`.cursor/agents/`) in its own fresh-context session, in parallel batches.
Do not write any part's docs from your own memory — the orchestrator assembles only what the research agents return.
**Hierarchical:** The agent of parts that have parent, **just dispatch in parent agent**.

Brief each agent with:
- The part's `dir` from the Primary Source resolved in step 1 — sent to agent as input prompt — as the canonical scope root.
- The target output paths: `<dir>/AGENT.md`, `.cursor/rules/<dir>/<name>.mdc`,
  `.cursor/skills/workspace/<kebab-path>/SKILL.md`.
- The output formats from `.cursor/agents/codebase-onboarding-engineer.md` (Output Format),
  adapted to the new paths above (AGENT.md lives in the repo dir, not in `.cursor/`).
- After writing all three artifacts, **emit** `.cursor/myteam/events/research-complete-<part-kebab>.json`
  (schema in Approach → Event bus). This is the only write the agent makes outside its own part directory.

Each agent's deliverable is:
- Complete `AGENT.md` body (all 11 sections, grounded in inspected files, real paths).
- Complete `.mdc` body (valid frontmatter + grouped do/don'ts + `@<AGENT.md path>`).
- Complete `SKILL.md` body (frontmatter + concise agent briefing linking to AGENT.md).
- `research-complete-<part-kebab>.json` event file in `.cursor/myteam/events/`.

**Parent** parts are researched directly and assemble considering their completed children (Phase B).

**Retry:** If an agent returns thin output (below depth bar), re-dispatch with the specific gaps
before moving on. The re-dispatched agent overwrites the same artifacts and re-emits its event (max_retry_times: 3).

### 3 — Listener: upsert workspace-parts.yaml from completion events
Runs **concurrently** with Step 2 part agents — does not block them and is not blocked by them.
Watches `.cursor/myteam/events/` for new `research-complete-*.json` files. For each one:
1. Read the event file.
2. Upsert the part's entry in `.cursor/myteam/workspace-parts.yaml` (insert if new, update
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
- `.cursor/rules/workspace/<part.dir>/<part.name>.mdc` — frontmatter: `alwaysApply: false`,
  `globs: <part.dir>/**/*`; no `description`. Body: grouped do/don'ts; ends with
  `@<relative path to AGENT.md>`.
- `.cursor/skills/workspace/<part-kebab-path>/SKILL.md` — frontmatter: `name: <folder-name>`,
  `description: <one-line>`, `metadata: { part-dir: <dir> }`; body: briefing + AGENT.md link.

**For each parent part** — write artifacts that summarize and link to the now-completed sub-parts:
- `<part.dir>/AGENT.md` — its own all 11 sections; mark not-found fields as `_not found in <where>_`, 
  never omit + summary table linking each sub-part's AGENT.md.
- `.cursor/rules/workspace/<part.dir>/<part.name>.mdc` — frontmatter: `alwaysApply: false`,
  `description: <one-line>`; no `globs`. Body: grouped do/don'ts + sub-part list; ends with `@<relative AGENT.md path>`.
- `.cursor/skills/workspace/<part-kebab>/SKILL.md` — frontmatter: `name: <folder-name>`,
  `description: <one-line>`; body: briefing + AGENT.md link + lists sub-part skills and links to them.

If a part has hand-written notes in its AGENT.md, surface what changed before overwriting.

### 7 — Update the top-level workspace overview
- **`.cursor/rules/workspace/AGENT.md`**: full part map (table: Part | Repo path | Summary) over
  all top-level parts from config.yaml; cross-cutting patterns (shared libs, messaging, persistence,
  observability, config, auth). Sync the table — add rows for new parts, remove stale ones.
- **`.cursor/rules/workspace/workspace.mdc`**: `description`-based, `alwaysApply: false`, ends with
  `@AGENT.md`.
- **`.cursor/skills/workspace/SKILL.md`**: lists all top-level parts with one-line summaries and
  links to their `skills/workspace/<part>/SKILL.md`.

### 8 — Phase C: Verify gate (read-only checks + re-run loop)
This is a **hard gate**.

**Completeness against config.yaml:** Every part in `config.yaml > workspace.parts` must have all
three artifacts on disk. Report any missing as `needs-attention`.

**Structure per part:**
- `<part.dir>/AGENT.md` exists and is non-empty.
- `.cursor/rules/workspace/<part.dir>/<part.name>.mdc` exists with valid frontmatter.
- `.cursor/skills/workspace/<part-kebab-path>/SKILL.md` exists with valid frontmatter.

**Depth bar** (from `.cursor/agents/codebase-onboarding-engineer.md`):
- Every AGENT.md section present and non-empty (or `_not found_`).
- `Where it lives`, `Interfaces & contracts`, `Configuration` each cite at least one path that
  actually exists on disk.
- `Build / run / test` has a real command with port(s).
- Each `.mdc` has `alwaysApply: false`; leaf parts have `globs: <path>/**/*` (file pattern,
  resolves to real path) and no `description`; parent parts have `description` and no `globs`;
  body has ≥ 2 grouped do/don't headings with ≥ 6 bullets total and ends with `@<path>`.
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
- Verify `workspace-parts.yaml` has an entry for every config.yaml part (the listener should have
  populated all of them incrementally). Update only the top-level `commit: <git rev-parse HEAD>`
  field — do not rewrite the whole file.
- Archive or clear the event bus: move `.cursor/myteam/events/` contents to
  `.cursor/myteam/events/archive/<run-id>/`, or delete them. The run-id comes from `.bus-meta.json`.

---

## Guardrails

- **AGENT.md lives in the repo, not `.cursor/`** — write it to `<part.dir>/AGENT.md` so it travels with the code.
- **Rules mirror the repo path** — `.cursor/rules/workspace/<part.dir>/<part.name>.mdc`.
- **Skills mirror the part hierarchy** — `.cursor/skills/workspace/<part-kebab-path>/SKILL.md`.
- Facts must be grounded in files (real paths, real commands). Anything uncertain → `_not found in <where>_`.
- Leaf `.mdc` `globs` must be file patterns (`<path>/**/*`) so Cursor auto-attaches reliably.
