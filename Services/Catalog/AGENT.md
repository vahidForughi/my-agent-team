# Catalog Service — Agent Onboarding Reference

## What & why

The Catalog service is an ASP.NET Core microservice that owns product, brand, and product-type data for the e-commerce platform. It exposes versioned REST APIs for CRUD and query operations, persists catalog entities in MongoDB, stores product images in AWS S3 (or LocalStack in development), and publishes `ProductActivityEvent` integration events to RabbitMQ when products are created or updated. Downstream consumers include the Ocelot API gateway (HTTP routing), the admin micro-frontend (`micro-frontends/admin/src/services/catalog/`), and the Ordering service (`ProductActivityConsumer`).

## Where it lives

```
Services/Catalog/
├── Catalog.API/              # HTTP host, controllers, DI wiring, Dockerfile
│   ├── Program.cs            # Startup: Mediator, MongoDB, S3, MassTransit, OpenTelemetry
│   ├── Controllers/
│   │   ├── ApiController.cs  # Base route: api/v{version}/[controller]
│   │   ├── CatalogController.cs
│   │   └── AdminController.cs
│   ├── appsettings.json
│   └── appsettings.Development.json
├── Catalog.Application/      # Commands, queries, handlers, Mapperly mappers, DTOs
├── Catalog.Core/             # Entities, repository interfaces, specs (Pagination, CatalogSpecParams)
└── Catalog.Infrastructure/   # MongoDB context, ProductRepository, S3 image storage, seed data
    └── Data/SeedData/        # brands.json, types.json, products.json, products-local.json
```

Related paths outside this directory:
- `docker-compose.yml` / `docker-compose.override.yml` — `catalog.api` and `catalogdb` service definitions
- `ApiGateways/Ocelot.ApiGateway/ocelot.Development.json` — gateway routes to Catalog on port 8000
- `Infrastructure/EventBus.Messages/Events/ProductActivityEvent.cs` — integration event contract
- `Infrastructure/Common.Mediator/` — custom Mediator (not MediatR)
- `Infrastructure/Common.Logging/` — Serilog configuration

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | .NET 10 (`net10.0`) |
| Web framework | ASP.NET Core Web API |
| API versioning | `Asp.Versioning.Mvc` (default v1.0) |
| CQRS / messaging in-process | `Common.Mediator` (`IMediator`, `IRequestHandler<T>`) |
| Object mapping | Mapperly (`ProductMapper` static singleton) |
| Persistence | MongoDB (`MongoDB.Driver`) — collections: `Products`, `Brands`, `Types` |
| Image storage | AWS S3 via `AWSSDK.S3`; LocalStack when `USE_LOCALSTACK=true` |
| Event bus | MassTransit + RabbitMQ (`IPublishEndpoint`) |
| Observability | Serilog (`Common.Logging`), OpenTelemetry OTLP traces |
| API docs | Swashbuckle (Development only) |
| Container | Multi-stage Dockerfile on `mcr.microsoft.com/dotnet/aspnet:10.0` |

## Build / run / test

**Build (from repo root):**

```bash
dotnet build Services/Catalog/Catalog.API/Catalog.API.csproj
```

**Run via Docker Compose (recommended):**

```bash
docker compose up catalog.api catalogdb localstack rabbitmq elasticsearch
```

- Catalog API: `http://localhost:8000` (container port 80 mapped in `docker-compose.override.yml`)
- MongoDB: `localhost:27017` (`catalogdb` container)
- API gateway (Catalog routes): `http://localhost:8010/Catalog/...` via Ocelot

**Run locally (requires MongoDB, RabbitMQ, S3/LocalStack env vars):**

```bash
dotnet run --project Services/Catalog/Catalog.API/Catalog.API.csproj
```

Set `DatabaseSettings__ConnectionString`, `EventBusSettings__HostAddress`, and S3-related env vars per `.env.example` / `docker-compose.override.yml`.

**Swagger (Development):** `http://localhost:8000/swagger` when `ASPNETCORE_ENVIRONMENT=Development`.

**Tests:** _not found in `Services/Catalog/` — no unit or integration test project under this part. k6 performance tests in `tests/k6/` reference catalog endpoints at the gateway level.

## Configuration

