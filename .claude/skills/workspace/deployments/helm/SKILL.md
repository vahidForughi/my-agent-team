---
name: helm
description: Helm v3 charts for every platform workload — APIs, databases, and infra — parameterised to run on Minikube or AWS EKS by swapping a values file.
paths:
  - Deployments/helm/**/*
metadata:
  part-dir: Deployments/helm
---

The `helm` sub-part contains one Helm chart directory per workload in the platform. It is the preferred deployment mechanism over the raw `Deployments/k8s/` manifests. All charts follow the same template structure and are installed with the `eshopping-` release name prefix.

## Key files to read first

- `Deployments/helm/install-helm.sh` — installs all charts in dependency order (infra/DBs → APIs → gateway → optional extras); defines `APP_NAME=eshopping`
- `Deployments/helm/uninstall-helm.sh` — removes all releases
- `Deployments/helm/catalog/Chart.yaml` — representative chart metadata (`apiVersion: v2`, `version: 0.1.0`)
- `Deployments/helm/catalog/values.yaml` — default values with ConfigMap block, env vars, `USE_LOCALSTACK`, `image.registry`
- `Deployments/helm/catalog/values-aws.yaml` — AWS overrides: `LoadBalancer` service type, ECR registry, IRSA annotations, health probes
- `Deployments/helm/catalog/templates/deployment.yaml` — deployment template (liveness `/health`, readiness `/ready` on port 80)
- `Deployments/helm/discount/values.yaml` — gRPC service on port 8080 (differs from other APIs)

## Chart inventory

| Chart dir | Workload | Notes |
|---|---|---|
| `catalog/` | Catalog API | HTTP port 80 |
| `basket/` | Basket API | HTTP port 80 |
| `discount/` | Discount API (chart: `discount-grpc`) | gRPC port 8080 |
| `ordering/` | Ordering API | HTTP port 80 |
| `ocelotapigw/` | Ocelot API Gateway | HTTP port 80 |
| `catalogdb/` | MongoDB | In-cluster; replaced by DocumentDB on AWS |
| `basketdb/` | Redis | In-cluster; replaced by ElastiCache on AWS |
| `discountdb/` | PostgreSQL | In-cluster; replaced by RDS on AWS |
| `orderdb/` | SQL Server | In-cluster; replaced by RDS on AWS |
| `rabbitmq/` | RabbitMQ | In-cluster; replaced by Amazon MQ on AWS |
| `elasticsearch/` | Elasticsearch | In-cluster |
| `kibana/` | Kibana | In-cluster |
| `prometheus/` | Prometheus | Monitoring namespace |
| `portainer/` | Portainer | Management UI |
| `pgadmin/` | pgAdmin | DB management UI |
| `localstack/` | LocalStack | S3 emulation for local dev |

## Commands

```bash
cd Deployments/helm
./install-helm.sh                                                   # install all (prefix eshopping-)
helm install eshopping-catalog catalog                              # one chart, local
helm install eshopping-catalog catalog -f catalog/values-aws.yaml  # AWS overrides
helm upgrade eshopping-catalog catalog --set image.tag=v2.0.0
helm test eshopping-catalog                                         # chart tests in templates/tests/
./uninstall-helm.sh
```

## Critical constraints

- Release names must use `eshopping-` prefix — inter-service DNS (`eshopping-catalogdb:27017`) depends on it.
- For AWS: set `image.registry` to the ECR account; leave empty for Minikube.
- S3: `USE_LOCALSTACK=false` + IRSA on AWS; `USE_LOCALSTACK=true` + `http://localstack:4566` locally.
- Container port must equal service port (80) — a mismatch breaks readiness.
- `install-helm.sh` continues on per-chart failure — verify with `helm list` after running.
- Do not deploy both Helm and `k8s/` raw manifests for the same workload in one cluster.
