#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENV_NAME="${1:-dev}"
AWS_REGION="${2:-ap-southeast-1}"
AWS_ACCOUNT_ID="471112812838"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FRESH ECOMMERCE DEPLOYMENT (Core Services Only)         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo -e "Environment: ${ENV_NAME}, Region: ${AWS_REGION}"

# Wait for previous stacks to delete (max 10 minutes)
echo -e "\n${YELLOW}Waiting for old infrastructure to be deleted...${NC}"
for i in {1..60}; do
    if ! aws cloudformation describe-stacks --stack-name dev-eks --region ${AWS_REGION} &>/dev/null; then
        echo -e "${GREEN}✓ Old EKS stack removed${NC}"
        break
    fi
    if [ $((i % 10)) -eq 0 ]; then
        echo -ne "  Still deleting... ($i/60 checks)\r"
    fi
    sleep 10
done

# ============================================================================
# 1. CREATE FRESH VPC
# ============================================================================
echo -e "\n${BLUE}[1/5] Creating VPC...${NC}"

aws cloudformation create-stack \
    --stack-name dev-vpc \
    --template-body file://Deployments/infrastructure/vpc.yaml \
    --region ${AWS_REGION} \
    --parameters ParameterKey=EnvironmentName,ParameterValue=${ENV_NAME} \
    2>&1 | grep -i "stackid\|already exists" | head -1 || echo "  Stack creation in progress"

echo -e "${GREEN}✓ VPC stack created${NC}"

# ============================================================================
# 2. CREATE FRESH EKS CLUSTER
# ============================================================================
echo -e "\n${BLUE}[2/5] Creating EKS Cluster...${NC}"

aws cloudformation create-stack \
    --stack-name dev-eks \
    --template-body file://Deployments/infrastructure/eks.yaml \
    --region ${AWS_REGION} \
    --parameters \
        ParameterKey=EnvironmentName,ParameterValue=${ENV_NAME} \
        ParameterKey=KeyName,ParameterValue=${ENV_NAME} \
    --capabilities CAPABILITY_NAMED_IAM \
    2>&1 | grep -i "stackid\|already exists" | head -1 || echo "  Stack creation in progress"

echo -e "${YELLOW}Waiting for EKS cluster to be ACTIVE (this takes ~10 minutes)...${NC}"
aws eks wait cluster-active --name ${ENV_NAME}-eks --region ${AWS_REGION} 2>&1 | grep -v "^Waiting" || true
echo -e "${GREEN}✓ EKS cluster is ACTIVE${NC}"

# ============================================================================
# 3. SETUP KUBECTL
# ============================================================================
echo -e "\n${BLUE}[3/5] Configuring kubectl...${NC}"

aws eks update-kubeconfig --name ${ENV_NAME}-eks --region ${AWS_REGION} 2>&1 | grep -i "updated\|added" | head -1 || echo "Config updated"

# Wait for nodes
echo -e "${YELLOW}Waiting for nodes to be Ready...${NC}"
for i in {1..60}; do
    READY_NODES=$(kubectl get nodes --no-headers 2>/dev/null | grep -c " Ready " || echo "0")
    if [ "$READY_NODES" -ge 1 ]; then
        echo -e "${GREEN}✓ Nodes are Ready${NC}"
        break
    fi
    if [ $((i % 10)) -eq 0 ]; then
        echo -ne "  Waiting for nodes... ($i/60 attempts)\r"
    fi
    sleep 5
done

echo -e "${GREEN}✓ Cluster ready${NC}"

# ============================================================================
# 4. DEPLOY CORE SERVICES
# ============================================================================
echo -e "\n${BLUE}[4/5] Deploying core services...${NC}"

# Create namespace
kubectl create namespace ${ENV_NAME} --dry-run=client -o yaml | kubectl apply -f -

# Deploy databases via helm (in parallel)
echo -e "${YELLOW}Deploying databases...${NC}"
for db in catalogdb basketdb discountdb orderdb rabbitmq elasticsearch; do
    helm repo add ecommerce-charts . 2>/dev/null || true
    helm upgrade --install eshopping-${db} Deployments/helm/${db} \
        -n ${ENV_NAME} --wait --timeout 180s &
done
wait

echo -e "${YELLOW}Deploying microservices...${NC}"
for service in catalog basket ordering discount; do
    helm upgrade --install eshopping-${service} Deployments/helm/${service} \
        -n ${ENV_NAME} --wait --timeout 180s &
done
wait

echo -e "${YELLOW}Deploying API Gateway...${NC}"
helm upgrade --install eshopping-ocelotapigw Deployments/helm/ocelotapigw \
    -n ${ENV_NAME} --wait --timeout 180s

echo -e "${GREEN}✓ Services deployed${NC}"

# ============================================================================
# 5. SUMMARY
# ============================================================================
echo -e "\n${BLUE}[5/5] Deployment Summary${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "Cluster: ${ENV_NAME}-eks"
echo -e "Namespace: ${ENV_NAME}"
echo -e "Region: ${AWS_REGION}"
echo ""
echo -e "${GREEN}✓ Databases:${NC}"
kubectl get pods -n ${ENV_NAME} -l app.kubernetes.io/part-of=databases --no-headers 2>/dev/null | wc -l | xargs echo "  Pods running:"

echo -e "${GREEN}✓ Microservices:${NC}"
kubectl get pods -n ${ENV_NAME} -l app.kubernetes.io/part-of=microservices --no-headers 2>/dev/null | wc -l | xargs echo "  Pods running:"

echo -e "${GREEN}✓ API Gateway:${NC}"
kubectl get pods -n ${ENV_NAME} -l app=eshopping-ocelotapigw --no-headers 2>/dev/null | wc -l | xargs echo "  Pods running:"

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Check all pods: kubectl get pods -n ${ENV_NAME}"
echo -e "  2. Port-forward API: kubectl port-forward -n ${ENV_NAME} svc/ocelotapigw 8080:80"
echo -e "  3. Test API: curl http://localhost:8080/api/v1/Catalog/GetAllProducts"
echo -e "  4. Deploy frontend: helm install frontend client/"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
