# Codebase Orientation Map — k6 Load & Performance Tests

## 1-Line Summary

k6 load/stress/spike/soak and end-to-end workflow tests for the backend services and the API gateway, with results pushed to Prometheus via PushGateway and visualized in Grafana.

## 5-Minute Explanation

- **Primary tasks in code**: Running five load profiles (smoke, load, stress, spike, soak) against three HTTP services (catalog, basket, ordering) and two end-to-end workflow simulations (shopping journey, website flow); skipping the discount service because it is gRPC-only.
- **Primary inputs**: Environment variables (`USE_GATEWAY`, `GATEWAY_URL`/`AWS_GATEWAY_URL`, `NAMESPACE`, `PUSHGATEWAY_URL`, `PROMETHEUS_URL`) and optionally direct `k6 run <file>` invocations.
- **Primary outputs**: Console metric summaries, JSON summary exports to `/tmp/k6-results-<timestamp>/`, and Prometheus exposition text POSTed to the PushGateway at `/metrics/job/k6-load-test/instance/<test_name>`.
- **Key files**:
  - `tests/k6/config.js` — all service definitions, environment constants, test-type stage/threshold configs, and URL-builder helpers
  - `tests/k6/run-all-tests.sh` — primary orchestrator that sequences all service, workflow, and load tests
  - `tests/k6/push-metrics.sh` — runs a named test type and pushes its JSON summary to PushGateway
  - `tests/k6/catalog-test.js`, `basket-test.js`, `ordering-test.js` — per-service 10 VU / 30 s baseline tests
  - `tests/k6/stress-test.js`, `spike-test.js`, `soak-test.js` — load-profile tests using `TEST_TYPES` stages from `config.js`
  - `tests/k6/workflow-shopping.js` — 5-step browsing + basket + order-history workflow
  - `tests/k6/workflow-website.js` — 8-step website simulation with realistic headers, `CreateBasket`, `CheckoutV2`, retry on 429
  - `tests/k6/gateway-smoke-test.js` — 10 VU / 30 s multi-service smoke test against the gateway
- **Main code paths**:
  1. Shell script sets `USE_GATEWAY`, `GATEWAY_URL`, `PUSHGATEWAY_URL` env vars
  2. `k6 run <test-file>` is called; the test file imports `config.js`
  3. `getEndpoint(service, endpoint, ...args)` in `config.js` selects gateway vs. port-forward path
  4. `http.get`/`http.post` fires requests; `check` validates responses
  5. `handleSummary` logs results to stdout; `run-all-tests.sh` calls `push-only.sh` with the JSON file
  6. `push-metrics.sh` or `push-only.sh` POSTs Prometheus exposition text to PushGateway

## Deep Dive

- **Type**: Performance testing suite (JavaScript / k6 + Bash orchestration)
- **Primary runtime(s)**: k6 (JavaScript ES6 modules), Bash
- **Entry points**:
  - `tests/k6/run-all-tests.sh`: sequences all service tests, workflow tests, and load-profile tests; auto-starts PushGateway port-forward if `:9091` is unreachable
  - `tests/k6/push-metrics.sh`: accepts a test-type argument (`service`, `spike`, `soak`, `stress`, `all`) and delegates to `run_k6_test` + `push_metrics_to_gateway`
  - Direct `k6 run tests/k6/<file>.js`: runs a single test file standalone

## Top-Level Structure

