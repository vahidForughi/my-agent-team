---
name: discount
description: Onboard into the Discount gRPC microservice — coupon CRUD, PostgreSQL/Dapper persistence, MediatR handlers, and Basket consumer integration. Use when editing files under Services/Discount/.
paths:
  - Services/Discount/**/*
metadata:
  part-dir: Services/Discount
---

# Discount Service Skill

gRPC microservice that stores product coupons (`Coupon` entity) in PostgreSQL and exposes CRUD via `DiscountProtoService`. Basket calls `GetDiscount` at cart-creation time to apply per-item discounts.

## Read first

1. `Services/Discount/Discount.API/Program.cs` — DI, gRPC mapping, DB migration hook, observability
2. `Services/Discount/Discount.Application/Protos/discount.proto` — RPC contract (`GetDiscount`, `CreateDiscount`, `UpdateDiscount`, `DeleteDiscount`)
3. `Services/Discount/Discount.API/Services/DiscountService.cs` — gRPC → MediatR dispatch
4. `Services/Discount/Discount.Infrastructure/Repositories/DiscountRepository.cs` — Dapper SQL against `Coupon` table
5. `Services/Discount/Discount.Infrastructure/Extensions/DbExtension.cs` — startup schema drop/create + seed

## Key patterns

- Four-layer clean architecture: API / Application / Core / Infrastructure
- CQRS via `Common.Mediator` — handlers in `Discount.Application/Handlers/`
- Mapperly `DiscountMapper` for command ↔ entity ↔ proto mapping
- gRPC on port **8080** (Http2); no REST controllers

## Top gotchas

- Service is gRPC-only; Ocelot REST `/Discount` routes don't map here
- Startup migration drops/recreates `Coupon` every run
- `GetDiscount` repository returns a placeholder instead of null
- No unit tests in solution for this service

## Consumer reference

Basket gRPC client: `Services/Basket/Basket.Application/GrpcService/DiscountGrpcService.cs` (graceful fallback on errors).

Full onboarding doc: [Services/Discount/AGENT.md](../../../../Services/Discount/AGENT.md)
