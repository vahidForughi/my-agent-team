---
name: event-bus-messages
description: Zero-dependency POCO library defining shared integration-event contracts and RabbitMQ queue-name constants for cross-service async communication.
paths:
  - Infrastructure/EventBus.Messages/**/*
metadata:
  part-dir: Infrastructure/EventBus.Messages
---

## What this part is

`EventBus.Messages` is a .NET 10 class library with **no package references**. It defines the shared data contracts that microservices use when publishing or consuming events through RabbitMQ (via MassTransit).

Structure:
- `Common/EventBusConstant.cs` — static string constants for all queue names
- `Events/BaseIntegrationEvent.cs` — abstract base with `CorrelationId` (Guid) and `CreationDate` (DateTime)
- `Events/BasketCheckoutEvent.cs` — full payment/address payload for basket checkout (v1)
- `Events/BasketCheckoutEventV2.cs` — simplified checkout event (`UserName`, `TotalPrice`)
- `Events/ProductActivityEvent.cs` — product lifecycle events with `ProductActivityType` enum
- `Events/OrderActivityEvent.cs` — order lifecycle events with `OrderActivityType` enum

Queue names in `EventBusConstant.cs`:
- `basketcheckout-queue`
- `basketcheckout-queue-v2`
- `product-activity-queue`
- `order-activity-queue`

## Key files to read first

1. `Infrastructure/EventBus.Messages/Common/EventBusConstant.cs` — all queue-name constants
2. `Infrastructure/EventBus.Messages/Events/BaseIntegrationEvent.cs` — base contract
3. Any specific event class under `Events/` matching the domain area you are working on

## Top patterns

- All new events extend `BaseIntegrationEvent` to inherit `CorrelationId` and `CreationDate`.
- New queue names are constants in `EventBusConstant.cs`; publishers and consumers reference the same constant.
- Breaking changes produce a new versioned class (e.g., `*V2`) — the original class is never modified.

## Gotchas

- This library is a **shared compile-time dependency** — any field rename or removal breaks all producers and consumers simultaneously.
- Event classes must remain plain POCOs with default constructors and settable properties; MassTransit deserializes them by reflection.
- Do not add logic, validation, or package references to this project; it is intentionally dependency-free.

## Full onboarding doc

`Infrastructure/EventBus.Messages/AGENT.md`
