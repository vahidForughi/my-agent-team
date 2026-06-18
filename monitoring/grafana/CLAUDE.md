# monitoring/grafana — Do / Don't

## Do

- Edit dashboard JSON files under `monitoring/grafana/dashboards/` as the source of truth for all dashboard changes.
- Wrap every dashboard JSON file as `{ "dashboard": { ... } }` — that is the schema `deploy-enhanced-dashboards.sh` expects when it runs `jq -c '.dashboard'`.
- Set the Prometheus datasource URL to `http://prometheus-server.monitoring.svc.cluster.local:80` (cluster DNS) — not `localhost`. This is the permanent fix encoded in `setup_data_sources` of `deploy-enhanced-dashboards.sh`.
- Run `bash monitoring/grafana/deploy-enhanced-dashboards.sh` to provision or re-provision datasources, the "E-Commerce" folder, and all three e-commerce dashboards via the Grafana HTTP API.
- Port-forward before running the deploy script: `kubectl port-forward -n istio-system svc/grafana 3000:3000`.
- Keep `curl` and `jq` available when running the deploy script — it aborts with an explicit error if either is missing (`command -v` checks at the top of the script).
- Apply `dashboards-configmap.yaml` and `dashboard-provider-enhanced.yaml` to the `monitoring` namespace when using the Kubernetes provisioning path (ConfigMap + provider).
- Restart Grafana after applying ConfigMap changes for new dashboards to appear.
- Treat `k6-dashboard-clean.yaml` and `test-k6-provider.yaml` as the provisioning artifacts for k6 load-test dashboards; they are separate from the three e-commerce dashboards.

## Don't

- Don't edit dashboards directly in the live Grafana UI — `dashboard-provider-enhanced.yaml` sets `allowUiUpdates: true` but the JSON files in `monitoring/grafana/dashboards/` are the source of truth. Live edits are lost on the next provisioning run.
- Don't use `localhost` as the Prometheus datasource URL inside the cluster — it will not resolve to the Prometheus server.
- Don't treat `grafana-backup-*.yaml` or `grafana-deployment-backup-*.yaml` (repo root) as canonical config — they are timestamped snapshots and are not applied by any provisioning script.
- Don't confuse this directory (`monitoring/grafana/`) with `Deployments/monitoring/` — the latter holds Helm values and raw Kubernetes manifests for the monitoring stack itself (Prometheus, Grafana Helm release, etc.). This directory holds dashboards-as-code and deployment scripts only.
- Don't expect k6 dashboards to show data unless k6 metrics are actively being pushed via the PushGateway from `tests/k6`.
- Don't run `deploy-enhanced-dashboards.sh` without a reachable Grafana — the `check_grafana_connection` function will abort the script on failure.

@AGENT.md
