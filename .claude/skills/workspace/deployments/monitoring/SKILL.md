---
name: monitoring
description: Deploy-time monitoring assets — Grafana datasource fix (ConfigMap + ExternalName Service alias), Helm values for Grafana, and the k6 load-test dashboard JSON — provisioned declaratively from git.
paths:
  - Deployments/monitoring/**/*
metadata:
  part-dir: Deployments/monitoring
---

The `Deployments/monitoring` sub-part ships the monitoring configuration that must be applied on top of the Grafana + Prometheus stack deployed by `Deployments/helm/prometheus` or `Deployments/k8s/monitoring`. It does not deploy those components itself — it fixes the wiring and provisions dashboards.

This directory is distinct from the repo-root `monitoring/` part, which holds the broader Grafana dashboard collection and provisioning setup.

## Key files to read first

- `Deployments/monitoring/grafana/grafana-configmap-fixed.yaml` — the core fix: replaces the `grafana` ConfigMap in `istio-system` with the correct Prometheus URL (`http://prometheus-server.monitoring.svc.cluster.local:80`); also wires Loki and two Istio dashboard providers
- `Deployments/monitoring/grafana/prometheus-service-alias.yaml` — `ExternalName` Service named `prometheus` in `istio-system`, bridging to `prometheus-server.monitoring.svc.cluster.local:80`
- `Deployments/monitoring/grafana/grafana-helm-values.yaml` — Helm values for a fresh Grafana deploy: datasources (Prometheus + Loki), dashboard providers, resource limits (500m/512Mi), anonymous Admin auth, Istio injection disabled
- `Deployments/monitoring/grafana-dashboard-k6.json` — 485-line Grafana dashboard JSON titled "K6 Load Testing Metrics"; provisioned from git

## Manual apply sequence

```bash
kubectl apply -f Deployments/monitoring/grafana/grafana-configmap-fixed.yaml
kubectl rollout restart deployment/grafana -n istio-system   # required to pick up ConfigMap changes
kubectl apply -f Deployments/monitoring/grafana/prometheus-service-alias.yaml

# Access:
kubectl port-forward -n monitoring svc/prometheus-server 9090:80 &
kubectl port-forward -n istio-system svc/grafana 3000:3000 &
```

Automatic: `scripts/deploy/deploy.sh` applies these files during its deployment run.

## Datasource contract

- Grafana (`istio-system`, port 3000) → Prometheus (`monitoring`, `prometheus-server:80`)
- URL set in both `grafana-configmap-fixed.yaml` (`datasources.yaml` key) and `grafana-helm-values.yaml`
- `prometheus-service-alias.yaml` provides the `prometheus.istio-system.svc.cluster.local` alias for legacy references

## Critical constraints

- Grafana must be restarted (`rollout restart deployment/grafana -n istio-system`) after applying the ConfigMap or changes are not picked up.
- Dashboard JSON must be valid (no trailing commas) — provisioning failure is silent.
- Three places touch monitoring: this directory, repo-root `monitoring/`, and `helm/prometheus` + `k8s/monitoring` — know which one you are editing.
- Grafana 9.5.5 (per ConfigMap labels); anonymous Admin access is enabled — only appropriate for internal/local clusters.
- `sidecar.istio.io/inject: "false"` is set in the Helm values — do not remove it, or Grafana will get an Istio sidecar that can cause connectivity issues.
