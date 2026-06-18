# Codebase Orientation Map

## 1-Line Summary
Deploy-time monitoring assets for the platform: a Grafana→Prometheus datasource fix (ConfigMap + Service alias), a Helm values file for Grafana, and a k6 load-test dashboard JSON — all provisioned declaratively from git.

## 5-Minute Explanation
- **Primary tasks in code**: Provides the Grafana datasource wiring (correcting the Prometheus URL), a Kubernetes Service alias so older datasource references still resolve, Helm values for deploying Grafana, and a pre-built k6 dashboard JSON that Grafana provisions automatically.
- **Primary inputs**: `kubectl apply` commands (or the orchestration script `scripts/deploy/deploy.sh`) targeting the YAML files in this directory; Grafana/Prometheus deployments already running in-cluster.
- **Primary outputs**: A `grafana` ConfigMap in the `istio-system` namespace wired to `prometheus-server.monitoring.svc.cluster.local:80`; an `ExternalName` Service alias `prometheus` in `istio-system`; a Grafana instance that auto-provisions the k6 dashboard.
- **Key files**:
    - `Deployments/monitoring/grafana/grafana-configmap-fixed.yaml` — the ConfigMap that fixes the datasource URL.
    - `Deployments/monitoring/grafana/prometheus-service-alias.yaml` — `ExternalName` Service alias for Prometheus.
    - `Deployments/monitoring/grafana/grafana-helm-values.yaml` — Helm values for future Grafana deployments.
    - `Deployments/monitoring/grafana-dashboard-k6.json` — k6 load-test dashboard (485 lines of Grafana panel JSON).
- **Main code paths**: `scripts/deploy/deploy.sh` applies these files automatically; manual path is `kubectl apply -f grafana/grafana-configmap-fixed.yaml` → `kubectl rollout restart deployment/grafana -n istio-system` → `kubectl apply -f grafana/prometheus-service-alias.yaml`.

## Deep Dive
- **Type**: Infrastructure configuration (Kubernetes manifests + Grafana provisioning JSON).
- **Primary runtime(s)**: Kubernetes, Grafana (v9.5.5 per ConfigMap label), Prometheus.
- **Entry points**:
  - `Deployments/monitoring/grafana/grafana-configmap-fixed.yaml`: The primary fix artifact — applied to the `istio-system` namespace; sets Prometheus datasource URL and defines two dashboard providers (`istio`, `istio-services`).
  - `Deployments/monitoring/grafana/prometheus-service-alias.yaml`: `ExternalName` Service `prometheus` in `istio-system` pointing to `prometheus-server.monitoring.svc.cluster.local`; supports backward-compatible datasource references.
  - `Deployments/monitoring/grafana/grafana-helm-values.yaml`: Helm values for deploying Grafana — datasources (Prometheus + Loki), dashboard providers, `grafana.ini`, resource limits, anonymous auth, service type `ClusterIP:3000`.
  - `Deployments/monitoring/grafana-dashboard-k6.json`: Grafana dashboard JSON titled "K6 Load Testing Metrics"; provisioned by Grafana at startup.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `Deployments/monitoring/grafana/grafana-configmap-fixed.yaml` | ConfigMap for Grafana in `istio-system` | Sets Prometheus URL to `http://prometheus-server.monitoring.svc.cluster.local:80`; also configures Loki and two dashboard providers |
| `Deployments/monitoring/grafana/prometheus-service-alias.yaml` | ExternalName Service in `istio-system` | Aliases `prometheus` → `prometheus-server.monitoring.svc.cluster.local` on port 80 |
| `Deployments/monitoring/grafana/grafana-helm-values.yaml` | Helm values for Grafana deployment | Datasources, dashboard providers, resource limits, anonymous Admin access, Istio injection disabled |
| `Deployments/monitoring/grafana-dashboard-k6.json` | k6 load-test Grafana dashboard | 485-line JSON with panels for k6 metrics; provisioned at Grafana startup |
| `Deployments/monitoring/README.md` | Fix rationale and manual-apply steps | Documents the Grafana–Prometheus connection problem and solution |

## Key Boundaries
- **Presentation**: None — this is infrastructure/config.
- **Application/Domain**: None — purely observability plumbing.
- **Persistence/External I/O**: No PVs/PVCs owned here. Dashboard JSON and datasource config are declarative (ConfigMaps + JSON files); runtime metrics state lives in Prometheus; dashboard state lives in Grafana (deployed by `helm/prometheus` or `k8s/monitoring`).
- **Cross-cutting concerns**: Grafana anonymous Admin access (`auth.anonymous.enabled: true`, `org_role: Admin`) is set in both the ConfigMap and the Helm values file; `sidecar.istio.io/inject: "false"` disables Istio injection on the Grafana pod (set in `grafana-helm-values.yaml`).
- **Responsibilities by file/module**:
    - `grafana-configmap-fixed.yaml`: Patches the live `grafana` ConfigMap in `istio-system`; fixes the datasource URL and defines two Istio dashboard providers.
    - `prometheus-service-alias.yaml`: Creates an `ExternalName` Service so Grafana can reach Prometheus via the short name `prometheus` from `istio-system`.
    - `grafana-helm-values.yaml`: Full Helm values for deploying Grafana with correct wiring from the start (two datasources: Prometheus + Loki; resource limits; security context uid/gid 472).
    - `grafana-dashboard-k6.json`: Dashboard panels for k6 HTTP durations, request rates, virtual users — consumed by load tests in `tests/`.
- **Detailed code flows**:
  1. Grafana + Prometheus are deployed by `helm/prometheus` chart or `k8s/monitoring` manifests (not this directory).
  2. `grafana-configmap-fixed.yaml` is applied (`kubectl apply -f`), replacing the live `grafana` ConfigMap in `istio-system` with a corrected Prometheus URL.
  3. `kubectl rollout restart deployment/grafana -n istio-system` restarts Grafana so it re-reads the ConfigMap and picks up the new datasource and dashboard provider config.
  4. `prometheus-service-alias.yaml` is applied, creating the `ExternalName` Service alias so both new and legacy datasource references resolve.
  5. Grafana provisions the k6 dashboard JSON from `grafana-dashboard-k6.json` at startup (via the dashboard provider paths defined in the ConfigMap).
- **How the pieces map together**: The ConfigMap drives Grafana's provisioning system at startup; the Service alias ensures the DNS name `prometheus.istio-system.svc.cluster.local` resolves to the actual Prometheus server in the `monitoring` namespace; `grafana-helm-values.yaml` encodes the same fix for fresh Helm-based deploys. The k6 dashboard is wired to the Prometheus datasource (defined in both the ConfigMap and the Helm values).
- **Files inspected**:
    - `Deployments/monitoring/CLAUDE.md`
    - `Deployments/monitoring/README.md`
    - `Deployments/monitoring/grafana/grafana-configmap-fixed.yaml`
    - `Deployments/monitoring/grafana/prometheus-service-alias.yaml`
    - `Deployments/monitoring/grafana/grafana-helm-values.yaml`
    - `Deployments/monitoring/grafana-dashboard-k6.json` (header + line count)
