#!/bin/bash

# Monitoring Stack Deployment Script
# Deploys Prometheus, Grafana, Jaeger for comprehensive observability

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MONITORING_NAMESPACE=${MONITORING_NAMESPACE:-monitoring}
ISTIO_NAMESPACE=${ISTIO_NAMESPACE:-istio-system}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Helm repo exists
check_helm_repo() {
    local repo_name=$1
    local repo_url=$2
    
    if ! helm repo list | grep -q $repo_name; then
        print_status "Adding Helm repository: $repo_name"
        helm repo add $repo_name $repo_url
    else
        print_status "Helm repository $repo_name already exists"
    fi
}

# Function to create monitoring namespace
create_monitoring_namespace() {
    print_status "Creating monitoring namespace..."
    kubectl create namespace $MONITORING_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
}

# Function to deploy Prometheus
deploy_prometheus() {
    print_status "Deploying Prometheus..."
    
    check_helm_repo "prometheus-community" "https://prometheus-community.github.io/helm-charts"
    helm repo update
    
    # Create Prometheus values file
    cat > prometheus-values.yaml << EOF
server:
  persistentVolume:
    enabled: true
    size: 10Gi
  service:
    type: ClusterIP
  ingress:
    enabled: false

alertmanager:
  enabled: true
  persistentVolume:
    enabled: true
    size: 2Gi

nodeExporter:
  enabled: true

pushgateway:
  enabled: true

serverFiles:
  prometheus.yml:
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    scrape_configs:
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
        - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
        - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
          action: keep
          regex: default;kubernetes;https

      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
        - role: node
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token

      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
        - role: pod
        relabel_configs:
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
          action: keep
          regex: true
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)
        - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
          action: replace
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: \$1:\$2
          target_label: __address__

      - job_name: 'ecommerce-services'
        kubernetes_sd_configs:
        - role: service
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
          action: keep
          regex: true
EOF

    helm upgrade --install prometheus prometheus-community/prometheus \
        --namespace $MONITORING_NAMESPACE \
        --values prometheus-values.yaml \
        --wait
    
    print_status "Prometheus deployed successfully"
}

# Function to deploy Grafana
deploy_grafana() {
    print_status "Deploying Grafana..."
    
    check_helm_repo "grafana" "https://grafana.github.io/helm-charts"
    helm repo update
    
    # Create Grafana values file
    cat > grafana-values.yaml << EOF
adminPassword: admin123

persistence:
  enabled: true
  size: 5Gi

service:
  type: ClusterIP

ingress:
  enabled: false

datasources:
  datasources.yaml:
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      url: http://prometheus-server:80
      access: proxy
      isDefault: true
    - name: Jaeger
      type: jaeger
      url: http://jaeger-query:16686
      access: proxy

dashboardProviders:
  dashboardproviders.yaml:
    apiVersion: 1
    providers:
    - name: 'default'
      orgId: 1
      folder: ''
      type: file
      disableDeletion: false
      editable: true
      options:
        path: /var/lib/grafana/dashboards/default

dashboards:
  default:
    kubernetes-cluster:
      gnetId: 7249
      revision: 1
      datasource: Prometheus
    kubernetes-pods:
      gnetId: 6417
      revision: 1
      datasource: Prometheus
    istio-mesh:
      gnetId: 7639
      revision: 22
      datasource: Prometheus
    istio-service:
      gnetId: 7636
      revision: 22
      datasource: Prometheus
EOF

    helm upgrade --install grafana grafana/grafana \
        --namespace $MONITORING_NAMESPACE \
        --values grafana-values.yaml \
        --wait
    
    print_status "Grafana deployed successfully"
    print_status "Grafana admin password: admin123"
}

# Function to deploy Jaeger
deploy_jaeger() {
    print_status "Deploying Jaeger..."
    
    check_helm_repo "jaegertracing" "https://jaegertracing.github.io/helm-charts"
    helm repo update
    
    # Create Jaeger values file
    cat > jaeger-values.yaml << EOF
provisionDataStore:
  cassandra: false
  elasticsearch: true

storage:
  type: elasticsearch
  elasticsearch:
    host: elasticsearch.default.svc.cluster.local
    port: 9200

agent:
  enabled: true

collector:
  enabled: true
  service:
    type: ClusterIP

query:
  enabled: true
  service:
    type: ClusterIP
  ingress:
    enabled: false

esIndexCleaner:
  enabled: true
  schedule: "55 23 * * *"
  numberOfDays: 7
EOF

    helm upgrade --install jaeger jaegertracing/jaeger \
        --namespace $MONITORING_NAMESPACE \
        --values jaeger-values.yaml \
        --wait
    
    print_status "Jaeger deployed successfully"
}

# Function to create service monitors for Prometheus
create_service_monitors() {
    print_status "Creating ServiceMonitors for application services..."
    
    cat > service-monitors.yaml << EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ecommerce-services
  namespace: $MONITORING_NAMESPACE
spec:
  selector:
    matchLabels:
      app.kubernetes.io/part-of: ecommerce
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: elasticsearch
  namespace: $MONITORING_NAMESPACE
spec:
  selector:
    matchLabels:
      app: elasticsearch
  endpoints:
  - port: http
    path: /_prometheus/metrics
    interval: 30s
EOF

    kubectl apply -f service-monitors.yaml
    print_status "ServiceMonitors created"
}

# Function to setup port forwarding
setup_port_forwarding() {
    print_status "Setting up port forwarding for monitoring services..."
    
    echo -e "${BLUE}To access monitoring services, run these commands in separate terminals:${NC}"
    echo "# Prometheus"
    echo "kubectl port-forward svc/prometheus-server 9090:80 -n $MONITORING_NAMESPACE"
    echo ""
    echo "# Grafana"
    echo "kubectl port-forward svc/grafana 3000:80 -n $MONITORING_NAMESPACE"
    echo ""
    echo "# Jaeger"
    echo "kubectl port-forward svc/jaeger-query 16686:16686 -n $MONITORING_NAMESPACE"
    echo ""
    echo -e "${YELLOW}Grafana credentials: admin / admin123${NC}"
}

# Function to verify monitoring deployment
verify_monitoring() {
    print_status "Verifying monitoring deployment..."
    
    echo -e "\n${BLUE}Monitoring Pods:${NC}"
    kubectl get pods -n $MONITORING_NAMESPACE
    
    echo -e "\n${BLUE}Monitoring Services:${NC}"
    kubectl get services -n $MONITORING_NAMESPACE
}

# Main execution
main() {
    print_status "Starting monitoring stack deployment..."
    
    create_monitoring_namespace
    deploy_prometheus
    deploy_grafana
    deploy_jaeger
    create_service_monitors
    verify_monitoring
    setup_port_forwarding
    
    print_status "Monitoring stack deployment completed!"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Monitoring Stack Summary:${NC}"
    echo -e "${GREEN}- Prometheus: Metrics collection${NC}"
    echo -e "${GREEN}- Grafana: Dashboards and visualization${NC}"
    echo -e "${GREEN}- Jaeger: Distributed tracing${NC}"
    echo -e "${GREEN}- Namespace: $MONITORING_NAMESPACE${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Run main function
main "$@"
