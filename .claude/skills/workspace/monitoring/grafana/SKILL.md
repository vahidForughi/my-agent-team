---
name: grafana
description: Grafana dashboards-as-code, Kubernetes provisioning, and Bash deploy scripts for the e-commerce platform observability layer.
paths:
  - monitoring/grafana/**/*
metadata:
  part-dir: monitoring/grafana
---

The grafana part holds every artifact needed to provision and operate Grafana dashboards for the e-commerce platform: three e-commerce dashboard JSON files (service metrics, business metrics, performance), their Kubernetes ConfigMap + provider provisioning YAML, a Bash deploy script that drives the Grafana HTTP API, and separate k6 load-test dashboard assets.

## Key files to read first

- `monitoring/grafana/deploy-enhanced-dashboards.sh` — the single entry point that provisions Prometheus + Loki datasources, creates the "E-Commerce" folder, and pushes the three e-commerce dashboards via `curl` against `http://localhost:3000/api`.
- `monitoring/grafana/dashboards/ecommerce-service-metrics.json` — service-level HTTP request metrics (rate, P95, error rate, per-service, per-endpoint).
- `monitoring/grafana/dashboards/ecommerce-business-metrics.json` — business metrics (orders, revenue, users).
- `monitoring/grafana/dashboards/ecommerce-performance-dashboard.json` — performance-level metrics (database, cache, resource utilization).
- `monitoring/grafana/dashboard-provider-enhanced.yaml` — Kubernetes ConfigMap wrapping the Grafana dashboard provider pointed at `/var/lib/grafana/dashboards/ecommerce-enhanced-service-metrics`.
- `monitoring/grafana/dashboards-configmap.yaml` — Kubernetes ConfigMap wrapping the default Grafana provider pointed at `/etc/grafana/provisioning/dashboards`.
- `monitoring/grafana/k6-dashboard-clean.yaml` — ConfigMap with the full k6 load-testing dashboard JSON embedded (12 panels: VUs, RPS, P95/P99 response time, error rate, heatmap, data transfer, status codes, check pass rate, iteration duration, system resources, summary table, endpoint table).
- `monitoring/grafana/test-k6-provider.yaml` — ConfigMap wrapping a Grafana provider for the k6 dashboard, folder `Test`, path `/var/lib/grafana/dashboards/test-k6`.
- `monitoring/grafana/dashboards/ecommerce-service-metrics-provisioning.yaml` — multi-document YAML that defines the `ecommerce-enhanced-service-metrics` ConfigMap with the service-metrics dashboard embedded, plus a duplicate of `dashboard-provider-enhanced.yaml`.

## Top patterns

- **Dashboards-as-code**: All dashboard definitions live as JSON files under `monitoring/grafana/dashboards/`. Each file is wrapped as `{ "dashboard": { ... } }`. `deploy-enhanced-dashboards.sh` extracts `.dashboard` with `jq -c '.dashboard'` before posting to the Grafana API.
- **Two provisioning paths**: (1) Bash script via Grafana HTTP API (`deploy-enhanced-dashboards.sh`) for imperative provisioning; (2) Kubernetes ConfigMap + provider YAML for declarative provisioning via `kubectl apply`.
- **Prometheus datasource URL**: Must be `http://prometheus-server.monitoring.svc.cluster.local:80` — this cluster DNS address is hardcoded in `setup_data_sources` and is the canonical fix for "Grafana can't reach Prometheus".
- **Deploy script functions**: `check_grafana_connection`, `setup_data_sources`, `create_folder`, `deploy_dashboard`, `main` — `main` calls them in order and uses `set -e`.

## Gotchas

- Prometheus datasource URL must use cluster DNS, not `localhost`.
- Grafana must be port-forwarded (`kubectl port-forward -n istio-system svc/grafana 3000:3000`) before running the deploy script.
- `curl` and `jq` are hard required; the script aborts with `exit 1` if either is absent.
- k6 dashboards display nothing unless k6 is pushing metrics to the PushGateway (see `tests/k6`).
- ConfigMap-provisioned dashboards require a Grafana pod restart to appear.
- `grafana-backup-*.yaml` and `grafana-deployment-backup-*.yaml` at repo root are timestamped snapshot artifacts — not source of truth, not applied by any script.
- `monitoring/grafana/` (dashboards-as-code) is distinct from `Deployments/monitoring/` (Helm values + Kubernetes manifests for the monitoring stack itself).

## Full onboarding doc

[`monitoring/grafana/AGENT.md`](../../../../monitoring/grafana/AGENT.md)
