---
name: common-logging
description: Centralized Serilog configuration library for all .NET microservices — console sink always on, optional Elasticsearch sink via ElasticConfiguration:Uri.
paths:
  - Infrastructure/Common.Logging/**/*
metadata:
  part-dir: Infrastructure/Common.Logging
---

## What this part is

`Common.Logging` is a .NET 10 class library with a single public entry point: the static `Logging.ConfigureLogger` action. Services pass it to `builder.Host.UseSerilog(Logging.ConfigureLogger)` during startup. It configures Serilog with:

- Enrichers: `WithMachineName`, `WithEnvironmentName`, `WithExceptionDetails`
- Log-level overrides: `Microsoft.AspNetCore` and `Microsoft.Hosting.Lifetime` to `Warning`
- Development overrides: `Catalog`, `Basket`, `Discount`, `Ordering` loggers to `Debug`
- Console sink (always active)
- Elasticsearch sink (active only when `ElasticConfiguration:Uri` is set) — index pattern `ecommerce-Logs-{yyyy.MM.dd}`, template auto-register `ESv8`

## Key files to read first

- `Infrastructure/Common.Logging/Logging.cs` — the entire implementation; one static `ConfigureLogger` action
- `Infrastructure/Common.Logging/Common.Logging.csproj` — Serilog package dependencies (versions from `Directory.Packages.props`)

## Top patterns

- Services inject config via environment variable `ElasticConfiguration__Uri` (double-underscore for nested config in .NET); when absent the Elasticsearch sink is skipped without throwing.
- All logging behavior lives in one file; do not add per-service Serilog customizations outside this library.

## Gotchas

- Elasticsearch sink is **silently absent** when `ElasticConfiguration:Uri` is unset — do not assume logs reach ES in local dev.
- Adding new sinks or enrichers to `Logging.cs` affects every service; validate across all services before merging.
- A second `Log.Logger = ...` assignment in a service's `Program.cs` silently overrides the shared configuration.

## Full onboarding doc

`Infrastructure/Common.Logging/AGENT.md`
