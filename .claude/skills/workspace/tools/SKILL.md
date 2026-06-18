---
name: tools
description: Developer tooling directory containing Postman API testing collections for the cloud-native e-commerce platform's microservices and API gateway.
paths:
  - tools/**/*
metadata:
  part-dir: tools
---

# tools skill

This skill covers the `tools/` directory — a developer-tooling parent that currently contains
Postman collection JSON files for manual API testing.

## Scope

- `tools/postman/` — five Postman Collection v2.1.0 JSON files (API Gateway, Catalog, Basket,
  Ordering, Identity Server).
- No application code, no build artifacts, no runtime.

## When to invoke

- Adding, removing, or renaming requests in any Postman collection.
- Updating a collection to match a changed service endpoint.
- Adding a new collection for a new service.
- Advising on Postman environment setup or Newman CLI usage.
- Onboarding a developer to the manual testing assets.

## Key facts

- All collections use Postman Collection schema v2.1.0.
- Auth: `Bearer` tokens obtained from `Identity Server.postman_collection.json` at `localhost:9009`.
- Direct service ports: Catalog 9000, Basket 9001, Ordering 9003.
- Gateway port: Ocelot at 9010.
- Discount (gRPC) is intentionally not covered — use a gRPC client.
- No Postman environment files are committed to the repo.

## Do not

- Modify application source code in `Services/`, `ApiGateways/`, or `Infrastructure/`.
- Commit environment files containing real tokens or client secrets.
- Cover gRPC endpoints in these REST collections.
