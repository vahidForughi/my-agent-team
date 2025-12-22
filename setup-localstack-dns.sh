#!/bin/bash

# Script to set up LocalStack DNS resolution for browser access

echo "🔧 Setting up LocalStack DNS resolution..."
echo ""

# Check if entry already exists
if grep -q "127.0.0.1 localstack" /etc/hosts 2>/dev/null; then
    echo "✅ LocalStack DNS entry already exists in /etc/hosts"
else
    echo "Adding '127.0.0.1 localstack' to /etc/hosts..."
    echo "This requires sudo access."
    echo ""

    if sudo sh -c 'echo "127.0.0.1 localstack" >> /etc/hosts'; then
        echo "✅ Successfully added localstack to /etc/hosts"
    else
        echo "❌ Failed to add entry. Please add manually:"
        echo "   sudo sh -c 'echo \"127.0.0.1 localstack\" >> /etc/hosts'"
        exit 1
    fi
fi

echo ""
echo "🌐 Verifying port-forward is running..."

# Check if port-forward is running
if ! pgrep -f "kubectl port-forward.*localstack.*4566" > /dev/null; then
    echo "Starting LocalStack port-forward..."
    kubectl port-forward svc/localstack 4566:4566 -n default > /dev/null 2>&1 &
    sleep 2
fi

# Test connectivity
if curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
    echo "✅ LocalStack is accessible at http://localhost:4566"
    echo "✅ LocalStack is accessible at http://localstack:4566"
else
    echo "❌ LocalStack port-forward not working"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Refresh your browser"
echo "   2. Product images should now load from LocalStack"
echo "   3. Test URL: http://localstack:4566/ecommerce-product-images/products/acer_helios_300_1.png"
echo ""
echo "🗑️  To remove later:"
echo "   sudo sed -i '' '/127.0.0.1 localstack/d' /etc/hosts"
echo ""
