#!/usr/bin/env bash
set -euo pipefail

# Disable AWS CLI pager to prevent script hanging
export AWS_PAGER=""

# 🚀 Complete End-to-End AWS EKS Deployment Script
# This script deploys the entire e-commerce platform to AWS EKS with self-managed databases
# Mirrors the local deploy.sh functionality but for AWS
# Usage: ./deploy-aws.sh [env] [region]
# Example: ./deploy-aws.sh dev ap-southeast-1

# ==================== Configuration ====================
ENV_NAME="${1:-dev}"
REGION="${2:-${AWS_DEFAULT_REGION:-ap-southeast-1}}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Stack names
STACK_VPC="${ENV_NAME}-vpc"
STACK_EKS="${ENV_NAME}-eks"
STACK_ALB="${ENV_NAME}-alb"
CLUSTER_NAME="${ENV_NAME}-eks"
K8S_VERSION="1.30"
NODE_DISK_SIZE="80"
NAMESPACE="${ENV_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==================== Helper Functions ====================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

require_bin() {
    command -v "$1" >/dev/null 2>&1 || {
        log_error "Missing required tool: $1"
        echo "Please install: $1"
        exit 1
    }
}

aws_cmd() {
    if [[ -n "${AWS_PROFILE:-}" ]]; then
        aws --profile "$AWS_PROFILE" --no-paginate "$@"
    else
        aws --no-paginate "$@"
    fi
}

# Function to push Docker image with retry logic
push_docker_image() {
    local image="$1"
    local max_attempts=3
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        log_info "Pushing ${image} (attempt ${attempt}/${max_attempts})..."
        if docker push "$image"; then
            return 0
        fi

        log_warning "Push failed, retrying in 10 seconds..."
        sleep 10
        attempt=$((attempt + 1))
    done

    log_error "Failed to push ${image} after ${max_attempts} attempts"
    return 1
}

# ==================== Prerequisites ====================
check_prerequisites() {
    log_info "Checking prerequisites..."

    require_bin aws
    require_bin kubectl
    require_bin helm
    require_bin docker
    require_bin jq

    # Verify AWS credentials
    if ! aws_cmd sts get-caller-identity >/dev/null 2>&1; then
        log_error "AWS credentials not configured. Please run 'aws configure' or set AWS_PROFILE"
        exit 1
    fi

    log_success "All prerequisites satisfied"
    log_info "AWS Account: ${AWS_ACCOUNT_ID}"
    log_info "Region: ${REGION}"
    log_info "Environment: ${ENV_NAME}"
}

# ==================== ECR Setup ====================
setup_ecr_repositories() {
    log_info "[1/10] Setting up ECR repositories..."

    # List of services that need ECR repos
    SERVICES=(
        "catalogapi"
        "basketapi"
        "discountapi"
        "orderingapi"
        "ocelotapigateway"
    )

    for service in "${SERVICES[@]}"; do
        log_info "Creating ECR repository: ${service}"
        aws_cmd ecr describe-repositories \
            --region "$REGION" \
            --repository-names "$service" >/dev/null 2>&1 || \
        aws_cmd ecr create-repository \
            --region "$REGION" \
            --repository-name "$service" \
            --image-scanning-configuration scanOnPush=true \
            --tags Key=Environment,Value="$ENV_NAME" Key=Project,Value=ecommerce >/dev/null
    done

    log_success "ECR repositories ready"
}

