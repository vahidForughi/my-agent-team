# 🚀 Kubernetes Deployment Guide

Complete guide for deploying the Cloud Native E-commerce Platform using raw Kubernetes manifests.

## 📋 Prerequisites

### 1. Kubernetes Cluster
- **Minikube**: `minikube start --memory=8192 --cpus=4`
- **Docker Desktop**: Enable Kubernetes in settings
- **Cloud Provider**: Any managed Kubernetes service

### 2. Required Tools
```bash
# Check if tools are installed
kubectl version --client
docker --version
```

### 3. Cluster Resources
- **Minimum**: 8GB RAM, 4 CPU cores
- **Recommended**: 16GB RAM, 8 CPU cores
- **Storage**: 100GB available for persistent volumes

## 🔨 Step 1: Build Docker Images

```bash
# Make build script executable and run
chmod +x build-images.sh
./build-images.sh
```

This builds all required images:
- `eshop/catalog.api:latest`
- `eshop/basket.api:latest` 
- `eshop/discount.grpc:latest`
- `eshop/ordering.api:latest`
- `eshop/ocelot.apigw:latest`

## 🚀 Step 2: Deploy to Kubernetes

```bash
# Navigate to k8s directory
cd Deployments/k8s

# Deploy everything
./deploy-k8s.sh
```

### Deployment Process
The script deploys components in this order:

1. **Namespaces** (`ecommerce`, `monitoring`)
2. **Secrets & ConfigMaps** (credentials, configuration)
3. **Databases** (MongoDB, Redis, PostgreSQL, SQL Server)
4. **Infrastructure** (RabbitMQ, Elasticsearch, Kibana)
5. **Microservices** (APIs with auto-scaling)
6. **API Gateway** (Ocelot with load balancing)
7. **Monitoring** (Prometheus, Grafana)
8. **Management Tools** (Portainer, pgAdmin)
9. **Ingress** (routing configuration)

## 🌐 Step 3: Access Services

### Option A: Port Forwarding (Recommended)
```bash
# Start port forwarding for all services
./port-forward.sh
```

### Option B: Manual Port Forwarding
```bash
# API Gateway (main entry point)
kubectl port-forward svc/ocelotapigw-service 8010:80 -n ecommerce

# Individual APIs
kubectl port-forward svc/catalog-service 8001:80 -n ecommerce
kubectl port-forward svc/basket-service 8002:80 -n ecommerce
kubectl port-forward svc/discount-service 8003:80 -n ecommerce
kubectl port-forward svc/ordering-service 8004:80 -n ecommerce

# Monitoring
kubectl port-forward svc/grafana-service 3000:3000 -n monitoring
kubectl port-forward svc/prometheus-service 9090:9090 -n monitoring

# Management
kubectl port-forward svc/portainer-service 9000:9000 -n ecommerce
kubectl port-forward svc/pgadmin-service 8080:80 -n ecommerce
kubectl port-forward svc/rabbitmq-service 15672:15672 -n ecommerce
kubectl port-forward svc/kibana-service 5601:5601 -n ecommerce
```

## 📊 Service URLs & Credentials

| Service | URL | Credentials |
|---------|-----|-------------|
| **API Gateway** | http://localhost:8010 | - |
| **Catalog API** | http://localhost:8001 | - |
| **Basket API** | http://localhost:8002 | - |
| **Discount API** | http://localhost:8003 | - |
| **Ordering API** | http://localhost:8004 | - |
| **Grafana** | http://localhost:3000 | admin/prom-operator |
| **Prometheus** | http://localhost:9090 | - |
| **Portainer** | http://localhost:9000 | Setup on first visit |
| **pgAdmin** | http://localhost:8080 | admin@example.com/admin123 |
| **RabbitMQ** | http://localhost:15672 | guest/guest |
| **Kibana** | http://localhost:5601 | - |

## 🔍 Monitoring & Health Checks

### Check Deployment Status
```bash
# Check all pods
kubectl get pods -n ecommerce
kubectl get pods -n monitoring

# Check services
kubectl get svc -n ecommerce
kubectl get svc -n monitoring

# Check persistent volumes
kubectl get pv
kubectl get pvc -n ecommerce
kubectl get pvc -n monitoring
```

### View Logs
```bash
# API service logs
kubectl logs -f deployment/catalog-api-deployment -n ecommerce
kubectl logs -f deployment/basket-api-deployment -n ecommerce

# Infrastructure logs
kubectl logs -f deployment/rabbitmq-deployment -n ecommerce
kubectl logs -f deployment/elasticsearch-deployment -n ecommerce

# Monitoring logs
kubectl logs -f deployment/grafana-deployment -n monitoring
kubectl logs -f deployment/prometheus-deployment -n monitoring
```

