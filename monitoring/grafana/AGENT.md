# Codebase Orientation Map — monitoring/grafana

## 1-Line Summary

This module holds Grafana dashboards-as-code, Kubernetes provisioning YAML, and a Bash deploy script that provisions datasources and dashboards into a running Grafana instance for the cloud-native e-commerce platform.

## 5-Minute Explanation

- **Primary tasks in code**: Define three e-commerce Grafana dashboards as JSON files (service metrics, business metrics, performance), provision them via Kubernetes ConfigMaps and providers or via a Bash deploy script that calls the Grafana HTTP API, and configure Prometheus and Loki datasources with the correct cluster DNS URLs.
- **Primary inputs**: Dashboard JSON files (`dashboards/*.json`), Kubernetes YAML for ConfigMaps and providers (`dashboards-configmap.yaml`, `dashboard-provider-enhanced.yaml`, `k6-dashboard-clean.yaml`, `test-k6-provider.yaml`), Bash script arguments (Grafana URL, credentials — all hardcoded as variables).
- **Primary outputs**: Provisioned Grafana datasources (Prometheus, Loki), an "E-Commerce" folder in Grafana, three imported e-commerce dashboards, and optionally a k6 load-test dashboard.
- **Key files**:
  - `monitoring/grafana/deploy-enhanced-dashboards.sh` — imperative deploy entry point
  - `monitoring/grafana/dashboards/ecommerce-service-metrics.json` — service HTTP metrics dashboard
  - `monitoring/grafana/dashboards/ecommerce-business-metrics.json` — business metrics dashboard
  - `monitoring/grafana/dashboards/ecommerce-performance-dashboard.json` — performance metrics dashboard
  - `monitoring/grafana/dashboard-provider-enhanced.yaml` — K8s ConfigMap wrapping the provider
  - `monitoring/grafana/dashboards-configmap.yaml` — K8s ConfigMap wrapping the default provider
  - `monitoring/grafana/k6-dashboard-clean.yaml` — k6 dashboard embedded in a ConfigMap
  - `monitoring/grafana/test-k6-provider.yaml` — provider ConfigMap for the k6 dashboard
- **Main code paths**:
  1. `deploy-enhanced-dashboards.sh` → `check_grafana_connection` → `setup_data_sources` → `create_folder` → `deploy_dashboard` (×3 files).
  2. `kubectl apply -f dashboards-configmap.yaml` + `dashboard-provider-enhanced.yaml` → Grafana polls the ConfigMap-mounted path every 10 seconds.

## Deep Dive

- **Type**: Observability configuration — dashboards-as-code and provisioning scripts.
- **Primary runtime(s)**: Bash, Kubernetes (ConfigMap provisioning), Grafana HTTP API.
- **Entry points**:
  - `monitoring/grafana/deploy-enhanced-dashboards.sh`: The `main` function is the single imperative entry point. Invoked as `bash monitoring/grafana/deploy-enhanced-dashboards.sh` after port-forwarding Grafana to `localhost:3000`.
  - `monitoring/grafana/dashboards-configmap.yaml` + `monitoring/grafana/dashboard-provider-enhanced.yaml`: Kubernetes declarative entry points, applied via `kubectl apply`.

## Top-Level Structure

| Path | Purpose | Notes |
|------|---------|-------|
| `monitoring/grafana/dashboards/` | Source-of-truth dashboard JSON files | Three e-commerce dashboards plus provisioning sidecar YAML |
| `monitoring/grafana/deploy-enhanced-dashboards.sh` | Imperative provisioning via Grafana HTTP API | Requires `curl`, `jq`, port-forward to `localhost:3000` |
| `monitoring/grafana/dashboard-provider-enhanced.yaml` | K8s ConfigMap — enhanced provider, folder `E-Commerce` | Provider path: `/var/lib/grafana/dashboards/ecommerce-enhanced-service-metrics` |
| `monitoring/grafana/dashboards-configmap.yaml` | K8s ConfigMap — default provider | Provider path: `/etc/grafana/provisioning/dashboards` |
| `monitoring/grafana/k6-dashboard-clean.yaml` | K8s ConfigMap with embedded k6 dashboard JSON | 12 panels: VUs, RPS, P95/P99, error rate, heatmap, data transfer, status codes, check rate, iteration duration, system resources, summary, endpoint table |
| `monitoring/grafana/test-k6-provider.yaml` | K8s ConfigMap wrapping the k6 Grafana provider | Folder `Test`, path `/var/lib/grafana/dashboards/test-k6` |
| `monitoring/grafana/dashboards/ecommerce-service-metrics-provisioning.yaml` | Multi-document YAML: service-metrics ConfigMap + duplicate of `dashboard-provider-enhanced.yaml` | Contains the full service-metrics dashboard JSON embedded inline |

