#!/bin/bash

# Script to add missing serviceaccount templates to all Helm charts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create serviceaccount template for a chart
create_serviceaccount_template() {
    local chart_name=$1
    local chart_path="Deployments/helm/$chart_name"
    local template_path="$chart_path/templates/serviceaccount.yaml"
    
    if [ ! -f "$template_path" ]; then
        print_status "Creating serviceaccount template for $chart_name"
        
        cat > "$template_path" << EOF
{{- if .Values.serviceAccount.create -}}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "$chart_name.serviceAccountName" . }}
  labels:
    {{- include "$chart_name.labels" . | nindent 4 }}
  {{- with .Values.serviceAccount.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
EOF
        print_status "Created serviceaccount template for $chart_name"
    else
        print_warning "Serviceaccount template already exists for $chart_name"
    fi
}

# List of all charts
charts=(
    "catalogdb"
    "discountdb" 
    "orderdb"
    "rabbitmq"
    "elasticsearch"
    "kibana"
    "catalog"
    "basket"
    "discount"
    "ordering"
    "ocelotapigw"
)

print_status "Adding serviceaccount templates to all Helm charts..."

for chart in "${charts[@]}"; do
    if [ -d "Deployments/helm/$chart" ]; then
        create_serviceaccount_template "$chart"
    else
        print_warning "Chart directory not found: $chart"
    fi
done

print_status "All serviceaccount templates have been created!"
print_status "You can now run the deployment script again."