# ==================== Build and Push Images ====================
build_and_push_images() {
    log_info "[2/10] Building and pushing Docker images to ECR..."

    # Login to ECR
    log_info "Logging into ECR..."
    aws_cmd ecr get-login-password --region "$REGION" | \
        docker login --username AWS --password-stdin "$ECR_REGISTRY"

    # Build and push each service
    log_info "Building Catalog API..."
    docker build --platform linux/amd64 -t catalogapi:latest -f Services/Catalog/Catalog.API/Dockerfile .
    docker tag catalogapi:latest "${ECR_REGISTRY}/catalogapi:latest"
    docker tag catalogapi:latest "${ECR_REGISTRY}/catalogapi:${ENV_NAME}"
    push_docker_image "${ECR_REGISTRY}/catalogapi:latest"
    push_docker_image "${ECR_REGISTRY}/catalogapi:${ENV_NAME}"

    log_info "Building Basket API..."
    docker build --platform linux/amd64 -t basketapi:latest -f Services/Basket/Basket.API/Dockerfile .
    docker tag basketapi:latest "${ECR_REGISTRY}/basketapi:latest"
    docker tag basketapi:latest "${ECR_REGISTRY}/basketapi:${ENV_NAME}"
    push_docker_image "${ECR_REGISTRY}/basketapi:latest"
    push_docker_image "${ECR_REGISTRY}/basketapi:${ENV_NAME}"

    log_info "Building Discount API..."
    docker build --platform linux/amd64 -t discountapi:latest -f Services/Discount/Discount.API/Dockerfile .
    docker tag discountapi:latest "${ECR_REGISTRY}/discountapi:latest"
    docker tag discountapi:latest "${ECR_REGISTRY}/discountapi:${ENV_NAME}"
    push_docker_image "${ECR_REGISTRY}/discountapi:latest"
    push_docker_image "${ECR_REGISTRY}/discountapi:${ENV_NAME}"

    log_info "Building Ordering API..."
    docker build --platform linux/amd64 -t orderingapi:latest -f Services/Ordering/Ordering.API/Dockerfile .
    docker tag orderingapi:latest "${ECR_REGISTRY}/orderingapi:latest"
    docker tag orderingapi:latest "${ECR_REGISTRY}/orderingapi:${ENV_NAME}"
    push_docker_image "${ECR_REGISTRY}/orderingapi:latest"
    push_docker_image "${ECR_REGISTRY}/orderingapi:${ENV_NAME}"

    log_info "Building API Gateway..."
    docker build --platform linux/amd64 -t ocelotapigateway:latest -f ApiGateways/Ocelot.ApiGateway/Dockerfile .
    docker tag ocelotapigateway:latest "${ECR_REGISTRY}/ocelotapigateway:latest"
    docker tag ocelotapigateway:latest "${ECR_REGISTRY}/ocelotapigateway:${ENV_NAME}"
    push_docker_image "${ECR_REGISTRY}/ocelotapigateway:latest"
    push_docker_image "${ECR_REGISTRY}/ocelotapigateway:${ENV_NAME}"

    log_success "All images built and pushed to ECR"
}

# ==================== VPC Deployment ====================
deploy_vpc() {
    log_info "[3/10] Deploying VPC stack: $STACK_VPC"

    aws_cmd cloudformation deploy \
        --region "$REGION" \
        --stack-name "$STACK_VPC" \
        --template-file Infrastructure/aws/cloudformation/vpc.yaml \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameter-overrides EnvName="$ENV_NAME"

    # Retrieve VPC outputs
    log_info "Retrieving VPC outputs..."
    VPC_ID=$(aws_cmd cloudformation describe-stacks \
        --region "$REGION" \
        --stack-name "$STACK_VPC" \
        --query "Stacks[0].Outputs[?ExportName=='${ENV_NAME}-vpc-id'].OutputValue" \
        --output text)
    PUB_SUBNETS=$(aws_cmd cloudformation describe-stacks \
        --region "$REGION" \
        --stack-name "$STACK_VPC" \
        --query "Stacks[0].Outputs[?ExportName=='${ENV_NAME}-public-subnet-ids'].OutputValue" \
        --output text)
    PRIV_SUBNETS=$(aws_cmd cloudformation describe-stacks \
        --region "$REGION" \
        --stack-name "$STACK_VPC" \
        --query "Stacks[0].Outputs[?ExportName=='${ENV_NAME}-private-subnet-ids'].OutputValue" \
        --output text)

    log_success "VPC deployed: ${VPC_ID}"
}

# ==================== EKS Deployment ====================
deploy_eks() {
    log_info "[4/10] Deploying EKS stack: $STACK_EKS"

    aws_cmd cloudformation deploy \
        --region "$REGION" \
        --stack-name "$STACK_EKS" \
        --template-file Infrastructure/aws/cloudformation/eks-cluster.yaml \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameter-overrides \
            EnvName="$ENV_NAME" \
            ClusterName="$CLUSTER_NAME" \
            KubernetesVersion="$K8S_VERSION" \
            PrivateSubnetIds="$PRIV_SUBNETS" \
            NodeDiskSize="$NODE_DISK_SIZE"

    log_info "Updating kubeconfig..."
    aws_cmd eks update-kubeconfig --region "$REGION" --name "$CLUSTER_NAME"

    # Verify cluster access
    kubectl cluster-info

    log_success "EKS cluster deployed and configured"
}

