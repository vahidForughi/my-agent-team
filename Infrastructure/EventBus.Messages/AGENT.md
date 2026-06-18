# Codebase Orientation Map: Infrastructure/EventBus.Messages

## 1-Line Summary
This project defines common constants and integration events for inter-service communication within the cloud-native e-commerce platform.

## 5-Minute Explanation
- **Primary tasks in code**: Defines shared event models and constants for messaging between microservices.
- **Primary inputs**: Not applicable as this is a library providing data structures. Events are consumed by other services.
- **Primary outputs**: Event data structures (e.g., `BasketCheckoutEvent`, `ProductActivityEvent`, `OrderActivityEvent`) and `EventBusConstant` for queue names.
- **Key files**:
    - `EventBus.Messages.csproj`: Project file defining the .NET properties.
    - `Common/EventBusConstant.cs`: Defines string constants for event bus queue names.
    - `Events/BaseIntegrationEvent.cs`: Base class for all integration events, providing correlation ID and creation date.
    - `Events/BasketCheckoutEvent.cs`: Event for basket checkout operations (v1).
    - `Events/BasketCheckoutEventV2.cs`: Event for basket checkout operations (v2, simplified).
    - `Events/ProductActivityEvent.cs`: Event for product-related activities (created, updated, deleted).
    - `Events/OrderActivityEvent.cs`: Event for order-related activities (created, updated, cancelled).
- **Main code paths**: This is a library of data transfer objects (DTOs) and constants. Its primary use is through other services publishing or consuming these defined events.

## Deep Dive
- **Type**: Library (C# class library)
- **Primary runtime(s)**: .NET 10.0
- **Entry points**: This project provides definitions and is consumed by other services. There are no direct execution entry points within this project itself.
  - `Infrastructure/EventBus.Messages/EventBus.Messages.csproj`: Defines project dependencies and target framework.
  - `Infrastructure/EventBus.Messages/Common/EventBusConstant.cs`: Provides static string constants for RabbitMQ queue names. Services use these constants to define their binding keys and queue names.
  - `Infrastructure/EventBus.Messages/Events/BaseIntegrationEvent.cs`: The foundation for all integration events, ensuring consistent metadata like `CorrelationId` and `CreationDate` for tracing.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `Common/` | Shared constants | Contains `EventBusConstant` for queue names. |
| `Events/` | Event definitions | Contains concrete integration event classes. |

## Key Boundaries
- **Presentation**: Not applicable.
- **Application/Domain**: This library defines the contracts for events that represent domain activities across microservices.
- **Persistence/External I/O**: Not directly handled within this library, but the events defined here are used for external communication via an event bus (e.g., RabbitMQ).
- **Cross-cutting concerns**: Provides `CorrelationId` and `CreationDate` in `BaseIntegrationEvent` for tracing and auditing across distributed systems.
- **Responsibilities by file/module**:
    - `EventBusConstant.cs`: Centralized management of event bus queue names to prevent magic strings and ensure consistency.
    - `BaseIntegrationEvent.cs`: Establishes a common base for all integration events, enforcing standard properties like `CorrelationId` and `CreationDate`.
    - `BasketCheckoutEvent.cs`, `BasketCheckoutEventV2.cs`, `ProductActivityEvent.cs`, `OrderActivityEvent.cs`: Concrete event definitions carrying specific data related to domain actions.
- **Detailed code flows**:
  1. A microservice performs a domain action (e.g., order created, product updated).
  2. The microservice constructs an instance of a relevant `IntegrationEvent` (e.g., `OrderActivityEvent`).
  3. The microservice publishes this event to the event bus, typically using a queue name defined in `EventBusConstant`.
  4. Other interested microservices consume these events from the bus, deserialize them, and react to the domain action.
- **How the pieces map together**: Other microservices (e.g., Basket, Ordering, Catalog) depend on this library to define and use shared event types and constants for their asynchronous communication via RabbitMQ.
- **Files inspected**:
    - `Infrastructure/EventBus.Messages/EventBus.Messages.csproj`
    - `Infrastructure/EventBus.Messages/Common/EventBusConstant.cs`
    - `Infrastructure/EventBus.Messages/Events/BaseIntegrationEvent.cs`
    - `Infrastructure/EventBus.Messages/Events/BasketCheckoutEvent.cs`
    - `Infrastructure/EventBus.Messages/Events/BasketCheckoutEventV2.cs`
    - `Infrastructure/EventBus.Messages/Events/ProductActivityEvent.cs`
    - `Infrastructure/EventBus.Messages/Events/OrderActivityEvent.cs`
