## Why

The current `.cursor/rules/workspace/` convention (per part: `README.md` + `AGENT.md` + an empty
`suggest/` dir) is redundant and doesn't use Cursor's rules system. Cursor only recognizes `.mdc`
files (frontmatter `description`/`globs`/`alwaysApply`) as rules — **plain `.md` files there are
ignored by its engine**, so today's docs only work because the myteam harness reads them by path.
We also have no per-part place to accumulate learnings as work happens.

## What Changes

- **Merge** each part's `README.md` + `AGENT.md` into a single `AGENT.md`; **remove** `README.md`.
- **Replace `suggest/`** with a native Cursor `.mdc` rule per part: leaf parts use `globs` (auto-attach
  to that part's repo paths), parent parts use `description` only; the body is short do/don'ts that
  `@`-reference `AGENT.md`.
- **Add a per-part `progress.txt`** — an append-only learnings log; durable items promote up into the
  same dir's `AGENT.md`.
- **Wire the harness** to read and update per-part progress: the `myteam-harness` skill, the
  `myteam-run` apply loop, and `myteam-onboard`; mirror in `myteam/AGENT.md` and `myteam-archive`.
- Update the convention source (`config.yaml > rules.workspace`), the `myteam-init` scaffolding tree,
  and the `_[name-part]/` template to the new three-file model.
- Top-level `workspace/`: merge `README.md` into `AGENT.md`; add `workspace.mdc`.
- **BREAKING (convention only)**: the per-part layout changes from `{README.md, AGENT.md, suggest/}`
  to `{AGENT.md, <part>.mdc, progress.txt}`. Documentation/tooling only — no application code changes.

## Capabilities

### New Capabilities
- `cursor-rules-onboarding`: evolves the workspace onboarding rules to a three-file-per-part model
  (`AGENT.md` + scoped `.mdc` + `progress.txt`) that both functions as native Cursor rules and is
  read/updated by the myteam harness. (Supersedes the prior single-doc-per-part structure introduced
  by the not-yet-archived `populate-cursor-rules` change.)

### Modified Capabilities
<!-- None archived in openspec/specs/ yet; the prior cursor-rules-onboarding spec lives only in the
     unarchived populate-cursor-rules change, so this change re-states the capability rather than
     emitting a delta against an archived spec. -->

## Impact

- **Files**: `.cursor/rules/workspace/` (25 parts + template + top-level), `.cursor/myteam/config.yaml`,
  `.cursor/commands/{myteam-init,myteam-onboard,myteam-run,myteam-archive}.md`,
  `.cursor/skills/myteam-harness/SKILL.md`, `.cursor/myteam/AGENT.md`.
- **Unaffected**: application source, infra, CI. `.cursor/` is git-ignored (files work on disk; force-add only if desired).
- **Audience**: AI agents (Cursor native rules + myteam harness) and human engineers.
