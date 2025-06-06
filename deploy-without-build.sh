#!/bin/bash

# Alternative Deployment Script - Skip Docker Build
# Uses pre-built images or alternative build methods

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}"
}

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

# Function to use Docker Compose instead of Kubernetes
deploy_with_docker_compose() {
    print_step "Deploying with Docker Compose (bypassing Kubernetes)..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
    
    # Create environment file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
# Database Configuration
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin1234
POSTGRES_DB=DiscountDb
POSTGRES_URL=Server=discountdb;Port=5432;Database=DiscountDb;User Id=admin;Password=admin1234;

# MongoDB Configuration
MONGODB_URL=mongodb://catalogdb:27017
MONGO_DB=CatalogDb

# Redis Configuration
REDIS_URL=basketdb:6379

# SQL Server Configuration
SQL_SA_PASSWORD=SqlPassword123
ACCEPT_EULA=Y
SQLSERVER_URL=Server=orderdb;Database=OrderDb;User Id=sa;Password=SqlPassword123;TrustServerCertificate=True

# RabbitMQ Configuration
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# Elasticsearch Configuration
ELASTICSEARCH_URL=http://elasticsearch:9200
ES_JAVA_OPTS=-Xms512m -Xmx512m

# pgAdmin Configuration
PGADMIN_EMAIL=admin@eCommerce.net
PGADMIN_PASSWORD=Password@1
EOF
    fi
    
    print_status "Starting services with Docker Compose..."
    
    # Start infrastructure services first
    print_status "Starting infrastructure services..."
    docker-compose up -d catalogdb basketdb discountdb orderdb rabbitmq elasticsearch kibana pgadmin portainer
    
    # Wait for databases to be ready
    print_status "Waiting for databases to initialize..."
    sleep 30
    
    # Start application services
    print_status "Starting application services..."
    docker-compose up -d catalog.api basket.api discount.api ordering.api ocelot.apigateway
    
    print_status "Docker Compose deployment completed!"
}

# Function to use alternative build method
alternative_docker_build() {
    print_step "Attempting alternative Docker build method..."
    
    # Disable BuildKit temporarily
    export DOCKER_BUILDKIT=0
    export COMPOSE_DOCKER_CLI_BUILD=0
    
    print_status "Building with legacy Docker builder..."
    
    # Build images one by one with legacy builder
    local services=("catalog.api" "basket.api" "discount.api" "ordering.api" "ocelot.apigateway")
    
    for service in "${services[@]}"; do
        print_status "Building $service..."
        if docker-compose build --no-cache $service; then
            print_status "$service built successfully"
        else
            print_error "Failed to build $service"
            return 1
        fi
    done
    
    print_status "All services built successfully with legacy builder"
}

