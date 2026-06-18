# Ordering Service — Agent Onboarding

## What & why

The Ordering service is an ASP.NET Core microservice that persists customer orders and exposes a REST API for order CRUD and activity feeds. Its primary production path is **asynchronous**: it consumes `BasketCheckoutEvent` / `BasketCheckoutEventV2` messages from RabbitMQ (published by the Basket service) and creates orders in SQL Server. It also maintains an `Activities` table fed by `ProductActivityEvent` (from Catalog) and `OrderActivityEvent` (published locally after checkout), powering the admin activity feed via `GET /api/v1/Activity`.

## Where it lives

```
Services/Ordering/
├── Ordering.API/              # HTTP host, controllers, MassTransit consumers, Dockerfile
│   ├── Controllers/           # OrderController, ActivityController
│   ├── EventBusConsumer/      # BasketOrderingConsumer(V2), ProductActivityConsumer, OrderActivityConsumer
│   ├── Extensions/            # DbExtension (migrate + seed with Polly retry)
│   └── Program.cs             # Startup: Serilog, OpenTelemetry, MassTransit, EF migrate
├── Ordering.Application/      # CQRS commands/queries, handlers, validators, Mapperly mapper
├── Ordering.Core/             # Domain entities (Order, Activity), repository interfaces
└── Ordering.Infrastructure/   # EF Core OrderContext, repositories, migrations
```

Solution entry: `Ecommerce.sln` → project `Ordering.API` (`Services/Ordering/Ordering.API/Ordering.API.csproj`).

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | .NET 10 (`net10.0`) |
| Web | ASP.NET Core Web API, Asp.Versioning.Mvc (default v1.0) |
| CQRS | `Common.Mediator` (custom mediator, not MediatR package) |
| Validation | FluentValidation + `ValidationBehaviour` pipeline |
| Mapping | Riok.Mapperly source-generated `OrderMapper` |
| Persistence | EF Core + SQL Server (`Microsoft.EntityFrameworkCore.SqlServer`) |
| Messaging | MassTransit + RabbitMQ |
| Logging | Serilog via `Infrastructure/Common.Logging` |
| Tracing | OpenTelemetry OTLP → Jaeger (configurable endpoint) |
| API docs | Swashbuckle (Development only) |

## Build / run / test

**Build (from repo root):**

```bash
dotnet build Services/Ordering/Ordering.API/Ordering.API.csproj
```

**Run locally (requires SQL Server + RabbitMQ — use docker-compose):**

```bash
docker compose up ordering.api
# Direct API: http://localhost:8003
# Swagger (Development): http://localhost:8003/swagger
```

**Run without Docker:**

```bash
cd Services/Ordering/Ordering.API
dotnet run --urls "http://localhost:8003"
```

Set `ConnectionStrings__OrderingConnectionString` and `EventBusSettings__HostAddress` env vars (see `appsettings.json` placeholders).

**Docker image:**

```bash
docker build -f Services/Ordering/Ordering.API/Dockerfile -t eshop/ordering.api:latest .
```

**EF migrations (from repo root):**

```bash
dotnet ef migrations add <Name> \
  --project Services/Ordering/Ordering.Infrastructure/Ordering.Infrastructure.csproj \
  --startup-project Services/Ordering/Ordering.API/Ordering.API.csproj
```

**HTTP smoke tests:** `Services/Ordering/Ordering.API/Ordering.API.http` (base URL `http://localhost:8003`).

**Load tests:** `tests/k6/ordering-test.js` (k6, not unit tests in this part).

_no dedicated unit/integration test project found under `Services/Ordering/`_

## Configuration

| Key | Source | Purpose |
|-----|--------|---------|
| `ConnectionStrings:OrderingConnectionString` | `Ordering.API/appsettings.json` → env `ConnectionStrings__OrderingConnectionString` | SQL Server for `OrderDb` |
| `EventBusSettings:HostAddress` | `appsettings.json` → env `EventBusSettings__HostAddress` | RabbitMQ host URI for MassTransit |
| `ElasticConfiguration:Uri` | `appsettings.json` → env `ElasticConfiguration__Uri` | Serilog/Elastic sink (via Common.Logging) |
| `Otlp:Endpoint` | `Program.cs` default `http://jaeger-collector.istio-system:4317` | OpenTelemetry trace export |

