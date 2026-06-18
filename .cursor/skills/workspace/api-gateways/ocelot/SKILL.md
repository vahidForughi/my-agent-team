---
name: ocelot
description: Ocelot HTTP API gateway that proxies Catalog, Basket, Discount, and Ordering routes. Use when editing gateway routing, CORS, rate limits, or deployment config for ApiGateways/Ocelot.ApiGateway.
metadata:
  part-dir: ApiGateways/Ocelot.ApiGateway
---

# Ocelot API Gateway

ASP.NET Core reverse proxy using Ocelot 23.4.3. Single entry point at **port 8010** (Docker Compose) routing to four downstream microservices.

## Read first

1. `ApiGateways/Ocelot.ApiGateway/Program.cs` — startup, CORS, Ocelot middleware pipeline
2. `ApiGateways/Ocelot.ApiGateway/ocelot.Development.json` — local/docker-compose routes (`host.docker.internal:8000–8003`)
3. `ApiGateways/Ocelot.ApiGateway/ocelot.k8s.json` — in-cluster routes (K8s service DNS)
4. `ApiGateways/Ocelot.ApiGateway/Dockerfile` — container build (port 80)

## Key patterns

- Routes are JSON-only; upstream paths omit `/api/v1` (e.g. `/Catalog/GetAllProducts` → `/api/v1/Catalog/GetAllProducts`)
- Environment file loaded: `ocelot.{ASPNETCORE_ENVIRONMENT}.json`
- Rate limiting on `/Basket/Checkout` and `/Basket/CheckoutV2` (1 request / 3s)
- File caching on Catalog (30s) and Activity (10s) read routes

## Gotchas

- No auth middleware despite `UseAuthorization()` call
- Helm ConfigMap duplicates `ocelot.k8s.json` — keep both in sync
- `Ocelot.ApiGateway.http` is a stale template (wrong port/endpoint)

Full reference: [AGENT.md](../../../../ApiGateways/Ocelot.ApiGateway/AGENT.md)
