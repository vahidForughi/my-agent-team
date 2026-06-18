# Discount Service — Agent Onboarding

## What & why

The Discount service stores and serves product-level coupon discounts for the e-commerce platform. It exposes a **gRPC-only** API (`DiscountProtoService`) for CRUD on `Coupon` records keyed by `ProductName`. The Basket service is the primary consumer: it calls `GetDiscount` when creating a shopping cart to apply per-item discount amounts.

There is no REST controller in this service. The root HTTP `GET /` endpoint returns a plain-text message directing callers to use a gRPC client (`Program.cs`).

## Where it lives

```
Services/Discount/
├── Discount.API/              # Host, gRPC service, DI wiring, Dockerfile
│   ├── Program.cs             # Entry point
│   ├── Services/DiscountService.cs
│   ├── appsettings.json
│   └── Dockerfile
├── Discount.Application/      # Commands, queries, handlers, proto, Mapperly
│   ├── Commands/
│   ├── Queries/
│   ├── Handlers/
│   ├── Mapper/DiscountMapper.cs
│   └── Protos/discount.proto
├── Discount.Core/             # Domain entity + repository interface
│   ├── Entities/Coupon.cs
│   └── Repositories/IDiscountRepository.cs
└── Discount.Infrastructure/ # PostgreSQL via Dapper, startup migration
    ├── Repositories/DiscountRepository.cs
    └── Extensions/DbExtension.cs
```

Solution registration: `Ecommerce.sln` under the `Discount` solution folder (projects: `Discount.API`, `Discount.Application`, `Discount.Core`, `Discount.Infrastructure`).

Deployment manifests: `Deployments/helm/discount/`, `Deployments/k8s/services/discount-api.yaml`, `Deployments/k8s/discount/discount-api/`, `docker-compose.yml` + `docker-compose.override.yml` (`discount.api`, `discountdb`).

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | .NET 10 (`net10.0`) |
| API | gRPC (`Grpc.AspNetCore`), proto in `Discount.Application/Protos/discount.proto` |
| Application | Custom `Common.Mediator` (CQRS-style commands/queries + handlers) |
| Mapping | Riok.Mapperly source-generated `DiscountMapper` |
| Persistence | PostgreSQL via `Npgsql` + `Dapper` (raw SQL, no EF Core) |
| Logging | Serilog via `Common.Logging` (console + optional Elasticsearch sink) |
| Tracing | OpenTelemetry ASP.NET Core instrumentation, OTLP export to Jaeger |
| Container | Multi-stage Dockerfile on `mcr.microsoft.com/dotnet/aspnet:10.0` |

## Build / run / test

**Build (from repo root):**

```bash
dotnet build Ecommerce.sln
# or scoped:
dotnet build Services/Discount/Discount.API/Discount.API.csproj
```

**Run locally:**

```bash
cd Services/Discount/Discount.API && dotnet run
# or hot reload:
cd Services/Discount/Discount.API && dotnet watch run
```

Kestrel listens for gRPC on **port 8080** (`appsettings.json` → `Kestrel:Endpoints:Grpc:Url: http://0.0.0.0:8080`, protocols Http2).

**Docker Compose:**

```bash
docker compose up discount.api discountdb
```

Host port mapping: **8002 → 8080** (`docker-compose.override.yml`). Requires `POSTGRES_URL` env var for `DatabaseSettings__ConnectionString`.

**Kubernetes / Helm:**

```bash
docker build -f Services/Discount/Discount.API/Dockerfile -t eshop/discount.grpc:latest .
```

Helm chart: `Deployments/helm/discount/` (service port 8080).

**Test:**

- No dedicated `Discount.*.Test` project in the solution.
- CI builds the Docker image: `.github/workflows/ci.yml` matrix entry `{ name: "discount-api", path: "Services/Discount/Discount.API" }`.
- k6 load test stub (skipped): `tests/k6/discount-test.js` — documents gRPC-only testing; automated run is a no-op.

Example gRPC client usage (from Basket): `Services/Basket/Basket.Application/GrpcService/DiscountGrpcService.cs` calls `GetDiscountAsync`.

## Configuration

