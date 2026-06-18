# Codebase Orientation Map

## 1-Line Summary
This codebase provides shared .NET building blocks and infrastructure-as-code (IaC) for microservices, ensuring consistency in CQRS mediation, event contracts, logging, and AWS deployments.

## 5-Minute Explanation
- **Primary tasks in code**: Provides in-house CQRS mediation, defines shared integration event contracts, centralizes Serilog-based logging, and includes AWS CloudFormation templates for EKS, VPC, and S3.
- **Primary inputs**: Services consume these libraries for mediation, messaging, and logging. CloudFormation templates take parameters for AWS resource provisioning.
- **Primary outputs**: Consistent application behavior across microservices, provisioned AWS infrastructure.
- **Key files**:
    - `Infrastructure/Common.Mediator/`: In-house CQRS mediator implementation.
    - `Infrastructure/EventBus.Messages/`: Shared integration event contracts and queue names.
    - `Infrastructure/Common.Logging/`: Centralized Serilog logging configuration.
    - `Infrastructure/aws/cloudformation/`: AWS CloudFormation templates (e.g., `eks-cluster.yaml`, `vpc.yaml`, `s3-bucket.yaml`).
- **Main code paths**: Services reference these libraries in their `csproj` files. Mediation occurs via `IMediator.Send()`. Events are published/consumed through contracts in `EventBus.Messages`. Logging is configured via `Logging.ConfigureLogger()`.

## Deep Dive
- **Type**: shared-lib / IaC
- **Primary runtime(s)**: .NET 10 class libraries (for mediator, logging, event messages); AWS CloudFormation (for IaC).
- **Entry points**:
  - `Infrastructure/Common.Mediator/ServiceCollectionExtensions.cs`: Registers the in-house mediator with DI.
  - `Infrastructure/Common.Logging/Logging.cs`: Configures Serilog logging.
  - `Infrastructure/EventBus.Messages/Events/`: Defines shared event contracts.
  - `Infrastructure/aws/cloudformation/*.yaml`: CloudFormation templates for AWS infrastructure deployment.

## Top-Level Structure
| Path | Purpose | Notes |
|---|---|---|
| `Infrastructure/Common.Mediator/` | CQRS Mediator | In-house MediatR replacement for request/response handling. |
| `Infrastructure/EventBus.Messages/` | Event Contracts | Defines integration events and queue constants for inter-service communication. |
| `Infrastructure/Common.Logging/` | Centralized Logging | Configures Serilog with console and optional Elasticsearch sinks. |
| `Infrastructure/aws/cloudformation/` | AWS IaC | CloudFormation templates for deploying AWS resources like EKS, VPC, S3, ALB. |

## Key Boundaries
- **Presentation**: N/A (libraries and IaC)
- **Application/Domain**: `Common.Mediator` defines abstractions for application-level request/response handling. `EventBus.Messages` defines domain event contracts.
- **Persistence/External I/O**: `Common.Logging` integrates with Elasticsearch (optional). `EventBus.Messages` defines shapes for RabbitMQ messages. `Infrastructure/aws/cloudformation/` interacts directly with AWS services.
- **Cross-cutting concerns**: Mediation, logging, inter-service communication events, and cloud infrastructure deployment are handled as cross-cutting concerns.
- **Responsibilities by file/module**:
    - `Common.Mediator/Abstractions.cs`: Defines core mediator interfaces (`IRequest`, `IRequestHandler`, `IMediator`).
    - `Common.Mediator/Mediator.cs`: Implements the reflection-based request dispatcher and pipeline composition.
    - `EventBus.Messages/Events/*.cs`: Specific integration event definitions.
    - `EventBus.Messages/Common/EventBusConstant.cs`: Defines RabbitMQ queue names.
    - `Common.Logging/Logging.cs`: Contains `ConfigureLogger` method for Serilog setup.
    - `aws/cloudformation/*.yaml`: Defines AWS resources and their configurations.
- **Detailed code flows**:
  1. A service calls `services.AddMediator()` (from `ServiceCollectionExtensions.cs`) at startup to register mediator handlers.
  2. An application component dispatches a request using `IMediator.Send<T>(request)`.
  3. `Mediator.cs` reflects to find the appropriate `IRequestHandler` and applies `IPipelineBehavior`s.
  4. For logging, `Logging.ConfigureLogger()` is called at service startup, setting up Serilog with console and potentially Elasticsearch.
  5. For events, services define and publish/consume messages based on contracts in `EventBus.Messages` using MassTransit.
  6. AWS infrastructure is deployed by applying `aws/cloudformation/*.yaml` templates via `aws cloudformation deploy`.
- **How the pieces map together**: These infrastructure components are consumed by the microservices as NuGet packages or via direct project references. They provide standardized ways for services to perform common tasks (mediating commands, logging, communicating events) and deploy their infrastructure.
- **Files inspected**:
    - `Infrastructure/CLAUDE.md`
    - `Infrastructure/Common.Logging/` (directory structure inferred)
    - `Infrastructure/Common.Mediator/` (directory structure inferred)
    - `Infrastructure/EventBus.Messages/` (directory structure inferred)
    - `Infrastructure/aws/` (directory structure inferred)