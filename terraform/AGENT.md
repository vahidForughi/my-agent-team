# Terraform — AWS Infrastructure (IaC)

## 1-Line Summary

Terraform provisions the complete AWS cloud infrastructure for the e-commerce platform — VPC, EKS, ECR, DocumentDB, ElastiCache Redis, RDS PostgreSQL, RDS SQL Server, Amazon MQ RabbitMQ, S3, and OpenSearch — using eight composable child modules wired together in a single root module.

## 5-Minute Explanation

- **Primary tasks in code**: Declares and manages all AWS resources via Infrastructure as Code. The root module at `terraform/main.tf` calls eight child modules and threads outputs between them.
- **Primary inputs**: `terraform.tfvars` (or `-var` flags) for `aws_region`, `project_name`, `environment`, `vpc_cidr`, EKS sizing vars, and four sensitive password vars (`mongodb_password`, `postgres_password`, `mssql_password`, `rabbitmq_password`). AWS credentials via environment or profile.
- **Primary outputs**: VPC ID, EKS cluster name and endpoint, ECR repository URLs, database endpoints (DocumentDB, Redis, PostgreSQL, MSSQL), RabbitMQ endpoint, S3 product-images bucket name, OpenSearch endpoint and dashboard URL. All defined in `terraform/outputs.tf`.
- **Key files**:
  - `terraform/main.tf` — root orchestrator; eight `module` blocks with explicit variable threading
  - `terraform/variables.tf` — all input variables including four required sensitive credentials
  - `terraform/outputs.tf` — all root-level outputs surfaced after `terraform apply`
  - `terraform/backend.tf` — state backend (local by default; S3+DynamoDB block commented out)
  - `terraform/versions.tf` — Terraform `>= 1.5.0`, `hashicorp/aws ~> 5.80`, `hashicorp/tls ~> 4.0`
  - `terraform/providers.tf` — AWS provider with default tags (`Project`, `ManagedBy`, `Environment`)
  - `terraform/.tflint.hcl` — TFLint config using `tflint-ruleset-aws` v0.35.0
- **Main code paths**: `terraform init` → `terraform plan -out=tfplan` → `terraform apply tfplan`. Terraform reads `main.tf`, builds a dependency graph across module outputs, and calls the AWS API to converge actual state to declared state.

## Deep Dive

- **Type**: Infrastructure as Code (IaC) — AWS cloud resources provisioned by Terraform CLI
- **Primary runtime(s)**: HashiCorp Terraform CLI `>= 1.5.0`
- **Entry points**:
  - `terraform/main.tf` — Terraform starts here; eight `module` blocks are the unit of composition
  - `terraform/variables.tf` — defines every configurable input including required sensitive vars
  - `terraform/backend.tf` — controls where state is stored; must be correct before `init`

## Top-Level Structure

| Path | Purpose | Notes |
|------|---------|-------|
| `terraform/main.tf` | Root orchestrator | Calls all eight modules; threads vpc_id, subnet IDs, SG IDs between them |
| `terraform/variables.tf` | Root input variables | Four sensitive password vars have no defaults; `environment` validated as `dev\|staging\|prod` |
| `terraform/outputs.tf` | Root output values | All endpoints and identifiers surfaced after apply |
| `terraform/versions.tf` | Version constraints | Terraform `>= 1.5.0`, aws `~> 5.80`, tls `~> 4.0` |
| `terraform/providers.tf` | Provider config | AWS region from var; default tags on all resources |
| `terraform/backend.tf` | State backend | Local (`terraform.tfstate`) by default; S3+DynamoDB block commented out |
| `terraform/terraform.tfvars.example` | Tfvars template | Copy to `terraform.tfvars` and fill secrets; file is gitignored |
| `terraform/.tflint.hcl` | Linter config | Enables `tflint-ruleset-aws` v0.35.0 |
| `terraform/modules/networking/` | VPC, subnets, gateways | No upstream dependencies |
| `terraform/modules/security/` | Security groups, IAM | Depends on `networking.vpc_id` |
| `terraform/modules/eks/` | EKS cluster, node group, OIDC | Depends on `networking`, `security` |
| `terraform/modules/ecr/` | ECR repositories | Standalone |
| `terraform/modules/databases/` | DocumentDB, ElastiCache Redis, RDS PG, RDS MSSQL | Depends on `networking`, `security` |
| `terraform/modules/messaging/` | Amazon MQ RabbitMQ | Depends on `networking`, `security` |
| `terraform/modules/storage/` | S3 product-images bucket | Standalone |
| `terraform/modules/observability/` | OpenSearch domain | Depends on `networking`, `security` |