# ==================== Setup HTTPS Certificate ====================
setup_https_certificate() {
    log_info "[5a/10] Setting up HTTPS certificate..."

    # Check if certificate already exists
    EXISTING_CERT=$(aws_cmd acm list-certificates \
        --region "$REGION" \
        --query "CertificateSummaryList[?contains(DomainName, 'ecommerce')].CertificateArn" \
        --output text 2>/dev/null | head -1)

    if [ -n "$EXISTING_CERT" ]; then
        log_success "Found existing certificate: $EXISTING_CERT"
        echo "$EXISTING_CERT"
        return 0
    fi

    log_info "No certificate found, creating self-signed certificate for development..."

    # Create temporary files
    TEMP_DIR=$(mktemp -d)
    KEY_FILE="$TEMP_DIR/api-key.key"
    CERT_FILE="$TEMP_DIR/api-cert.crt"

    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/CN=api.ecommerce.local/O=eCommerce/C=SG" 2>/dev/null

    # Import to ACM
    log_info "Importing certificate into AWS ACM..."
    NEW_CERT=$(aws_cmd acm import-certificate \
        --certificate "fileb://$CERT_FILE" \
        --certificate-chain "fileb://$CERT_FILE" \
        --private-key "fileb://$KEY_FILE" \
        --region "$REGION" \
        --tags Key=Name,Value=ecommerce-api Key=Environment,Value=$ENV_NAME Key=AutoCreated,Value=true \
        --query 'CertificateArn' \
        --output text)

    log_success "Certificate created: $NEW_CERT"

    # Cleanup
    rm -rf "$TEMP_DIR"

    echo "$NEW_CERT"
}

# ==================== Setup IRSA for EBS CSI Driver ====================
setup_irsa_for_ebs_csi() {
    log_info "[5/10] Setting up IRSA for EBS CSI Driver..."

    # Get OIDC provider URL
    OIDC_ID=$(aws_cmd eks describe-cluster --region "$REGION" --name "$CLUSTER_NAME" \
        --query "cluster.identity.oidc.issuer" --output text | cut -d'/' -f5)
    OIDC_PROVIDER="${OIDC_ID}.oidc.eks.${REGION}.amazonaws.com"

    log_info "OIDC Provider: $OIDC_PROVIDER"

    # Create IAM role with OIDC trust relationship
    log_info "Creating IAM role for EBS CSI Driver..."
    ROLE_NAME="${ENV_NAME}-ebs-csi-driver-role"
    TRUST_POLICY="{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
            {
                \"Effect\": \"Allow\",
                \"Principal\": {
                    \"Federated\": \"arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER}\"
                },
                \"Action\": \"sts:AssumeRoleWithWebIdentity\",
                \"Condition\": {
                    \"StringEquals\": {
                        \"${OIDC_PROVIDER}:sub\": \"system:serviceaccount:kube-system:ebs-csi-controller-sa\",
                        \"${OIDC_PROVIDER}:aud\": \"sts.amazonaws.com\"
                    }
                }
            }
        ]
    }"

    # Create or update role
    aws_cmd iam create-role --role-name "$ROLE_NAME" \
        --assume-role-policy-document "$TRUST_POLICY" --region "$REGION" 2>/dev/null || \
        log_info "Role already exists: $ROLE_NAME"

    # Attach AWS managed policy for EBS CSI Driver
    log_info "Attaching AmazonEBSCSIDriverPolicy to role..."
    aws_cmd iam attach-role-policy --role-name "$ROLE_NAME" \
        --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy" --region "$REGION" 2>/dev/null || \
        log_info "Policy already attached to role"

    # Annotate the service account
    log_info "Annotating EBS CSI service account..."
    kubectl annotate serviceaccount ebs-csi-controller-sa -n kube-system \
        eks.amazonaws.com/role-arn="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${ROLE_NAME}" \
        --overwrite

    # Restart the deployment to pick up the new role
    log_info "Restarting EBS CSI controller deployment..."
    kubectl rollout restart deployment ebs-csi-controller -n kube-system

    log_success "IRSA configured for EBS CSI Driver"
}