| Key | Source | Purpose |
|-----|--------|---------|
| `DatabaseSettings:ConnectionString` | `appsettings.json` (`${POSTGRES_URL}`), docker-compose / Helm configmaps | PostgreSQL connection for `DiscountRepository` |
| `Kestrel:Endpoints:Grpc:Url` | `Services/Discount/Discount.API/appsettings.json` | gRPC bind address (`http://0.0.0.0:8080`) |
| `Kestrel:Endpoints:Grpc:Protocols` | `appsettings.json` | `Http2` |
| `ElasticConfiguration:Uri` | `appsettings.json` (`${ELASTICSEARCH_URL}`) | Serilog Elasticsearch sink via `Common.Logging` |
| `Otlp:Endpoint` | _not found in appsettings_; defaults in `Program.cs` to `http://jaeger-collector.istio-system:4317` | OpenTelemetry OTLP exporter |
| `ASPNETCORE_ENVIRONMENT` | Docker / Helm env | Standard ASP.NET Core environment |

Downstream consumer config (Basket): `GrpcSettings:DiscountUrl` — e.g. `http://discount.api:8080` in `docker-compose.override.yml`, `http://eshopping-discount-discount-grpc:8080` in Helm basket configmap.

## Interfaces & contracts

**gRPC service** — defined in `Services/Discount/Discount.Application/Protos/discount.proto`:

| RPC | Request | Response |
|-----|---------|----------|
| `GetDiscount` | `GetDiscountRequest { productName }` | `CouponModel` |
| `CreateDiscount` | `CreateDiscountRequest { coupon }` | `CouponModel` |
| `UpdateDiscount` | `UpdateDiscountRequest { coupon }` | `CouponModel` |
| `DeleteDiscount` | `DeleteDiscountRequest { productName }` | `DeleteDiscountResponse { success }` |

`CouponModel` fields: `id`, `productName`, `description`, `amount` (all proto3; `amount` is `int32`).

C# namespace: `Discount.Grpc.Protos`. Server implementation: `Discount.API/Services/DiscountService.cs` (extends `DiscountProtoService.DiscountProtoServiceBase`).

**Repository contract** — `Discount.Core/Repositories/IDiscountRepository.cs`:

- `GetDiscount(string productName)` → `Coupon`
- `CreateDiscount(Coupon)` → `bool`
- `UpdateDiscount(Coupon)` → `bool`
- `DeleteDiscount(string productName)` → `bool`

**MediatR-style messages:**

- Query: `GetDiscountQuery` → `GetDiscountQueryHandler`
- Commands: `CreateDiscountCommand`, `UpdateDiscountCommand`, `DeleteDiscountCommand` → respective handlers

**Proto sharing:** Basket references the same proto as a gRPC client:

```xml
<!-- Services/Basket/Basket.Application/Basket.Application.csproj -->
<Protobuf Include="..\..\Discount\Discount.Application\Protos\discount.proto" GrpcServices="Client" />
```

Ocelot gateway routes (`ApiGateways/Ocelot.ApiGateway/ocelot.Development.json`) define upstream `/Discount/{productName}` → downstream `/api/v1/Discount/{productName}`, but **no REST controller exists in Discount.API** — those routes do not map to this service's code.

## Data & state

**Entity:** `Discount.Core/Entities/Coupon.cs`

| Property | Type | Notes |
|----------|------|-------|
| `Id` | `int` | DB-generated (`SERIAL PRIMARY KEY`) |
| `ProductName` | `string` | Lookup key; `VARCHAR(500) NOT NULL` |
| `Description` | `string` | `TEXT` |
| `Amount` | `int` | Discount amount (integer, not decimal) |

**Table:** `Coupon` — created at startup by `Discount.Infrastructure/Extensions/DbExtension.cs`:

```sql
CREATE TABLE Coupon(Id SERIAL PRIMARY KEY,
    ProductName VARCHAR(500) NOT NULL,
    Description TEXT,
    Amount INT)
```

**Seed data** (inserted on every migration run): two ASUS laptop product names with amounts 500 and 700.

**Database:** PostgreSQL database `DiscountDb` (Helm/k8s defaults). Docker Compose service: `discountdb` (postgres:14-alpine).

**Repository behavior** (`DiscountRepository.cs`):

- `GetDiscount`: `SELECT * FROM Coupon WHERE ProductName = @ProductName`. If no row, returns a placeholder `Coupon` with `ProductName = "No Discount"`, `Amount = 0`, `Description = "No Discount Availables"` (never returns `null`).
- `CreateDiscount`: `INSERT INTO Coupon (ProductName, Description, Amount) ...`
- `UpdateDiscount`: `UPDATE Coupon SET ... WHERE Id = @Id`
- `DeleteDiscount`: `DELETE FROM Coupon WHERE ProductName = @ProductName`

