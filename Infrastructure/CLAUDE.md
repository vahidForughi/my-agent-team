# infrastructure — shared .NET building blocks

## What & why

Cross-cutting libraries and infra-as-code shared by all microservices — the "building blocks" that keep
services consistent: in-house CQRS mediation, shared integration-event contracts, centralized logging,
and AWS/EKS CloudFormation templates. They exist so every service mediates, messages, and logs the same
way instead of each reinventing it.

## Where it lives

`Infrastructure/`:
- `Common.Mediator/` — in-house CQRS mediator (MediatR replacement): `Abstractions.cs` (interfaces),
  `Mediator.cs` (reflection-based dispatcher + pipeline composition), `ServiceCollectionExtensions.cs`
  (`AddMediator`).
- `EventBus.Messages/` — shared integration-event contracts: `Events/BasketCheckoutEvent.cs`,
  `Events/BasketCheckoutEventV2.cs`, `Events/ProductActivityEvent.cs`, `Events/OrderActivityEvent.cs`,
  `Common/BaseIntegrationEvent.cs`, and `Common/EventBusConstant.cs` (queue names).
- `Common.Logging/` — centralized Serilog config (`Logging.cs`, `Logging.ConfigureLogger`): Console +
  optional Elasticsearch sink.
- `aws/cloudformation/` — CloudFormation IaC: `eks-cluster.yaml`, `vpc.yaml`, `s3-bucket.yaml`,
  `alb-ingress.yaml`, `minimal-stack.yaml`, plus `README.md` / `AWS-DEPLOYMENT.md` (not .NET code).

## Tech stack

- .NET 10 class libraries (`net10.0`); SDK `10.0.300` (`global.json`). All versions from
  `Directory.Packages.props`.
- `Common.Mediator` depends only on `Microsoft.Extensions.DependencyInjection.Abstractions` — no MediatR.
- `Common.Logging` depends on Serilog.AspNetCore 8.0.3, Serilog.Enrichers.Environment 3.0.1,
  Serilog.Exceptions 8.4.0, Serilog.Sinks.Console 6.1.1, Serilog.Sinks.Elasticsearch 9.0.3.
- `EventBus.Messages` has no package references (pure POCO contracts).

## Build / run / test

```bash
dotnet build Infrastructure/Common.Mediator/Common.Mediator.csproj
dotnet build Infrastructure/EventBus.Messages/EventBus.Messages.csproj
dotnet build Infrastructure/Common.Logging/Common.Logging.csproj
dotnet build Ecommerce.sln          # builds everything (libs + services)

# CloudFormation (example — see Infrastructure/aws/cloudformation/AWS-DEPLOYMENT.md)
aws cloudformation deploy --template-file Infrastructure/aws/cloudformation/eks-cluster.yaml --stack-name <name>
```

These are libraries (no ports/host of their own); they are referenced by the services and run inside
those processes.

## Configuration

- `Common.Logging` reads `ElasticConfiguration:Uri` (`Logging.cs`) — when set, adds an Elasticsearch
  sink (template auto-register `ESv8`, index `ecommerce-Logs-{yyyy.MM.dd}`, min level Debug); otherwise
  Console only. In Development it overrides `Catalog`/`Basket`/`Discount`/`Ordering` to Debug. Injected
  per service as `ElasticConfiguration__Uri=${ELASTICSEARCH_URL}` (`docker-compose.override.yml`).
- `Common.Mediator` / `EventBus.Messages` have no runtime config of their own — queue names are
  compile-time constants in `EventBusConstant.cs`.
- CloudFormation parameters live in the templates under `aws/cloudformation/`.

## Interfaces & contracts

- `Common.Mediator` public surface (`Abstractions.cs`): `IRequest<T>`, `IRequest`,
  `IRequestHandler<TRequest,TResponse>` (`Task<T> Handle(req, ct)`), `IPipelineBehavior<TRequest,TResponse>`,
  `IMediator` (`Task<T> Send<T>(IRequest<T>, ct)`), `Unit`; registration via
  `services.AddMediator(params Assembly[])`.
- `EventBus.Messages` event contracts (all extend `BaseIntegrationEvent` with `CorrelationId` +
  `CreationDate`): `BasketCheckoutEvent` (full payment/address payload), `BasketCheckoutEventV2`
  (`UserName`, `TotalPrice`), `ProductActivityEvent` (+`ProductActivityType`), `OrderActivityEvent`
  (+`OrderActivityType`).
- Queue names (`EventBusConstant.cs`): `basketcheckout-queue`, `basketcheckout-queue-v2`,
  `product-activity-queue`, `order-activity-queue`.

## Data & state

No datastores. `EventBus.Messages` defines the *shapes* of messages carried on RabbitMQ (MassTransit);
the brokers/databases themselves are owned by the individual services.

## Dependencies

- Consumed by **all four services** (project references in each `*.API`/`*.Application` csproj):
  `Common.Mediator`, `EventBus.Messages`, `Common.Logging`.
- `Common.Logging` depends on Serilog (+ optional Elasticsearch); `Common.Mediator` on
  Microsoft DI abstractions. These libs do not call services back (no inbound/outbound runtime calls).
- See the services that use them: [`Services/CLAUDE.md`](../Services/CLAUDE.md).

## Patterns

- New CQRS handlers implement `IRequestHandler<TRequest,TResponse>` from `Common.Mediator` and must live
  in an assembly passed to `AddMediator(...)` — discovery is reflection at startup (`ServiceCollectionExtensions.cs`).
- Pipeline behaviours run outer-most-first; `Mediator.cs` caches a per-request-type invoker and composes
  registered `IPipelineBehavior<,>` around the handler.
- Add a cross-service event by adding a class under `EventBus.Messages/Events/` (extend
  `BaseIntegrationEvent`) + a queue-name constant in `EventBusConstant.cs`, then wire MassTransit publish
  + `ReceiveEndpoint`/consumer in the relevant services.
- Route all logging changes through `Common.Logging/Logging.cs` so every service stays consistent.

## Gotchas

- `Common.Mediator` implements only the MediatR subset this repo uses — **no notifications/streams**;
  don't write code assuming them.
- Event contracts are a **shared compile-time dependency** — changing a field breaks producers and
  consumers together. Prefer adding a new `*EventV2` over editing v1.
- The Elasticsearch sink is optional and silently off when `ElasticConfiguration:Uri` is unset — don't
  assume logs reach ES locally.
- `aws/cloudformation/` is infrastructure-as-code, not a .NET project; it isn't built by
  `Ecommerce.sln`.

## Owners / agents

`backend-architect` (mediator + event contracts), `devops-automator` (CloudFormation/EKS templates).
Roles from `.claude/agents/`.
