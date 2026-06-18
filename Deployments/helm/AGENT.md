# Codebase Orientation Map

## 1-Line Summary
Helm charts provide templated, upgradeable deployment paths for all workloads in the platform, parameterised to run on Minikube and AWS EKS.

## 5-Minute Explanation
- **Primary tasks in code**: Helm charts define deployments for APIs, databases, and infrastructure components (e.g., RabbitMQ, Elasticsearch, Kibana, Prometheus). They allow templated, versioned, and configurable deployments to Kubernetes clusters.
- **Primary inputs**: Chart.yaml (metadata), values.yaml (default configuration), values-aws.yaml/local-values.yaml (environment-specific overrides), and template files (deployment.yaml, service.yaml, etc.).
- **Primary outputs**: Kubernetes manifests (Deployments, Services, ConfigMaps, HPAs) applied to a Kubernetes cluster.
- **Key files**:
    - `Deployments/helm/<workload>/Chart.yaml`: Defines chart metadata.
    - `Deployments/helm/<workload>/values.yaml`: Contains default configuration values.
    - `Deployments/helm/<workload>/templates/`: Directory holding Kubernetes manifest templates.
    - `Deployments/helm/install-helm.sh`: Script to install all charts.
- **Main code paths**: `install-helm.sh` orchestrates the installation of charts in dependency order (infra/DBs → APIs → gateway → optional extras). `helm install` and `helm upgrade` commands are used to deploy and update individual charts.

## Deep Dive
- **Type**: Library / Configuration
- **Primary runtime(s)**: Helm v3, Kubernetes
- **Entry points**:
  - `Deployments/helm/install-helm.sh`: Main script for installing all Helm charts in the platform.
  - `Deployments/helm/<workload>/Chart.yaml`: Entry point for defining a new Helm chart.
  - `Deployments/helm/<workload>/values.yaml`: Entry point for configuring a specific chart's deployment.

## Top-Level Structure
| Path | Purpose | Notes |
|---|---|---|
| `Deployments/helm/` | Helm charts for all workloads | Contains one chart directory per workload (APIs, databases, infra) |
| `Deployments/helm/<workload>/Chart.yaml` | Chart metadata | Defines chart name, version, and API version |
| `Deployments/helm/<workload>/values.yaml` | Default configuration values | Overridden by environment-specific `values-aws.yaml` or `local-values.yaml` |
| `Deployments/helm/<workload>/templates/` | Kubernetes manifest templates | Contains `deployment.yaml`, `service.yaml`, `configmap.yaml`, etc. |
| `Deployments/helm/install-helm.sh` | Installation script | Installs charts in dependency order |
| `Deployments/helm/uninstall-helm.sh` | Uninstallation script | Uninstalls all charts |

## Key Boundaries
- **Presentation**: N/A (Helm is infrastructure configuration, not presentation layer)
- **Application/Domain**: Helm charts encapsulate deployment details for various microservices (e.g., `catalog`, `basket`, `discount`, `ordering`).
- **Persistence/External I/O**: Database charts (`catalogdb`, `basketdb`, `discountdb`, `orderdb`) manage in-cluster datastores, relying on PersistentVolumes. Connection strings in `values.yaml` point to these or external managed endpoints (e.g., DocumentDB, ElastiCache, RDS).
- **Cross-cutting concerns**:
    - **Configuration**: Layered `values.yaml` files handle environment-specific configuration.
    - **Monitoring**: `prometheus` chart for monitoring.
    - **Service Mesh**: Istio sidecar injection is optionally enabled via pod annotations in `values.yaml`.
- **Responsibilities by file/module**:
    - `Chart.yaml`: Defines the chart's identity and dependencies.
    - `values.yaml`: Configures the deployed application/service.
    - `templates/*.yaml`: Generates Kubernetes resources.
    - `_helpers.tpl`: Provides reusable template snippets.
    - `install-helm.sh`: Orchestrates the deployment of multiple services.
- **Detailed code flows**:
    1.  `install-helm.sh` is executed.
    2.  It iterates through services in a predefined dependency order.
    3.  For each service, it calls `helm install` (or `helm upgrade`) with the chart directory and appropriate `values.yaml` files (e.g., `values-aws.yaml` for AWS).
    4.  Helm processes the `Chart.yaml` and `values.yaml`, combining them with templates in the `templates/` directory to generate Kubernetes manifests.
    5.  These manifests are applied to the target Kubernetes cluster.
- **How the pieces map together**:
    - `install-helm.sh` uses `Chart.yaml` and `values.yaml` to deploy templated Kubernetes manifests.
    - `values.yaml` defines parameters used within `templates/*.yaml`.
    - Services communicate via prefixed release names (e.g., `eshopping-catalogdb:27017`) resolved by Kubernetes DNS.
    - Istio integration is managed via pod annotations in `values.yaml`.
    - Images built by `Services` are pulled from ECR, configured via `image.registry` in `values.yaml`.

## Files inspected
- `Deployments/helm/CLAUDE.md`