---
name: client
description: Legacy Angular 21 SPA for product browsing, cart, checkout, and account flows — maintenance-only, being superseded by micro-frontends/.
paths:
  - client/**/*
metadata:
  part-dir: client
---

The `client/` directory is the original monolithic Angular single-page application for this cloud-native e-commerce platform. It is **legacy** — new UI work belongs in `micro-frontends/`. Treat it as maintenance-only and confirm with the owner before adding features.

## What it is

An Angular 21 browser SPA (TypeScript, RxJS, SCSS) covering:
- **Product browsing** — `src/app/store/`
- **Shopping cart** — `src/app/basket/`
- **Checkout** — `src/app/checkout/`
- **User accounts / auth** — `src/app/account/` (Azure AD B2C via MSAL)
- **Core infrastructure** — `src/app/core/` (navbar, footer, guards, interceptors, loading service)
- **Shared utilities** — `src/app/shared/` (models, order-summary, shared services)

## Key files

| File | Purpose |
|------|---------|
| `client/src/main.ts` | App bootstrap entry point |
| `client/src/app/app.module.ts` | Root Angular module, MSAL config |
| `client/src/app/app-routing.module.ts` | Top-level route definitions |
| `client/src/environments/environment.ts` | Dev environment config (edit directly) |
| `client/src/environments/environment.prod.ts` | Prod config — **generated at build time**, do not hand-edit |
| `client/generate-env.cjs` | Injects deployment env vars into `environment.prod.ts`; idempotent |
| `client/amplify.yml` | AWS Amplify CI/CD config — runs `npm install --legacy-peer-deps` then `npm run build:prod` |
| `client/angular.json` | CLI architect targets: build, serve, test, lint; `defaultConfiguration: production` for build |
| `client/package.json` | Scripts and dependencies |

## Top patterns

- **Feature-module layout**: each domain area (`store/`, `basket/`, `checkout/`, `account/`) has its own `*.module.ts` and `*-routing.module.ts`.
- **Service-based state**: no NgRx — state lives in Angular services using RxJS Observables (`store.service.ts`, `basket.service.ts`, `checkout.service.ts`, `loading.service.ts`).
- **HTTP pipeline**: all requests pass through `core/interceptors/loading.interceptor.ts` (spinner) and `core/interceptors/error.interceptor.ts` (global error handling).
- **Auth**: Azure AD B2C via `@azure/msal-angular` / `@azure/msal-browser`; route protection via `core/guards/auth.guard.ts`.
- **Env config at build time**: `generate-env.cjs` rewrites `environment.prod.ts` from process env vars before `ng build --configuration=production`.
- **SCSS throughout**: `angular.json` sets `inlineStyleLanguage: scss`; component schematic defaults to `style: scss`. Different from `micro-frontends/` which uses LESS.

## Gotchas

- **Legacy — confirm before investing**: new UI work belongs in `micro-frontends/`, not here.
- **`npm run build` defaults to production** (`defaultConfiguration: production` in `angular.json`) — budgets and file replacements apply immediately.
- **Linting is intentionally stubbed**: `lint` and `lint:fix` scripts just `echo` and `exit 0`; `angular.json` defines a real lint architect target but `package.json` bypasses it.
- **`environment.prod.ts` is generated**: `generate-env.cjs` overwrites it on every `build:prod` run. Do not hand-edit; change `generate-env.cjs` or the upstream env vars instead.
- **Hardcoded Azure B2C fallback in `generate-env.cjs`**: the fallback `AZURE_B2C_CLIENT_ID` (`d0dafab9-cae6-426d-a516-eab88853767c`) and authority (`nexttechuit.b2clogin.com`) are baked into the script. If you deploy without setting these env vars, you silently use the hardcoded tenant.
- **`--legacy-peer-deps` required**: `amplify.yml` and local installs need this flag due to peer-dependency conflicts in the Angular 21 + ngx-bootstrap 21 stack.
- **Production bundle budgets enforced**: initial bundle warn 1 MB / error 2 MB; component style warn 10 KB / error 20 KB. Large additions will break `build:prod`.

## Full onboarding doc

[`client/AGENT.md`](../../../../client/AGENT.md)
