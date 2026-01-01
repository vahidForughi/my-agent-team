#!/bin/bash

# LocalStack S3 Initialization Script
# Creates S3 bucket and uploads product images

set -e

BUCKET_NAME="${1:-ecommerce-product-images}"
LOCALSTACK_ENDPOINT="${2:-http://localhost:4566}"
IMAGES_DIR="${3:-./client/src/images/products}"

echo "🚀 Initializing LocalStack S3..."
echo "   Bucket: $BUCKET_NAME"
echo "   Endpoint: $LOCALSTACK_ENDPOINT"
echo "   Images: $IMAGES_DIR"
echo ""

# Wait for LocalStack to be ready
echo "⏳ Waiting for LocalStack to be ready..."
for i in {1..30}; do
    if curl -s "${LOCALSTACK_ENDPOINT}/_localstack/health" 2>/dev/null | grep -q '"s3"'; then
        echo "✅ LocalStack is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ ERROR: LocalStack failed to start within 60 seconds"
        exit 1
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

# Configure AWS CLI to use LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Create S3 bucket
echo ""
echo "📦 Creating S3 bucket: $BUCKET_NAME"
aws --endpoint-url="$LOCALSTACK_ENDPOINT" s3 mb "s3://$BUCKET_NAME" 2>/dev/null || echo "   Bucket already exists"

# Set bucket policy for public read
echo "🔓 Setting bucket policy for public read access..."
cat > /tmp/bucket-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF

aws --endpoint-url="$LOCALSTACK_ENDPOINT" s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///tmp/bucket-policy.json 2>/dev/null || echo "   Policy already set"

# Upload product images
if [ -d "$IMAGES_DIR" ]; then
    echo ""
    echo "📤 Uploading product images from $IMAGES_DIR..."

    IMAGE_COUNT=0
    for img in "$IMAGES_DIR"/*.{png,jpg,jpeg,webp}; do
        # Skip if no files match the pattern
        [ -e "$img" ] || continue

        if [ -f "$img" ]; then
            FILENAME=$(basename "$img")
            echo "   📷 Uploading: $FILENAME"

            # Determine content type
            CONTENT_TYPE="application/octet-stream"
            case "${FILENAME##*.}" in
                png) CONTENT_TYPE="image/png" ;;
                jpg|jpeg) CONTENT_TYPE="image/jpeg" ;;
                webp) CONTENT_TYPE="image/webp" ;;
            esac

            aws --endpoint-url="$LOCALSTACK_ENDPOINT" s3 cp "$img" \
                "s3://$BUCKET_NAME/products/$FILENAME" \
                --content-type "$CONTENT_TYPE" 2>/dev/null || echo "     Failed to upload $FILENAME"
            IMAGE_COUNT=$((IMAGE_COUNT + 1))
        fi
    done

    echo ""
    echo "✅ Successfully uploaded $IMAGE_COUNT images"
else
    echo ""
    echo "⚠️  WARNING: Images directory not found: $IMAGES_DIR"
    echo "   Bucket created but no images uploaded"
fi

# List bucket contents
echo ""
echo "📋 Bucket contents:"
aws --endpoint-url="$LOCALSTACK_ENDPOINT" s3 ls "s3://$BUCKET_NAME/products/" --recursive 2>/dev/null || echo "   No files found"

echo ""
echo "🎉 LocalStack S3 initialization complete!"
echo "   Bucket URL: ${LOCALSTACK_ENDPOINT}/${BUCKET_NAME}"
echo "   Test command: aws --endpoint-url=${LOCALSTACK_ENDPOINT} s3 ls s3://${BUCKET_NAME}"
echo ""
