# Common.Mediator — do/don't

## Do

- Register handlers by passing their assemblies to `services.AddMediator(typeof(SomeHandler).Assembly)` in `Program.cs`; the extension scans for `IRequestHandler<,>` implementations automatically.
- Implement `IRequestHandler<TRequest, TResponse>` (from `Abstractions.cs`) for every command and query handler; use `Unit` as `TResponse` for void operations.
- Implement `IPipelineBehavior<TRequest, TResponse>` for cross-cutting concerns such as logging, validation, or timing; register as transient or scoped in the same DI setup.
- Inject `IMediator` (not the concrete `Mediator`) into application components to keep them decoupled from the implementation.
- Pass a `CancellationToken` through every `IMediator.Send` and `IRequestHandler.Handle` call to respect cooperative cancellation.

## Don't

- Do not use MediatR (`MediatR.*` namespace) — this repo uses its own `Common.Mediator` implementation and does not reference the external package.
- Do not rely on notification/publish (`INotification`, `INotificationHandler`) patterns — they are not implemented in `Common.Mediator`; use `EventBus.Messages` + MassTransit for fan-out events.
- Do not implement streaming (`IAsyncEnumerable`) pipelines through `Common.Mediator`; that subset is not present.
- Do not register `IMediator` manually; `AddMediator` registers it as a singleton — a second registration will shadow it silently.
- Do not place handlers in assemblies that are not passed to `AddMediator`; reflection discovery will miss them at startup with no error thrown.

@AGENT.md
