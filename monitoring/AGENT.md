# Codebase Orientation Map — monitoring

## 1-Line Summary

This is the observability root of the cloud-native e-commerce platform: Grafana dashboards-as-code, Kubernetes provisioning YAML, and Bash deploy scripts for service, business, performance, and k6 load-test metrics.

## 5-Minute Explanation

- **Primary tasks in code**: Version-control and provision Grafana dashboards and datasources so the running cluster's observability is reproducible. Three e-commerce dashboards (service metrics, business metrics, performance) plus k6 load-test dashboards are defined as JSON and provisioned either imperatively via a Bash deploy script or declaratively via Kubernetes ConfigMaps and providers.
- **Primary inputs**: Dashboard JSON files, Kubernetes YAML manifests (ConfigMaps + providers), Bash script invocations with Grafana credentials and URL.
- **Primary outputs**: Provisioned Grafana datasources (Prometheus, Loki), an "E-Commerce" dashboard folder in Grafana, three imported e-commerce dashboards, and a k6 load-test dashboard.
- **Key files**:
  - `monitoring/grafana/deploy-enhanced-dashboards.sh` — imperative entry point
  - `monitoring/grafana/dashboards/` — source of truth for all dashboard JSON
  - `monitoring/grafana/dashboard-provider-enhanced.yaml` — K8s provider ConfigMap for the enhanced service-metrics dashboard
  - `monitoring/grafana/dashboards-configmap.yaml` — K8s default provider ConfigMap
  - `monitoring/grafana/k6-dashboard-clean.yaml` — k6 dashboard in a ConfigMap
  - `monitoring/grafana/test-k6-provider.yaml` — provider ConfigMap for k6 dashboard
- **Main code paths**:
  1. Imperative: `deploy-enhanced-dashboards.sh` → `check_grafana_connection` → `setup_data_sources` → `create_folder` → `deploy_dashboard` (×3).
  2. Declarative: `kubectl apply -f dashboards-configmap.yaml` + `dashboard-provider-enhanced.yaml` → Grafana polls mounted path every 10 s.

## Deep Dive

- **Type**: Observability infrastructure — dashboards-as-code and provisioning tooling.
- **Primary runtime(s)**: Bash, Kubernetes, Grafana HTTP API.
- **Entry points**:
  - `monitoring/grafana/deploy-enhanced-dashboards.sh`: `main` is the Bash entry point; invoked after port-forwarding Grafana to `localhost:3000`.
  - `monitoring/grafana/dashboards-configmap.yaml` + `monitoring/grafana/dashboard-provider-enhanced.yaml`: Kubernetes declarative entry points applied via `kubectl apply`.

## Top-Level Structure

| Path | Purpose | Notes |
|------|---------|-------|
| `monitoring/grafana/` | All Grafana assets | Dashboards, provisioning YAML, deploy script |
| `monitoring/grafana/dashboards/` | Dashboard JSON source of truth | Three e-commerce dashboards + provisioning sidecar YAML |
| `monitoring/grafana/deploy-enhanced-dashboards.sh` | Imperative provisioning | Requires `curl`, `jq`, `kubectl port-forward` to `localhost:3000` |
| `monitoring/grafana/dashboard-provider-enhanced.yaml` | Enhanced provider ConfigMap | Namespace `monitoring`, folder `E-Commerce` |
| `monitoring/grafana/dashboards-configmap.yaml` | Default provider ConfigMap | Namespace `monitoring`, folder empty |
| `monitoring/grafana/k6-dashboard-clean.yaml` | k6 load-test dashboard ConfigMap | Label `grafana_dashboard: "1"` |
| `monitoring/grafana/test-k6-provider.yaml` | k6 provider ConfigMap | Folder `Test` |

## Key Boundaries

