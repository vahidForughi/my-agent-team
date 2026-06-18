---
name: aws
description: AWS CloudFormation templates for EKS, VPC, ALB, and S3 product-image storage. Use when editing Infrastructure/aws or integrating with deploy-aws.sh, cleanup-aws.sh, or manual CloudFormation deploys.
metadata:
  part-dir: Infrastructure/aws
---
# AWS Infrastructure Skill

This skill provides context for the `Infrastructure/aws` part of the codebase, which manages AWS CloudFormation templates for deploying the e-commerce platform.

## Key Files to Read First
- `Infrastructure/aws/cloudformation/vpc.yaml`: Defines the VPC, subnets, and networking.
- `Infrastructure/aws/cloudformation/eks-cluster.yaml`: Defines the EKS cluster and node groups.
- `Infrastructure/aws/cloudformation/s3-bucket.yaml`: Defines the S3 bucket for product images.
- `deploy-aws.sh` (project root): The main deployment script.
- `cleanup-aws.sh` (project root): The main cleanup script.

## Top Patterns
- **Modular CloudFormation**: Infrastructure is defined in separate, reusable YAML templates.
- **Automated Deployment**: Bash scripts (`deploy-aws.sh`, `cleanup-aws.sh`) handle end-to-end infrastructure provisioning and teardown.
- **Exports/Imports**: CloudFormation stack outputs are used as inputs for dependent stacks.

## Top Gotchas
- The ALB (Application Load Balancer) defined in `alb-ingress.yaml` is **not actively used** by default in `deploy-aws.sh`; Ocelot uses Kubernetes LoadBalancer (NLB).
- The `RegionMap` in VPC templates only defines `us-east-1` AZs. Deploying to other regions requires extending this map.
- `deploy-aws.sh` might skip EKS CloudFormation updates if the stack is already healthy, potentially ignoring template changes.

For a comprehensive understanding, refer to the full `AGENT.md`:
@Infrastructure/aws/AGENT.md