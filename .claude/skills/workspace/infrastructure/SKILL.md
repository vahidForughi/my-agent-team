---
name: infrastructure
description: Shared .NET building blocks (CQRS mediator, integration-event contracts, centralized logging) and AWS CloudFormation IaC consumed by all microservices in the e-commerce platform.
paths:
  - Infrastructure/**/*
metadata:
  part-dir: Infrastructure
---

## What this part is

`Infrastructure/` is the shared-library and infrastructure-as-code root. It contains four sub-parts that every microservice depends on:

| Sub-part | Dir | Purpose |
|---|---|---|
| Common.Mediator | `Infrastructure/Common.Mediator/` | In-house CQRS mediator (MediatR replacement) |
| Common.Logging | `Infrastructure/Common.Logging/` | Centralized Serilog configuration |
| EventBus.Messages | `Infrastructure/EventBus.Messages/` | Shared integration-event contracts and queue constants |
| aws | `Infrastructure/aws/` | AWS CloudFormation IaC templates and deployment scripts |

## Key files to read first

- `Infrastructure/Common.Mediator/Abstractions.cs` — public mediator interfaces (`IRequest`, `IRequestHandler`, `IMediator`, `IPipelineBehavior`)
- `Infrastructure/Common.Mediator/ServiceCollectionExtensions.cs` — `AddMediator(Assembly[])` DI registration entry point
- `Infrastructure/Common.Logging/Logging.cs` — `ConfigureLogger` static action for Serilog setup
- `Infrastructure/EventBus.Messages/Common/EventBusConstant.cs` — all RabbitMQ queue-name constants
- `Infrastructure/EventBus.Messages/Events/BaseIntegrationEvent.cs` — base for all cross-service events
- `Infrastructure/aws/cloudformation/eks-cluster.yaml` — EKS provisioning template

## Top patterns

- **CQRS dispatch**: services call `IMediator.Send(request, ct)` — `Mediator.cs` resolves the handler and composes `IPipelineBehavior` pipeline via reflection.
- **Logging**: services call `builder.Host.UseSerilog(Logging.ConfigureLogger)` — console sink always on; Elasticsearch sink added when `ElasticConfiguration:Uri` is set.
- **Event versioning**: breaking changes get a new class (e.g., `BasketCheckoutEventV2`) — never edit existing event fields.
- **IaC ordering**: `deploy-aws.sh` deploys VPC → EKS → databases → services → monitoring in sequence; stacks are linked via `Fn::ImportValue`.

## Gotchas

- `Common.Mediator` does **not** implement notifications or streaming — only request/response.
- Elasticsearch sink is **silently absent** when `ElasticConfiguration:Uri` is unset; no error is thrown.
- `aws/cloudformation/` is not a .NET project and is excluded from `Ecommerce.sln`.
- `vpc.yaml` and `minimal-stack.yaml` only define AZs for `us-east-1`; extend `RegionMap` before deploying elsewhere.
- ALB stack (`alb-ingress.yaml`) exists but is commented out in `deploy-aws.sh`; Ocelot uses a Kubernetes LoadBalancer.

## Child skill files

- Common.Logging: `.claude/skills/workspace/infrastructure/common-logging/SKILL.md`
- Common.Mediator: `.claude/skills/workspace/infrastructure/common-mediator/SKILL.md`
- EventBus.Messages: `.claude/skills/workspace/infrastructure/event-bus-messages/SKILL.md`
- aws: `.claude/skills/workspace/infrastructure/aws/SKILL.md`

## Full onboarding doc

`Infrastructure/AGENT.md`
