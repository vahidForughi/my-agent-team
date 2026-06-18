# Codebase Orientation Map — Ocelot.ApiGateway

## 1-Line Summary
A .NET 10 Ocelot-based HTTP API gateway that is the single public entry point, routing client requests to Catalog, Basket, Discount, and Ordering microservices with CORS, file caching, and rate limiting.

## 5-Minute Explanation
- **Primary tasks in code**: Routes HTTP requests from external clients to four downstream microservices; applies per-route file caching and rate limiting; enforces CORS policy.
- **Primary inputs**: HTTP requests arriving on the gateway host (port 8010 in Docker Compose, port 80 in container).
- **Primary outputs**: Proxied HTTP responses from downstream microservices returned to the caller. `GET /` returns the literal string `"Hello Ocelot"`.
- **Key files**:
  - `Program.cs` — application startup: CORS policy, Ocelot config injection, middleware pipeline, health probe route.
  - `ocelot.Development.json` — 27 routes targeting `host.docker.internal` on ports 8000–8003.
  - `ocelot.k8s.json` — same 26 routes targeting Kubernetes service DNS (`eshopping-catalog`, `eshopping-basket`, `eshopping-discount-discount-grpc`, `eshopping-ordering`).
  - `Dockerfile` — multi-stage build; build context is repo root (`DockerfileContext=../..`); binds port 80 at runtime via `ASPNETCORE_HTTP_PORTS=80`.
  - `Ocelot.ApiGateway.csproj` — `net10.0` target; references `Ocelot` and `Swashbuckle.AspNetCore`; no project-to-project references.
- **Main code path**: HTTP request → Ocelot middleware (`UseOcelot()`) → route match against `ocelot.{EnvironmentName}.json` `Routes[]` → optional file cache / rate limit enforcement → forward to `DownstreamHostAndPorts` → response returned to client.

## Deep Dive
- **Type**: API Gateway (reverse proxy)
- **Primary runtime**: .NET 10 (`net10.0`; SDK `10.0.300` from `global.json`)
- **Entry points**:
  - `Program.cs`: configures and starts the web host; the last two lines are `await app.UseOcelot()` and `await app.RunAsync()` — Ocelot is installed as terminal middleware.
  - `ocelot.Development.json`: loaded when `ASPNETCORE_ENVIRONMENT=Development` (set in `docker-compose.override.yml`).
  - `ocelot.k8s.json`: loaded when `ASPNETCORE_ENVIRONMENT=k8s` (set by Kubernetes deployment environment variable).

## Top-Level Structure
| Path | Purpose | Notes |
|---|---|---|
| `Program.cs` | Application startup and middleware pipeline | Adds CORS, Ocelot, Swagger; maps health probe at `GET /` |
| `ocelot.Development.json` | Routing rules for local/Docker Compose | Downstreams use `host.docker.internal:8000–8003` |
| `ocelot.k8s.json` | Routing rules for Kubernetes | Downstreams use cluster DNS names on port 80 (Discount uses port 8080) |
| `Ocelot.ApiGateway.csproj` | .NET project file | `net10.0`; `DockerfileContext=../..` (repo root) |
| `Dockerfile` | Multi-stage container build | Base image `mcr.microsoft.com/dotnet/aspnet:10.0`; exposes 80 |
| `appsettings.json` | Default logging configuration | `Default=Information`, `Microsoft.AspNetCore=Warning` |
| `appsettings.Development.json` | Development logging override | Same log levels as default |
| `Ocelot.ApiGateway.http` | VS Code REST client scratch file | Targets `http://localhost:5210`; not production config |

## Key Boundaries
- **Presentation**: None — the gateway is a transparent proxy; it adds no transformation logic.
- **Application/Domain**: Route matching, per-route quality-of-service (file caching, rate limiting) — all declared in `ocelot.*.json`, evaluated by the Ocelot library at runtime.
- **Persistence/External I/O**: Outbound HTTP calls to four downstream services. No database. In-process file cache (`FileCacheOptions.TtlSeconds`) for Catalog root (30 s) and Activity (10 s) routes.
- **Cross-cutting concerns**:
  - CORS: `AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()` configured in `Program.cs`.
  - Logging: ASP.NET Core default logging at `Information` level.
  - Swagger/OpenAPI: enabled in Development environment only (`app.Environment.IsDevelopment()`).
