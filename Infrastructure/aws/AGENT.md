# AWS CloudFormation Infrastructure

## What & Why
This part of the repository contains AWS CloudFormation templates responsible for provisioning the core infrastructure required to run the e-commerce platform on Amazon Elastic Kubernetes Service (EKS). This includes networking (VPC, subnets, NAT Gateway), the EKS cluster itself, and supporting services like S3 for product image storage. The primary goal is to provide a reproducible and automated way to deploy the entire environment.

## Where It Lives
All CloudFormation templates are located in `Infrastructure/aws/cloudformation/`.
Deployment and cleanup scripts are located in the project root: `deploy-aws.sh` and `cleanup-aws.sh`.

## Tech Stack
- **AWS CloudFormation**: Infrastructure as Code (IaC) for provisioning AWS resources.
- **AWS EKS**: Managed Kubernetes service.
- **AWS S3**: Object storage for product images.
- **AWS VPC**: Networking components (VPC, subnets, route tables, Internet Gateway, NAT Gateway).
- **Bash scripting**: For orchestrating the CloudFormation deployments and other AWS CLI commands.

## Build/Run/Test
The deployment process is orchestrated by `deploy-aws.sh` and `cleanup-aws.sh` scripts located at the project root.

**Deployment Steps (`deploy-aws.sh`):**
1. Checks prerequisites (AWS CLI, kubectl, helm, docker, jq).
2. Creates ECR repositories.
3. Builds and pushes Docker images to ECR.
4. Deploys VPC using `cloudformation/vpc.yaml`.
5. Deploys EKS cluster using `cloudformation/eks-cluster.yaml`.
6. Installs EBS CSI driver.
7. Deploys self-managed databases via Helm charts.
8. Deploys API microservices.
9. Deploys monitoring stack (Prometheus, Istio, Grafana, Jaeger, Kiali).
10. Creates Application Load Balancer using `cloudformation/alb-ingress.yaml`.

**Cleanup Steps (`cleanup-aws.sh`):**
Removes all AWS resources created by the deployment.

**Manual Deployment (Advanced):**
Individual CloudFormation stacks can be deployed manually using `aws cloudformation deploy` commands as detailed in `Infrastructure/aws/cloudformation/README.md` and `Infrastructure/aws/AWS-DEPLOYMENT.md`.

## Configuration
- **CloudFormation Parameters**: Each `.yaml` template defines parameters for customization (e.g., `EnvName`, `VpcCidr`, `KubernetesVersion`, `NodeInstanceType`).
- **Environment Variables**: `AWS_PROFILE` and `AWS_DEFAULT_REGION` can be used to configure AWS CLI.
- **EKS Version**: Defaults to Kubernetes `1.30`.
- **Node Configuration**: Default `m7i-flex.large` instances with 80GB gp3 EBS volumes for EKS nodes.
- **VPC CIDR**: Defaults to `10.0.0.0/16`.
- **RegionMap**: Currently only `us-east-1` AZs are defined in `vpc.yaml` and `minimal-stack.yaml`.

## Interfaces & Contracts
- **CloudFormation Exports**: VPC and EKS stacks export key identifiers (e.g., `VpcId`, `PrivateSubnetIds`, `ClusterName`) which are then imported by subsequent stacks (e.g., EKS uses VPC outputs).
- **S3 Bucket Policy**: The `s3-bucket.yaml` defines a bucket policy allowing public read access to `products/*` and read/write access for EKS pods.
- **Kubernetes**: The deployed EKS cluster expects standard Kubernetes deployments, services, and ingresses.
- **ECR**: Docker images are pushed to ECR repositories, which are then used by Kubernetes deployments.

## Data & State
- **S3**: `ecommerce-product-images-${AWS::AccountId}` bucket stores product images.
- **EBS Volumes**: Used by self-managed databases deployed within EKS for persistent storage.
- **CloudFormation Stacks**: AWS maintains the state of deployed resources within CloudFormation stacks.

## Dependencies
- **AWS CLI v2+**: For interacting with AWS services.
- **kubectl**: For interacting with the Kubernetes cluster.
- **helm v3+**: For deploying applications and databases to Kubernetes.
- **docker**: For building and pushing Docker images.
- **jq**: For parsing JSON output from AWS CLI.

## Patterns
- **Modular CloudFormation**: Infrastructure is broken down into modular, reusable CloudFormation templates (VPC, EKS, S3, ALB).
- **Single-AZ NAT Gateway**: For development cost savings, a single NAT Gateway is provisioned.
- **Infrastructure as Code**: All infrastructure is defined and managed through code.
- **Automated Deployment**: End-to-end scripts automate the entire deployment lifecycle.

## Gotchas
- **ALB Deployment**: The `alb-ingress.yaml` exists but ALB deployment is commented out in `deploy-aws.sh`; Ocelot currently uses K8s LoadBalancer (NLB). Verify `deploy-aws.sh` before assuming ALB is active.
- **RegionMap**: `vpc.yaml` and `minimal-stack.yaml` only define `us-east-1` AZs. Extend `RegionMap` before deploying to other regions.
- **EKS CloudFormation Update**: `deploy-aws.sh` skips EKS CloudFormation update if the stack is healthy, meaning template edits might not apply on re-run.
- **S3 Public Access**: Do not tighten S3 public-access blocks without updating Catalog image URL expectations.
- **Terraform vs CloudFormation**: Avoid duplicating networking/EKS modules here when changing `terraform/` — pick one IaC path or document the split explicitly.
- **Overlapping Stack Names**: Do not deploy `minimal-stack.yaml` and modular stacks with the same `EnvName` without cleanup.

## Owners
The `Infrastructure/aws` directory is owned by the DevOps or Infrastructure team.

## Files inspected:
- `Infrastructure/aws/cloudformation/s3-bucket.yaml`
- `Infrastructure/aws/cloudformation/vpc.yaml`
- `Infrastructure/aws/cloudformation/eks-cluster.yaml`
- `Infrastructure/aws/cloudformation/README.md`
- `Infrastructure/aws/cloudformation/alb-ingress.yaml`
- `Infrastructure/aws/cloudformation/minimal-stack.yaml`
- `Infrastructure/aws/cloudformation/AWS-DEPLOYMENT.md`
- `Infrastructure/aws/AGENT.md` (this file)
