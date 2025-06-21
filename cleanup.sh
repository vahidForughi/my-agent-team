#!/bin/bash

# 🧹 Cleanup Platform Script - Remove All Deployed Resources
# Use this script to completely clean up the platform

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🧹 ==============================================="
echo "🧹  PLATFORM CLEANUP SCRIPT"
echo "🧹 ==============================================="
echo ""
log_warning "This will remove ALL deployed resources!"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 1
fi

# Kill port forwards
log_info "Stopping port forwards..."
pkill -f "kubectl port-forward" || true
pkill -f "npm start" || true
sleep 2

# Remove Helm releases
log_info "Removing Helm releases..."
helm uninstall eshopping-basket eshopping-basketdb eshopping-catalog eshopping-catalogdb eshopping-discount eshopping-discountdb eshopping-gateway eshopping-orderdb eshopping-ordering eshopping-rabbitmq eshopping-elasticsearch eshopping-kibana -n default || true

helm uninstall prometheus -n monitoring || true

# Remove namespaces
log_info "Removing namespaces..."
kubectl delete namespace monitoring istio-system || true

# Remove any remaining resources
log_info "Cleaning up remaining resources..."
kubectl delete all --all -n default || true

# Stop minikube (optional)
read -p "Do you want to stop minikube? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Stopping minikube..."
    minikube stop
fi

# Delete minikube (optional)
read -p "Do you want to delete the entire minikube cluster? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Deleting minikube cluster..."
    minikube delete
fi

echo ""
echo "🎉 ==============================================="
echo "🎉  CLEANUP COMPLETED!"
echo "🎉 ==============================================="
echo ""
echo "✅ Helm releases removed"
echo "✅ Namespaces cleaned up"
echo "✅ Port forwards stopped"
echo "✅ Background processes stopped"
echo ""
echo "To redeploy the platform, run:"
echo "   ./deploy.sh"
echo "" 