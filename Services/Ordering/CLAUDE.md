# ordering — Ordering service

## What & why

Order processing and the activity feed. It is event-driven: it consumes basket-checkout events (v1/v2)
to create orders, and product/order activity events to build a recent-activity view. It also exposes a
small REST surface for querying orders and activities. Persistence is SQL Server via EF Core.

## Where it lives

`Services/Ordering/` — Clean Architecture, four projects:
- `Ordering.API/` — `Program.cs`, `Controllers/OrderController.cs`, `Controllers/ActivityController.cs`,
  `EventBusConsumer/*` (the four consumers), `Extensions/DbExtension.cs`, `Dockerfile`.
- `Ordering.Application/` — CQRS commands/queries/handlers, `Behaviour/*` pipeline behaviours,
  `Validators/*` (FluentValidation), `Extensions/ServiceRegistration.cs` (`AddApplicationServices`).
- `Ordering.Core/` — entities + repository interfaces (`Repositories/IAsyncRepository.cs`).
- `Ordering.Infrastructure/` — EF `Data/OrderContext`, `Migrations/*`, `Data/OrderContextSeed.cs`,
  `Repositories/*`, `Extensions/InfraServices.cs` (`AddInfraServices`).

## Tech stack

- .NET 10 (`net10.0` in `Ordering.API/Ordering.API.csproj`; SDK `10.0.300` from `global.json`).
- Versions via `Directory.Packages.props`: EntityFrameworkCore.SqlServer/Design/Tools 10.0.8,
  MassTransit/MassTransit.RabbitMQ 8.5.10, FluentValidation 11.12.0, Polly 8.6.6,
  Asp.Versioning.Mvc 10.0.0, OpenTelemetry 1.15.x, Serilog.AspNetCore 8.0.3, Swashbuckle 6.4.0.
- Project refs (`Ordering.API.csproj`): `Common.Logging`, `Ordering.Application`, `Ordering.Infrastructure`.

## Build / run / test

```bash
# Local (needs SQL Server :1433, RabbitMQ :5672; migrates + seeds on startup)
cd Services/Ordering/Ordering.API && dotnet run

# EF migrations (design-time)
cd Services/Ordering/Ordering.Infrastructure
dotnet ef migrations add <Name>
dotnet ef database update

docker build -f Services/Ordering/Ordering.API/Dockerfile -t orderingapi .
docker compose up ordering.api      # host :8003 → container :80
```

Binds container `80`; published on host `:8003` (`docker-compose.override.yml`). Swagger (v1) in
Development only.

## Configuration

Read in `Ordering.API/Program.cs` / `InfraServices.cs`; defaults in `Ordering.API/appsettings.json`,
real values as env vars in `docker-compose.override.yml`:
- `ConnectionStrings:OrderingConnectionString` / `ConnectionStrings__OrderingConnectionString=${SQLSERVER_URL}`
  — SQL Server connection (note the `ConnectionStrings__` prefix, unlike the other services).
- `EventBusSettings:HostAddress` / `EventBusSettings__HostAddress=${RABBITMQ_URL}` — RabbitMQ host for
  the consumers' `ReceiveEndpoint`s.
- `ElasticConfiguration:Uri` / `ElasticConfiguration__Uri=${ELASTICSEARCH_URL}` — optional Serilog ES sink.
- `Otlp:Endpoint` — OTLP traces, default `http://jaeger-collector.istio-system:4317`.
- `orderdb` container env: `SA_PASSWORD=${SQL_SA_PASSWORD}`, `ACCEPT_EULA=${ACCEPT_EULA}`,
  `MSSQL_PID=Developer`.

## Interfaces & contracts

HTTP controllers (service paths `api/v1/Order/...`, `api/v1/Activity`; gateway exposes short form):
- `OrderController`: `GET Order/{userName}`, `POST Order` (`CheckoutOrderCommand`, also publishes
  `OrderActivityEvent`), `PUT Order` (`UpdateOrderCommand`), `DELETE Order/{id}`.
- `ActivityController` (`Route("api/v1/[controller]")`): `GET Activity` — paged recent activities
  (`pageIndex`, `pageSize`, `activityType`, `entityType`, `from`, `to`, `actor`).

Events consumed (MassTransit, queue names from `EventBusConstant`):
- `BasketCheckoutEvent` → `EventBusConsumer/BasketOrderingConsumer.cs` on `basketcheckout-queue`.
- `BasketCheckoutEventV2` → `BasketOrderingConsumerV2.cs` on `basketcheckout-queue-v2`.
- `ProductActivityEvent` → `ProductActivityConsumer.cs` on `product-activity-queue`.
- `OrderActivityEvent` → `OrderActivityConsumer.cs` on `order-activity-queue`.
Event published: `OrderActivityEvent` (from `CheckoutOrder`). Contracts live in
`Infrastructure/EventBus.Messages/Events/`.

## Data & state

- SQL Server `OrderDb` via EF Core 10 (`Ordering.Infrastructure/Data/OrderContext`); schema changes go
  through EF migrations under `Ordering.Infrastructure/Migrations/`.
- `MigrateDatabase<OrderContext>` + `OrderContextSeed.SeedAsync` run automatically on startup
  (`Program.cs`).
- RabbitMQ is the async ingress (four `ReceiveEndpoint`s). Container `orderdb` (`:1433`).

## Dependencies

- Consumes from **Basket** (`BasketCheckoutEvent`/`V2`) and **Catalog** (`ProductActivityEvent`) over
  RabbitMQ (async); consumes its own `OrderActivityEvent`.
- → SQL Server.
- → Shared libs `Common.Mediator`, `EventBus.Messages`, `Common.Logging` — see
  [`Infrastructure/CLAUDE.md`](../../Infrastructure/CLAUDE.md).
- REST surface called by the gateway ([`ApiGateways/Ocelot.ApiGateway/CLAUDE.md`](../../ApiGateways/Ocelot.ApiGateway/CLAUDE.md)). No outbound
  sync calls to other services.

## Patterns

- Consumer end of v1/v2 coexistence: keep **both** `BasketOrderingConsumer` and `...ConsumerV2`
  registered (`AddConsumer<>`) and mapped to their queues (`ReceiveEndpoint`) in `Program.cs`.
- Wire DI through the extension methods `AddApplicationServices()` / `AddInfraServices(configuration)`.
- Validate order commands with FluentValidation (`Validators/*`, applied via `Behaviour/ValidationBehaviour.cs`);
  wrap resilient/external calls with Polly.

## Gotchas

- Each consumer needs its own `ReceiveEndpoint` with the matching `EventBusConstant` queue name — a
  missing/wrong endpoint means events are silently not consumed (no error).
- Migration + seed run on startup; if SQL Server isn't ready or a migration fails, the container starts
  unhealthy.
- Adding an event field is a shared-contract change in `EventBus.Messages` — coordinate with the
  publisher (Basket/Catalog) and prefer a new `*EventV2`.
- `Activity` is file-cached at the gateway (~10s) — fresh activity can appear stale briefly.

## Owners / agents

`backend-architect` (EF persistence, consumers, CQRS), `api-tester` (order REST + event-driven flows).
Roles from `.claude/agents/`.
