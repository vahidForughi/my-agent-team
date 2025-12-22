#!/bin/bash

# Product Image Migration Script
# Migrates product database records to use LocalStack S3 URLs

set -e

CATALOG_API_URL="${1:-http://localhost:8000}"
LOCALSTACK_ENDPOINT="${2:-http://localhost:4566}"

echo "🚀 Migrating product images to LocalStack S3..."
echo "   Catalog API: $CATALOG_API_URL"
echo "   LocalStack: $LOCALSTACK_ENDPOINT"
echo ""

# Wait for Catalog API to be ready
echo "⏳ Waiting for Catalog API to be ready..."
echo "   (First request may take up to 3 minutes due to cold start)"
for i in {1..20}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 90 "${CATALOG_API_URL}/api/v1/Catalog/GetAllProducts" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Catalog API is ready!"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "❌ ERROR: Catalog API failed to start within 3 minutes"
        exit 1
    fi
    echo "   Waiting... ($i/20)"
    sleep 10
done

# Wait for LocalStack to be ready
echo ""
echo "⏳ Checking LocalStack availability..."
for i in {1..10}; do
    if curl -s "${LOCALSTACK_ENDPOINT}/_localstack/health" 2>/dev/null | grep -q '"s3"'; then
        echo "✅ LocalStack is available!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ ERROR: LocalStack is not available"
        exit 1
    fi
    echo "   Waiting... ($i/10)"
    sleep 2
done

# Trigger migration via the existing Admin endpoint
echo ""
echo "📤 Triggering image migration to S3..."
echo "   Calling: POST ${CATALOG_API_URL}/Admin/MigrateImagesToS3"

MIGRATION_RESPONSE=$(curl -s -X POST "${CATALOG_API_URL}/Admin/MigrateImagesToS3" \
    -H "Content-Type: application/json" \
    -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$MIGRATION_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$MIGRATION_RESPONSE" | sed '/HTTP_STATUS/d')

echo ""
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Migration Response:"
    echo "$RESPONSE_BODY" | grep -E "(TotalProducts|SuccessfulMigrations|FailedMigrations|AlreadyInS3)" || echo "$RESPONSE_BODY"
else
    echo "⚠️  Migration endpoint returned status: $HTTP_STATUS"
    echo "   Response: $RESPONSE_BODY"
fi

# Verify migration by checking a few products
echo ""
echo "🔍 Verifying migration..."
PRODUCTS_RESPONSE=$(curl -s "${CATALOG_API_URL}/api/v1/Catalog?pageSize=5" 2>/dev/null)

if echo "$PRODUCTS_RESPONSE" | grep -q "localstack:4566"; then
    echo "✅ Products now reference LocalStack S3 URLs!"
    S3_COUNT=$(echo "$PRODUCTS_RESPONSE" | grep -o "localstack:4566" | wc -l)
    echo "   Found $S3_COUNT LocalStack S3 references in sample products"
elif echo "$PRODUCTS_RESPONSE" | grep -q "s3.amazonaws.com"; then
    echo "⚠️  Products still reference AWS S3 URLs"
    echo "   Migration may not have completed successfully"
else
    echo "ℹ️  Product image URLs format could not be determined"
    echo "   Sample response: $(echo "$PRODUCTS_RESPONSE" | head -c 200)"
fi

echo ""
echo "🎉 Migration process complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Check product images in your frontend application"
echo "   2. Verify LocalStack bucket: aws --endpoint-url=$LOCALSTACK_ENDPOINT s3 ls s3://ecommerce-product-images/products/"
echo "   3. Test image upload via API"
echo ""
