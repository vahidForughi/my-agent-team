#!/bin/bash

# 🌐 AWS EKS Service Access Portal - Smart Auto-Detection
# Works with both deploy-aws.sh and deploy-aws-minimal.sh
# Auto-detects namespaces and service names

# Note: NOT using 'set -e' because find_service returns non-zero when service not found
# This is expected behavior, not an error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Auto-detect available namespaces
detect_namespaces() {
    # Check which namespaces are available
    AVAILABLE_NAMESPACES=()
    for ns in dev default ecommerce monitoring istio-system kubernetes-dashboard; do
        if kubectl get namespace "$ns" &>/dev/null; then
            AVAILABLE_NAMESPACES+=("$ns")
        fi
    done
}

# Auto-detect service across multiple namespaces
# Returns: "service_name,namespace" if found, or empty string if not found
find_service() {
    local service_pattern=$1

    # Search across all available namespaces
    for namespace in "${AVAILABLE_NAMESPACES[@]}"; do
        # Try exact match first
        local svc=$(kubectl get svc -n "$namespace" "$service_pattern" -o name 2>/dev/null | sed 's|service/||')
        if [ -n "$svc" ]; then
            echo "$svc,$namespace"
            return 0
        fi

        # For API services, also try without eshopping- prefix
        # This handles: eshopping-catalog → catalog, eshopping-ordering → ordering
        if [[ "$service_pattern" == eshopping-* ]]; then
            local alt_pattern="${service_pattern#eshopping-}"
            svc=$(kubectl get svc -n "$namespace" "$alt_pattern" -o name 2>/dev/null | sed 's|service/||')
            if [ -n "$svc" ]; then
                echo "$svc,$namespace"
                return 0
            fi
        fi

        # Try pattern match (grep)
        svc=$(kubectl get svc -n "$namespace" 2>/dev/null | grep -i "$service_pattern" | head -1 | awk '{print $1}')
        if [ -n "$svc" ]; then
            echo "$svc,$namespace"
            return 0
        fi
    done

    echo ""
    return 1
}

# Initialize
detect_namespaces

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# Function to start port-forward
start_port_forward() {
    local svc_name=$1
    local ports=$2
    local desc=$3
    local namespace=$4

    log_info "Starting port-forward for $desc..."
    log_info "Service: $svc_name in namespace $namespace"

    # Convert ports format: "8010:80,9090:90" to multiple -p flags
    local port_args=""
    IFS=',' read -ra PORT_ARRAY <<< "$ports"
    for port_mapping in "${PORT_ARRAY[@]}"; do
        port_args="$port_args $port_mapping"
    done

    # Kill existing port-forward for these ports
    for port_mapping in "${PORT_ARRAY[@]}"; do
        local_port=$(echo "$port_mapping" | cut -d':' -f1)
        pkill -f "kubectl port-forward.*:$local_port" 2>/dev/null || true
    done

    # Start new port-forward in background
    kubectl port-forward -n "$namespace" "svc/$svc_name" $port_args > /dev/null 2>&1 &

    sleep 1
    log_success "Port-forward started: $desc"

    # Show access URL
    local first_port=$(echo "$ports" | cut -d',' -f1 | cut -d':' -f1)
    echo -e "${CYAN}  → Access at: http://localhost:$first_port${NC}"

    # Show credentials if known
    case "$svc_name" in
        *rabbitmq*) echo -e "${YELLOW}  🔑 Username: guest | Password: guest${NC}" ;;
        *grafana*) echo -e "${YELLOW}  🔑 Username: admin | Password: admin${NC}" ;;
        *kubernetes-dashboard*)
            echo -e "${YELLOW}  🔑 Token authentication required${NC}"
            echo -e "${CYAN}  → Generate token: kubectl -n kubernetes-dashboard create token admin-user${NC}"
            echo -e "${CYAN}  → Access: https://localhost:$first_port${NC}"
            ;;
    esac
    echo ""
}

# Start all port-forwards
start_all() {
    log_info "Starting all available services..."
    echo ""

    idx=0
    for service_def in "${available_services[@]}"; do
        if [ -n "$service_def" ]; then
            IFS='|' read -r svc_name ports desc namespace <<< "$service_def"
            start_port_forward "$svc_name" "$ports" "$desc" "$namespace"
        fi
        ((idx++))
    done

    log_success "All available services started!"
}