| Path | Purpose | Notes |
|------|---------|-------|
| `tests/k6/config.js` | Central configuration | `SERVICES`, `ENV`, `TEST_TYPES`; exports `getServiceUrl`, `getEndpoint`, `getTestableServices`, `createTags` |
| `tests/k6/catalog-test.js` | Catalog service baseline test | 10 VU / 30 s; `GET /api/v1/Catalog/GetAllProducts` or `/Catalog/GetAllProducts` |
| `tests/k6/basket-test.js` | Basket service baseline test | 10 VU / 30 s; `GET /api/v1/Basket/GetBasket/testuser` or `/Basket/GetBasket/testuser` |
| `tests/k6/ordering-test.js` | Ordering service baseline test | 10 VU / 30 s; `GET /api/v1/Order/testuser` or `/Order/testuser` |
| `tests/k6/discount-test.js` | Discount service placeholder | gRPC-only; always skipped with a `check` that passes trivially |
| `tests/k6/gateway-smoke-test.js` | Multi-service gateway smoke | 10 VU / 30 s; random service selection; `handleSummary` prints request/latency/error summary |
| `tests/k6/stress-test.js` | Stress load profile | Uses `TEST_TYPES.stress.stages` (gateway: 100→300→500 VU; port-forward: 100→200→300 VU); `handleSummary` |
| `tests/k6/spike-test.js` | Spike load profile | Uses `TEST_TYPES.spike.stages` (2→100→2 VU); 90 s HTTP timeout |
| `tests/k6/soak-test.js` | Soak load profile | Uses `TEST_TYPES.soak.stages` (20 VU steady, 11 min); round-robin service rotation; degradation analysis in `handleSummary` |
| `tests/k6/verify-failures-test.js` | Failure-generation test | Ramps to 400 VU; 50% failure threshold; used for dashboard verification |
| `tests/k6/workflow-shopping.js` | E-commerce shopping journey | 5 steps: browse catalog, product detail, add to basket (GET), view basket, view order history; custom `workflow_duration`/`workflow_success`/`workflow_failed` metrics |
| `tests/k6/workflow-website.js` | Full website simulation | 8 steps: landing, browse, search, product detail, add to cart (POST `CreateBasket`), view cart, checkout (`CheckoutV2` with exponential backoff on 429), order confirmation; uses `ramping-vus` executor |
| `tests/k6/run-all-tests.sh` | Primary orchestrator | Sequences service → workflow → load tests; saves JSON + logs to `/tmp/k6-results-<timestamp>/`; calls `push-only.sh` per result |
| `tests/k6/push-metrics.sh` | Runner + metric pusher | Accepts test-type arg; runs k6 with `--summary-export`; extracts metrics with `jq`; POSTs Prometheus exposition text to PushGateway |
| `tests/k6/push-only.sh` | Metric-only pusher | Reads existing JSON summary; pushes to PushGateway without re-running k6 |
| `tests/k6/run-load-test.sh` | Load-profile runner | Runs a specific load profile by name |
| `tests/k6/setup-and-run.sh` | Setup + run helper | Sets up prerequisites and runs tests |
| `tests/k6/smart-port-forward.sh` | Port-forward manager | Sets up kubectl port-forwards for all services and monitoring |
| `tests/k6/run-with-gateway.sh` | Gateway mode runner | Convenience wrapper for AWS gateway mode |
| `tests/k6/run-website-gateway.sh` | Website gateway runner | Runs website workflow via AWS gateway |
| `tests/k6/run-website-workflow.sh` | Website workflow runner | Runs `workflow-website.js` |
| `tests/k6/update-grafana-dashboard.sh` | Dashboard update helper | Updates the Grafana k6 dashboard |
| `tests/k6/README.md` | User-facing guide | Setup, quick-start, troubleshooting, benchmarks |
| `tests/k6/QUICK-START-GUIDE.md` | Quick start doc | Condensed setup steps |
| `tests/k6/ADVANCED-SCENARIOS.md` | Advanced usage doc | Custom scenarios and patterns |
| `tests/k6/AWS-GATEWAY-MIGRATION.md` | Migration doc | Notes on switching from port-forward to AWS gateway mode |

## Key Boundaries

- **Presentation**: `handleSummary` functions in each test file — format and print results to stdout
- **Application/Domain**: The `.js` test files — define VU behavior, HTTP calls, checks, and custom metrics
- **Persistence/External I/O**:
  - JSON summary files written to `/tmp/k6-results-<timestamp>/` via `--summary-export`
  - Prometheus exposition text POSTed to `http://localhost:9091/metrics/job/k6-load-test/instance/<test_name>` via `curl`
  - Grafana dashboard JSON at `monitoring/grafana/k6-dashboard.json` and `Deployments/monitoring/grafana-dashboard-k6.json`
- **Cross-cutting concerns**: `config.js` — single file for all service URLs, environment switches, load profiles, thresholds, and metric tagging

### Responsibilities by file

| File | Responsibility |
|------|---------------|
| `config.js` | Service registry (`SERVICES`), ENV constants, `TEST_TYPES` stages + thresholds, `getServiceUrl`, `getEndpoint`, `getTestableServices`, `createTags` |
| `catalog-test.js` | 10 VU baseline for catalog `getAllProducts`; checks status 200 and latency < 500 ms |
| `basket-test.js` | 10 VU baseline for basket `getBasket`; accepts 200 or 204 |
| `ordering-test.js` | 10 VU baseline for ordering `getOrders`; accepts 200 or 404 |
| `discount-test.js` | Placeholder stub; always passes trivially; gRPC not implemented |
| `gateway-smoke-test.js` | Randomly selects a testable service per iteration; custom `handleSummary` |
| `stress-test.js` | Multi-service stress using `TEST_TYPES.stress.stages`; random service selection; `batch: 10` |
| `spike-test.js` | Multi-service spike using `TEST_TYPES.spike.stages`; 90 s HTTP timeout; `batch: 10` |
| `soak-test.js` | Round-robin service rotation; per-request timing snapshots; degradation analysis in `handleSummary` |
| `verify-failures-test.js` | Intentional high-VU test (400) to generate failures for dashboard verification |
| `workflow-shopping.js` | 5-step shopping journey; custom `Trend`/`Counter` metrics; `setup`/`teardown`; `noAPIServer: true` |
| `workflow-website.js` | 8-step website simulation; `ramping-vus` scenario; real browser headers; `CreateBasket` POST; `CheckoutV2` with retry + exponential backoff on HTTP 429 |
| `run-all-tests.sh` | Main orchestrator; verifies PushGateway reachability; calls `push-only.sh` after each test |
| `push-metrics.sh` | Runner with `jq` metric extraction; formats Prometheus exposition text; POSTs to PushGateway |

