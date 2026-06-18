# catalog — Catalog service

## What & why

The product catalog: products, brands, types, and product-image storage (S3 / LocalStack). It is the
read/write source of truth for catalog data and publishes product-activity events so Ordering's
activity feed can track catalog changes. It exists to keep product data and image assets out of the
order/checkout path.

## Where it lives

`Services/Catalog/` — Clean Architecture, four projects:
- `Catalog.API/` — `Program.cs`, `Controllers/CatalogController.cs`, `Controllers/AdminController.cs`,
  `Dockerfile`.
- `Catalog.Application/` — CQRS commands/queries/handlers, responses, Mapperly mapper.
- `Catalog.Core/` — entities (`Entities/Product.cs`, `ProductType.cs`), repository interfaces
  (`Repositories/IProductRepository.cs`, `IBrandRepository`, `ITypesRepository`), `Services/IImageStorageService`,
  `Specs/CatalogSpecParams.cs`.
- `Catalog.Infrastructure/` — `Repositories/ProductRepository.cs` (Mongo), `Services/S3ImageStorageService.cs`
  + `AwsS3Settings`/`ImageSettings`, `Data/CatalogContextSeed.cs`, seed JSON
  (`Data/SeedData/brands.json`, `products.json`, `types.json`).

## Tech stack

- .NET 10 (`net10.0` in `Catalog.API/Catalog.API.csproj`; SDK `10.0.300` from `global.json`).
- Versions via `Directory.Packages.props`: MongoDB.Driver 3.9.0, AWSSDK.S3 3.7.511.8 /
  AWSSDK.Extensions.NETCore.Setup 3.7.400.2, Riok.Mapperly 4.3.1, MassTransit 8.5.10,
  Asp.Versioning.Mvc 10.0.0, OpenTelemetry 1.15.x, Serilog.AspNetCore 8.0.3, Swashbuckle 6.4.0.
- Project refs (`Catalog.API.csproj`): `Common.Logging`, `EventBus.Messages`, `Catalog.Application`,
  `Catalog.Infrastructure`.

## Build / run / test

```bash
# Local (needs MongoDB :27017; S3 via LocalStack :4566 or real AWS)
cd Services/Catalog/Catalog.API && dotnet run

docker build -f Services/Catalog/Catalog.API/Dockerfile -t catalogapi .
docker compose up catalog.api       # host :8000 → container :80
```

Binds container `80`; published on host `:8000` (`docker-compose.override.yml`). Swagger (v1) in
Development only. The compose service mounts `./client/src/images/products` and `~/.aws` read-only.

## Configuration

Read in `Catalog.API/Program.cs`; local defaults in `Catalog.API/appsettings.Development.json`, real
values as env vars in `docker-compose.override.yml`:
- `DatabaseSettings__ConnectionString=${MONGODB_URL}`, `DatabaseSettings__DatabaseName=${MONGO_DB}`,
  `DatabaseSettings__CollectionName=Products`, `DatabaseSettings__BrandsCollection=Brands`,
  `DatabaseSettings__TypesCollection=Types` — Mongo connection + collection names.
- `USE_LOCALSTACK=true` and `AWS_ENDPOINT_URL=http://localstack:4566` — switch the `IAmazonS3`
  registration to LocalStack (`ForcePathStyle=true`, `UseHttp=true`) vs real AWS (`Program.cs`).
- `AWS__S3__BucketName=ecommerce-product-images`, `AWS__S3__Region=us-east-1`,
  `AWS__S3__ImagePrefix=products/` — bound to `AwsS3Settings` (`builder.Configuration.GetSection("AWS:S3")`).
  `appsettings.Development.json` also sets `AWS:S3:ServiceUrl` and `AWS:S3:UsePathStyle`.
- `AWS_ACCESS_KEY_ID=test` / `AWS_SECRET_ACCESS_KEY=test` — LocalStack dummy creds (compose).
- `ImageSettings` (`appsettings.Development.json`): `MaxFileSizeInMB=5`,
  `AllowedExtensions=[.png,.jpg,.jpeg,.webp]` — bound to `ImageSettings`.
