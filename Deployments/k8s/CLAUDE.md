# k8s — Raw Kubernetes Manifests

## What & why

Plain YAML Kubernetes manifests (no Helm) for the full platform, plus ordered
deploy/cleanup/validate scripts. Useful for CI/CD, debugging, and understanding the raw resources
behind the templated [`helm/CLAUDE.md`](../helm/CLAUDE.md) path.

## Where it lives

`Deployments/k8s/`:
- Top-level: `namespace.yaml`, `configmaps.yaml`, `secrets.yaml`.
- Workloads: `catalog/`, `basket/`, `discount/`, `ordering/`, `gateway/`, `databases/` (`mongodb.yaml`, `redis.yaml`, `postgresql.yaml`, `sqlserver.yaml`), `infrastructure/` (`rabbitmq.yaml`, `elasticsearch.yaml`, `kibana.yaml`), `monitoring/` (`prometheus.yaml`, `grafana.yaml`, `rbac.yaml`), `management/` (`portainer.yaml`, `pgadmin.yaml`), `services/`.
- Policies: `network-policies/` (`default-deny.yaml`, `allow-dns.yaml`), `pod-disruption-budgets/` (`microservices-pdb.yaml`), `ingress/` (`api-ingress.yaml`, `monitoring-ingress.yaml`, `ingress.yaml`).
- Scripts: `deploy-k8s.sh`, `deploy-all.sh`, `cleanup-k8s.sh`, `cleanup-all.sh`, `port-forward.sh`, `validate-deployment.sh`, `validate-manifests-simple.sh`, `validate-yaml.sh`.

## Tech stack

Vanilla Kubernetes manifests applied with `kubectl`; bash orchestration scripts. Targets Minikube
locally and AWS EKS (`1.29`). No Helm/Kustomize templating layer.

## Build / run / test

Prerequisite: `kubectl` connected to a cluster (the script checks `kubectl cluster-info`).

```bash
cd Deployments/k8s
./deploy-k8s.sh                 # ordered apply (preferred — encodes ordering + readiness waits)
./validate-deployment.sh        # post-deploy validation
./port-forward.sh               # local access to services
./cleanup-k8s.sh                # tear down

# Manual, in order:
kubectl apply -f namespace.yaml
kubectl apply -f configmaps.yaml
kubectl apply -f secrets.yaml
kubectl apply -f databases/ -f infrastructure/ -f services/ -f monitoring/ \
               -f ingress/ -f network-policies/ -f pod-disruption-budgets/
```

## Configuration

- `configmaps.yaml` — non-secret app config (connection settings, service URLs).
- `secrets.yaml` — credentials; values must be **base64-encoded**.
- Per-deployment env/probes are defined inline in each workload manifest (`services/*.yaml`, `databases/*.yaml`).
- Validate before applying: `validate-yaml.sh`, `validate-manifests-simple.sh`, `validate-deployment.sh`.

## Interfaces & contracts

- Namespaces: `namespace.yaml` declares `ecommerce` and `monitoring`.
- Services discoverable via cluster DNS; API services on port **80**, Discount gRPC on **8080** (`eshopping-discount-discount-grpc`).
- Ingress: `ingress/api-ingress.yaml` (platform APIs), `ingress/monitoring-ingress.yaml` (monitoring UIs).
- NetworkPolicies (`network-policies/`) are scoped to namespace `ecommerce` (`default-deny.yaml`, `allow-dns.yaml`).
- PodDisruptionBudgets (`pod-disruption-budgets/microservices-pdb.yaml`) — `minAvailable: 1` per microservice.

## Data & state

Database workloads (`databases/mongodb.yaml`, `redis.yaml`, `postgresql.yaml`, `sqlserver.yaml`) and
infra (Elasticsearch) use PersistentVolumes that must be provisionable in the target cluster. On AWS
these are replaced by managed datastores from [`terraform/CLAUDE.md`](../../terraform/CLAUDE.md); the raw
manifests are intended primarily for local/Minikube use.

## Dependencies

- Apply order is load-bearing and encoded in `deploy-k8s.sh`: namespaces → configmaps → secrets → databases → infrastructure → services (microservices) → gateway → monitoring → management → ingress (+ policies / PDBs).
- `deploy-k8s.sh` waits for readiness between stages (`kubectl wait`) and warns (non-fatal) on PVC/slow-start delays.
- Images expected locally as `eshop/<service>:latest` (built by [`Services`](../../Services/CLAUDE.md)); pulled from ECR on AWS.
- Duplicates [`helm/CLAUDE.md`](../helm/CLAUDE.md) — same workloads, different mechanism.

## Patterns

- Apply order is non-negotiable; prefer `deploy-k8s.sh` over manual `kubectl apply`.
- Validate before applying with the `validate-*.sh` scripts.
- Zero-trust networking: default-deny plus explicit allow rules (DNS, then per-path).

## Gotchas

- `namespace.yaml` and `network-policies/` target `ecommerce`/`monitoring`, but `deploy-k8s.sh` actually deploys workloads into `default`, `monitoring`, and `istio-system` — confirm which namespace a resource lands in before debugging.
- Secrets must be base64-encoded or the apply silently carries bad values.
- Network policies are default-deny; a new pod-to-pod path needs an explicit allow rule or traffic breaks **silently**.
- Database workloads need provisionable PersistentVolumes in the target cluster.
- Don't run these and [`helm/CLAUDE.md`](../helm/CLAUDE.md) for the same workload in one cluster.

## Owners / agents

devops-automator (primary — owns manifests, ordering scripts, network policies).
