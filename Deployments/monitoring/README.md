# 📊 Monitoring Deployments

This directory contains monitoring-related deployment configurations and fixes.

## 📁 Directory Structure

### `grafana/`

Contains Grafana-specific configuration files and connection setup:

- `grafana-configmap-fixed.yaml` - ConfigMap with correct Prometheus data source configuration
- `prometheus-service-alias.yaml` - Service alias for Prometheus compatibility
- `grafana-helm-values.yaml` - Helm values file for future Grafana deployments

## 🔧 Usage

These files are automatically used by the deployment and fix scripts. You typically don't need to apply them manually.

### Manual Application (if needed)

```bash
# Apply Grafana ConfigMap with correct Prometheus connection
kubectl apply -f grafana/grafana-configmap-fixed.yaml

# Apply Prometheus service alias
kubectl apply -f grafana/prometheus-service-alias.yaml
```

## 📝 Notes

- These configurations ensure Grafana can connect to Prometheus properly
- The fix is automatically applied during deployment via `deploy.sh`
- Files are organized here to keep the project root clean
