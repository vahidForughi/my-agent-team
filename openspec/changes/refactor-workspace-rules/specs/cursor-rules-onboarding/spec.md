## ADDED Requirements

### Requirement: Three-file model per part

Every part directory under `.cursor/rules/workspace/` SHALL contain exactly three artifacts: a single
`AGENT.md` (curated onboarding doc), one `<part>.mdc` (native Cursor rule), and one `progress.txt`
(append-only learnings log). It SHALL NOT contain a `README.md` or a `suggest/` directory.

#### Scenario: Part dir has the three artifacts

- **WHEN** inspecting any `_<part>/` directory (parent or leaf)
- **THEN** it contains `AGENT.md`, exactly one `*.mdc`, and `progress.txt`
- **AND** it contains no `README.md` and no `suggest/` directory

#### Scenario: Merged AGENT.md content

- **WHEN** reading a part `AGENT.md`
- **THEN** it covers what the part is, where it lives, run/build/test, plus `## Patterns` and
  `## Gotchas` and an owners/agents line (the merged content of the former README + AGENT)

### Requirement: Native Cursor rule per part

Each part's `<part>.mdc` SHALL be a valid Cursor project rule: a YAML frontmatter block declaring
`description`, optionally `globs`, and `alwaysApply: false`, followed by a short body of actionable
guidance that references the part's `AGENT.md` with `@`. Leaf parts SHALL set `globs` to that part's
repo path(s); parent parts (`_services`, `_micro-frontends`, `_deployments`, `_tests`) SHALL omit
`globs` and rely on `description`.

#### Scenario: Leaf rule auto-attaches by path

- **WHEN** reading a leaf part's `.mdc` (e.g. `_services/_basket/basket.mdc`)
- **THEN** its frontmatter sets `globs` to the part's repo path (e.g. `Services/Basket/**`) and
  `alwaysApply: false`
- **AND** the path(s) in `globs` resolve to real locations in the repo

#### Scenario: Parent rule is agent-requested

- **WHEN** reading a parent part's `.mdc` (e.g. `_services/services.mdc`)
- **THEN** its frontmatter sets `description` and omits `globs`

#### Scenario: Rule references the doc instead of duplicating it

- **WHEN** reading any part `.mdc` body
- **THEN** it is concise and contains an `@AGENT.md` reference rather than a full copy of the doc

### Requirement: Per-part progress log

Each part SHALL have a `progress.txt` that is append-only and seeded with a short header explaining
its purpose. Durable patterns/gotchas recorded there are promoted up into the same directory's
`AGENT.md`.

#### Scenario: Seeded progress log exists

- **WHEN** a part directory is created or onboarded
- **THEN** `progress.txt` exists with a header describing it as an append-only log whose durable
  learnings get promoted into `AGENT.md`

### Requirement: Harness reads and updates per-part progress

The myteam harness execution loop SHALL, when a story touches a part, read that part's `AGENT.md` and
`progress.txt`, hand them to the assigned agents, append the iteration's learnings to that part's
`progress.txt` (in addition to the PRD `progress.txt`), and promote durable learnings into the part's
`AGENT.md`. The `myteam-harness` skill, the `myteam-run` apply loop, and the condensed
`myteam/AGENT.md` SHALL describe this behavior.

#### Scenario: Loop consumes part context

- **WHEN** the harness picks a story that touches `_<part>/`
- **THEN** it reads `_<part>/AGENT.md` and `_<part>/progress.txt` and provides them to the story's agents

#### Scenario: Loop records part learnings

- **WHEN** a story iteration completes
- **THEN** the loop appends a dated entry to the touched part's `progress.txt`
- **AND** promotes durable patterns from that `progress.txt` into the part's `AGENT.md`

### Requirement: Convention sources reflect the new model

The convention sources SHALL describe the three-file model: `config.yaml > rules.workspace`, the
`myteam-init` scaffolding tree, the `myteam-onboard` command, and the `_[name-part]/` template. None
of these SHALL reference `README.md` or `suggest/` as part of the per-part layout.

#### Scenario: No stale references remain

- **WHEN** grepping `.cursor/rules`, `.cursor/commands`, `.cursor/myteam`, and `.cursor/skills` for
  the old layout
- **THEN** there are no references to a per-part `README.md` or `suggest/` directory
- **AND** `config.yaml > rules.workspace`, `myteam-init`, `myteam-onboard`, and the template all
  describe `AGENT.md` + `<part>.mdc` + `progress.txt`

### Requirement: Onboarding command produces the three-file model

The `myteam-onboard` command SHALL create, for each discovered part, an `AGENT.md`, a scoped
`<part>.mdc`, and a seeded `progress.txt`, and SHALL verify each part has all three and that `.mdc`
frontmatter is valid.

#### Scenario: Onboard output

- **WHEN** `/myteam-onboard` runs against a repo
- **THEN** each part directory it writes contains `AGENT.md`, `<part>.mdc`, and `progress.txt`
- **AND** the command's verify step checks for all three and validates `.mdc` frontmatter

### Requirement: Documentation-only scope

This change SHALL modify only files under `.cursor/`. No application source, configuration, CI/CD, or
infrastructure files SHALL be modified.

#### Scenario: Change is documentation-only

- **WHEN** reviewing the diff
- **THEN** every modified or added file is under `.cursor/`
