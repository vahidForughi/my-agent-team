# Modernization Plan — 2026

A consolidated dependency audit and migration roadmap for the .NET stack. This document is the source of truth for the modernization PR series; each PR below maps to a tracked task.

## Why now

- **.NET 8 LTS** ends **2026-11-14** (~6 months away).
- **.NET 9 STS** ended **2026-05-12** — already EOL.
- **.NET 10 LTS** released 2025-11, supported until **2028-11**. This is the target.
- **AutoMapper 14+** and **MediatR 13+** moved to commercial licensing in 2024 (Jimmy Bogard). The last free versions (13.x / 12.x) are unmaintained.
- **AutoMapper 13.0.1** has a known HIGH-severity vulnerability (GHSA-rvv3-g6hj-g44x). The free version will not be patched.
- **MassTransit 7.x** has been EOL for years; Basket.API and Ordering.API are still on 7.3.1.

## Current state (post PR 3)

| Dimension | State |
| --- | --- |
| Target framework | net10.0 (LTS until 2028-11) |
| Central Package Management | ✅ enabled (`Directory.Packages.props`) |
| Transitive pinning | ✅ enabled |
| Build/restore | ✅ clean on .NET 10 SDK 10.0.300 |
| Known CVEs (post PR 4) | OpenTelemetry.* 1.15.0 (3 moderate), MongoDB.Driver 2.30.0 transitive Snappier 1.0.0 (HIGH), SharpCompress 0.30.1 (moderate) |

## Migration roadmap

Each row is a separate PR. Order matters: CPM (this PR) is the foundation; subsequent PRs become smaller diffs because version bumps happen in one file.

| # | PR | Status | Risk | Notes |
| --- | --- | --- | --- | --- |
| 1 | CPM + audit doc | ✅ this PR | Low | Mechanical |
| 2 | MassTransit 7.3.1 → 8.x | pending | Medium | Breaking API changes; Basket.API + Ordering.API only |
| 3 | .NET 8 → .NET 10 LTS | pending | Medium | TargetFramework + Microsoft.* package bumps; touches every project |
| 4 | AutoMapper → Mapperly | pending | Medium | Removes HIGH CVE + commercial-license risk; 4 service Applications |
| 5 | MediatR → in-process dispatcher | pending | Medium-high | Removes commercial-license risk; touches handler registration in every Application |
| 6 | Misc version drift | pending | Low | OpenTelemetry CVE fix, MongoDB 2→3, Newtonsoft removal, AWSSDK 3→4, dangling net5 reference |

## Detailed findings

### CRITICAL — commercial licensing

| Package | Current | Issue | Plan |
| --- | --- | --- | --- |
| AutoMapper | 13.0.1 (4 services) | v14+ commercial. 13.0.1 has high CVE. | PR 4: replace with [Riok.Mapperly](https://github.com/riok/mapperly) (source-gen, no reflection, MIT) |
| MediatR | 12.3.0 / 12.5.0 (4 services) | v13+ commercial. | PR 5: small custom dispatcher OR [martinothamar/Mediator](https://github.com/martinothamar/Mediator) (source-gen) |

### CRITICAL — EOL framework

| Item | Current | Issue | Plan |
| --- | --- | --- | --- |
| .NET target | net8.0 (all 19 projects) | LTS ends 2026-11 | PR 3: bump to net10.0 |
| Microsoft.AspNetCore.Http.Features | 5.0.17 (Catalog.Application) | Referencing .NET 5 EOL package. Likely unused — APIs ship in-box since 3.0. | PR 6: remove |

### HIGH — EOL major-version drift

| Package | Versions | Plan |
| --- | --- | --- |
| MassTransit | 7.3.1 (Basket.API, Ordering.API), 8.1.3 (Catalog.API) | PR 2: align all to 8.x. v7 is years-EOL. |
| MassTransit.AspNetCore | 7.3.1 (Basket.API, Ordering.API) | PR 2: remove — no v8 equivalent; integration is in core MassTransit package now. |
| MongoDB.Driver | 2.30.0 (Catalog.Core) | PR 6: 3.x line is current. |
| AWSSDK.* | 3.7.x (Catalog) | PR 6: 4.x is current. |
| Ocelot | 23.4.3 (ApiGateway) | PR 6: 24.x. Long-term, evaluate YARP. |

### MEDIUM — patch-level drift (resolved by PR 1)

These were resolved by central package management consolidating to the highest version observed:

- `Microsoft.EntityFrameworkCore.Tools` 8.0.7 → 8.0.25
- `Microsoft.Extensions.Logging.Abstractions` 8.0.0 → 8.0.3
- `Microsoft.Extensions.DependencyInjection` 8.0.0 → 8.0.1 (forced by transitive constraint from Serilog.AspNetCore)
- `Grpc.AspNetCore` 2.63.0 → 2.64.0
- `Asp.Versioning.Mvc` 8.1.0 → 8.1.1

### MEDIUM — observability stack drift

| Package | Versions | Plan |
| --- | --- | --- |
| OpenTelemetry.Exporter.OpenTelemetryProtocol | 1.9.0 / 1.15.0 | PR 6: bump to current. **1.15.0 has 3 moderate CVEs.** |
| OpenTelemetry.Extensions.Hosting | 1.9.0 / 1.14.0 | PR 6 |
| OpenTelemetry.Instrumentation.AspNetCore | 1.9.0 / 1.14.0 | PR 6 |

### LOW — opportunistic

| Item | Current | Plan |
| --- | --- | --- |
| Newtonsoft.Json | 13.0.3 (Basket.Infrastructure) | PR 6: replace with System.Text.Json — already present transitively |
| Swashbuckle.AspNetCore | 6.4.0 (all API projects) | PR 6: migrate to `Microsoft.AspNetCore.OpenApi` (in-box since .NET 9). Tied to PR 3. |
| IdentityServer4 | Referenced in README/post, no code uses it | Remove the claim; the repo uses JWT directly. |

## Not in scope

- **Frontend** (React Module Federation) — separate audit; React 18 is still LTS.
- **Infrastructure** (Terraform, Helm, Istio) — separate audit; just landed.
- **Tests** — there are none. That is a separate problem and a separate PR series.

## How to use this document

- Each PR title starts with the table number (e.g. `chore: PR 2 — MassTransit 7 → 8`).
- Each PR updates the corresponding row's Status here.
- If a PR's risk assessment proves wrong, update this doc in the same PR.