# Stop all port-forwards
stop_all() {
    log_info "Stopping all port-forwards..."
    pkill -f "kubectl port-forward" 2>/dev/null || true
    log_success "All port-forwards stopped!"
}

# Function to check if a service is accessible
check_service_health() {
    local svc_name=$1
    local port=$2
    local localhost_port=$(echo "$port" | cut -d':' -f1)

    if curl -s --max-time 2 "http://localhost:$localhost_port/" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to display service status
display_service_status() {
    echo -e "${PURPLE}📊 Service Status Check:${NC}"
    echo ""

    idx=1
    for service_def in "${available_services[@]}"; do
        if [ -n "$service_def" ]; then
            IFS='|' read -r svc_name ports desc namespace <<< "$service_def"
            local first_port=$(echo "$ports" | cut -d',' -f1 | cut -d':' -f1)

            printf "%-35s" "$desc"

            if check_service_health "$svc_name" "$ports"; then
                echo -e "${GREEN}✅ Online${NC}"
            else
                echo -e "${RED}❌ Offline${NC}"
            fi
        fi
        ((idx++))
    done
    echo ""
}

# Function to open all monitoring services
open_all_monitoring() {
    log_info "Opening all monitoring services..."
    echo ""

    # Monitoring services: indices for Prometheus (11), Grafana (12), Kiali (13), Jaeger (14)
    local monitoring_indices=(10 11 12 13)  # 0-indexed

    for idx in "${monitoring_indices[@]}"; do
        service_def="${available_services[$idx]}"

        if [ -n "$service_def" ]; then
            IFS='|' read -r svc_name ports desc namespace <<< "$service_def"
            local first_port=$(echo "$ports" | cut -d',' -f1 | cut -d':' -f1)
            local url="http://localhost:$first_port"

            log_info "Opening $desc at $url..."

            if check_service_health "$svc_name" "$ports"; then
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    open "$url" 2>/dev/null &
                elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                    xdg-open "$url" 2>/dev/null &
                fi
                sleep 1
            else
                log_warning "$desc is not accessible at $url"
            fi
        fi
    done

    log_success "All available monitoring services opened!"
    echo ""
}

# Function to run quick health check
quick_health_check() {
    log_info "Running quick health check on services..."
    echo ""

    echo -e "${CYAN}🔗 Service Gateway Health:${NC}"
    if curl -s --max-time 3 "http://localhost:8010/" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API Gateway${NC} - Responding at http://localhost:8010"
    else
        echo -e "${RED}❌ API Gateway${NC} - Not responding at http://localhost:8010"
    fi
    echo ""

    echo -e "${CYAN}📊 Infrastructure Health:${NC}"

    # Check RabbitMQ
    if curl -s --max-time 2 "http://localhost:15672/" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ RabbitMQ${NC} - Management UI accessible at http://localhost:15672"
    else
        echo -e "${RED}❌ RabbitMQ${NC} - Management UI not accessible"
    fi

    # Check Prometheus
    if curl -s --max-time 2 "http://localhost:9090/" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Prometheus${NC} - Metrics collection active at http://localhost:9090"
    else
        echo -e "${RED}❌ Prometheus${NC} - Not accessible"
    fi

    # Check Elasticsearch
    if curl -s --max-time 2 "http://localhost:9200/" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Elasticsearch${NC} - Search engine active at http://localhost:9200"
    else
        echo -e "${RED}❌ Elasticsearch${NC} - Not accessible"
    fi

    # Check Kibana
    if curl -s --max-time 2 "http://localhost:5601/" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Kibana${NC} - Log visualization active at http://localhost:5601"
    else
        echo -e "${RED}❌ Kibana${NC} - Not accessible"
    fi

    echo ""
}

# Display menu
display_menu() {
    echo -e "${WHITE}📋 Available Services:${NC}"
    echo ""

    idx=1
    for service_def in "${available_services[@]}"; do
        IFS='|' read -r pattern ports desc <<< "$service_def"

        if [ -n "$service_def" ]; then
            # Only show the description and ports info
            printf "${GREEN}  %2d) %-30s${NC}\n" "$idx" "$desc"
        else
            printf "${YELLOW}  %2d) %-30s${NC}\n" "$idx" "[Not available]"
        fi

        ((idx++))
    done

    echo ""
    echo -e "${CYAN}⚙️  MANAGEMENT OPTIONS:${NC}"
    echo " 97) Start All Port Forwards     - Enable access to all services"
    echo " 98) Stop All Port Forwards      - Disable service access"
    echo " 99) Service Status Check        - Check which services are online"
    echo "100) Open All Monitoring         - Open all monitoring tools in browser"
    echo "101) Quick Health Check          - Test all service endpoints"
    echo "102) Refresh Service List        - Re-scan namespaces for services"
    echo ""
    echo -e "${CYAN}🚪 EXIT:${NC}"
    echo "   0) Exit"
    echo ""
}

# Function to rebuild service list
rebuild_service_list() {
    log_info "Scanning for services across all namespaces..."
    available_services=()

    idx=1
    for service_def in "${SERVICES[@]}"; do
        IFS='|' read -r pattern ports desc <<< "$service_def"

        # Try to find the service (searches across all namespaces)
        svc_result=$(find_service "$pattern")

        if [ -n "$svc_result" ]; then
            # Parse "service_name,namespace" format
            svc_name=$(echo "$svc_result" | cut -d',' -f1)
            svc_namespace=$(echo "$svc_result" | cut -d',' -f2)
            printf "${GREEN}  %2d) %-30s ${CYAN}[✓ Found: %s (ns: %s)]${NC}\\n" "$idx" "$desc" "$svc_name" "$svc_namespace"
            available_services+=("$svc_name|$ports|$desc|$svc_namespace")
        else
            printf "${YELLOW}  %2d) %-30s ${RED}[✗ Not found]${NC}\\n" "$idx" "$desc"
            available_services+=("")
        fi

        ((idx++))
    done
    echo ""
}

# Main loop
main() {
    while true; do
        clear
        echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║       🚀 AWS EKS SERVICE ACCESS (Smart Auto-Detection)        ║${NC}"
        echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
        echo ""

        display_menu

        echo -n -e "${WHITE}Enter your choice: ${NC}"
        read -r choice
        echo ""

        case "$choice" in
            0)
                log_info "Goodbye! 👋"
                exit 0
                ;;
            97)
                start_all
                ;;
            98)
                stop_all
                ;;
            99)
                display_service_status
                ;;
            100)
                open_all_monitoring
                ;;
            101)
                quick_health_check
                ;;
            102)
                rebuild_service_list
                ;;
            *)
                if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#available_services[@]}" ]; then
                    idx=$((choice - 1))
                    service_def="${available_services[$idx]}"

                    if [ -n "$service_def" ]; then
                        IFS='|' read -r svc_name ports desc namespace <<< "$service_def"
                        start_port_forward "$svc_name" "$ports" "$desc" "$namespace"
                    else
                        log_error "Service not available in this deployment"
                    fi
                else
                    log_error "Invalid choice"
                fi
                ;;
        esac

        echo ""
        echo -e "${YELLOW}Press Enter to continue...${NC}"
        read -r
    done
}

