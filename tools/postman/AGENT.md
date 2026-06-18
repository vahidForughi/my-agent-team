# Codebase Orientation Map — tools/postman

## 1-Line Summary
Five Postman Collection v2.1.0 JSON files that document and enable manual HTTP testing of every REST service (Catalog, Basket, Ordering, API Gateway) and the Identity Server token endpoints in the cloud-native e-commerce platform.

## 5-Minute Explanation
- **Primary tasks in code**: Define named HTTP requests (method, URL, headers, body) organised into Postman collections — one per service. Allow a developer or QA engineer to import a file into Postman (or run it with Newman) and immediately call live service endpoints.
- **Primary inputs**: None at rest. At run time: environment variables `{{base_url}}` and `{{token}}` supplied by the Postman environment; HTTP method, path, and JSON body as defined in the collection item.
- **Primary outputs**: HTTP responses from the targeted service; no files written. Postman displays status code, headers, and response body.
- **Key files**:
  - `tools/postman/API Gateway.postman_collection.json` — 11 requests against Ocelot gateway (`localhost:9010`): Catalog reads, Basket CRUD, Order lookup, HTTP/HTTPS/Nginx variants.
  - `tools/postman/Catalog.postman_collection.json` — 1 request: `GET localhost:9000/api/v1/Catalog/GetAllProducts/`.
  - `tools/postman/Basket API.postman_collection.json` — 4 requests against `localhost:9001`: Create, Get, Checkout v1 (full payload), Checkout v2 (minimal payload).
  - `tools/postman/Ordering API.postman_collection.json` — 4 requests against `localhost:9003/api/v1/Order`: GetByUserName, Create, Modify, Delete.
  - `tools/postman/Identity Server.postman_collection.json` — 6 requests against `localhost:9009` and `id-local.eshopping.com:44344`: OIDC discovery document, token requests for CatalogApiClient, EShoppingGatewayClient, basket scope, and Nginx proxy variant.
- **Main code paths**: N/A (static JSON assets — no application code, no compilation, no build step).

## Deep Dive
- **Type**: API Testing Assets (static JSON, Postman Collection v2.1.0)
- **Primary runtime(s)**: Postman desktop/web app or Newman CLI
- **Entry points**:
  - Any `*.postman_collection.json` — import into Postman to make the collection available; set a Postman environment with `base_url` and `token` variables; then execute individual requests.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `API Gateway.postman_collection.json` | Gateway-level requests (Ocelot at port 9010) | Includes HTTP, HTTPS, and Nginx host variants |
| `Catalog.postman_collection.json` | Direct Catalog service requests (port 9000) | Single `GetAllProducts` request with disabled sample JWT header |
| `Basket API.postman_collection.json` | Direct Basket service requests (port 9001) | Create/Get/Checkout v1/Checkout v2 |
| `Ordering API.postman_collection.json` | Direct Ordering service requests (port 9003) | Full CRUD on the Order resource |
| `Identity Server.postman_collection.json` | Auth token acquisition (port 9009) | Prerequisite for all secured requests; includes Nginx proxy variant at port 44344 |

## Key Boundaries
- **Presentation**: N/A (Postman renders the response; no UI code here)
- **Application/Domain**: N/A
- **Persistence/External I/O**: HTTP/HTTPS network calls to the running microservices; no disk writes.
- **Cross-cutting concerns**:
  - Authentication: `Bearer` tokens. Obtain via Identity Server collection (`POST /connect/token`). Several requests in `API Gateway.postman_collection.json` embed expired JWTs in the `bearer.token` field — do not reuse them.
  - Environments: Shared environment files are not committed to the repo. Developers must create a Postman environment locally and set `base_url` / `token`.
- **Responsibilities by file/module**:
  - `API Gateway.postman_collection.json` — exercises all gateway-proxied endpoints. Routes tested: `GET /Catalog/GetProductsByBrandName/{brand}`, `GET /Catalog/GetAllProducts` (with optional `sort`, `pageIndex`, `pageSize`, `search`, `brandId`, `typeId` query params), `GET /Catalog/GetAllBrands`, `GET /Catalog/GetAllTypes`, `GET /Catalog/GetProductById/{id}`, `GET /Basket/GetBasket/{userName}`, `POST /Basket/CreateBasket`, `DELETE /Basket/DeleteBasket/{userName}`, `POST /Basket/Checkout`, `GET /Order/{userName}`.
  - `Catalog.postman_collection.json` — exercises the Catalog service directly. Route tested: `GET /api/v1/Catalog/GetAllProducts/`.
  - `Basket API.postman_collection.json` — exercises the Basket service directly. Routes tested: `POST /api/v1/Basket/CreateBasket`, `GET /api/v1/Basket/GetBasket/{userName}`, `POST /api/v1/Basket/Checkout` (v1), `POST /api/v2/Basket/Checkout` (v2 with minimal body `{userName, totalPrice}`).
  - `Ordering API.postman_collection.json` — exercises the Ordering service directly. Routes tested: `GET /api/v1/Order/{userName}`, `POST /api/v1/Order/`, `PUT /api/v1/Order/`, `DELETE /api/v1/Order/{id}`.
  - `Identity Server.postman_collection.json` — acquires OAuth2 client-credentials tokens. Endpoints tested: `GET /.well-known/openid-configuration`, `POST /connect/token` (6 variants for different clients and scopes: `catalogapi`, `eshoppinggateway basketapi`, basket scope, Nginx proxy).
- **Detailed code flows**:
  1. Developer opens Postman and imports a `*.postman_collection.json` file.
  2. Developer creates or selects a Postman environment with `base_url` pointing to the target (e.g., `http://localhost:9010` for the gateway) and `token` set to a valid JWT.
  3. For secured requests, the developer first runs a request from `Identity Server.postman_collection.json` to obtain a fresh `access_token`, then sets it as `{{token}}` in the environment.
  4. Developer selects a request (e.g., `Get All Products`) and clicks Send.
  5. Postman substitutes `{{base_url}}` and `{{token}}` in the request template, attaches the `Authorization: Bearer {{token}}` header if configured, and dispatches the HTTP/HTTPS call.
  6. The target microservice or gateway processes the request and returns a response.
  7. Postman displays the response; no files are written.
- **How the pieces map together**: The five collections are independent JSON files. The Identity Server collection is the auth prerequisite for any collection item that uses a `Bearer` token. The API Gateway collection exercises the same downstream service endpoints as the individual service collections, but routes them through the Ocelot gateway at port 9010 rather than directly to the service port. There are no Postman environment files committed to the repo.
- **Files inspected**:
  - `tools/postman/API Gateway.postman_collection.json`
  - `tools/postman/Catalog.postman_collection.json`
  - `tools/postman/Basket API.postman_collection.json`
  - `tools/postman/Ordering API.postman_collection.json`
  - `tools/postman/Identity Server.postman_collection.json`
