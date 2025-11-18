#!/bin/bash

# Deploy all Kubernetes manifests for e-commerce platform
# This script deploys infrastructure, databases, microservices, monitoring, and management tools

set -e

echo "======================================"
echo "Deploying E-Commerce Platform to K8s"
echo "======================================"

# 1. Deploy Infrastructure Components
echo ""
echo "1. Deploying Infrastructure (RabbitMQ, Elasticsearch, Kibana)..."
kubectl apply -f infrastructure/rabbitmq/rabbitmq-configmap.yaml
kubectl apply -f infrastructure/rabbitmq/rabbitmq.yaml
kubectl apply -f infrastructure/elasticsearch/elasticsearch-configmap.yaml
kubectl apply -f infrastructure/elasticsearch/elasticsearch.yaml
kubectl apply -f infrastructure/kibana/kibana.yaml

# 2. Deploy Databases
echo ""
echo "2. Deploying Databases..."

# Catalog DB (MongoDB)
echo "   - Deploying Catalog DB (MongoDB)..."
kubectl apply -f catalog/catalog-db/mongo-configmap.yaml
kubectl apply -f catalog/catalog-db/mongo-secret.yaml
kubectl apply -f catalog/catalog-db/catalog-db.yaml

# Basket DB (Redis)
echo "   - Deploying Basket DB (Redis)..."
kubectl apply -f basket/basket-db/redis-configmap.yaml
kubectl apply -f basket/basket-db/basket-db.yaml

# Discount DB (PostgreSQL)
echo "   - Deploying Discount DB (PostgreSQL)..."
kubectl apply -f discount/discount-db/postgres-secret.yaml
kubectl apply -f discount/discount-db/postgres-configmap.yaml
kubectl apply -f discount/discount-db/discount-db.yaml

# Ordering DB (SQL Server)
echo "   - Deploying Ordering DB (SQL Server)..."
kubectl apply -f ordering/ordering-db/sqlserver-secret.yaml
kubectl apply -f ordering/ordering-db/sqlserver-configmap.yaml
kubectl apply -f ordering/ordering-db/ordering-db.yaml

# Wait for databases to be ready
echo ""
echo "3. Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=catalogdb --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=redis --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=sqlserver --timeout=180s || true

# 4. Deploy Microservices
echo ""
echo "4. Deploying Microservices..."

# Catalog API
echo "   - Deploying Catalog API..."
kubectl apply -f catalog/catalog-api/catalog-api.yaml

# Discount API
echo "   - Deploying Discount API..."
kubectl apply -f discount/discount-api/discount-api.yaml

# Basket API
echo "   - Deploying Basket API..."
kubectl apply -f basket/basket-api/basket-api.yaml

# Ordering API
echo "   - Deploying Ordering API..."
kubectl apply -f ordering/ordering-api/ordering-api.yaml

# 5. Deploy API Gateway
echo ""
echo "5. Deploying API Gateway (Ocelot)..."
kubectl apply -f gateway/ocelot-configmap.yaml
kubectl apply -f gateway/ocelot-apigw.yaml

# 6. Deploy Monitoring Stack
echo ""
echo "6. Deploying Monitoring Stack (Prometheus, Grafana)..."
kubectl apply -f monitoring/prometheus/prometheus-rbac.yaml
kubectl apply -f monitoring/prometheus/prometheus-configmap.yaml
kubectl apply -f monitoring/prometheus/prometheus.yaml
kubectl apply -f monitoring/grafana/grafana.yaml

# 7. Deploy Management Tools
echo ""
echo "7. Deploying Management Tools (Portainer, pgAdmin)..."
kubectl apply -f management/portainer/portainer-rbac.yaml
kubectl apply -f management/portainer/portainer.yaml
kubectl apply -f management/pgadmin/pgadmin.yaml

# 8. Deploy Ingress (if exists)
echo ""
echo "8. Deploying Ingress Resources..."
kubectl apply -f ingress/ 2>/dev/null || echo "   No ingress resources found, skipping..."

# Display deployment status
echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Checking deployment status..."
kubectl get pods
echo ""
echo "Services:"
kubectl get svc

echo ""
echo "======================================"
echo "Access Points:"
echo "======================================"
echo "API Gateway (Ocelot):     http://localhost:31080"
echo "Catalog API:              http://localhost:31000"
echo "Basket API:               http://localhost:31001"
echo "Discount API:             http://localhost:31002"
echo "Ordering API:             http://localhost:31003"
echo "RabbitMQ Management:      http://localhost:31672"
echo "Kibana:                   http://localhost:31601"
echo "Prometheus:               http://localhost:31090"
echo "Grafana:                  http://localhost:31300 (admin/admin)"
echo "Portainer:                http://localhost:30900"
echo "pgAdmin:                  http://localhost:30950 (admin@admin.com/admin)"
echo "======================================"
