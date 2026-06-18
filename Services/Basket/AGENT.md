# Basket Service — Agent Onboarding

## What & why

The Basket service is an ASP.NET Core microservice that stores per-user shopping carts in Redis and exposes REST endpoints to create, read, delete, and check out baskets. On checkout it publishes integration events to RabbitMQ via MassTransit (`BasketCheckoutEvent` for v1, `BasketCheckoutEventV2` for v2), which the Ordering service consumes to create orders. When creating or updating a basket, it calls the Discount service over gRPC to apply product-level coupon discounts before persisting the cart.

## Where it lives

```
Services/Basket/
├── Basket.API/                    # HTTP host, controllers, Dockerfile, appsettings
│   ├── Controllers/               # BasketController (v1), V2/BasketController (v2 checkout only)
│   ├── Program.cs                 # Serilog, OpenTelemetry, Redis, gRPC client, MassTransit publisher
│   └── appsettings.json           # CacheSettings, GrpcSettings, EventBusSettings placeholders
├── Basket.Application/            # CQRS commands/queries, handlers, Mapperly mapper, DiscountGrpcService
│   ├── Commands/                  # CreateShoppingCartCommand, DeleteBasketByUserNameCommand
│   ├── Queries/                     # GetBasketByUserNameQuery
│   ├── Handlers/                    # Create/Get/Delete handlers
│   ├── GrpcService/                 # DiscountGrpcService (calls Discount.Grpc.Protos)
│   └── Mappers/                     # BasketMapper (Mapperly)
├── Basket.Core/                   # Domain entities, IBasketRepository
│   ├── Entities/                    # ShoppingCart, ShoppingCartItem, BasketCheckout, BasketCheckoutV2
│   └── Repositories/                # IBasketRepository
└── Basket.Infrastructure/       # Redis-backed BasketRepository
    └── Repositories/                # BasketRepository (IDistributedCache / StackExchange Redis)
```

Solution entry: `Ecommerce.sln` → project `Basket.API` (`Services/Basket/Basket.API/Basket.API.csproj`).

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | .NET 10 (`net10.0`) |
| Web | ASP.NET Core Web API, Asp.Versioning.Mvc (default v1.0, v2 for checkout) |
| CQRS | `Common.Mediator` (custom mediator from `Infrastructure/Common.Mediator`) |
| Mapping | Riok.Mapperly source-generated `BasketMapper` |
| Cache / persistence | Redis via `Microsoft.Extensions.Caching.StackExchangeRedis` (`IDistributedCache`) |
| Downstream RPC | gRPC client to Discount (`Discount.Grpc.Protos`, proto from `Services/Discount/Discount.Application/Protos/discount.proto`) |
| Messaging | MassTransit + RabbitMQ (publish-only in this service) |
| Logging | Serilog via `Infrastructure/Common.Logging` |
| Tracing | OpenTelemetry OTLP → Jaeger (configurable endpoint) |
| API docs | Swashbuckle (Development only, v1 and v2 swagger endpoints) |

## Build / run / test

**Build (from repo root):**

```bash
dotnet build Services/Basket/Basket.API/Basket.API.csproj
```

**Run locally via Docker Compose (requires Redis, RabbitMQ, Discount, Elasticsearch):**

```bash
docker compose up basket.api
# Direct API: http://localhost:8001
# Swagger (Development): http://localhost:8001/swagger
```

**Run without Docker:**

```bash
cd Services/Basket/Basket.API
dotnet run --urls "http://localhost:8001"
```

Set `CacheSettings__ConnectionString`, `GrpcSettings__DiscountUrl`, and `EventBusSettings__HostAddress` env vars (see `appsettings.json` placeholders `${REDIS_URL}`, `${RABBITMQ_URL}`).

**Hot reload:**

```bash
cd Services/Basket/Basket.API && dotnet watch run
```

**Docker image:**

```bash
docker build -f Services/Basket/Basket.API/Dockerfile -t eshop/basket.api:latest .
```

Container exposes port **80** (`Dockerfile` sets `ASPNETCORE_URLS=http://+:80`).

**Load tests:** `tests/k6/basket-test.js` — GET `/api/v1/Basket/GetBasket/{userName}` via k6 config in `tests/k6/config.js` (service port **8082** for K8s port-forward, **8001** for Docker Compose per `README.md`).

**Solution-wide tests:** `dotnet test` from repo root (no dedicated unit/integration test project found under `Services/Basket/`).

**HTTP file:** `Services/Basket/Basket.API/Basket.API.http` — base URL `http://localhost:5286` with a stale `weatherforecast` request (_not aligned with current Basket endpoints or port 8001_).

## Configuration

