#!/bin/bash

# K6 Load Test Runner using AWS API Gateway
# This bypasses kubectl port-forward limitations and can handle 5000+ concurrent users
# Usage: ./run-with-gateway.sh [stress|spike|soak]

set -e

# Configuration
export USE_GATEWAY=true
export GATEWAY_URL="${GATEWAY_URL:-https://a908be0f78581433da5edddaf76a0b7f-f54822a6262925e8.elb.us-east-1.amazonaws.com}"
export DEPLOYMENT_ENV=aws

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the test
exec "${SCRIPT_DIR}/run-load-test.sh" "$@"