# ==================== EBS CSI Driver ====================
install_ebs_csi_driver() {
    log_info "[5.5/10] Installing EBS CSI driver..."

    # Install EBS CSI driver as an EKS addon (recommended for EKS)
    log_info "Creating EBS CSI driver addon for EKS cluster..."

    # Create the addon (this will automatically install the driver)
    aws_cmd eks create-addon \
        --cluster-name "$CLUSTER_NAME" \
        --addon-name aws-ebs-csi-driver \
        --region "$REGION" \
        --resolve-conflicts OVERWRITE 2>/dev/null || log_info "Addon already exists, updating..."

    # Wait for addon to be active or degraded (degraded is acceptable for basic usage)
    log_info "Waiting for EBS CSI driver addon to stabilize..."
    for i in {1..30}; do
        ADDON_STATUS=$(aws_cmd eks describe-addon \
            --cluster-name "$CLUSTER_NAME" \
            --addon-name aws-ebs-csi-driver \
            --region "$REGION" \
            --query 'addon.status' \
            --output text 2>/dev/null || echo "CREATING")

        if [ "$ADDON_STATUS" = "ACTIVE" ] || [ "$ADDON_STATUS" = "DEGRADED" ]; then
            log_success "EBS CSI driver addon is ready (status: $ADDON_STATUS)"
            break
        elif [ "$ADDON_STATUS" = "CREATE_FAILED" ]; then
            log_error "EBS CSI driver addon failed: $ADDON_STATUS"
            return 1
        fi

        log_info "Addon status: $ADDON_STATUS (waiting...)"
        sleep 5
    done

    log_info "EBS CSI driver addon installation complete"
    log_warning "Skipping IRSA setup for EBS CSI - not required for this deployment"
}

# ==================== Deploy Databases ====================
deploy_databases() {
    log_info "[6/10] Deploying self-managed databases..."

    cd Deployments/helm

    # Phase 1: Core databases (required for app)
    CORE_DB_CHARTS=(catalogdb basketdb discountdb orderdb rabbitmq elasticsearch)

    log_info "Phase 1: Deploying core databases..."
    for chart in "${CORE_DB_CHARTS[@]}"; do
        if [[ -d "$chart" ]]; then
            log_info "Deploying ${chart}..."
            helm upgrade --install "eshopping-${chart}" "./${chart}" \
                --namespace "$NAMESPACE" \
                --create-namespace \
                --wait --timeout 600s || log_warning "${chart} deployment may need more time"
        else
            log_warning "Chart not found: ${chart}"
        fi
    done

    # Wait for core databases to be ready
    log_info "Waiting for core database pods to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-catalogdb \
        -n "$NAMESPACE" --timeout=600s || log_warning "CatalogDB may need more time"
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-basketdb \
        -n "$NAMESPACE" --timeout=600s || log_warning "BasketDB may need more time"
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-rabbitmq \
        -n "$NAMESPACE" --timeout=600s || log_warning "RabbitMQ may need more time"
    
    # Wait for Elasticsearch to be ready before deploying Kibana
    log_info "Waiting for Elasticsearch to be ready (needed for Kibana)..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-elasticsearch \
        -n "$NAMESPACE" --timeout=300s || log_warning "Elasticsearch may need more time"

    log_success "Core databases deployed"
    
    # Phase 2: Optional monitoring/admin tools (only if elasticsearch is ready)
    OPTIONAL_CHARTS=(kibana pgadmin portainer)
    
    log_info "Phase 2: Deploying optional monitoring/admin tools..."
    for chart in "${OPTIONAL_CHARTS[@]}"; do
        if [[ -d "$chart" ]]; then
            log_info "Deploying ${chart}..."
            helm upgrade --install "eshopping-${chart}" "./${chart}" \
                --namespace "$NAMESPACE" \
                --wait --timeout 300s || log_warning "${chart} deployment may need more time (optional service)"
        else
            log_warning "Chart not found: ${chart}"
        fi
    done

    cd ../..

    log_success "Databases and monitoring tools deployed"
}

