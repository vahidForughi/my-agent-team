# Codebase Orientation Map

## 1-Line Summary
Plain YAML Kubernetes manifests for the full platform, including microservices, databases, and infrastructure, orchestrated by deploy/cleanup/validate scripts.

## 5-Minute Explanation
- **Primary tasks in code**: Defines Kubernetes resources for the entire e-commerce platform (microservices, databases, infrastructure, and policies) using raw YAML manifests. Manages deployment and cleanup processes via specialized bash scripts.
- **Primary inputs**: Individual `.yaml` files specifying Kubernetes objects such as Deployments, Services, ConfigMaps, Secrets, NetworkPolicies, and PodDisruptionBudgets.
- **Primary outputs**: A fully deployed cloud-native e-commerce platform on a Kubernetes cluster, with all components configured and interconnected.
- **Key files**: `Deployments/k8s/*.yaml`, `Deployments/k8s/deploy-k8s.sh`, `Deployments/k8s/cleanup-k8s.sh`, `Deployments/k8s/validate-deployment.sh`.
- **Main code paths**: The `deploy-k8s.sh` script executes `kubectl apply -f` commands in a predefined, critical order, incorporating readiness checks and waits to ensure stable deployments.

## Deep Dive
- **Type**: Infrastructure (raw Kubernetes manifests for application deployment)
- **Primary runtime(s)**: Kubernetes, `kubectl` CLI, Bash scripting
- **Entry points**:
  - `Deployments/k8s/deploy-k8s.sh`: The primary script for orchestrating the deployment of all Kubernetes manifests, ensuring correct ordering and dependencies.
  - `Deployments/k8s/namespace.yaml`: Defines the core `ecommerce` and `monitoring` Kubernetes namespaces, which are fundamental for resource isolation.
  - `Deployments/k8s/configmaps.yaml`: Centralizes non-sensitive configuration parameters for various applications, such as connection strings and service URLs.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `Deployments/k8s/namespace.yaml` | Defines Kubernetes namespaces | `ecommerce` and `monitoring` |
| `Deployments/k8s/configmaps.yaml` | Global non-secret application configuration | Connection settings, service URLs |
| `Deployments/k8s/secrets.yaml` | Global sensitive application configuration | Base64-encoded credentials |
| `Deployments/k8s/databases/` | Database deployments | `mongodb.yaml`, `redis.yaml`, `postgresql.yaml`, `sqlserver.yaml` |
| `Deployments/k8s/infrastructure/` | Common infrastructure components | `rabbitmq.yaml`, `elasticsearch.yaml`, `kibana.yaml` |
| `Deployments/k8s/services/` | Microservice deployments | `catalog-api.yaml`, `basket-api.yaml`, `discount-api.yaml`, `ordering-api.yaml` |
| `Deployments/k8s/gateway/` | API Gateway deployment | `ocelot-apigw.yaml`, `ocelot-configmap.yaml` |
| `Deployments/k8s/monitoring/` | Monitoring components | `prometheus.yaml`, `grafana.yaml`, `rbac.yaml` |
| `Deployments/k8s/management/` | Management UIs | `portainer.yaml`, `pgadmin.yaml` |
| `Deployments/k8s/network-policies/` | Network security policies | `default-deny.yaml`, `allow-dns.yaml` |
| `Deployments/k8s/pod-disruption-budgets/` | Pod disruption budgets | `microservices-pdb.yaml` |
| `Deployments/k8s/ingress/` | Ingress configurations | `api-ingress.yaml`, `monitoring-ingress.yaml` |
| `Deployments/k8s/deploy-k8s.sh` | Orchestration script for deployment | Applies manifests in a specific, critical order |
| `Deployments/k8s/cleanup-k8s.sh` | Orchestration script for cleanup | Deletes all deployed resources |
| `Deployments/k8s/validate-deployment.sh` | Post-deployment validation script | Checks health and status of deployed components |

## Key Boundaries
- **Presentation**: N/A (this section focuses on backend deployment; UI is handled by micro-frontends deployed elsewhere).
- **Application/Domain**: Each directory under `Deployments/k8s/` (e.g., `catalog/`, `basket/`, `discount/`) contains the specific YAML definitions for deploying that microservice or its associated database.
- **Persistence/External I/O**: The `databases/` directory houses manifest files (`mongodb.yaml`, `redis.yaml`, `postgresql.yaml`, `sqlserver.yaml`) for deploying stateful datastores within the cluster, relying on Kubernetes PersistentVolumes. External managed services (e.g., AWS RDS) replace these in cloud environments, with connection strings configured via ConfigMaps/Secrets.
- **Cross-cutting concerns**: `configmaps.yaml` and `secrets.yaml` manage application configuration and credentials. `network-policies/` enforces network segmentation and traffic flow rules. `pod-disruption-budgets/` ensures high availability during voluntary disruptions. `monitoring/` sets up Prometheus and Grafana for observability.
- **Responsibilities by file/module**:
  - `configmaps.yaml`: Central repository for environment-specific non-sensitive configurations shared across services.
  - `secrets.yaml`: Stores sensitive credentials and API keys, which must be base64-encoded for Kubernetes.
  - `deploy-k8s.sh`: Critical for orchestrating the correct and dependent application of all Kubernetes resources, including waits for readiness.
  - `services/*.yaml`: Defines the Deployment, Service, and potentially HPA for individual microservices, including their container images, ports, and environment variables.
  - `databases/*.yaml`: Defines StatefulSets, Services, and PersistentVolumeClaims for each database instance.
- **Detailed code flows**:
  1. The `deploy-k8s.sh` script is executed.
  2. It first applies `namespace.yaml`, creating necessary Kubernetes namespaces.
  3. Then, `configmaps.yaml` and `secrets.yaml` are applied to make global configurations and credentials available.
  4. Stateful resources like databases (`databases/`) and core infrastructure (`infrastructure/`) are deployed next, with readiness checks.
  5. Microservices (`services/`) are deployed, followed by the API Gateway (`gateway/`), monitoring components (`monitoring/`), and management tools (`management/`).
  6. Finally, ingress rules (`ingress/`) and network policies (`network-policies/`, `pod-disruption-budgets/`) are applied.
- **How the pieces map together**: Individual YAML manifests describe isolated Kubernetes resources. The `deploy-k8s.sh` script enforces a specific, critical deployment order that respects dependencies between these resources. Inter-service communication relies heavily on Kubernetes' internal DNS resolution to connect services by name and port.
- **Files inspected**:
  - `Deployments/CLAUDE.md`
  - `Deployments/k8s/CLAUDE.md`
  - `Deployments/k8s/deploy-k8s.sh`
  - `Deployments/k8s/namespace.yaml`
  - `Deployments/k8s/configmaps.yaml`
