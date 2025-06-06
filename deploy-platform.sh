#!/bin/bash

# Cloud-Native E-commerce Platform Deployment Script
# This script deploys the complete platform using Kubernetes and Helm

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${NAMESPACE:-default}
APP_NAME=${APP_NAME:-eshopping}
HELM_TIMEOUT=${HELM_TIMEOUT:-600s}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Cloud-Native E-commerce Platform Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists kubectl; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    if ! command_exists helm; then
        print_error "helm is not installed. Please install Helm first."
        exit 1
    fi
    
    if ! command_exists docker; then
        print_error "docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info >/dev/null 2>&1; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    print_status "Prerequisites check passed!"
}

# Function to create namespace if it doesn't exist
create_namespace() {
    print_status "Creating namespace: $NAMESPACE"
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
}

# Function to install Helm chart
install_helm_chart() {
    local chart_name=$1
    local chart_path=$2
    local release_name="${APP_NAME}-${chart_name}"
    
    print_status "Installing Helm chart: $chart_name"
    
    if helm list -n $NAMESPACE | grep -q $release_name; then
        print_warning "Release $release_name already exists. Upgrading..."
        helm upgrade $release_name $chart_path \
            --namespace $NAMESPACE \
            --timeout $HELM_TIMEOUT \
            --wait
    else
        helm install $release_name $chart_path \
            --namespace $NAMESPACE \
            --timeout $HELM_TIMEOUT \
            --wait
    fi
    
    if [ $? -eq 0 ]; then
        print_status "Successfully installed $chart_name"
    else
        print_error "Failed to install $chart_name"
        exit 1
    fi
}

# Function to wait for deployment
wait_for_deployment() {
    local deployment_name=$1
    print_status "Waiting for deployment: $deployment_name"
    kubectl wait --for=condition=available --timeout=300s deployment/$deployment_name -n $NAMESPACE
}

# Function to get service URLs
get_service_urls() {
    print_status "Getting service URLs..."
    echo -e "${BLUE}Service URLs:${NC}"
    
    # Get NodePort services
    kubectl get services -n $NAMESPACE -o wide
    
    echo -e "\n${BLUE}To access services locally, use port-forwarding:${NC}"
    echo "kubectl port-forward svc/ocelotapigw 8010:80 -n $NAMESPACE"
    echo "kubectl port-forward svc/elasticsearch 9200:9200 -n $NAMESPACE"
    echo "kubectl port-forward svc/kibana 5601:5601 -n $NAMESPACE"
}

# Main deployment function
deploy_platform() {
    print_status "Starting platform deployment..."
    
    # Change to Deployments/helm directory
    cd Deployments/helm
    
    # Infrastructure components (databases, message queues, monitoring)
    local infra_components=("basketdb" "catalogdb" "discountdb" "orderdb" "rabbitmq" "elasticsearch" "kibana")
    
    print_status "Deploying infrastructure components..."
    for component in "${infra_components[@]}"; do
        install_helm_chart $component ./$component
        sleep 10  # Wait between deployments
    done
    
    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 30
    
    # API services
    local api_services=("discount" "catalog" "basket" "ordering")
    
    print_status "Deploying API services..."
    for service in "${api_services[@]}"; do
        install_helm_chart $service ./$service
        sleep 10
    done
    
    # API Gateway
    print_status "Deploying API Gateway..."
    install_helm_chart "ocelotapigw" "./ocelotapigw"
    
    # Return to root directory
    cd ../..
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    echo -e "\n${BLUE}Pod Status:${NC}"
    kubectl get pods -n $NAMESPACE
    
    echo -e "\n${BLUE}Service Status:${NC}"
    kubectl get services -n $NAMESPACE
    
    echo -e "\n${BLUE}Deployment Status:${NC}"
    kubectl get deployments -n $NAMESPACE
}

# Main execution
main() {
    check_prerequisites
    create_namespace
    deploy_platform
    verify_deployment
    get_service_urls
    
    print_status "Platform deployment completed successfully!"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment Summary:${NC}"
    echo -e "${GREEN}- Namespace: $NAMESPACE${NC}"
    echo -e "${GREEN}- Application: $APP_NAME${NC}"
    echo -e "${GREEN}- All services deployed and running${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Run main function
main "$@"
