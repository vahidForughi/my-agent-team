# Infrastructure/aws — do/don't

## Do

- Run `deploy-aws.sh` from the repo root for full end-to-end deployment; it handles prerequisites, ECR image push, CloudFormation stack ordering, and Helm chart installs in the correct sequence.
- Use `cleanup-aws.sh` to tear down all AWS resources; do not delete CloudFormation stacks manually — dependent stacks import exported values and must be deleted in reverse order.
- Extend `RegionMap` in `vpc.yaml` and `minimal-stack.yaml` before deploying to any region other than `us-east-1`; the AZ lists are hardcoded per region.
- Pass `EnvName` consistently across all stacks in a deployment; stacks cross-reference each other via `Fn::ImportValue` keyed on `EnvName`.
- Review `cloudformation/README.md` and `cloudformation/AWS-DEPLOYMENT.md` for manual deployment parameters before running `aws cloudformation deploy` on individual templates.

## Don't

- Do not deploy `minimal-stack.yaml` and the modular stacks (`vpc.yaml` + `eks-cluster.yaml`) with the same `EnvName` simultaneously; their exported names will collide.
- Do not tighten the S3 public-access block on the `ecommerce-product-images-*` bucket without updating Catalog service image URL logic; the bucket policy allows public read on `products/*`.
- Do not assume the ALB is active — `alb-ingress.yaml` exists but the ALB deployment step is commented out in `deploy-aws.sh`; Ocelot currently uses a Kubernetes LoadBalancer (NLB).
- Do not edit CloudFormation templates and expect changes to apply on re-run if the EKS stack is already healthy; `deploy-aws.sh` skips the EKS stack update in that state.
- Do not duplicate networking or EKS resources in `terraform/` — pick one IaC path; mixing CloudFormation and Terraform for the same resources will cause state conflicts.
- Do not add .NET source files to this directory; `Infrastructure/aws/` is IaC only and is not part of `Ecommerce.sln`.

@AGENT.md
