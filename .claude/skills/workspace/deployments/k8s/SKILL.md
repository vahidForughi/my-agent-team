---
name: k8s
description: Raw Kubernetes YAML manifests for the full platform plus ordered deploy/cleanup/validate bash scripts — the Helm-free alternative deployment path.
paths:
  - Deployments/k8s/**/*
metadata:
  part-dir: Deployments/k8s
---

The `k8s` sub-part provides plain Kubernetes manifests (no Helm, no Kustomize) for every workload in the platform, plus bash scripts that enforce the mandatory apply ordering. It mirrors the `Deployments/helm/` charts in coverage; choose one mechanism per cluster and never run both simultaneously.

## Key files to read first

- `Deployments/k8s/deploy-k8s.sh` — orchestration script: applies all manifests in dependency order with `kubectl wait` readiness checks
- `Deployments/k8s/namespace.yaml` — declares the `ecommerce` and `monitoring` namespaces
- `Deployments/k8s/configmaps.yaml` — global non-secret configuration (connection settings, service URLs)
- `Deployments/k8s/secrets.yaml` — base64-encoded credentials (must be correctly encoded or values are silently wrong)
- `Deployments/k8s/validate-deployment.sh` — post-deploy health and status validation
- `Deployments/k8s/cleanup-k8s.sh` — tears down all deployed resources
- `Deployments/k8s/network-policies/default-deny.yaml` — zero-trust default-deny NetworkPolicy

## Directory layout

| Path | Contents |
|---|---|
| `databases/` | `mongodb.yaml`, `redis.yaml`, `postgresql.yaml`, `sqlserver.yaml` — StatefulSets + PVCs |
| `infrastructure/` | `rabbitmq.yaml`, `elasticsearch.yaml`, `kibana.yaml` |
| `services/` | `catalog-api.yaml`, `basket-api.yaml`, `discount-api.yaml`, `ordering-api.yaml` |
| `gateway/` | `ocelot-apigw.yaml`, `ocelot-configmap.yaml` |
| `monitoring/` | `prometheus.yaml`, `grafana.yaml`, `rbac.yaml` |
| `management/` | `portainer.yaml`, `pgadmin.yaml` |
| `network-policies/` | `default-deny.yaml`, `allow-dns.yaml` |
| `pod-disruption-budgets/` | `microservices-pdb.yaml` (`minAvailable: 1` per microservice) |
| `ingress/` | `api-ingress.yaml`, `monitoring-ingress.yaml`, `ingress.yaml` |

## Commands

```bash
cd Deployments/k8s
./deploy-k8s.sh                   # ordered apply with readiness waits (preferred)
./validate-deployment.sh          # post-deploy validation
./port-forward.sh                 # local port-forwarding for access
./cleanup-k8s.sh                  # tear down all resources

# Validate manifests before applying:
./validate-yaml.sh
./validate-manifests-simple.sh
```

## Mandatory apply order (encoded in deploy-k8s.sh)

namespaces → configmaps → secrets → databases → infrastructure → services → gateway → monitoring → management → ingress → network-policies → pod-disruption-budgets

## Critical constraints

- Apply order is non-negotiable — always use `deploy-k8s.sh` rather than manual `kubectl apply`.
- Secrets must be **base64-encoded** — incorrect encoding is silent; values arrive corrupted.
- Network policies are default-deny: every new pod-to-pod path requires an explicit allow rule or traffic breaks silently.
- `namespace.yaml` declares `ecommerce`/`monitoring`, but workloads deploy into `default`, `monitoring`, and `istio-system` — confirm the target namespace before debugging.
- Database manifests require provisionable PersistentVolumes; intended primarily for Minikube.
- Expected local images: `eshop/<service>:latest` (built by `Services/`); ECR images on AWS.
- Do not run alongside `Deployments/helm/` for the same workload in one cluster.