| Key | Source | Purpose |
|-----|--------|---------|
| `CacheSettings:ConnectionString` | `Basket.API/appsettings.json` → env `CacheSettings__ConnectionString` or `${REDIS_URL}` | Redis connection for basket storage |
| `GrpcSettings:DiscountUrl` | `appsettings.json` default `http://discount.api:80`; Docker Compose override `http://discount.api:8080` | gRPC Discount service address |
| `EventBusSettings:HostAddress` | `appsettings.json` → env `EventBusSettings__HostAddress` or `${RABBITMQ_URL}` | RabbitMQ URI for MassTransit |
| `ElasticConfiguration:Uri` | `appsettings.json` → env `ElasticConfiguration__Uri` | Serilog/Elastic sink (via Common.Logging) |
| `BypassDiscount:Enabled` | Helm `Deployments/helm/basket/values.yaml` env `BypassDiscount__Enabled`; read in `CreateShoppingCartCommandHandler` | When `true`, skips gRPC discount lookup |
| `Otlp:Endpoint` | `Program.cs` default `http://jaeger-collector.istio-system:4317` | OpenTelemetry trace export |

**Docker Compose** (`docker-compose.override.yml`): service `basket.api` maps host port **8001 → container 80**, depends on `basketdb` (Redis), `rabbitmq`, `elasticsearch`.

**Kubernetes / Helm:** `Deployments/helm/basket/` — ConfigMap keys in `Deployments/helm/basket/templates/configmap.yaml` (`CacheSettings__ConnectionString: eshopping-basketdb:6379`, etc.). Raw K8s manifest: `Deployments/k8s/basket/basket-api/basket-api.yaml` (service `eshopping-basket`, port 80).

## Interfaces & contracts

### REST API (direct service)

Base route from `ApiController`: `api/v{version:apiVersion}/[controller]` → **`/api/v1/Basket`** and **`/api/v2/Basket`**.

| Method | Route | Controller | Handler / action | Response |
|--------|-------|------------|------------------|----------|
| GET | `/api/v1/Basket/GetBasket/{userName}` | `BasketController.GetBasket` | `GetBasketByUserNameQuery` | `ShoppingCartResponse` |
| POST | `/api/v1/Basket/CreateBasket` | `BasketController.UpdateBasket` | `CreateShoppingCartCommand` | `ShoppingCartResponse` |
| DELETE | `/api/v1/Basket/DeleteBasket/{userName}` | `BasketController.DeleteBasket` | `DeleteBasketByUserNameCommand` | 200 OK |
| POST | `/api/v1/Basket/Checkout` | `BasketController.Checkout` | Loads basket, publishes `BasketCheckoutEvent`, deletes basket | 202 Accepted / 400 Bad Request |
| POST | `/api/v2/Basket/Checkout` | `V2/BasketController.Checkout` | Loads basket, publishes `BasketCheckoutEventV2`, deletes basket | 202 Accepted / 400 Bad Request |

v1 checkout body: `BasketCheckout` (`Basket.Core/Entities/BasketCheckout.cs`) — shipping and payment fields. v2 checkout body: `BasketCheckoutV2` — only `UserName` and `TotalPrice` (server overwrites `TotalPrice` from basket before publish).

### RabbitMQ published events (MassTransit)

| Event type | Namespace | Published from | Consumer (external) |
|------------|-----------|----------------|---------------------|
| `BasketCheckoutEvent` | `EventBus.Messages.Common` | v1 `Checkout` | Ordering `BasketOrderingConsumer` on `basketcheckout-queue` |
| `BasketCheckoutEventV2` | `EventBus.Messages.Events` | v2 `Checkout` | Ordering `BasketOrderingConsumerV2` on `basketcheckout-queue-v2` |

Queue constants: `Infrastructure/EventBus.Messages/Common/EventBusConstant.cs`.

### gRPC client (Discount)

Proto: `Services/Discount/Discount.Application/Protos/discount.proto` (linked in `Basket.Application.csproj`). Client type: `DiscountProtoService.DiscountProtoServiceClient`. Wrapper: `DiscountGrpcService.GetDiscount(string productName)` → `CouponModel`.

### Ocelot gateway

`ApiGateways/Ocelot.ApiGateway/ocelot.Development.json` and `ocelot.k8s.json` route upstream paths such as `/Basket/GetBasket/{userName}` → downstream `/api/v1/Basket/GetBasket/{userName}` (host `host.docker.internal:8001` in Development, `eshopping-basket:80` in k8s).

## Data & state

**Storage:** Redis (`IDistributedCache` / StackExchange Redis). Cache key = basket `UserName` (string). Value = JSON-serialized `ShoppingCart`.

**Repository:** `Basket.Infrastructure/Repositories/BasketRepository.cs` — `GetBasket`, `UpdateBasket`, `DeleteBasket`. Uses `System.Text.Json` with `PropertyNameCaseInsensitive = true` for backward compatibility with previously cached baskets.

