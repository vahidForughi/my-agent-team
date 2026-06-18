# Codebase Orientation Map — ApiGateways

## 1-Line Summary
The `ApiGateways` directory is a single-gateway layer containing one component — `Ocelot.ApiGateway` — which is the sole public HTTP entry point for the entire cloud-native e-commerce platform.

## 5-Minute Explanation
- **Primary tasks in code**: The directory's only child, `Ocelot.ApiGateway`, accepts all external HTTP traffic and proxies it to the backend microservices (Catalog, Basket, Discount, Ordering). The parent directory itself has no code — it is a container for the gateway component.
- **Primary inputs**: HTTP requests from browser clients and micro-frontend shell apps, arriving on host port 8010 (Docker Compose) or via Kubernetes ingress.
- **Primary outputs**: Proxied HTTP responses from downstream services returned to clients. Per-route in-process cache responses for Catalog (30 s TTL) and Activity (10 s TTL) routes.
- **Key files**:
  - `Ocelot.ApiGateway/Program.cs` — .NET 10 minimal host startup.
  - `Ocelot.ApiGateway/ocelot.Development.json` — Docker Compose route table.
  - `Ocelot.ApiGateway/ocelot.k8s.json` — Kubernetes route table.
  - `Ocelot.ApiGateway/Dockerfile` — container build (repo root as build context).
  - `Ocelot.ApiGateway/Ocelot.ApiGateway.csproj` — `net10.0` project, no service project-references.
- **Main code path**: HTTP request → Ocelot middleware (`UseOcelot()`) → route match in `ocelot.{Env}.json` → optional cache/rate-limit → HTTP forward to downstream → response.

## Deep Dive
- **Type**: Single-component gateway directory (parent container, no shared code)
- **Primary runtime**: .NET 10 (the single child `Ocelot.ApiGateway`)
- **Entry points**:
  - `Ocelot.ApiGateway/Program.cs`: starts the ASP.NET Core web host; loads environment-selected Ocelot JSON config; installs Ocelot as terminal middleware via `await app.UseOcelot()`.
  - `Ocelot.ApiGateway/ocelot.Development.json`: loaded when `ASPNETCORE_ENVIRONMENT=Development`.
  - `Ocelot.ApiGateway/ocelot.k8s.json`: loaded when `ASPNETCORE_ENVIRONMENT=k8s`.

## Top-Level Structure
| Path | Purpose | Notes |
|---|---|---|
| `Ocelot.ApiGateway/` | The only API gateway implementation | See child AGENT.md for full detail |
| `Ocelot.ApiGateway/Program.cs` | Application startup | 43 lines; wires CORS, Ocelot, Swagger |
| `Ocelot.ApiGateway/ocelot.Development.json` | Dev/Compose routing config | 27 routes; downstreams at `host.docker.internal:8000–8003` |
| `Ocelot.ApiGateway/ocelot.k8s.json` | Kubernetes routing config | 26 routes; downstreams use cluster DNS names |
| `Ocelot.ApiGateway/Dockerfile` | Container build definition | Build context must be repo root |
| `Ocelot.ApiGateway/Ocelot.ApiGateway.csproj` | .NET project | `net10.0`; `Ocelot` 23.4.3, `Swashbuckle.AspNetCore` 6.4.0 |

## Key Boundaries
- **Presentation**: None — the gateway is transparent; it adds no transformation to requests or responses.
- **Application/Domain**: Route matching, file caching, and rate limiting — all config-driven via `Routes[]` in `ocelot.*.json`. No custom C# domain logic.
- **Persistence/External I/O**: Outbound synchronous HTTP to four backend services. No database. In-process file cache (Ocelot built-in, heap-resident).
- **Cross-cutting concerns**:
  - CORS (`AllowAnyHeader/Method/Origin` in `Program.cs`).
  - Swagger/OpenAPI in Development only.
  - ASP.NET Core logging at `Information` level (`appsettings.json`).
- **Responsibilities by file/module**:
  - `Program.cs`: DI wiring and HTTP pipeline order.
  - `ocelot.*.json`: sole source of routing topology, QoS options, and downstream targets.
  - `Dockerfile`: reproducible container build from repo root.
- **Detailed code flows**:
  1. Any HTTP request (except `GET /`) reaches Ocelot middleware registered last in the pipeline.
  2. Ocelot reads `Routes[]` from the loaded `ocelot.{Env}.json` and matches `UpstreamPathTemplate` + `UpstreamHttpMethod`.
  3. File cache is checked if the route defines `FileCacheOptions`.
  4. Rate limit is enforced if the route defines `RateLimitOptions` (HTTP 429 on breach).
  5. Request is forwarded to `DownstreamHostAndPorts` via the `DownstreamPathTemplate`.
  6. Response is passed back to the client.
