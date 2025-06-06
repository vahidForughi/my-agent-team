#!/bin/bash

# Complete Cloud-Native E-commerce Platform Deployment Orchestrator
# This script orchestrates the complete deployment of the platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${NAMESPACE:-default}
MONITORING_NAMESPACE=${MONITORING_NAMESPACE:-monitoring}
ISTIO_NAMESPACE=${ISTIO_NAMESPACE:-istio-system}
APP_NAME=${APP_NAME:-eshopping}

print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."

    local missing_tools=()

    if ! command -v docker >/dev/null 2>&1; then
        missing_tools+=("docker")
    fi

    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        echo "Please install the missing tools and try again."
        exit 1
    fi

    # Check Docker connectivity
    if ! docker info >/dev/null 2>&1; then
        print_error "Cannot connect to Docker daemon"
        echo "Please ensure Docker Desktop is running."
        exit 1
    fi

    # Check if Kubernetes is available
    USE_KUBERNETES=false
    if command -v kubectl >/dev/null 2>&1 && command -v helm >/dev/null 2>&1; then
        if kubectl cluster-info >/dev/null 2>&1; then
            USE_KUBERNETES=true
            print_status "Kubernetes cluster detected - will use Kubernetes deployment"
        else
            print_warning "Kubernetes not available - will use Docker Compose deployment"
        fi
    else
        print_warning "kubectl or helm not found - will use Docker Compose deployment"
    fi

    print_status "Prerequisites check completed!"
}

# Function to make scripts executable
make_scripts_executable() {
    print_step "Making deployment scripts executable..."
    chmod +x deploy-platform.sh
    chmod +x deploy-monitoring.sh
    chmod +x deploy-istio.sh
    print_status "Scripts are now executable"
}

# Function to build Docker images
build_docker_images() {
    print_step "Building Docker images for microservices..."

    print_status "Building Catalog API image..."
    docker build -t catalogapi:latest -f Services/Catalog/Catalog.API/Dockerfile .

    print_status "Building Basket API image..."
    docker build -t basketapi:latest -f Services/Basket/Basket.API/Dockerfile .

    print_status "Building Discount API image..."
    docker build -t discountapi:latest -f Services/Discount/Discount.API/Dockerfile .

    print_status "Building Ordering API image..."
    docker build -t orderingapi:latest -f Services/Ordering/Ordering.API/Dockerfile .

    print_status "Building API Gateway image..."
    docker build -t ocelotapigateway:latest -f ApiGateways/Ocelot.ApiGateway/Dockerfile .

    print_status "All Docker images built successfully!"
}

# Function to deploy with Docker Compose
deploy_with_docker_compose() {
    print_step "Deploying platform with Docker Compose..."

    # Ensure .env file exists
    if [ ! -f .env ]; then
        print_status "Environment file already exists"
    fi

    print_status "Starting infrastructure services..."
    docker-compose up -d catalogdb basketdb discountdb orderdb rabbitmq elasticsearch kibana pgadmin portainer

    print_status "Waiting for databases to initialize..."
    sleep 30

    print_status "Building and starting application services..."
    # Try to build with legacy builder to avoid BuildKit issues
    export DOCKER_BUILDKIT=0
    export COMPOSE_DOCKER_CLI_BUILD=0

    docker-compose build catalog.api basket.api discount.api ordering.api ocelot.apigateway
    docker-compose up -d catalog.api basket.api discount.api ordering.api ocelot.apigateway

    print_status "Docker Compose deployment completed!"
}

# Function to deploy the platform
deploy_platform() {
    if [ "$USE_KUBERNETES" = true ]; then
        print_step "Deploying the core platform with Kubernetes..."
        ./deploy-platform.sh
        print_status "Kubernetes platform deployment completed!"
    else
        deploy_with_docker_compose
    fi
}

# Function to deploy monitoring
deploy_monitoring() {
    if [ "$USE_KUBERNETES" = true ]; then
        print_step "Deploying monitoring stack with Kubernetes..."
        ./deploy-monitoring.sh
        print_status "Kubernetes monitoring stack deployment completed!"
    else
        print_step "Monitoring services included in Docker Compose deployment..."
        print_status "Elasticsearch and Kibana are already running"
        print_status "Access Kibana at: http://localhost:5601"
        print_status "Access Elasticsearch at: http://localhost:9200"
    fi
}

