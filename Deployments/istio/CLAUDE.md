# istio — Service Mesh

## What & why

Istio 1.30.1 service-mesh configuration: the ingress gateway, traffic routing (VirtualServices),
distributed tracing (Jaeger), and Kiali. It provides the single mesh entry point, sidecar injection,
mTLS between services, and request-level observability for the platform.

## Where it lives

`Deployments/istio/`:
- `istio-init.yaml` — CRDs / mesh infrastructure (large generated manifest).
- `istio-minikube.yaml` — control plane install for Minikube (large generated manifest).
- `gateway.yaml` — the `ecommerce-gateway` ingress Gateway.
- `virtualservices.yaml` — per-service routing rules.
- `monitoring-virtualservices.yaml` — routing for monitoring UIs.
- `tracing-config.yaml`, `telemetry-tracing.yaml` — Jaeger tracing + sampling.
- `kiali-secret.yaml` — Kiali dashboard secret.

The full distribution is vendored at the repo root: `istio-1.30.1/bin/istioctl`.

## Tech stack

Istio `1.30.1` (`istioctl` at `istio-1.30.1/bin/istioctl`). Resources use API group
`networking.istio.io/v1alpha3` (`Deployments/istio/gateway.yaml`, `virtualservices.yaml`). Tracing
integrates with Jaeger; mesh visualisation via Kiali.

## Build / run / test

Prerequisite: a running cluster and the vendored `istioctl`.

```bash
kubectl apply -f Deployments/istio/istio-init.yaml
kubectl apply -f Deployments/istio/istio-minikube.yaml
kubectl label namespace default istio-injection=enabled
kubectl apply -f Deployments/istio/gateway.yaml
kubectl apply -f Deployments/istio/virtualservices.yaml
./istio-1.30.1/bin/istioctl analyze        # validate config before/after applying
kubectl get gateway,virtualservice
```

## Configuration

- `gateway.yaml` — `selector: istio: ingressgateway`, server port 80 (`http`), `hosts: ["*"]`.
- `virtualservices.yaml` — route definitions (see Interfaces).
- `tracing-config.yaml` — Jaeger wiring and trace sampling rate.
- `kiali-secret.yaml` — Kiali auth secret.
- Sidecar injection is enabled per-namespace with the `istio-injection=enabled` label.

## Interfaces & contracts

Defined in `Deployments/istio/`:
- **Gateway** `ecommerce-gateway` — selects `istio: ingressgateway`, listens on port 80, `hosts: ["*"]` (`gateway.yaml`).
- **VirtualServices** (`virtualservices.yaml`), all bound to `ecommerce-gateway` with `hosts: ["*"]`:
  - `/api/v1/Catalog` → `catalog:80`
  - `/api/v1/Basket` → `basket:80`
  - `/api/v1/Order` → `ordering:80`
  - `/api/v1/Discount` → `eshopping-discount-discount-grpc:8080` (**gRPC**)
- Monitoring UIs routed via `monitoring-virtualservices.yaml`.

## Data & state

Stateless: this part holds only mesh configuration (CRDs, Gateway, VirtualServices, telemetry). No
PVs/PVCs or databases. Trace data is exported to Jaeger (its own backend), not stored here.

## Dependencies

- Install order: `istio-init.yaml` (CRDs) → `istio-minikube.yaml` (control plane) → namespace label → `gateway.yaml` → `virtualservices.yaml`.
- VirtualService destinations must match deployed Service names/ports from [`helm/CLAUDE.md`](../helm/CLAUDE.md) / [`k8s/CLAUDE.md`](../k8s/CLAUDE.md) (e.g. `eshopping-discount-discount-grpc`).
- Tracing depends on a Jaeger backend; Kiali depends on `kiali-secret.yaml`.

## Patterns

- Gateway + VirtualService pair: the VirtualService `hosts` must match the Gateway `hosts`, and the Gateway `selector` must match the ingress-gateway pod labels.
- Discount routes over **gRPC (port 8080)** — route any new Discount path as gRPC, not HTTP.
- Run `istioctl analyze` before and after applying to catch config errors.

## Gotchas

- Sidecar injection needs the namespace label **and** a pod restart; existing pods get no sidecar until recreated.
- mTLS issues commonly surface as 503s between services — check mesh config before blaming app code.
- `istio-init.yaml` / `istio-minikube.yaml` are large generated manifests — don't hand-edit; regenerate from the distribution when upgrading.

## Owners / agents

devops-automator (primary — owns mesh config, gateway/routing, tracing setup).
