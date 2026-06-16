# Workspace — big picture & agent guidance

The big-picture map of this repository plus cross-cutting guidance for agents working anywhere in
it. Part-specific guidance lives in the relevant `workspace/_<part>/AGENT.md`.

This is a **cloud-native ecommerce platform**: .NET 10 microservices behind an Ocelot API gateway,
event-driven via RabbitMQ (MassTransit), fronted by both a legacy Angular SPA and a modern
NX/Module-Federation micro-frontend suite, deployed to Kubernetes (Minikube / AWS EKS) with Helm +
Istio, provisioned by Terraform, and observed with Prometheus/Grafana/Jaeger/ELK.

## Layout convention

Each **part** gets a directory `_<part>/` here, and the tree **mirrors the root repo structure**:
parts with sub-components nest their sub-parts (e.g. `_services/_basket/`, `_deployments/_helm/`).
Every part dir contains exactly two files:

- `AGENT.md` — what the part is, where it lives, run/build/test, plus `## Patterns` / `## Gotchas`
  and owners. The curated onboarding doc.
- `<part>.mdc` — a native Cursor rule. Leaf parts set `globs` to the part's repo paths (auto-attach);
  parent parts use `description` only. Body is short do/don'ts ending with `@AGENT.md`.

> Cursor only treats `.mdc` files as rules — plain `.md` is ignored by its engine but read by the
> myteam harness by path. Copy `_[name-part]/` when adding a new part.

## Part map

| Part | Repo path | Summary |
|---|---|---|
| `_api-gateways` | `ApiGateways/Ocelot.ApiGateway/` | Ocelot API gateway; single entry point (`:8010`), routing, rate-limit, caching. |
| `_client` | `client/` | Legacy Angular 21 SPA (being superseded by micro-frontends). |
| `_infrastructure` | `Infrastructure/` | Shared .NET libs: Common.Mediator, EventBus.Messages, Common.Logging, aws. |
| `_services` | `Services/` | 4 Clean-Architecture microservices → `_basket _catalog _discount _ordering`. |
| `_micro-frontends` | `micro-frontends/` | NX + Module Federation host/remotes → `_app-injector _auth-provider _shared-layout _scripts`. |
| `_deployments` | `Deployments/` | Deploy artifacts → `_helm _istio _k8s _monitoring`. |
| `_monitoring` | `monitoring/` | Root Grafana dashboards/provisioning + k6 dashboards. |
| `_diagrams` | `diagrams/` | 33 `.eraserdiagram` (Eraser.io) architecture diagrams. |
| `_terraform` | `terraform/` | AWS IaC (EKS, RDS, DocumentDB, ECR, MQ, S3, OpenSearch). |
| `_scripts` | `scripts/` | Bash automation: deploy / cleanup / access / debug / monitoring + S3/LocalStack. |
| `_tests` | `tests/` | Testing → `_k6` (load/stress/spike/soak/workflow). |
| `_tools` | `tools/` | Postman collections for manual API testing. |

## Conventions

- Branching: `myteam/<feature-kebab>`; conventional commits.
- Quality gates: see `.cursor/myteam/config.yaml > defaults.qualityGates`.
- Agent roles: see `.cursor/agents/` and the registry in `config.yaml`.

## Reusable patterns (cross-cutting)

- **Custom mediator, not MediatR.** All .NET services use the in-house `Common.Mediator`
  (`Infrastructure/Common.Mediator/`) — `IRequest<T>`, `IRequestHandler<T,R>`, `IMediator`,
  registered via `AddMediator(assemblies)`.
- **Riok.Mapperly for mapping.** Source-generated mappers (no reflection).
- **Event contracts are shared.** Integration events live in `Infrastructure/EventBus.Messages/`;
  transport is RabbitMQ via MassTransit.
- **Polyglot persistence.** Catalog→MongoDB, Basket→Redis, Discount→PostgreSQL (Dapper),
  Ordering→SQL Server (EF Core). No shared DB.
- **Observability.** Serilog→Console/Elasticsearch (`Common.Logging`); OpenTelemetry traces →
  OTLP, default endpoint `http://jaeger-collector.istio-system:4317`.
- **Config is environment-driven.** Local: `.env` + `appsettings.*`; cluster: ConfigMaps/Secrets.
- **v1/v2 coexistence.** Basket exposes `/Basket/Checkout` and `/Basket/CheckoutV2`; Ordering
  consumes both event versions in parallel.
- **S3 dual-mode.** `USE_LOCALSTACK=true` → LocalStack; otherwise real AWS S3 (IRSA in EKS).
- **gRPC sync call.** Basket→Discount is plaintext HTTP/2 locally; Istio mTLS in prod.

_(Promote durable, reusable patterns here as discovered. Part-specific patterns go in that part's
`AGENT.md`.)_
