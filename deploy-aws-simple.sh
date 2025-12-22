#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_NAME="${1:-dev}"
AWS_REGION="${2:-ap-southeast-1}"
NAMESPACE="${ENV_NAME}"

# AWS Configuration
AWS_ACCOUNT_ID="471112812838"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
S3_BUCKET="ecommerce-product-images-${AWS_ACCOUNT_ID}"

echo -e "${BLUE}=== SIMPLIFIED ECOMMERCE DEPLOYMENT (Core Services Only) ===${NC}"
echo -e "${BLUE}Environment: ${ENV_NAME}, Region: ${AWS_REGION}${NC}"

# ============================================================================
# 1. Verify Prerequisites
# ============================================================================
echo -e "\n${BLUE}[1/7] Verifying prerequisites...${NC}"

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}[ERROR] kubectl not found${NC}"
    exit 1
fi

if ! command -v helm &> /dev/null; then
    echo -e "${RED}[ERROR] helm not found${NC}"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo -e "${RED}[ERROR] aws CLI not found${NC}"
    exit 1
fi

echo -e "${GREEN}[✓] All CLI tools found${NC}"

# ============================================================================
# 2. Setup Kubernetes Namespace
# ============================================================================
echo -e "\n${BLUE}[2/7] Setting up namespace...${NC}"

if kubectl get namespace "${NAMESPACE}" &>/dev/null; then
    echo -e "${YELLOW}[i] Namespace '${NAMESPACE}' already exists${NC}"
else
    kubectl create namespace "${NAMESPACE}"
    echo -e "${GREEN}[✓] Namespace '${NAMESPACE}' created${NC}"
fi

# Create image pull secret for ECR
aws ecr get-login-password --region "${AWS_REGION}" | \
  docker login --username AWS --password-stdin "${ECR_REGISTRY}" &>/dev/null || true

kubectl create secret docker-registry ecr-registry \
  --docker-server="${ECR_REGISTRY}" \
  --docker-username=AWS \
  --docker-password="$(aws ecr get-login-password --region "${AWS_REGION}")" \
  -n "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f - &>/dev/null

echo -e "${GREEN}[✓] Namespace configured${NC}"

# ============================================================================
# 3. Deploy Core Databases
# ============================================================================
echo -e "\n${BLUE}[3/7] Deploying core databases...${NC}"

CORE_DATABASES=("catalogdb" "basketdb" "discountdb" "orderdb" "rabbitmq" "elasticsearch")

for db in "${CORE_DATABASES[@]}"; do
    echo -e "${YELLOW}[i] Deploying ${db}...${NC}"
    
    helm upgrade --install "eshopping-${db}" \
        "Deployments/helm/${db}" \
        -n "${NAMESPACE}" \
        --wait \
        --timeout 300s \
        2>&1 | grep -E "released|deployed|STATUS" | head -1 || echo "Installation in progress"
done

# Wait for all database pods to be ready
echo -e "${YELLOW}[i] Waiting for database pods...${NC}"
for db in "${CORE_DATABASES[@]}"; do
    kubectl rollout status deployment "eshopping-${db}" -n "${NAMESPACE}" --timeout=300s &>/dev/null || \
    kubectl wait --for=condition=Ready pod -l "app=eshopping-${db}" -n "${NAMESPACE}" --timeout=300s &>/dev/null || true
done

echo -e "${GREEN}[✓] Core databases deployed${NC}"

# ============================================================================
# 4. Setup IRSA for Catalog S3 Access
# ============================================================================
echo -e "\n${BLUE}[4/7] Setting up IRSA for S3 access...${NC}"

# Get OIDC Provider
OIDC_PROVIDER=$(aws eks describe-cluster --name "${ENV_NAME}-eks" --region "${AWS_REGION}" \
  --query 'cluster.identity.oidc.issuer' --output text | sed -e "s/^https:\/\///" || echo "")

if [ -z "${OIDC_PROVIDER}" ]; then
    echo -e "${RED}[ERROR] Could not get OIDC provider${NC}"
else
    echo -e "${YELLOW}[i] OIDC Provider: ${OIDC_PROVIDER}${NC}"
fi

# Create IAM policy for S3 access
cat > /tmp/s3-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::${S3_BUCKET}",
        "arn:aws:s3:::${S3_BUCKET}/*"
      ]
    }
  ]
}
EOF

POLICY_NAME="${ENV_NAME}-catalog-s3-policy"
if aws iam get-policy --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}" &>/dev/null; then
    echo -e "${YELLOW}[i] Policy already exists: ${POLICY_NAME}${NC}"
else
    aws iam create-policy \
        --policy-name "${POLICY_NAME}" \
        --policy-document file:///tmp/s3-policy.json &>/dev/null
    echo -e "${GREEN}[✓] IAM policy created${NC}"
