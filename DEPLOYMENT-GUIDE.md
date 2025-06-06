# Cloud-Native E-commerce Platform Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the cloud-native e-commerce platform with all its components including microservices, databases, monitoring, and observability tools.

## Architecture Components

### Microservices
- **Catalog Service** - Product management (MongoDB)
- **Basket Service** - Shopping cart functionality (Redis)
- **Discount Service** - Discount management (PostgreSQL)
- **Ordering Service** - Order processing (SQL Server)
- **API Gateway** - Ocelot-based single entry point

### Infrastructure
- **Databases**: MongoDB, Redis, PostgreSQL, SQL Server
- **Message Broker**: RabbitMQ
- **Monitoring**: Elasticsearch, Kibana
- **Service Mesh**: Istio (optional)
- **Observability**: Prometheus, Grafana, Jaeger, Kiali

## Prerequisites

### Required Tools
- **kubectl** - Kubernetes command-line tool
- **helm** - Kubernetes package manager
- **docker** - Container runtime
- **git** - Version control

### Kubernetes Cluster
- Kubernetes cluster (v1.20+)
- Minimum resources:
  - **CPU**: 8 cores
  - **Memory**: 16GB RAM
  - **Storage**: 50GB available

### Installation Commands
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## Quick Start Deployment

### Option 1: Complete Platform (Recommended)
```bash
# Deploy everything with monitoring
./deploy-complete-platform.sh

# Deploy with Istio service mesh
./deploy-complete-platform.sh --with-istio

# Deploy without building images (if images exist)
./deploy-complete-platform.sh --no-build
```

### Option 2: Step-by-Step Deployment
```bash
# 1. Deploy core platform
./deploy-platform.sh

# 2. Deploy monitoring stack
./deploy-monitoring.sh

# 3. Deploy Istio (optional)
./deploy-istio.sh
```

### Option 3: Docker Compose (Local Development)
```bash
# Set environment variables
source .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Deployment Scripts

### Main Scripts
- **`deploy-complete-platform.sh`** - Complete orchestrated deployment
- **`deploy-platform.sh`** - Core platform deployment
- **`deploy-monitoring.sh`** - Monitoring stack deployment
- **`deploy-istio.sh`** - Istio service mesh deployment

### Utility Scripts
- **`access-services.sh`** - Quick access to services via port-forwarding
- **`verify-deployment.sh`** - Deployment verification and health checks

## Service Access

### Application Services
```bash
# API Gateway (Main Entry Point)
kubectl port-forward svc/ocelotapigw 8010:80 -n default
# Access: http://localhost:8010

# Individual Services
kubectl port-forward svc/catalog 8000:80 -n default
kubectl port-forward svc/basket 8001:80 -n default
kubectl port-forward svc/discountapi 8002:80 -n default
kubectl port-forward svc/ordering 8003:80 -n default
```

### Infrastructure Services
```bash
# Elasticsearch
kubectl port-forward svc/elasticsearch 9200:9200 -n default

# Kibana
kubectl port-forward svc/kibana 5601:5601 -n default

# RabbitMQ Management
kubectl port-forward svc/rabbitmq 15672:15672 -n default
# Credentials: guest/guest
```

### Monitoring Services
```bash
# Prometheus
kubectl port-forward svc/prometheus-server 9090:80 -n monitoring

# Grafana
kubectl port-forward svc/grafana 3000:80 -n monitoring
# Credentials: admin/admin123

# Jaeger
kubectl port-forward svc/jaeger-query 16686:16686 -n monitoring
```

### Istio Services (if deployed)
```bash
# Kiali (Service Mesh Dashboard)
kubectl port-forward svc/kiali 20001:20001 -n istio-system

# Istio Grafana
kubectl port-forward svc/grafana 3000:3000 -n istio-system

# Istio Jaeger
kubectl port-forward svc/jaeger 16686:16686 -n istio-system
```

## Configuration

### Environment Variables
The `.env` file contains all necessary environment variables:
- Database connection strings
- Service ports
- Authentication credentials
- Resource limits

### Helm Values
Each service has its own `values.yaml` file in `Deployments/helm/[service-name]/`:
- Resource requests and limits
- Environment-specific configurations
- Service dependencies

## Monitoring and Observability

### Metrics Collection
- **Prometheus** collects metrics from all services
- **Grafana** provides dashboards and visualization
- Pre-configured dashboards for Kubernetes and Istio

### Distributed Tracing
- **Jaeger** provides distributed tracing
- Automatic trace collection from Istio-enabled services
- Custom instrumentation in application code

### Logging
- **Elasticsearch** stores all logs
- **Kibana** provides log analysis and visualization
- Centralized logging from all services

### Service Mesh (Istio)
- **Kiali** provides service topology visualization
- **mTLS** for secure service-to-service communication
- **Traffic management** and load balancing
- **Circuit breaker** and fault injection

## Troubleshooting

### Common Issues

#### Pods Not Starting
```bash
# Check pod status
kubectl get pods -n default

# Check pod logs
kubectl logs <pod-name> -n default

# Describe pod for events
kubectl describe pod <pod-name> -n default
```

#### Service Not Accessible
```bash
# Check service status
kubectl get services -n default

# Check endpoints
kubectl get endpoints -n default

# Test service connectivity
kubectl run test-pod --image=busybox --rm -it -- sh
```

#### Resource Issues
```bash
# Check node resources
kubectl top nodes

# Check pod resources
kubectl top pods -n default

# Check resource quotas
kubectl describe quota -n default
```

### Health Checks
```bash
# Run verification script
./verify-deployment.sh

# Check all deployments
kubectl get deployments -A

# Check all services
kubectl get services -A
```

## Scaling and Performance

### Horizontal Pod Autoscaling
```bash
# Enable HPA for a service
kubectl autoscale deployment catalog --cpu-percent=70 --min=1 --max=10 -n default

# Check HPA status
kubectl get hpa -n default
```

### Resource Management
- Configure resource requests and limits in Helm values
- Monitor resource usage with Prometheus and Grafana
- Use node affinity for optimal pod placement

## Security

### Network Policies
- Istio provides automatic mTLS between services
- Network policies can be applied for additional security

### Secrets Management
- Database credentials stored as Kubernetes secrets
- TLS certificates managed by cert-manager (if configured)

## Backup and Recovery

### Database Backups
```bash
# PostgreSQL backup
kubectl exec -it <postgres-pod> -- pg_dump -U admin DiscountDb > discount-backup.sql

# MongoDB backup
kubectl exec -it <mongo-pod> -- mongodump --db CatalogDb --out /backup
```

### Configuration Backups
```bash
# Export all configurations
kubectl get all,configmap,secret -o yaml > cluster-backup.yaml
```

## Support and Maintenance

### Log Collection
```bash
# Collect logs from all services
kubectl logs -l app.kubernetes.io/part-of=ecommerce -n default > application-logs.txt
```

### Performance Monitoring
- Use Grafana dashboards for performance metrics
- Monitor application-specific metrics through Prometheus
- Use Jaeger for performance bottleneck analysis

### Updates and Upgrades
```bash
# Update a specific service
helm upgrade eshopping-catalog Deployments/helm/catalog -n default

# Update all services
./deploy-platform.sh
```

For additional support, refer to the main README.md or create an issue in the project repository.
