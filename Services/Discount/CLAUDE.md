# discount — Discount service

## What & why

Coupon/discount management. It is a **gRPC-first** service: it exposes a gRPC server that Basket calls
to resolve a product's discount at checkout. There is no REST surface — the HTTP root just tells you to
use a gRPC client. Persistence is PostgreSQL via Dapper (raw SQL, no EF).

## Where it lives

`Services/Discount/` — Clean Architecture, four projects:
- `Discount.API/` — `Program.cs`, `Services/DiscountService.cs` (gRPC server impl), `Dockerfile`,
  `appsettings.json` (Kestrel gRPC endpoint).
- `Discount.Application/` — CQRS commands/queries/handlers, `Mapper/DiscountMapper.cs` (Mapperly),
  and the contract `Protos/discount.proto` (`GrpcServices="Server"`).
- `Discount.Core/` — `Entities/Coupon.cs`, `Repositories/IDiscountRepository.cs`.
- `Discount.Infrastructure/` — `Repositories/DiscountRepository.cs` (Dapper), `Extensions/DbExtension.cs`
  (startup migration).

## Tech stack

- .NET 10 (`net10.0` in `Discount.API/Discount.API.csproj`; SDK `10.0.300` from `global.json`).
- Versions via `Directory.Packages.props`: Grpc.AspNetCore 2.80.0 (added via `AddGrpc()`), Dapper 2.1.79,
  Npgsql 10.0.3, Riok.Mapperly 4.3.1, OpenTelemetry 1.15.x, Serilog.AspNetCore 8.0.3.
- Project refs (`Discount.API.csproj`): `Common.Logging`, `Discount.Application`, `Discount.Infrastructure`.

## Build / run / test

```bash
# Local (needs PostgreSQL :5432; auto-creates DB + Coupon table + seed on startup)
cd Services/Discount/Discount.API && dotnet run

docker build -f Services/Discount/Discount.API/Dockerfile -t discountapi .
docker compose up discount.api      # host :8002 → container :8080 (gRPC)

# Test with a gRPC client (grpcurl / Basket), NOT Postman REST
```

Kestrel listens on `http://0.0.0.0:8080` HTTP/2 (`appsettings.json` `Kestrel:Endpoints:Grpc`); compose
maps host `:8002` → container `:8080`. No Swagger (not a REST service).

## Configuration

Read in `Discount.API/Program.cs` / `DbExtension.cs`; defaults in `Discount.API/appsettings.json`,
real values as env vars in `docker-compose.override.yml`:
- `DatabaseSettings:ConnectionString` / `DatabaseSettings__ConnectionString=${POSTGRES_URL}` —
  PostgreSQL connection (read by `DbExtension.ApplyMigrations` and `DiscountRepository`).
  NOTE: compose injects `DatabaseSettings__ConnectionString` (whereas Basket/Catalog/Ordering use other
  prefixes); the `discountdb` container uses `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`.
- `Kestrel:Endpoints:Grpc:Url` = `http://0.0.0.0:8080`, `Protocols=Http2` (`appsettings.json`).
- `ElasticConfiguration:Uri` / `ElasticConfiguration__Uri=${ELASTICSEARCH_URL}` — optional Serilog ES sink.
- `Otlp:Endpoint` — OTLP traces, default `http://jaeger-collector.istio-system:4317`.

## Interfaces & contracts

gRPC service `DiscountProtoService` (`Discount.Application/Protos/discount.proto`), implemented by
`Discount.API/Services/DiscountService.cs : DiscountProtoService.DiscountProtoServiceBase`:
- `GetDiscount(GetDiscountRequest{productName}) → CouponModel{id,productName,description,amount}`
- `CreateDiscount(CreateDiscountRequest{coupon}) → CouponModel`
- `UpdateDiscount(UpdateDiscountRequest{coupon}) → CouponModel`
- `DeleteDiscount(DeleteDiscountRequest{productName}) → DeleteDiscountResponse{success}`

The proto is the **source of truth** for the Basket↔Discount contract; Basket compiles it as a client
(`Services/Discount/Discount.Application/Protos/discount.proto` linked into `Basket.Application.csproj`).
HTTP root `GET /` returns "Communication with grpc endpoints must be made through a grpc client"
(`Program.cs`). No events published or consumed.

## Data & state

- PostgreSQL `DiscountDb`, single `Coupon` table (`Id SERIAL PK, ProductName VARCHAR(500), Description
  TEXT, Amount INT`) — created/seeded in `Discount.Infrastructure/Extensions/DbExtension.cs`.
- Access via Dapper + Npgsql in `Repositories/DiscountRepository.cs` (raw parameterized SQL, no EF).
- Container `discountdb` (`:5432`, `docker-compose.override.yml`).

## Dependencies

- Called by **Basket** (sync, gRPC) at checkout — the only caller.
- → PostgreSQL.
- → Shared libs `Common.Mediator` (gRPC methods dispatch to handlers via `IMediator`) and
  `Common.Logging` — see [`Infrastructure/CLAUDE.md`](../../Infrastructure/CLAUDE.md).
- Not routed through the API gateway (gRPC-only).

## Patterns

- `discount.proto` is the contract — change it here; Basket regenerates its client. Keep request/response
  shapes backward-compatible.
- gRPC handlers are thin: `DiscountService` maps the proto request to a Common.Mediator
  command/query and returns the handler result.
- Mapperly mapper is DI-registered here (`AddSingleton<DiscountMapper>()` in `Program.cs`) — unlike
  Basket/Catalog, which use a static `Instance`.
- Dapper means hand-written SQL — always parameterize queries.

## Gotchas

- **Not** a REST service — don't add controllers expecting Ocelot routing, and don't add a REST gateway
  route for Discount. Test with a gRPC client.
- gRPC listens on container `8080`, not `8002` (host mapping only); Basket's `GrpcSettings:DiscountUrl`
  must point at `:8080`.
- The startup migration **drops and recreates** the `Coupon` table every boot
  (`DROP TABLE IF EXISTS Coupon` in `DbExtension.cs`) — coupon data is not durable across restarts. A
  migration failure (retried 5×) makes the container start unhealthy.

## Owners / agents

`backend-architect` (gRPC contract, Dapper persistence, startup migration). Role from `.claude/agents/`.
