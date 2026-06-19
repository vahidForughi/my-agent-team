---
name: event-bus-messages
description: EventBus microservice — Defines common constants and integration events for inter-service communication.
paths:
  - Infrastructure/EventBus.Messages/**/*
metadata:
  part-dir: Infrastructure/EventBus.Messages
---

## EventBus.Messages Microservice Skill

This skill provides guidance for working with the `EventBus.Messages` microservice, which defines shared constants and integration events used across the platform's microservices.

### Key Files to Read First:
- `Infrastructure/EventBus.Messages/Common/EventBusConstant.cs`: Understand the available queue names.
- `Infrastructure/EventBus.Messages/Events/BaseIntegrationEvent.cs`: Familiarize yourself with the base event structure.
- `Infrastructure/EventBus.Messages/Events/`: Browse the concrete event definitions to see what messages are being passed between services.

### Top Patterns:
- **Event-Driven Architecture**: This library is central to the platform's event-driven communication pattern.
- **Contract Definition**: Events defined here act as contracts between publishing and consuming services.

### Top Gotchas:
- **Event Versioning**: Be mindful of backward compatibility when modifying existing events. Prefer creating new versions (e.g., `EventV2`) for breaking changes.
- **Tight Coupling**: Avoid introducing direct business logic dependencies into this library to prevent tight coupling between services.

For a full overview, refer to the `AGENT.md` document:
@Infrastructure/EventBus.Messages/AGENT.md