# Function to deploy Istio
deploy_istio() {
    if [ "$USE_KUBERNETES" = true ]; then
        print_step "Deploying Istio service mesh..."
        ./deploy-istio.sh
        print_status "Istio service mesh deployment completed!"
    else
        print_warning "Istio service mesh requires Kubernetes - skipping"
        print_status "Service mesh features not available in Docker Compose mode"
    fi
}

# Function to wait for all services to be ready
wait_for_services() {
    print_step "Waiting for all services to be ready..."

    if [ "$USE_KUBERNETES" = true ]; then
        local max_wait=600  # 10 minutes
        local wait_time=0
        local interval=30

        while [ $wait_time -lt $max_wait ]; do
            local ready_pods=$(kubectl get pods -n $NAMESPACE --no-headers | grep -c "Running\|Completed" || echo "0")
            local total_pods=$(kubectl get pods -n $NAMESPACE --no-headers | wc -l)

            if [ "$ready_pods" -eq "$total_pods" ] && [ "$total_pods" -gt 0 ]; then
                print_status "All services are ready!"
                return 0
            fi

            print_status "Waiting for services... ($ready_pods/$total_pods ready)"
            sleep $interval
            wait_time=$((wait_time + interval))
        done

        print_warning "Some services may not be ready yet. Check status manually."
    else
        print_step "Waiting for Docker Compose services to be ready..."
        sleep 60  # Give services time to start

        local running_containers=$(docker-compose ps --services --filter "status=running" | wc -l)
        local total_containers=$(docker-compose ps --services | wc -l)

        print_status "Docker Compose services status: $running_containers/$total_containers running"
    fi
}

# Function to run health checks
run_health_checks() {
    print_step "Running health checks..."

    if [ "$USE_KUBERNETES" = true ]; then
        echo -e "\n${BLUE}Application Pods Status:${NC}"
        kubectl get pods -n $NAMESPACE

        echo -e "\n${BLUE}Monitoring Pods Status:${NC}"
        kubectl get pods -n $MONITORING_NAMESPACE 2>/dev/null || echo "Monitoring namespace not found"

        echo -e "\n${BLUE}Istio System Pods Status:${NC}"
        kubectl get pods -n $ISTIO_NAMESPACE 2>/dev/null || echo "Istio namespace not found"

        echo -e "\n${BLUE}Services Status:${NC}"
        kubectl get services -n $NAMESPACE

        echo -e "\n${BLUE}Ingress Status:${NC}"
        kubectl get ingress -A 2>/dev/null || echo "No ingress resources found"
    else
        echo -e "\n${BLUE}Docker Compose Services Status:${NC}"
        docker-compose ps

        echo -e "\n${BLUE}Running Containers:${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

        echo -e "\n${BLUE}Container Health:${NC}"
        docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    fi
}

