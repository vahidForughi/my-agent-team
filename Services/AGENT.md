# Codebase Orientation Map

## 1-Line Summary
A collection of independent microservices forming the backend of the cloud-native e-commerce platform.

## 5-Minute Explanation
- **Primary tasks in code**: Provides distinct microservices for managing product catalog, shopping baskets, discounts, and order processing, enabling the core e-commerce functionalities.
- **Primary inputs**: External HTTP API requests to individual service endpoints and internal event-driven messages for inter-service communication.
- **Primary outputs**: HTTP API responses, database operations (reads/writes), and published events to the system's event bus.
- **Key files**: Directories such as `Services/Basket`, `Services/Catalog`, `Services/Discount`, and `Services/Ordering`, each encapsulating a separate microservice. Also, `Services/AGENT.md` for documentation, `.cursor/rules/workspace/Services/Services.mdc` for rules, and `.cursor/skills/workspace/services/SKILL.md` for skill definition.
- **Main code paths**: Client request -> API Gateway -> specific microservice API -> application logic -> data persistence/event publishing -> response.

## Deep Dive
- **Type**: Monorepo comprising multiple backend API microservices.
- **Primary runtime(s)**: ASP.NET Core (C#) for all microservices.
- **Entry points**:
  - `Services/<Service>/<Service>.API/`: The primary entry point for each microservice, exposing its HTTP API.
  - `Services/AGENT.md`: Documentation entry point for the overall Services domain.

## Top-Level Structure

| Path | Purpose | Notes |
|---|---|---|
| `Services/Basket/` | Shopping cart microservice | Handles user baskets, item management, and checkout orchestration. |
| `Services/Catalog/` | Product catalog microservice | Manages product information, brands, types, and images. |
| `Services/Discount/` | Discount microservice | Manages promotional discounts and coupon application. |
| `Services/Ordering/` | Order processing microservice | Manages order creation, lifecycle, and customer order history. |

## Key Boundaries
- **Presentation**: Managed by separate frontend applications (e.g., micro-frontends) and mediated by an API Gateway.
- **Application/Domain**: Each top-level subdirectory within `Services/` (`Basket`, `Catalog`, `Discount`, `Ordering`) defines a bounded context and encapsulates a specific business domain.
- **Persistence/External I/O**: Each microservice typically manages its own data store (e.g., Redis for Basket, MongoDB for Catalog, PostgreSQL for Discount/Ordering). Communication with external systems or other services is primarily via HTTP APIs and a shared event bus.
- **Cross-cutting concerns**: Common components such as logging (`Infrastructure/Common.Logging`), an in-process mediator pattern (`Infrastructure/Common.Mediator`), and shared event definitions (`Infrastructure/EventBus.Messages`) are utilized across services.
- **Responsibilities by file/module**:
  - `Services/<Service>/<Service>.API/`: Contains web API controllers, Data Transfer Objects (DTOs), and service startup configurations. Responsible for exposing the service's HTTP interface.
  - `Services/<Service>/<Service>.Application/`: Implements application-specific business logic, handles commands and queries, and orchestrates domain operations. Contains command/query handlers and integration event handlers.
  - `Services/<Service>/<Service>.Core/`: Defines the core domain model including entities, aggregates, value objects, domain events, and interfaces (e.g., repositories). This is the heart of the business logic.
  - `Services/<Service>/<Service>.Infrastructure/`: Provides concrete implementations for persistence (e.g., database contexts, repository implementations), external service clients, and infrastructure-specific configurations (e.g., event bus client setup).
- **Detailed code flows**:
  1. An external HTTP request arrives at the API Gateway and is routed to a specific microservice's API endpoint (e.g., `Services/Catalog/Catalog.API/Controllers/ProductController.cs`).
  2. The API controller receives the request, validates the input DTO, and dispatches a corresponding command or query to the application layer (e.g., using `Infrastructure/Common.Mediator`).
  3. A handler in the `Services/<Service>/<Service>.Application/` project processes the command/query. This involves coordinating with the domain model (`Services/<Service>/<Service>.Core/`) and performing data operations via repositories or external services.
  4. The handler uses repository interfaces (defined in `.Core`) and their implementations (in `.Infrastructure`) to interact with the service's dedicated data store. Domain events may be raised within the Core layer and then published via the Application layer to the event bus.
  5. The result is returned from the handler, mapped back into an appropriate DTO, and sent as an HTTP response from the API controller.
- **How the pieces map together**: Microservices are designed to be independently deployable units. They interact via a combination of synchronous HTTP requests (primarily through the API Gateway) and asynchronous event messages, promoting loose coupling. Shared infrastructure concerns are factored into common libraries.
- **Files inspected**:
    - `Services/Basket/` directory structure (indicates sub-projects like API, Application, Core, Infrastructure)
    - `Services/Catalog/` directory structure
    - `Services/Discount/` directory structure
    - `Services/Ordering/` directory structure
    - `.cursor/skills/workspace/services/SKILL.md` (metadata `part-dir: Services`)