## Why

`.cursor/rules/workspace/` is currently empty scaffolding — placeholder `README.md`/`AGENT.md`
and a `_[name-part]/` template, but no real per-part guidance. Agents and new engineers working
in this multi-stack monorepo (.NET 10 microservices, Ocelot gateway, Angular client,
NX/Module-Federation micro-frontends, Helm/Istio/K8s, Terraform/AWS, monitoring, k6) have no
grounded onboarding map, so they must re-discover each part's purpose, tech, and commands every time.

## What Changes

- Populate `.cursor/rules/workspace/` with onboarding rules for every part of the repo, in a
  **nested directory tree that mirrors the root repo structure** (sub-parts under their parent).
- Each part directory gets `README.md` (what/where/tech/run-build-test/ports), `AGENT.md`
  (`## Patterns` + `## Gotchas`), and an empty `suggest/.gitkeep`.
- Rewrite the placeholder top-level `workspace/README.md` with a real part map and document the
  nested convention; enrich `workspace/AGENT.md` with cross-cutting patterns (custom
  `Common.Mediator`, Riok.Mapperly, MassTransit/RabbitMQ contracts, polyglot persistence,
  OpenTelemetry→Jaeger, env/ConfigMap-driven config, v1/v2 coexistence, `USE_LOCALSTACK`).
- **BREAKING (convention only)**: intentionally diverges from the template's "no deeper nesting"
  note; the convention is updated in `workspace/README.md` to reflect the nested layout.
- Documentation only — no application code, build, or deployment behavior changes.

## Capabilities

### New Capabilities
- `cursor-rules-onboarding`: A structured, repo-mirroring set of Cursor workspace rules that gives
  agents accurate per-part onboarding (purpose, paths, tech stack, build/run/test commands,
  patterns, and gotchas) for every part and sub-part of the platform.

### Modified Capabilities
<!-- None — no existing specs in openspec/specs/ and no existing capability requirements change. -->

## Impact

- **Affected files**: `.cursor/rules/workspace/` only — new `_<part>/` directories (~25) each with
  `README.md`, `AGENT.md`, `suggest/.gitkeep`; updated `workspace/README.md` and `workspace/AGENT.md`.
- **Unaffected**: no source code, configs, pipelines, or infrastructure. The `_[name-part]/`
  template is preserved.
- **Audience**: AI coding agents (Cursor / myteam harness) and human engineers onboarding to the repo.
