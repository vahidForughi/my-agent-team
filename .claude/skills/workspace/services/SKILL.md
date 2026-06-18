---
name: services
description: The four backend microservices (Basket, Catalog, Discount, Ordering) forming the e-commerce domain layer, each following Clean Architecture with polyglot persistence and event-driven communication.
paths:
  - Services/**/*
metadata:
  part-dir: Services
---

The `Services/` directory is the domain core of the cloud-native e-commerce platform. It contains four independently deployable ASP.NET Core (.NET 10) microservices, each owning its own database and communicating asynchronously via RabbitMQ (MassTransit) or synchronously via gRPC.

## Child parts

| Part | SKILL.md | Notes |
|------|----------|-------|
| Basket | [`.claude/skills/workspace/services/basket/SKILL.md`](./basket/SKILL.md) | Redis cart, gRPC → Discount, publishes checkout events. Port 8001. |
| Catalog | [`.claude/skills/workspace/services/catalog/SKILL.md`](./catalog/SKILL.md) | MongoDB products/brands/types, S3/LocalStack images, publishes product-activity events. Port 8000. |
| Discount | [`.claude/skills/workspace/services/discount/SKILL.md`](./discount/SKILL.md) | PostgreSQL coupons via Dapper, gRPC server only. gRPC port 8080 (host 8002). |
| Ordering | [`.claude/skills/workspace/services/ordering/SKILL.md`](./ordering/SKILL.md) | SQL Server orders via EF Core, RabbitMQ consumers + REST. Port 8003. |

## Key files to read first

- `Services/AGENT.md` — architecture overview, cross-service event flows, polyglot persistence map
- `Services/CLAUDE.md` — do/don't rules for working across services, tech stack, build commands
- `Services/<Name>/<Name>.API/Program.cs` — each service's DI wiring, startup, config reading
- `Services/<Name>/<Name>.API/Controllers/` — HTTP entry points
- `Infrastructure/EventBus.Messages/Events/` — shared async event contracts

## Top patterns

- **Clean Architecture** in every service: `*.API` (entry, DI) → `*.Application` (CQRS commands/queries/handlers) → `*.Core` (entities + interfaces) ← `*.Infrastructure` (persistence + adapters). Layer dependencies always point inward; `*.Core` has no framework dependencies.
- **CQRS via `Common.Mediator`**: controllers dispatch `IRequest<T>` objects; handlers implement `IRequestHandler<T,R>`; registered by scanning assemblies in `Program.cs`.
- **Mapperly for DTO mapping**: source-generated `[Mapper]` partials; Basket/Catalog use static `Instance`, Discount DI-registers its mapper.
- **Shared async contracts** in `Infrastructure/EventBus.Messages`; queue names in `EventBusConstant`. Prefer adding `*EventV2` over modifying existing events.
- **Polyglot persistence**: Redis (Basket), MongoDB (Catalog), PostgreSQL/Dapper (Discount), SQL Server/EF Core (Ordering). No cross-service DB access.

## Gotchas

- Never share a database between services; use gRPC (sync, checkout hot path: Basket → Discount) or RabbitMQ (async) for inter-service communication.
- v1 and v2 versioned events/endpoints must both remain operational.
- Discount drops and recreates its `Coupon` table on every boot — coupon data is not durable across restarts.
- Ordering's `OrderController` resolves to `/api/v1/Order`, not `/api/v1/Ordering` — gateway config must match.
- Each service's connection string env-var prefix differs (`CacheSettings__`, `DatabaseSettings__`, `ConnectionStrings__` for Ordering, `DatabaseSettings__` for Discount).

## Full onboarding doc

[`Services/AGENT.md`](../../../../Services/AGENT.md)
