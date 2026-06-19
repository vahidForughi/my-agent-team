---
name: common-mediator
description: Provides a simplified in-process mediator implementation for request/response and pipeline behaviors.
paths:
  - Infrastructure/Common.Mediator/**/*
metadata: { part-dir: Infrastructure/Common.Mediator }
---
This part implements a basic in-process mediator for handling requests and responses with optional pipeline behaviors. It's designed as a lightweight alternative to MediatR for simple CQRS patterns.

Key files to read first:
- `Infrastructure/Common.Mediator/Abstractions.cs`: Defines the core interfaces.
- `Infrastructure/Common.Mediator/ServiceCollectionExtensions.cs`: Shows how to register the mediator and handlers.

Top patterns:
- In-process command/query dispatch via `IMediator`.
- Extensible pipeline behaviors for cross-cutting concerns.
- Reflection-based handler discovery during DI registration.

Top gotchas:
- Only supports request/response patterns; no notifications or streams.
- Relies on assembly scanning for handler discovery, so ensure correct assemblies are passed to `AddMediator`.
- Direct modification of `Abstractions.cs` can have wide-reaching effects.

For a full overview, see the AGENT.md: @Infrastructure/Common.Mediator/AGENT.md