- **Responsibilities by file/module**:
  - `Program.cs`: wires the DI container (`AddOcelot()`, `AddCors()`, `AddControllers()`, `AddSwaggerGen()`) and the HTTP pipeline (`UseCors`, `UseRouting`, `UseAuthorization`, `MapControllers`, `UseOcelot`).
  - `ocelot.*.json`: sole source of truth for routing topology — upstream path templates, downstream path templates, HTTP methods, hosts, ports, caching, and rate limits.
  - `Dockerfile`: defines the two-stage build; the build context must be the repo root because `Directory.Packages.props` is at root.
- **Detailed code flows**:
  1. Request arrives at the Ocelot gateway (any path other than `GET /`).
  2. `Program.cs` startup has already called `builder.Host.ConfigureAppConfiguration(...)` which loaded `ocelot.{EnvironmentName}.json` into `IConfiguration`.
  3. `UseOcelot()` intercepts the request and scans `Routes[]` for a matching `UpstreamPathTemplate` and `UpstreamHttpMethod`.
  4. If the route has `FileCacheOptions`, Ocelot checks its in-process cache before forwarding.
  5. If the route has `RateLimitOptions`, Ocelot enforces the period/limit (e.g., `Limit=1` per `3s` for Basket Checkout routes) and returns HTTP 429 if exceeded.
  6. Ocelot forwards the request to the matched `DownstreamHostAndPorts` using the `DownstreamPathTemplate`.
  7. The downstream service response is returned to the client.
- **How the pieces map together**: `Program.cs` bootstraps everything; `ocelot.*.json` drives all runtime routing decisions; no C# code defines routes. The `Controllers\` folder in the csproj is an empty placeholder — there are no custom controller classes.
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
| Variable / File | Where set | Effect |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | `docker-compose.override.yml` (=`Development`); Kubernetes deployment | Selects which `ocelot.{env}.json` is loaded |
| `ASPNETCORE_HTTP_PORTS` | `Dockerfile` (=`80`) | Container listening port |
| `GlobalConfiguration.BaseUrl` | `ocelot.Development.json` (`http://localhost:8010`); `ocelot.k8s.json` (`http://ocelotapigw`) | Base URL Ocelot uses for Location headers |
| Docker Compose host port | `docker-compose.override.yml` | `8010:80` — gateway accessible at `localhost:8010` |

No `__`-prefixed environment variable config pattern is used; all routing behaviour lives in the `Routes[]` JSON arrays.

## Interfaces & Contracts
The public HTTP surface is the union of all `UpstreamPathTemplate` entries in `ocelot.Development.json` / `ocelot.k8s.json`. The gateway strips the services' internal `/api/v1` prefix.

**Catalog (downstream port 8000 / DNS `eshopping-catalog`):**
- `GET|POST|PUT /Catalog` → `/api/v1/Catalog` (30 s cache)
- `GET|DELETE /Catalog/GetProductById/{id}` → `/api/v1/Catalog/GetProductById/{id}`
- `POST /Catalog/CreateProduct` → `/api/v1/Catalog/CreateProduct`
- `GET|DELETE /Catalog/GetAllProducts` → `/api/v1/Catalog/GetAllProducts`
- `GET|DELETE /Catalog/GetAllBrands` → `/api/v1/Catalog/GetAllBrands`
- `POST /Catalog/CreateBrand` → `/api/v1/Catalog/CreateBrand`
- `GET|DELETE /Catalog/GetAllTypes` → `/api/v1/Catalog/GetAllTypes`
- `POST /Catalog/CreateType` → `/api/v1/Catalog/CreateType`
- `GET /Catalog/GetProductsByBrandName/{brand}` → `/api/v1/Catalog/GetProductsByBrandName/{brand}`
- `POST /Catalog/UploadProductImage` → `/api/v1/Catalog/UploadProductImage`
- `GET /Catalog/GetProductByProductName/{productName}` → `/api/v1/Catalog/GetProductByProductName/{productName}`
- `PUT /Catalog/UpdateProduct` → `/api/v1/Catalog/UpdateProduct`
- `DELETE /Catalog/{id}` → `/api/v1/Catalog/{id}`
- `POST /Admin/MigrateImagesToS3` → `/api/v1/Admin/MigrateImagesToS3`

**Basket (downstream port 8001 / DNS `eshopping-basket`):**
- `GET /Basket/GetBasket/{userName}` → `/api/v1/Basket/GetBasket/{userName}`
- `DELETE /Basket/DeleteBasket/{userName}` → `/api/v1/Basket/DeleteBasket/{userName}`
- `POST /Basket/CreateBasket` → `/api/v1/Basket/CreateBasket`
- `POST /Basket/Checkout` → `/api/v1/Basket/Checkout` (rate-limited: 1/3 s)
- `POST /Basket/CheckoutV2` → `/api/v2/Basket/Checkout` (rate-limited: 1/3 s)

