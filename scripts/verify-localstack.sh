#!/bin/bash

# LocalStack Verification Script
# Comprehensive checks for LocalStack S3 configuration

set -e

LOCALSTACK_ENDPOINT="${1:-http://localhost:4566}"
BUCKET_NAME="${2:-ecommerce-product-images}"

echo "🔍 Verifying LocalStack S3 Configuration..."
echo "=========================================="
echo ""

# Configure AWS CLI
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

FAILED_CHECKS=0

# Check 1: LocalStack health
echo "1️⃣  Checking LocalStack health..."
if curl -s "${LOCALSTACK_ENDPOINT}/_localstack/health" 2>/dev/null | grep -q "running"; then
    echo "   ✅ LocalStack is running"
else
    echo "   ❌ LocalStack is not responding"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check 2: S3 bucket exists
echo ""
echo "2️⃣  Checking S3 bucket..."
if aws --endpoint-url="$LOCALSTACK_ENDPOINT" s3 ls "s3://$BUCKET_NAME" > /dev/null 2>&1; then
    echo "   ✅ Bucket '$BUCKET_NAME' exists"
else
    echo "   ❌ Bucket '$BUCKET_NAME' not found"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check 3: List bucket contents
echo ""
echo "3️⃣  Listing bucket contents..."
IMAGE_COUNT=$(aws --endpoint-url="$LOCALSTACK_ENDPOINT" s3 ls "s3://$BUCKET_NAME/products/" --recursive 2>/dev/null | wc -l)
if [ "$IMAGE_COUNT" -gt 0 ]; then
    echo "   ✅ Found $IMAGE_COUNT images in bucket"
else
    echo "   ⚠️  No images found in bucket (this may be expected if not yet uploaded)"
fi

# Check 4: Test image upload
echo ""
echo "4️⃣  Testing image upload..."
TEST_FILE="/tmp/test-localstack-image.txt"
echo "test content $(date)" > "$TEST_FILE"

if aws --endpoint-url="$LOCALSTACK_ENDPOINT" s3 cp "$TEST_FILE" "s3://$BUCKET_NAME/test/test-image.txt" > /dev/null 2>&1; then
    echo "   ✅ Image upload successful"
    # Clean up test file
    aws --endpoint-url="$LOCALSTACK_ENDPOINT" s3 rm "s3://$BUCKET_NAME/test/test-image.txt" > /dev/null 2>&1
    rm -f "$TEST_FILE"
else
    echo "   ❌ Image upload failed"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check 5: Test image URL access
echo ""
echo "5️⃣  Testing image URL access..."
FIRST_IMAGE=$(aws --endpoint-url="$LOCALSTACK_ENDPOINT" s3 ls "s3://$BUCKET_NAME/products/" --recursive 2>/dev/null | head -1 | awk '{print $4}')
if [ -n "$FIRST_IMAGE" ]; then
    IMAGE_URL="${LOCALSTACK_ENDPOINT}/${BUCKET_NAME}/${FIRST_IMAGE}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$IMAGE_URL" 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ Image accessible at: $IMAGE_URL"
    else
        echo "   ⚠️  Image URL returned HTTP $HTTP_CODE (may need bucket policy)"
    fi
else
    echo "   ℹ️  No images found to test"
fi

# Check 6: Bucket policy
echo ""
echo "6️⃣  Checking bucket policy..."
if aws --endpoint-url="$LOCALSTACK_ENDPOINT" s3api get-bucket-policy --bucket "$BUCKET_NAME" > /dev/null 2>&1; then
    echo "   ✅ Bucket policy is set"
else
    echo "   ⚠️  No bucket policy found (images may not be publicly accessible)"
fi

# Summary
echo ""
echo "=========================================="
if [ $FAILED_CHECKS -eq 0 ]; then
    echo "✅ All checks passed! LocalStack S3 is working correctly."
else
    echo "⚠️  $FAILED_CHECKS check(s) failed. See details above."
fi
echo ""

# Configuration details
echo "📋 Configuration Details:"
echo "   Endpoint: $LOCALSTACK_ENDPOINT"
echo "   Bucket: $BUCKET_NAME"
echo "   Images: $IMAGE_COUNT"
echo "   Access Key: test"
echo "   Secret Key: test"
echo "   Region: us-east-1"
echo ""

# Useful commands
echo "💡 Useful Commands:"
echo "   List bucket: aws --endpoint-url=$LOCALSTACK_ENDPOINT s3 ls s3://$BUCKET_NAME"
echo "   Upload file: aws --endpoint-url=$LOCALSTACK_ENDPOINT s3 cp <file> s3://$BUCKET_NAME/products/"
echo "   Download file: aws --endpoint-url=$LOCALSTACK_ENDPOINT s3 cp s3://$BUCKET_NAME/products/<file> ."
echo "   Health check: curl $LOCALSTACK_ENDPOINT/_localstack/health"
echo ""

exit $FAILED_CHECKS
