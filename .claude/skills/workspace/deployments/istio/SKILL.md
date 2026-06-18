---
name: istio
description: Istio 1.30.1 service mesh configuration — ingress gateway, VirtualService routing, distributed tracing (Jaeger), mTLS, and Kiali for the platform.
paths:
  - Deployments/istio/**/*
metadata:
  part-dir: Deployments/istio
---

The `istio` sub-part holds the Istio service mesh configuration for the platform. It provides the single mesh entry point (`ecommerce-gateway`), per-service routing rules (VirtualServices), distributed tracing via Jaeger, and the Kiali dashboard. The Istio distribution is vendored at the repo root (`istio-1.30.1/bin/istioctl`).

## Key files to read first

- `Deployments/istio/gateway.yaml` — `ecommerce-gateway`: `networking.istio.io/v1alpha3` Gateway, selects `istio: ingressgateway`, port 80, `hosts: ["*"]`
- `Deployments/istio/virtualservices.yaml` — per-service routing rules bound to `ecommerce-gateway`
- `Deployments/istio/monitoring-virtualservices.yaml` — routing for monitoring UIs (Kiali, Grafana, etc.)
- `Deployments/istio/tracing-config.yaml` — Jaeger endpoint and trace sampling rate
- `Deployments/istio/telemetry-tracing.yaml` — Telemetry API config for trace collection
- `Deployments/istio/kiali-secret.yaml` — Kiali dashboard auth secret
- `Deployments/istio/istio-init.yaml` — CRDs and mesh infrastructure (generated; do not hand-edit)
- `Deployments/istio/istio-minikube.yaml` — Istio control plane for Minikube (generated; do not hand-edit)

## Routing table (from virtualservices.yaml)

| Path prefix | Backend service | Protocol |
|---|---|---|
| `/api/v1/Catalog` | `catalog:80` | HTTP |
| `/api/v1/Basket` | `basket:80` | HTTP |
| `/api/v1/Order` | `ordering:80` | HTTP |
| `/api/v1/Discount` | `eshopping-discount-discount-grpc:8080` | gRPC |

## Apply sequence

```bash
kubectl apply -f Deployments/istio/istio-init.yaml          # CRDs first
kubectl apply -f Deployments/istio/istio-minikube.yaml      # control plane
kubectl label namespace default istio-injection=enabled      # enable sidecar injection
kubectl apply -f Deployments/istio/gateway.yaml
kubectl apply -f Deployments/istio/virtualservices.yaml
./istio-1.30.1/bin/istioctl analyze                         # validate config
kubectl get gateway,virtualservice
```

## Critical constraints

- Apply order: `istio-init.yaml` → `istio-minikube.yaml` → namespace label → `gateway.yaml` → `virtualservices.yaml`.
- Sidecar injection requires the namespace label **and** a pod restart — existing pods get no sidecar until recreated.
- Discount uses gRPC (port 8080), not HTTP — route any new Discount paths as gRPC.
- `istio-init.yaml` and `istio-minikube.yaml` are large generated manifests — do not hand-edit; regenerate from the distribution when upgrading.
- mTLS issues surface as 503s between services — check mesh config before blaming application code.
- VirtualService `hosts` must match the Gateway `hosts`; Gateway `selector` must match the ingress-gateway pod labels.
- Run `istioctl analyze` before and after applying to catch config errors early.
