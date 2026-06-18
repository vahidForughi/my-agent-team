---
name: discount
description: gRPC-only discount/coupon service — exposes DiscountProtoService for CRUD on product coupons stored in PostgreSQL via Dapper; called exclusively by the Basket service at checkout.
paths:
  - Services/Discount/**/*
metadata:
  part-dir: Services/Discount
---

The Discount service stores and serves product-level coupon discounts. It is a **gRPC-only** service: it exposes `DiscountProtoService` (four RPCs: GetDiscount, CreateDiscount, UpdateDiscount, DeleteDiscount) and has no REST controllers. The Basket service is the sole caller, invoking `GetDiscount` on the checkout hot path. Persistence is PostgreSQL accessed via Dapper (raw parameterized SQL, no EF Core).

## Key files to read first

- `Services/Discount/Discount.API/Program.cs` — startup, gRPC endpoint mapping, DI, startup migration call
- `Services/Discount/Discount.API/Services/DiscountService.cs` — gRPC server implementation (extends `DiscountProtoService.DiscountProtoServiceBase`)
- `Services/Discount/Discount.Application/Protos/discount.proto` — **source of truth** for the Basket↔Discount contract; Basket compiles this as a gRPC client
- `Services/Discount/Discount.Infrastructure/Repositories/DiscountRepository.cs` — Dapper SQL queries
- `Services/Discount/Discount.Infrastructure/Extensions/DbExtension.cs` — startup migration (drops + recreates `Coupon` table)
- `Services/Discount/Discount.Core/Entities/Coupon.cs` — `Id`, `ProductName`, `Description`, `Amount (int32)`
- `Services/Discount/Discount.Application/Mapper/DiscountMapper.cs` — Mapperly mapper (DI-registered)

## Top patterns

- **Proto is the contract**: change `discount.proto` here; Basket regenerates its client from the same file (linked via `<Protobuf ... GrpcServices="Client" />` in `Basket.Application.csproj`). Keep shapes backward-compatible.
- **Thin gRPC handlers**: `DiscountService` maps proto requests to `Common.Mediator` commands/queries and returns the handler result. Business logic lives in the Application handlers.
- **Dapper raw SQL**: always parameterize queries in `DiscountRepository`; no EF, no LINQ.
- **Mapperly DI-registered**: `DiscountMapper` is registered as `AddSingleton<DiscountMapper>()` in `Program.cs` — inject it, do not use a static `Instance` (unlike Basket/Catalog).

## Gotchas

- **Not a REST service**: do not add controllers and do not add an Ocelot REST route for Discount. The existing `/Discount/*` routes in `ocelot.Development.json` are stale and do not resolve to any REST controller.
- **Startup migration drops all data**: `DbExtension.ApplyMigrations` runs `DROP TABLE IF EXISTS Coupon` then `CREATE TABLE` on every startup. Coupon data is not durable across restarts.
- **gRPC port**: Kestrel listens on container port `8080` (HTTP/2); host port is `8002` via `docker-compose.override.yml`. Basket's `GrpcSettings:DiscountUrl` must target `:8080`, not `:80`.
- **`GetDiscount` never returns null**: `DiscountRepository.GetDiscount` returns a placeholder `Coupon` (`Amount=0, ProductName="No Discount"`) when no row is found — the null-check guard in the handler is unreachable.
- **Create does not return DB-generated Id**: after insert, the handler maps the in-memory `Coupon` (Id=0) without re-fetching.
- **Discount amount is `int32`**: Basket assigns this to a `decimal` field — integer semantics only, no fractional amounts.

## Full onboarding doc

[`Services/Discount/AGENT.md`](../../../../Services/Discount/AGENT.md)
