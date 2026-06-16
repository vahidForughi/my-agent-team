## ADDED Requirements

### Requirement: Rules tree mirrors the repo structure

The `.cursor/rules/workspace/` directory SHALL contain a part directory for every documented part
of the repository, with sub-parts nested under their parent part directory so the rules tree mirrors
the root repo structure. Part directories SHALL be named `_<kebab-name>/`.

#### Scenario: Top-level parts present

- **WHEN** the rules tree is generated
- **THEN** `workspace/` contains `_api-gateways/`, `_client/`, `_infrastructure/`, `_services/`,
  `_micro-frontends/`, `_deployments/`, `_monitoring/`, `_diagrams/`, `_terraform/`, `_scripts/`,
  `_tests/`, and `_tools/`

#### Scenario: Sub-parts nested under parents

- **WHEN** a part has documented sub-parts
- **THEN** `_services/` contains `_basket/ _catalog/ _discount/ _ordering/`,
  `_micro-frontends/` contains `_app-injector/ _auth-provider/ _shared-layout/ _scripts/`,
  `_deployments/` contains `_helm/ _istio/ _k8s/ _monitoring/`, and `_tests/` contains `_k6/`

### Requirement: Each part directory has the standard three artifacts

Every part directory (including parents and sub-parts) SHALL contain a `README.md`, an `AGENT.md`,
and a `suggest/` directory with a `.gitkeep` file, following the existing `_[name-part]/` template.

#### Scenario: Standard artifacts exist per part

- **WHEN** inspecting any `_<part>/` directory
- **THEN** it contains `README.md`, `AGENT.md`, and `suggest/.gitkeep`

### Requirement: Part README content is grounded and actionable

Each part `README.md` SHALL state what the part is and why it exists, its exact repo path(s), its
tech stack, and exact build/run/test commands; where applicable it SHALL list ports and key endpoints.
Cited paths and commands SHALL correspond to files and scripts that actually exist in the repo.

#### Scenario: README cites verifiable facts

- **WHEN** reading a part `README.md`
- **THEN** the repo paths it cites exist (e.g. `ApiGateways/Ocelot.ApiGateway`, `Services/Basket`,
  `Deployments/helm`, `micro-frontends/packages`, `terraform/modules`, `tests/k6`)
- **AND** the commands it cites are runnable as written for that part

### Requirement: Part AGENT files capture patterns and gotchas

Each part `AGENT.md` SHALL contain a `## Patterns` section and a `## Gotchas` section with durable,
reusable guidance specific to that part.

#### Scenario: AGENT file structure

- **WHEN** reading any part `AGENT.md`
- **THEN** it contains both a `## Patterns` and a `## Gotchas` section

### Requirement: Top-level workspace docs are updated and consistent

The top-level `workspace/README.md` SHALL be updated with a real part map (Part | Repo path | Summary)
covering all top-level parts and SHALL document the nested layout convention. The top-level
`workspace/AGENT.md` SHALL be enriched with cross-cutting patterns discovered during research. The
`_[name-part]/` template SHALL be preserved unchanged.

#### Scenario: Part map replaces placeholder

- **WHEN** reading `workspace/README.md`
- **THEN** the placeholder big-picture table is replaced with a complete part map
- **AND** the nested sub-part convention is documented

#### Scenario: Template preserved

- **WHEN** the change is complete
- **THEN** `workspace/_[name-part]/` still exists with its original `README.md` and `AGENT.md`

### Requirement: No non-documentation changes

The change SHALL modify only files under `.cursor/rules/workspace/`. No application source code,
configuration, CI/CD, or infrastructure files SHALL be modified.

#### Scenario: Change is documentation-only

- **WHEN** reviewing the diff for this change
- **THEN** every modified or added file is under `.cursor/rules/workspace/`
