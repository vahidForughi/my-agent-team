---
name: ordering
description: Ordering microservice — order persistence, basket checkout consumers, and activity feed API. Use when working in Services/Ordering or integrating with order checkout, order CRUD, or admin activity endpoints.
paths:
  - Services/Ordering/**/*
metadata:
  part-dir: Services/Ordering
---

# Ordering Service Skill

ASP.NET Core microservice that creates orders from Basket checkout events (RabbitMQ/MassTransit), exposes order CRUD over REST, and aggregates product/order activity events into a paginated feed.

## Read first

1. `Services/Ordering/Ordering.API/Program.cs` — startup, MassTransit queues, EF migrate/seed, OpenTelemetry
2. `Services/Ordering/Ordering.API/Controllers/OrderController.cs` — REST endpoints
3. `Services/Ordering/Ordering.API/EventBusConsumer/BasketOrderingConsumer.cs` — primary checkout flow
4. `Services/Ordering/Ordering.Application/Extensions/ServiceRegistration.cs` — mediator + validation pipeline
5. `Services/Ordering/Ordering.Infrastructure/Data/OrderContext.cs` — EF entities and audit hooks

## Key patterns

- CQRS with `Common.Mediator` (not MediatR)
- Mapperly source-generated `OrderMapper` in `Ordering.Application/Mappers/`
- FluentValidation + `ValidationBehaviour` pipeline
- Four MassTransit consumers on queues defined in `EventBus.Messages/Common/EventBusConstant.cs`

## Top gotchas

- Production checkout is async via `basketcheckout-queue`, not HTTP POST
- Controller route is `/api/v1/Order` but Ocelot gateway uses `/Ordering` downstream
- `BasketOrderingConsumerV2` does not publish `OrderActivityEvent` (v1 consumer does)
- No authentication configured despite `UseAuthorization()` in pipeline

## Full reference

See [Services/Ordering/AGENT.md](../../../Services/Ordering/AGENT.md) for build/run commands, config keys, API contracts, data model, and deployment ports.
