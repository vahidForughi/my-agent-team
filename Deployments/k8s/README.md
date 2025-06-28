# Kubernetes Raw Manifests Deployment

This directory contains raw Kubernetes manifests for deploying the Cloud Native E-commerce Platform without Helm.

## 📁 Directory Structure

```
k8s/
├── README.md                    # This file
├── namespace.yaml               # Namespace definitions
├── secrets.yaml                 # All secrets
├── configmaps.yaml             # Configuration maps
├── databases/                   # Database deployments
│   ├── mongodb.yaml            # MongoDB for Catalog service
│   ├── redis.yaml              # Redis for Basket service
│   ├── postgresql.yaml         # PostgreSQL for Discount service
│   └── sqlserver.yaml          # SQL Server for Ordering service
├── infrastructure/             # Infrastructure services
│   ├── rabbitmq.yaml           # Message broker
│   ├── elasticsearch.yaml     # Search and logging
│   └── kibana.yaml             # Log visualization
├── services/                   # Microservices
│   ├── catalog-api.yaml        # Catalog API service
│   ├── basket-api.yaml         # Basket API service
│   ├── discount-api.yaml       # Discount API service
│   └── ordering-api.yaml       # Ordering API service
├── gateway/                    # API Gateway
│   └── ocelot-gateway.yaml     # Ocelot API Gateway
├── monitoring/                 # Monitoring stack
│   ├── rbac.yaml               # RBAC for monitoring
│   ├── prometheus.yaml         # Prometheus monitoring
│   └── grafana.yaml            # Grafana dashboards
├── management/                 # Management tools
│   ├── portainer.yaml          # Container management
│   └── pgadmin.yaml            # PostgreSQL admin
├── ingress/                    # Ingress configurations
│   ├── api-ingress.yaml        # API services ingress
│   └── monitoring-ingress.yaml # Monitoring services ingress
├── deploy-k8s.sh              # Main deployment script
├── cleanup-k8s.sh             # Cleanup script
└── port-forward.sh            # Port forwarding script
```

## 🚀 Quick Start

### Prerequisites

1. **Kubernetes Cluster**: Minikube, Docker Desktop, or any K8s cluster
2. **kubectl**: Configured to connect to your cluster
3. **Docker Images**: Build the application images first

### Build Docker Images

```bash
# From the project root
docker build -f Services/Catalog/Catalog.API/Dockerfile -t eshop/catalog.api:latest .
docker build -f Services/Basket/Basket.API/Dockerfile -t eshop/basket.api:latest .
docker build -f Services/Discount/Discount.API/Dockerfile -t eshop/discount.grpc:latest .
docker build -f Services/Ordering/Ordering.API/Dockerfile -t eshop/ordering.api:latest .
docker build -f ApiGateways/Ocelot.ApiGateway/Dockerfile -t eshop/ocelot.apigw:latest .
```

### Deploy Everything

```bash
# Navigate to k8s directory
cd Deployments/k8s

# Make scripts executable
chmod +x *.sh

# Deploy the complete platform
./deploy-k8s.sh
```

### Access Services

```bash
# Start port forwarding for all services
./port-forward.sh
```

## 📋 Deployment Order

The deployment script follows this order to ensure dependencies are met:

1. **Namespaces** (`ecommerce`, `monitoring`)
2. **Secrets & ConfigMaps** (credentials and configuration)
3. **Databases** (MongoDB, Redis, PostgreSQL, SQL Server)
4. **Infrastructure** (RabbitMQ, Elasticsearch, Kibana)
5. **Microservices** (Catalog, Basket, Discount, Ordering APIs)
6. **API Gateway** (Ocelot)
7. **Monitoring** (Prometheus, Grafana)
8. **Management Tools** (Portainer, pgAdmin)
9. **Ingress** (routing configuration)

## 🔧 Configuration

### Secrets

All secrets are base64 encoded in `secrets.yaml`:

- **MongoDB**: admin/password123
- **PostgreSQL**: admin/password123
- **SQL Server**: sa/Password123
- **RabbitMQ**: guest/guest
- **Grafana**: admin/prom-operator
- **Portainer**: admin/portainer123
- **pgAdmin**: admin@example.com/admin123

### Resource Limits

Each service has defined resource requests and limits:

- **Databases**: 1-4GB memory, 0.5-2 CPU cores
- **APIs**: 256-512MB memory, 0.25-0.5 CPU cores
- **Monitoring**: 512MB-1GB memory, 0.25-0.5 CPU cores

### Persistent Storage

Persistent volumes are created for:

- MongoDB (10GB)
- Redis (5GB)
- PostgreSQL (10GB)
- SQL Server (15GB)
- RabbitMQ (5GB)
- Elasticsearch (10GB)
- Prometheus (10GB)
- Grafana (5GB)
- Portainer (2GB)
- pgAdmin (2GB)

## 🌐 Service Access

### Via Port Forwarding

```bash
# API Services
kubectl port-forward svc/ocelotapigw-service 8010:80 -n ecommerce
kubectl port-forward svc/catalog-service 8001:80 -n ecommerce
kubectl port-forward svc/basket-service 8002:80 -n ecommerce

# Monitoring
kubectl port-forward svc/grafana-service 3000:3000 -n monitoring
kubectl port-forward svc/prometheus-service 9090:9090 -n monitoring

# Management
kubectl port-forward svc/portainer-service 9000:9000 -n ecommerce
kubectl port-forward svc/pgadmin-service 8080:80 -n ecommerce
```

### Via Ingress (if ingress controller is installed)

- API Gateway: `http://localhost/`
- Grafana: `http://localhost/grafana`
- Prometheus: `http://localhost/prometheus`
- Portainer: `http://localhost/portainer`

## 🔍 Monitoring & Observability

### Prometheus Metrics

Prometheus is configured to scrape:

- Kubernetes API server
- Kubernetes nodes
- Application pods (with annotations)
- Ecommerce services

### Grafana Dashboards

Pre-configured dashboards for:

- E-commerce platform overview
- Service uptime monitoring
- Resource utilization

### Health Checks

All services include:

- **Liveness probes**: Restart unhealthy containers
- **Readiness probes**: Route traffic only to ready pods

## 🛠️ Management Commands

### Check Deployment Status

```bash
# Check all pods
kubectl get pods -n ecommerce
kubectl get pods -n monitoring

# Check services
kubectl get svc -n ecommerce
kubectl get svc -n monitoring

# Check ingress
kubectl get ingress -n ecommerce
kubectl get ingress -n monitoring
```

### Scale Services

```bash
# Scale microservices
kubectl scale deployment catalog-api-deployment --replicas=3 -n ecommerce
kubectl scale deployment basket-api-deployment --replicas=3 -n ecommerce

# Scale API Gateway
kubectl scale deployment ocelot-gateway-deployment --replicas=3 -n ecommerce
```

### View Logs

```bash
# View service logs
kubectl logs -f deployment/catalog-api-deployment -n ecommerce
kubectl logs -f deployment/grafana-deployment -n monitoring

# View all logs for a service
kubectl logs -l app=catalog-api -n ecommerce --tail=100
```

## 🧹 Cleanup

### Remove Everything

```bash
# Run cleanup script
./cleanup-k8s.sh
```

### Manual Cleanup

```bash
# Delete namespaces (removes everything)
kubectl delete namespace ecommerce
kubectl delete namespace monitoring

# Or delete individual components
kubectl delete -f services/
kubectl delete -f databases/
kubectl delete -f monitoring/
```

## 🔧 Troubleshooting

### Common Issues

1. **Images not found**: Build Docker images first
2. **Pods stuck in Pending**: Check resource availability
3. **Services not accessible**: Verify port-forwarding or ingress
4. **Database connection issues**: Check service names and ports

### Debug Commands

```bash
# Describe problematic pods
kubectl describe pod <pod-name> -n ecommerce

# Check events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n ecommerce
kubectl top nodes
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Troubleshooting Guide](../../wiki/Troubleshooting.md)
