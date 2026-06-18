# tests — Testing (parent)

## What & why

The repo-level testing area. Today this is exclusively the **k6 load/performance** suite — see the
child [`k6/CLAUDE.md`](./k6/CLAUDE.md). Functional tests (unit/integration) are intentionally **not** here;
they live next to the code they exercise so they ship and version with that code.

## Where it lives

`tests/` → [`k6/CLAUDE.md`](./k6/CLAUDE.md) (`tests/k6/`). No other subdirectories exist under `tests/`.

Functional tests live elsewhere:
- .NET services — xUnit projects per service, run via `dotnet test` (see `Services`).
- Micro-frontends — NX + Jest (unit) and Playwright (e2e) (see `micro-frontends`).

## Tech stack

- Load/performance: k6 (JavaScript test scripts) — details in [`k6/CLAUDE.md`](./k6/CLAUDE.md).
- Functional (out-of-tree): .NET xUnit (`dotnet test`); MFE NX/Jest/Playwright.

## Build / run / test

```bash
# Load / performance tests — see k6 for the full workflow
k6 run tests/k6/catalog-test.js

# Functional tests (live with their code, not under tests/)
dotnet test Ecommerce.sln                              # .NET unit/integration
cd micro-frontends && npm test && npm run test:e2e     # MFE unit + Playwright e2e
```

## Configuration

No configuration of its own at this level. The k6 suite is driven by `tests/k6/config.js` (ENV
overrides) — see [`k6/CLAUDE.md`](./k6/CLAUDE.md). Functional-test config lives in the respective .NET test
projects and MFE NX/Jest/Playwright configs.

## Interfaces & contracts

This parent has no programmatic contract; it is an organizational grouping. Its single real
contract is delegated to [`k6/CLAUDE.md`](./k6/CLAUDE.md): k6 hits service/gateway HTTP targets and pushes
tagged metrics (`service`/`test_type`/`namespace`) to the Prometheus PushGateway for Grafana.

## Data & state

No artifacts stored here. k6 run results/metrics are produced by [`k6/CLAUDE.md`](./k6/CLAUDE.md) (JSON
summaries in `/tmp`, metrics pushed to PushGateway/Prometheus, visualized in Grafana).

## Dependencies

- The k6 child needs a running target (gateway or port-forwards) plus the monitoring stack
  (PushGateway + Prometheus + Grafana) for metrics — see [`k6/CLAUDE.md`](./k6/CLAUDE.md) and `monitoring`.
- Functional tests depend on their own code/projects, not on this directory.

## Patterns

- Load/perf testing is k6 under `tests/k6` (`k6/`); functional tests live with their code. Put new
  performance scenarios under `tests/k6`, not here at the parent level.
- This directory is not a catch-all — don't add service unit tests here.

## Gotchas

- Don't expect service unit tests in this folder; they're in the .NET/MFE projects.
- Load tests need a running target and the monitoring stack, or they produce no useful metrics.

## Owners / agents

- `api-tester` — owns API-level test coverage and validation.
- `performance-benchmarker` — owns load/perf scenarios and thresholds (delegated to `k6`).
- `evidence-collector` — captures and reports test/metric evidence.