| Key / env var | Source | Purpose |
|---------------|--------|---------|
| `DatabaseSettings:ConnectionString` | `appsettings.json` → `${MONGODB_URL}`; compose: `DatabaseSettings__ConnectionString` | MongoDB connection string |
| `DatabaseSettings:DatabaseName` | `${MONGO_DB}` (default `CatalogDb` in `.env.example`) | Mongo database name |
| `DatabaseSettings:CollectionName` | `Products` | Products collection |
| `DatabaseSettings:BrandsCollection` | `Brands` | Brands collection |
| `DatabaseSettings:TypesCollection` | `Types` | Types collection |
| `AWS:S3:BucketName`, `Region`, `ImagePrefix` | `appsettings.json`, compose env | S3 bucket settings |
| `USE_LOCALSTACK` | `true` in Development compose | Switches S3 client to LocalStack endpoint |
| `AWS_ENDPOINT_URL` | `http://localstack:4566` in compose | LocalStack S3 service URL |
| `ImageSettings:MaxFileSizeInMB` | `5` | Upload size limit |
| `ImageSettings:AllowedExtensions` | `.png`, `.jpg`, `.jpeg`, `.webp` | Allowed image types |
| `EventBusSettings:HostAddress` | `${RABBITMQ_URL}` | RabbitMQ host for MassTransit |
| `Otlp:Endpoint` | `Program.cs` default `http://jaeger-collector.istio-system:4317` | OpenTelemetry trace export |
| `ElasticConfiguration:Uri` | `appsettings.json`, compose env | _not found in Catalog `Program.cs` wiring_ |

Files: `Services/Catalog/Catalog.API/appsettings.json`, `Services/Catalog/Catalog.API/appsettings.Development.json`, `.env.example` (lines 8–13 for MongoDB).

## Interfaces & contracts

### HTTP API (base: `api/v1/Catalog`)

Defined in `Services/Catalog/Catalog.API/Controllers/CatalogController.cs`:

| Method | Route | Handler |
|--------|-------|---------|
| GET | `GetProductById/{id}` | `GetProductByIdQuery` |
| GET | `GetProductByProductName/{productName}` | `GetProductByNameQuery` |
| GET | `GetAllProducts` | `GetAllProductsQuery` (query params: `CatalogSpecParams`) |
| GET | `GetAllBrands` | `GetAllBrandsQuery` |
| POST | `CreateBrand` | `CreateBrandCommand` |
| GET | `GetAllTypes` | `GetAllTypesQuery` |
| POST | `CreateType` | `CreateTypeCommand` |
| GET | `GetProductsByBrandName/{brand}` | `GetProductByBrandQuery` |
| POST | `CreateProduct` | `CreateProductCommand` + publishes `ProductActivityEvent` |
| POST | `UploadProductImage` | `UploadProductImageCommand` (multipart form `imageFile`) |
| PUT | `UpdateProduct` | `UpdateProductCommand` + publishes `ProductActivityEvent` |
| DELETE | `{id}` | `DeleteProductByIdCommand` |

Admin (`Services/Catalog/Catalog.API/Controllers/AdminController.cs`):

| Method | Route | Handler |
|--------|-------|---------|
| POST | `api/v1/Admin/MigrateImagesToS3` | `MigrateImagesToS3Command` |

### Gateway exposure

Ocelot maps upstream `/Catalog/...` → downstream `http://host.docker.internal:8000/api/v1/Catalog/...` in `ApiGateways/Ocelot.ApiGateway/ocelot.Development.json`.

### Integration events (published)

`ProductActivityEvent` (`Infrastructure/EventBus.Messages/Events/ProductActivityEvent.cs`):
- Published on `CreateProduct` and `UpdateProduct` only (not on delete)
- Fields: `ActivityType` (Created/Updated/Deleted), `ProductId`, `ProductName`, `Actor` (hardcoded `"system"`), `OccurredAt`
- Consumed by `Services/Ordering/Ordering.API/EventBusConsumer/ProductActivityConsumer.cs`

### Repository interfaces

`Services/Catalog/Catalog.Core/Repositories/`:
- `IProductRepository` — product CRUD, filtered/paginated queries
- `IBrandRepository` — brand list/create/exists
- `ITypesRepository` — type list/create/exists

All three are implemented by a single class: `ProductRepository` in `Catalog.Infrastructure/Repositories/ProductRepository.cs`.

### Image storage

`IImageStorageService` (`Catalog.Core/Services/IImageStorageService.cs`) implemented by `S3ImageStorageService`.

## Data & state

**MongoDB collections** (initialized in `CatalogContext` constructor, `Services/Catalog/Catalog.Infrastructure/Data/CatalogContext.cs`):

| Collection | Entity | Key fields |
|------------|--------|------------|
| `Products` | `Product` | `Id` (ObjectId), `Name`, `Summary`, `Description`, `ImageFile`, `Price` (Decimal128), embedded `Brands`, `Types` |
| `Brands` | `ProductBrand` | `Id`, `Name` |
| `Types` | `ProductType` | `Id`, `Name` |

**Seed data:** On first startup, if collections are empty, JSON files from `Catalog.Infrastructure/Data/SeedData/` are loaded (`BrandContextSeed`, `TypeContextSeed`, `CatalogContextSeed`). Product seed file switches between `products-local.json` and `products.json` based on `USE_LOCALSTACK` env var.

