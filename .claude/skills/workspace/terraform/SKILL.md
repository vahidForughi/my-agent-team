---
name: terraform
description: AWS infrastructure provisioning via Terraform IaC — VPC, EKS, ECR, DocumentDB, ElastiCache Redis, RDS, Amazon MQ RabbitMQ, S3, and OpenSearch across dev/staging/prod environments.
paths:
  - terraform/**/*
metadata:
  part-dir: terraform
---

The Terraform root at `terraform/` provisions the full AWS cloud footprint for the e-commerce platform. Eight child modules are wired together in `main.tf`; dependency order is `networking` → `security` → `eks` / `databases` / `messaging` / `observability`, with `ecr` and `storage` standalone.

## Key files to read first

- `terraform/main.tf` — root orchestrator; calls all eight modules and threads outputs between them
- `terraform/variables.tf` — all input variables including four sensitive password vars (required at plan/apply)
- `terraform/outputs.tf` — all root-level outputs (VPC ID, EKS cluster name/endpoint, ECR URLs, DB/MQ/S3/OpenSearch endpoints)
- `terraform/backend.tf` — state backend (local by default; S3+DynamoDB block is commented out)
- `terraform/versions.tf` — Terraform `>= 1.5.0`, `hashicorp/aws ~> 5.80`, `hashicorp/tls ~> 4.0`
- `terraform/providers.tf` — AWS provider config with default tags (`Project`, `ManagedBy`, `Environment`)
- `terraform/modules/databases/main.tf` — DocumentDB, ElastiCache Redis, RDS PostgreSQL, RDS SQL Server with prod multi-AZ/deletion-protection branching
- `terraform/modules/eks/main.tf` — EKS cluster + OIDC provider (enables IRSA for pod-level AWS auth)
- `terraform/.tflint.hcl` — TFLint config using `tflint-ruleset-aws` v0.35.0

## Module map

| Module | AWS resources | Depends on |
|--------|---------------|------------|
| `modules/networking` | VPC, subnets, gateways | — |
| `modules/security` | Security groups, IAM | networking |
| `modules/eks` | EKS cluster, node group, OIDC | networking, security |
| `modules/ecr` | ECR repositories | — |
| `modules/databases` | DocumentDB, ElastiCache, RDS PG, RDS MSSQL | networking, security |
| `modules/messaging` | Amazon MQ RabbitMQ | networking, security |
| `modules/storage` | S3 product-images bucket | — |
| `modules/observability` | OpenSearch domain | networking, security |

## Service-to-datastore mapping

- Catalog → DocumentDB (`aws_docdb_cluster`)
- Basket → ElastiCache Redis (`aws_elasticache_replication_group`)
- Discount → RDS PostgreSQL (`aws_db_instance`, engine `postgres 14`)
- Ordering → RDS SQL Server (`aws_db_instance`, engine `sqlserver-ex`)
- All services → Amazon MQ RabbitMQ for async events

## Gotchas

- All four password vars (`mongodb_password`, `postgres_password`, `mssql_password`, `rabbitmq_password`) are required — no defaults. `plan` fails without them.
- State backend is **local** until you uncomment and migrate to S3 (`terraform init -migrate-state`).
- `scripts/deploy/deploy-aws.sh` uses CloudFormation for some resources — know which tool owns what before running `terraform destroy`.
- EKS `kubernetes_version = "1.29"` must stay coherent with Helm chart assumptions in `Deployments/`.

## Full onboarding doc

[`terraform/AGENT.md`](../../../../terraform/AGENT.md)
