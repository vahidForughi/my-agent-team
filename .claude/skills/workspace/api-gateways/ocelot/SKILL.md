---
name: ocelot
description: Ocelot HTTP API gateway — .NET 10 reverse proxy routing Catalog, Basket, Discount, and Ordering routes. Use when editing gateway routing config, CORS, rate limits, per-route caching, or environment-specific deployment config.
paths:
  - ApiGateways/Ocelot.ApiGateway/**/*
metadata:
  part-dir: ApiGateways/Ocelot.ApiGateway
---

## What it is

A stateless .NET 10 Ocelot reverse proxy. All routing is pure JSON config — no controller code. It is the single public HTTP entry point for the platform.

## Files to read first

1. `ApiGateways/Ocelot.ApiGateway/ocelot.Development.json` — full route table (local/Docker Compose; 27 routes).
2. `ApiGateways/Ocelot.ApiGateway/Program.cs` — 43 lines; shows config loading, CORS, and middleware order.
3. `ApiGateways/Ocelot.ApiGateway/ocelot.k8s.json` — same routes with Kubernetes DNS names.

## Top patterns

- Routing is declared in `Routes[]` JSON — never in C# code.
- Environment switches the config file: `ASPNETCORE_ENVIRONMENT=Development` → `ocelot.Development.json`; `=k8s` → `ocelot.k8s.json`.
- Upstream paths are short (`/Catalog/GetAllProducts`); downstream paths include `/api/v1/` prefix.
- Per-route QoS: `FileCacheOptions.TtlSeconds` (Catalog root 30 s, Activity 10 s) and `RateLimitOptions` (Basket Checkout: 1 req/3 s).

## Top gotchas

- `/Discount` REST routes exist but Discount is gRPC-only internally — Basket calls it directly over gRPC.
- No auth/authz at the gateway today.
- Docker build context must be repo root (not `ApiGateways/`), because `Directory.Packages.props` is at root.
- Changing a downstream port requires updating both `ocelot.*.json` and `docker-compose.override.yml`/Helm values.
- `ocelot.k8s.json` does not have the trailing-slash `/Activity/` route that `ocelot.Development.json` has.

## Full onboarding doc

See `ApiGateways/Ocelot.ApiGateway/AGENT.md`.
