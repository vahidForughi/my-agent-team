# ApiGateways — Working Guide

## What this directory is

A parent container for the platform's API gateway layer. It currently holds one component: `Ocelot.ApiGateway`, which is the sole public HTTP entry point for the entire e-commerce platform. There is no shared code or config at the `ApiGateways/` level itself.

## Do

- Work inside `ApiGateways/Ocelot.ApiGateway/` for all gateway changes — routing, CORS, caching, rate limits, and deployment config all live there.
- Keep `ocelot.Development.json` and `ocelot.k8s.json` in sync: same `Routes[]` entries, only `DownstreamHostAndPorts` values differ per environment.
- Build the gateway container image from the **repo root** as Docker build context — `Directory.Packages.props` must be reachable.
- Switch environments via `ASPNETCORE_ENVIRONMENT`: `Development` loads `ocelot.Development.json`; `k8s` loads `ocelot.k8s.json`.
- Add new downstream services by adding route entries to both `ocelot.*.json` files with matching upstream and downstream path templates.

## Don't

- Do not add code or config files directly to `ApiGateways/` — all implementation belongs inside the child directory.
- Do not add routing logic in C# — all routes must be declared as JSON entries in `Routes[]`; the `Controllers\` folder in the csproj is intentionally empty.
- Do not add a second gateway to this directory without first updating the `ApiGateways/AGENT.md` parent map and creating the corresponding child `AGENT.md`, `CLAUDE.md`, and SKILL.md.
- Do not introduce service project-to-project references — the gateway has no compile-time dependency on any service; routing is pure config.

## Child component

| Component | Dir | Guide |
|---|---|---|
| Ocelot.ApiGateway | `ApiGateways/Ocelot.ApiGateway/` | [CLAUDE.md](Ocelot.ApiGateway/CLAUDE.md) |

@AGENT.md
