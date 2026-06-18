# services — microservices

## What & why

The four backend microservices that make up the platform's domain. Each follows **Clean Architecture**
with four projects — `*.API` (entry point / controllers / DI), `*.Application` (CQRS
commands/queries/handlers/DTOs), `*.Core` (domain entities + repository interfaces), `*.Infrastructure`
(persistence + external adapters). All use the in-house `Common.Mediator` for CQRS and
MassTransit/RabbitMQ for async events. This part exists to keep each bounded context independent
(polyglot persistence, owned database, no shared schema).

## Where it lives

`Services/` → `Basket/`, `Catalog/`, `Discount/`, `Ordering/`. Sub-parts:
- [`Basket/CLAUDE.md`](./Basket/CLAUDE.md) — Redis cart, gRPC client → Discount, publishes checkout events. `:8001`.
- [`Catalog/CLAUDE.md`](./Catalog/CLAUDE.md) — MongoDB products/brands/types, S3/LocalStack images, publishes
  product-activity events. `:8000`.
- [`Discount/CLAUDE.md`](./Discount/CLAUDE.md) — PostgreSQL coupons via Dapper, gRPC server. gRPC `:8080`
  (host `:8002`).
- [`Ordering/CLAUDE.md`](./Ordering/CLAUDE.md) — SQL Server orders via EF Core, RabbitMQ consumers + REST. `:8003`.

## Tech stack

- .NET 10 (`net10.0`; SDK `10.0.300` from `global.json`), Central Package Management
  (`Directory.Packages.props`).
- Shared key deps: MassTransit/MassTransit.RabbitMQ 8.5.10, Riok.Mapperly 4.3.1, Asp.Versioning 10.0.0,
  OpenTelemetry 1.15.x, Serilog.AspNetCore 8.0.3, Swashbuckle 6.4.0. Per-service deps (MongoDB.Driver,
  EF Core 10, Dapper/Npgsql, Grpc.AspNetCore, AWSSDK.S3, FluentValidation, Polly) live in each sub-part.

## Build / run / test

```bash
dotnet build Ecommerce.sln                       # build all
dotnet run --project Services/<Name>/<Name>.API  # run one (needs its DB + RabbitMQ)
docker compose up -d                             # full stack incl. databases + RabbitMQ + ES
```

Each service binds container port `80` and is published on its host port (8000–8003); exact ports,
prerequisites, and migration commands are in each sub-part's `CLAUDE.md`.

## Configuration

Local defaults live in each service's `appsettings*.json`; real values are injected as `__`-delimited env
vars in `docker-compose.override.yml` (ConfigMaps/Secrets in cluster). Common keys per service:
`EventBusSettings__HostAddress=${RABBITMQ_URL}`, `ElasticConfiguration__Uri=${ELASTICSEARCH_URL}`,
`Otlp:Endpoint` (default `http://jaeger-collector.istio-system:4317`). Datastore keys differ per service
(`CacheSettings__ConnectionString`, `DatabaseSettings__ConnectionString`,
`ConnectionStrings__OrderingConnectionString`, `GrpcSettings__DiscountUrl`, `USE_LOCALSTACK`/`AWS__S3__*`)
— see the sub-parts for the exact mapping.

## Interfaces & contracts

REST endpoints (Catalog, Basket, Ordering) are exposed through the gateway
([`ApiGateways/Ocelot.ApiGateway/CLAUDE.md`](../ApiGateways/Ocelot.ApiGateway/CLAUDE.md)); Discount is gRPC-only. Shared event contracts and queue
names live in `Infrastructure/EventBus.Messages` ([`Infrastructure/CLAUDE.md`](../Infrastructure/CLAUDE.md)):
- Basket publishes `BasketCheckoutEvent` / `BasketCheckoutEventV2` → Ordering consumes both.
- Catalog publishes `ProductActivityEvent` → Ordering consumes.
- Ordering publishes/consumes `OrderActivityEvent`.
- Basket↔Discount gRPC contract: `Services/Discount/Discount.Application/Protos/discount.proto`.
Per-route/method detail is in each sub-part.

## Data & state

Polyglot persistence — each service owns its engine, no shared schema, no cross-service joins:
Basket → Redis, Catalog → MongoDB (+ S3/LocalStack), Discount → PostgreSQL, Ordering → SQL Server.
RabbitMQ carries async events between them. Migration/seed behaviour is per sub-part (Ordering = EF
migrations; Discount = drop/recreate on startup; Catalog/Redis = none).

## Dependencies

- Sync: Basket → Discount (gRPC, checkout hot path). The gateway → Catalog/Basket/Ordering (HTTP).
- Async: Basket → Ordering and Catalog → Ordering (RabbitMQ events).
- Shared libs: all services depend on `Common.Mediator`, `EventBus.Messages`, `Common.Logging`
  ([`Infrastructure/CLAUDE.md`](../Infrastructure/CLAUDE.md)).
- Directional map (who calls whom, sync vs async) is summarized above; specifics per sub-part.

## Patterns

- Layer dependencies point inward: `API → Application → Core`, `Infrastructure → Core`. Keep `*.Core`
  free of framework/persistence dependencies.
- CQRS: a request is an `IRequest<T>` in `*.Application`, handled by an `IRequestHandler<T,R>`; register
  handler assemblies via `AddMediator(...)` in `Program.cs`.
- DTO mapping via Riok.Mapperly (source-generated) — edit the `[Mapper]` partial, not hand maps
  (Discount DI-registers its mapper; Basket/Catalog use a static `Instance`).
- Events: publish/consume types from `Infrastructure/EventBus.Messages`; queue names from `EventBusConstant`.
- Versioning: `Asp.Versioning` with v1/v2 checkout coexistence (Basket publishes both, Ordering consumes both).

## Gotchas

- Each service owns its own database engine — communicate via gRPC (sync) or RabbitMQ (async) only, never
  a shared DB.
- Connection strings/credentials come from config (`appsettings.*` locally, ConfigMaps/Secrets in
  cluster). Jaeger OTLP endpoint defaults to `http://jaeger-collector.istio-system:4317`.
- v1/v2 events must both keep working — prefer adding `*EventV2` over editing v1 (shared compile-time
  contract).
- Per-service footguns (Discount table dropped each boot, Ordering consumer endpoints, Catalog Mongo
  schema drift, Basket gRPC hot path) live in each sub-part's `CLAUDE.md`.

## Owners / agents

`backend-architect`, `api-tester`, `code-reviewer`. Roles from `.claude/agents/`; per-service owners are
in each sub-part.