# Function to pull pre-built images (if available)
use_prebuilt_images() {
    print_step "Attempting to use pre-built images..."
    
    # Update docker-compose to use pre-built images
    cat > docker-compose.prebuilt.yml << EOF
version: '3.4'

services:
  catalogdb:
    image: mongo
    container_name: catalogdb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  basketdb:
    image: redis:alpine
    container_name: basketdb
    restart: always
    ports:
      - "6379:6379"

  discountdb:
    image: postgres
    container_name: discountdb
    environment:
      - POSTGRES_USER=\${POSTGRES_USER}
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
      - POSTGRES_DB=\${POSTGRES_DB}
    restart: always
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data/

  orderdb:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: orderdb
    environment:
      SA_PASSWORD: \${SQL_SA_PASSWORD}
      ACCEPT_EULA: \${ACCEPT_EULA}
    restart: always
    ports:
      - "1433:1433"
    volumes:
      - orderdb-data:/var/opt/mssql

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: rabbitmq
    restart: always
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=\${RABBITMQ_USER}
      - RABBITMQ_DEFAULT_PASS=\${RABBITMQ_PASSWORD}

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.14.3
    container_name: elasticsearch
    environment:
      - ES_JAVA_OPTS=\${ES_JAVA_OPTS}
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.14.3
    container_name: kibana
    environment:
      - ELASTICSEARCH_URL=\${ELASTICSEARCH_URL}
    depends_on:
      - elasticsearch
    ports:
      - "5601:5601"

  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin
    environment:
      - PGADMIN_DEFAULT_EMAIL=\${PGADMIN_EMAIL}
      - PGADMIN_DEFAULT_PASSWORD=\${PGADMIN_PASSWORD}
    restart: always
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/root/.pgadmin

  portainer:
    image: portainer/portainer-ce
    container_name: portainer
    restart: always
    ports:
      - "8080:8000"
      - "9090:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data

  # Use generic .NET images for now (you can replace with your built images later)
  catalog.api:
    image: mcr.microsoft.com/dotnet/samples:aspnetapp
    container_name: catalog.api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
    depends_on:
      - catalogdb
    ports:
      - "8000:8080"

  basket.api:
    image: mcr.microsoft.com/dotnet/samples:aspnetapp
    container_name: basket.api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
    depends_on:
      - basketdb
      - rabbitmq
    ports:
      - "8001:8080"

  discount.api:
    image: mcr.microsoft.com/dotnet/samples:aspnetapp
    container_name: discount.api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
    depends_on:
      - discountdb
    ports:
      - "8002:8080"

  ordering.api:
    image: mcr.microsoft.com/dotnet/samples:aspnetapp
    container_name: ordering.api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
    depends_on:
      - orderdb
      - rabbitmq
    ports:
      - "8003:8080"

  ocelot.apigateway:
    image: mcr.microsoft.com/dotnet/samples:aspnetapp
    container_name: ocelot.apigateway
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
    depends_on:
      - catalog.api
      - basket.api
      - discount.api
      - ordering.api
    ports:
      - "8010:8080"

volumes:
  mongo_data:
  portainer_data:
  postgres_data:
  pgadmin_data:
  elasticsearch-data:
  orderdb-data:
EOF

    print_status "Starting services with pre-built images..."
    docker-compose -f docker-compose.prebuilt.yml up -d
    
    print_status "Infrastructure deployed with pre-built images"
    print_warning "Note: API services are using generic .NET images"
    print_warning "You'll need to build and replace them later when Docker issues are resolved"
}

# Function to display service status
show_service_status() {
    print_step "Checking service status..."
    
    echo -e "\n${BLUE}Running Containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo -e "\n${BLUE}Service URLs:${NC}"
    echo "Infrastructure Services:"
    echo "- Elasticsearch: http://localhost:9200"
    echo "- Kibana: http://localhost:5601"
    echo "- RabbitMQ Management: http://localhost:15672 (guest/guest)"
    echo "- pgAdmin: http://localhost:5050 (admin@eCommerce.net/Password@1)"
    echo "- Portainer: http://localhost:9090"
    echo ""
    echo "Application Services (using generic images):"
    echo "- API Gateway: http://localhost:8010"
    echo "- Catalog API: http://localhost:8000"
    echo "- Basket API: http://localhost:8001"
    echo "- Discount API: http://localhost:8002"
    echo "- Ordering API: http://localhost:8003"
}

# Main execution
main() {
    print_header "ALTERNATIVE DEPLOYMENT - BYPASS DOCKER BUILD ISSUES"
    
    print_warning "This script provides alternatives to bypass Docker BuildKit issues"
    
    echo "Choose deployment method:"
    echo "1) Docker Compose with original configuration (try building)"
    echo "2) Docker Compose with legacy builder (no BuildKit)"
    echo "3) Docker Compose with pre-built images (infrastructure only)"
    echo "4) Infrastructure only (databases, monitoring, etc.)"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_with_docker_compose
            ;;
        2)
            alternative_docker_build
            if [ $? -eq 0 ]; then
                deploy_with_docker_compose
            else
                print_error "Alternative build failed. Try option 3."
                exit 1
            fi
            ;;
        3)
            use_prebuilt_images
            ;;
        4)
            print_status "Starting infrastructure services only..."
            docker-compose up -d catalogdb basketdb discountdb orderdb rabbitmq elasticsearch kibana pgadmin portainer
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    show_service_status
    
    print_header "DEPLOYMENT COMPLETED"
    echo -e "${GREEN}Services are starting up. Wait a few minutes for all services to be ready.${NC}"
    echo -e "${GREEN}Use 'docker-compose logs -f' to monitor the startup process.${NC}"
}

main "$@"
