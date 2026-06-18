# terraform — AWS Infrastructure (IaC)

## What & why

Terraform that provisions the AWS infrastructure the platform runs on: VPC/networking, EKS, ECR,
managed databases, message broker, S3, and OpenSearch. It exists so the cloud footprint is
declarative, reproducible per environment (`dev`/`staging`/`prod`), and decoupled from the in-cluster
deployment artifacts in [`Deployments/CLAUDE.md`](../Deployments/CLAUDE.md).

## Where it lives

`terraform/`:
- Root: `main.tf` (wires modules), `providers.tf`, `variables.tf`, `outputs.tf`, `versions.tf`, `backend.tf`, `terraform.tfvars.example`.
- `modules/`: `networking`, `security`, `eks`, `ecr`, `databases`, `messaging`, `storage`, `observability` (each with `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`).

## Tech stack

Terraform CLI `>= 1.5.0`; providers `hashicorp/aws ~> 5.80` and `hashicorp/tls ~> 4.0`
(`terraform/versions.tf`). Targets AWS — EKS `1.29`, managed AWS data/messaging/search services.

## Build / run / test

Prerequisite: AWS credentials and the four sensitive password vars set.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars      # then fill in passwords/secrets
terraform init
terraform plan -out=tfplan
terraform apply tfplan
terraform destroy
aws eks update-kubeconfig --region ap-southeast-1 --name ecommerce-eks-dev
```

## Configuration

- `terraform.tfvars` (copy of `terraform.tfvars.example`, gitignored) holds env values + secrets; or pass via `-var`/CI env.
- Defaults in `variables.tf`: `aws_region = ap-southeast-1`, `project_name = ecommerce`, `environment = dev` (validated `dev|staging|prod`), `vpc_cidr = 10.0.0.0/16`, `kubernetes_version = 1.29`, `node_instance_types = ["t3.medium"]`, node desired/min/max = `2/1/4`.
- Sensitive vars (required by databases/messaging modules): `mongodb_password`, `postgres_password`, `mssql_password`, `rabbitmq_password` (`variables.tf`, marked `sensitive`).
- Default tags `Project`/`ManagedBy`/`Environment` applied to every resource (`providers.tf`).

## Interfaces & contracts

- Module inputs are threaded in `main.tf`: `networking` (vpc_cidr) → `security` (vpc_id) → `eks` (private subnets, cluster SG, k8s version, node sizing) / `databases` (subnets, SG, passwords) / `messaging` (subnets, SG, password) / `observability` (subnets, SG); `ecr`/`storage` take only project/env.
- Root `outputs.tf` exposes: `vpc_id`; `eks_cluster_name`/`eks_cluster_endpoint`; `ecr_repository_urls`; `documentdb_endpoint`, `redis_endpoint`, `postgres_endpoint`, `mssql_endpoint`; `rabbitmq_endpoint`; `product_images_bucket`; `opensearch_endpoint`/`opensearch_dashboard`.
- Security module outputs the SG ids consumed downstream: `eks_cluster_sg_id`, `eks_nodes_sg_id`, `databases_sg_id`, `rabbitmq_sg_id`, `opensearch_sg_id` (`modules/security/outputs.tf`).
- EKS module outputs `cluster_oidc_issuer_url` / `oidc_provider_arn` enabling IRSA (`modules/eks/outputs.tf`).

## Data & state

- Managed datastores (`modules/databases/main.tf`): DocumentDB (`engine = docdb`, Catalog/Mongo), ElastiCache Redis (`engine_version 7.0`, Basket), RDS PostgreSQL (`engine = postgres`, `14`, Discount), RDS SQL Server (Ordering). Messaging: Amazon MQ RabbitMQ (`modules/messaging`, `engine_type RabbitMQ`). Search: Amazon OpenSearch (`modules/observability`). Storage: S3 product-images bucket with versioning + server-side encryption + public-access block (`modules/storage/main.tf`).
- Terraform state backend: defined in `backend.tf` — currently **local** (`terraform.tfstate`); the S3 + DynamoDB-lock backend (`bucket ecommerce-terraform-state`, `region ap-southeast-1`, `dynamodb_table ecommerce-terraform-locks`) is present but commented out, to be enabled after bootstrap via `terraform init -migrate-state`.

## Dependencies

- Module dependency order (Terraform infers it from references in `main.tf`): `networking` → `security` → `eks` / `databases` / `messaging` / `observability`; `ecr` and `storage` are standalone.
- Provisions the ECR registries and EKS cluster that [`Deployments/CLAUDE.md`](../Deployments/CLAUDE.md) deploy into, and the managed DB/MQ/OpenSearch/S3 endpoints those workloads connect to.
- `scripts/deploy/deploy-aws.sh` orchestrates AWS bring-up and uses CloudFormation for some pieces (see Gotchas).

## Patterns

- Modular by concern (`modules/<area>`); the root module wires them and threads `vpc_id`/subnet/security-group outputs between modules.
- IRSA: pods assume AWS roles directly via the EKS OIDC provider — no static credentials in the cluster.
- Use `-var`/`tfvars` for env-specific values; never hardcode secrets in `.tf`.

## Gotchas

- Sensitive password vars are required by the database/messaging modules — `plan`/`apply` fails without them.
- Confirm the state backend in `backend.tf` before `terraform init` in a new env (it's local until you enable + migrate to S3).
- EKS provisioning is slow; keep the TF EKS version (`1.29`) coherent with local/Helm assumptions when upgrading.
- `scripts/deploy/deploy-aws.sh` uses **CloudFormation** for some resources, not pure Terraform — know which tool owns which resource before `destroy`.

## Owners / agents

devops-automator (primary — owns IaC modules, state, AWS provisioning), backend-architect (data/topology design).
