---
name: deployments
description: All Kubernetes deployment artifacts for the platform — Helm charts, raw K8s manifests, Istio service mesh config, and in-cluster monitoring — orchestrated by scripts in scripts/deploy/.
paths:
  - Deployments/**/*
metadata:
  part-dir: Deployments
---

The Deployments part is the full deployment surface of the cloud-native e-commerce platform. It owns everything needed to get all workloads running on Kubernetes, whether locally on Minikube or on AWS EKS. Two parallel deployment mechanisms exist — Helm charts (`Deployments/helm/`) and raw manifests (`Deployments/k8s/`) — covering identical workloads; pick one per cluster and do not run both simultaneously.

## Key files to read first

- `Deployments/README.md` — full deployment guide: ports, service config, troubleshooting, Minikube vs. EKS flows
- `Deployments/DEPLOYMENT-CONFIGURATION.md` — configuration reference (port mappings, service names, env vars)
- `scripts/deploy/deploy.sh` — top-level Minikube orchestration script (calls Helm/K8s/Istio sub-steps in order)
- `scripts/deploy/deploy-aws.sh` — AWS EKS orchestration script
- `Deployments/helm/install-helm.sh` — Helm-path: installs all charts in dependency order
- `Deployments/k8s/deploy-k8s.sh` — K8s-path: applies all manifests in dependency order with readiness waits

## Sub-parts

| Sub-part | Dir | Responsibility |
|---|---|---|
| helm | `Deployments/helm/` | Preferred Helm v3 charts, one per workload; layered values (`values.yaml` / `values-aws.yaml` / `local-values.yaml`) |
| istio | `Deployments/istio/` | Istio 1.30.1 service mesh: gateway, VirtualServices, mTLS, Jaeger tracing, Kiali |
| k8s | `Deployments/k8s/` | Raw YAML manifests + deploy/cleanup/validate scripts; alternative to Helm |
| monitoring | `Deployments/monitoring/` | Grafana datasource fix, Prometheus Service alias, Helm values for Grafana, k6 dashboard JSON |

## Deployment entry points

```bash
# Local (Minikube), end-to-end:
./scripts/deploy/deploy.sh

# AWS EKS:
./scripts/deploy/deploy-aws.sh dev ap-southeast-1

# Helm only:
cd Deployments/helm && ./install-helm.sh

# Raw manifests only:
cd Deployments/k8s && ./deploy-k8s.sh
```

## Critical constraints

- Apply order is load-bearing for raw manifests: namespaces → configmaps → secrets → DBs → infra → services → gateway → monitoring → ingress → policies.
- Istio namespace label (`istio-injection=enabled`) must be set and pods restarted before sidecar injection takes effect.
- Do not run Helm and raw `k8s/` for the same workload in one cluster — they duplicate each other.
- All inter-service DNS uses in-cluster service names (e.g., `eshopping-catalogdb:27017`), never `localhost`.
- AWS deployments replace in-cluster DBs with managed services (DocumentDB, ElastiCache, RDS, Amazon MQ, OpenSearch) provisioned by `terraform/`.
