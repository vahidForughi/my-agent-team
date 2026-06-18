---
name: catalog
description: Product catalog microservice — manages products, brands, and types in MongoDB, stores images in S3/LocalStack, and publishes ProductActivityEvents to RabbitMQ.
paths:
  - Services/Catalog/**/*
metadata:
  part-dir: Services/Catalog
---

The Catalog service is the read/write source of truth for product data (products, brands, types) and product image assets. It persists catalog data in MongoDB (schema-less, no migrations), stores product images in AWS S3 or LocalStack, and publishes `ProductActivityEvent` messages to RabbitMQ when products are created or updated. Ordering consumes these events for its activity feed.

## Key files to read first

- `Services/Catalog/Catalog.API/Program.cs` — startup, DI, LocalStack vs real-AWS S3 branching, config keys
- `Services/Catalog/Catalog.API/Controllers/CatalogController.cs` — product/brand/type CRUD + image upload
- `Services/Catalog/Catalog.API/Controllers/AdminController.cs` — S3 image migration admin endpoint
- `Services/Catalog/Catalog.Application/` — CQRS command/query handlers, Mapperly mapper
- `Services/Catalog/Catalog.Core/Entities/Product.cs` — core domain entity
- `Services/Catalog/Catalog.Infrastructure/Repositories/ProductRepository.cs` — MongoDB access
- `Services/Catalog/Catalog.Infrastructure/Services/S3ImageStorageService.cs` — S3/LocalStack image storage
- `Services/Catalog/Catalog.Infrastructure/Data/CatalogContextSeed.cs` — startup seed from JSON
- `Services/Catalog/Catalog.Infrastructure/Data/SeedData/` — `brands.json`, `products.json`, `types.json`

## Top patterns

- **Conditional S3 registration**: `IAmazonS3` is registered in `Program.cs` based on `USE_LOCALSTACK` env var — one branch for LocalStack (`ForcePathStyle=true`, `UseHttp=true`), one for real AWS (IRSA `FallbackCredentialsFactory`). Keep both branches working.
- **Publish activity events only after a successful write**: the handler result is checked in `CatalogController` before calling MassTransit publish.
- **Seed data via JSON**: initial products/brands/types come from JSON files in `Data/SeedData/`; do not hand-insert into Mongo.
- **Mapperly static instance**: `ProductMapper.Instance` (differs from Discount, which DI-registers its mapper).
- **MongoDB schema-less**: no migrations; backward compatibility of existing documents is the developer's responsibility when changing entity shape.

## Gotchas

- MongoDB has no migrations — changing entity shape can silently break existing documents.
- LocalStack vs real AWS differ in `ForcePathStyle` and credentials; persisted image URLs may need migration via `Admin/MigrateImagesToS3` or the `scripts/migrate-*-s3.sh` scripts.
- Catalog `GET` routes are file-cached at the gateway (~30s) — fresh writes can appear stale briefly; this is expected, not a bug.
- `Actor` on `ProductActivityEvent` is hardcoded `"system"` (TODO in `CatalogController`) until auth is wired.
- Container port is `80`; host port is `8000` via `docker-compose.override.yml`.

## Full onboarding doc

[`Services/Catalog/AGENT.md`](../../../../Services/Catalog/AGENT.md)