**Docker Compose** (`docker-compose.override.yml`): service `ordering.api` maps host port **8003 → container 80**, depends on `orderdb`, `rabbitmq`, `elasticsearch`.

**Kubernetes / Helm:** `Deployments/helm/ordering/` (service `eshopping-ordering`, port-forward **8004** per `Deployments/k8s/port-forward.sh`).

## Interfaces & contracts

### REST API (direct service)

Base route from `ApiController`: `api/v{version:apiVersion}/[controller]` → **`/api/v1/Order`**.

| Method | Route | Handler | Notes |
|--------|-------|---------|-------|
| GET | `/api/v1/Order/{userName}` | `GetOrderListQuery` | Returns `IEnumerable<OrderResponse>` |
| POST | `/api/v1/Order` | `CheckoutOrderCommand` | Comment in code: "Just for testing"; publishes `OrderActivityEvent` on success |
| PUT | `/api/v1/Order` | `UpdateOrderCommand` | 204 No Content |
| DELETE | `/api/v1/Order/{id}` | `DeleteOrderCommand` | 204 No Content |

`ActivityController` uses explicit route `api/v1/[controller]` → **`/api/v1/Activity`**:

| Method | Route | Handler |
|--------|-------|---------|
| GET | `/api/v1/Activity` | `GetRecentActivitiesQuery` — query params: `pageIndex`, `pageSize`, `activityType`, `entityType`, `from`, `to`, `actor` |

### RabbitMQ consumers (MassTransit)

Queue names from `Infrastructure/EventBus.Messages/Common/EventBusConstant.cs`:

| Queue | Consumer | Event type | Action |
|-------|----------|------------|--------|
| `basketcheckout-queue` | `BasketOrderingConsumer` | `BasketCheckoutEvent` | Maps to `CheckoutOrderCommand`, saves order, publishes `OrderActivityEvent` |
| `basketcheckout-queue-v2` | `BasketOrderingConsumerV2` | `BasketCheckoutEventV2` | Maps to `CheckoutOrderCommandV2`, saves order (no activity publish) |
| `product-activity-queue` | `ProductActivityConsumer` | `ProductActivityEvent` | Idempotent insert into `Activities` |
| `order-activity-queue` | `OrderActivityConsumer` | `OrderActivityEvent` | Idempotent insert into `Activities` |

### Ocelot gateway

`Deployments/k8s/gateway/ocelot-gateway.yaml` routes upstream `/Ordering` → downstream `/api/v1/Ordering`. The actual controller name is **`Order`** (not `Ordering`) — gateway paths may not match the service unless aligned elsewhere.

## Data & state

**Database:** SQL Server, database name `OrderDb` (Helm configmap: `Deployments/helm/ordering/templates/configmap.yaml`).

**Tables:**

- **`Orders`** — `Order` entity (`Ordering.Core/Entities/Order.cs`): user/shipping/payment fields + audit columns from `EntityBase`.
- **`Activities`** — `Activity` entity: `EventId` (unique, idempotency), `ActivityType`, `EntityType`, `EntityId`, `Title`, `Description`, `Actor`, `SourceService`, `Metadata`, `OccurredAt`, audit columns.

**Migrations:** `Ordering.Infrastructure/Migrations/` — `InitialCreate` (Orders), `AddActivitiesTable`.

**Seeding:** `OrderContextSeed.SeedAsync` runs on startup after migrate; seeds one sample order if empty; also runs raw SQL to ensure `Activities` table exists.

**Audit fields:** `OrderContext.SaveChangesAsync` sets `CreatedBy`/`LastModifiedBy` to hardcoded `"slowey"` (TODO comments reference future auth server).

## Dependencies