- **Presentation**: Dashboard JSON files in `monitoring/grafana/dashboards/` — panels, PromQL queries, layouts rendered in Grafana.
- **Application/Domain**: `deploy-enhanced-dashboards.sh` Bash functions — orchestration of Grafana API calls (datasource creation, folder creation, dashboard upsert).
- **Persistence/External I/O**:
  - Grafana HTTP API at `http://localhost:3000/api` (port-forwarded from `istio-system/grafana`).
  - Prometheus at `http://prometheus-server.monitoring.svc.cluster.local:80`.
  - Loki at `http://loki.monitoring.svc.cluster.local:3100`.
  - Kubernetes API server (ConfigMap + provider declarative path).
- **Cross-cutting concerns**: All dashboards use `"timezone": "browser"` and `"refresh": "30s"`. All provider ConfigMaps use `updateIntervalSeconds: 10` and `allowUiUpdates: true`. The deploy script uses `set -e`.
- **Responsibilities by file/module**:
  - `deploy-enhanced-dashboards.sh`: `check_grafana_connection`, `setup_data_sources` (Prometheus + Loki), `create_folder` (E-Commerce), `deploy_dashboard` (upsert via search + PUT/POST).
  - `dashboards/*.json`: each wrapped as `{ "dashboard": { ... } }` with PromQL panels.
  - `dashboard-provider-enhanced.yaml`: ConfigMap `grafana-dashboard-provider-enhanced`, namespace `monitoring`, provider path `/var/lib/grafana/dashboards/ecommerce-enhanced-service-metrics`.
  - `dashboards-configmap.yaml`: ConfigMap `grafana-dashboards`, namespace `monitoring`, provider path `/etc/grafana/provisioning/dashboards`.
  - `k6-dashboard-clean.yaml`: ConfigMap `k6-dashboard`, namespace `monitoring`, label `grafana_dashboard: "1"`, 12 panels querying `k6_*` metrics.
  - `test-k6-provider.yaml`: ConfigMap `test-k6-provider`, namespace `monitoring`, provider path `/var/lib/grafana/dashboards/test-k6`.
- **Detailed code flows**:
  1. Operator runs `kubectl port-forward -n istio-system svc/grafana 3000:3000`.
  2. `bash monitoring/grafana/deploy-enhanced-dashboards.sh` starts; `set -e` aborts on first failure.
  3. `check_grafana_connection` — `GET /api/health` with basic auth; exits non-zero if unreachable.
  4. `setup_data_sources` — `GET /api/datasources/name/Prometheus`; if absent, `POST /api/datasources` with URL `http://prometheus-server.monitoring.svc.cluster.local:80`, `isDefault: true`. Repeats for Loki (`http://loki.monitoring.svc.cluster.local:3100`, `isDefault: false`).
  5. `create_folder` — `POST /api/folders` with `{ "name": "E-Commerce", "uid": "ecommerce" }`.
  6. For each file in `dashboard_files` array (`ecommerce-service-metrics.json`, `ecommerce-business-metrics.json`, `ecommerce-performance-dashboard.json`): `deploy_dashboard` extracts `.dashboard` via `jq -c`, searches for existing by title via `GET /api/search`, then `PUT /api/dashboards/<id>` (update) or `POST /api/dashboards/db` (create).
- **How the pieces map together**: Dashboard JSON files are read by the deploy script and posted to the Grafana API. The Kubernetes ConfigMap + provider path is an alternative route pointing Grafana at a mounted ConfigMap. Both paths target the same Grafana instance in `istio-system`. The k6 assets are independent of the three e-commerce dashboards and populate only when `tests/k6` pushes metrics to the PushGateway.

## Files Inspected

- `monitoring/grafana/deploy-enhanced-dashboards.sh`
- `monitoring/grafana/dashboard-provider-enhanced.yaml`
- `monitoring/grafana/dashboards-configmap.yaml`
- `monitoring/grafana/k6-dashboard-clean.yaml`
- `monitoring/grafana/test-k6-provider.yaml`
- `monitoring/grafana/dashboards/ecommerce-service-metrics-provisioning.yaml`
- `monitoring/CLAUDE.md`
- `monitoring/AGENT.md` (prior version)
- `monitoring/grafana/AGENT.md`