**Domain model:**

- `ShoppingCart` — `UserName`, `List<ShoppingCartItem> Items`
- `ShoppingCartItem` — `Quantity`, `Price`, `OriginalPrice`, `DiscountAmount`, `ProductId`, `ImageFile`, `ProductName`; computed `FinalPrice`
- `ShoppingCartResponse.TotalPrice` — sum of `item.Price * item.Quantity` across items

**Redis container:** Docker Compose service `basketdb` on host port **6379** (`docker-compose.override.yml`).

_no relational database or EF migrations in this service_

## Dependencies

### Internal project references

| Project | Used by | Role |
|---------|---------|------|
| `Infrastructure/Common.Mediator` | Basket.Application | CQRS mediator |
| `Infrastructure/EventBus.Messages` | Basket.Application | `BasketCheckoutEvent`, `BasketCheckoutEventV2` |
| `Infrastructure/Common.Logging` | Basket.API | Serilog configuration |
| `Basket.Core` | Application, Infrastructure | Entities + `IBasketRepository` |
| `Basket.Application` | Basket.API, Infrastructure | Handlers, gRPC wrapper, mapper |
| `Basket.Infrastructure` | Basket.API | Redis repository implementation |

### External services (runtime)

| Service | Interaction |
|---------|-------------|
| **Redis** (`basketdb`) | Primary basket persistence |
| **Discount** (gRPC) | Coupon lookup per product on basket create/update |
| **RabbitMQ** | MassTransit publish for checkout events |
| **Ordering** | Downstream consumer of checkout events (not referenced in code) |
| **Elasticsearch** | Log aggregation (via Common.Logging) |
| **Jaeger / OTLP collector** | Distributed tracing |
| **Ocelot API Gateway** | Routes `/Basket/*` upstream paths to this service |

## Patterns

- **Clean Architecture layers:** API → Application → Core ← Infrastructure (Infrastructure references Application in `Basket.Infrastructure.csproj`).
- **CQRS via custom mediator:** Commands/queries implement `IRequest<T>`; handlers in `Basket.Application/Handlers/`; registered via `AddMediator(assemblies)` in `Program.cs`.
- **Source-generated mapping:** `BasketMapper` (Mapperly) singleton `BasketMapper.Instance` — maps cart entities to responses and checkout DTOs to integration events; no DI registration.
- **Discount on write:** `CreateShoppingCartCommandHandler` calls `DiscountGrpcService.GetDiscount` per item unless `BypassDiscount:Enabled` or discount already applied.
- **Checkout = publish + delete:** Both v1 and v2 checkout load basket, set `TotalPrice` on event from `ShoppingCartResponse.TotalPrice`, publish via `IPublishEndpoint`, then `DeleteBasketByUserNameCommand`.
- **MassTransit publisher-only:** `Program.cs` configures RabbitMQ transport without receive endpoints in this service.
- **Graceful discount degradation:** `DiscountGrpcService` returns zero-amount coupon on gRPC `Unavailable` or other `RpcException`.

## Gotchas

1. **v1 vs v2 checkout:** v1 `BasketCheckoutEvent` includes full shipping/payment fields; v2 `BasketCheckoutEventV2` is minimal (`UserName`, `TotalPrice` only) — different Ordering consumers and queues.
2. **Discount URL differs by environment:** `appsettings.json` uses `http://discount.api:80`; Docker Compose override sets `http://discount.api:8080`; Helm configmap uses `http://eshopping-discount-discount-grpc:8080`.
3. **No auth middleware configured:** `Program.cs` calls `UseAuthorization()` but no authentication scheme is registered.
4. **Health checks package unused:** `AspNetCore.HealthChecks.UI.Client` is referenced in `Basket.API.csproj` but not wired in `Program.cs`.
5. **Stale `.http` file:** `Basket.API.http` points to port 5286 and `/weatherforecast/` — not valid for current Basket API (use port 8001 and routes above).
6. **GetBasket on missing cart:** Repository returns `null`; Mapperly maps to null response — callers/gateway should handle empty basket (k6 test accepts 200 or 204).
7. **Redis key = username:** No namespacing prefix; usernames must be unique across the cache.
8. **CORS wide open:** `CorsPolicy` allows any origin, header, and method.
9. **Port varies by environment:** Docker Compose **8001**, K8s k6 config uses port-forward **8082** — check deployment target.
10. **CreateBasket applies discounts idempotently:** Handler skips discount gRPC call when `DiscountAmount != 0` or `Price != OriginalPrice`.

## Owners

_not found in Services/Basket/ (no CODEOWNERS, README, or team metadata in this directory)_
