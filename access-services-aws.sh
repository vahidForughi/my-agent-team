#!/bin/bash

# 🌐 AWS EKS Service Access Portal - Interactive Menu
# This script provides easy access to all services running on AWS EKS
# Compatible with Bash 3.2+ (macOS default)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Service configuration (compatible with older Bash)
SERVICES_KEYS="prometheus grafana kiali jaeger kibana elasticsearch rabbitmq pgadmin portainer api-gateway catalog-api basket-api discount-api ordering-api catalog-db basket-db discount-db ordering-db"

# Function to get service URL
get_service_url() {
    case $1 in
        "prometheus") echo "http://localhost:9090" ;;
        "grafana") echo "http://localhost:3000" ;;
        "kiali") echo "http://localhost:20001" ;;
        "jaeger") echo "http://localhost:16686" ;;
        "kibana") echo "http://localhost:5601" ;;
        "elasticsearch") echo "http://localhost:9200" ;;
        "rabbitmq") echo "http://localhost:15672" ;;
        "pgadmin") echo "http://localhost:5050" ;;
        "portainer") echo "http://localhost:9000" ;;
        "api-gateway") echo "http://localhost:8010" ;;
        "catalog-api") echo "http://localhost:8001" ;;
        "basket-api") echo "http://localhost:8002" ;;
        "discount-api") echo "http://localhost:8003" ;;
        "ordering-api") echo "http://localhost:8004" ;;
        "catalog-db") echo "postgres://localhost:5432" ;;
        "basket-db") echo "postgres://localhost:6432" ;;
        "discount-db") echo "postgres://localhost:7432" ;;
        "ordering-db") echo "postgres://localhost:8432" ;;
        *) echo "" ;;
    esac
}

# Function to get service description
get_service_description() {
    case $1 in
        "prometheus") echo "Prometheus - Metrics collection" ;;
        "grafana") echo "Grafana - Dashboard visualization" ;;
        "kiali") echo "Kiali - Service mesh observability" ;;
        "jaeger") echo "Jaeger - Distributed tracing" ;;
        "kibana") echo "Kibana - Log analysis and search" ;;
        "elasticsearch") echo "Elasticsearch - Search engine" ;;
        "rabbitmq") echo "RabbitMQ - Message broker" ;;
        "pgadmin") echo "pgAdmin - Database management" ;;
        "portainer") echo "Portainer - Container management" ;;
        "api-gateway") echo "Ocelot - API Gateway" ;;
        "catalog-api") echo "Catalog - Microservice API" ;;
        "basket-api") echo "Basket - Microservice API" ;;
        "discount-api") echo "Discount - Microservice API" ;;
        "ordering-api") echo "Ordering - Microservice API" ;;
        "catalog-db") echo "Catalog - PostgreSQL Database" ;;
        "basket-db") echo "Basket - PostgreSQL Database" ;;
        "discount-db") echo "Discount - PostgreSQL Database" ;;
        "ordering-db") echo "Ordering - PostgreSQL Database" ;;
        *) echo "" ;;
    esac
}

# Function to get port forward command
get_port_forward_cmd() {
    case $1 in
        "prometheus") echo "kubectl port-forward -n monitoring svc/prometheus-server 9090:80" ;;
        "grafana") echo "kubectl port-forward -n istio-system svc/grafana 3000:3000" ;;
        "kiali") echo "kubectl port-forward -n istio-system svc/kiali 20001:20001" ;;
        "jaeger") echo "kubectl port-forward -n istio-system svc/tracing 16686:80" ;;
        "kibana") echo "kubectl port-forward -n default svc/eshopping-kibana 5601:5601" ;;
        "elasticsearch") echo "kubectl port-forward -n default svc/eshopping-elasticsearch 9200:9200" ;;
        "rabbitmq") echo "kubectl port-forward -n default svc/eshopping-rabbitmq 15672:15672" ;;
        "pgadmin") echo "kubectl port-forward -n default svc/eshopping-pgadmin 5050:80" ;;
        "portainer") echo "kubectl port-forward -n default svc/eshopping-portainer 9000:9000" ;;
        "api-gateway") echo "kubectl port-forward -n default svc/eshopping-ocelotapigw 8010:80" ;;
        "catalog-api") echo "kubectl port-forward -n default svc/eshopping-catalog 8001:80" ;;
        "basket-api") echo "kubectl port-forward -n default svc/eshopping-basket 8002:80" ;;
        "discount-api") echo "kubectl port-forward -n default svc/eshopping-discount 8003:80" ;;
        "ordering-api") echo "kubectl port-forward -n default svc/eshopping-ordering 8004:80" ;;
        "catalog-db") echo "kubectl port-forward -n default svc/postgres-catalogdb 5432:5432" ;;
        "basket-db") echo "kubectl port-forward -n default svc/postgres-basketdb 6432:5432" ;;
        "discount-db") echo "kubectl port-forward -n default svc/postgres-discountdb 7432:5432" ;;
        "ordering-db") echo "kubectl port-forward -n default svc/postgres-orderdb 8432:5432" ;;
        *) echo "" ;;
    esac
}