### Detailed code flows

#### Flow 1: Single service baseline test

1. `k6 run tests/k6/catalog-test.js` is executed.
2. k6 loads `catalog-test.js`, which imports `SERVICES`, `getEndpoint`, `createTags` from `config.js`.
3. `options` sets 10 VUs for 30 s; `createTags(SERVICES.catalog.name)` adds `{service: 'catalog', namespace: 'dev'}` tags to the test run.
4. Each VU iteration calls `getEndpoint('catalog', 'getAllProducts')` — if `ENV.useGateway` is true, returns `${gatewayUrl}/Catalog/GetAllProducts`; otherwise returns `http://localhost:8081/api/v1/Catalog/GetAllProducts`.
5. `http.get` fires the request; `check` asserts `status === 200` and `timings.duration < 500`.
6. k6 prints the built-in summary on exit.

#### Flow 2: run-all-tests.sh full suite

1. `run-all-tests.sh` reads `USE_GATEWAY`, `GATEWAY_URL`, `PUSHGATEWAY_URL` from environment (defaults to gateway mode).
2. Checks PushGateway at `$PUSHGATEWAY_URL/metrics`; if unreachable, starts `kubectl port-forward -n monitoring svc/prometheus-pushgateway 9091:9091`.
3. For each test (catalog → basket → ordering → gateway-smoke → workflow-shopping → stress → spike → soak):
   a. Calls `k6 run --summary-export="$json_file" <test_file>` and tees output to a `.log` file.
   b. On success, calls `push-only.sh "$json_file" "$test_name"` to POST metrics to PushGateway.
4. Saves all JSON and log files to `/tmp/k6-results-<timestamp>/`.

#### Flow 3: push-metrics.sh with metric push

1. `push-metrics.sh stress` is called.
2. Verifies k6, jq, and PushGateway availability.
3. Calls `run_k6_test stress-test.js stress` → runs `k6 run --summary-export=/tmp/k6-stress-<ts>.json stress-test.js`.
4. Calls `push_metrics_to_gateway stress /tmp/k6-stress-<ts>.json`.
5. Extracts metrics via `jq` (avg, p95, max duration; req count; failure count; VUs; iterations; bytes sent/received).
6. POSTs Prometheus exposition text to `$PUSHGATEWAY_URL/metrics/job/k6-load-test/instance/stress` using `curl`.

#### Flow 4: workflow-website.js checkout path

1. `setup()` initializes counters; returns `gatewayUrl`, `websiteOrigin`, `userAgent`.
2. Each VU executes 8 `group` steps with realistic browser headers via `getWebsiteHeaders(data)`.
3. Step 5 (`Add_to_Cart_Website`) fetches a product from `GET /Catalog/GetAllProducts`, then POSTs to `POST /Basket/CreateBasket` with a payload that includes `userName`, `items[].productId`, `items[].price`.
4. Step 7 (`Checkout_Process`) calls `GET /Basket/GetBasket/${userId}` to read cart total, then POSTs to `POST /Basket/CheckoutV2`; retries up to 5 times with exponential backoff (starting 1 s, max 10 s) on HTTP 429.
5. `workflowDuration.add(duration)` is called; `workflowSuccess` or `workflowFailed` counter is incremented.
6. `handleSummary` returns `JSON.stringify(data)` to stdout; `teardown` prints the performance breakdown.

### How the pieces map together

`config.js` is the single source of truth for service topology. Every test file imports from it. The `getEndpoint` function is the only place that decides whether to use gateway paths (no `/api/v1` prefix) or port-forward paths (with `/api/v1`). Shell scripts are pure orchestrators — they set env vars, call `k6 run`, and call `push-only.sh` or inline `push_metrics_to_gateway`. The PushGateway decouples test execution from the Prometheus scrape cycle; Grafana queries Prometheus, not the test files.

The `createTags` function ensures every request carries `{service, namespace}` labels (plus optional `test_type`), which allows Grafana panels to filter by service and test type.

### Files inspected

- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/config.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/catalog-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/basket-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/ordering-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/discount-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/gateway-smoke-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/stress-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/spike-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/soak-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/verify-failures-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/workflow-shopping.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/workflow-website.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/run-all-tests.sh`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/push-metrics.sh`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/README.md`
