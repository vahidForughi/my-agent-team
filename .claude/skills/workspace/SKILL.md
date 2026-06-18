---
name: workspace
description: Top-level workspace skill for the cloud-native-ecommerce-platform. Auto-attaches to give agents an orientation of all parts, their directories, and links to sub-skills. Use when working across multiple parts or when unsure which part owns a file.
paths:
  - "**/*"
disable-model-invocation: false
metadata:
  part-dir: .
---

## Workspace — cloud-native-ecommerce-platform

Cloud-native e-commerce platform: .NET 10 microservices behind an Ocelot gateway, Nx + Module Federation micro-frontends, Terraform/Helm/Istio infra on AWS EKS.

## Part directory

| Part | Dir | Sub-skill |
|---|---|---|
| ApiGateways | `ApiGateways/` | [api-gateways](.claude/skills/workspace/api-gateways/SKILL.md) |
| Services | `Services/` | [services](.claude/skills/workspace/services/SKILL.md) |
| Infrastructure | `Infrastructure/` | [infrastructure](.claude/skills/workspace/infrastructure/SKILL.md) |
| MicroFrontends | `micro-frontends/` | [micro-frontends](.claude/skills/workspace/micro-frontends/SKILL.md) |
| Client | `client/` | [client](.claude/skills/workspace/client/SKILL.md) |
| Deployments | `Deployments/` | [deployments](.claude/skills/workspace/deployments/SKILL.md) |
| Terraform | `terraform/` | [terraform](.claude/skills/workspace/terraform/SKILL.md) |
| Monitoring | `monitoring/` | [monitoring](.claude/skills/workspace/monitoring/SKILL.md) |
| Tests | `tests/` | [tests](.claude/skills/workspace/tests/SKILL.md) |
| Scripts | `scripts/` | [scripts](.claude/skills/workspace/scripts/SKILL.md) |
| Tools | `tools/` | [tools](.claude/skills/workspace/tools/SKILL.md) |
| Diagrams | `diagrams/` | [diagrams](.claude/skills/workspace/diagrams/SKILL.md) |

## Cross-cutting quick facts

- All .NET services use `Common.Mediator` (CQRS), `Common.Logging` (Serilog), `EventBus.Messages` (RabbitMQ contracts)
- Service communication: sync via gRPC (Basket↔Discount), async via MassTransit/RabbitMQ (Basket→Ordering, Catalog→Ordering)
- Config pattern: `appsettings.json` locally, `__`-delimited env vars in cluster (ConfigMaps/Secrets)
- Micro-frontends: Nx monorepo, Webpack Module Federation, host shell + 4 remotes + 3 shared packages
- Infra: Terraform 8-module AWS stack → EKS cluster → Helm charts + Istio service mesh + Prometheus/Grafana

@.claude/rules/workspace/AGENT.md
