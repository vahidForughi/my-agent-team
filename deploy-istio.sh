#!/bin/bash

# Istio Service Mesh Deployment Script
# Deploys Istio with monitoring and observability tools

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ISTIO_VERSION=${ISTIO_VERSION:-1.20.0}
ISTIO_NAMESPACE=${ISTIO_NAMESPACE:-istio-system}
APP_NAMESPACE=${APP_NAMESPACE:-default}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if istioctl exists
check_istioctl() {
    if ! command -v istioctl >/dev/null 2>&1; then
        print_status "Installing istioctl..."
        curl -L https://istio.io/downloadIstio | ISTIO_VERSION=$ISTIO_VERSION sh -
        export PATH="$PWD/istio-$ISTIO_VERSION/bin:$PATH"
        
        # Make istioctl available globally
        sudo cp istio-$ISTIO_VERSION/bin/istioctl /usr/local/bin/
        print_status "istioctl installed successfully"
    else
        print_status "istioctl is already installed"
    fi
}

# Function to install Istio
install_istio() {
    print_status "Installing Istio..."
    
    # Install Istio with demo profile (includes all components)
    istioctl install --set values.defaultRevision=default -y
    
    # Verify installation
    kubectl get pods -n $ISTIO_NAMESPACE
    
    print_status "Istio installed successfully"
}

# Function to enable sidecar injection
enable_sidecar_injection() {
    print_status "Enabling automatic sidecar injection for namespace: $APP_NAMESPACE"
    kubectl label namespace $APP_NAMESPACE istio-injection=enabled --overwrite
    
    print_status "Sidecar injection enabled"
}

# Function to deploy Istio addons
deploy_istio_addons() {
    print_status "Deploying Istio addons..."
    
    # Check if we have the existing Istio configuration
    if [ -f "Deployments/istio/istio-minikube.yaml" ]; then
        print_status "Using existing Istio configuration..."
        kubectl apply -f Deployments/istio/istio-minikube.yaml
    else
        # Download and apply Istio addons
        print_status "Downloading Istio addons..."
        
        # Prometheus
        kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml
        
        # Grafana
        kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
        
        # Jaeger
        kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml
        
        # Kiali
        kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
        
        # Zipkin
        kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/extras/zipkin.yaml
    fi
    
    print_status "Waiting for addons to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n $ISTIO_NAMESPACE
    kubectl wait --for=condition=available --timeout=300s deployment/grafana -n $ISTIO_NAMESPACE
    kubectl wait --for=condition=available --timeout=300s deployment/jaeger -n $ISTIO_NAMESPACE
    kubectl wait --for=condition=available --timeout=300s deployment/kiali -n $ISTIO_NAMESPACE
    
    print_status "Istio addons deployed successfully"
}

# Function to create Istio Gateway
create_istio_gateway() {
    print_status "Creating Istio Gateway..."
    
    cat > istio-gateway.yaml << EOF
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: ecommerce-gateway
  namespace: $APP_NAMESPACE
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: ecommerce-tls
    hosts:
    - "*"
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ecommerce-vs
  namespace: $APP_NAMESPACE
spec:
  hosts:
  - "*"
  gateways:
  - ecommerce-gateway
  http:
  - match:
    - uri:
        prefix: /api/
    route:
    - destination:
        host: ocelotapigw
        port:
          number: 80
  - match:
    - uri:
        prefix: /
    route:
    - destination:
        host: ocelotapigw
        port:
          number: 80
EOF

    kubectl apply -f istio-gateway.yaml
    print_status "Istio Gateway created"
}

