# Codebase Orientation Map

## 1-Line Summary
Common.Mediator provides a simplified in-process mediator implementation for request/response and pipeline behaviors, mirroring a subset of MediatR's functionality.

## 5-Minute Explanation
- **Primary tasks in code**: Handles in-process command and query dispatching, resolving `IRequestHandler` implementations, and composing `IPipelineBehavior` instances around handlers.
- **Primary inputs**: `IRequest<TResponse>` instances for dispatch, `IServiceProvider` for dependency resolution, and assemblies for handler/behavior discovery.
- **Primary outputs**: `Task<TResponse>` from request handlers, where `TResponse` can be `Unit` for void operations.
- **Key files**:
    - `Abstractions.cs`: Defines core interfaces like `IRequest`, `IRequestHandler`, `IPipelineBehavior`, and `IMediator`.
    - `Mediator.cs`: Implements the `IMediator` interface, handling request dispatch and pipeline behavior composition using reflection.
    - `ServiceCollectionExtensions.cs`: Provides an extension method `AddMediator` to register the mediator and discover handlers from specified assemblies.
- **Main code paths**: A request is sent via `IMediator.Send()`, `Mediator` resolves the appropriate `IRequestHandler` and `IPipelineBehavior`s, executes the pipeline, and returns the result.

## Deep Dive
- **Type**: Library (shared-lib)
- **Primary runtime(s)**: .NET
- **Entry points**:
  - `Abstractions.cs`: Defines the public contract for using the mediator pattern.
  - `ServiceCollectionExtensions.cs`: The `AddMediator` extension method is the primary entry point for configuring the mediator in a .NET `IServiceCollection`.
  - `Mediator.cs`: The `Send` method on `IMediator` is the runtime entry point for dispatching requests.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `Abstractions.cs` | Defines core interfaces | Public contract for mediator pattern |
| `Mediator.cs` | Mediator implementation | Handles request dispatch and pipeline |
| `ServiceCollectionExtensions.cs` | DI registration | Registers mediator, handlers, and behaviors |

## Key Boundaries
- **Presentation**: Not applicable; this is a foundational library.
- **Application/Domain**: Provides an in-process messaging mechanism for application and domain logic to communicate without direct dependencies. Handlers (implemented in application/domain layers) use the interfaces defined here.
- **Persistence/External I/O**: Not directly involved in persistence or external I/O, but facilitates commands/queries that might trigger such operations in other layers.
- **Cross-cutting concerns**: Pipeline behaviors (defined via `IPipelineBehavior`) allow for cross-cutting concerns like logging, validation, or error handling to be applied around request handlers.
- **Responsibilities by file/module**:
    - `Abstractions.cs`: Defines `IRequest<T>`, `IRequest`, `Unit`, `IRequestHandler<TRequest, TResponse>`, `RequestHandlerDelegate<TResponse>`, `IPipelineBehavior<TRequest, TResponse>`, `IMediator`.
    - `Mediator.cs`: `Mediator` class implements `IMediator`, using a `ConcurrentDictionary` cache for `RequestInvoker`s. `RequestInvoker` uses reflection to build handler and behavior invocation chains.
    - `ServiceCollectionExtensions.cs`: `AddMediator` method registers `IMediator` as scoped (so it resolves handlers from the per-request provider) and `IRequestHandler` implementations as transient services.
- **Detailed code flows**:
  1. A request (`IRequest<TResponse>`) is sent via `IMediator.Send(request, cancellationToken)`.
  2. The `Mediator` class looks up or builds a `RequestInvoker` for the request type.
  3. The `RequestInvoker.Invoke` method resolves the appropriate `IRequestHandler` and any registered `IPipelineBehavior` instances from the `IServiceProvider`.
  4. The `RequestInvoker` constructs a delegate chain, starting with the `IRequestHandler`'s `Handle` method as the innermost call.
  5. Each `IPipelineBehavior`'s `Handle` method is wrapped around the inner delegate, from the last registered to the first, ensuring the first-registered behavior executes first.
  6. The composed delegate chain is invoked, and the `Task<TResponse>` result is returned.
- **How the pieces map together**: Consumers inject `IMediator` and send `IRequest` instances. Application-specific command/query handlers implement `IRequestHandler`. Cross-cutting concerns implement `IPipelineBehavior`. `ServiceCollectionExtensions.AddMediator` glues these pieces together during DI configuration.
- **Files inspected**:
    - `Infrastructure/Common.Mediator/Abstractions.cs`
    - `Infrastructure/Common.Mediator/Mediator.cs`
    - `Infrastructure/Common.Mediator/ServiceCollectionExtensions.cs`
    - `Infrastructure/CLAUDE.md`
