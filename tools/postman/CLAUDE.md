# tools/postman — Postman API Testing Collections

## What & why

Five Postman Collection v2.1.0 JSON files for manual and exploratory HTTP testing of every REST
service in the platform. One file per service/gateway. Import into the Postman app or run with
Newman; no compilation or build step required.

## Collections and ports

| File | Service | Direct port | Gateway port |
|------|---------|------------|-------------|
| `API Gateway.postman_collection.json` | Ocelot API Gateway | — | 9010 |
| `Catalog.postman_collection.json` | Catalog service | 9000 | — |
| `Basket API.postman_collection.json` | Basket service | 9001 | — |
| `Ordering API.postman_collection.json` | Ordering service | 9003 | — |
| `Identity Server.postman_collection.json` | Duende IdentityServer | 9009 | 44344 (Nginx) |

## Requests per collection

**API Gateway** (`localhost:9010`):
- `GET /Catalog/GetProductsByBrandName/{brand}`
- `GET /Catalog/GetAllProducts` (optional query: `sort`, `pageIndex`, `pageSize`, `search`, `brandId`, `typeId`)
- `GET /Catalog/GetAllBrands`
- `GET /Catalog/GetAllTypes`
- `GET /Catalog/GetProductById/{id}`
- `GET /Basket/GetBasket/{userName}`
- `POST /Basket/CreateBasket`
- `DELETE /Basket/DeleteBasket/{userName}`
- `POST /Basket/Checkout`
- `GET /Order/{userName}`
- HTTPS and Nginx host variants of the above

**Catalog** (`localhost:9000`):
- `GET /api/v1/Catalog/GetAllProducts/`

**Basket API** (`localhost:9001`):
- `POST /api/v1/Basket/CreateBasket`
- `GET /api/v1/Basket/GetBasket/{userName}`
- `POST /api/v1/Basket/Checkout` (v1 — full billing payload)
- `POST /api/v2/Basket/Checkout` (v2 — minimal: `{userName, totalPrice}`)

**Ordering API** (`localhost:9003`):
- `GET /api/v1/Order/{userName}`
- `POST /api/v1/Order/`
- `PUT /api/v1/Order/`
- `DELETE /api/v1/Order/{id}`

**Identity Server** (`localhost:9009`):
- `GET /.well-known/openid-configuration`
- `POST /connect/token` — multiple variants: CatalogApiClient, EShoppingGatewayClient (gateway scope), basket scope, 2nd client, Nginx proxy host

## Auth flow

1. Run a `POST /connect/token` request in `Identity Server.postman_collection.json`.
2. Copy the `access_token` from the response.
3. Set it as `{{token}}` in your Postman environment.
4. All secured requests in other collections will pick it up via `Authorization: Bearer {{token}}`.

## Do
- Set `{{base_url}}` and `{{token}}` in a Postman environment before running requests.
- Obtain a fresh token from Identity Server before calling secured endpoints.
- Use `EShoppingGatewayClient` credentials for gateway-routed requests.
- Keep each collection in sync with its service's actual endpoints — update the collection when endpoints change.
- Run collections with Newman in CI/CD:
  ```bash
  newman run "tools/postman/API Gateway.postman_collection.json" --env-var "base_url=http://localhost:9010" --env-var "token=<jwt>"
  ```

## Don't
- Do not reuse the embedded JWT samples in any collection file — they are expired placeholder tokens.
- Do not hard-code hosts, ports, or secrets in collection items — use `{{base_url}}` and `{{token}}`.
- Do not commit Postman environment files containing real tokens or client secrets.
- Do not add gRPC (Discount service) requests to these REST collections — use a gRPC client for that.
- Do not modify `info.schema` — all collections must remain on the v2.1.0 format.

## Gotchas

- No Postman environment files are in the repo — create one locally with the variables listed above.
- The Nginx variant requests require a local `/etc/hosts` entry for `id-local.eshopping.com` and a running Nginx proxy at port 44344.
- `Catalog.postman_collection.json` has a disabled `Authorization` header with an expired JWT — it is a documentation example only.
- `Basket API.postman_collection.json` v2 Checkout only sends `{userName, totalPrice}` — the full billing payload is only in v1.

## Owners / agents

- `api-tester` — owns these collections and keeps them aligned with service endpoint changes.

@AGENT.md
