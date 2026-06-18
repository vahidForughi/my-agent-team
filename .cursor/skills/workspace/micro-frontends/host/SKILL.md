---
name: host
description: Host micro-frontend shell — Module Federation runtime, routing, Azure AD B2C auth, shared layout, and remote MFE loading. Use when working in micro-frontends/host or integrating host routes, auth, or remote registry.
metadata:
  part-dir: micro-frontends/host
---

# Host Micro-Frontend Skill

React shell application that owns client-side routing, authentication, shared chrome (navbar/footer), the marketing home page, and dynamic loading of store/checkout/account/admin remotes via Module Federation.

## Read first

1. `micro-frontends/host/src/app/app.tsx` — BrowserRouter, auth provider, theme, route mounting
2. `micro-frontends/host/src/routes.tsx` — route table and protected-route rules
3. `micro-frontends/host/src/microFe/MicroFrontendApp.tsx` — Module Federation `init`/`loadRemote`/`inject` flow
4. `micro-frontends/host/src/config/microFrontendRegistry.ts` — remote registry and per-environment URLs
5. `micro-frontends/host/src/context/AppConfigContext.tsx` — shared config/callbacks passed to remotes

## Key patterns

- Nx project `host` serves on port **4200** (`project.json`); remotes on 4201–4204 in dev
- Remotes expose `ConsoleMicroApp` with `inject`/`unmount`; host passes `AppConfig` via `app-injector` types
- Auth via `@ecommerce-platform/auth-provider` + Azure AD B2C MSAL
- API calls to Basket/Catalog through Ocelot (`NX_API_BASE_URL`, default `http://localhost:8010`)

## Top gotchas

- Multiple conflicting API base URL fallbacks across config files — set `NX_API_BASE_URL` explicitly
- No `QueryClientProvider` visible in host bootstrap despite React Query hook usage
- `/admin/*` route skips shared Layout; other MFEs use navbar/footer wrapper
- Production remotes load from `/remotes/{name}/remoteEntry.js` (Amplify + `_redirects`)

## Full reference

See [micro-frontends/host/AGENT.md](../../../../micro-frontends/host/AGENT.md) for build/run commands, env vars, route contracts, HTTP paths, and deployment notes.
