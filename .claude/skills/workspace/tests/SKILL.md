---
name: tests
description: Performance and load testing area — today exclusively the k6 suite under tests/k6/; functional tests (.NET xUnit, MFE Jest/Playwright) live with their source code, not here.
paths:
  - tests/**/*
metadata:
  part-dir: tests
---

The `tests/` directory is an organizational parent for the platform's load/performance testing. Its only active child is `tests/k6/`, which contains all k6 test scripts, runner scripts, and metric-push tooling. No functional unit or integration tests live here.

## Key facts

- `tests/k6/` is the only subdirectory. There are no other children.
- Functional tests live with their source code: .NET xUnit projects per service (run via `dotnet test`); micro-frontend Jest + Playwright tests under `micro-frontends/`.
- This parent directory has no configuration, no build artifacts, and no programmatic contracts of its own.
- The k6 child pushes metrics to Prometheus via PushGateway and visualizes them in Grafana.

## Key files to read first

- `tests/k6/config.js` — central config: service registry, ENV switches, load profiles, URL builders
- `tests/k6/run-all-tests.sh` — primary test orchestrator
- `tests/k6/CLAUDE.md` — do/don't rules and quick-start for the k6 suite

## Full onboarding doc

[`tests/AGENT.md`](../../../tests/AGENT.md)