# ==================== Setup IRSA for Catalog Service ====================
setup_irsa_for_catalog() {
    log_info "[6.5/10] Setting up IRSA (IAM Role for Service Account) for Catalog Service..."

    # Get OIDC provider URL
    OIDC_ID=$(aws_cmd eks describe-cluster --region "$REGION" --name "$CLUSTER_NAME" \
        --query "cluster.identity.oidc.issuer" --output text | cut -d'/' -f5)
    OIDC_PROVIDER="${OIDC_ID}.oidc.eks.${REGION}.amazonaws.com"

    log_info "OIDC Provider: $OIDC_PROVIDER"

    # Create IAM policy for S3 access
    log_info "Creating IAM policy for S3 access..."
    POLICY_NAME="${ENV_NAME}-catalog-s3-policy"
    POLICY_DOC='{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject",
                    "s3:ListBucket"
                ],
                "Resource": [
                    "arn:aws:s3:::ecommerce-product-images-471112812838",
                    "arn:aws:s3:::ecommerce-product-images-471112812838/*"
                ]
            }
        ]
    }'

    # Create or update policy
    aws_cmd iam create-policy --policy-name "$POLICY_NAME" \
        --policy-document "$POLICY_DOC" --region "$REGION" 2>/dev/null || \
        log_info "Policy already exists: $POLICY_NAME"

    POLICY_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}"

    # Create IAM role with OIDC trust relationship
    log_info "Creating IAM role with OIDC trust relationship..."
    ROLE_NAME="${ENV_NAME}-catalog-s3-role"
    TRUST_POLICY="{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
            {
                \"Effect\": \"Allow\",
                \"Principal\": {
                    \"Federated\": \"arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER}\"
                },
                \"Action\": \"sts:AssumeRoleWithWebIdentity\",
                \"Condition\": {
                    \"StringEquals\": {
                        \"${OIDC_PROVIDER}:sub\": \"system:serviceaccount:${NAMESPACE}:catalog\",
                        \"${OIDC_PROVIDER}:aud\": \"sts.amazonaws.com\"
                    }
                }
            }
        ]
    }"

    # Create or update role
    aws_cmd iam create-role --role-name "$ROLE_NAME" \
        --assume-role-policy-document "$TRUST_POLICY" --region "$REGION" 2>/dev/null || \
        log_info "Role already exists: $ROLE_NAME"

    # Attach policy to role
    log_info "Attaching S3 policy to role..."
    aws_cmd iam attach-role-policy --role-name "$ROLE_NAME" \
        --policy-arn "$POLICY_ARN" --region "$REGION" 2>/dev/null || \
        log_info "Policy already attached to role"

    # Update service account annotation
    log_info "Creating/updating service account with IRSA annotation..."
    kubectl create serviceaccount catalog -n "$NAMESPACE" --dry-run=client -o yaml | \
        kubectl annotate -f - --overwrite \
        eks.amazonaws.com/role-arn="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${ROLE_NAME}" | \
        kubectl apply -f -

    log_success "IRSA configured for Catalog Service"
}

# ==================== Deploy API Services ====================
deploy_api_services() {
    log_info "[7/10] Deploying API microservices..."

    cd Deployments/helm

    SERVICE_CHARTS=(catalog basket discount ordering ocelotapigw)

    for chart in "${SERVICE_CHARTS[@]}"; do
        if [[ -d "$chart" ]]; then
            log_info "Deploying ${chart}..."

            # Determine image name based on chart
            case "$chart" in
                ocelotapigw)
                    IMAGE_NAME="ocelotapigateway"
                    ;;
                discount)
                    IMAGE_NAME="discountapi"
                    ;;
                *)
                    IMAGE_NAME="${chart}api"
                    ;;
            esac

            # Special handling for catalog service to set service account
            if [[ "$chart" == "catalog" ]]; then
                log_info "Deploying catalog service with IRSA-enabled service account..."
                helm upgrade --install "eshopping-${chart}" "./${chart}" \
                    --namespace "$NAMESPACE" \
                    --set image.registry="$ECR_REGISTRY" \
                    --set image.repository="$IMAGE_NAME" \
                    --set image.tag="latest" \
                    --set imagePullSecrets=null \
                    --set service.type=ClusterIP \
                    --set serviceAccount.create=false \
                    --set serviceAccount.name=catalog \
                    --wait --timeout 600s
            else
                # Deploy other services normally
                helm upgrade --install "eshopping-${chart}" "./${chart}" \
                    --namespace "$NAMESPACE" \
                    --set image.registry="$ECR_REGISTRY" \
                    --set image.repository="$IMAGE_NAME" \
                    --set image.tag="latest" \
                    --set imagePullSecrets=null \
                    --set service.type=ClusterIP \
                    --wait --timeout 600s
            fi
        else
            log_warning "Chart not found: ${chart}"
        fi
    done

    cd ../..

    log_success "API services deployed"
}

