#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SETTING UP HTTPS WITH SELF-SIGNED CERTIFICATE                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
NAMESPACE="dev"
CERT_DIR="./certs"
CERT_NAME="api-gateway-tls"
DOMAIN="ecommerce.local"
VALIDITY_DAYS=365

# ============================================================================
# STEP 1: Generate Self-Signed Certificate
# ============================================================================
echo -e "${BLUE}[1/5] Generating self-signed SSL certificate...${NC}"

# Create certs directory
mkdir -p "${CERT_DIR}"

# Generate private key
echo -e "${YELLOW}Generating private key...${NC}"
openssl genrsa -out "${CERT_DIR}/tls.key" 2048

# Generate certificate signing request (CSR)
echo -e "${YELLOW}Generating certificate signing request...${NC}"
openssl req -new -key "${CERT_DIR}/tls.key" -out "${CERT_DIR}/tls.csr" \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=IT/CN=${DOMAIN}"

# Generate self-signed certificate
echo -e "${YELLOW}Generating self-signed certificate (valid for ${VALIDITY_DAYS} days)...${NC}"
openssl x509 -req -days ${VALIDITY_DAYS} \
    -in "${CERT_DIR}/tls.csr" \
    -signkey "${CERT_DIR}/tls.key" \
    -out "${CERT_DIR}/tls.crt" \
    -extfile <(printf "subjectAltName=DNS:${DOMAIN},DNS:*.${DOMAIN}")

echo -e "${GREEN}✓ Certificate generated${NC}"
echo -e "  Certificate: ${CERT_DIR}/tls.crt"
echo -e "  Private Key: ${CERT_DIR}/tls.key"
echo ""

# Display certificate info
echo -e "${YELLOW}Certificate Details:${NC}"
openssl x509 -in "${CERT_DIR}/tls.crt" -text -noout | grep -E "Subject:|Issuer:|Not Before|Not After|DNS:"
echo ""

# ============================================================================
# STEP 2: Create Kubernetes Secret
# ============================================================================
echo -e "${BLUE}[2/5] Creating Kubernetes TLS Secret...${NC}"

# Check if namespace exists
if ! kubectl get namespace "${NAMESPACE}" > /dev/null 2>&1; then
    echo -e "${YELLOW}Creating namespace: ${NAMESPACE}${NC}"
    kubectl create namespace "${NAMESPACE}"
fi

# Delete existing secret if present
kubectl delete secret "${CERT_NAME}" -n "${NAMESPACE}" 2>/dev/null || true

# Create TLS secret
kubectl create secret tls "${CERT_NAME}" \
    --cert="${CERT_DIR}/tls.crt" \
    --key="${CERT_DIR}/tls.key" \
    -n "${NAMESPACE}"

echo -e "${GREEN}✓ Kubernetes secret created: ${CERT_NAME}${NC}"
echo ""

# ============================================================================
# STEP 3: Update API Gateway Deployment to Mount Certificate
# ============================================================================
echo -e "${BLUE}[3/5] Updating API Gateway deployment for HTTPS...${NC}"

# Get the current deployment
DEPLOYMENT_NAME=$(kubectl get deployment -n "${NAMESPACE}" -l app.kubernetes.io/name=ocelotapigw -o jsonpath='{.items[0].metadata.name}')

if [ -z "${DEPLOYMENT_NAME}" ]; then
    echo -e "${RED}Error: API Gateway deployment not found in namespace ${NAMESPACE}${NC}"
    exit 1
fi

echo -e "${YELLOW}Found deployment: ${DEPLOYMENT_NAME}${NC}"

