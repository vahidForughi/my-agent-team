# Ocelot API Gateway — Agent Onboarding

## What & Why

`Ocelot.ApiGateway` is the HTTP reverse-proxy entry point for the e-commerce platform. It uses the [Ocelot](https://github.com/ThreeMammals/Ocelot) library to route upstream client requests to downstream microservices (Catalog, Basket, Discount, Ordering). Clients (Angular app, micro-frontends, k6 tests) call the gateway on port **8010** instead of calling each service directly.

## Where it lives

| Artifact | Path |
|----------|------|
| Entry point | `ApiGateways/Ocelot.ApiGateway/Program.cs` |
| Project file | `ApiGateways/Ocelot.ApiGateway/Ocelot.ApiGateway.csproj` |
| Dev routing config | `ApiGateways/Ocelot.ApiGateway/ocelot.Development.json` |
| K8s routing config | `ApiGateways/Ocelot.ApiGateway/ocelot.k8s.json` |
| App settings | `ApiGateways/Ocelot.ApiGateway/appsettings.json`, `appsettings.Development.json` |
| Container build | `ApiGateways/Ocelot.ApiGateway/Dockerfile` |
| Solution reference | `Ecommerce.sln` (project `Ocelot.ApiGateway`) |
| Docker Compose service | `docker-compose.yml` → `ocelot.apigateway`; port `8010:80` in `docker-compose.override.yml` |
| Helm chart (deploy) | `Deployments/helm/ocelotapigw/` (ConfigMap embeds `ocelot.k8s.json`) |
| Parent part | `ApiGateways/` (this is the only gateway implementation) |

## Tech stack

- **Runtime**: ASP.NET Core on **.NET 10** (`TargetFramework: net10.0` in `Ocelot.ApiGateway.csproj`)
- **Gateway library**: Ocelot **23.4.3** (central version in `Directory.Packages.props`)
- **API docs**: Swashbuckle.AspNetCore (Swagger enabled in Development only)
- **Container**: Linux Docker image based on `mcr.microsoft.com/dotnet/aspnet:10.0`, exposes port 80

## Build / run / test

### Build

```bash
dotnet build ApiGateways/Ocelot.ApiGateway/Ocelot.ApiGateway.csproj
```

### Run locally (requires downstream services reachable at configured hosts/ports)

```bash
ASPNETCORE_ENVIRONMENT=Development dotnet run --project ApiGateways/Ocelot.ApiGateway/Ocelot.ApiGateway.csproj
```

With Docker Compose (recommended — starts gateway and dependencies):

```bash
docker compose up ocelot.apigateway
```

Gateway is reachable at **http://localhost:8010** (`docker-compose.override.yml` maps `8010:80`; `ocelot.Development.json` `GlobalConfiguration.BaseUrl` is `http://localhost:8010`).

### Docker image

```bash
docker build -t ocelotapigateway:latest -f ApiGateways/Ocelot.ApiGateway/Dockerfile .
```

Container listens on port **80** (`ASPNETCORE_HTTP_PORTS=80` in `Dockerfile`).

### Smoke test

```bash
curl http://localhost:8010/
# Expected: "Hello Ocelot" (from Program.cs root endpoint)

curl http://localhost:8010/Catalog/GetAllProducts
# Proxies to Catalog downstream
```

### Tests

_not found in `ApiGateways/Ocelot.ApiGateway/` — no test project or test files in this part._

## Configuration

### Environment-specific Ocelot routing

`Program.cs` loads routing config at startup:

```csharp
config.AddJsonFile($"ocelot.{env.HostingEnvironment.EnvironmentName}.json", true, true);
```

| `ASPNETCORE_ENVIRONMENT` | Config file loaded | Downstream hosts |
|--------------------------|-------------------|------------------|
| `Development` | `ocelot.Development.json` | `host.docker.internal` on ports 8000–8003 |
| `k8s` | `ocelot.k8s.json` | K8s service DNS (`eshopping-catalog`, `eshopping-basket`, etc.) |

Helm sets `ASPNETCORE_ENVIRONMENT=k8s` (`Deployments/helm/ocelotapigw/values.yaml`) and mounts `ocelot.k8s.json` from ConfigMap at `/app/ocelot.k8s.json` (`Deployments/helm/ocelotapigw/templates/deployment.yaml`).

### Key settings files

- `appsettings.json` — logging defaults (`Default: Information`, `Microsoft.AspNetCore: Warning`), `AllowedHosts: *`
- `appsettings.Development.json` — logging overrides only
- `.env.example` — `OCELOT_GATEWAY_PORT=8010`, `JWT_ISSUER=https://localhost:8010` (gateway port reference; no JWT middleware in `Program.cs`)

### CORS

`Program.cs` registers policy `"CorsPolicy"` with `AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()`.

## Interfaces & contracts

### Upstream (client-facing) routes

Upstream paths **omit** the `/api/v1` prefix. Ocelot rewrites to downstream `/api/v1/...` or `/api/v2/...` paths.

| Upstream path (examples) | HTTP methods | Downstream service | Downstream path |
|--------------------------|--------------|-------------------|-----------------|
| `/Catalog`, `/Catalog/GetAllProducts`, `/Catalog/{id}` | GET, POST, PUT, DELETE | Catalog (port 8000 dev / `eshopping-catalog:80` k8s) | `/api/v1/Catalog/...` |
| `/Admin/MigrateImagesToS3` | POST | Catalog | `/api/v1/Admin/MigrateImagesToS3` |
| `/Basket/GetBasket/{userName}`, `/Basket/Checkout` | GET, POST, DELETE | Basket (port 8001 dev / `eshopping-basket:80` k8s) | `/api/v1/Basket/...` |
| `/Basket/CheckoutV2` | POST | Basket | `/api/v2/Basket/Checkout` |
| `/Discount`, `/Discount/{productName}` | GET, PUT, POST, DELETE | Discount (port 8002 dev / `eshopping-discount-discount-grpc:8080` k8s) | `/api/v1/Discount/...` |
| `/Order`, `/Order/{userName}`, `/Order/{id}` | GET, POST, PUT, DELETE | Ordering (port 8003 dev / `eshopping-ordering:80` k8s) | `/api/v1/Order/...` |
| `/Activity`, `/Activity/` | GET | Ordering | `/api/v1/Activity` |

Full route list: `ocelot.Development.json` and `ocelot.k8s.json`.

### Gateway-owned endpoints

- `GET /` → inline handler in `Program.cs` returns `"Hello Ocelot"`
- Swagger UI at `/swagger` (Development environment only)

### Cross-cutting route features

- **Rate limiting** on `/Basket/Checkout` and `/Basket/CheckoutV2`: `EnableRateLimiting: true`, `Period: "3s"`, `Limit: 1` (defined in both ocelot config files)
- **File caching** on Catalog base route (`TtlSeconds: 30`) and Activity routes (`TtlSeconds: 10`)

### Client consumers (outside this part)

- `client/src/environments/environment.ts` — `apiUrl: 'http://localhost:8010'`
- `micro-frontends/*/src/config/env.config.ts` — `NX_API_BASE_URL` defaults to `http://localhost:8010`
- `tests/k6/` — `GATEWAY_URL` defaults to `http://localhost:8010`

## Data & state

Stateless HTTP proxy. Ocelot forwards requests to downstream services; no database, cache store, or persistent state in this project. In-memory file caching (`FileCacheOptions`) is configured per-route in ocelot JSON files.

## Dependencies

### NuGet packages (`Ocelot.ApiGateway.csproj`)

| Package | Version source |
|---------|---------------|
| `Ocelot` | `23.4.3` via `Directory.Packages.props` |
| `Swashbuckle.AspNetCore` | Central package management |
| `Microsoft.VisualStudio.Azure.Containers.Tools.Targets` | Central package management |

### Downstream microservices (runtime)

| Service | Dev host:port (`ocelot.Development.json`) | K8s host:port (`ocelot.k8s.json`) |
|---------|---------------------------------------------|-----------------------------------|
| Catalog | `host.docker.internal:8000` | `eshopping-catalog:80` |
| Basket | `host.docker.internal:8001` | `eshopping-basket:80` |
| Discount | `host.docker.internal:8002` | `eshopping-discount-discount-grpc:8080` |
| Ordering (+ Activity) | `host.docker.internal:8003` | `eshopping-ordering:80` |

Docker Compose `depends_on`: `catalog.api`, `basket.api`, `discount.api`, `ordering.api` (`docker-compose.override.yml`).

## Patterns

1. **Declarative routing** — all proxy rules live in `ocelot.{Environment}.json`; no route code in C# beyond the root `/` handler.
2. **Environment-split configs** — Development targets `host.docker.internal` with per-service ports; k8s targets in-cluster DNS names.
3. **Path rewriting** — upstream paths are shorter (`/Catalog/...`) than downstream API paths (`/api/v1/Catalog/...`).
4. **Minimal host** — `Program.cs` wires CORS, Swagger (dev), controllers (empty `Controllers/` folder), and `UseOcelot()` middleware.
5. **Helm duplication** — `Deployments/helm/ocelotapigw/templates/configmap.yaml` embeds a copy of k8s routes; keep in sync with `ocelot.k8s.json` when changing routes.

## Gotchas

1. **Config file must match environment** — if `ASPNETCORE_ENVIRONMENT` has no matching `ocelot.{Env}.json`, Ocelot starts with no routes (`optional: true` in `AddJsonFile` call).
2. **Upstream vs downstream path mismatch** — clients must call `/Catalog/GetAllProducts`, not `/api/v1/Catalog/GetAllProducts`.
3. **Development host resolution** — `host.docker.internal` works inside Docker; bare `dotnet run` on the host may need different downstream hosts/ports.
4. **Activity trailing slash** — `ocelot.Development.json` has separate routes for `/Activity` and `/Activity/`; `ocelot.k8s.json` only defines `/Activity`.
5. **Stale `.http` file** — `Ocelot.ApiGateway.http` references `http://localhost:5210/weatherforecast/`; actual root is port 8010 (compose) and returns `"Hello Ocelot"`, not weatherforecast.
6. **No auth middleware** — `UseAuthorization()` is called but no authentication scheme is registered; `.env.example` `JWT_ISSUER` is not wired in `Program.cs`.
7. **Checkout rate limits** — `/Basket/Checkout` and `/Basket/CheckoutV2` allow only 1 request per 3-second window.
8. **Middleware order** — `UseOcelot()` is called after `MapControllers()` and `UseEndpoints()`; changing pipeline order can break routing.
9. **Empty Controllers folder** — `Ocelot.ApiGateway.csproj` includes `<Folder Include="Controllers\" />`; all API surface is proxied, not implemented locally.
10. **Helm health check** — AWS NLB health check uses `/` (`values.yaml` comment: `/health` does not exist).

## Owners

_not found in `ApiGateways/Ocelot.ApiGateway/` or repository CODEOWNERS for this path._
