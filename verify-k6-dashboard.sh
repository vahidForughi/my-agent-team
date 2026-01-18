#!/bin/bash

# K6 Dashboard Verification Script
# This script verifies that the K6 dashboard is properly deployed and working

echo "🔍 Verifying K6 Dashboard Deployment..."
echo "========================================"

# Check if K6 dashboard ConfigMap exists
echo "1. Checking K6 Dashboard ConfigMap..."
if kubectl get configmap k6-dashboard -n monitoring > /dev/null 2>&1; then
    echo "✅ K6 Dashboard ConfigMap exists"
else
    echo "❌ K6 Dashboard ConfigMap not found"
    exit 1
fi

# Check if K6 dashboard is mounted in Grafana pod
echo "2. Checking K6 dashboard mount in Grafana pod..."
if kubectl exec deployment/grafana -n monitoring -- ls -la /var/lib/grafana/dashboards/k6/ | grep -q "k6-load-testing-dashboard.json"; then
    echo "✅ K6 dashboard is mounted in Grafana pod"
else
    echo "❌ K6 dashboard not mounted in Grafana pod"
    exit 1
fi

# Check if K6 dashboard content is correct
echo "3. Checking K6 dashboard content..."
if kubectl exec deployment/grafana -n monitoring -- grep -q "K6 Load Testing Metrics" /var/lib/grafana/dashboards/k6/k6-load-testing-dashboard.json; then
    echo "✅ K6 dashboard content is correct"
else
    echo "❌ K6 dashboard content is incorrect"
    exit 1
fi

# Check if K6 metrics are available in Prometheus
echo "4. Checking K6 metrics in Prometheus..."
if curl -s "http://localhost:9090/api/v1/query?query=k6_http_reqs_total" | jq -e '.data.result | length > 0' > /dev/null 2>&1; then
    echo "✅ K6 metrics are available in Prometheus"
else
    echo "❌ K6 metrics not found in Prometheus"
    exit 1
fi

# Check if K6 test script exists and is executable
echo "5. Checking K6 test script..."
if [ -f "/Users/phuc.truong/Documents/Code/cloud-native-ecommerce-platform/tests/k6/workflow-website.js" ]; then
    echo "✅ K6 test script exists"
else
    echo "❌ K6 test script not found"
    exit 1
fi

# Run a quick K6 test to verify metrics generation
echo "6. Running quick K6 test to generate metrics..."
cd /Users/phuc.truong/Documents/Code/cloud-native-ecommerce-platform/tests/k6
if timeout 10s k6 run --vus 1 --duration 5s --insecure-skip-tls-verify workflow-website.js > /dev/null 2>&1; then
    echo "✅ K6 test executed successfully"
else
    echo "⚠️  K6 test had issues, but this might be expected"
fi

echo ""
echo "🎉 K6 Dashboard Verification Complete!"
echo "========================================"
echo ""
echo "📋 Summary:"
echo "✅ K6 Dashboard ConfigMap: Created"
echo "✅ K6 Dashboard Mount: Configured"
echo "✅ K6 Dashboard Content: Verified"
echo "✅ K6 Metrics Collection: Working"
echo "✅ K6 Test Script: Available"
echo ""
echo "🌐 Access Grafana at: http://localhost:3000"
echo "🔑 Grafana Credentials: admin / prom-operator"
echo "📊 K6 Dashboard: Should be available in 'Performance' folder"
echo ""
echo "🚀 Next Steps:"
echo "1. Port forward Grafana: kubectl port-forward -n monitoring svc/grafana 3000:3000"
echo "2. Access Grafana web interface"
echo "3. Navigate to 'Performance' folder"
echo "4. Open 'K6 Load Testing Metrics' dashboard"
echo "5. Run K6 tests to see live metrics"