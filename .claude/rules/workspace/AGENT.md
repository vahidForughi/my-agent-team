# Workspace Overview — cloud-native-ecommerce-platform

## Part Map

| Part | Repo Path | Category | Summary |
|---|---|---|---|
| ApiGateways | `ApiGateways/` | api-gateway | Ocelot reverse-proxy routing all external HTTP traffic to backend microservices; single `Ocelot.ApiGateway` child |
| Services | `Services/` | micro-service | Four .NET 10 microservices (Basket, Catalog, Discount, Ordering) — Clean Architecture, CQRS, polyglot persistence |
| Infrastructure | `Infrastructure/` | shared-lib | In-house shared .NET libraries: `Common.Logging` (Serilog+ES), `Common.Mediator` (CQRS pipeline), `EventBus.Messages` (event contracts), `aws` (S3/CloudFormation helpers) |
| MicroFrontends | `micro-frontends/` | micro-frontend | Nx monorepo with Module Federation: `host` shell + 4 React remotes (account, admin, checkout, store) + 3 shared packages |
| Client | `client/` | frontend | Angular 21 SPA — legacy standalone front-end; AWS Amplify CI/CD, Azure B2C auth |
| Deployments | `Deployments/` | infra | Helm charts, Istio service mesh configs, raw k8s manifests, Grafana monitoring config for the cluster |
| Terraform | `terraform/` | infra | AWS IaC — 8 modules (networking, EKS, ECR, databases, messaging, observability, security, storage) |
| Monitoring | `monitoring/` | observability | Grafana dashboards-as-code (ConfigMaps, deploy scripts) for the service metrics and k6 dashboards |
| Tests | `tests/` | testing | k6 performance test suite — 5 load profiles, Prometheus PushGateway integration, per-service thresholds |
| Scripts | `scripts/` | automation | Bash lifecycle scripts: deploy, cleanup, access, debug, monitoring setup, S3/LocalStack helpers |
| Tools | `tools/` | tools | Postman collections for manual API testing across all services and the gateway |
| Diagrams | `diagrams/` | docs | 33 Eraser.io architecture diagrams; rendered exports in `images/` |

## Nesting Convention

