# Ocelot.ApiGateway — Working Guide

## What it is

The single public HTTP entry point for the platform. An [Ocelot](https://github.com/ThreeMammals/Ocelot) reverse proxy that routes client requests to the Catalog, Basket, Discount, and Ordering microservices. All routing, caching, and rate-limiting behaviour is declared in JSON — there is no application code that implements routing logic.

## Do

- Edit `ocelot.Development.json` for local/Docker Compose routing changes and `ocelot.k8s.json` for Kubernetes routing changes — keep both files in sync (same `Routes[]` entries, only `DownstreamHostAndPorts` differ).
- Run with `ASPNETCORE_ENVIRONMENT=Development` for local dev so `ocelot.Development.json` is loaded; use `ASPNETCORE_ENVIRONMENT=k8s` in the cluster.
- Build the Docker image from the **repo root** as build context (`docker build -f ApiGateways/Ocelot.ApiGateway/Dockerfile .`) — `Directory.Packages.props` must be reachable for `dotnet restore`.
- Test rate-limited routes (`/Basket/Checkout`, `/Basket/CheckoutV2`) at the gateway's actual host port (8010 in Compose) — they are capped at 1 request per 3 seconds.
- Add new routes at the bottom of the relevant service section in both `ocelot.*.json` files and include `UpstreamHttpMethod`, `DownstreamPathTemplate`, and `DownstreamHostAndPorts`.

## Don't

- Do not add routing logic to `Program.cs` or create controller classes — all routing must stay in `ocelot.*.json`.
- Do not rely on `/Discount` REST routes for real discount resolution — Basket calls Discount directly over gRPC; these routes are a façade only.
- Do not assume the gateway provides authentication or authorization — there is no JWT middleware configured; downstream services are not protected at the gateway layer.
- Do not tighten or remove the CORS policy without coordinating with the micro-frontend host — the current `AllowAnyOrigin` policy is intentional for development.
- Do not change a downstream service's port in only one place — both the relevant `ocelot.*.json` and `docker-compose.override.yml` (or Helm values) must be updated together.
- Do not treat `Ocelot.ApiGateway.http` as a reference for real gateway URLs — it targets `localhost:5210` with a `weatherforecast` path that does not exist on this service.

## Key files to read first

1. `ApiGateways/Ocelot.ApiGateway/ocelot.Development.json` — the full route table for local development.
2. `ApiGateways/Ocelot.ApiGateway/Program.cs` — the 43-line startup; shows how config is loaded and middleware is ordered.
3. `ApiGateways/Ocelot.ApiGateway/ocelot.k8s.json` — differences from Development (DNS names, Discount port 8080).

@AGENT.md
