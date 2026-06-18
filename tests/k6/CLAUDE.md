# k6 — k6 Load & Performance Tests

## What & why

k6 load/stress/spike/soak and end-to-end workflow tests for the backend services and the API
gateway. Results are pushed to Prometheus via the PushGateway and visualized in a Grafana k6
dashboard, so performance/SLO regressions are measurable and historical. All service endpoints,
environment switches, and test-type stages are centralized in one config file.

## Where it lives

`tests/k6/`:
- Per-service tests: `catalog-test.js`, `basket-test.js`, `ordering-test.js`, `discount-test.js`,
  `gateway-smoke-test.js`.
- Profiles / workflows: `stress-test.js`, `spike-test.js`, `soak-test.js`,
  `verify-failures-test.js`, `workflow-shopping.js`, `workflow-website.js`.
- Config: `config.js` — `SERVICES`, `ENV`, `TEST_TYPES`, plus `getServiceUrl`/`getEndpoint`/
  `getTestableServices`/`createTags` helpers.
- Runner scripts: `run-all-tests.sh`, `run-load-test.sh`, `push-metrics.sh`, `push-only.sh`,
  `setup-and-run.sh`, `smart-port-forward.sh`, `run-with-gateway.sh`, `run-website-gateway.sh`,
  `run-website-workflow.sh`, `update-grafana-dashboard.sh`.
- Docs: `README.md`, `QUICK-START-GUIDE.md`, `ADVANCED-SCENARIOS.md`, `AWS-GATEWAY-MIGRATION.md`.

## Tech stack

- k6 (JavaScript test scripts using k6's `http`/`check`/`Trend`/stages model).
- Bash runner scripts (`set -e`, color-coded) that orchestrate `k6 run`, port-forwards, and metric
  pushes; use `curl` + `jq` to format/push Prometheus exposition text.
- Prometheus PushGateway for metric persistence; Grafana for visualization.

## Build / run / test

```bash
# One-time monitoring port-forwards
kubectl port-forward -n monitoring svc/prometheus-pushgateway 9091:9091 &
kubectl port-forward -n monitoring svc/prometheus-server 9090:80 &

k6 run tests/k6/catalog-test.js                       # single test
USE_GATEWAY=false ./tests/k6/run-all-tests.sh         # all tests via port-forward (~300 VU cap)
GATEWAY_URL="https://<elb>..." ./tests/k6/run-all-tests.sh   # all tests via AWS gateway (high VU)
./tests/k6/push-metrics.sh stress                     # run a profile and push metrics to PushGateway
```

`run-all-tests.sh` auto-creates the PushGateway port-forward if `:9091` isn't reachable. Per-service
port-forward targets: catalog `8081`, basket `8082`, ordering `8083`, discount `8084` (gRPC).

## Configuration

All in `config.js` (overridable via `__ENV`):
- `SERVICES` — per-service `k8sService`, `port`, `k8sPort`, `namespace`, and `endpoints` vs
  `gatewayEndpoints` (port-forward paths carry `/api/v1`, gateway paths don't).
- `ENV` — `USE_GATEWAY` (defaults to **true** unless set to `false`), `NAMESPACE` (default `dev`),
  `PROMETHEUS_URL` (`http://localhost:9090`), `PUSHGATEWAY_URL` (`http://localhost:9091`),
  `GATEWAY_URL`/`AWS_GATEWAY_URL` (default `http://localhost:8010`), `DEPLOYMENT_ENV`.
- `TEST_TYPES` — `smoke`/`load`/`stress`/`spike`/`soak` stages + thresholds; `stress` branches its
  stages on `useGateway` (up to 500 VUs gateway vs 300 port-forward).
- Push scripts — `JOB_NAME` (default `k6-load-test`), `NAMESPACE`, `PUSHGATEWAY_URL`
  (`push-metrics.sh`).

## Interfaces & contracts

- Targets: each service's REST endpoints and the API gateway routes (built by `getEndpoint`,
  gateway vs port-forward mode).
- Metrics pushed to the PushGateway (`push-metrics.sh`/`push-only.sh`): `k6_http_req_duration_avg`,
  `k6_http_req_duration_p95`, `k6_http_req_duration_max`, `k6_http_reqs_total`,
  `k6_http_req_failed_total`, `k6_vus`, `k6_iterations_total`, `k6_data_received_bytes`,
  `k6_data_sent_bytes` — tagged with `service`, `test_type`, `namespace` (via `createTags`).
- Discount is gRPC-only: `getTestableServices()` returns only `['catalog','basket','ordering']`
  and `push-metrics.sh` explicitly skips the discount service.

## Data & state

- Run summaries: JSON written to `/tmp/k6-results-<timestamp>/` by `run-all-tests.sh`
  (`--summary-export`), plus per-test `.log` files.
- Metrics persisted in Prometheus via the PushGateway (job `k6-load-test`); visualized by the
  Grafana k6 dashboards (repo-root `monitoring/grafana/k6-dashboard.json`,
  `Deployments/monitoring/grafana-dashboard-k6.json`).

## Dependencies

- Needs a running target: the API gateway (AWS gateway mode) or service port-forwards
  (port-forward mode), plus the monitoring stack — PushGateway (`:9091`), Prometheus (`:9090`),
  and Grafana (`:3000`) — see the repo-root [`monitoring/CLAUDE.md`](../../monitoring/CLAUDE.md).
- Needs `k6`, `curl`, and `jq` installed.
- Depends on the repo `scripts/`/`Deployments` to stand up the cluster, and feeds the `monitoring` dashboards.

## Patterns

- Centralize everything in `config.js` — add a service or tune a profile there, not scattered
  across test files.
- Tag consistently with `service`/`test_type`/`namespace` and push to the PushGateway so Grafana
  can filter (`createTags`, `push-metrics.sh`).
- Thresholds encode SLOs (p95 latency, error rate) and **fail the run** when exceeded
  (`TEST_TYPES` in `config.js`) — tune them deliberately rather than deleting to make a run pass.

## Gotchas

- Port-forward mode caps around ~300 VUs (forwards crash above that) — use AWS gateway mode for
  real stress tests (`USE_GATEWAY` default is true for exactly this reason).
- Requires the PushGateway (`:9091`) for metric persistence; TLS verification is disabled for
  self-signed certs.
- Workflow tests (`workflow-shopping.js`, `workflow-website.js`) need realistic data (valid product
  IDs / usernames) to be meaningful.
- Gateway vs port-forward use different paths (`/api/v1/...` vs gateway routes) — handled by
  `getEndpoint`; don't hardcode paths in new tests.

## Owners / agents

- `performance-benchmarker` — owns load/stress/soak profiles, thresholds, and SLOs.
- `api-tester` — owns endpoint coverage and per-service test correctness.
