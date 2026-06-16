## Context

`.cursor/rules/workspace/` currently holds, per part, a `README.md`, an `AGENT.md`, and an empty
`suggest/` dir (created by the not-yet-archived `populate-cursor-rules` change). Research of Cursor's
docs (Context7 `/websites/cursor`) established that `.cursor/rules/` only recognizes `.mdc` files
with frontmatter (`description`, `globs`, `alwaysApply`); plain `.md` files are ignored by Cursor's
rule engine and only function because the myteam harness reads them by path. The myteam harness also
keeps a per-PRD `progress.txt` with a `## Codebase Patterns` section and promotes part-specific
patterns into `_<part>/AGENT.md`.

## Goals / Non-Goals

**Goals:**
- One curated doc per part (`AGENT.md`), one native Cursor rule per part (`.mdc`), and one append-only
  learnings log per part (`progress.txt`).
- Make per-part guidance auto-attach in-editor via `.mdc` globs.
- Wire the harness loop to read and update per-part `progress.txt`, promoting durable learnings to
  `AGENT.md`.
- Keep all convention sources (config, commands, skill, template) consistent with the new model.

**Non-Goals:**
- No application code/infra/CI changes.
- Not removing the per-PRD `progress.txt` model — the per-part log complements it.
- Not committing files (`.cursor/` is git-ignored; force-add is the user's call).

## Decisions

- **Three files per part** (`AGENT.md`, `<part>.mdc`, `progress.txt`). Rationale: each has a distinct
  role — curated doc, native rule, raw log — mirroring the existing global progress→patterns flow.
  Alternative (just `AGENT.md`) rejected: doesn't activate as a Cursor rule and loses the learnings log.
- **Leaf `.mdc` use `globs`; parent `.mdc` use `description` only.** Rationale: leaf globs auto-attach
  to concrete repo paths; parent rules would double-attach if they also globbed (parent globs are a
  superset of children), so they're Agent-Requested via `description`. `alwaysApply: false` throughout.
- **`.mdc` body stays short and `@`-references `AGENT.md`.** Rationale: Cursor best practice — reference
  files instead of duplicating to avoid staleness and keep rules focused.
- **`progress.txt` is append-only; promotion target is the same dir's `AGENT.md`.** Rationale: matches
  the harness's existing append-only + promote discipline, localized per part.
- **Harness reads per-part `AGENT.md` + `progress.txt` when a story touches that part, and appends to
  both the PRD and the part `progress.txt`.** Rationale: localizes learning capture where future work
  on that part will look first.
- **Top-level merges `README.md`→`AGENT.md` and adds `workspace.mdc`** (`description`-based, repo-wide
  conventions + part map). No top-level `progress.txt` (logging is per-part).

## Risks / Trade-offs

- [Three files per part is more surface to keep in sync] → Clear roles + the onboarding command and
  harness steps codify which file gets what; `.mdc` references `AGENT.md` rather than duplicating.
- [Overlapping globs between a leaf and an ancestor could double-attach] → Parent parts are
  `description`-only (no globs), eliminating the overlap.
- [`.mdc` frontmatter typos silently disable a rule] → Verification validates each `.mdc` has a YAML
  block with `description`/`globs`/`alwaysApply` and that globs resolve to real paths.
- [Convention drift across config/commands/skill] → All four sources updated in this change; a grep
  check confirms no stale `README.md`/`suggest/` references remain.