# Function to get service credentials
get_service_credentials() {
    case $1 in
        "rabbitmq") echo "Username: guest | Password: guest" ;;
        "grafana") echo "Username: admin | Password: prom-operator" ;;
        "kiali") echo "Username: admin | Password: admin" ;;
        "pgadmin") echo "Username: postgres | Password: postgres" ;;
        *) echo "" ;;
    esac
}

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to display header
display_header() {
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${WHITE}                  🚀 AWS EKS SERVICE ACCESS PORTAL                         ${CYAN}║${NC}"
    echo -e "${CYAN}║${WHITE}              Cloud-Native E-Commerce Platform Management               ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to check if a service is accessible
check_service_health() {
    local service_name=$1
    local url=$2

    # For database connections, just check if port is open
    if [[ $url == postgres://* ]]; then
        local port=$(echo "$url" | grep -oP ':\K[0-9]+')
        if nc -z localhost "$port" 2>/dev/null; then
            return 0
        else
            return 1
        fi
    fi

    if curl -s --max-time 2 --connect-timeout 1 "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to display service status
display_service_status() {
    echo -e "${PURPLE}📊 Service Status Check:${NC}"
    echo ""

    for service in $SERVICES_KEYS; do
        local url=$(get_service_url "$service")
        local desc=$(get_service_description "$service")

        printf "%-20s" "$service"

        if check_service_health "$service" "$url"; then
            echo -e "${GREEN}✅ Online${NC}  - $desc"
        else
            echo -e "${RED}❌ Offline${NC} - $desc"
        fi
    done
    echo ""
}

# Function to start all port forwards
start_port_forwards() {
    log_info "Starting port forwards for all services..."
    echo ""

    # Kill existing port forwards
    pkill -f "kubectl port-forward" 2>/dev/null || true
    sleep 1

    # Start port forwards for all services
    for service in $SERVICES_KEYS; do
        local cmd=$(get_port_forward_cmd "$service")
        if [[ -n "$cmd" ]]; then
            log_info "Starting: $service"
            eval "$cmd > /dev/null 2>&1 &"
        fi
    done

    sleep 3
    log_success "All port forwards started!"
    echo ""
}

# Function to stop all port forwards
stop_port_forwards() {
    log_info "Stopping all port forwards..."
    pkill -f "kubectl port-forward" 2>/dev/null || true
    log_success "All port forwards stopped!"
    echo ""
}

# Function to open service in browser
open_service() {
    local service=$1
    local url=$(get_service_url "$service")
    local desc=$(get_service_description "$service")

    # Skip databases (no web UI)
    if [[ $url == postgres://* ]]; then
        log_info "$desc"
        echo -e "${YELLOW}Connection String: $url${NC}"
        log_info "Use: psql -h localhost -p <port> -U postgres"
        echo ""
        return
    fi

    if check_service_health "$service" "$url"; then
        log_info "Opening $desc..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "$url" 2>/dev/null || echo "Please open: $url"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open "$url" 2>/dev/null || echo "Please open: $url"
        else
            echo "Please open: $url"
        fi

        # Display credentials if available
        local credentials=$(get_service_credentials "$service")
        if [[ -n "$credentials" ]]; then
            echo -e "${YELLOW}🔑 $credentials${NC}"
        fi
        echo ""
    else
        log_error "$service is not accessible at $url"
        log_warning "Try starting port forwards first (option 6)"
        echo ""
    fi
}

# Function to display main menu
display_menu() {
    echo -e "${WHITE}🎯 Available Services:${NC}"
    echo ""

    echo -e "${CYAN}📊 MONITORING STACK:${NC}"
    echo "  1) Prometheus              - Metrics and monitoring"
    echo "  2) Grafana                 - Dashboards and visualization"
    echo "  3) Kiali                   - Service mesh observability"
    echo "  4) Jaeger                  - Distributed tracing"
    echo ""

    echo -e "${CYAN}📝 LOGGING STACK:${NC}"
    echo "  5) Kibana                  - Log analysis and search"
    echo "  6) Elasticsearch           - Search engine"
    echo ""

    echo -e "${CYAN}🔧 INFRASTRUCTURE:${NC}"
    echo "  7) RabbitMQ                - Message broker"
    echo "  8) pgAdmin                 - Database management"
    echo "  9) Portainer               - Container management"
    echo ""

    echo -e "${CYAN}🌐 API SERVICES:${NC}"
    echo " 10) API Gateway             - Ocelot API Gateway"
    echo " 11) Catalog API             - Catalog Service"
    echo " 12) Basket API              - Basket Service"
    echo " 13) Discount API            - Discount Service"
    echo " 14) Ordering API            - Ordering Service"
    echo ""

    echo -e "${CYAN}🗄️  DATABASES:${NC}"
    echo " 15) Catalog Database        - PostgreSQL"
    echo " 16) Basket Database         - PostgreSQL"
    echo " 17) Discount Database       - PostgreSQL"
    echo " 18) Ordering Database       - PostgreSQL"
    echo ""

    echo -e "${CYAN}⚙️  MANAGEMENT OPTIONS:${NC}"
    echo " 19) Start All Port Forwards - Enable access to all services"
    echo " 20) Stop All Port Forwards  - Disable service access"
    echo " 21) Service Status Check    - Check which services are online"
    echo " 22) Open All Monitoring     - Open all monitoring tools"
    echo ""

    echo -e "${CYAN}🚪 EXIT:${NC}"
    echo "  0) Exit"
    echo ""
}

# Function to open all monitoring services
open_all_monitoring() {
    log_info "Opening all monitoring services..."
    echo ""

    local monitoring_services="prometheus grafana kiali jaeger"

    for service in $monitoring_services; do
        open_service "$service"
        sleep 1
    done
}

# Function to handle user input
handle_menu_choice() {
    local choice=$1

    case $choice in
        1) open_service "prometheus" ;;
        2) open_service "grafana" ;;
        3) open_service "kiali" ;;
        4) open_service "jaeger" ;;
        5) open_service "kibana" ;;
        6) open_service "elasticsearch" ;;
        7) open_service "rabbitmq" ;;
        8) open_service "pgadmin" ;;
        9) open_service "portainer" ;;
        10) open_service "api-gateway" ;;
        11) open_service "catalog-api" ;;
        12) open_service "basket-api" ;;
        13) open_service "discount-api" ;;
        14) open_service "ordering-api" ;;
        15) open_service "catalog-db" ;;
        16) open_service "basket-db" ;;
        17) open_service "discount-db" ;;
        18) open_service "ordering-db" ;;
        19) start_port_forwards ;;
        20) stop_port_forwards ;;
        21) display_service_status ;;
        22) open_all_monitoring ;;
        0)
            log_info "Goodbye! 👋"
            exit 0
            ;;
        *)
            log_error "Invalid choice. Please try again."
            echo ""
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    local missing_tools=()

    for tool in kubectl curl; do
        if ! command -v "$tool" &>/dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install the missing tools and try again."
        exit 1
    fi

    # Check if connected to cluster
    if ! kubectl cluster-info &>/dev/null; then
        log_warning "Not connected to Kubernetes cluster"
        log_info "Ensure kubectl is configured and you're connected to AWS EKS"
        echo ""
    fi
}

# Main function
main() {
    check_prerequisites

    while true; do
        display_header
        display_menu

        echo -n -e "${WHITE}Enter your choice (0-22): ${NC}"
        read -r choice
        echo ""

        handle_menu_choice "$choice"

        if [ "$choice" != "0" ]; then
            echo -e "${YELLOW}Press Enter to continue...${NC}"
            read -r
        fi
    done
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