fi

# Create trust relationship
cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${OIDC_PROVIDER}:sub": "system:serviceaccount:${NAMESPACE}:catalog",
          "${OIDC_PROVIDER}:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
EOF

ROLE_NAME="${ENV_NAME}-catalog-s3-role"
if aws iam get-role --role-name "${ROLE_NAME}" &>/dev/null; then
    echo -e "${YELLOW}[i] Role already exists: ${ROLE_NAME}${NC}"
else
    aws iam create-role \
        --role-name "${ROLE_NAME}" \
        --assume-role-policy-document file:///tmp/trust-policy.json &>/dev/null
    echo -e "${GREEN}[✓] IAM role created${NC}"
fi

# Attach policy to role
aws iam attach-role-policy \
    --role-name "${ROLE_NAME}" \
    --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}" &>/dev/null

echo -e "${GREEN}[✓] IRSA configured${NC}"

# ============================================================================
# 5. Deploy Microservices
# ============================================================================
echo -e "\n${BLUE}[5/7] Deploying microservices...${NC}"

MICROSERVICES=("catalog" "basket" "ordering" "discount")

for service in "${MICROSERVICES[@]}"; do
    echo -e "${YELLOW}[i] Deploying ${service}...${NC}"
    
    helm upgrade --install "eshopping-${service}" \
        "Deployments/helm/${service}" \
        -n "${NAMESPACE}" \
        --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${ROLE_NAME}" \
        --wait \
        --timeout 300s \
        2>&1 | grep -E "released|deployed|STATUS" | head -1 || echo "Installation in progress"
done

# Wait for microservices
echo -e "${YELLOW}[i] Waiting for microservices...${NC}"
for service in "${MICROSERVICES[@]}"; do
    kubectl rollout status deployment "eshopping-${service}" -n "${NAMESPACE}" --timeout=300s &>/dev/null || \
    kubectl wait --for=condition=Ready pod -l "app=eshopping-${service}" -n "${NAMESPACE}" --timeout=300s &>/dev/null || true
done

echo -e "${GREEN}[✓] Microservices deployed${NC}"

# ============================================================================
# 6. Deploy API Gateway
# ============================================================================
echo -e "\n${BLUE}[6/7] Deploying API Gateway...${NC}"

helm upgrade --install eshopping-ocelotapigw \
    "Deployments/helm/ocelotapigw" \
    -n "${NAMESPACE}" \
    --wait \
    --timeout 300s \
    2>&1 | grep -E "released|deployed|STATUS" | head -1 || echo "Installation in progress"

kubectl rollout status deployment eshopping-ocelotapigw -n "${NAMESPACE}" --timeout=300s &>/dev/null || true

echo -e "${GREEN}[✓] API Gateway deployed${NC}"

# ============================================================================
# 7. Deployment Summary
# ============================================================================
echo -e "\n${BLUE}[7/7] Deployment Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Environment: ${NAMESPACE}"
echo -e "Region: ${AWS_REGION}"
echo -e ""
echo -e "${GREEN}✓ Core Databases:${NC}"
kubectl get pods -n "${NAMESPACE}" -l app.kubernetes.io/instance=eshopping-catalogdb,eshopping-basketdb,eshopping-discountdb,eshopping-orderdb,eshopping-rabbitmq,eshopping-elasticsearch --no-headers 2>/dev/null || echo "  (Starting...)"
echo -e ""
echo -e "${GREEN}✓ Microservices:${NC}"
kubectl get pods -n "${NAMESPACE}" -l app=eshopping-catalog,eshopping-basket,eshopping-ordering,eshopping-discount --no-headers 2>/dev/null || echo "  (Starting...)"
echo -e ""
echo -e "${GREEN}✓ API Gateway:${NC}"
kubectl get pods -n "${NAMESPACE}" -l app=eshopping-ocelotapigw --no-headers 2>/dev/null || echo "  (Starting...)"
echo -e ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Check pod status: kubectl get pods -n ${NAMESPACE}"
echo -e "  2. Access API Gateway: kubectl port-forward -n ${NAMESPACE} svc/ocelotapigw 8080:80"
echo -e "  3. Test Catalog API: curl http://localhost:8080/api/v1/Catalog/GetAllProducts"
echo -e "  4. Deploy frontend when ready: helm install frontend client/"
echo -e ""
echo -e "${YELLOW}Monitoring (Optional - Deploy Later):${NC}"
echo -e "  helm install eshopping-kibana Deployments/helm/kibana -n ${NAMESPACE}"
echo -e "  kubectl port-forward -n ${NAMESPACE} svc/kibana 5601:5601"
echo -e ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