# Patch deployment to mount the certificate using strategic merge
cat > /tmp/deployment-patch.json <<EOF
{
  "spec": {
    "template": {
      "spec": {
        "volumes": [
          {
            "name": "tls-cert",
            "secret": {
              "secretName": "${CERT_NAME}"
            }
          }
        ],
        "containers": [
          {
            "name": "ocelotapigateway",
            "volumeMounts": [
              {
                "name": "tls-cert",
                "mountPath": "/app/certs",
                "readOnly": true
              }
            ],
            "env": [
              {
                "name": "ASPNETCORE_URLS",
                "value": "http://+:80;https://+:443"
              },
              {
                "name": "ASPNETCORE_HTTPS_PORT",
                "value": "443"
              },
              {
                "name": "ASPNETCORE_Kestrel__Certificates__Default__Path",
                "value": "/app/certs/tls.crt"
              },
              {
                "name": "ASPNETCORE_Kestrel__Certificates__Default__KeyPath",
                "value": "/app/certs/tls.key"
              }
            ],
            "ports": [
              {
                "containerPort": 80,
                "protocol": "TCP",
                "name": "http"
              },
              {
                "containerPort": 443,
                "protocol": "TCP",
                "name": "https"
              }
            ]
          }
        ]
      }
    }
  }
}
EOF

echo -e "${YELLOW}Patching deployment with HTTPS configuration...${NC}"
kubectl patch deployment "${DEPLOYMENT_NAME}" -n "${NAMESPACE}" --type strategic --patch-file /tmp/deployment-patch.json

echo -e "${GREEN}✓ Deployment updated${NC}"
echo ""

# ============================================================================
# STEP 4: Wait for Rollout
# ============================================================================
echo -e "${BLUE}[4/5] Waiting for deployment rollout...${NC}"

kubectl rollout status deployment "${DEPLOYMENT_NAME}" -n "${NAMESPACE}" --timeout=300s

echo -e "${GREEN}✓ Rollout completed${NC}"
echo ""

# ============================================================================
# STEP 5: Get LoadBalancer HTTPS Endpoint
# ============================================================================
echo -e "${BLUE}[5/5] Getting HTTPS endpoint...${NC}"

# Wait for LoadBalancer to get external IP
echo -e "${YELLOW}Waiting for LoadBalancer endpoint (this may take 2-3 minutes)...${NC}"
for i in {1..60}; do
    LB_HOSTNAME=$(kubectl get svc -n "${NAMESPACE}" -l app.kubernetes.io/name=ocelotapigw -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
    if [ -n "${LB_HOSTNAME}" ]; then
        break
    fi
    if [ $((i % 10)) -eq 0 ]; then
        echo -e "  Still waiting... (${i}s elapsed)"
    fi
    sleep 3
done

if [ -z "${LB_HOSTNAME}" ]; then
    echo -e "${RED}Warning: LoadBalancer endpoint not available yet${NC}"
    echo -e "Run this command to check: kubectl get svc -n ${NAMESPACE} -l app.kubernetes.io/name=ocelotapigw"
else
    echo -e "${GREEN}✓ LoadBalancer endpoint ready${NC}"
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  HTTPS SETUP COMPLETE                                          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}HTTPS Endpoint:${NC}"
    echo -e "  https://${LB_HOSTNAME}"
    echo ""
    echo -e "${YELLOW}Test with curl (ignore certificate warning for self-signed):${NC}"
    echo -e "  curl -k https://${LB_HOSTNAME}/Catalog/GetAllProducts"
    echo ""
    echo -e "${YELLOW}HTTP Endpoint (still works):${NC}"
    echo -e "  http://${LB_HOSTNAME}/Catalog/GetAllProducts"
    echo ""
    echo -e "${YELLOW}Note:${NC}"
    echo -e "  - This is a self-signed certificate for TESTING only"
    echo -e "  - Browsers will show a security warning (expected)"
    echo -e "  - Use -k flag with curl to bypass certificate validation"
    echo -e "  - For production, use AWS Certificate Manager (ACM) with a real domain"
    echo ""
fi

# Display pod status
echo -e "${YELLOW}API Gateway Pod Status:${NC}"
kubectl get pods -n "${NAMESPACE}" -l app.kubernetes.io/name=ocelotapigw

echo ""
echo -e "${YELLOW}Certificate files saved to: ${CERT_DIR}${NC}"
echo -e "  - Keep these files secure"
echo -e "  - Valid for ${VALIDITY_DAYS} days"
echo ""