# ==================== Trigger Data Migration ====================
trigger_migration() {
    log_info "[7.5/10] Triggering product image migration to S3..."

    # Get the catalog service endpoint
    log_info "Waiting for catalog service to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-catalog \
        -n "$NAMESPACE" --timeout=300s || log_warning "Catalog pod not ready, migration may fail"

    # Get service IP (use port-forward as alternative)
    log_info "Attempting to connect to catalog service for migration..."

    # Port-forward to catalog service in background
    kubectl port-forward -n "$NAMESPACE" svc/eshopping-catalog 8000:80 &
    PF_PID=$!
    sleep 3

    # Trigger migration via API Gateway
    log_info "Calling migration endpoint: POST /Admin/MigrateImagesToS3"
    MIGRATION_RESPONSE=$(curl -s -X POST http://localhost:8000/Admin/MigrateImagesToS3)

    # Clean up port-forward
    kill $PF_PID 2>/dev/null || true

    if echo "$MIGRATION_RESPONSE" | grep -q "TotalProducts"; then
        log_success "Migration triggered successfully"
        log_info "Migration response: $MIGRATION_RESPONSE"
    else
        log_warning "Migration endpoint may not have responded properly"
        log_info "Response: $MIGRATION_RESPONSE"
        log_info "Products may still have local image paths. Migration can be triggered manually with:"
        log_info "  kubectl port-forward -n $NAMESPACE svc/eshopping-catalog 8000:80"
        log_info "  curl -X POST http://localhost:8000/Admin/MigrateImagesToS3"
    fi
}

# ==================== Deploy Monitoring Stack ====================
deploy_monitoring() {
    log_info "[8/10] Deploying monitoring stack..."

    # Create monitoring namespace
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

    # Install Prometheus
    log_info "Installing Prometheus..."
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
    helm repo update

    helm upgrade --install prometheus prometheus-community/prometheus \
        --namespace monitoring \
        --set server.service.type=ClusterIP \
        --set alertmanager.enabled=false \
        --wait --timeout 600s

    # Install Istio
    log_info "Installing Istio..."

    # Find or download Istio
    ISTIO_DIR=$(find . -maxdepth 1 -name "istio-*" -type d | head -n 1)

    if [ -z "$ISTIO_DIR" ]; then
        log_info "Downloading Istio..."
        curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.0 sh -
        ISTIO_DIR=$(find . -maxdepth 1 -name "istio-*" -type d | head -n 1)
    fi

    # Install Istio
    ${ISTIO_DIR}/bin/istioctl install --set profile=default -y

    # Install Istio addons
    log_info "Installing Istio addons (Grafana, Jaeger, Kiali)..."
    kubectl apply -f ${ISTIO_DIR}/samples/addons/grafana.yaml || true
    kubectl apply -f ${ISTIO_DIR}/samples/addons/jaeger.yaml || true
    kubectl apply -f ${ISTIO_DIR}/samples/addons/kiali.yaml || true

    # Wait for monitoring pods
    log_info "Waiting for monitoring components..."
    kubectl wait --for=condition=ready pod -l app=grafana \
        -n istio-system --timeout=600s || log_warning "Grafana may need more time"

    log_success "Monitoring stack deployed"
}

# ==================== Deploy ALB ====================
deploy_alb() {
    log_info "[9/10] Deploying Application Load Balancer..."

    aws_cmd cloudformation deploy \
        --region "$REGION" \
        --stack-name "$STACK_ALB" \
        --template-file Infrastructure/aws/cloudformation/alb-ingress.yaml \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameter-overrides \
            EnvName="$ENV_NAME" \
            VpcId="$VPC_ID" \
            PublicSubnetIds="$PUB_SUBNETS" \
            TargetSubnetType=ip \
            TargetPort=80

    ALB_DNS=$(aws_cmd cloudformation describe-stacks \
        --region "$REGION" \
        --stack-name "$STACK_ALB" \
        --query "Stacks[0].Outputs[?ExportName=='${ENV_NAME}-alb-dns'].OutputValue" \
        --output text)

    log_success "ALB deployed: ${ALB_DNS}"
}

# ==================== Verification ====================
verify_deployment() {
    log_info "[10/10] Verifying deployment..."

    log_info "Checking pod status..."
    kubectl get pods -n "$NAMESPACE"
    kubectl get pods -n monitoring
    kubectl get pods -n istio-system

    log_info "Checking services..."
    kubectl get svc -n "$NAMESPACE"

    log_success "Deployment verification completed"
}

# ==================== Display Access Information ====================
display_access_info() {
    echo ""
    echo "🎉 =========================================================="
    echo "🎉  AWS EKS DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "🎉 =========================================================="
    echo ""
    echo "📋 CLUSTER INFORMATION:"
    echo "   Cluster Name: ${CLUSTER_NAME}"
    echo "   Region: ${REGION}"
    echo "   Environment: ${ENV_NAME}"
    echo ""
    echo "🔗 API GATEWAY:"
    echo "   ALB DNS: http://${ALB_DNS}"
    echo "   Note: Configure Kubernetes Ingress or Service to route to ALB"
    echo ""
    echo "📊 MONITORING STACK (use kubectl port-forward):"
    echo "   Prometheus:"
    echo "     kubectl port-forward -n monitoring svc/prometheus-server 9090:80"
    echo "     Then open: http://localhost:9090"
    echo ""
    echo "   Grafana:"
    echo "     kubectl port-forward -n istio-system svc/grafana 3000:3000"
    echo "     Then open: http://localhost:3000"
    echo ""
    echo "   Jaeger:"
    echo "     kubectl port-forward -n istio-system svc/tracing 16686:80"
    echo "     Then open: http://localhost:16686"
    echo ""
    echo "   Kiali:"
    echo "     kubectl port-forward -n istio-system svc/kiali 20001:20001"
    echo "     Then open: http://localhost:20001"
    echo ""
    echo "📈 LOGGING:"
    echo "   Kibana:"
    echo "     kubectl port-forward -n default svc/kibana 5601:5601"
    echo "     Then open: http://localhost:5601"
    echo ""
    echo "🐰 RABBITMQ:"
    echo "   kubectl port-forward -n default svc/rabbitmq 15672:15672"
    echo "   Then open: http://localhost:15672 (guest/guest)"
    echo ""
    echo "🔍 USEFUL COMMANDS:"
    echo "   Check all pods: kubectl get pods --all-namespaces"
    echo "   Check services: kubectl get svc --all-namespaces"
    echo "   View logs: kubectl logs <pod-name> -n <namespace>"
    echo "   Scale deployment: kubectl scale deployment/<name> --replicas=3"
    echo ""
    echo "🗑️  CLEANUP:"
    echo "   Run: ./cleanup-aws.sh ${ENV_NAME}"
    echo ""
    echo "🎊 Platform is ready for use! 🎊"
    echo ""
}

# ==================== Deployment Mode Selection ====================
select_deployment_mode() {
    log_info "Checking existing resources..."

    # Check what's already deployed
    ECR_EXISTS=$(aws_cmd ecr describe-repositories --region "$REGION" --repository-names catalogapi 2>/dev/null && echo "yes" || echo "no")
    VPC_EXISTS=$(aws_cmd cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_VPC" 2>/dev/null && echo "yes" || echo "no")
    EKS_EXISTS=$(aws_cmd cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_EKS" 2>/dev/null && echo "yes" || echo "no")

    echo ""
    echo "📊 Current State:"
    echo "   ECR Repositories: ${ECR_EXISTS}"
    echo "   VPC Stack: ${VPC_EXISTS}"
    echo "   EKS Cluster: ${EKS_EXISTS}"
    echo ""
    echo "🎯 Deployment Options:"
    echo "   1) Full deployment (all steps)"
    echo "   2) Skip image build (use existing images in ECR)"
    echo "   3) Skip images + infrastructure (start from EBS CSI driver)"
    echo "   4) Deploy only Kubernetes workloads (skip infrastructure)"
    echo "   5) Exit"
    echo ""
    read -p "Select deployment mode (1-5): " DEPLOY_MODE

    case $DEPLOY_MODE in
        1)
            log_info "Running full deployment..."
            SKIP_ECR=false
            SKIP_BUILD=false
            SKIP_INFRA=false
            ;;
        2)
            log_info "Skipping image build, using existing images..."
            SKIP_ECR=true
            SKIP_BUILD=true
            SKIP_INFRA=false
            ;;
        3)
            log_info "Skipping images and infrastructure, starting from EBS CSI driver..."
            SKIP_ECR=true
            SKIP_BUILD=true
            SKIP_INFRA=true
            ;;
        4)
            log_info "Deploying only Kubernetes workloads..."
            SKIP_ECR=true
            SKIP_BUILD=true
            SKIP_INFRA=true
            ;;
        5)
            log_info "Exiting..."
            exit 0
            ;;
        *)
            log_error "Invalid choice"
            exit 1
            ;;
    esac

    echo ""
}

