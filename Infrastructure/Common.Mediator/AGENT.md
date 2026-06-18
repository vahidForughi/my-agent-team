# Common.Mediator

## What & Why
The `Common.Mediator` project provides a simplified, in-process mediator implementation for request/response and pipeline behaviors within the application. It mirrors the functionality of MediatR, allowing for decoupling of command/query dispatch from their respective handlers and enabling cross-cutting concerns (like logging, validation, etc.) through pipeline behaviors. This promotes a clean, maintainable architecture by centralizing the dispatch mechanism and making it easy to extend.

## Where it lives
The core components are located in the `Infrastructure/Common.Mediator` directory:
- `Abstractions.cs`: Defines the core interfaces for requests, handlers, and pipeline behaviors.
- `Mediator.cs`: Implements the `IMediator` interface, handling request dispatch and pipeline execution.
- `ServiceCollectionExtensions.cs`: Provides an extension method for registering mediator services with the DI container.

## Tech Stack
- C#
- .NET
- Microsoft.Extensions.DependencyInjection (for DI integration)

## Build/Run/Test
This is a library project, so it does not have a direct runnable entry point. It's consumed by other projects.
To build, it's part of the larger solution. A typical build command would be:
```bash
dotnet build
```
Testing would involve unit tests in dependent projects that utilize the mediator.

## Configuration
The mediator itself does not have external configuration files. Its behavior is configured programmatically during service registration in the DI container.

## Interfaces & Contracts
- `IRequest<TResponse>`: Marker interface for a request that expects a `TResponse`.
- `IRequest`: Marker interface for a request that does not expect a meaningful response (returns `Unit`).
- `Unit`: A `struct` representing no meaningful return value, similar to MediatR's `Unit`.
- `IRequestHandler<TRequest, TResponse>`: Interface for handling a specific request type and returning a response.
- `IPipelineBehavior<TRequest, TResponse>`: Interface for intercepting requests and adding cross-cutting concerns.
- `IMediator`: The main interface for sending requests and receiving responses.

## Data & State
The `Mediator` class uses a static `ConcurrentDictionary<Type, RequestInvoker>` to cache `RequestInvoker` instances, which helps in optimizing reflection performance for request dispatch. This cache holds metadata about how to invoke handlers and behaviors, but it does not store application-specific data or state.

## Dependencies
- `Microsoft.Extensions.DependencyInjection`: Used for registering and resolving handlers and behaviors from the DI container.

## Patterns
- **Mediator Pattern**: Centralizes communication between components, reducing direct dependencies.
- **Pipeline Pattern**: Allows for the insertion of cross-cutting concerns (behaviors) around the core handler logic.
- **Dependency Injection**: Leverages the .NET Core DI system for service resolution.
- **Reflection**: Used internally by `Mediator.cs` to dynamically invoke handlers and pipeline behaviors.

## Gotchas
- **Handler Registration**: Forgetting to register the assemblies containing request handlers with `AddMediator` will result in runtime errors when dispatching requests.
- **Missing Handlers**: If a request is sent for which no handler is registered, an `InvalidOperationException` will occur.
- **Behavior Order**: Pipeline behaviors are wrapped from the inside out, meaning the first-registered behavior will execute first. This is important for understanding the order of operations.
- **Performance**: While caching `RequestInvoker` instances mitigates some reflection overhead, excessive use of complex pipeline behaviors can impact performance.
- **Synchronous Operations**: All `Handle` methods are `async` and return `Task<TResponse>`, enforcing an asynchronous programming model.

## Owners
The `Infrastructure` team is responsible for this component.