- `EventBusSettings__HostAddress=${RABBITMQ_URL}` — RabbitMQ for `ProductActivityEvent`.
- `ElasticConfiguration__Uri=${ELASTICSEARCH_URL}` — optional Serilog ES sink.
- `Otlp:Endpoint` — OTLP traces, default `http://jaeger-collector.istio-system:4317`.

## Interfaces & contracts

HTTP controllers (service paths `api/v1/Catalog/...` / `api/v1/Admin/...`; gateway exposes short form):
- `CatalogController`: `GET GetProductById/{id}`, `GET GetProductByProductName/{productName}`,
  `GET GetAllProducts` (`CatalogSpecParams` paging/filter), `GET GetAllBrands`, `POST CreateBrand`,
  `GET GetAllTypes`, `POST CreateType`, `GET GetProductsByBrandName/{brand}`, `POST CreateProduct`,
  `POST UploadProductImage` (`multipart/form-data`), `PUT UpdateProduct`, `DELETE {id}`.
- `AdminController`: `POST MigrateImagesToS3` (returns a `MigrationReport`).

Events published (MassTransit → RabbitMQ): `ProductActivityEvent`
(`Infrastructure/EventBus.Messages/Events/ProductActivityEvent.cs`, with `ProductActivityType`
Created/Updated/Deleted), published from `CreateProduct`/`UpdateProduct`; consumed by Ordering's
`ProductActivityConsumer`.

## Data & state

- MongoDB (`CatalogDb`; collections `Products`/`Brands`/`Types`) behind
  `IProductRepository`/`IBrandRepository`/`ITypesRepository`. Schema-less — **no migrations**;
  document-shape changes are implicit. Container `catalogdb` (`:27017`, `docker-compose.override.yml`).
- Object storage: AWS S3 or LocalStack for product images via
  `Catalog.Infrastructure/Services/S3ImageStorageService.cs`.
- Seed data loaded on startup from JSON in `Catalog.Infrastructure/Data/SeedData/`.

## Dependencies

- → **Ordering** (async, RabbitMQ) via `ProductActivityEvent`.
- → MongoDB and S3/LocalStack (infra dependencies).
- → Shared libs `Common.Mediator`, `EventBus.Messages`, `Common.Logging` — see
  [`Infrastructure/CLAUDE.md`](../../Infrastructure/CLAUDE.md).
- Called by the gateway ([`ApiGateways/Ocelot.ApiGateway/CLAUDE.md`](../../ApiGateways/Ocelot.ApiGateway/CLAUDE.md)); does **not** call Basket,
  Discount, or Ordering synchronously.

## Patterns

- Seed defaults via the JSON files in `Catalog.Infrastructure/Data/SeedData/`, not by hand-inserting
  into Mongo.
- `IAmazonS3` is registered **conditionally on `USE_LOCALSTACK`** in `Program.cs` — keep both the
  LocalStack and real-AWS (IRSA / `FallbackCredentialsFactory`) branches working.
- The Mapperly mapper is accessed via static `Instance` here (differs from Discount, which DI-registers
  its mapper).
- Publish activity events only after the write succeeds (guarded on the handler result in
  `CatalogController`).

## Gotchas

- MongoDB has no migrations — watch backward compatibility of existing documents when changing entity
  shape.
- LocalStack vs real AWS differ in `ForcePathStyle`/credentials; persisted image URLs may need the
  migration paths (`scripts/migrate-*-s3.sh`, `Admin/MigrateImagesToS3`).
- Catalog `GET` routes are file-cached at the gateway (~30s) — fresh writes can look stale briefly;
  not a bug.
- `Actor` on `ProductActivityEvent` is hardcoded `"system"` (TODO in `CatalogController`) until auth
  is wired.

## Owners / agents

`backend-architect` (Mongo persistence, S3 wiring, events), `api-tester` (catalog CRUD + image upload).
Roles from `.claude/agents/`.
