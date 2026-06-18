# tools — Developer Tooling (Postman)

## What & why

Manual API-testing assets: Postman collections for the API gateway and the REST services. They let
a developer (or QA) exercise endpoints by hand against local, Minikube, or AWS gateways without
writing code, and they document the request shape (paths, headers, auth) for each service.

## Where it lives

`tools/postman/`:
- `API Gateway.postman_collection.json` — gateway routing.
- `Catalog.postman_collection.json` — Catalog REST endpoints.
- `Basket API.postman_collection.json` — Basket REST endpoints.
- `Ordering API.postman_collection.json` — Ordering REST endpoints.
- `Identity Server.postman_collection.json` — auth/token flows (Duende IdentityServer).

(Note: `istio-1.30.1/tools/` is unrelated vendored Istio tooling, not part of this part.)

## Tech stack

- Postman Collection format **v2.1.0** — confirmed in each file's
  `info.schema` (`https://schema.getpostman.com/json/collection/v2.1.0/collection.json`).
- Runnable in the Postman desktop/web app or via the Postman CLI / Newman.

## Build / run / test

```bash
# Import the .json collections into Postman (desktop/web), set environment vars, then run.
# Or via Postman CLI:
postman collection run "tools/postman/API Gateway.postman_collection.json"
```

Prereq: a reachable target (local service, Minikube port-forward, or AWS gateway) and a valid
bearer token for authenticated requests.

## Configuration

- Environment variables — keep requests parameterized with `{{base_url}}` and `{{token}}` so a
  single collection works against local / Minikube / AWS without edits.
- Auth — requests use a `Bearer` token (see the disabled `Authorization` header sample in
  `Catalog.postman_collection.json`); obtain a real token via the Identity Server collection.
- Some sample requests hard-code hosts/ports (e.g. `http://localhost:9000/api/v1/Catalog/...` in
  `Catalog.postman_collection.json`) — switch them to `{{base_url}}` when reusing.

## Interfaces & contracts

- Consumes the REST APIs of the gateway, Catalog, Basket, and Ordering services, plus Identity
  Server token endpoints — one collection per service.
- Artifact contract: each `*.postman_collection.json` mirrors its service's REST endpoints
  (method, path, headers, body). When a service endpoint changes, update the matching collection.
- **Discount is gRPC-only** and is intentionally **not** covered here — use a gRPC client instead.

## Data & state

No persistent state. Collections are static JSON; per-run state (tokens, base URLs, captured
responses) lives in the user's Postman environment, not in the repo. _Shared Postman environment
files not found in `tools/postman/`._

## Dependencies

- Depends on running services / gateway to send requests against, and on Identity Server for
  tokens.
- Complements `tests/k6` (automated load testing) — these collections are for manual/exploratory
  testing of the same endpoints.

## Patterns

- Parameterize with `{{base_url}}`/`{{token}}` for portability across environments (don't hardcode
  hosts/tokens).
- One collection per service, kept in sync with that service's endpoints; update the collection
  whenever you add or change an endpoint.

## Gotchas

- Collections must be imported and have environment variables set before requests work.
- Discount (gRPC) is not covered by these REST collections.
- Embedded sample tokens are expired/placeholder JWTs — generate a fresh token rather than reusing
  the one in a request header.

## Owners / agents

- `api-tester` — owns the manual API-testing collections and keeps them aligned with service endpoints.
