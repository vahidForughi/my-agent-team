#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  FIXING AWS DEPLOYMENT                                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Issues Found:${NC}"
echo "  1. Docker images built for ARM64, but EKS needs AMD64"
echo "  2. Single t3.small node too small for all pods"
echo ""
echo -e "${YELLOW}Fixes:${NC}"
echo "  1. Rebuild images for AMD64 platform"
echo "  2. Scale node group to 2 t3.small nodes"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# ============================================================================
# FIX 1: Rebuild Images for AMD64
# ============================================================================
echo -e "\n${BLUE}[1/3] Rebuilding Docker images for AMD64...${NC}"

# Login to ECR
aws ecr get-login-password --region "${AWS_REGION}" | \
    docker login --username AWS --password-stdin "${ECR_REGISTRY}"

# Build for AMD64 platform
build_and_push() {
    local image=$1
    local dockerfile=$2

    echo -e "${YELLOW}Building ${image} for linux/amd64...${NC}"
    docker buildx build --platform linux/amd64 \
        -f "${dockerfile}" \
        -t "${ECR_REGISTRY}/${image}:latest" \
        . --push
    echo -e "${GREEN}✓ Pushed: ${image}${NC}"
}

build_and_push "catalogapi" "Services/Catalog/Catalog.API/Dockerfile"
build_and_push "basketapi" "Services/Basket/Basket.API/Dockerfile"
build_and_push "discountapi" "Services/Discount/Discount.API/Dockerfile"
build_and_push "orderingapi" "Services/Ordering/Ordering.API/Dockerfile"
build_and_push "ocelotapigateway" "ApiGateways/Ocelot.ApiGateway/Dockerfile"

echo -e "${GREEN}✓ All images rebuilt for AMD64${NC}"

# ============================================================================
# FIX 2: Scale Node Group
# ============================================================================
echo -e "\n${BLUE}[2/3] Scaling EKS node group to 2 nodes...${NC}"

aws eks update-nodegroup-config \
    --cluster-name dev-ecommerce-eks \
    --nodegroup-name dev-nodegroup \
    --scaling-config minSize=1,maxSize=3,desiredSize=2 \
    --region "${AWS_REGION}"

echo -e "${YELLOW}Waiting for nodes to be ready (2-3 minutes)...${NC}"
sleep 30

# Wait for 2 nodes
for i in {1..30}; do
    READY_NODES=$(kubectl get nodes --no-headers 2>/dev/null | grep " Ready " | wc -l)
    if [ "$READY_NODES" -ge 2 ]; then
        echo -e "${GREEN}✓ 2 nodes are Ready${NC}"
        break
    fi
    if [ $((i % 5)) -eq 0 ]; then
        echo -ne "  Waiting... ($READY_NODES/2 nodes ready)\\r"
    fi
    sleep 10
done

# ============================================================================
# FIX 3: Restart Failed Pods
# ============================================================================
echo -e "\n${BLUE}[3/3] Restarting failed pods...${NC}"

# Delete failed pods to trigger recreation with new images
kubectl delete pod -n dev -l app=eshopping-catalog --force --grace-period=0 2>/dev/null || true
kubectl delete pod -n dev -l app=eshopping-basket --force --grace-period=0 2>/dev/null || true
kubectl delete pod -n dev -l app=eshopping-discount --force --grace-period=0 2>/dev/null || true
kubectl delete pod -n dev -l app=eshopping-ordering --force --grace-period=0 2>/dev/null || true
kubectl delete pod -n dev -l app=eshopping-ocelotapigw --force --grace-period=0 2>/dev/null || true

echo -e "${YELLOW}Waiting for pods to restart (2-3 minutes)...${NC}"
sleep 30

# ============================================================================
# VERIFICATION
# ============================================================================
echo -e "\n${BLUE}Deployment Status:${NC}"
kubectl get pods -n dev

echo ""
echo -e "${BLUE}Node Status:${NC}"
kubectl get nodes

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  FIXES APPLIED                                                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Check pod status:${NC}"
echo "  kubectl get pods -n dev"
echo ""
echo -e "${YELLOW}Check logs if any pod fails:${NC}"
echo "  kubectl logs -n dev <pod-name>"
echo ""
echo -e "${YELLOW}Test API Gateway (wait for pods to be Running):${NC}"
echo "  kubectl port-forward -n dev svc/eshopping-ocelotapigw 8080:80"
echo "  curl http://localhost:8080/Catalog/GetAllProducts"
echo ""
