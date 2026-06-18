# api-gateways — API gateway

## What & why

The single public entry point for the platform. An [Ocelot](https://github.com/ThreeMammals/Ocelot)
gateway that routes/aggregates the backend microservices behind one host, strips the services' internal
`/api/v1` prefix, and applies CORS, gateway-level HTTP (file) caching, and rate limiting. It exists so
clients hit one stable URL instead of four service ports.

## Where it lives

`ApiGateways/Ocelot.ApiGateway/`:
- `Program.cs` — minimal host; loads `ocelot.{Environment}.json`, adds CORS + `AddOcelot()`, runs
  `UseOcelot()`.
- `ocelot.Development.json` — routes for local/compose (`host.docker.internal`, ports 8000–8003).
- `ocelot.k8s.json` — routes for Kubernetes (service DNS like `eshopping-catalog`, port 80).
- `appsettings.json` / `appsettings.Development.json`, `Dockerfile`, `Ocelot.ApiGateway.csproj`.

## Tech stack

- .NET 10 (`net10.0` in `Ocelot.ApiGateway.csproj`; SDK `10.0.300` from `global.json`).
- Ocelot 23.4.3 and Swashbuckle 6.4.0 (versions in `Directory.Packages.props`). No project references to
  the services — routing is pure config.

## Build / run / test

```bash
# Local
cd ApiGateways/Ocelot.ApiGateway && dotnet run     # Swagger in Development

# Container (build context is ApiGateways/ — see DockerfileContext in csproj)
docker build -f ApiGateways/Ocelot.ApiGateway/Dockerfile -t ocelotapigateway .
docker compose up ocelot.apigateway                 # host :8010 → container :80
```

Binds container `80` (`ASPNETCORE_HTTP_PORTS=80`); published on host `:8010`
(`docker-compose.override.yml`). `GlobalConfiguration.BaseUrl` is `http://localhost:8010`
(`ocelot.Development.json`). Root `GET /` returns "Hello Ocelot" (`Program.cs`).

## Configuration

- Routing config selected by environment: `Program.cs` loads `ocelot.{EnvironmentName}.json` →
  `ocelot.Development.json` (compose) or `ocelot.k8s.json` (cluster). Switched by
  `ASPNETCORE_ENVIRONMENT` (`=Development` in `docker-compose.override.yml`).
- Each route's `DownstreamHostAndPorts` differs per environment: Dev uses `host.docker.internal:80xx`;
  k8s uses service DNS on port `80`.
- CORS policy is defined in `Program.cs` (`AllowAnyHeader/Method/Origin`).
- No `__`-style env-var config; behaviour lives entirely in the `ocelot.*.json` `Routes[]`.

## Interfaces & contracts

Public HTTP surface = the `UpstreamPathTemplate`s in `ocelot.Development.json`; each maps to a
`DownstreamPathTemplate` of `/api/v1/...` on a service:
- Catalog (`:8000`): `/Catalog` (+`GetProductById/{id}`, `GetAllProducts`, `CreateProduct`,
  `GetAllBrands`, `CreateBrand`, `GetAllTypes`, `CreateType`, `GetProductsByBrandName/{brand}`,
  `UploadProductImage`, `GetProductByProductName/{productName}`, `UpdateProduct`, `{id}`),
  and `/Admin/MigrateImagesToS3`.
- Basket (`:8001`): `/Basket/GetBasket/{userName}`, `/Basket/CreateBasket`,
  `/Basket/DeleteBasket/{userName}`, `/Basket/Checkout` (→`/api/v1/...`),
  `/Basket/CheckoutV2` (→`/api/v2/Basket/Checkout`).
- Discount (`:8002`): `/Discount/{productName}`, `/Discount` — present in the REST routes but Discount is
  gRPC-only; see Gotchas.
- Ordering (`:8003`): `/Order/{userName}`, `/Order` (POST/PUT), `/Order/{id}` (DELETE), `/Activity`
  (and `/Activity/`).

No events. The gateway is a stateless reverse proxy; it defines no schemas of its own.

## Data & state

Stateless. The only "state" is Ocelot's in-process file cache (`FileCacheOptions.TtlSeconds`) on Catalog
(30s) and Activity (10s) routes. No database.

## Dependencies

- Calls all four backend services synchronously over HTTP (the downstreams above). See
  [`Services/CLAUDE.md`](../../Services/CLAUDE.md).
- Called by the browser client / micro-frontends (the public consumers).
- Depends on the downstream ports matching `docker-compose.override.yml` / Helm values.

## Patterns

- Routes are declarative JSON, not code — add/modify a downstream by editing `Routes[]` and keep
  `ocelot.Development.json` and `ocelot.k8s.json` in sync (same routes, different
  `DownstreamHostAndPorts`/Host).
- The gateway strips the services' internal `/api/v1` prefix: gateway paths are the short form
  (`/Catalog/GetAllProducts`), downstream paths are `/api/v1/Catalog/...`.
- Rate limiting and file caching are per-route options inside the JSON, not middleware.

## Gotchas

- **Discount is gRPC-only** — Basket calls it directly over gRPC; don't rely on the `/Discount` REST
  routes for real discount resolution and don't add new REST Discount routes expecting them to work.
- No auth/authz at the gateway today (JWT is planned) — don't assume it protects downstreams.
- CORS is wide-open for dev convenience — tighten deliberately, don't rely on it for security.
- `/Basket/Checkout` and `/Basket/CheckoutV2` are rate-limited to 1 req / 3s — load tests will get 429s.
- Changing a downstream port means updating both the gateway config (both JSONs) and the matching
  `docker-compose`/Helm values.

## Owners / agents

`backend-architect` (routing/aggregation design), `devops-automator` (env-specific configs, ports,
deploy), `api-tester` (route + rate-limit verification). Roles from `.claude/agents/`.
