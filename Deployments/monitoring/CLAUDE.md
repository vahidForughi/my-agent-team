# monitoring — In-Cluster Monitoring (Deployments)

## What & why

The monitoring assets that ship with the deployment layer: Grafana provisioning, a permanent
Grafana→Prometheus connection fix, and the k6 load-test dashboard used when the stack runs
in-cluster. It exists so dashboards and datasource wiring are reproducible from git rather than
clicked together in the live Grafana UI.

## Where it lives

`Deployments/monitoring/`:
- `grafana/grafana-configmap-fixed.yaml` — permanent fix wiring Grafana to Prometheus.
- `grafana/prometheus-service-alias.yaml` — service alias for Prometheus backward compatibility.
- `grafana/grafana-helm-values.yaml` — Helm values for future Grafana deployments.
- `grafana-dashboard-k6.json` — k6 load-test dashboard.
- `README.md` — fix rationale and manual-apply steps.

> Distinct from the repo-root [`monitoring/CLAUDE.md`](../../monitoring/CLAUDE.md) part (`monitoring/`), which
> holds the broader Grafana dashboards/provisioning and the permanent Prometheus-datasource fix.
> Deploy-time Prometheus/Grafana also live in [`helm/CLAUDE.md`](../helm/CLAUDE.md) (`prometheus/` chart) and
> [`k8s/CLAUDE.md`](../k8s/CLAUDE.md) (`monitoring/`).

## Tech stack

Grafana + Prometheus, configured as Kubernetes ConfigMaps/Services and JSON dashboards. Grafana
itself is deployed via the `prometheus` Helm chart / `k8s/monitoring` manifests; this directory
supplies its provisioning data and the datasource fix.

## Build / run / test

Grafana/Prometheus are deployed by the Helm `prometheus` chart and `k8s/monitoring` manifests; this
dir's fixes are applied by `scripts/deploy/deploy.sh` automatically. Manual application:

```bash
kubectl apply -f Deployments/monitoring/grafana/grafana-configmap-fixed.yaml
kubectl rollout restart deployment/grafana -n istio-system   # pick up provisioning changes
kubectl apply -f Deployments/monitoring/grafana/prometheus-service-alias.yaml

# View:
kubectl port-forward -n monitoring svc/prometheus-server 9090:80 &
kubectl port-forward -n istio-system svc/grafana 3000:3000 &
```

## Configuration

- `grafana/grafana-configmap-fixed.yaml` — sets the Prometheus datasource URL to `http://prometheus-server.monitoring.svc.cluster.local:80` (the connection fix).
- `grafana/prometheus-service-alias.yaml` — Service alias so older datasource references still resolve.
- `grafana/grafana-helm-values.yaml` — values for deploying Grafana via Helm.
- `grafana-dashboard-k6.json` — dashboard JSON, provisioned into Grafana.

## Interfaces & contracts

- Exposes Grafana in the `istio-system` namespace (`svc/grafana:3000`) and consumes Prometheus in the `monitoring` namespace (`svc/prometheus-server:80`).
- Provides the k6 dashboard consumed by k6 load runs (see the repo-level [`tests`](../../tests/CLAUDE.md) k6 tests).
- Datasource contract: Grafana → Prometheus at `prometheus-server.monitoring.svc.cluster.local:80`.

## Data & state

No persistent storage owned here. Dashboards and datasource config are declarative (ConfigMaps/JSON
in git); Grafana/Prometheus runtime state lives in their own deployments under
[`helm/CLAUDE.md`](../helm/CLAUDE.md) / [`k8s/CLAUDE.md`](../k8s/CLAUDE.md).

## Dependencies

- Depends on Prometheus + Grafana being deployed by `helm/prometheus` and/or `k8s/monitoring`.
- The Prometheus service alias must resolve before the Grafana datasource fix is meaningful.
- Kept in sync with the repo-root [`monitoring/CLAUDE.md`](../../monitoring/CLAUDE.md) part and the `prometheus` Helm chart.

## Patterns

- Dashboards-as-code: edit dashboard JSON in git and let Grafana provision it — don't edit the live Grafana UI (changes wouldn't be reproducible).
- Keep this dir, root `monitoring/`, and `helm/prometheus` + `k8s/monitoring` aligned.

## Gotchas

- Three places touch monitoring (this dir, root `monitoring/`, and `helm/prometheus` + `k8s/monitoring`) — know which one you're changing.
- Grafana must be restarted (`rollout restart deployment/grafana -n istio-system`) to pick up ConfigMap/provisioning changes.
- Dashboard JSON must be valid (no trailing commas) or provisioning fails **silently**.

## Owners / agents

devops-automator (owns deploy-time monitoring config), sre (owns dashboards, alerting, datasource health).
