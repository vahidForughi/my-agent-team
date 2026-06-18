---
name: basket
description: Basket microservice — Redis-backed shopping carts, Discount gRPC integration, and checkout event publishing. Use when working in Services/Basket or integrating with cart CRUD, checkout, or basket-related gateway routes.
metadata:
  part-dir: Services/Basket
---

# Basket Service Skill

ASP.NET Core microservice that stores shopping carts in Redis, applies product discounts via gRPC to the Discount service, and publishes checkout integration events to RabbitMQ for the Ordering service to consume.

## Read first

1. `Services/Basket/Basket.API/Program.cs` — Redis, gRPC client, MassTransit publisher, OpenTelemetry
2. `Services/Basket/Basket.API/Controllers/BasketController.cs` — v1 REST endpoints and checkout publish flow
3. `Services/Basket/Basket.Application/Handlers/CreateShoppingCartCommandHandler.cs` — discount application on cart save
4. `Services/Basket/Basket.Infrastructure/Repositories/BasketRepository.cs` — Redis JSON persistence
5. `Services/Basket/Basket.Application/GrpcService/DiscountGrpcService.cs` — gRPC client with graceful degradation

## Key patterns

- CQRS with `Common.Mediator` (not MediatR)
- Mapperly `BasketMapper.Instance` in `Basket.Application/Mappers/`
- Redis via `IDistributedCache` keyed by username
- Checkout = publish event + delete basket (v1 full payload, v2 minimal payload)

## Top gotchas

- v1 and v2 checkout publish different event types to different Ordering consumers
- Discount gRPC URL varies by environment (compose vs Helm vs appsettings default)
- No authentication configured despite `UseAuthorization()` in pipeline
- `Basket.API.http` is stale (wrong port and endpoint)

## Full reference

See [Services/Basket/AGENT.md](../../../Services/Basket/AGENT.md) for build/run commands, config keys, API contracts, Redis data model, and deployment ports.