- **How the pieces map together**: The `ApiGateways` directory has exactly one runtime component (`Ocelot.ApiGateway`). There are no shared libraries, no inter-gateway communication, and no code at the `ApiGateways/` level itself. All wiring is `Program.cs` + JSON config.
- **Files inspected**:
  - `ApiGateways/Ocelot.ApiGateway/Program.cs`
  - `ApiGateways/Ocelot.ApiGateway/ocelot.Development.json`
  - `ApiGateways/Ocelot.ApiGateway/ocelot.k8s.json`
  - `ApiGateways/Ocelot.ApiGateway/Ocelot.ApiGateway.csproj`
  - `ApiGateways/Ocelot.ApiGateway/Dockerfile`
  - `ApiGateways/Ocelot.ApiGateway/appsettings.json`
  - `ApiGateways/Ocelot.ApiGateway/appsettings.Development.json`
  - `ApiGateways/Ocelot.ApiGateway/Ocelot.ApiGateway.http`

## Configuration
| Variable / File | Location | Effect |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | `docker-compose.override.yml` (`=Development`); Kubernetes deployment (`=k8s`) | Selects the Ocelot config file to load |
| `ASPNETCORE_HTTP_PORTS` | `Dockerfile` (`=80`) | Container listening port |
| `GlobalConfiguration.BaseUrl` | `ocelot.Development.json` (`http://localhost:8010`); `ocelot.k8s.json` (`http://ocelotapigw`) | Base URL used for Ocelot Location headers |
| Docker Compose host port mapping | `docker-compose.override.yml` | `8010:80` |

## Interfaces & Contracts
The public HTTP API surface is the full set of `UpstreamPathTemplate` entries in `ocelot.Development.json` / `ocelot.k8s.json`. Summary by service:
- **Catalog**: 14 routes; short paths like `/Catalog`, `/Catalog/GetAllProducts`, `/Catalog/{id}`, `/Admin/MigrateImagesToS3`.
- **Basket**: 5 routes; includes `/Basket/Checkout` and `/Basket/CheckoutV2` (both rate-limited 1 req/3 s).
- **Discount**: 2 routes; `/Discount/{productName}`, `/Discount`.
- **Ordering/Activity**: 4 order routes + 2 activity routes (`/Activity`, `/Activity/`).

The gateway emits no events and defines no schemas. All routing is a 1:1 pass-through with prefix rewriting.

## Data & State
Stateless. Transient in-process file cache only:
- Catalog root route: 30 s TTL.
- Activity routes: 10 s TTL.
No database, no queue, no persistent storage.

## Dependencies
**Outbound (downstream HTTP):**
- Catalog: `host.docker.internal:8000` (Dev) / `eshopping-catalog:80` (k8s)
- Basket: `host.docker.internal:8001` (Dev) / `eshopping-basket:80` (k8s)
- Discount: `host.docker.internal:8002` (Dev) / `eshopping-discount-discount-grpc:8080` (k8s)
- Ordering: `host.docker.internal:8003` (Dev) / `eshopping-ordering:80` (k8s)

**Inbound:** Browser / micro-frontend host shell.

**Package:** `Ocelot` 23.4.3, `Swashbuckle.AspNetCore` 6.4.0 (versions from `Directory.Packages.props` at repo root). No project-to-project references to any service.

## Patterns
- **Config-only routing**: All routing decisions are JSON-declared. Zero C# routing logic.
- **Environment file selection**: `Program.cs` calls `config.AddJsonFile($"ocelot.{env.HostingEnvironment.EnvironmentName}.json", ...)` — environment name is the switch.
- **Prefix stripping convention**: Upstream paths are short public paths; downstream paths add `/api/v1/` (or `/api/v2/` for `CheckoutV2`).
- **Per-route QoS**: Caching and rate limiting are opt-in per route via JSON properties — not global middleware.
- **Repo-root build context**: The Dockerfile's `DockerfileContext=../..` ensures `Directory.Packages.props` (NuGet Central Package Management) is available during restore.

## Gotchas & Owners
- **Discount is gRPC-only**: The `/Discount` gateway routes exist but Discount is consumed by Basket over gRPC, not through these HTTP routes.
- **No auth/authz**: No JWT validation or authentication middleware is present.
- **CORS is wide-open**: Development-suitable; not production-ready as-is.
- **Rate-limit caveat**: Load tests against Checkout routes will receive HTTP 429 (1 req/3 s limit).
- **k8s trailing-slash gap**: `ocelot.Development.json` has a `GET /Activity/` (trailing slash) route; `ocelot.k8s.json` does not.
- **Port change requires dual update**: Both the Ocelot JSON and the Compose/Helm port mapping must be updated together.
- **Owners**: `backend-architect` (routing/aggregation design), `devops-automator` (env configs, ports, deploy), `api-tester` (route and rate-limit verification).

## Child Components
| Child | Dir | Full onboarding |
|---|---|---|
| Ocelot.ApiGateway | `ApiGateways/Ocelot.ApiGateway/` | `ApiGateways/Ocelot.ApiGateway/AGENT.md` |
