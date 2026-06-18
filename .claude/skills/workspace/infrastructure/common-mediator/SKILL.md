---
name: common-mediator
description: In-house CQRS mediator (MediatR replacement) providing IRequest/IRequestHandler/IPipelineBehavior abstractions and reflection-based DI-wired dispatch for all microservices.
paths:
  - Infrastructure/Common.Mediator/**/*
metadata:
  part-dir: Infrastructure/Common.Mediator
---

## What this part is

`Common.Mediator` is a .NET 10 class library implementing a subset of the MediatR pattern without the MediatR NuGet package. It provides:

- **`Abstractions.cs`** — all public interfaces: `IRequest<T>`, `IRequest`, `IRequestHandler<TRequest,TResponse>`, `IPipelineBehavior<TRequest,TResponse>`, `IMediator`, `Unit`
- **`Mediator.cs`** — concrete `Mediator` class; uses `ConcurrentDictionary<Type, RequestInvoker>` for per-type caching; builds handler + behavior delegate chains via reflection
- **`ServiceCollectionExtensions.cs`** — `AddMediator(params Assembly[])` extension; registers `IMediator` as singleton and scans provided assemblies for `IRequestHandler<,>` implementations (transient)

## Key files to read first

1. `Infrastructure/Common.Mediator/Abstractions.cs` — the public API surface; read this first
2. `Infrastructure/Common.Mediator/ServiceCollectionExtensions.cs` — DI registration and assembly scanning
3. `Infrastructure/Common.Mediator/Mediator.cs` — dispatch and pipeline composition implementation

## Top patterns

- Call `services.AddMediator(typeof(SomeHandler).Assembly)` in `Program.cs` — pass every assembly that contains handlers.
- Handlers implement `IRequestHandler<TRequest, TResponse>`; for void operations use `Unit` as `TResponse`.
- Pipeline behaviors implement `IPipelineBehavior<TRequest, TResponse>` and are executed outermost-first in registration order.
- Inject `IMediator` (interface) — not the concrete `Mediator` class — into application components.

## Gotchas

- **No notifications** — `INotification`/`INotificationHandler` are not implemented; use EventBus.Messages + MassTransit for fan-out.
- **No streaming** — `IAsyncEnumerable` / `IStreamRequest` patterns are not present.
- Handlers in assemblies **not** passed to `AddMediator` are silently ignored — no startup error is thrown.
- `IMediator` is registered as singleton; do not register a second instance manually.

## Full onboarding doc

`Infrastructure/Common.Mediator/AGENT.md`