## Key Boundaries

- **Networking layer**: `modules/networking` — VPC, public/private subnets, Internet Gateway, NAT Gateway
- **Security layer**: `modules/security` — security groups (`eks_cluster_sg_id`, `eks_nodes_sg_id`, `databases_sg_id`, `rabbitmq_sg_id`, `opensearch_sg_id`) and IAM roles
- **Compute layer**: `modules/eks` — `aws_eks_cluster`, `aws_eks_node_group`, `aws_iam_openid_connect_provider` (OIDC/IRSA)
- **Registry layer**: `modules/ecr` — ECR repos for each service image
- **Persistence layer**: `modules/databases` — four managed datastores (DocumentDB, ElastiCache, RDS PG, RDS MSSQL)
- **Messaging layer**: `modules/messaging` — Amazon MQ `engine_type = "RabbitMQ"`
- **Storage layer**: `modules/storage` — S3 bucket with versioning, SSE, public-access block
- **Observability layer**: `modules/observability` — OpenSearch domain (Elasticsearch-compatible + Kibana dashboard)
- **Cross-cutting**: Default tags applied to all resources via `providers.tf`; `environment` variable controls prod-specific behavior (multi-AZ, deletion protection, skip_final_snapshot)

## Module Interface Map

`main.tf` threads outputs between modules explicitly:

```
networking (vpc_cidr)
  → .vpc_id → security
  → .private_subnet_ids → security, eks, databases, messaging, observability

security
  → .eks_cluster_sg_id → eks
  → .databases_sg_id   → databases
  → .rabbitmq_sg_id    → messaging
  → .opensearch_sg_id  → observability

eks
  → .cluster_name, .cluster_endpoint, .cluster_oidc_issuer_url, .oidc_provider_arn → root outputs

databases
  → .documentdb_endpoint, .redis_endpoint, .postgres_endpoint, .mssql_endpoint → root outputs

messaging
  → .rabbitmq_endpoint → root outputs

storage
  → .product_images_bucket_name → root outputs

observability
  → .opensearch_endpoint, .opensearch_dashboard_endpoint → root outputs
```

## Service-to-Datastore Mapping

| Microservice | AWS Resource | Terraform Resource |
|---|---|---|
| Catalog | DocumentDB | `aws_docdb_cluster.catalog` + `aws_docdb_cluster_instance.catalog` |
| Basket | ElastiCache Redis 7.0 | `aws_elasticache_replication_group.basket` |
| Discount | RDS PostgreSQL 14 | `aws_db_instance.discount` |
| Ordering | RDS SQL Server Express 15.00 | `aws_db_instance.ordering` |
| All services | Amazon MQ RabbitMQ | `aws_mq_broker` in `modules/messaging` |
| Catalog images | S3 | `aws_s3_bucket` in `modules/storage` |
| Logging/search | OpenSearch | `aws_opensearch_domain` in `modules/observability` |

## Detailed Code Flows