### Resource Usage
```bash
# Check resource usage
kubectl top pods -n ecommerce
kubectl top pods -n monitoring
kubectl top nodes
```

## 🎯 Testing the Deployment

### 1. Health Check Endpoints
```bash
# Test API Gateway
curl http://localhost:8010/health

# Test individual services
curl http://localhost:8001/health  # Catalog
curl http://localhost:8002/health  # Basket
curl http://localhost:8004/health  # Ordering
```

### 2. API Testing
```bash
# Get catalog products
curl http://localhost:8010/Catalog

# Create basket
curl -X POST http://localhost:8010/Basket \
  -H "Content-Type: application/json" \
  -d '{"userName": "test"}'
```

### 3. Monitoring Verification
- **Grafana**: Check dashboards at http://localhost:3000
- **Prometheus**: Verify targets at http://localhost:9090/targets
- **RabbitMQ**: Check queues at http://localhost:15672

## 🔧 Scaling & Management

### Scale Services
```bash
# Scale microservices
kubectl scale deployment catalog-api-deployment --replicas=3 -n ecommerce
kubectl scale deployment basket-api-deployment --replicas=3 -n ecommerce
kubectl scale deployment ordering-api-deployment --replicas=3 -n ecommerce

# Scale API Gateway
kubectl scale deployment ocelot-gateway-deployment --replicas=3 -n ecommerce
```

### Auto-scaling (HPA)
```bash
# Check HPA status
kubectl get hpa -n ecommerce

# View HPA details
kubectl describe hpa catalog-api-hpa -n ecommerce
```

### Update Images
```bash
# Update image for a service
kubectl set image deployment/catalog-api-deployment \
  catalog-api=eshop/catalog.api:v2.0 -n ecommerce

# Check rollout status
kubectl rollout status deployment/catalog-api-deployment -n ecommerce
```

## 🧹 Cleanup

### Complete Cleanup
```bash
# Run cleanup script
./cleanup-k8s.sh
```

### Selective Cleanup
```bash
# Remove specific components
kubectl delete -f services/
kubectl delete -f monitoring/
kubectl delete -f databases/

# Remove namespaces (removes everything)
kubectl delete namespace ecommerce
kubectl delete namespace monitoring
```

## 🛠️ Troubleshooting

### Common Issues

**1. Pods Stuck in Pending**
```bash
# Check node resources
kubectl describe nodes
kubectl top nodes

# Check events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

**2. Image Pull Errors**
```bash
# Check if images exist
docker images | grep eshop

# Rebuild images if needed
./build-images.sh
```

**3. Service Connection Issues**
```bash
# Check service endpoints
kubectl get endpoints -n ecommerce

# Test service connectivity
kubectl run test-pod --image=busybox -it --rm -- /bin/sh
# Inside pod: wget -qO- http://catalog-service.ecommerce.svc.cluster.local
```

**4. Database Connection Problems**
```bash
# Check database pods
kubectl logs -f deployment/mongo-deployment -n ecommerce
kubectl logs -f deployment/postgres-deployment -n ecommerce

# Check database services
kubectl get svc -n ecommerce | grep -E "(mongo|redis|postgres|sqlserver)"
```

### Debug Commands
```bash
# Describe problematic resources
kubectl describe pod <pod-name> -n ecommerce
kubectl describe deployment <deployment-name> -n ecommerce

# Check resource quotas
kubectl describe resourcequota -n ecommerce

# View cluster events
kubectl get events --all-namespaces --sort-by='.lastTimestamp'
```

## 📈 Performance Optimization

### Resource Tuning
```bash
# Edit resource limits
kubectl edit deployment catalog-api-deployment -n ecommerce

# Update HPA settings
kubectl edit hpa catalog-api-hpa -n ecommerce
```

### Storage Optimization
```bash
# Check PV usage
kubectl get pv
df -h  # On cluster nodes

# Resize PVCs if needed (if storage class supports it)
kubectl patch pvc mongo-pvc -n ecommerce -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'
```

## 🔐 Security Considerations

### RBAC
- Prometheus has cluster-wide read access for monitoring
- Portainer has cluster-admin access for management
- Services use least-privilege principles

### Secrets Management
- All passwords are base64 encoded in secrets.yaml
- Consider using external secret management in production
- Rotate secrets regularly

### Network Policies
```bash
# Apply network policies for production
kubectl apply -f network-policies/  # If you create them
```

## 🚀 Next Steps

1. **Set up CI/CD**: Integrate with GitHub Actions
2. **Add Istio**: For advanced traffic management
3. **Implement GitOps**: Use ArgoCD or Flux
4. **Add Backup**: Set up database backups
5. **Security Hardening**: Implement Pod Security Standards
6. **Observability**: Add distributed tracing with Jaeger

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Project Wiki](./wiki/README.md)
- [Troubleshooting Guide](./wiki/Troubleshooting.md)
