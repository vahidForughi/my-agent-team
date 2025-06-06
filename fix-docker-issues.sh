#!/bin/bash

# Docker Desktop Fix Script for macOS
# Resolves BuildKit I/O errors and storage corruption

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to check if Docker Desktop is running
check_docker_status() {
    if docker info >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to stop Docker Desktop
stop_docker_desktop() {
    print_step "Stopping Docker Desktop..."
    
    # Kill Docker Desktop processes
    pkill -f "Docker Desktop" || true
    pkill -f "com.docker.hyperkit" || true
    pkill -f "vpnkit" || true
    
    # Wait for processes to stop
    sleep 5
    
    print_status "Docker Desktop stopped"
}

# Function to clean Docker data
clean_docker_data() {
    print_step "Cleaning Docker data directories..."
    
    # Remove Docker Desktop data (this will reset everything)
    print_warning "This will remove all Docker containers, images, and volumes!"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw
        rm -rf ~/Library/Group\ Containers/group.com.docker/settings.json
        rm -rf ~/.docker/buildx
        print_status "Docker data cleaned"
    else
        print_warning "Skipping data cleanup"
    fi
}

# Function to restart Docker Desktop
restart_docker_desktop() {
    print_step "Starting Docker Desktop..."
    
    open -a "Docker Desktop"
    
    print_status "Waiting for Docker Desktop to start..."
    local max_wait=120
    local wait_time=0
    
    while [ $wait_time -lt $max_wait ]; do
        if check_docker_status; then
            print_status "Docker Desktop is running!"
            return 0
        fi
        
        echo -n "."
        sleep 5
        wait_time=$((wait_time + 5))
    done
    
    print_error "Docker Desktop failed to start within $max_wait seconds"
    return 1
}

# Function to configure Docker for better performance
configure_docker() {
    print_step "Configuring Docker settings..."
    
    cat > docker-daemon.json << EOF
{
  "builder": {
    "gc": {
      "enabled": true,
      "defaultKeepStorage": "20GB"
    }
  },
  "experimental": false,
  "features": {
    "buildkit": true
  }
}
EOF

    print_status "Docker configuration created"
    print_warning "Please manually apply these settings in Docker Desktop:"
    print_warning "1. Go to Docker Desktop → Settings → Docker Engine"
    print_warning "2. Replace the configuration with the content from docker-daemon.json"
    print_warning "3. Click 'Apply & Restart'"
}

# Function to test Docker functionality
test_docker() {
    print_step "Testing Docker functionality..."
    
    # Test basic Docker command
    if docker run --rm hello-world >/dev/null 2>&1; then
        print_status "Docker is working correctly"
    else
        print_error "Docker test failed"
        return 1
    fi
    
    # Test BuildKit
    if docker buildx version >/dev/null 2>&1; then
        print_status "BuildKit is available"
    else
        print_warning "BuildKit may not be available"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Docker Desktop Fix Script${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    print_warning "This script will reset Docker Desktop to fix I/O errors"
    print_warning "All containers, images, and volumes will be removed"
    
    read -p "Continue with Docker reset? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Operation cancelled"
        exit 0
    fi
    
    stop_docker_desktop
    clean_docker_data
    restart_docker_desktop
    configure_docker
    test_docker
    
    print_status "Docker Desktop has been reset and configured"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Next Steps:${NC}"
    echo -e "${GREEN}1. Apply the Docker Engine configuration manually${NC}"
    echo -e "${GREEN}2. Restart Docker Desktop${NC}"
    echo -e "${GREEN}3. Run the deployment script again${NC}"
    echo -e "${GREEN}========================================${NC}"
}

main "$@"
