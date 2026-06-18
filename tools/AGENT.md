# Codebase Orientation Map — Tools

## 1-Line Summary
A developer-tooling directory that holds manual API-testing assets (Postman collections) for the cloud-native e-commerce platform's microservices and API gateway.

## 5-Minute Explanation
- **Primary tasks in code**: Provide importable Postman collection files that let a developer or QA engineer send HTTP requests to each service (Catalog, Basket, Ordering, API Gateway, Identity Server) without writing code.
- **Primary inputs**: None at build time. At run time: HTTP requests sent from the Postman desktop/web app or the Newman CLI, parameterised by environment variables (`{{base_url}}`, `{{token}}`).
- **Primary outputs**: HTTP responses from the targeted microservice or gateway; no files are written.
- **Key files**:
  - `tools/postman/API Gateway.postman_collection.json` — gateway routing requests
  - `tools/postman/Catalog.postman_collection.json` — Catalog REST endpoint
  - `tools/postman/Basket API.postman_collection.json` — Basket REST endpoints
  - `tools/postman/Ordering API.postman_collection.json` — Ordering REST endpoints
  - `tools/postman/Identity Server.postman_collection.json` — auth/token flows
- **Main code paths**: N/A (static JSON assets, no application code).

## Deep Dive
- **Type**: Static tooling assets directory (no application runtime)
- **Primary runtime(s)**: Postman desktop/web app or Newman CLI
- **Entry points**:
  - `tools/postman/`: Import any `*.postman_collection.json` into Postman, set `{{base_url}}` and `{{token}}` environment variables, then execute individual requests.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `tools/postman/` | Postman API testing collections | One collection per service/gateway |

## Key Boundaries
- **Presentation**: N/A
- **Application/Domain**: N/A
- **Persistence/External I/O**: No persistent state in the repo; per-run state (tokens, captured responses) lives in the user's Postman environment.
- **Cross-cutting concerns**: Bearer token auth — obtain from Identity Server collection before calling secured endpoints. Shared environment files are not committed to `tools/postman/`.
- **Responsibilities by file/module**:
  - `tools/postman/API Gateway.postman_collection.json` — exercises the Ocelot API gateway at `localhost:9010`; covers Catalog read requests, Basket CRUD, Order lookup, and both HTTP and HTTPS variants.
  - `tools/postman/Catalog.postman_collection.json` — single request against the Catalog service directly at `localhost:9000/api/v1/Catalog/GetAllProducts/`; includes a disabled sample Authorization header with an expired JWT.
  - `tools/postman/Basket API.postman_collection.json` — four requests against the Basket service at `localhost:9001`: `POST /CreateBasket`, `GET /GetBasket/{userName}`, `POST /Checkout` (v1 full payload), `POST /Checkout` (v2 minimal payload).
  - `tools/postman/Ordering API.postman_collection.json` — four requests against the Ordering service at `localhost:9003/api/v1/Order`: `GET /{userName}`, `POST /`, `PUT /`, `DELETE /{id}`.
  - `tools/postman/Identity Server.postman_collection.json` — six requests against Duende IdentityServer at `localhost:9009` and the Nginx host `id-local.eshopping.com:44344`: OIDC discovery document, token requests for various client credentials (`CatalogApiClient`, `EShoppingGatewayClient`, basket scope).
- **Detailed code flows**:
  1. Developer imports a `*.postman_collection.json` into the Postman app.
  2. A Postman environment is created or selected, setting `{{base_url}}` and `{{token}}` variables.
  3. Developer selects a request (e.g., `Get All Products`) and clicks Send.
  4. Postman resolves variables, attaches the `Bearer` token header if configured, and sends the HTTP/HTTPS request to the target service.
  5. The microservice processes the request and returns an HTTP response; Postman displays the response body and status code.
  6. No repo files are modified at any step.
- **How the pieces map together**: The five collections are independent; no collection imports another. The Identity Server collection is the prerequisite for any request that requires a `Bearer` token — the developer runs `Get Token` or `Get Gateway Token` first, copies the `access_token` value, and sets it in the Postman environment before running secured requests in other collections.
- **Files inspected**:
  - `tools/postman/API Gateway.postman_collection.json`
  - `tools/postman/Catalog.postman_collection.json`
  - `tools/postman/Basket API.postman_collection.json`
  - `tools/postman/Ordering API.postman_collection.json`
  - `tools/postman/Identity Server.postman_collection.json`
  - `tools/AGENT.md` (previous version)
  - `tools/CLAUDE.md`