**Pagination/filtering:** `CatalogSpecParams` supports `PageIndex`, `PageSize` (max 70), `Search`, `BrandId`, `TypeId`, `Sort` (`priceAsc`, `priceDesc`, default name asc). Implemented in `ProductRepository.DataFilter`.

**Images:** Stored as URL strings in `Product.ImageFile`. Upload flow writes to S3; migration admin endpoint reads local files from `/app/images/products` (volume-mounted from `./client/src/images/products` in compose).

## Dependencies

**NuGet (Catalog.API):** Asp.Versioning.Mvc, MassTransit, MassTransit.RabbitMQ, OpenTelemetry.*, Swashbuckle.AspNetCore, AWSSDK.Extensions.NETCore.Setup

**NuGet (Catalog.Core):** MongoDB.Driver, AspNetCore.HealthChecks.MongoDb (package present; _not registered in Program.cs_)

**NuGet (Catalog.Infrastructure):** AWSSDK.S3

**NuGet (Catalog.Application):** Riok.Mapperly

**Project references:**
- `Catalog.API` → `Catalog.Application`, `Catalog.Infrastructure`, `Infrastructure/Common.Logging`, `Infrastructure/EventBus.Messages`
- `Catalog.Infrastructure` → `Catalog.Application` → `Catalog.Core`, `Infrastructure/Common.Mediator`

**Infrastructure services (compose `depends_on`):** `catalogdb` (MongoDB), `elasticsearch`, `localstack` (S3). RabbitMQ is configured but not listed in `depends_on` for `catalog.api`.

**Downstream consumers:** Ocelot gateway, Ordering service (event consumer), admin micro-frontend HTTP client.

## Patterns

1. **Clean architecture layers:** API → Application (handlers/commands/queries) → Core (entities/interfaces) → Infrastructure (MongoDB, S3).
2. **Custom Mediator:** Handlers implement `IRequestHandler<TRequest, TResponse>` from `Common.Mediator`; registered via `builder.Services.AddMediator(assemblies)` in `Program.cs`.
3. **Single repository class:** `ProductRepository` implements `IProductRepository`, `IBrandRepository`, and `ITypesRepository` with explicit interface implementation; all three interfaces are registered as scoped `ProductRepository` in DI.
4. **Mapperly static mapper:** `ProductMapper.Instance` — no DI registration; source-generated mapping between entities, commands, and responses.
5. **Constructor seeding:** `CatalogContext` constructor calls seed methods synchronously on every service resolution (first scope creation triggers DB seed check).
6. **S3 dual-mode:** `Program.cs` branches on `USE_LOCALSTACK` + `AWS_ENDPOINT_URL` for LocalStack path-style vs real AWS virtual-hosted URLs.
7. **Controller event publishing:** `CatalogController` publishes `ProductActivityEvent` directly via `IPublishEndpoint` after create/update — not via a dedicated handler or outbox.
8. **API versioning:** Controllers inherit `[ApiVersion("1")]` + `[Route("api/v{version:apiVersion}/[controller]")]` from `ApiController`.

## Gotchas

1. **No authentication:** `Program.cs` calls `app.UseAuthorization()` but does not configure `UseAuthentication` or auth schemes. All endpoints are effectively open.
2. **`Actor` hardcoded:** `ProductActivityEvent.Actor` is set to `"system"` in `CatalogController` (TODO comment present); delete does not publish events at all.
3. **Seed `InsertOneAsync` without await:** `CatalogContextSeed`, `BrandContextSeed`, and `TypeContextSeed` call `InsertOneAsync` in `foreach` without awaiting — seed inserts may not complete before first query.
4. **`ElasticConfiguration` unused:** Present in `appsettings.json` and compose env vars but not wired in Catalog `Program.cs`.
5. **Health check package unused:** `AspNetCore.HealthChecks.MongoDb` referenced in `Catalog.Core.csproj` but no health endpoint registered in `Program.cs`.
6. **Stale `.http` file:** `Catalog.API.http` references `weatherforecast` endpoint and port `5032`; no `Properties/launchSettings.json` exists under Catalog.
7. **Duplicate brand/type guard throws:** `CreateBrand` and `CreateType` throw `ArgumentException` on duplicate names — not translated to HTTP 409 in controller layer.
8. **`GetProductById` null handling:** Handler returns mapped response without null check; missing product may return empty/null body with 200 OK.
9. **Admin migration path:** `MigrateImagesToS3CommandHandler` expects images at `/app/images/products` — only available when Docker volume is mounted.
10. **CORS wide open:** `CorsPolicy` allows any origin, header, and method.

## Owners

_not found in CODEOWNERS or repository metadata for `Services/Catalog`_