**Discount (downstream port 8002 / DNS `eshopping-discount-discount-grpc:8080`):**
- `GET|DELETE /Discount/{productName}` → `/api/v1/Discount/{productName}`
- `PUT|POST /Discount` → `/api/v1/Discount`

**Ordering / Activity (downstream port 8003 / DNS `eshopping-ordering`):**
- `GET /Order/{userName}` → `/api/v1/Order/{userName}`
- `POST|PUT /Order` → `/api/v1/Order`
- `DELETE /Order/{id}` → `/api/v1/Order/{id}`
- `GET /Activity` → `/api/v1/Activity` (10 s cache)
- `GET /Activity/` → `/api/v1/Activity` (10 s cache, trailing-slash alias)

The gateway produces no events and defines no request/response schemas.

## Data & State
The gateway is stateless. The only transient state is Ocelot's in-process file cache (heap-resident, lost on restart):
- Catalog root route: TTL 30 s.
- Activity routes (`/Activity`, `/Activity/`): TTL 10 s.

No database, no message queue, no persistent storage.

## Dependencies
**Outbound (downstream calls):**
- Catalog service at `host.docker.internal:8000` (Compose) / `eshopping-catalog:80` (k8s)
- Basket service at `host.docker.internal:8001` (Compose) / `eshopping-basket:80` (k8s)
- Discount service at `host.docker.internal:8002` (Compose) / `eshopping-discount-discount-grpc:8080` (k8s)
- Ordering service at `host.docker.internal:8003` (Compose) / `eshopping-ordering:80` (k8s)

**Inbound (callers):**
- Browser clients and micro-frontends (the host shell).

**Package dependencies** (versions from `Directory.Packages.props` at repo root):
- `Ocelot` 23.4.3
- `Swashbuckle.AspNetCore` 6.4.0
- `Microsoft.VisualStudio.Azure.Containers.Tools.Targets` (tooling only)

No project-to-project references to any service.

## Patterns
- **Routing is pure config**: All routing decisions live in `Routes[]` JSON. No C# routing code exists; the `Controllers\` folder is empty.
- **Environment-switched config**: `Program.cs` loads `ocelot.{EnvironmentName}.json` at startup. Dev uses `host.docker.internal` host aliases; k8s uses Kubernetes service DNS. Routes are identical between files — only `DownstreamHostAndPorts` differ.
- **Prefix stripping**: Upstream paths are short form (e.g., `/Catalog/GetAllProducts`); downstream paths always include `/api/v1/` (or `/api/v2/` for `CheckoutV2`).
- **Per-route QoS**: `FileCacheOptions` and `RateLimitOptions` are route-level JSON properties, not global middleware.
- **Multi-stage Docker build**: Build context is repo root so `Directory.Packages.props` (NuGet Central Package Management) is available during `dotnet restore`.

## Gotchas & Owners
- **Discount is gRPC-only internally**: Basket calls Discount directly over gRPC. The `/Discount` REST routes in the gateway exist as an HTTP façade but the Discount service is `eshopping-discount-discount-grpc` — real discount resolution does not go through these gateway routes in normal operation.
- **No auth/authz at gateway**: There is no JWT validation or authentication middleware configured. Downstream services are not protected by the gateway today.
- **CORS is wide-open**: `AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()` — intentional for development but not suitable for production.
- **Rate-limit 429 in load tests**: `/Basket/Checkout` and `/Basket/CheckoutV2` are capped at 1 request per 3 seconds. Load tests will receive HTTP 429.
- **ocelot.k8s.json has no trailing-slash `/Activity/` route**: `ocelot.Development.json` has a duplicate route for `GET /Activity/` (trailing slash); `ocelot.k8s.json` does not include this entry.
- **Changing a port requires updates in two places**: Both `ocelot.Development.json` and `docker-compose.override.yml` (or Helm values) must be updated when a downstream port changes.
- **`Ocelot.ApiGateway.http` is a scratch file**: It targets `localhost:5210` (the `dotnet run` default without Docker) with a `weatherforecast` endpoint that does not exist on this service.
- **Owners**: `backend-architect` (routing and aggregation design), `devops-automator` (env-specific configs, ports, deploy), `api-tester` (route and rate-limit verification). Roles from `.claude/agents/`.