# Function to display access information
display_access_info() {
    print_header "ACCESS INFORMATION"

    if [ "$USE_KUBERNETES" = true ]; then
        echo -e "${BLUE}Application Services (Kubernetes):${NC}"
        echo "To access the application services, use port-forwarding:"
        echo ""
        echo "# API Gateway (Main Entry Point)"
        echo "kubectl port-forward svc/ocelotapigw 8010:80 -n $NAMESPACE"
        echo "Access: http://localhost:8010"
        echo ""
        echo "# Individual Services"
        echo "kubectl port-forward svc/catalog 8000:80 -n $NAMESPACE"
        echo "kubectl port-forward svc/basket 8001:80 -n $NAMESPACE"
        echo "kubectl port-forward svc/discountapi 8002:80 -n $NAMESPACE"
        echo "kubectl port-forward svc/ordering 8003:80 -n $NAMESPACE"
        echo ""

        echo -e "${BLUE}Infrastructure Services:${NC}"
        echo "# Elasticsearch"
        echo "kubectl port-forward svc/elasticsearch 9200:9200 -n $NAMESPACE"
        echo ""
        echo "# Kibana"
        echo "kubectl port-forward svc/kibana 5601:5601 -n $NAMESPACE"
        echo ""
        echo "# RabbitMQ Management"
        echo "kubectl port-forward svc/rabbitmq 15672:15672 -n $NAMESPACE"
        echo "Credentials: guest/guest"
        echo ""

        echo -e "${BLUE}Monitoring Services:${NC}"
        echo "# Prometheus"
        echo "kubectl port-forward svc/prometheus-server 9090:80 -n $MONITORING_NAMESPACE"
        echo ""
        echo "# Grafana"
        echo "kubectl port-forward svc/grafana 3000:80 -n $MONITORING_NAMESPACE"
        echo "Credentials: admin/admin123"
        echo ""
        echo "# Jaeger"
        echo "kubectl port-forward svc/jaeger-query 16686:16686 -n $MONITORING_NAMESPACE"
        echo ""

        echo -e "${BLUE}Istio Services (if deployed):${NC}"
        echo "# Kiali"
        echo "kubectl port-forward svc/kiali 20001:20001 -n $ISTIO_NAMESPACE"
        echo ""
        echo "# Istio Grafana"
        echo "kubectl port-forward svc/grafana 3000:3000 -n $ISTIO_NAMESPACE"
        echo ""
        echo "# Istio Jaeger"
        echo "kubectl port-forward svc/jaeger 16686:16686 -n $ISTIO_NAMESPACE"
    else
        echo -e "${BLUE}Application Services (Docker Compose):${NC}"
        echo "Services are directly accessible on localhost:"
        echo ""
        echo "# API Gateway (Main Entry Point)"
        echo "http://localhost:8010"
        echo ""
        echo "# Individual Services"
        echo "Catalog API: http://localhost:8000"
        echo "Basket API: http://localhost:8001"
        echo "Discount API: http://localhost:8002"
        echo "Ordering API: http://localhost:8003"
        echo ""

        echo -e "${BLUE}Infrastructure Services:${NC}"
        echo "Elasticsearch: http://localhost:9200"
        echo "Kibana: http://localhost:5601"
        echo "RabbitMQ Management: http://localhost:15672 (guest/guest)"
        echo "pgAdmin: http://localhost:5050 (admin@eCommerce.net/Password@1)"
        echo "Portainer: http://localhost:9090"
        echo ""

        echo -e "${BLUE}Database Connections:${NC}"
        echo "MongoDB: localhost:27017"
        echo "Redis: localhost:6379"
        echo "PostgreSQL: localhost:5432 (admin/admin1234)"
        echo "SQL Server: localhost:1433 (sa/SqlPassword123)"
    fi
}

# Function to create quick access script
create_access_script() {
    print_step "Creating quick access script..."

    cat > access-services.sh << 'EOF'
#!/bin/bash

# Quick access script for deployed services

echo "Select a service to access:"
echo "1) API Gateway (8010)"
echo "2) Catalog Service (8000)"
echo "3) Basket Service (8001)"
echo "4) Discount Service (8002)"
echo "5) Ordering Service (8003)"
echo "6) Elasticsearch (9200)"
echo "7) Kibana (5601)"
echo "8) RabbitMQ Management (15672)"
echo "9) Prometheus (9090)"
echo "10) Grafana (3000)"
echo "11) Jaeger (16686)"
echo "12) Kiali (20001)"

read -p "Enter your choice (1-12): " choice

case $choice in
    1) kubectl port-forward svc/ocelotapigw 8010:80 -n default ;;
    2) kubectl port-forward svc/catalog 8000:80 -n default ;;
    3) kubectl port-forward svc/basket 8001:80 -n default ;;
    4) kubectl port-forward svc/discountapi 8002:80 -n default ;;
    5) kubectl port-forward svc/ordering 8003:80 -n default ;;
    6) kubectl port-forward svc/elasticsearch 9200:9200 -n default ;;
    7) kubectl port-forward svc/kibana 5601:5601 -n default ;;
    8) kubectl port-forward svc/rabbitmq 15672:15672 -n default ;;
    9) kubectl port-forward svc/prometheus-server 9090:80 -n monitoring ;;
    10) kubectl port-forward svc/grafana 3000:80 -n monitoring ;;
    11) kubectl port-forward svc/jaeger-query 16686:16686 -n monitoring ;;
    12) kubectl port-forward svc/kiali 20001:20001 -n istio-system ;;
    *) echo "Invalid choice" ;;
esac
EOF

    chmod +x access-services.sh
    print_status "Quick access script created: ./access-services.sh"
}

