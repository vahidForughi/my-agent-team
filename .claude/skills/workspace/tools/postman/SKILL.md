---
name: postman
description: Five Postman Collection v2.1.0 JSON files for manual HTTP testing of every REST service (Catalog, Basket, Ordering, API Gateway) and Identity Server token flows in the cloud-native e-commerce platform.
paths:
  - tools/postman/**/*
metadata:
  part-dir: tools/postman
---

# postman skill

This skill covers `tools/postman/` — the Postman API testing collections for the platform.

## Files

| File | Service | Port |
|------|---------|------|
| `API Gateway.postman_collection.json` | Ocelot gateway | 9010 |
| `Catalog.postman_collection.json` | Catalog service | 9000 |
| `Basket API.postman_collection.json` | Basket service | 9001 |
| `Ordering API.postman_collection.json` | Ordering service | 9003 |
| `Identity Server.postman_collection.json` | Duende IdentityServer | 9009 / 44344 (Nginx) |

## When to invoke

- Adding, updating, or removing a request in any collection.
- Keeping a collection in sync after a service endpoint changes.
- Explaining how to import collections, set up environments, or run with Newman.
- Investigating auth flows (token acquisition via Identity Server).

## Auth flow (facts from source)

1. `POST https://localhost:9009/connect/token` with `grant_type=client_credentials`.
2. Use `EShoppingGatewayClient` + secret `5c7fd5c5-61a7-4668-ac57-2b4591ec26d2` for gateway scope (`eshoppinggateway basketapi`). Use `CatalogApiClient` for catalog scope (`catalogapi`).
3. Set the returned `access_token` as `{{token}}` in your Postman environment.

## Do not

- Reuse embedded JWT samples in collection files — they are expired.
- Hard-code hosts, ports, or secrets — use `{{base_url}}` and `{{token}}`.
- Commit Postman environment files with real secrets.
- Add gRPC endpoints (Discount) to these REST collections.
