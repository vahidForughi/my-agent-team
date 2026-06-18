# Codebase Orientation Map

## 1-Line Summary
Centralized Serilog configuration for .NET applications, providing console and optional Elasticsearch logging.

## 5-Minute Explanation
- **Primary tasks in code**: Configures Serilog for structured logging across services, including environment enrichment and exception details.
- **Primary inputs**: `HostBuilderContext` and `LoggerConfiguration` for setup, `ElasticConfiguration:Uri` from `IConfiguration` for Elasticsearch.
- **Primary outputs**: Log events sent to console and/or Elasticsearch.
- **Key files**: `Logging.cs` contains the main configuration logic, `Common.Logging.csproj` defines dependencies.
- **Main code paths**: `Logging.ConfigureLogger` is a static action used during application startup to set up logging.

## Deep Dive
- **Type**: Library
- **Primary runtime(s)**: .NET
- **Entry points**:
  - `Common.Logging.Logging.ConfigureLogger`: The main entry point for configuring Serilog.

## Top-Level Structure
| Path | Purpose | Notes |
|---|---|---|
| `Logging.cs` | Contains the static `ConfigureLogger` action. | Configures Serilog and its sinks. |
| `Common.Logging.csproj` | Project file, specifies target framework and dependencies. | Defines dependencies on Serilog packages. |

## Key Boundaries
- **Cross-cutting concerns**: Handles logging, a critical cross-cutting concern for all microservices to ensure consistent log output.
- **Responsibilities by file/module**:
  - `Logging.cs`: Centralizes Serilog setup, ensuring consistent logging configuration across the application.
- **Detailed code flows**:
  1. `Logging.ConfigureLogger` is invoked during the application host building process (e.g., in `Program.cs`).
  2. It initializes Serilog, setting minimum log levels and enriching logs with context like application and environment names.
  3. Exception details are added to logs using `Serilog.Exceptions`.
  4. Log levels for `Microsoft.AspNetCore` and `Microsoft.Hosting.Lifetime` are overridden to `Warning` to reduce noise.
  5. In development environments, specific application loggers (`Catalog`, `Basket`, `Discount`, `Ordering`) are set to `Debug` level.
  6. Console output is always configured as a default sink.
  7. If an `ElasticConfiguration:Uri` is present in the application's configuration, an Elasticsearch sink is added, enabling logs to be sent to an Elasticsearch instance with auto-registered templates and a daily index format.
- **How the pieces map together**: Application services include `Common.Logging` as a dependency and call `Logging.ConfigureLogger` during their startup to apply standardized logging configurations, which can then be extended or overridden via application settings.
- **Files inspected**:
  - `Infrastructure/Common.Logging/Logging.cs`
  - `Infrastructure/Common.Logging/Common.Logging.csproj`