## 1. Top-level workspace docs

- [x] 1.1 Rewrite `workspace/README.md`: replace placeholder big-picture table with a real part map (Part | Repo path | Summary) covering all top-level parts, and document the nested sub-part convention
- [x] 1.2 Enrich `workspace/AGENT.md` with cross-cutting patterns: custom `Common.Mediator`, Riok.Mapperly source-gen, MassTransit/RabbitMQ contracts in `EventBus.Messages`, polyglot persistence, OpenTelemetry→Jaeger, env/ConfigMap-driven config, v1/v2 coexistence, `USE_LOCALSTACK` switch
- [x] 1.3 Confirm `workspace/_[name-part]/` template is left unchanged

## 2. Backend parts

- [x] 2.1 Create `_api-gateways/` (README + AGENT + suggest/.gitkeep) — Ocelot 23.4.3, `ocelot.{Env}.json` routing, rate-limit on `/Basket/Checkout*`, file-cache; port 8010
- [x] 2.2 Create `_infrastructure/` — Common.Mediator, EventBus.Messages, Common.Logging (Serilog→Elasticsearch)
- [x] 2.3 Create `_services/` parent (README + AGENT) — Clean Architecture (API/Application/Core/Infrastructure), custom mediator, MassTransit; link sub-parts
- [x] 2.4 Create `_services/_basket/` — Redis, gRPC client→Discount, MassTransit, v1/v2 checkout; port 8001
- [x] 2.5 Create `_services/_catalog/` — MongoDB, S3/LocalStack, MassTransit; port 8000
- [x] 2.6 Create `_services/_discount/` — PostgreSQL + Dapper, gRPC server; ports 8002 / 8080 gRPC
- [x] 2.7 Create `_services/_ordering/` — SQL Server + EF Core, MassTransit consumers, Polly; port 8003

## 3. Frontend parts

- [x] 3.1 Create `_client/` — legacy Angular 21 SPA, `npm start` / `npm run build:prod` (generate-env.cjs), MSAL auth, lint stubbed
- [x] 3.2 Create `_micro-frontends/` parent — NX + Module Federation host/store/checkout/account/admin (ports 4200–4204), `npm run setup` then `npm start`; link sub-parts
- [x] 3.3 Create `_micro-frontends/_app-injector/` — tsup pkg, React-version-agnostic mount/unmount
- [x] 3.4 Create `_micro-frontends/_auth-provider/` — tsup pkg, MSAL/Azure AD B2C, token broadcast
- [x] 3.5 Create `_micro-frontends/_shared-layout/` — tsup pkg, Navbar/Footer/Layout, standalone-vs-MFE navigation
- [x] 3.6 Create `_micro-frontends/_scripts/` — NX/package.json orchestration (build:packages, start, affected:*, graph)

## 4. Ops / deployment parts

- [x] 4.1 Create `_deployments/` parent — deploy strategy (Minikube/Docker/EKS); link sub-parts
- [x] 4.2 Create `_deployments/_helm/` — 18 charts, values/values-aws/local-values, HPA, Istio sidecar inject, `helm install eshopping-*`
- [x] 4.3 Create `_deployments/_istio/` — Istio 1.30.1 mesh: gateway, virtualservices, tracing, kiali; `kubectl apply -f Deployments/istio/*`
- [x] 4.4 Create `_deployments/_k8s/` — raw manifests (namespaces, configmaps, secrets, netpols, PDBs) + `deploy-k8s.sh`; ordered apply
- [x] 4.5 Create `_deployments/_monitoring/` — in-cluster Prometheus/Grafana under Deployments
- [x] 4.6 Create `_monitoring/` (root) — `monitoring/grafana` dashboards, configmap fix, k6 dashboard, root grafana backup snapshots
- [x] 4.7 Create `_terraform/` — AWS modules (networking, security, eks, ecr, databases, messaging, storage, observability); `terraform init/plan/apply`, region default ap-southeast-1, EKS 1.29
- [x] 4.8 Create `_scripts/` (root) — bash automation: deploy/ cleanup/ access/ debug/ monitoring/ + S3/localstack scripts
- [x] 4.9 Create `_diagrams/` — 32 `.eraserdiagram` files (Eraser.io), rendered in images/

## 5. Testing & tools parts

- [x] 5.1 Create `_tests/` parent — testing overview; link sub-parts
- [x] 5.2 Create `_tests/_k6/` — load/stress/spike/soak/workflow tests, `config.js`, `run-all-tests.sh`, PushGateway:9091 → Grafana dashboard
- [x] 5.3 Create `_tools/` — `tools/postman` collections (Gateway, Catalog, Basket, Ordering, Identity)

## 6. Verification

- [x] 6.1 Run `find .cursor/rules/workspace -type f` and confirm every part dir has `README.md`, `AGENT.md`, `suggest/.gitkeep`
- [x] 6.2 Spot-check cited paths exist (`ls ApiGateways/Ocelot.ApiGateway`, `ls Services/Basket`, `ls Deployments/helm`, `ls micro-frontends/packages`, `ls terraform/modules`, `ls tests/k6`)
- [x] 6.3 Spot-check cited commands (`grep build:packages micro-frontends/package.json`, `ls scripts/deploy`)
- [x] 6.4 Read `workspace/README.md` to confirm the part map is complete and the nested convention is documented
- [x] 6.5 Confirm the diff touches only `.cursor/rules/workspace/`
