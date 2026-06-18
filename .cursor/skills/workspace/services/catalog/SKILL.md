---
name: catalog
description: Catalog microservice — MongoDB-backed product/brand/type API with S3 images and RabbitMQ product-activity events. Use when working in Services/Catalog or catalog HTTP/event contracts.
metadata:
  part-dir: Services/Catalog
---

# Catalog Service

ASP.NET Core microservice managing products, brands, and product types. Persists to MongoDB, stores images in S3/LocalStack, publishes `ProductActivityEvent` on product create/update via MassTransit/RabbitMQ.

## Read first

1. `Services/Catalog/Catalog.API/Program.cs` — DI, S3 dual-mode, MassTransit, Mediator registration
2. `Services/Catalog/Catalog.API/Controllers/CatalogController.cs` — all public HTTP endpoints
3. `Services/Catalog/Catalog.Infrastructure/Repositories/ProductRepository.cs` — MongoDB queries and CRUD
4. `Services/Catalog/Catalog.Infrastructure/Data/CatalogContext.cs` — DB connection and seed trigger
5. `Infrastructure/EventBus.Messages/Events/ProductActivityEvent.cs` — integration event contract

## Key patterns

- CQRS via `Common.Mediator` (not MediatR): commands/queries in `Catalog.Application`, handlers implement `IRequestHandler<,>`
- Mapperly static `ProductMapper.Instance` for all entity ↔ DTO mapping
- Single `ProductRepository` implements all three repository interfaces
- API base route: `api/v1/Catalog`; gateway exposes `/Catalog/...` on port 8010 (Ocelot → 8000)

## Top gotchas

- No auth middleware despite `UseAuthorization()` call
- `ProductActivityEvent.Actor` hardcoded to `"system"`; delete does not publish events
- Seed inserts are fire-and-forget (`InsertOneAsync` without await)
- `ElasticConfiguration` and health checks referenced but not wired
- Docker port 8000; `Catalog.API.http` port 5032 is stale

## Run

```bash
docker compose up catalog.api catalogdb localstack rabbitmq
# API: http://localhost:8000  |  Gateway: http://localhost:8010/Catalog/...
```

Full reference: [Services/Catalog/AGENT.md](../../../../Services/Catalog/AGENT.md)
