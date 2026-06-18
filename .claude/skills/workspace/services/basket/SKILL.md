---
name: basket
description: Shopping cart management and checkout orchestration — stores carts in Redis, resolves coupons via gRPC to Discount, and publishes basket-checkout events to RabbitMQ for Ordering.
paths:
  - Services/Basket/**/*
metadata:
  part-dir: Services/Basket
---

The Basket service is the checkout orchestration seam between the cart UI, the Discount service, and the Ordering pipeline. It persists per-user shopping carts in Redis, calls Discount over gRPC to apply coupon amounts at checkout, then publishes a `BasketCheckoutEvent` (v1) or `BasketCheckoutEventV2` (v2) to RabbitMQ for Ordering to process.

## Key files to read first

- `Services/Basket/Basket.API/Program.cs` — startup, DI wiring, config keys, gRPC client registration
- `Services/Basket/Basket.API/Controllers/BasketController.cs` — v1 HTTP endpoints
- `Services/Basket/Basket.API/Controllers/V2/BasketController.cs` — v2 HTTP endpoints
- `Services/Basket/Basket.Application/GrpcService/DiscountGrpcService.cs` — gRPC client wrapper for Discount
- `Services/Basket/Basket.Infrastructure/Repositories/BasketRepository.cs` — Redis-backed cart store
- `Services/Basket/Basket.Core/Entities/BasketCheckout.cs` and `BasketCheckoutV2.cs` — domain entities
- `Services/Basket/Basket.Application/Mappers/BasketMapper.cs` — Mapperly mapper (static `Instance`)

## Top patterns

- **Checkout order**: resolve discount via `DiscountGrpcService.GetDiscount` → then publish checkout event via MassTransit. This order is established in both v1 and v2 controllers.
- **v1/v2 coexistence**: `BasketController` (v1) publishes `BasketCheckoutEvent`; `V2/BasketController` (v2) publishes `BasketCheckoutEventV2`. Both must remain functional; Ordering consumes both.
- **Redis cart**: `BasketRepository` uses `IDistributedCache` (StackExchange Redis). Cart is ephemeral — no auth, no durability guarantee.
- **gRPC client**: `DiscountGrpcService` is on the checkout hot path; a Discount outage blocks checkout.
- **Mapperly static instance**: `BasketMapper.Instance` — edit the `[Mapper]` partial class; no DI registration.

## Gotchas

- `appsettings.json` `GrpcSettings:DiscountUrl` defaults to `http://discount.api:80` but the working value in compose is `:8080` (the gRPC port). Do not trust the appsettings default outside compose.
- Checkout endpoints are rate-limited at the gateway (1 req / 3s for `/Basket/Checkout` and `/Basket/CheckoutV2`).
- Redis cart state is ephemeral and unauthenticated locally.
- The gRPC client uses an explicit `HttpClientHandler` for plaintext HTTP/2 — do not change this without understanding the Kestrel/gRPC transport configuration.
- Container port is `80`; host port is `8001` via `docker-compose.override.yml`.

## Full onboarding doc

[`Services/Basket/AGENT.md`](../../../../Services/Basket/AGENT.md)
