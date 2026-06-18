# Common.Logging — do/don't

## Do

- Call `Logging.ConfigureLogger` in `Program.cs` as the sole way to configure Serilog for any service; do not configure Serilog inline per-service.
- Set `ElasticConfiguration__Uri` (double-underscore env-var form) to wire the Elasticsearch sink; leave it unset to get console-only logging.
- Use Serilog's structured logging APIs (`Log.Information("{Key} {Value}", ...)`) so log events reach Elasticsearch with searchable fields.
- Rely on the existing enrichers (`WithMachineName`, `WithEnvironmentName`, `WithExceptionDetails`) — they are already wired in `ConfigureLogger`.
- Keep `Common.Logging.csproj` version pins aligned with `Directory.Packages.props`; do not add local `<PackageReference Version="...">` overrides.

## Don't

- Do not add a second Serilog call (`Log.Logger = ...`) in a service's own `Program.cs`; it overrides the shared configuration without warning.
- Do not assume Elasticsearch receives logs locally — the sink is silently skipped when `ElasticConfiguration:Uri` is absent (no error is thrown).
- Do not add new Serilog sinks or enrichers directly to `Logging.cs` without verifying they are needed by every service; this library is shared across all services.
- Do not change the minimum level overrides for `Microsoft.AspNetCore` or `Microsoft.Hosting.Lifetime` without understanding the log volume impact at scale.
- Do not reference `Common.Logging` from infrastructure-only projects that have no ASP.NET host; `UseSerilog` requires a `HostBuilderContext`.

@AGENT.md
