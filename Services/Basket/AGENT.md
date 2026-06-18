# Codebase Orientation Map

## 1-Line Summary
Manages shopping carts, integrates with discount services, and publishes checkout events.

## 5-Minute Explanation
- **Primary tasks in code**: Handles creation, retrieval, and deletion of shopping carts; applies discounts via gRPC; and publishes checkout events to the event bus.
- **Primary inputs**: HTTP requests (for cart management), gRPC calls from Discount service, and potentially events from other services.
- **Primary outputs**: HTTP responses (cart data), gRPC requests (to Discount service), and published events (checkout).
- **Key files**: `Services/Basket/Basket.API/Controllers/`, `Services/Basket/Basket.Application/Handlers/`, `Services/Basket/Basket.Core/Entities/`, `Services/Basket/Basket.Infrastructure/Repositories/`.
- **Main code paths**: API requests go through controllers, then to MediatR handlers, which interact with repositories and the Discount gRPC service.

## Deep Dive
- **Type**: Backend microservice (ASP.NET Core)
- **Primary runtime(s)**: .NET
- **Entry points**:
  - `Services/Basket/Basket.API/Program.cs`: Service startup and configuration.
  - `Services/Basket/Basket.API/Controllers/BasketController.cs`: Handles HTTP requests for shopping cart operations.
  - `Services/Basket/Basket.Application/GrpcService/DiscountGrpcService.cs`: Client for communicating with the Discount gRPC service.

## Top-Level Structure
| Path | Purpose | Notes |
|:---|:---|:---|
| `Services/Basket/Basket.API` | Web API layer | Contains controllers and service-specific configurations. |
| `Services/Basket/Basket.Application` | Application layer | Contains commands, queries, handlers, and gRPC service clients. |
| `Services/Basket/Basket.Core` | Domain layer | Contains domain entities (ShoppingCart, ShoppingCartItem) and repository interfaces. |
| `Services/Basket/Basket.Infrastructure` | Infrastructure layer | Contains concrete repository implementations (Redis-backed). |

## Key Boundaries
- **Presentation**: Exposed via `BasketController` (HTTP API) for CRUD operations on shopping carts.
- **Application/Domain**: `Basket.Application` contains the business logic, orchestrating interactions between `Basket.Core` entities and external services like `DiscountGrpcService`.
- **Persistence/External I/O**: `Basket.Infrastructure` handles data storage, primarily using Redis for shopping carts. Interacts with the Discount service via gRPC and publishes events to an EventBus (e.g., RabbitMQ).
- **Cross-cutting concerns**: Uses MediatR for in-process messaging (commands/queries) and Serilog for logging.
- **Responsibilities by file/module**:
    - `Basket.API/Controllers/`: Defines HTTP endpoints.
    - `Basket.Application/Handlers/`: Implements business logic for commands and queries.
    - `Basket.Core/Entities/`: Defines the core domain objects (ShoppingCart, ShoppingCartItem).
    - `Basket.Infrastructure/Repositories/BasketRepository.cs`: Manages persistence of shopping carts in Redis.
    - `Basket.Application/GrpcService/DiscountGrpcService.cs`: Facilitates communication with the Discount service.
- **Detailed code flows**:
    1. A client sends an HTTP request to `Basket.API/Controllers/BasketController.cs` (e.g., to add an item to the cart).
    2. The controller dispatches a `CreateShoppingCartCommand` to MediatR.
    3. The `CreateShoppingCartCommandHandler` in `Basket.Application/Handlers/` processes the command.
    4. The handler might call `DiscountGrpcService` to apply discounts.
    5. The handler then uses `IBasketRepository` (implemented by `BasketRepository` in `Basket.Infrastructure/`) to persist the cart data (to Redis).
    6. If it's a checkout command, an event is published to the EventBus.
    7. An HTTP response is returned to the client.
- **How the pieces map together**: The Basket service consumes information from the Discount service (via gRPC) and publishes events that might be consumed by the Ordering service (via EventBus).
- **Files inspected**: `Services/Basket/Basket.API`, `Services/Basket/Basket.Application`, `Services/Basket/Basket.Core`, `Services/Basket/Basket.Infrastructure` and their subdirectories.
