# deployments — Deployment Artifacts

## What & why

Everything needed to deploy the platform onto Kubernetes: Helm charts, raw K8s manifests, the
Istio service mesh, and in-cluster monitoring. It exists so the same workloads can run on Minikube
(local) and AWS EKS from versioned, reviewable artifacts rather than ad-hoc `kubectl` commands. The
underlying AWS infrastructure these workloads run on is provisioned separately by
[`terraform/CLAUDE.md`](../terraform/CLAUDE.md).

## Where it lives

`Deployments/` — top-level guides plus four sub-parts:
- `README.md` — full deployment guide (ports, service config, troubleshooting).
- `DEPLOYMENT-CONFIGURATION.md` — configuration reference.
- [`helm/CLAUDE.md`](./helm/CLAUDE.md) → `Deployments/helm/` — Helm charts, one per workload (preferred path).
- [`istio/CLAUDE.md`](./istio/CLAUDE.md) → `Deployments/istio/` — service mesh (Istio 1.30.1): gateway, routing, tracing, Kiali.
- [`k8s/CLAUDE.md`](./k8s/CLAUDE.md) → `Deployments/k8s/` — raw manifests + ordered deploy/cleanup/validate scripts.
- [`monitoring/CLAUDE.md`](./monitoring/CLAUDE.md) → `Deployments/monitoring/` — Grafana provisioning + k6 dashboard.

Also see `DEPLOYMENT-GUIDE.md` at the repo root and the orchestration scripts in `scripts/deploy/`.

## Tech stack

- Kubernetes (Minikube local, AWS EKS `1.29` per [`terraform/CLAUDE.md`](../terraform/CLAUDE.md)).
- Helm v3 charts (`apiVersion: v2`, see `Deployments/helm/*/Chart.yaml`).
- Istio `1.30.1` (distribution vendored at repo root `istio-1.30.1/bin/istioctl`).
- Prometheus + Grafana for monitoring; RabbitMQ, Elasticsearch/Kibana, LocalStack as supporting infra charts.

## Build / run / test

```bash
# Local end-to-end (Minikube), orchestrated:
./scripts/deploy/deploy.sh
# AWS EKS:
./scripts/deploy/deploy-aws.sh dev ap-southeast-1
```

Per sub-part flows: `Deployments/helm/install-helm.sh` (Helm), `Deployments/k8s/deploy-k8s.sh`
(ordered raw apply), `kubectl apply -f Deployments/istio/...` (mesh). Prefer the `scripts/`
orchestrators over manual multi-step runs. Full guide: `Deployments/README.md` and
`Deployments/DEPLOYMENT-CONFIGURATION.md`.

## Configuration

- Helm: layered `values.yaml` ← `local-values.yaml` (Minikube) / `values-aws.yaml` (EKS), applied with `-f` — see [`helm/CLAUDE.md`](./helm/CLAUDE.md).
- Raw K8s: `Deployments/k8s/configmaps.yaml` + `secrets.yaml` (base64) — see [`k8s/CLAUDE.md`](./k8s/CLAUDE.md).
- Env switches surfaced through config: `USE_LOCALSTACK` (S3 LocalStack vs AWS), `image.registry` (ECR vs local). All connection strings use in-cluster service DNS, never `localhost`.

## Interfaces & contracts

This part deploys and exposes the platform's runtime surface; details live in the sub-parts:
- Ingress: Istio `ecommerce-gateway` (port 80, hosts `*`) + VirtualServices routing `/api/v1/Catalog|Basket|Order` to `catalog|basket|ordering:80` and Discount as gRPC to `eshopping-discount-discount-grpc:8080` — see [`istio/CLAUDE.md`](./istio/CLAUDE.md).
- Workloads: container port = service port = **80** internally; Helm release names prefixed `eshopping-*` — see [`helm/CLAUDE.md`](./helm/CLAUDE.md).
- Monitoring endpoints: Prometheus (`monitoring` ns) and Grafana (`istio-system` ns) — see [`monitoring/CLAUDE.md`](./monitoring/CLAUDE.md).

## Data & state

Stateful workloads (Mongo/Redis/Postgres/SQL Server, RabbitMQ, Elasticsearch) back onto
PersistentVolumes in-cluster for local/Minikube — see [`k8s/CLAUDE.md`](./k8s/CLAUDE.md) and
[`helm/CLAUDE.md`](./helm/CLAUDE.md). On AWS these are replaced by managed services (DocumentDB, ElastiCache,
RDS, Amazon MQ, OpenSearch) provisioned by [`terraform/CLAUDE.md`](../terraform/CLAUDE.md); the deployment
artifacts only point connection strings at those endpoints.

## Dependencies

- Apply ordering is load-bearing for raw manifests: namespaces → config/secrets → DBs → infrastructure → services → monitoring → ingress → policies (see [`k8s/CLAUDE.md`](./k8s/CLAUDE.md)).
- Istio must be installed and the namespace labelled before workload sidecars inject (see [`istio/CLAUDE.md`](./istio/CLAUDE.md)).
- Container images come from the [`Services`](../Services/CLAUDE.md) build; on AWS they are pulled from ECR provisioned by [`terraform/CLAUDE.md`](../terraform/CLAUDE.md).
- The `scripts/deploy/` helpers orchestrate Helm/K8s/Istio/monitoring together.

## Patterns

- Two interchangeable ways to deploy the same workloads — **Helm** (`helm/`, templated, preferred) and **raw manifests** (`k8s/`). Keep them conceptually aligned and pick one per cluster.
- Config is ConfigMap/Secret-driven; in-cluster service DNS is used everywhere.
- Prefer the `scripts/` deploy/cleanup/access helpers over manual `kubectl`/`helm` sequences (the ordering is encoded there).

## Gotchas

- Apply order matters for raw manifests (namespaces → config/secrets → DBs → services → …); the script encodes it.
- Istio sidecar injection requires the namespace label **and** a pod restart to take effect.
- mTLS misconfiguration commonly surfaces as 503s between services.
- Don't run Helm and raw `k8s/` for the same workload in one cluster — they duplicate each other.

## Owners / agents

devops-automator (primary — owns deployment artifacts and orchestration).