# Main deployment function
main() {
    print_header "CLOUD-NATIVE E-COMMERCE PLATFORM DEPLOYMENT"

    # Parse command line arguments
    DEPLOY_ISTIO=false
    DEPLOY_MONITORING=true
    BUILD_IMAGES=true

    while [[ $# -gt 0 ]]; do
        case $1 in
            --with-istio)
                DEPLOY_ISTIO=true
                shift
                ;;
            --no-monitoring)
                DEPLOY_MONITORING=false
                shift
                ;;
            --no-build)
                BUILD_IMAGES=false
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --with-istio      Deploy Istio service mesh"
                echo "  --no-monitoring   Skip monitoring stack deployment"
                echo "  --no-build        Skip Docker image building"
                echo "  --help            Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Execute deployment steps
    check_prerequisites
    make_scripts_executable

    if [ "$BUILD_IMAGES" = true ]; then
        build_docker_images
    fi

    deploy_platform

    if [ "$DEPLOY_MONITORING" = true ]; then
        deploy_monitoring
    fi

    if [ "$DEPLOY_ISTIO" = true ]; then
        deploy_istio
    fi

    wait_for_services
    run_health_checks
    display_access_info
    create_access_script
    create_verification_script

    print_header "DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo -e "${GREEN}The cloud-native e-commerce platform has been deployed successfully!${NC}"
    echo -e "${GREEN}Use the access information above to connect to the services.${NC}"
    echo -e "${GREEN}Run ./access-services.sh for quick access to services.${NC}"
}

# Function to create verification script
create_verification_script() {
    print_step "Creating verification script..."

    cat > verify-deployment.sh << 'EOF'
#!/bin/bash

# Deployment Verification Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to test service health
test_service_health() {
    local service_name=$1
    local namespace=$2
    local port=$3
    local path=${4:-"/health"}

    print_status "Testing $service_name health..."

    # Port forward in background
    kubectl port-forward svc/$service_name $port:80 -n $namespace &
    local pf_pid=$!

    # Wait for port forward to establish
    sleep 5

    # Test the endpoint
    if curl -f -s http://localhost:$port$path >/dev/null 2>&1; then
        print_status "$service_name is healthy"
        local result=0
    else
        print_error "$service_name health check failed"
        local result=1
    fi

    # Clean up port forward
    kill $pf_pid 2>/dev/null || true

    return $result
}

# Function to verify all deployments
verify_deployments() {
    print_status "Verifying all deployments..."

    local failed_services=()

    # Check application services
    local app_services=("catalog" "basket" "discountapi" "ordering" "ocelotapigw")
    for service in "${app_services[@]}"; do
        if ! kubectl get deployment $service -n default >/dev/null 2>&1; then
            failed_services+=("$service")
        fi
    done

    # Check infrastructure services
    local infra_services=("catalogdb" "basketdb" "discountdb" "orderdb" "rabbitmq" "elasticsearch" "kibana")
    for service in "${infra_services[@]}"; do
        if ! kubectl get deployment $service -n default >/dev/null 2>&1; then
            failed_services+=("$service")
        fi
    done

    if [ ${#failed_services[@]} -eq 0 ]; then
        print_status "All services are deployed successfully"
        return 0
    else
        print_error "Failed services: ${failed_services[*]}"
        return 1
    fi
}

# Function to check pod status
check_pod_status() {
    print_status "Checking pod status..."

    local not_ready_pods=$(kubectl get pods -n default --no-headers | grep -v "Running\|Completed" | wc -l)

    if [ "$not_ready_pods" -eq 0 ]; then
        print_status "All pods are running"
        return 0
    else
        print_warning "$not_ready_pods pods are not ready"
        kubectl get pods -n default | grep -v "Running\|Completed"
        return 1
    fi
}

# Function to test API endpoints
test_api_endpoints() {
    print_status "Testing API endpoints..."

    # Test API Gateway
    kubectl port-forward svc/ocelotapigw 8010:80 -n default &
    local gw_pid=$!
    sleep 5

    if curl -f -s http://localhost:8010 >/dev/null 2>&1; then
        print_status "API Gateway is accessible"
    else
        print_error "API Gateway is not accessible"
    fi

    kill $gw_pid 2>/dev/null || true
}

# Main verification function
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Deployment Verification${NC}"
    echo -e "${BLUE}========================================${NC}"

    verify_deployments
    check_pod_status
    test_api_endpoints

    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}Verification completed!${NC}"
    echo -e "${BLUE}========================================${NC}"
}

main "$@"
EOF

    chmod +x verify-deployment.sh
    print_status "Verification script created: ./verify-deployment.sh"
}

# Run main function with all arguments
main "$@"