# Initial service discovery
log_info "🔍 Scanning for services across all namespaces..."
echo ""

# Service definitions: pattern, port, description
# Pattern matching is done with grep, so be specific to avoid false matches
declare -a SERVICES=(
    "rabbitmq|15672:15672,5672:5672|RabbitMQ Management UI"
    "eshopping-ocelotapigw|8010:80|API Gateway (Ocelot)"
    "eshopping-catalog|8001:80|Catalog API"
    "eshopping-basket|8002:80|Basket API"
    "eshopping-discount-discount-grpc|8003:8080|Discount API (gRPC)"
    "eshopping-ordering|8004:80|Ordering API"
    "catalogdb|27017:27017|Catalog MongoDB"
    "basketdb|6379:6379|Basket Redis"
    "discountdb|5432:5432|Discount PostgreSQL"
    "eshopping-orderdb|1433:1433|Order SQL Server"
    "prometheus-server|9090:80|Prometheus Metrics"
    "grafana|3000:80|Grafana Dashboards"
    "kiali|20001:20001|Kiali Service Mesh"
    "tracing|16686:80|Jaeger Tracing"
    "kubernetes-dashboard|8443:443|Kubernetes Dashboard"
    "kibana|5601:5601|Kibana Logs"
    "elasticsearch|9200:9200|Elasticsearch"
    "pgadmin|5050:80|pgAdmin"
    "portainer|9000:9000|Portainer"
)

declare -a available_services=()
rebuild_service_list

# Run main loop
main "$@"
