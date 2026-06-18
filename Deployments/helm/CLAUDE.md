# helm — Helm Charts

## What & why

Helm charts for every workload in the platform — the preferred, templated, upgradeable deployment
path (the raw-manifest alternative lives in [`k8s/CLAUDE.md`](../k8s/CLAUDE.md)). Charts are parameterised so
the same definitions run on Minikube and AWS EKS by swapping a values file.

## Where it lives

`Deployments/helm/` — one chart directory per workload:
- APIs: `catalog/`, `basket/`, `discount/` (chart name `discount-grpc`), `ordering/`, `ocelotapigw/`.
- Databases: `catalogdb/` (Mongo), `basketdb/` (Redis), `discountdb/` (Postgres), `orderdb/` (SQL Server).
- Infra / monitoring / utils: `rabbitmq/`, `elasticsearch/`, `kibana/`, `prometheus/`, `portainer/`, `pgadmin/`, `localstack/`.
- Scripts: `install-helm.sh` / `.ps1`, `uninstall-helm.sh` / `.ps1`.

Each chart contains `Chart.yaml`, `values.yaml` (+ `values-aws.yaml`, `local-values.yaml`), and a
`templates/` dir (`deployment.yaml`, `service.yaml`, `configmap.yaml`, `hpa.yaml`,
`serviceaccount.yaml`, `NOTES.txt`, `_helpers.tpl`, `tests/`).

## Tech stack

Helm v3, charts `apiVersion: v2` (`Deployments/helm/catalog/Chart.yaml`). Application charts default
to `version: 0.1.0` / `appVersion: "1.16.0"`; utility charts (`localstack`, `pgadmin`, `portainer`)
use `appVersion: "latest"`. Targets Kubernetes on Minikube and AWS EKS.

## Build / run / test

Prerequisite: `helm` v3 and a reachable cluster context.

```bash
cd Deployments/helm
./install-helm.sh                                                  # install everything (prefix eshopping-)
helm install eshopping-catalog catalog                             # one chart
helm install eshopping-catalog catalog -f catalog/values-aws.yaml  # AWS overrides
helm upgrade eshopping-catalog catalog --set image.tag=v2.0.0
helm test eshopping-catalog                                        # chart tests in templates/tests/
./uninstall-helm.sh
```

`install-helm.sh` installs in dependency order (infra/DBs → APIs → gateway → optional extras) with a
30s wait, naming every release `<APP_NAME>-<chart>` where `APP_NAME` defaults to `eshopping`.

## Configuration

- Layered values: `values.yaml` (defaults) ← `local-values.yaml` (Minikube) / `values-aws.yaml` (EKS), composed with `-f` rather than editing base values (`Deployments/helm/catalog/values.yaml`, `values-aws.yaml`).
- ConfigMap data is defined under `configmap:` in `values.yaml` and rendered by `templates/configmap.yaml`; env vars under `env.values`/`env.configmap` (`Deployments/helm/catalog/values.yaml`).
- Key switches (catalog example): `USE_LOCALSTACK` (`"false"` AWS / `"true"` local), `image.registry` (ECR account on AWS, empty for local), `AWS__S3__ServiceUrl`/`AWS_ENDPOINT_URL` (empty on AWS, `http://localstack:4566` local), `ASPNETCORE_ENVIRONMENT`.
- `serviceAccount` annotations carry the IRSA role ARN on AWS (set via `--set`; see `values-aws.yaml`).

## Interfaces & contracts

- Release names are prefixed `eshopping-*` — the install/uninstall scripts and inter-service DNS depend on it (e.g. `eshopping-catalogdb:27017`, `eshopping-elasticsearch:9200`, `eshopping-rabbitmq:5672`).
- API Services are `ClusterIP` on **port 80** locally (`service.type: ClusterIP`, `service.port: 80`); `values-aws.yaml` switches to `LoadBalancer`. Discount's chart exposes gRPC on **8080** (`Deployments/helm/discount/values.yaml`).
- HPA targets CPU/Memory ~80% (`autoscaling.targetCPUUtilizationPercentage: 80`, `templates/hpa.yaml`); local default `minReplicas: 1`, `maxReplicas: 100`, disabled in `values-aws.yaml`.
- Liveness `/health` and readiness `/ready` on port 80 (`values-aws.yaml`).

## Data & state

Database charts (`catalogdb`, `basketdb`, `discountdb`, `orderdb`) run the datastores in-cluster and
rely on PersistentVolumes provisioned by the target cluster. On AWS these are typically not deployed;
connection strings instead point at managed endpoints from [`terraform/CLAUDE.md`](../../terraform/CLAUDE.md)
(DocumentDB, ElastiCache, RDS). Default local conn strings live in each API chart's `values.yaml`
`configmap:` block.

## Dependencies

- Install order encoded in `install-helm.sh`: infra/DBs (`basketdb catalogdb discountdb elasticsearch kibana orderdb rabbitmq`) → APIs (`basket catalog ordering discount`) → gateway (`ocelotapigw`) → optional (`pgadmin portainer prometheus`).
- Images: built by [`Services`](../../Services/CLAUDE.md); pulled from ECR ([`terraform/CLAUDE.md`](../../terraform/CLAUDE.md)) on AWS via `image.registry` + `ecr-registry` pull secret.
- Sidecar injection depends on [`istio/CLAUDE.md`](../istio/CLAUDE.md) being installed and the namespace labelled.

## Patterns

- Charts share a uniform template set; `_helpers.tpl` defines `fullname`/labels. **Copy an existing chart** when adding a new workload.
- Override per-environment with `-f <values-file>` / `--set`, never by editing base `values.yaml`.
- Istio sidecar injection is opt-in via pod annotation `sidecar.istio.io/inject: "true"` in `values.yaml` (`podAnnotations`).
- ServiceAccounts back IRSA (`serviceAccount.create: true`).

## Gotchas

- Keep container port aligned with the service port (80) — a mismatch breaks readiness.
- For AWS, set `image.registry` to the ECR account; leave empty for local/Minikube.
- S3: empty `AWS__S3__ServiceUrl` + IRSA on AWS, `http://localstack:4566` + `USE_LOCALSTACK=true` locally.
- `install-helm.sh` continues on per-chart failure (logs a warning) — check `helm list` after running, don't assume success.
- These charts duplicate [`k8s/CLAUDE.md`](../k8s/CLAUDE.md) — don't deploy both for one workload in the same cluster.

## Owners / agents

devops-automator (primary — owns chart authoring, values layering, release flow).