# ==================== Cleanup Handler ====================
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Deployment failed. Check the logs above for details."
        echo ""
        echo "🛠️  TROUBLESHOOTING TIPS:"
        echo "   1. Check AWS CloudFormation console for stack errors"
        echo "   2. Check pod logs: kubectl logs <pod-name> -n default"
        echo "   3. Verify ECR access: aws ecr describe-repositories --region ${REGION}"
        echo "   4. Check EKS node status: kubectl get nodes"
        echo "   5. Review CloudWatch Logs for EKS cluster"
    fi
}

trap cleanup EXIT

# ==================== Main Execution ====================
main() {
    echo "🚀 Starting AWS EKS End-to-End Deployment..."
    echo ""

    check_prerequisites
    select_deployment_mode

    # Step 1-2: ECR and Images
    if [ "$SKIP_ECR" = false ]; then
        setup_ecr_repositories
    else
        log_info "[1/10] Skipping ECR setup (using existing)"
    fi

    if [ "$SKIP_BUILD" = false ]; then
        build_and_push_images
    else
        log_info "[2/10] Skipping image build (using existing images in ECR)"
    fi

    # Step 3-4: Infrastructure
    if [ "$SKIP_INFRA" = false ]; then
        deploy_vpc
        deploy_eks
    else
        log_info "[3/10] Skipping VPC deployment (using existing)"
        log_info "[4/10] Skipping EKS deployment (using existing)"

        # Still need to update kubeconfig
        log_info "Updating kubeconfig..."
        aws_cmd eks update-kubeconfig --region "$REGION" --name "$CLUSTER_NAME"

        # Get VPC outputs for ALB deployment later
        VPC_ID=$(aws_cmd cloudformation describe-stacks \
            --region "$REGION" \
            --stack-name "$STACK_VPC" \
            --query "Stacks[0].Outputs[?ExportName=='${ENV_NAME}-vpc-id'].OutputValue" \
            --output text)
        PUB_SUBNETS=$(aws_cmd cloudformation describe-stacks \
            --region "$REGION" \
            --stack-name "$STACK_VPC" \
            --query "Stacks[0].Outputs[?ExportName=='${ENV_NAME}-public-subnet-ids'].OutputValue" \
            --output text)
    fi

    # Step 5-10: Kubernetes workloads
    # Setup HTTPS certificate first
    CERT_ARN=$(setup_https_certificate | tr -d '\n')

    # Update Helm values with the certificate ARN
    log_info "Updating Helm values with certificate ARN..."
    if [ -n "$CERT_ARN" ]; then
        # Use Python for safer string replacement with special characters
        python3 << EOF
import sys
cert_arn = "$CERT_ARN"
with open("Deployments/helm/ocelotapigw/values.yaml", "r") as f:
    content = f.read()
content = content.replace(
    "service.beta.kubernetes.io/aws-load-balancer-ssl-cert: \"\"",
    f"service.beta.kubernetes.io/aws-load-balancer-ssl-cert: \"{cert_arn}\""
)
with open("Deployments/helm/ocelotapigw/values.yaml", "w") as f:
    f.write(content)
print("Certificate updated successfully")
EOF
    else
        log_warning "No certificate ARN returned, skipping Helm values update"
    fi

    install_ebs_csi_driver
    deploy_databases
    setup_irsa_for_catalog
    deploy_api_services
    trigger_migration
    deploy_monitoring
    deploy_alb
    verify_deployment
    display_access_info
}

# Run main function
main "$@"
