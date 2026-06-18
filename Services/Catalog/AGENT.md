# Codebase Orientation Map

## 1-Line Summary
This service provides the product catalog, brand, type data, and handles product image storage.

## 5-Minute Explanation
- **Primary tasks in code**: Manages products, brands, and types in MongoDB; stores product images in S3/LocalStack; publishes product activity events to RabbitMQ.
- **Primary inputs**: HTTP requests for catalog CRUD operations; JSON seed data for initial population.
- **Primary outputs**: HTTP responses for catalog data; product images stored in S3/LocalStack; `ProductActivityEvent`s published to RabbitMQ.
- **Key files**: `Services/Catalog/Catalog.API/` (entry point, controllers), `Services/Catalog/Catalog.Application/` (CQRS handlers, mappers), `Services/Catalog/Catalog.Core/` (domain entities, repository interfaces, image storage interface), `Services/Catalog/Catalog.Infrastructure/` (MongoDB repositories, S3 image storage implementation, seed data).
- **Main code paths**:
    1. HTTP request for product data: `Catalog.API` -> `Catalog.Application` (CQRS) -> `Catalog.Infrastructure` (MongoDB).
    2. HTTP request to upload image: `Catalog.API` -> `Catalog.Application` (CQRS) -> `Catalog.Infrastructure` (S3/LocalStack).
    3. Product modification: `Catalog.API` -> `Catalog.Application` (CQRS) -> `Catalog.Infrastructure` (MongoDB) -> publish `ProductActivityEvent`.

## Deep Dive
- **Type**: Backend microservice
- **Primary runtime(s)**: .NET 10
- **Entry points**:
  - `Services/Catalog/Catalog.API/Program.cs`: Main entry point for the Catalog service.
  - `Services/Catalog/Catalog.API/Controllers/CatalogController.cs`: Handles product, brand, type, and image upload HTTP requests.
  - `Services/Catalog/Catalog.API/Controllers/AdminController.cs`: Provides administrative actions like S3 image migration.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `Services/Catalog/Catalog.API/` | API layer | HTTP controllers, Program.cs, Dockerfile. |
| `Services/Catalog/Catalog.Application/` | Application layer | CQRS commands/queries/handlers, mappers. |
| `Services/Catalog/Catalog.Core/` | Domain layer | Entities (Product, Brand, ProductType), repository interfaces, image storage interface. |
| `Services/Catalog/Catalog.Infrastructure/` | Infrastructure layer | MongoDB repositories, S3 image storage service, seed data. |

## Key Boundaries
- **Presentation**: `Services/Catalog/Catalog.API/Controllers/` (HTTP REST API).
- **Application/Domain**: `Services/Catalog/Catalog.Application/` (CQRS logic), `Services/Catalog/Catalog.Core/` (domain models and interfaces).
- **Persistence/External I/O**: `Services/Catalog/Catalog.Infrastructure/Repositories/ProductRepository.cs` (MongoDB), `Services/Catalog/Catalog.Infrastructure/Services/S3ImageStorageService.cs` (AWS S3/LocalStack), MassTransit (RabbitMQ for events).
- **Cross-cutting concerns**:
    - **Logging**: Serilog.
    - **Configuration**: `appsettings*.json` and environment variables (`DatabaseSettings__ConnectionString`, `USE_LOCALSTACK`, `AWS__S3__*`, `ImageSettings`).
    - **Tracing**: OpenTelemetry.
- **Responsibilities by file/module**:
    - `Catalog.API`: Exposes REST endpoints for catalog management and image uploads.
    - `Catalog.Application`: Orchestrates business logic, handles commands/queries, publishes events.
    - `Catalog.Core`: Defines core entities (`Product`, `Brand`, `ProductType`) and interfaces for repositories and image storage.
    - `Catalog.Infrastructure`: Implements data access (MongoDB) and external service interactions (S3), handles seed data.
- **Detailed code flows**:
    1. **Create Product**: HTTP POST to `/Catalog/CreateProduct` -> `CreateProductCommand` handled by `Catalog.Application` -> `ProductRepository` saves to MongoDB -> `ProductActivityEvent` published to RabbitMQ.
    2. **Upload Product Image**: HTTP POST (multipart/form-data) to `/Catalog/UploadProductImage` -> `UploadProductImageCommand` handled by `Catalog.Application` -> `S3ImageStorageService` uploads to S3/LocalStack.
- **How the pieces map together**:
    - `Catalog.API` uses `Common.Mediator` for internal request handling.
    - `Mapperly` is used for DTO mapping via `ProductMapper.Instance`.
    - The service interacts with MongoDB for product data and S3/LocalStack for images.
    - Publishes `ProductActivityEvent` to RabbitMQ, which is consumed by the Ordering service.
- **Files inspected**:
    - `Services/Catalog/CLAUDE.md`