# scripts — Repo Automation (Bash)

## What & why

Bash automation that deploys, cleans up, accesses, and debugs the platform across local
(Minikube / Docker Compose) and AWS (EKS) environments, plus S3/LocalStack and monitoring helpers.
They encode the correct ordering and known fixups so operators don't have to assemble long
`kubectl`/`helm`/`aws` sequences by hand. Run all scripts from the **project root** (`scripts/README.md`).

## Where it lives

`scripts/`:
- `deploy/` — `deploy.sh` (Minikube, full stack + monitoring), `deploy-aws.sh`,
  `deploy-aws-minimal.sh`, `docker-deploy.sh`, `build-images.sh`, `start.sh`.
- `cleanup/` — `cleanup.sh` (local K8s), `cleanup-aws.sh`.
- `access/` — `access-services.sh`, `access-services-aws-smart.sh` (port-forward portals).
- `debug/` — `check-logs.sh`, `database-access.sh`.
- `monitoring/` — Grafana/Prometheus setup + health/validation
  (`setup-grafana-prometheus-connection.sh`, `check-grafana-prometheus-health.sh`,
  `test-grafana-connectivity.sh`, `validate-grafana-fix.sh`, `monitor-grafana-health.sh`),
  Istio metrics (`enable-istio-metrics.sh`), Kiali/Portainer fixups, plus `README.md`.
- Root helpers: `docker-compose-up.sh`, `init-localstack-s3.sh`, `verify-localstack.sh`,
  `verify-s3.sh`, `migrate-products-to-aws-s3.sh`, `migrate-images-to-localstack.sh`,
  `update-s3-bucket-urls.sh`, `setup-https-self-signed.sh`, `setup-grafana.sh`,
  `validate-grafana.sh`, `demo-kubernetes.sh`, `README.md`.

## Tech stack

- Bash (`#!/bin/bash`, `set -e`), color-coded `log_info`/`log_error` helpers, idempotent re-runs.
- Orchestrates `kubectl`, `helm`, `aws` (CloudFormation/EKS), `docker`/`docker compose`, and the
  AWS CLI against LocalStack; AWS scripts require `jq`.

## Build / run / test

```bash
./scripts/deploy/deploy.sh                       # local Minikube, full stack + monitoring
./scripts/deploy/deploy-aws.sh dev <region>      # AWS EKS, full (e.g. us-east-1 / ap-southeast-1)
./scripts/deploy/deploy-aws-minimal.sh dev <region>  # AWS EKS, cost-optimized
./scripts/deploy/docker-deploy.sh                # Docker Compose
./scripts/access/access-services.sh             # interactive port-forward menu
./scripts/cleanup/cleanup.sh                     # tear down local
./scripts/cleanup/cleanup-aws.sh dev             # tear down AWS
bash scripts/docker-compose-up.sh                # docker compose + LocalStack S3 init + image migrate
```

Prereqs: run from project root; Minikube needs enough RAM/CPU/disk (the script requests ~10GB/8CPU);
AWS scripts need a configured profile and `jq`. `access/` scripts open port-forwards on the standard
service ports.

## Configuration

- `deploy-aws.sh` / `deploy-aws-minimal.sh` / `cleanup-aws.sh` — positional `ENV` (`dev`) and
  `REGION` args; auto-detect AWS profile/account.
- `init-localstack-s3.sh` — `BUCKET_NAME` (default `ecommerce-product-images`),
  `LOCALSTACK_ENDPOINT` (default `http://localhost:4566`), `IMAGES_DIR`
  (default `./client/src/images/products`); uses `AWS_ACCESS_KEY_ID=test` / `AWS_SECRET_ACCESS_KEY=test`.
- S3 mode switch — `USE_LOCALSTACK` decides whether S3 migration scripts target LocalStack vs AWS;
  the two `migrate-*` scripts and `update-s3-bucket-urls.sh` must match the active mode.

## Interfaces & contracts

No programmatic API. The contract is the CLI surface: each script's args/flags and the cluster
state it produces (deployed namespaces, port-forwards, S3 buckets). `monitoring/` scripts return
exit code `0` on healthy / non-zero on failure (`test-grafana-connectivity.sh` is designed for
CI). Scripts wrap `kubectl`/`helm`/`aws`, so their effective "contract" is the resulting K8s/AWS
resources, not a stable code interface.

## Data & state

- No persisted results of its own; produces cluster/AWS state (deployments, services,
  CloudFormation stacks), local S3/LocalStack buckets, and self-signed certs.
- Consumes manifests/values from `Deployments/` and infra from `terraform/`.

## Dependencies

- Depends on `kubectl`, `helm`, the AWS CLI + `jq`, `docker`/`docker compose`, Minikube, and
  LocalStack being installed/reachable.
- Orchestrates artifacts in `Deployments/` (Helm/raw K8s) and `terraform/` (infra).
- Depended on by `monitoring` (Grafana validation/setup) and `tests/k6` (port-forwards for
  PushGateway/Prometheus). The deploy scripts are the recommended entry point over manual commands.

## Patterns

- `set -e`, color-coded, idempotent (safe to re-run) — follow this style when adding scripts
  (see any `deploy/*.sh`). Prefer these helpers over hand-rolled `kubectl`/`helm` sequences.
- Two AWS deploy tiers: full (`deploy-aws.sh`) vs cost-optimized (`deploy-aws-minimal.sh`, which
  skips monitoring / uses single-AZ).
- Layout by purpose: `deploy/`, `cleanup/`, `access/`, `debug/`, `monitoring/` + root S3/LocalStack
  helpers (`scripts/README.md`).

## Gotchas

- Port-forwards started by `access/` scripts die when the terminal exits — background them (`&`).
- AWS deploy uses CloudFormation and can take 30–40 min on first run (minimal ~20–25 min).
- Minikube deploy fails without enough RAM/CPU/disk (~10GB/8CPU requested).
- S3 migration scripts must match the active mode (LocalStack vs AWS) and `USE_LOCALSTACK`; running
  the wrong one corrupts image URLs.

## Owners / agents

- `devops-automator` — owns deployment, teardown, access, and infra-orchestration scripting.
