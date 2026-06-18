# basket — Basket service

## What & why

Shopping-cart management and checkout orchestration. It stores per-user carts in Redis, calls
Discount over gRPC to resolve coupons at checkout, then publishes a checkout event to RabbitMQ for
Ordering to turn into an order. It is the orchestration seam between the cart UI, the (sync) Discount
service, and the (async) Ordering pipeline.

## Where it lives

`Services/Basket/` — Clean Architecture, four projects:
- `Basket.API/` — entry point, controllers, DI (`Program.cs`), `Dockerfile`. v1 controller
  `Controllers/BasketController.cs`; v2 controller `Controllers/V2/BasketController.cs`.
- `Basket.Application/` — CQRS commands/queries/handlers, `Mappers/BasketMapper.cs` (Mapperly),
  `GrpcService/DiscountGrpcService.cs`; compiles the Discount proto as a gRPC **client**
  (`Basket.Application.csproj`).
- `Basket.Core/` — domain entities (`Entities/BasketCheckout.cs`, `Entities/BasketCheckoutV2.cs`) +
  repository interfaces.
- `Basket.Infrastructure/` — `Repositories/BasketRepository.cs` (Redis-backed cart store).

## Tech stack

- .NET 10 (`net10.0` in `Basket.API/Basket.API.csproj`; SDK `10.0.300` from `global.json`).
- Versions via Central Package Management (`Directory.Packages.props`): MassTransit/MassTransit.RabbitMQ
  8.5.10, Grpc.AspNetCore 2.80.0, Riok.Mapperly 4.3.1, Asp.Versioning.Mvc 10.0.0,
  Microsoft.Extensions.Caching.StackExchangeRedis 10.0.8, OpenTelemetry 1.15.x, Serilog.AspNetCore 8.0.3,
  Swashbuckle 6.4.0.
- Project refs (`Basket.API.csproj`): `Infrastructure/Common.Logging`, `Basket.Application`,
  `Basket.Infrastructure`; `Basket.Application` refs `Infrastructure/EventBus.Messages` and
  `Infrastructure/Common.Mediator`.

## Build / run / test

```bash
# Local (needs Redis :6379, RabbitMQ :5672, and Discount gRPC reachable)
cd Services/Basket/Basket.API && dotnet run

# Container (build context is the repo root — see DockerfileContext in the csproj)
docker build -f Services/Basket/Basket.API/Dockerfile -t basketapi .
docker compose up basket.api        # host :8001 → container :80
```

Binds container port `80` (`Dockerfile` `EXPOSE 80` / `ASPNETCORE_HTTP_PORTS=80`); published on host
`:8001` by `docker-compose.override.yml`. Swagger (v1 + v2 docs) is served only in Development
(`Program.cs`).

## Configuration

All keys read in `Basket.API/Program.cs`; defaults in `Basket.API/appsettings.json`, real values
injected as `__`-delimited env vars in `docker-compose.override.yml`:
- `CacheSettings:ConnectionString` / `CacheSettings__ConnectionString=${REDIS_URL}` — Redis cache
  connection (`AddStackExchangeRedisCache`).
- `GrpcSettings:DiscountUrl` / `GrpcSettings__DiscountUrl=http://discount.api:8080` — Discount gRPC
  target. NOTE: `appsettings.json` ships `http://discount.api:80`; compose overrides it to `:8080`
  (the gRPC port).
- `EventBusSettings:HostAddress` / `EventBusSettings__HostAddress=${RABBITMQ_URL}` — RabbitMQ URI
  (`amqp://user:pass@host:port`), parsed by hand in `Program.cs`; falls back to
  `amqp://guest:guest@localhost:5672`.
- `ElasticConfiguration:Uri` / `ElasticConfiguration__Uri=${ELASTICSEARCH_URL}` — optional Serilog ES
  sink (`Infrastructure/Common.Logging/Logging.cs`).
