#!/bin/bash
set -e

NAMESPACE="default"
CATALOG_SVC="svc/eshopping-catalog"
LOCAL_PORT=8000

echo "🔍 Verifying S3 Feature Integration..."

# 1. Check if Catalog Pod has S3 Configuration
echo -n "Checking Catalog Pod Configuration... "
POD_NAME=$(kubectl get pod -n $NAMESPACE -l app.kubernetes.io/instance=eshopping-catalog -o jsonpath="{.items[0].metadata.name}")

if kubectl describe pod $POD_NAME -n $NAMESPACE | grep -q "AWS__S3__BucketName"; then
    echo "✅ S3 Env Vars Found"
else
    echo "❌ S3 Env Vars MISSING! Deployment might not have updated the pod."
    exit 1
fi

# 2. Check Logs for S3 Connection
echo -n "Checking Catalog Logs... "
if kubectl logs $POD_NAME -n $NAMESPACE | grep -q "Connected to S3"; then
    echo "✅ Connected to S3"
else
    echo "⚠️  'Connected to S3' log not found (might have rolled over or startup failed)"
fi

# 3. Functional Verification
echo "🚀 Starting Functional Verification..."
echo "   Port-forwarding catalog service to localhost:$LOCAL_PORT..."

# Start port-forward in background
kubectl port-forward -n $NAMESPACE $CATALOG_SVC $LOCAL_PORT:80 > /dev/null 2>&1 &
PF_PID=$!
sleep 3

# Check a product for S3 URL
echo -n "Checking Product Image URLs... "
PRODUCT_IMAGE=$(curl -s http://localhost:$LOCAL_PORT/api/v1/Catalog/GetProducts | grep -o '"imageFile":"[^"]*"' | head -n 1)

if [[ $PRODUCT_IMAGE == *"ecommerce-product-images"* ]]; then
    echo "✅ Found S3 URL: $PRODUCT_IMAGE"
elif [[ $PRODUCT_IMAGE == *"/images/products/"* ]]; then
    echo "⚠️  Found Local URL: $PRODUCT_IMAGE"
    echo "   Migration might be needed. Triggering migration..."
    
    MIGRATION=$(curl -s -X POST http://localhost:$LOCAL_PORT/Admin/MigrateImagesToS3)
    echo "   Migration Result: $MIGRATION"
else
    echo "❓ Unknown Image URL format: $PRODUCT_IMAGE"
fi

# Cleanup
kill $PF_PID
echo "Done."
