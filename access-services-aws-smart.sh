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

# Auto-detect namespace
detect_namespace() {
    # Try common namespaces in order
    for ns in dev default ecommerce; do
        if kubectl get namespace "$ns" &>/dev/null; then
            NAMESPACE="$ns"
            return 0
        fi
    done
    NAMESPACE="default"
}

# Auto-detect service name
find_service() {
    local service_pattern=$1
    local namespace=$2

    # Try exact match first
    local svc=$(kubectl get svc -n "$namespace" "$service_pattern" -o name 2>/dev/null | sed 's|service/||')
    if [ -n "$svc" ]; then
        echo "$svc"
        return 0
    fi

    # For API services, also try without eshopping- prefix
    # This handles: eshopping-catalog → catalog, eshopping-ordering → ordering
    if [[ "$service_pattern" == eshopping-* ]]; then
        local alt_pattern="${service_pattern#eshopping-}"
        svc=$(kubectl get svc -n "$namespace" "$alt_pattern" -o name 2>/dev/null | sed 's|service/||')
        if [ -n "$svc" ]; then
            echo "$svc"
            return 0
        fi
    fi

    # Try pattern match (grep)
    svc=$(kubectl get svc -n "$namespace" 2>/dev/null | grep -i "$service_pattern" | head -1 | awk '{print $1}')
    if [ -n "$svc" ]; then
        echo "$svc"
        return 0
    fi

    echo ""
    return 1
}

# Initialize
detect_namespace

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

clear
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       🚀 AWS EKS SERVICE ACCESS (Smart Auto-Detection)        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Detected namespace: ${NAMESPACE}"
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
    "grafana|3000:3000|Grafana Dashboards"
    "kiali|20001:20001|Kiali Service Mesh"
    "tracing|16686:80|Jaeger Tracing"
    "kibana|5601:5601|Kibana Logs"
    "elasticsearch|9200:9200|Elasticsearch"
    "pgadmin|5050:80|pgAdmin"
    "portainer|9000:9000|Portainer"
)

# Display menu
echo -e "${WHITE}📋 Available Services:${NC}"
echo ""

idx=1
available_services=()
for service_def in "${SERVICES[@]}"; do
    IFS='|' read -r pattern ports desc <<< "$service_def"

    # Try to find the service
    svc_name=$(find_service "$pattern" "$NAMESPACE")

    if [ -n "$svc_name" ]; then
        printf "${GREEN}  %2d) %-30s ${CYAN}[✓ Found: %s]${NC}\n" "$idx" "$desc" "$svc_name"
        available_services+=("$svc_name|$ports|$desc")
    else
        printf "${YELLOW}  %2d) %-30s ${RED}[✗ Not found]${NC}\n" "$idx" "$desc"
        available_services+=("")
    fi

    ((idx++))
done

echo ""
echo -e "${CYAN}⚙️  MANAGEMENT:${NC}"
echo "  97) Start All Port Forwards"
echo "  98) Stop All Port Forwards"
echo "  99) Refresh Service List"
echo "   0) Exit"
echo ""

# Function to start port-forward
start_port_forward() {
    local svc_name=$1
    local ports=$2
    local desc=$3

    log_info "Starting port-forward for $desc..."
    log_info "Service: $svc_name in namespace $NAMESPACE"

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
    kubectl port-forward -n "$NAMESPACE" "svc/$svc_name" $port_args > /dev/null 2>&1 &

    sleep 1
    log_success "Port-forward started: $desc"

    # Show access URL
    local first_port=$(echo "$ports" | cut -d',' -f1 | cut -d':' -f1)
    echo -e "${CYAN}  → Access at: http://localhost:$first_port${NC}"

    # Show credentials if known
    case "$svc_name" in
        *rabbitmq*) echo -e "${YELLOW}  🔑 Username: guest | Password: guest${NC}" ;;
        *grafana*) echo -e "${YELLOW}  🔑 Username: admin | Password: prom-operator${NC}" ;;
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
            IFS='|' read -r svc_name ports desc <<< "$service_def"
            start_port_forward "$svc_name" "$ports" "$desc"
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

# Main loop
while true; do
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
            exec "$0"
            ;;
        *)
            if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#available_services[@]}" ]; then
                idx=$((choice - 1))
                service_def="${available_services[$idx]}"

                if [ -n "$service_def" ]; then
                    IFS='|' read -r svc_name ports desc <<< "$service_def"
                    start_port_forward "$svc_name" "$ports" "$desc"
                else
                    log_error "Service not available in this deployment"
                fi
            else
                log_error "Invalid choice"
            fi
            ;;
    esac

    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read -r
    clear
    exec "$0"
done