### Internal project references

| Project | Used by | Role |
|---------|---------|------|
| `Infrastructure/Common.Mediator` | Ordering.Application | CQRS mediator + pipeline behaviors |
| `Infrastructure/EventBus.Messages` | Ordering.Application, Ordering.API | Integration event DTOs and queue constants |
| `Infrastructure/Common.Logging` | Ordering.API | Serilog configuration |
| `Ordering.Core` | Application, Infrastructure | Entities + repository interfaces |
| `Ordering.Application` | Ordering.API, Infrastructure | Handlers, commands, validators |
| `Ordering.Infrastructure` | Ordering.API | EF Core, repositories |

### External services (runtime)

| Service | Interaction |
|---------|-------------|
| **Basket** | Publishes `BasketCheckoutEvent` / `BasketCheckoutEventV2` to RabbitMQ |
| **Catalog** | Publishes `ProductActivityEvent` to `product-activity-queue` |
| **SQL Server** (`orderdb`) | Primary persistence |
| **RabbitMQ** | MassTransit transport |
| **Elasticsearch** | Log aggregation (via Common.Logging) |
| **Jaeger / OTLP collector** | Distributed tracing |
| **Ocelot API Gateway** | Routes `/Ordering` upstream paths (see route mismatch note) |

## Patterns

- **Clean Architecture layers:** API → Application → Core ← Infrastructure (Infrastructure references Application for DI registration).
- **CQRS via custom mediator:** Commands/queries implement `IRequest<T>`; handlers implement `IRequestHandler<,>`; registered in `ServiceRegistration.AddApplicationServices`.
- **Pipeline behaviors:** `ValidationBehaviour` (FluentValidation) and `UnhandledExceptionBehaviour` wrap all requests.
- **Repository pattern:** `IAsyncRepository<T>` + `RepositoryBase<T>`; specialized `IOrderRepository`, `IActivityRepository`.
- **Source-generated mapping:** `OrderMapper` (Mapperly) maps commands/events/entities/responses; `[MapperIgnoreTarget(nameof(Order.Id))]` on insert mappings.
- **Event-driven checkout:** Primary order creation path is MassTransit consumer, not HTTP POST.
- **Activity idempotency:** `ExistsByEventIdAsync` before insert in both activity consumers.
- **Startup migration:** `Program.cs` calls `MigrateDatabase<OrderContext>` with Polly retry on `SqlException`, then seeds.

## Gotchas

1. **Gateway vs controller naming:** Ocelot downstream paths use `/api/v1/Ordering` but `OrderController` resolves to `/api/v1/Order`. Direct calls and `Ordering.API.http` use `Order`; gateway config may 404 unless corrected.
2. **V1 vs V2 checkout consumers:** `BasketOrderingConsumer` (v1) publishes `OrderActivityEvent` after order creation; `BasketOrderingConsumerV2` does **not** publish activity events.
3. **HTTP POST checkout is test-only:** Comment on `OrderController.CheckoutOrder` — production flow is the RabbitMQ consumer.
4. **Payment data stored in plain columns:** `CardNumber`, `Cvv`, etc. on `Order` entity — no tokenization visible in this service.
5. **Hardcoded audit user:** `CreatedBy`/`LastModifiedBy` set to `"slowey"` in `OrderContext.SaveChangesAsync`.
6. **ActivityController route inconsistency:** Uses fixed `api/v1/[controller]` while `OrderController` inherits versioned `api/v{version:apiVersion}/[controller]` from `ApiController`.
7. **Activities table dual creation:** Both EF migration and raw SQL in `OrderContextSeed` can create the table — seed is defensive for environments where migration lagged.
8. **No auth middleware configured:** `Program.cs` calls `UseAuthorization()` but no authentication scheme is registered in this service.
9. **Port varies by environment:** Docker Compose **8003**, K8s port-forward docs use **8004** — check your deployment target.

## Owners

_not found in Services/Ordering/ (no CODEOWNERS, README, or team metadata in this directory)_
