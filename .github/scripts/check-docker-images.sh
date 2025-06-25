#!/bin/bash

# Script to check if Docker images exist in the registry before security scanning
# This helps prevent security scan failures when images haven't been pushed yet

set -e

REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-$GITHUB_REPOSITORY}"
SERVICES=("catalog-api" "basket-api" "discount-api" "ordering-api" "ocelot-gateway")

# Function to check if an image exists
check_image_exists() {
    local service=$1
    local tag=$2
    local image_ref="${REGISTRY}/${IMAGE_NAME}/${service}:${tag}"
    
    echo "Checking if image exists: $image_ref"
    
    # Try to pull the image manifest (without downloading the image)
    if docker manifest inspect "$image_ref" >/dev/null 2>&1; then
        echo "✅ Image exists: $image_ref"
        return 0
    else
        echo "❌ Image not found: $image_ref"
        return 1
    fi
}

# Function to wait for image availability
wait_for_image() {
    local service=$1
    local tag=$2
    local max_attempts=${3:-10}
    local wait_time=${4:-30}
    
    echo "Waiting for image to become available: ${service}:${tag}"
    
    for i in $(seq 1 $max_attempts); do
        echo "Attempt $i/$max_attempts..."
        
        if check_image_exists "$service" "$tag"; then
            echo "Image is now available!"
            return 0
        fi
        
        if [ $i -lt $max_attempts ]; then
            echo "Waiting ${wait_time}s before next attempt..."
            sleep $wait_time
        fi
    done
    
    echo "Image not available after $max_attempts attempts"
    return 1
}

# Main execution
if [ "$#" -eq 0 ]; then
    echo "Usage: $0 <tag> [service1] [service2] ..."
    echo "Example: $0 main-abc123 catalog-api basket-api"
    echo "Example: $0 latest (checks all services)"
    exit 1
fi

TAG="$1"
shift

# If no specific services provided, check all
if [ "$#" -eq 0 ]; then
    SERVICES_TO_CHECK=("${SERVICES[@]}")
else
    SERVICES_TO_CHECK=("$@")
fi

echo "Checking Docker images with tag: $TAG"
echo "Services to check: ${SERVICES_TO_CHECK[*]}"

all_exist=true

for service in "${SERVICES_TO_CHECK[@]}"; do
    if ! check_image_exists "$service" "$TAG"; then
        all_exist=false
    fi
done

if [ "$all_exist" = true ]; then
    echo "✅ All images are available for security scanning"
    exit 0
else
    echo "❌ Some images are not available"
    exit 1
fi 