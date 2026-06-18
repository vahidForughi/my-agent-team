---
name: common-mediator
description: Provides a simplified in-process mediator implementation for request/response and pipeline behaviors.
metadata:
  part-dir: Infrastructure/Common.Mediator
---

This skill is for working with the `Common.Mediator` infrastructure component.

Key files to read first:
- `Abstractions.cs`: Defines the core interfaces.
- `Mediator.cs`: The core implementation of the mediator.
- `ServiceCollectionExtensions.cs`: Extension methods for DI registration.

Top patterns:
- Mediator Pattern for decoupling request dispatch from handling.
- Pipeline Pattern for cross-cutting concerns.

Top gotchas:
- Ensure all request handlers and pipeline behaviors are correctly registered with the DI container.
- Understand the order of execution for pipeline behaviors (first registered, first executed).

See the full documentation here: @Infrastructure/Common.Mediator/AGENT.md