## Key Boundaries

- **Presentation**: Dashboard JSON files (`dashboards/*.json`) — define panels, queries, and layout rendered by Grafana.
- **Application/Domain**: `deploy-enhanced-dashboards.sh` functions (`setup_data_sources`, `create_folder`, `deploy_dashboard`) — orchestrate the Grafana API calls.
- **Persistence/External I/O**:
  - Grafana HTTP API at `http://localhost:3000/api` (port-forwarded from `istio-system/grafana:3000`).
  - Prometheus at `http://prometheus-server.monitoring.svc.cluster.local:80` (cluster DNS).
  - Loki at `http://loki.monitoring.svc.cluster.local:3100` (cluster DNS).
  - Kubernetes API server (for `kubectl apply` of ConfigMaps and providers).
- **Cross-cutting concerns**: All dashboards use `"timezone": "browser"` and `"refresh": "30s"`. All provider ConfigMaps use `updateIntervalSeconds: 10` and `allowUiUpdates: true`.
- **Responsibilities by file/module**:
  - `deploy-enhanced-dashboards.sh`: credentials (`GRAFANA_USER=admin`, `GRAFANA_PASSWORD=prom-operator`), `check_grafana_connection` (health check), `setup_data_sources` (Prometheus + Loki creation), `create_folder` (E-Commerce UID `ecommerce`), `deploy_dashboard` (upsert logic via search + PUT/POST).
  - `dashboards/*.json`: each is wrapped as `{ "dashboard": { ... } }` with panels targeting Prometheus metrics.
  - `dashboard-provider-enhanced.yaml`: ConfigMap `grafana-dashboard-provider-enhanced` in namespace `monitoring`; provider named `E-Commerce Enhanced Service Metrics`, folder `E-Commerce`.
  - `dashboards-configmap.yaml`: ConfigMap `grafana-dashboards` in namespace `monitoring`; provider named `default`, no folder.
  - `k6-dashboard-clean.yaml`: ConfigMap `k6-dashboard` in namespace `monitoring`, label `grafana_dashboard: "1"`, key `k6-load-testing-dashboard.json`.
  - `test-k6-provider.yaml`: ConfigMap `test-k6-provider` in namespace `monitoring`; provider named `Test K6`, folder `Test`.
- **Detailed code flows**:
  1. Operator runs `kubectl port-forward -n istio-system svc/grafana 3000:3000`.
  2. `bash monitoring/grafana/deploy-enhanced-dashboards.sh` starts; `set -e` means any failure aborts.
  3. `check_grafana_connection` calls `GET /api/health` with basic auth; exits if Grafana is unreachable.
  4. `setup_data_sources` checks `GET /api/datasources/name/Prometheus` — creates Prometheus datasource (type `prometheus`, URL `http://prometheus-server.monitoring.svc.cluster.local:80`, `isDefault: true`) if absent. Repeats for Loki (type `loki`, URL `http://loki.monitoring.svc.cluster.local:3100`, `isDefault: false`).
  5. `create_folder` posts `{ "name": "E-Commerce", "uid": "ecommerce" }` to `POST /api/folders`.
  6. For each of the three dashboard files in order (`ecommerce-service-metrics.json`, `ecommerce-business-metrics.json`, `ecommerce-performance-dashboard.json`), `deploy_dashboard` extracts `.dashboard` with `jq`, searches for an existing dashboard by title, then either `PUT /api/dashboards/<id>` (update) or `POST /api/dashboards/db` (create).
- **How the pieces map together**: The dashboard JSON files are the source of truth. The deploy script reads them and pushes their content to the Grafana API. The Kubernetes ConfigMap + provider path is an alternative declarative route — both paths target the same Grafana instance. The k6 assets are provisioned separately and depend on `tests/k6` pushing metrics to the PushGateway.

## Files Inspected

- `monitoring/grafana/deploy-enhanced-dashboards.sh`
- `monitoring/grafana/dashboard-provider-enhanced.yaml`
- `monitoring/grafana/dashboards-configmap.yaml`
- `monitoring/grafana/k6-dashboard-clean.yaml`
- `monitoring/grafana/test-k6-provider.yaml`
- `monitoring/grafana/dashboards/ecommerce-service-metrics-provisioning.yaml`
- `monitoring/CLAUDE.md`
- `monitoring/grafana/AGENT.md` (prior version)