1. Operator runs `terraform apply` in the `terraform/` directory.
2. Terraform reads `main.tf` and builds a dependency graph from module output references.
3. Dependency order resolved: `networking` first, then `security` (needs `vpc_id`), then `eks`/`databases`/`messaging`/`observability` in parallel (all need subnets and SGs), with `ecr` and `storage` running in parallel from the start.
4. Each module's `main.tf` defines AWS resources; Terraform calls the AWS API for each.
5. Outputs from child modules flow to root `outputs.tf` and are displayed after apply.
6. State is written to `terraform.tfstate` (local) or the S3 backend (when enabled in `backend.tf`).
7. Post-apply, `aws eks update-kubeconfig --region ap-southeast-1 --name ecommerce-eks-dev` configures kubectl to target the new cluster.

## Environment-Specific Behavior

The `environment` variable (validated as `dev|staging|prod`) gates several resource settings inside `modules/databases/main.tf`:

- `skip_final_snapshot = var.environment != "prod"` — prod keeps a final snapshot on destroy
- `multi_az = var.environment == "prod"` — RDS PostgreSQL gets multi-AZ on prod only
- `deletion_protection = var.environment == "prod"` — prod RDS instances are protected from accidental destroy

SQL Server Express (`sqlserver-ex`) does not support Multi-AZ regardless of environment.

## Data & State

- **State backend**: Defined in `terraform/backend.tf`. Currently local (`terraform.tfstate`). The S3+DynamoDB backend (`bucket = "ecommerce-terraform-state"`, `region = "ap-southeast-1"`, `dynamodb_table = "ecommerce-terraform-locks"`, `encrypt = true`) is present but commented out. Enable it after bootstrapping the bucket/table, then run `terraform init -migrate-state`.
- **Sensitive vars**: `mongodb_password`, `postgres_password`, `mssql_password`, `rabbitmq_password` are marked `sensitive = true` in `variables.tf` — they are excluded from Terraform's output and logs.
- **IRSA**: The EKS OIDC provider (`aws_iam_openid_connect_provider.eks`) is provisioned in `modules/eks/main.tf`, outputting `cluster_oidc_issuer_url` and `oidc_provider_arn`. This allows Kubernetes service accounts to assume IAM roles without static credentials in the cluster.

## Dependencies

- **Upstream**: AWS credentials; `terraform.tfvars` with the four required password vars.
- **Downstream consumers**: `Deployments/` Helm charts and Kubernetes manifests deploy into the EKS cluster and ECR registries provisioned here. Microservices connect to the DB/MQ/OpenSearch endpoints output by this module.
- **Script overlap**: `scripts/deploy/deploy-aws.sh` orchestrates AWS bring-up and uses **CloudFormation** for some resources alongside Terraform. The boundary between what Terraform owns and what CloudFormation owns must be checked before running `terraform destroy`.

## Build / Run / Test

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # fill in passwords/secrets
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
terraform destroy

# After apply — connect kubectl to the new cluster:
aws eks update-kubeconfig --region ap-southeast-1 --name ecommerce-eks-dev

# Lint:
tflint --config=.tflint.hcl
```

## Owners / Agents

- `devops-automator` — primary owner; IaC modules, state management, AWS provisioning
- `backend-architect` — data topology and service-to-datastore design decisions

## Files Inspected

- `terraform/main.tf`
- `terraform/variables.tf`
- `terraform/outputs.tf`
- `terraform/versions.tf`
- `terraform/backend.tf`
- `terraform/providers.tf`
- `terraform/.tflint.hcl`
- `terraform/terraform.tfvars.example` (existence confirmed, not read)
- `terraform/modules/databases/main.tf`
- `terraform/modules/databases/variables.tf`
- `terraform/modules/databases/outputs.tf`
- `terraform/modules/databases/AGENT.md`
- `terraform/modules/eks/main.tf`
- `terraform/CLAUDE.md`

Modules not individually inspected (structure confirmed via `find`): `modules/networking`, `modules/security`, `modules/ecr`, `modules/messaging`, `modules/storage`, `modules/observability` — each follows the same `main.tf` / `variables.tf` / `outputs.tf` / `versions.tf` pattern.
