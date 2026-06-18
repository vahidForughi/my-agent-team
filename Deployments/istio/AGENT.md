# Codebase Orientation Map

## 1-Line Summary
Istio service-mesh configuration providing ingress gateway, traffic routing, distributed tracing, and Kiali for the platform.

## 5-Minute Explanation
- **Primary tasks in code**: Configures the Istio service mesh, including ingress gateway, routing rules (VirtualServices), distributed tracing (Jaeger), and Kiali for visualization.
- **Primary inputs**: YAML manifests defining Istio Custom Resources (CRDs, Gateway, VirtualServices).
- **Primary outputs**: An operational Istio service mesh controlling traffic flow, providing mTLS, and enabling observability.
- **Key files**: `Deployments/istio/gateway.yaml`, `Deployments/istio/virtualservices.yaml`, `Deployments/istio/tracing-config.yaml`, `Deployments/istio/kiali-secret.yaml`.
- **Main code paths**: Applying Istio initialization manifests -> Defining ingress gateway -> Configuring service-specific routing -> Setting up tracing and monitoring.

## Deep Dive
- **Type**: Infrastructure (service mesh configuration)
- **Primary runtime(s)**: Kubernetes, Istio
- **Entry points**:
  - `Deployments/istio/istio-init.yaml`: Contains CRDs and initial mesh infrastructure (large generated manifest).
  - `Deployments/istio/istio-minikube.yaml`: Control plane installation for Minikube (large generated manifest).
  - `Deployments/istio/gateway.yaml`: Defines the `ecommerce-gateway` ingress gateway.
  - `Deployments/istio/virtualservices.yaml`: Defines per-service routing rules for HTTP and gRPC traffic.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `Deployments/istio/istio-init.yaml` | Istio CRDs and mesh infrastructure | Generated manifest, do not hand-edit |
| `Deployments/istio/istio-minikube.yaml` | Istio control plane for Minikube | Generated manifest, do not hand-edit |
| `Deployments/istio/gateway.yaml` | Ingress Gateway definition | Entry point for external traffic |
| `Deployments/istio/virtualservices.yaml` | Service routing rules | Maps paths to internal services, including gRPC |
| `Deployments/istio/monitoring-virtualservices.yaml` | Routing for monitoring UIs | Access to dashboards like Kiali |
| `Deployments/istio/tracing-config.yaml` | Jaeger tracing configuration | Sets up distributed tracing |
| `Deployments/istio/telemetry-tracing.yaml` | Telemetry configuration for tracing | Defines how traces are collected |
| `Deployments/istio/kiali-secret.yaml` | Kiali dashboard secret | Authentication for Kiali UI |

## Key Boundaries
- **Presentation**: N/A (infrastructure configuration, Kiali provides UI)
- **Application/Domain**: Routing rules in `virtualservices.yaml` directly influence how microservices are accessed and communicate.
- **Persistence/External I/O**: Stateless (config only); trace data is sent to an external Jaeger backend.
- **Cross-cutting concerns**: Traffic management, security (mTLS via sidecar injection), and observability (tracing).
- **Responsibilities by file/module**:
  - `gateway.yaml`: Defines the single entry point for all external traffic into the mesh.
  - `virtualservices.yaml`: Dictates how incoming requests are routed to specific backend services.
  - `tracing-config.yaml`, `telemetry-tracing.yaml`: Configures the collection and export of distributed traces.
  - `kiali-secret.yaml`: Secures access to the Kiali dashboard for mesh visualization.
- **Detailed code flows**:
  1. Istio CRDs and control plane are applied (`istio-init.yaml`, `istio-minikube.yaml`).
  2. Namespace is labeled `istio-injection=enabled` to enable sidecar injection.
  3. The `ecommerce-gateway` is deployed (`gateway.yaml`) to manage ingress traffic.
  4. `VirtualServices` (`virtualservices.yaml`) define routing rules, directing traffic from the gateway to internal services (e.g., `/api/v1/Catalog` to `catalog:80`).
  5. Sidecars injected into application pods enforce mTLS and collect telemetry.
- **How the pieces map together**: The Gateway acts as the entry point, and VirtualServices define the routing logic to direct traffic to the services deployed by Helm or raw K8s manifests. Sidecars provide mesh capabilities to applications.
- **Files inspected**:
  - `Deployments/CLAUDE.md`
  - `Deployments/istio/CLAUDE.md`