No caching layer. No message bus publishing in this service.

## Dependencies

**NuGet (via central `Directory.Packages.props`):**

- API: OpenTelemetry packages, Swashbuckle (referenced but unused — no Swagger setup in `Program.cs`)
- Application: `Grpc.AspNetCore`, `Riok.Mapperly`
- Infrastructure: `Dapper`, `Npgsql`, Microsoft.Extensions.* abstractions

**Project references:**

| Project | References |
|---------|------------|
| `Discount.API` | `Discount.Application`, `Discount.Infrastructure`, `Infrastructure/Common.Logging` |
| `Discount.Application` | `Discount.Core`, `Infrastructure/Common.Mediator` |
| `Discount.Infrastructure` | `Discount.Application` (transitively `Discount.Core`) |
| `Discount.Core` | _(none)_ |

**Runtime service dependencies:**

- PostgreSQL (`discountdb` / `eshopping-discountdb`)
- Elasticsearch (optional, for log shipping)
- Jaeger / OTLP collector (optional, for tracing)

**Downstream consumers (callers of this service):**

- `Services/Basket/Basket.Application/GrpcService/DiscountGrpcService.cs` — `GetDiscount` only, with graceful degradation on `RpcException`

## Patterns

**Clean architecture layering:** API → Application (handlers) → Core (interfaces/entities) ← Infrastructure (repository impl).

**CQRS via custom mediator:** `Program.cs` registers `AddMediator(assemblies)` scanning `Discount.API` and `Discount.Application`. gRPC service (`DiscountService`) translates proto requests into commands/queries and dispatches via `IMediator.Send`.

**gRPC as sole public API:** `endpoints.MapGrpcService<DiscountService>()` in `Program.cs`; no MVC controllers.

**Source-generated mapping:** `DiscountMapper` (Mapperly) converts between `CreateDiscountCommand`/`UpdateDiscountCommand` ↔ `Coupon` ↔ `CouponModel`. `Id` is ignored on create (`[MapperIgnoreTarget(nameof(Coupon.Id))]`).

**Startup database bootstrap:** `app.MigrateDatabase<Program>()` calls `DbExtension.MigrateDatabase`, which creates the database if missing, drops/recreates `Coupon`, and seeds sample rows. Retries up to 5 times with 2s sleep.

**Observability:** Serilog configured in `builder.Host.UseSerilog(Logging.ConfigureLogger)`. OpenTelemetry tracer named `Discount.API` with ASP.NET Core instrumentation.

## Gotchas

1. **gRPC-only — no REST.** README mentions "gRPC & REST endpoints" but code only maps gRPC + a informational `GET /`. Ocelot `/Discount/*` REST routes are stale relative to this codebase.

2. **Startup migration drops all data.** `DbExtension.ApplyMigrations` runs `DROP TABLE IF EXISTS Coupon` then `CREATE TABLE` on every startup. Existing coupons are wiped each deploy/restart.

3. **`GetDiscount` null check is unreachable.** `GetDiscountQueryHandler` throws `RpcException(NotFound)` when `coupon == null`, but `DiscountRepository.GetDiscount` always returns a placeholder object instead of `null`.

4. **Create/Update don't verify DB success.** Handlers call repository methods returning `bool` but ignore the return value; failed inserts/updates still return a mapped `CouponModel`.

5. **Create doesn't return DB-generated Id.** After insert, `CreateDiscountCommandHandler` maps the in-memory `Coupon` (Id still 0) to `CouponModel` without re-fetching.

6. **Discount amount is `int32`, not decimal.** Basket stores `DiscountAmount` as `decimal` and assigns `coupon.Amount` directly — unit/currency semantics are implicit integers.

7. **Port inconsistency across configs.** Service binds 8080; Basket `appsettings.json` defaults `GrpcSettings:DiscountUrl` to `http://discount.api:80`; docker-compose override corrects to `:8080`. k8s manifest `discount-api.yaml` exposes container port 80 while Helm uses 8080.

8. **`Discount.API.http` is a template stub.** Points to `localhost:5057/weatherforecast/` — not valid for this service.

9. **No unit/integration tests** in the solution for Discount handlers or repository.

## Owners

_not found in CODEOWNERS, README, or service metadata_