Each top-level directory has `AGENT.md` (full onboarding reference) and `CLAUDE.md` (actionable do/don't guide) at its root. Child parts have their own AGENT.md + CLAUDE.md inside their own subdirectory. Claude Code auto-loads the nearest CLAUDE.md in the directory tree.

Skills mirror the hierarchy under `.claude/skills/workspace/<kebab-path>/SKILL.md`.

## Cross-Cutting Patterns

### Shared .NET Infrastructure
All four microservices depend on the `Infrastructure/` shared libraries:
- `Common.Logging` → call `Logging.ConfigureLogger(builder)` in `Program.cs`
- `Common.Mediator` → `AddMediator(Assembly[])` for CQRS; implement `IRequestHandler<,>` and `IPipelineBehavior<,>`
- `EventBus.Messages` → extend `BaseIntegrationEvent`; queue names from `EventBusConstant`; version with `*V2` suffix

### Service Communication
- **Sync**: Basket → Discount via gRPC (`discount.proto`); Gateway → Catalog/Basket/Ordering via HTTP
- **Async**: Basket → Ordering (BasketCheckoutEvent/V2), Catalog → Ordering (ProductActivityEvent) via RabbitMQ/MassTransit

### Persistence (polyglot, no shared schema)
Basket → Redis | Catalog → MongoDB + S3 | Discount → PostgreSQL (Dapper) | Ordering → SQL Server (EF Core)

### Observability Stack
OpenTelemetry → Jaeger (traces) | Serilog → Elasticsearch/Kibana (logs) | Prometheus → Grafana (metrics)
OTLP endpoint default: `http://jaeger-collector.istio-system:4317`

### Frontend Architecture
- `client/` = legacy Angular SPA (Azure B2C auth, AWS Amplify deploy)
- `micro-frontends/` = Nx + Webpack Module Federation; `host` shell loads remotes at runtime; shared packages via `packages/`

### Configuration Convention
Local: `appsettings.json` / `appsettings.Development.json` + `docker-compose.override.yml`
Cluster: ConfigMaps/Secrets with `__`-delimited env vars (e.g. `EventBusSettings__HostAddress`)

### Key Gotchas (cross-cutting)
- `Discount` service drops and recreates its table on every startup — dev-only behavior, not for production data
- v1/v2 event contracts must coexist; never remove `BasketCheckoutEvent` (Ordering still consumes both)
- Discount gRPC downstream in `ocelot.k8s.json` uses port `8080`, not `80` like other services
- No cross-service DB access — services communicate via gRPC (sync) or RabbitMQ (async) only
- Terraform state is local by default; migrate to S3 backend before team use
- Ocelot config: `ocelot.Development.json` uses port as **string** (`"Port": "8000"`); `ocelot.k8s.json` uses port as **integer** (`"Port": 80`) — keep this asymmetry when adding routes
- Catalog MongoDB: always extend `ICatalogContext` (not inject `IMongoDatabase` directly) to add new collections; `CatalogContext` is the single connection point
- Catalog CQRS: `AddMediator(assemblies)` in `Program.cs` auto-discovers all handlers in `Catalog.Application` — no explicit handler registration needed
- MFE account routing: run `npx nx run account:routes:generate` after adding/removing route files in `micro-frontends/account/src/routes/` — never edit `routeTree.gen.ts` manually
- MFE Module Federation: never call `init()` after the host is initialized at build time — use `registerRemotes()` guarded by a module-level `Set<string>` to prevent duplicate registration warnings

## Sub-Part AGENT.md Index

| Sub-Part | AGENT.md |
|---|---|
| Ocelot.ApiGateway | [`ApiGateways/Ocelot.ApiGateway/AGENT.md`](../../ApiGateways/Ocelot.ApiGateway/AGENT.md) |
| Basket | [`Services/Basket/AGENT.md`](../../Services/Basket/AGENT.md) |
| Catalog | [`Services/Catalog/AGENT.md`](../../Services/Catalog/AGENT.md) |
| Discount | [`Services/Discount/AGENT.md`](../../Services/Discount/AGENT.md) |
| Ordering | [`Services/Ordering/AGENT.md`](../../Services/Ordering/AGENT.md) |
| Common.Logging | [`Infrastructure/Common.Logging/AGENT.md`](../../Infrastructure/Common.Logging/AGENT.md) |
| Common.Mediator | [`Infrastructure/Common.Mediator/AGENT.md`](../../Infrastructure/Common.Mediator/AGENT.md) |
| EventBus.Messages | [`Infrastructure/EventBus.Messages/AGENT.md`](../../Infrastructure/EventBus.Messages/AGENT.md) |
| aws | [`Infrastructure/aws/AGENT.md`](../../Infrastructure/aws/AGENT.md) |
| host | [`micro-frontends/host/AGENT.md`](../../micro-frontends/host/AGENT.md) |
| account | [`micro-frontends/account/AGENT.md`](../../micro-frontends/account/AGENT.md) |
| admin | [`micro-frontends/admin/AGENT.md`](../../micro-frontends/admin/AGENT.md) |
| checkout | [`micro-frontends/checkout/AGENT.md`](../../micro-frontends/checkout/AGENT.md) |
| store | [`micro-frontends/store/AGENT.md`](../../micro-frontends/store/AGENT.md) |
| app-injector | [`micro-frontends/packages/app-injector/AGENT.md`](../../micro-frontends/packages/app-injector/AGENT.md) |
| auth-provider | [`micro-frontends/packages/auth-provider/AGENT.md`](../../micro-frontends/packages/auth-provider/AGENT.md) |
| shared-layout | [`micro-frontends/packages/shared-layout/AGENT.md`](../../micro-frontends/packages/shared-layout/AGENT.md) |
| helm | [`Deployments/helm/AGENT.md`](../../Deployments/helm/AGENT.md) |
| istio | [`Deployments/istio/AGENT.md`](../../Deployments/istio/AGENT.md) |
| k8s | [`Deployments/k8s/AGENT.md`](../../Deployments/k8s/AGENT.md) |
| grafana | [`monitoring/grafana/AGENT.md`](../../monitoring/grafana/AGENT.md) |
| k6 | [`tests/k6/AGENT.md`](../../tests/k6/AGENT.md) |
| postman | [`tools/postman/AGENT.md`](../../tools/postman/AGENT.md) |
