---
name: ordering
description: Order processing and activity-feed microservice — primarily event-driven (consumes basket-checkout and product/order-activity events from RabbitMQ), persists orders in SQL Server via EF Core, and exposes a small REST API.
paths:
  - Services/Ordering/**/*
metadata:
  part-dir: Services/Ordering
---

The Ordering service processes customer orders and powers the platform's activity feed. Its primary production path is asynchronous: it consumes `BasketCheckoutEvent` / `BasketCheckoutEventV2` from RabbitMQ to create orders, and `ProductActivityEvent` / `OrderActivityEvent` to populate an `Activities` table. It also exposes a REST surface for querying orders and activities. Persistence is SQL Server via EF Core 10, with migrations applied automatically on startup.

## Key files to read first

- `Services/Ordering/Ordering.API/Program.cs` — startup: Serilog, OpenTelemetry, MassTransit consumer registration, EF migrate + seed
- `Services/Ordering/Ordering.API/Controllers/OrderController.cs` — REST endpoints for order CRUD
- `Services/Ordering/Ordering.API/Controllers/ActivityController.cs` — paged activity feed (`GET /api/v1/Activity`)
- `Services/Ordering/Ordering.API/EventBusConsumer/` — the four MassTransit consumers: `BasketOrderingConsumer`, `BasketOrderingConsumerV2`, `ProductActivityConsumer`, `OrderActivityConsumer`
- `Services/Ordering/Ordering.Application/` — CQRS commands/queries/handlers, FluentValidation validators, `Behaviour/` pipeline (validation + exception handling)
- `Services/Ordering/Ordering.Infrastructure/Data/OrderContext.cs` — EF Core context
- `Services/Ordering/Ordering.Infrastructure/Migrations/` — `InitialCreate` + `AddActivitiesTable`
- `Services/Ordering/Ordering.Infrastructure/Data/OrderContextSeed.cs` — startup seed
- `Infrastructure/EventBus.Messages/Common/EventBusConstant.cs` — queue name constants consumed here

## Top patterns

- **Event-driven checkout is the primary path**: orders are created by `BasketOrderingConsumer` / `BasketOrderingConsumerV2` consuming from RabbitMQ. The `POST /api/v1/Order` REST endpoint is test-only (noted in comments).
- **v1/v2 consumer coexistence**: both `BasketOrderingConsumer` (queue `basketcheckout-queue`) and `BasketOrderingConsumerV2` (queue `basketcheckout-queue-v2`) must remain registered in `Program.cs`. V1 consumer also publishes `OrderActivityEvent` after order creation; V2 does not.
- **Activity idempotency**: both activity consumers check `ExistsByEventIdAsync` before inserting — safe to re-deliver events.
- **Pipeline behaviors in Application**: `ValidationBehaviour` (FluentValidation) and `UnhandledExceptionBehaviour` wrap every mediator request.
- **EF migrations**: schema changes go through `Ordering.Infrastructure/Migrations/`; run `dotnet ef migrations add <Name>` with `--project Ordering.Infrastructure` and `--startup-project Ordering.API`.

## Gotchas

- **Gateway vs controller naming**: Ocelot downstream paths use `/api/v1/Ordering` but `OrderController` resolves to `/api/v1/Order`. Direct calls and smoke tests use `Order`; check gateway config before assuming route resolution.
- **Each consumer requires its own `ReceiveEndpoint`** with the exact `EventBusConstant` queue name in `Program.cs`. A missing or misnamed endpoint means events are silently dropped.
- **Startup migration**: if SQL Server is not ready when the container starts, the Polly retry in `DbExtension` will retry; a persistent failure leaves the container unhealthy.
- **Hardcoded audit user**: `OrderContext.SaveChangesAsync` sets `CreatedBy`/`LastModifiedBy` to `"slowey"` — this is a known TODO pending auth integration.
- **Payment data in plain columns**: `CardNumber`, `Cvv` etc. are stored as plain strings on the `Order` entity — no tokenization in this service.
- **ActivityController route is fixed** (`api/v1/[controller]`), while `OrderController` inherits a versioned route from `ApiController` base — they behave differently under `Asp.Versioning`.
- **Port varies by environment**: Docker Compose host port `8003`, Kubernetes port-forward docs use `8004`.

## Full onboarding doc

[`Services/Ordering/AGENT.md`](../../../../Services/Ordering/AGENT.md)