- `Otlp:Endpoint` — OpenTelemetry OTLP traces endpoint; defaults to
  `http://jaeger-collector.istio-system:4317` (`Program.cs`).

## Interfaces & contracts

HTTP controllers (service-internal paths `api/v{version}/Basket/...`; gateway exposes the short form):
- v1 (`Controllers/BasketController.cs`): `GET GetBasket/{userName}`, `POST CreateBasket`,
  `DELETE DeleteBasket/{userName}`, `POST Checkout`.
- v2 (`Controllers/V2/BasketController.cs`): `POST CheckoutV2` (route `Checkout` under api v2).
- gRPC **client** of `DiscountProtoService` (proto owned by Discount:
  `Services/Discount/Discount.Application/Protos/discount.proto`, linked in `Basket.Application.csproj`
  with `GrpcServices="Client"`); wrapper `Basket.Application/GrpcService/DiscountGrpcService.cs`.

Events published (MassTransit → RabbitMQ, contracts in `Infrastructure/EventBus.Messages/Events/`):
- `BasketCheckoutEvent` from v1 `Checkout`.
- `BasketCheckoutEventV2` from v2 `CheckoutV2`.
Both are consumed by Ordering (see [`Ordering/CLAUDE.md`](../Ordering/CLAUDE.md)).

## Data & state

- Redis — cart store via `Basket.Infrastructure/Repositories/BasketRepository.cs` over
  `IDistributedCache`; container `basketdb` (`docker-compose.override.yml`, `:6379`). No auth locally;
  cart state is ephemeral.
- No relational DB and no migrations; Discount data is fetched live over gRPC, never persisted here.
- RabbitMQ is the async egress for checkout events (no consumers run in this service).

## Dependencies

- → **Discount** (sync, gRPC) at `GrpcSettings:DiscountUrl` — on the checkout hot path.
- → **Ordering** (async, RabbitMQ) via `BasketCheckoutEvent` / `BasketCheckoutEventV2`.
- → Shared libs: `Common.Mediator` (CQRS), `EventBus.Messages` (event contracts), `Common.Logging`
  (Serilog). See [`Infrastructure/CLAUDE.md`](../../Infrastructure/CLAUDE.md).
- Called by the API gateway (`ApiGateways/Ocelot.ApiGateway`) — see
  [`ApiGateways/Ocelot.ApiGateway/CLAUDE.md`](../../ApiGateways/Ocelot.ApiGateway/CLAUDE.md).

## Patterns

- Checkout is the orchestration point: resolve the discount via gRPC, **then** publish the checkout
  event — keep that order (established in both `Controllers/BasketController.cs` and `V2/BasketController.cs`).
- Keep v1 and v2 endpoints/events both alive; Ordering consumes both (`Asp.Versioning`,
  `DefaultApiVersion = v1`).
- DTO↔event mapping via Mapperly through the static `BasketMapper.Instance` — edit the `[Mapper]`
  partial, no DI registration (per the comment in `Program.cs`).
- gRPC client uses an explicit `HttpClientHandler` for plaintext HTTP/2 (`Program.cs`); OpenTelemetry
  gRPC client instrumentation (`AddGrpcClientInstrumentation`) is enabled — keep it when touching gRPC.

## Gotchas

- The gRPC call to Discount is **synchronous and on the checkout hot path** — a Discount outage blocks
  checkout. Discount listens on container port `8080` (gRPC), not `8002`.
- `appsettings.json` `DiscountUrl` is `:80` but the working value is `:8080` from compose — don't trust
  the appsettings default in a non-compose run.
- Redis cart state is ephemeral and unauthenticated locally — never treat the cart as durable.
- `/Basket/Checkout` and `/Basket/CheckoutV2` are rate-limited at the gateway (1 req / 3s).

## Owners / agents

`backend-architect` (CQRS/gRPC/messaging orchestration), `api-tester` (checkout flow + versioned
endpoints). Roles from `.claude/agents/`.
