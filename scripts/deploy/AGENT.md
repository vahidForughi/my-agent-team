# Codebase Orientation Map

## 1-Line Summary
Bash scripts for deploying various components of the cloud-native e-commerce platform.

## 5-Minute Explanation
- **Primary tasks in code**: Orchestrating the deployment of microservices, infrastructure (e.g., Kubernetes, Docker Compose), and related configurations.
- **Primary inputs**: Environment variables (e.g., image names, cluster configurations), CLI arguments, and configuration files specific to deployment targets (e.g., Kubernetes YAMLs, Docker Compose files).
- **Primary outputs**: Deployed services, updated infrastructure, and deployment logs.
- **Key files**:
    - `scripts/deploy/deploy-kubernetes.sh`: Specific Kubernetes deployment logic.
    - `scripts/deploy/deploy-docker-compose.sh`: Specific Docker Compose deployment logic.
    - `scripts/deploy/<service-name>-deploy.sh`: Potentially individual service deployment scripts.
- **Main code paths**: Scripts are executed directly to trigger deployments to specific environments or platforms.

## Deep Dive
- **Type**: Bash CLI scripts
- **Primary runtime(s)**: Bash
- **Entry points**:
  - `scripts/deploy/deploy-kubernetes.sh`: Entry point for Kubernetes deployments.
  - `scripts/deploy/deploy-docker-compose.sh`: Entry point for Docker Compose deployments.
  - Any other `.sh` file within `scripts/deploy/` serves as a direct deployment entry point.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `scripts/deploy/` | Contains all scripts related to deploying the application. | Each script focuses on a specific deployment target or component. |

## Key Boundaries
- **Cross-cutting concerns**: Reading environment-specific configurations, handling authentication for deployment targets (e.g., `kubectl` context, AWS CLI profiles), and basic error handling.
- **Responsibilities by file/module**: Each script is responsible for the deployment of a particular part of the system or to a specific environment.
- **Detailed code flows**:
  1. A user executes a deployment script (`./scripts/deploy/deploy-kubernetes.sh`).
  2. The script configures the environment (e.g., sets Kubernetes context).
  3. It then calls deployment tools (`kubectl`, `docker-compose`) with relevant configuration files.
  4. Logs deployment progress and results.
  5. Exits with a status indicating success or failure.
- **How the pieces map together**: These scripts are often called by CI/CD pipelines or manually by developers to push changes to different environments. They abstract away the complexities of underlying deployment tools.
- **Files inspected**: No specific files inspected yet in `scripts/deploy/` beyond the directory itself. This AGENT.md is based on the general purpose of a 'deploy' script directory and parent directory analysis.
