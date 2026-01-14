#!/bin/bash

# K6 Load Test Runner using AWS API Gateway
# This bypasses kubectl port-forward limitations and can handle 5000+ concurrent users
# Usage: ./run-with-gateway.sh [stress|spike|soak]

set -e

# Configuration
export USE_GATEWAY=true
export GATEWAY_URL="${GATEWAY_URL:-http://a30c7325084ba404a9d14238fe07b509-3d5eaf0db129d0fe.elb.us-east-1.amazonaws.com}"
export DEPLOYMENT_ENV=aws

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the test
exec "${SCRIPT_DIR}/run-load-test.sh" "$@"
