---
name: k6
description: k6 load/stress/spike/soak and workflow tests for catalog, basket, and ordering services; results pushed to Prometheus via PushGateway and visualized in Grafana.
paths:
  - tests/k6/**/*
metadata:
  part-dir: tests/k6
---

The k6 suite runs five load profiles (smoke, load, stress, spike, soak) and two end-to-end workflow simulations against the platform's REST services (catalog, basket, ordering) and API gateway. All service endpoints, environment switches, and SLO thresholds are centralized in `config.js`. The discount service is gRPC-only and not tested via HTTP.

## Key files to read first

- `tests/k6/config.js` — `SERVICES`, `ENV`, `TEST_TYPES`; `getEndpoint`, `getTestableServices`, `createTags`
- `tests/k6/run-all-tests.sh` — primary orchestrator; sequences service → workflow → load tests; auto-starts PushGateway port-forward
- `tests/k6/push-metrics.sh` — runs a named test type and POSTs Prometheus exposition text to PushGateway
- `tests/k6/workflow-website.js` — most complex test; 8-step website simulation with `CreateBasket` POST and `CheckoutV2` retry on 429

## Top patterns

- **`getEndpoint` is the only URL builder** — always call it instead of hardcoding paths; it selects gateway (no `/api/v1`) vs. port-forward (with `/api/v1`) based on `ENV.useGateway`.
- **`USE_GATEWAY` defaults to `true`** — gateway mode supports up to 500 VUs; port-forward mode caps at ~300. Set `USE_GATEWAY=false` only for local dev.
- **`createTags` for every request** — tags `{service, namespace, test_type}` are required for Grafana dashboard filtering.
- **Thresholds are SLOs** — defined in `TEST_TYPES` in `config.js`; failing them fails the k6 run. Tune deliberately; don't delete them to make a run pass.
- **Discount is skipped** — `discount-test.js` is a trivially-passing stub; `getTestableServices()` returns `['catalog','basket','ordering']` only.

## Gotchas

- Port-forward crashes above ~300 VUs — use AWS gateway mode for real stress/spike tests.
- `workflow-website.js` checkout (step 7) retries `CheckoutV2` up to 5 times on HTTP 429 with exponential backoff; the gateway rate-limits checkout to 1 req / 3 s.
- JSON summaries land in `/tmp/k6-results-<timestamp>/` — not in the repo.
- PushGateway must be reachable at `:9091` for metric persistence; `run-all-tests.sh` auto-creates the port-forward if not.

## Full onboarding doc

[`tests/k6/AGENT.md`](../../../../tests/k6/AGENT.md)
