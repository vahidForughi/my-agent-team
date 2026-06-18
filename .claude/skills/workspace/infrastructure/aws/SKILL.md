---
name: aws
description: AWS CloudFormation IaC templates and deployment scripts provisioning VPC, EKS, S3, and ALB for the e-commerce platform on AWS.
paths:
  - Infrastructure/aws/**/*
metadata:
  part-dir: Infrastructure/aws
---

## What this part is

`Infrastructure/aws/` is the AWS Infrastructure-as-Code layer. It is **not a .NET project** and is not included in `Ecommerce.sln`. It contains:

- `cloudformation/vpc.yaml` — VPC, subnets (public/private), Internet Gateway, NAT Gateway (single-AZ for dev cost savings), route tables
- `cloudformation/eks-cluster.yaml` — EKS control plane + managed node group (default: `m7i-flex.large`, 80GB gp3 EBS, k8s `1.30`)
- `cloudformation/s3-bucket.yaml` — `ecommerce-product-images-${AWS::AccountId}` bucket; public read on `products/*`
- `cloudformation/alb-ingress.yaml` — ALB ingress template (exists but **disabled** in `deploy-aws.sh`)
- `cloudformation/minimal-stack.yaml` — single-template alternative combining VPC + EKS
- `cloudformation/README.md` and `cloudformation/AWS-DEPLOYMENT.md` — manual deployment reference
- `deploy-aws.sh` / `cleanup-aws.sh` (repo root) — full lifecycle scripts

## Key files to read first

1. `Infrastructure/aws/cloudformation/AWS-DEPLOYMENT.md` — full manual deployment guide
2. `Infrastructure/aws/cloudformation/vpc.yaml` — networking foundation; check `RegionMap` before deploying outside `us-east-1`
3. `Infrastructure/aws/cloudformation/eks-cluster.yaml` — EKS cluster; imports VPC outputs via `Fn::ImportValue`
4. `deploy-aws.sh` (repo root) — orchestration order and prerequisite checks

## Top patterns

- **Modular stacks with exports**: VPC exports `VpcId`, `PrivateSubnetIds`, etc.; EKS imports them via `Fn::ImportValue`.
- **`EnvName` parameter**: shared across all stacks as the namespace key for cross-stack references.
- **Full lifecycle via scripts**: `deploy-aws.sh` creates ECR repos → pushes images → deploys stacks in order → installs Helm charts; `cleanup-aws.sh` reverses it.

## Gotchas

- `RegionMap` only covers `us-east-1` AZs in `vpc.yaml` and `minimal-stack.yaml` — extend it before deploying to other regions.
- ALB (`alb-ingress.yaml`) is **commented out** in `deploy-aws.sh`; Ocelot API gateway uses a Kubernetes LoadBalancer (NLB) instead.
- `deploy-aws.sh` **skips EKS stack update** if the stack is already healthy — template edits are not applied on re-run in that state.
- Do not run `minimal-stack.yaml` and the modular stacks with the same `EnvName`; export names will collide.
- S3 public-access block allows public read on `products/*`; tightening it breaks Catalog service image URLs.

## Full onboarding doc

`Infrastructure/aws/AGENT.md`
