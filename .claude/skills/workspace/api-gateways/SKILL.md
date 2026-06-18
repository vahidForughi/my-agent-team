---
name: api-gateways
description: Parent skill for the ApiGateways layer — a single-component gateway directory containing the Ocelot.ApiGateway. Use when working on the platform's public HTTP entry point, cross-gateway concerns, or when adding a new gateway component.
paths:
  - ApiGateways/**/*
metadata:
  part-dir: ApiGateways
---

## What it is

The `ApiGateways` directory is the platform's gateway layer. It currently contains one component: `Ocelot.ApiGateway`, a .NET 10 Ocelot reverse proxy that is the sole public HTTP entry point for the e-commerce platform.

There is no shared code at the `ApiGateways/` level. All implementation lives in the child directory.

## Child components

| Component | Skill |
|---|---|
| Ocelot.ApiGateway | `.claude/skills/workspace/api-gateways/ocelot/SKILL.md` |

## Key pattern

All routing is config-only JSON (no C# routing code). Environment selection (`ASPNETCORE_ENVIRONMENT`) picks between `ocelot.Development.json` (Compose) and `ocelot.k8s.json` (Kubernetes).

## Full onboarding doc

See `ApiGateways/AGENT.md`. For the gateway implementation itself, see `ApiGateways/Ocelot.ApiGateway/AGENT.md`.
