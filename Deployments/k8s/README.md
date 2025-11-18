# Kubernetes Deployment for E-Commerce Platform

This directory contains complete Kubernetes manifests for deploying the cloud-native e-commerce platform.

## Architecture

The platform consists of the following components:

### Microservices
- **Catalog API**: Product catalog management (MongoDB)
- **Basket API**: Shopping basket management (Redis)
- **Discount API**: Discount and coupon management (PostgreSQL)
- **Ordering API**: Order processing (SQL Server)

### Infrastructure
- **RabbitMQ**: Message broker for async communication
- **Elasticsearch**: Centralized logging
- **Kibana**: Log visualization

### API Gateway
- **Ocelot API Gateway**: Routes requests to microservices

### Monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization

### Management Tools
- **Portainer**: Kubernetes management UI
- **pgAdmin**: PostgreSQL administration

## Prerequisites

- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- At least 8GB RAM available for the cluster
- Docker images built and pushed (or available in registry)

## Quick Start

### Deploy Everything

```bash
cd Deployments/k8s
chmod +x deploy-all.sh cleanup-all.sh
./deploy-all.sh
```

### Clean Up Everything

```bash
./cleanup-all.sh
```

## Manual Deployment

If you prefer to deploy components individually:

### 1. Infrastructure

```bash
# RabbitMQ
kubectl apply -f infrastructure/rabbitmq/

# Elasticsearch & Kibana
kubectl apply -f infrastructure/elasticsearch/
kubectl apply -f infrastructure/kibana/
```

### 2. Databases

```bash
# MongoDB (Catalog)
kubectl apply -f catalog/catalog-db/

# Redis (Basket)
kubectl apply -f basket/basket-db/

# PostgreSQL (Discount)
kubectl apply -f discount/discount-db/

# SQL Server (Ordering)
kubectl apply -f ordering/ordering-db/
```

### 3. Microservices

```bash
kubectl apply -f catalog/catalog-api/
kubectl apply -f discount/discount-api/
kubectl apply -f basket/basket-api/
kubectl apply -f ordering/ordering-api/
```

### 4. API Gateway

```bash
kubectl apply -f gateway/
```

### 5. Monitoring

```bash
kubectl apply -f monitoring/prometheus/
kubectl apply -f monitoring/grafana/
```

### 6. Management Tools

```bash
kubectl apply -f management/portainer/
kubectl apply -f management/pgadmin/
```

## Access Points

After deployment, services are accessible via NodePort:

| Service | URL | Credentials |
|---------|-----|-------------|
| API Gateway | http://localhost:31080 | - |
| Catalog API | http://localhost:31000 | - |
| Basket API | http://localhost:31001 | - |
| Discount API | http://localhost:31002 | - |
| Ordering API | http://localhost:31003 | - |
| RabbitMQ Management | http://localhost:31672 | guest/guest |
| Kibana | http://localhost:31601 | - |
| Prometheus | http://localhost:31090 | - |
| Grafana | http://localhost:31300 | admin/admin |
| Portainer | http://localhost:30900 | (setup on first login) |
| pgAdmin | http://localhost:30950 | admin@admin.com/admin |

## Configuration

### Environment Variables

Each microservice uses ConfigMaps and Secrets for configuration:

- **ConfigMaps**: Non-sensitive configuration (connection strings with placeholders, URLs)
- **Secrets**: Sensitive data (passwords, tokens)

### Database Credentials

Default credentials (should be changed for production):

- **MongoDB**: No authentication
- **Redis**: No authentication
- **PostgreSQL**: admin/admin1234
- **SQL Server**: sa/SwN12345678!

### Image Tags

All images use the `latest` tag by default. For production:

1. Build with specific version tags
2. Update image references in deployment YAML files
3. Set `imagePullPolicy: Always` if needed

## Networking

### Service Discovery

Services communicate using Kubernetes DNS:
- `catalog-api-service:9000`
- `basket-api-service:9001`
- `discount-api-service:80`
- `ordering-api-service:9003`
- `redis-service:6379`
- `postgres-service:5432`
- `sqlserver-service:1433`
- `rabbitmq-service:5672`
- `elasticsearch-service:9200`

### Ingress

Ingress resources are available in the `ingress/` directory for production deployments with a proper ingress controller.

## Security Considerations

### RBAC

- **Prometheus**: Limited to read-only cluster access for metrics scraping
- **Portainer**: Restricted role (not cluster-admin) following least-privilege principle

### Secrets Management

For production:
1. Use external secrets management (Vault, AWS Secrets Manager, etc.)
2. Enable encryption at rest for secrets
3. Rotate credentials regularly

### Network Policies

Consider implementing network policies to restrict pod-to-pod communication.

## Resource Requirements

Minimum recommended resources per component:

| Component | CPU Request | Memory Request | CPU Limit | Memory Limit |
|-----------|-------------|----------------|-----------|--------------|
| Catalog API | 250m | 64Mi | 500m | 128Mi |
| Basket API | 250m | 64Mi | 500m | 128Mi |
| Discount API | 250m | 64Mi | 500m | 128Mi |
| Ordering API | 250m | 128Mi | 500m | 256Mi |
| MongoDB | 250m | 128Mi | 500m | 256Mi |
| Redis | 250m | 64Mi | 500m | 128Mi |
| PostgreSQL | 250m | 128Mi | 500m | 256Mi |
| SQL Server | 500m | 512Mi | 1000m | 1Gi |
| RabbitMQ | 250m | 256Mi | 500m | 512Mi |
| Elasticsearch | 500m | 1Gi | 1000m | 2Gi |
| Prometheus | 250m | 512Mi | 500m | 1Gi |
| Grafana | 250m | 256Mi | 500m | 512Mi |

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check Services

```bash
kubectl get svc
kubectl describe svc <service-name>
```

### Common Issues

1. **ImagePullBackOff**: Verify Docker images exist and are accessible
2. **CrashLoopBackOff**: Check pod logs for application errors
3. **Pending Pods**: Check resource availability and PVC binding
4. **Connection Issues**: Verify service names and ports in configuration

### Database Initialization

Some databases may need initialization scripts. Check the logs if services can't connect:

```bash
kubectl logs -l app=sqlserver
kubectl logs -l app=postgres
kubectl logs -l app=catalogdb
```

## Production Recommendations

1. **Use Persistent Volumes** instead of emptyDir for databases
2. **Implement Health Checks** (liveness/readiness probes) for all services
3. **Set up Horizontal Pod Autoscaling** (HPA) for microservices
4. **Enable Resource Quotas** and Limit Ranges per namespace
5. **Implement Network Policies** for pod-to-pod communication
6. **Use Ingress with TLS** for external access
7. **External Secrets Management** (not hardcoded in manifests)
8. **Monitoring and Alerting** with Prometheus AlertManager
9. **Backup Strategy** for databases
10. **CI/CD Pipeline** for automated deployments

## Migrating from Helm

This directory provides raw Kubernetes manifests as an alternative to Helm charts. Key differences:

- No templating - direct YAML manifests
- Simpler to understand and debug
- Manual version management
- Easier to customize per environment

## License

See main repository LICENSE file.
