---
name: monitoring
description: Observability layer for the e-commerce platform — Grafana dashboards-as-code, Kubernetes provisioning YAML, and Bash deploy scripts for service, business, performance, and k6 load-test metrics.
paths:
  - monitoring/**/*
metadata:
  part-dir: monitoring
---

The monitoring part is the observability root for the cloud-native e-commerce platform. It contains everything needed to provision and operate Grafana: dashboard JSON files (dashboards-as-code), Kubernetes ConfigMaps and provider YAML for declarative provisioning, a Bash deploy script for imperative provisioning via the Grafana HTTP API, and k6 load-test dashboard assets.

## Subparts

| Part | Dir | Role |
|------|-----|------|
| grafana | `monitoring/grafana/` | Dashboard JSON, provisioning YAML, deploy script — all Grafana assets |

## Key files to read first

- `monitoring/grafana/deploy-enhanced-dashboards.sh` — entry point: provisions Prometheus + Loki datasources, creates the "E-Commerce" folder, and pushes three e-commerce dashboards to a running Grafana instance via `curl`.
- `monitoring/grafana/dashboards/` — source of truth for all dashboard definitions (`ecommerce-service-metrics.json`, `ecommerce-business-metrics.json`, `ecommerce-performance-dashboard.json`).
- `monitoring/grafana/dashboard-provider-enhanced.yaml` — Kubernetes ConfigMap wrapping the Grafana provider for the enhanced service-metrics dashboard.
- `monitoring/grafana/dashboards-configmap.yaml` — Kubernetes ConfigMap wrapping the default Grafana provider.
- `monitoring/grafana/k6-dashboard-clean.yaml` — k6 load-test dashboard embedded in a ConfigMap (12 panels).
- `monitoring/grafana/test-k6-provider.yaml` — Grafana provider ConfigMap for the k6 dashboard, folder `Test`.

## How it fits in the platform

- Consumes metrics from Prometheus (`prometheus-server.monitoring.svc.cluster.local:80`) and optionally Loki (`loki.monitoring.svc.cluster.local:3100`).
- Visualizes k6 load-test results pushed by `tests/k6` via the PushGateway.
- Complements Jaeger (distributed tracing) and Kiali (service mesh visibility) — see `Deployments/istio/`.
- Distinct from `Deployments/monitoring/` which holds Helm values and raw Kubernetes manifests for the Prometheus/Grafana stack installation itself.

## Top patterns

- **Dashboards-as-code**: edit JSON under `monitoring/grafana/dashboards/`, provision via ConfigMap/provider or re-run `deploy-enhanced-dashboards.sh`. Never edit live Grafana directly.
- **Cluster DNS for Prometheus**: `http://prometheus-server.monitoring.svc.cluster.local:80` — not `localhost`.

## Gotchas

- Two monitoring locations: `monitoring/` (this part, dashboards-as-code) vs `Deployments/monitoring/` (Helm/K8s stack). Confirm which you mean before editing.
- `grafana-backup-*.yaml` and `grafana-deployment-backup-*.yaml` at repo root are timestamped snapshot artifacts — not source of truth.
- k6 dashboards show nothing unless metrics are pushed via the PushGateway.
- ConfigMap-provisioned dashboards require a Grafana restart to appear.

## Full onboarding doc

[`monitoring/AGENT.md`](../../../monitoring/AGENT.md)
