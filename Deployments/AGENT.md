# Codebase Orientation Map

## 1-Line Summary
This directory contains all the deployment artifacts and configurations for the Cloud Native E-commerce Platform, including Helm charts, raw Kubernetes manifests, Istio service mesh, and in-cluster monitoring.

## 5-Minute Explanation
- **Primary tasks in code**: Deploying microservices, databases, and infrastructure components to Kubernetes using Helm or raw manifests; configuring Istio service mesh; setting up monitoring with Prometheus and Grafana.
- **Primary inputs**: Kubernetes cluster, kubectl, Helm, Docker, Docker images of microservices.
- **Primary outputs**: Deployed Kubernetes resources (pods, services, deployments, ingresses), configured Istio resources, running monitoring stack.
- **Key files**:
    - `Deployments/README.md`: Comprehensive deployment guide.
    - `Deployments/CLAUDE.md`: Overview of deployment artifacts and their purpose.
    - `Deployments/DEPLOYMENT-CONFIGURATION.md`: Detailed service configuration, port mappings, and access methods.
    - `Deployments/helm/`: Contains Helm charts for various services.
    - `Deployments/k8s/`: Contains raw Kubernetes manifests.
    - `Deployments/istio/`: Contains Istio service mesh configurations.
    - `Deployments/monitoring/`: Contains monitoring configurations (Grafana dashboards, Prometheus).
- **Main code paths**: `scripts/deploy/deploy.sh` for local (Minikube) deployments, `scripts/deploy/deploy-aws.sh` for AWS EKS deployments. These scripts orchestrate the Helm, K8s, and Istio deployments.

## Deep Dive
- **Type**: Infrastructure/Deployment configuration.
- **Primary runtime(s)**: Kubernetes, Helm, Istio, Docker.
- **Entry points**:
  - `Deployments/README.md`: Provides the main entry point for understanding the deployment process and options.
  - `Deployments/helm/install-helm.sh`: Script to install all components using Helm charts.
  - `Deployments/k8s/deploy-k8s.sh`: Script to deploy all components using raw Kubernetes manifests.
  - `scripts/deploy/deploy.sh`: Orchestration script for local end-to-end deployments.

## Top-Level Structure
| Path | Purpose | Notes |
|---|---|---|
| `Deployments/helm/` | Helm charts | Templated Kubernetes manifests for easier deployment and management. |
| `Deployments/istio/` | Istio service mesh | Configuration for traffic management, security, and observability. |
| `Deployments/k8s/` | Raw Kubernetes manifests | Direct YAML definitions for Kubernetes resources. |
| `Deployments/monitoring/` | Monitoring configurations | Grafana dashboards and Prometheus setup. |

## Key Boundaries
- **Presentation**: N/A (infrastructure code).
- **Application/Domain**: The deployment configurations are for the application microservices (Catalog, Basket, Discount, Ordering) and supporting infrastructure (MongoDB, Redis, PostgreSQL, SQL Server, RabbitMQ, Elasticsearch).
- **Persistence/External I/O**: Stateful workloads (databases, RabbitMQ, Elasticsearch) are configured to use PersistentVolumes in-cluster for local/Minikube or managed services on AWS.
- **Cross-cutting concerns**: Monitoring (Prometheus, Grafana, Jaeger, Kiali), logging (Elasticsearch, Kibana), and service mesh (Istio) are configured here.
- **Responsibilities by file/module**:
    - `Deployments/helm/`: Manages deployments via Helm, providing versioning, upgrades, and rollbacks.
    - `Deployments/k8s/`: Provides granular control over Kubernetes resources using raw manifests.
    - `Deployments/istio/`: Configures the service mesh for advanced traffic management, security, and observability features.
    - `Deployments/monitoring/`: Sets up the monitoring stack to observe the health and performance of the deployed applications.
- **Detailed code flows**:
  1. A deployment begins by executing an orchestration script like `./scripts/deploy/deploy.sh`.
  2. This script then calls sub-scripts within `Deployments/helm/` or `Deployments/k8s/` based on the chosen deployment strategy.
  3. Helm charts or raw Kubernetes manifests are applied to the cluster, creating deployments, services, ingress, and other resources.
  4. Istio configurations are applied to manage traffic and policies.
  5. Monitoring components like Prometheus and Grafana are deployed to collect metrics and visualize the system's state.
- **How the pieces map together**: Helm charts and K8s manifests define the desired state of the microservices and infrastructure. Istio configures how these services interact. Monitoring tools observe the deployed system. The `scripts/deploy/` helpers orchestrate these components into a coherent deployment process.
- **Files inspected**:
    - `Deployments/README.md`
    - `Deployments/CLAUDE.md`
    - `Deployments/DEPLOYMENT-CONFIGURATION.md`
    - `Deployments/helm/` (directory listing)
    - `Deployments/istio/` (directory listing)
    - `Deployments/k8s/` (directory listing)
    - `Deployments/monitoring/` (directory listing)
    - `.claude/agents/codebase-onboarding-engineer.md`
    - `scripts/deploy/deploy.sh` (mentioned in CLAUDE.md)
    - `scripts/deploy/deploy-aws.sh` (mentioned in CLAUDE.md)
