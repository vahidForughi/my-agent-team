# Codebase Orientation Map

## 1-Line Summary
Bash automation for platform deployment, cleanup, access, and debugging.

## 5-Minute Explanation
- **Primary tasks in code**: Automate deployment to Kubernetes (Minikube/AWS EKS) and Docker Compose, clean up resources, provide access to services, and aid in debugging.
- **Primary inputs**: CLI arguments for environment and region, configuration files for LocalStack and S3.
- **Primary outputs**: Deployed Kubernetes/Docker Compose resources, AWS CloudFormation stacks, S3 buckets, log output.
- **Key files**: `scripts/deploy/`, `scripts/cleanup/`, `scripts/access/`, `scripts/debug/`, `scripts/monitoring/`, and various root-level helper scripts.
- **Main code paths**: Entry via `deploy.sh` or `deploy-aws.sh` -> orchestrates `kubectl`, `helm`, `aws`, `docker` commands -> sets up infrastructure and services.

## Deep Dive
- **Type**: CLI / automation scripts
- **Primary runtime(s)**: Bash
- **Entry points**:
  - `scripts/deploy/deploy.sh`: Main script for local Kubernetes deployment.
  - `scripts/deploy/deploy-aws.sh`: Main script for AWS EKS deployment.
  - `scripts/README.md`: Provides an overview and quick reference for all scripts.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `scripts/deploy/` | Deployment automation | Kubernetes, AWS EKS, Docker Compose deployments |
| `scripts/cleanup/` | Resource teardown | Local Kubernetes and AWS resource cleanup |
| `scripts/access/` | Service access portals | Port-forwarding and service access |
| `scripts/debug/` | Debugging utilities | Log checking and database access |
| `scripts/monitoring/` | Observability setup | Grafana, Prometheus setup and health checks |
| `scripts/*.sh` | Root helpers | LocalStack, S3 migration, Docker Compose |

## Key Boundaries
- **Presentation**: CLI output (bash scripts)
- **Application/Domain**: Orchestrates deployment and management of microservices and infrastructure.
- **Persistence/External I/O**: Interacts with Kubernetes clusters, AWS services (EKS, S3), Docker, LocalStack.
- **Cross-cutting concerns**: Logging (color-coded `log_info`/`log_error` helpers).
- **Responsibilities by file/module**:
    - `scripts/deploy/`: Contains scripts for deploying the platform.
    - `scripts/cleanup/`: Contains scripts for tearing down deployed resources.
    - `scripts/access/`: Contains scripts for accessing deployed services.
    - `scripts/debug/`: Contains scripts for debugging.
    - `scripts/monitoring/`: Contains scripts for monitoring setup and health checks.
    - `scripts/init-localstack-s3.sh`: Initializes LocalStack S3 buckets.
    - `scripts/migrate-products-to-aws-s3.sh`: Migrates product images to AWS S3.
- **Detailed code flows**:
  1. User executes a script like `scripts/deploy/deploy.sh`.
  2. The script orchestrates `kubectl`, `helm`, or `docker` commands based on the target environment.
  3. These commands interact with Kubernetes, AWS, or Docker to deploy/manage resources.
  4. Output is displayed on the console.
- **How the pieces map together**: Scripts are standalone bash files that leverage external CLI tools (`kubectl`, `helm`, `aws`, `docker`) to manage the cloud-native ecommerce platform components. They are organized by function (deploy, cleanup, access, debug, monitoring).
- **Files inspected**:
    - `scripts/README.md`
    - `scripts/CLAUDE.md`
    - `scripts/deploy/deploy.sh`
    - `scripts/deploy/deploy-aws.sh`
    - `scripts/deploy/docker-deploy.sh`
    - `scripts/cleanup/cleanup.sh`
    - `scripts/cleanup/cleanup-aws.sh`
    - `scripts/access/access-services.sh`
    - `scripts/debug/check-logs.sh`
    - `scripts/monitoring/check-grafana-prometheus-health.sh`
    - (and other files found by `glob scripts/**/*`)
