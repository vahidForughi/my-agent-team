# Codebase Orientation Map

## 1-Line Summary
The `Infrastructure/Common.Logging` project provides a centralized logging configuration for .NET applications using Serilog, with support for console and Elasticsearch sinks.

## 5-Minute Explanation
- **Primary tasks in code**: Configures Serilog for structured logging across different environments, enriching logs with application and environment details, and directing logs to console and optionally to Elasticsearch.
- **Primary inputs**: HostBuilderContext and LoggerConfiguration, configuration values (specifically `ElasticConfiguration:Uri` from `appsettings.json` or environment variables).
- **Primary outputs**: Log events directed to console output or an Elasticsearch instance.
- **Key files**:
    - `Logging.cs`: Contains the `ConfigureLogger` static action that sets up Serilog.
    - `Common.Logging.csproj`: Defines project dependencies on Serilog packages.
- **Main code paths**:
    - `Program.cs` (in consuming projects) -> `Logging.ConfigureLogger` -> Serilog configuration -> Log output.

## Deep Dive
- **Type**: Library
- **Primary runtime(s)**: .NET
- **Entry points**:
    - `Logging.ConfigureLogger`: A static `Action<HostBuilderContext, LoggerConfiguration>` delegate that is typically invoked during host building in consuming .NET applications to set up logging.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `Logging.cs` | Serilog configuration logic | Contains the core logic for setting up logging. |
| `Common.Logging.csproj` | Project file | Defines project metadata and dependencies. |

## Key Boundaries
- **Cross-cutting concerns**: Logging is a cross-cutting concern, configured here and used throughout the application services.
- **Responsibilities by file/module**:
    - `Logging.cs`: Responsible for initializing and configuring Serilog, including sinks (console, Elasticsearch) and enrichers (application name, environment name, exception details). It also handles environment-specific log level overrides.
    - `Common.Logging.csproj`: Manages the NuGet package dependencies required for Serilog functionality.
- **Detailed code flows**:
    1. A .NET host (e.g., `IHostBuilder`) is built in a consuming application.
    2. During host configuration, `Logging.ConfigureLogger` is invoked.
    3. `Logging.ConfigureLogger` sets up Serilog:
        - Configures minimum log levels.
        - Adds enrichers for log context, application name, environment name, and exception details.
        - Overrides minimum log levels for specific Microsoft.AspNetCore components and custom application modules in development.
        - Writes logs to the console.
        - Conditionally writes logs to Elasticsearch if `ElasticConfiguration:Uri` is provided in the application's configuration.
- **How the pieces map together**: Consuming .NET projects reference `Common.Logging` and call `Logging.ConfigureLogger` during their host building process to integrate the standardized logging setup.
- **Files inspected**:
    - `Infrastructure/Common.Logging/Logging.cs`
    - `Infrastructure/Common.Logging/Common.Logging.csproj`
