# monitoring — Grafana Dashboards & Provisioning (root)

## What & why

The repo-root monitoring assets: Grafana dashboards-as-code (business / performance / service
metrics), their provisioning configmaps/providers, the k6 result dashboards, and the canonical
Prometheus-datasource fix. They exist so the running cluster's observability (dashboards +
datasource wiring) is version-controlled and reproducible instead of hand-edited in live Grafana.
This is distinct from `Deployments/monitoring/` (Helm values / raw K8s for the monitoring stack
itself) — know which location you are changing.

## Where it lives

`monitoring/grafana/`:
- `dashboards/` — `ecommerce-business-metrics.json`, `ecommerce-performance-dashboard.json`,
  `ecommerce-service-metrics.json` plus the provisioning sidecar `ecommerce-service-metrics-provisioning.yaml`.
- `deploy-enhanced-dashboards.sh` — deploys the three e-commerce dashboards via the Grafana HTTP API.
- `dashboards-configmap.yaml`, `dashboard-provider-enhanced.yaml` — ConfigMap + provider that
  provision dashboards into Grafana.
- `k6-dashboard.json`, `k6-dashboard-clean.yaml`, `test-dashboard.json`, `test-k6-provider.yaml` —
  k6 load-test result dashboards and their providers.

Repo root: auto-generated snapshots `grafana-backup-*.yaml` and `grafana-deployment-backup-*.yaml`.

Helper scripts (in `scripts/`): `scripts/validate-grafana.sh`, `scripts/setup-grafana.sh`,
`scripts/monitoring/validate-grafana-fix.sh`, `scripts/monitoring/check-grafana-prometheus-health.sh`,
`scripts/monitoring/setup-grafana-prometheus-connection.sh`.

## Tech stack

- Grafana dashboards-as-code: dashboard JSON (Grafana schema, wrapped as `{ "dashboard": {...} }`,
  see `dashboards/*.json`).
- Provisioning via Kubernetes ConfigMaps + Grafana dashboard providers (YAML —
  `dashboards-configmap.yaml`, `dashboard-provider-enhanced.yaml`, `test-k6-provider.yaml`).
- Bash deploy/validation scripts (`deploy-enhanced-dashboards.sh`, `set -e`) driving the Grafana
  HTTP API with `curl` + `jq` (both required — the script aborts if missing).
- Datasources: Prometheus (primary) and Loki (logs), created by `deploy-enhanced-dashboards.sh`.

## Build / run / test

```bash
# Prereq: Grafana reachable at localhost:3000
kubectl port-forward -n istio-system svc/grafana 3000:3000 &

# Provision datasources + create the E-Commerce folder + push the 3 dashboards (needs curl + jq)
bash monitoring/grafana/deploy-enhanced-dashboards.sh

# Validate the Prometheus datasource fix / connectivity
bash scripts/validate-grafana.sh
bash scripts/monitoring/validate-grafana-fix.sh
bash scripts/monitoring/check-grafana-prometheus-health.sh
```

Grafana default port is `3000`; `deploy-enhanced-dashboards.sh` logs in as `admin` /
`prom-operator` against `http://localhost:3000/api`.

## Configuration

- Grafana endpoint/creds — `deploy-enhanced-dashboards.sh`: `GRAFANA_URL=http://localhost:3000`,
  `GRAFANA_USER=admin`, `GRAFANA_PASSWORD=prom-operator`, `DASHBOARDS_DIR=$(dirname)/dashboards`.
- Prometheus datasource URL — must use cluster service DNS
  `http://prometheus-server.monitoring.svc.cluster.local:80` (set in `setup_data_sources` of
  `deploy-enhanced-dashboards.sh`); **not** `localhost`. This is the "permanent fix".
- Loki datasource URL — `http://loki.monitoring.svc.cluster.local:3100` (same script).
- Dashboard set deployed — the `dashboard_files` array in `deploy-enhanced-dashboards.sh`
  (`ecommerce-service-metrics.json`, `ecommerce-business-metrics.json`,
  `ecommerce-performance-dashboard.json`).

## Interfaces & contracts

- Exposes Grafana dashboards (the three `ecommerce-*` dashboards plus the k6 dashboards) and the
  Prometheus + Loki datasource definitions.
- Consumes metrics from Prometheus (service/business/performance metrics scraped in-cluster) and
  k6 load-test metrics pushed via the PushGateway (`k6_http_req_duration_*`, `k6_http_reqs_total`,
  `k6_http_req_failed_total`, …) — see `tests/k6` ([`tests/k6/CLAUDE.md`](../tests/k6/CLAUDE.md)).
- Artifact contract: dashboards are the `{ "dashboard": {...} }`-wrapped JSON files under
  `dashboards/`; provider YAML points Grafana at the provisioned ConfigMap.

## Data & state

- Dashboards-as-code JSON lives in `monitoring/grafana/dashboards/` (source of truth).
- Live Grafana state (created datasources, "E-Commerce" folder, imported dashboards) is derived —
  reproduce it by re-running `deploy-enhanced-dashboards.sh`.
- Timestamped `grafana-backup-*.yaml` / `grafana-deployment-backup-*.yaml` at repo root are
  snapshot artifacts, **not** source of truth.

## Dependencies

- Depends on a running Grafana (`istio-system/grafana`, port 3000) and an in-cluster
  Prometheus (`prometheus-server.monitoring`); Loki optional for logs.
- Depends on `curl` + `jq` for the deploy script.
- Depended on by `tests/k6` (k6 dashboards visualize pushed metrics) and the broader
  observability story alongside Jaeger (tracing) and Kiali (mesh) — see
  [`Deployments/istio/CLAUDE.md`](../Deployments/istio/CLAUDE.md).

## Patterns

- Dashboards-as-code: edit JSON in `monitoring/grafana/dashboards/` and provision via the
  configmap/provider YAML; never edit live Grafana directly (established in
  `dashboard-provider-enhanced.yaml` + `deploy-enhanced-dashboards.sh`).
- The cluster-DNS Prometheus URL is the canonical answer to "Grafana can't reach Prometheus"
  (`setup_data_sources` in `deploy-enhanced-dashboards.sh`).

## Gotchas

- Prometheus datasource URL must be the cluster service DNS, not `localhost`.
- Grafana needs a restart after ConfigMap changes for new dashboards to appear.
- Root `grafana-*backup-*.yaml` files are timestamped snapshots — artifacts, not canonical config.
- k6 dashboards show nothing unless metrics are pushed via the PushGateway (`tests/k6`).
- Two monitoring locations exist (`monitoring/` here vs `Deployments/monitoring/`); confirm which
  one you mean before editing.

## Owners / agents

- `sre` — owns observability, dashboards, and the Prometheus datasource fix.
- `devops-automator` — owns the provisioning scripts and ConfigMap/provider wiring.
