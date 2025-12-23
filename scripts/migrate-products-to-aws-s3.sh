#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  MIGRATING PRODUCT IMAGE URLs FROM LOCALSTACK TO AWS S3       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
NAMESPACE="${1:-dev}"
AWS_ACCOUNT_ID="${2:-$(aws sts get-caller-identity --query Account --output text)}"
AWS_REGION="${3:-ap-southeast-1}"

S3_BUCKET="ecommerce-product-images-${AWS_ACCOUNT_ID}"
LOCALSTACK_URL="http://localstack:4566/ecommerce-product-images/products/"
AWS_S3_URL="https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/products/"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Namespace: ${NAMESPACE}"
echo "  AWS Account: ${AWS_ACCOUNT_ID}"
echo "  AWS Region: ${AWS_REGION}"
echo "  S3 Bucket: ${S3_BUCKET}"
echo ""
echo -e "${YELLOW}URL Migration:${NC}"
echo "  FROM: ${LOCALSTACK_URL}"
echo "  TO:   ${AWS_S3_URL}"
echo ""

read -p "Continue with migration? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# ============================================================================
# STEP 1: Get MongoDB Pod
# ============================================================================
echo -e "\n${BLUE}[1/4] Finding MongoDB pod...${NC}"

MONGO_POD=$(kubectl get pods -n "${NAMESPACE}" -l app.kubernetes.io/name=catalogdb -o jsonpath='{.items[0].metadata.name}')

if [ -z "${MONGO_POD}" ]; then
    echo -e "${RED}Error: MongoDB pod not found in namespace ${NAMESPACE}${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found MongoDB pod: ${MONGO_POD}${NC}"

# ============================================================================
# STEP 2: Check Current Product URLs
# ============================================================================
echo -e "\n${BLUE}[2/4] Checking current product URLs...${NC}"

LOCALSTACK_COUNT=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongo CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    --eval 'db.Products.countDocuments({"ImageFile": {$regex: "localstack"}})' 2>/dev/null || echo "0")

TOTAL_COUNT=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongo CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    --eval 'db.Products.countDocuments({})' 2>/dev/null || echo "0")

echo -e "${YELLOW}Products with LocalStack URLs: ${LOCALSTACK_COUNT}${NC}"
echo -e "${YELLOW}Total products: ${TOTAL_COUNT}${NC}"

if [ "${LOCALSTACK_COUNT}" == "0" ]; then
    echo -e "${GREEN}✓ No products with LocalStack URLs found. Migration not needed.${NC}"
    exit 0
fi

# ============================================================================
# STEP 3: Update Product URLs
# ============================================================================
echo -e "\n${BLUE}[3/4] Updating product URLs to AWS S3...${NC}"

# Create MongoDB update script
cat > /tmp/mongo-update-urls.js <<EOF
db = db.getSiblingDB('CatalogDb');

// Update all products with localstack URLs
var result = db.Products.updateMany(
    { "ImageFile": { \$regex: "localstack:4566" } },
    [{
        \$set: {
            "ImageFile": {
                \$replaceOne: {
                    input: "\$ImageFile",
                    find: "http://localstack:4566/ecommerce-product-images/products/",
                    replacement: "https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/products/"
                }
            }
        }
    }]
);

print("Matched: " + result.matchedCount);
print("Modified: " + result.modifiedCount);
EOF

# Copy script to pod and execute
kubectl cp /tmp/mongo-update-urls.js "${NAMESPACE}/${MONGO_POD}:/tmp/mongo-update-urls.js"

RESULT=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongo CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    /tmp/mongo-update-urls.js)

echo "${RESULT}"

# Clean up
kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- rm /tmp/mongo-update-urls.js
rm /tmp/mongo-update-urls.js

echo -e "${GREEN}✓ Product URLs updated${NC}"

# ============================================================================
# STEP 4: Verify Migration
# ============================================================================
echo -e "\n${BLUE}[4/4] Verifying migration...${NC}"

# Check for any remaining localstack URLs
REMAINING_LOCALSTACK=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongo CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    --eval 'db.Products.countDocuments({"ImageFile": {$regex: "localstack"}})' 2>/dev/null || echo "0")

# Check AWS S3 URLs
AWS_S3_COUNT=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongo CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    --eval "db.Products.countDocuments({\"ImageFile\": {\$regex: \"${S3_BUCKET}\"}})" 2>/dev/null || echo "0")

echo -e "${YELLOW}Products with LocalStack URLs: ${REMAINING_LOCALSTACK}${NC}"
echo -e "${YELLOW}Products with AWS S3 URLs: ${AWS_S3_COUNT}${NC}"

if [ "${REMAINING_LOCALSTACK}" == "0" ] && [ "${AWS_S3_COUNT}" -gt "0" ]; then
    echo -e "${GREEN}✓ Migration successful!${NC}"

    # Show sample product
    echo -e "\n${YELLOW}Sample product after migration:${NC}"
    kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongo CatalogDb \
        --username admin \
        --password admin1234 \
        --authenticationDatabase admin \
        --quiet \
        --eval 'db.Products.findOne({}, {Name: 1, ImageFile: 1, _id: 0})'
else
    echo -e "${RED}Warning: Migration may be incomplete${NC}"
    echo -e "${YELLOW}Please check the database manually${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  MIGRATION COMPLETE                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Test the API:${NC}"
echo "  kubectl get svc -n ${NAMESPACE} eshopping-ocelotapigw"
echo "  curl https://YOUR-LB-URL/Catalog/GetAllProducts | jq '.data[0].imageFile'"
echo ""