# Function to apply existing Istio configurations
apply_existing_configs() {
    print_status "Applying existing Istio configurations..."
    
    if [ -f "Deployments/istio/gateway.yaml" ]; then
        kubectl apply -f Deployments/istio/gateway.yaml
    fi
    
    if [ -f "Deployments/istio/virtualservices.yaml" ]; then
        kubectl apply -f Deployments/istio/virtualservices.yaml
    fi
    
    if [ -f "Deployments/istio/monitoring-virtualservices.yaml" ]; then
        kubectl apply -f Deployments/istio/monitoring-virtualservices.yaml
    fi
    
    if [ -f "Deployments/istio/kiali-secret.yaml" ]; then
        kubectl apply -f Deployments/istio/kiali-secret.yaml
    fi
    
    print_status "Existing Istio configurations applied"
}

# Function to configure traffic policies
configure_traffic_policies() {
    print_status "Configuring traffic policies..."
    
    cat > traffic-policies.yaml << EOF
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: ecommerce-services
  namespace: $APP_NAMESPACE
spec:
  host: "*.local"
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 10
        maxRequestsPerConnection: 2
    circuitBreaker:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
    loadBalancer:
      simple: LEAST_CONN
---
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: $APP_NAMESPACE
spec:
  mtls:
    mode: STRICT
EOF

    kubectl apply -f traffic-policies.yaml
    print_status "Traffic policies configured"
}

# Function to setup monitoring access
setup_monitoring_access() {
    print_status "Setting up monitoring access..."
    
    echo -e "${BLUE}To access Istio monitoring tools, use these commands:${NC}"
    echo ""
    echo "# Kiali (Service Mesh Dashboard)"
    echo "kubectl port-forward svc/kiali 20001:20001 -n $ISTIO_NAMESPACE"
    echo "Access: http://localhost:20001"
    echo ""
    echo "# Grafana (Metrics Dashboard)"
    echo "kubectl port-forward svc/grafana 3000:3000 -n $ISTIO_NAMESPACE"
    echo "Access: http://localhost:3000"
    echo ""
    echo "# Jaeger (Distributed Tracing)"
    echo "kubectl port-forward svc/jaeger 16686:16686 -n $ISTIO_NAMESPACE"
    echo "Access: http://localhost:16686"
    echo ""
    echo "# Prometheus (Metrics Collection)"
    echo "kubectl port-forward svc/prometheus 9090:9090 -n $ISTIO_NAMESPACE"
    echo "Access: http://localhost:9090"
    echo ""
    echo "# Zipkin (Alternative Tracing)"
    echo "kubectl port-forward svc/zipkin 9411:9411 -n $ISTIO_NAMESPACE"
    echo "Access: http://localhost:9411"
}

# Function to verify Istio installation
verify_istio() {
    print_status "Verifying Istio installation..."
    
    echo -e "\n${BLUE}Istio System Pods:${NC}"
    kubectl get pods -n $ISTIO_NAMESPACE
    
    echo -e "\n${BLUE}Istio System Services:${NC}"
    kubectl get services -n $ISTIO_NAMESPACE
    
    echo -e "\n${BLUE}Istio Configuration:${NC}"
    kubectl get gateway,virtualservice,destinationrule -n $APP_NAMESPACE
    
    echo -e "\n${BLUE}Istio Proxy Status:${NC}"
    istioctl proxy-status
}

# Main execution
main() {
    print_status "Starting Istio service mesh deployment..."
    
    check_istioctl
    install_istio
    enable_sidecar_injection
    deploy_istio_addons
    apply_existing_configs
    create_istio_gateway
    configure_traffic_policies
    verify_istio
    setup_monitoring_access
    
    print_status "Istio service mesh deployment completed!"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Istio Service Mesh Summary:${NC}"
    echo -e "${GREEN}- Service mesh with mTLS enabled${NC}"
    echo -e "${GREEN}- Traffic management and load balancing${NC}"
    echo -e "${GREEN}- Distributed tracing with Jaeger${NC}"
    echo -e "${GREEN}- Metrics collection with Prometheus${NC}"
    echo -e "${GREEN}- Service topology with Kiali${NC}"
    echo -e "${GREEN}- Dashboards with Grafana${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Run main function
main "$@"
