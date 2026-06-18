# Host Micro-Frontend — Agent Onboarding

## What & why

The Host is the shell application for the ecommerce micro-frontend platform. It owns client-side routing, the shared chrome (navbar, footer, layout), Azure AD B2C authentication, and dynamic loading of remote micro-frontends (store, checkout, account, admin) via Module Federation runtime. It also renders the marketing home page (`/`) and login page (`/login`), and exposes basket/catalog API calls for navbar cart preview and homepage product sections.

## Where it lives

```
micro-frontends/host/
├── project.json                   # Nx targets: build, serve (port 4200), lint, test
├── module-federation.config.ts    # MF host name: 'host'
├── webpack.config.ts              # Dev webpack + NX_ env injection
├── webpack.config.prod.ts         # Prod webpack (Amplify env vars, empty remotes)
├── src/
│   ├── main.ts                    # Async entry → bootstrap.tsx
│   ├── bootstrap.tsx              # ReactDOM.createRoot → <App />
│   ├── index.html                 # SPA shell
│   ├── _redirects                 # Amplify SPA + /remotes/* routing
│   ├── app/app.tsx                # BrowserRouter, auth, theme, routes
│   ├── routes.tsx                 # Route table (home, login, MFE paths)
│   ├── microFe/
│   │   ├── MicroFrontendApp.tsx   # Module Federation runtime loader
│   │   └── ErrorBoundary.tsx      # MFE load error UI
│   ├── config/
│   │   ├── microFrontendRegistry.ts  # Remote registry (store/checkout/account/admin)
│   │   ├── env.config.ts             # NX_* runtime config
│   │   └── api.config.ts             # Basket path constants
│   ├── context/AppConfigContext.tsx  # Shared config passed to remotes
│   ├── auth/msal/config.ts           # Azure AD B2C MSAL settings
│   ├── components/                   # Layout, Navbar, Footer, CartPreview, ProtectedRoute
│   ├── pages/                        # HomePage, LoginPage
│   ├── services/                     # basket, products, categories (React Query hooks)
│   ├── http/                         # Axios factory + error handler
│   └── i18n/                         # i18next (en, vi)
└── jest.config.ts                 # Jest unit tests
```

Nx workspace root: `micro-frontends/` (`micro-frontends/package.json`, `micro-frontends/nx.json`). Host is registered as project `host` in `micro-frontends/host/project.json`.

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | React 18, TypeScript ~5.9 |
| Build | Nx 21/22, Webpack (`@nx/webpack`), Babel |
| Module Federation | `@nx/module-federation`, `@module-federation/runtime` (`init`, `loadRemote`) |
| Routing | `react-router-dom` v6 (`BrowserRouter`, `useRoutes`) |
| UI | Ant Design 5, Less (`src/styles.less`) |
| Auth | `@ecommerce-platform/auth-provider` + `@azure/msal-browser` (Azure AD B2C) |
| Data fetching | `@tanstack/react-query` v5, Axios, Zod validation |
| i18n | `i18next`, `react-i18next` (en, vi) |
| Shared contracts | `@ecommerce-platform/app-injector` (via tsconfig path alias) |
| Testing | Jest + `@testing-library/react`; E2E in `micro-frontends/e2e/` (Playwright) |

## Build / run / test

**Prerequisites:** From `micro-frontends/`, run `npm run setup` (installs deps and builds workspace packages: app-injector, auth-provider, shared-layout).

**Serve host only (port 4200):**

```bash
cd micro-frontends
npm run start:host
# or: nx serve host
# URL: http://localhost:4200
```

**Serve all MFEs in parallel (host + remotes on ports 4200–4204):**

```bash
cd micro-frontends
npm start
# host:4200, store:4201, checkout:4202, account:4203, admin:4204
```

**Build:**

```bash
cd micro-frontends
npm run build:host
# output: micro-frontends/dist/host
```

**Lint / test:**

```bash
cd micro-frontends
nx lint host
nx test host
```

**E2E (requires all MFEs running):**

```bash
cd micro-frontends
npm run test:e2e
# Playwright specs in micro-frontends/e2e/module-federation.spec.ts
```

Set `NX_API_BASE_URL` to the Ocelot gateway before serving (webpack injects all `NX_*` env vars via `DefinePlugin` in `webpack.config.ts`). Default in `env.config.ts` is `http://localhost:8010`.

## Configuration

| Key | Source | Purpose |
|-----|--------|---------|
| `NX_API_BASE_URL` | `src/config/env.config.ts`, `webpack.config.ts` | Axios base URL for Basket/Catalog API calls (default `http://localhost:8010`) |
| `NX_API_TIMEOUT` | `env.config.ts` | HTTP timeout ms (default `30000`) |
| `NX_USE_MOCK_DATA` | `env.config.ts` | When `true`, enables mock interceptor path in `HttpClientFactory.createWithMock` |
| `NX_ENABLE_AUTHENTICATION` | `env.config.ts` | Feature flag (default enabled unless `'false'`) |
| `NX_ENABLE_DISCOUNT_SERVICE` | `env.config.ts` | Feature flag for discount integration |
| `NX_ENABLE_ORDER_TRACKING` | `env.config.ts` | Feature flag for order tracking |
| `NX_LOG_LEVEL` | `env.config.ts` | Log level (`debug`/`info`/`warn`/`error`, default `info`) |
| `NX_ENABLE_API_LOGGING` | `env.config.ts` | When `true`, logs Axios request/response in `http-client.factory.ts` |
| `NX_AZURE_CLIENT_ID` | `auth/msal/config.ts`, `app/app.tsx` | Overrides B2C client ID (fallback hardcoded in `B2C_CONFIG`) |
| `theme` | `localStorage` | Light/dark theme (`AppConfigContext.tsx`) |
| `language` | `localStorage` | i18n locale (`i18n/config.ts`, default `en`) |

**Remote URLs** are defined in `src/config/microFrontendRegistry.ts`:
- Dev: `http://localhost:{4201|4202|4203|4204}` per remote
- Stg/Prd: `{window.location.origin}/remotes/{remoteName}` (Amplify co-deploy)

**Production build:** `webpack.config.prod.ts` reads env vars from Amplify Console (no `.env` files). `src/_redirects` configures Amplify SPA fallback and `/remotes/*` paths.

**Missing file reference:** `project.json` production `fileReplacements` points to `host/src/environments/environment.ts` and `environment.prod.ts` — _not found in `micro-frontends/host/src/environments/`_.

## Interfaces & contracts

### Client routes (`src/routes.tsx`)

| Path | Component | Auth |
|------|-----------|------|
| `/login` | `LoginPage` | Public |
| `/admin/*` | `MicroFrontendApp` (admin) | Protected (`ProtectedRoute`) — no shared `Layout` |
| `/` | `HomePage` inside `Layout` | Public |
| `/store/*` | `MicroFrontendApp` (store) | Public |
| `/checkout/*` | `MicroFrontendApp` (checkout) | Protected |
| `/account/*` | `MicroFrontendApp` (account) | Protected |
| `/:appName/*` | Dynamic MFE route | Protected if `appName` in `['checkout','account','admin']` |

### Module Federation remote contract

Registry: `src/config/microFrontendRegistry.ts`. Each remote exposes `ConsoleMicroApp` with `inject(elementId, props)` and `unmount(elementId)` (loaded in `MicroFrontendApp.tsx` via `loadRemote('${remoteName}/ConsoleMicroApp')`).

Props passed to remotes (`MicroFrontendApp.tsx`):

```ts
{
  config: {
    ...appConfig,           // from AppConfigContext (MicroFrontendConfig)
    appContext: {
      ...appConfig.appContext,
      basePath: `/${appName}`,
      initialSearchParams: Record<string, string>,
      onSearchChange: (search) => void,
    },
  },
}
```

`AppConfigContext` supplies `user`, `token`, `theme`, `apiBaseUrl`, `isAuthenticated`, `requestTokenRefresh`, plus callbacks `onNavigate`, `onLogout`, `onError`.

### HTTP API calls (via Ocelot gateway)

Base URL from `env.apiBaseUrl`. Paths used by host services:

| Service | Method | Path | File |
|---------|--------|------|------|
| Basket | GET | `/Basket/GetBasket/:userName` | `services/basket/apis.ts` |
| Basket | POST | `/Basket/CreateBasket` | `services/basket/apis.ts` |
| Catalog | GET | `/Catalog/GetAllProducts?...` | `services/products/api.ts` |
| Catalog | GET | `/Catalog/GetAllTypes` | `services/categories/api.ts` |

HTTP client adds `Authorization: Bearer {token}` and `X-User-Name` header from `@ecommerce-platform/auth-provider` stored auth (`http/http-client.factory.ts`).

### Cross-MFE events

`Navbar.tsx` listens for `ecommerce:cart:updated` custom window event (dispatched by store MFE) to invalidate basket React Query cache.

## Data & state

| State | Location | Notes |
|-------|----------|-------|
| Auth session | MSAL browser cache (`localStorage`) via `@ecommerce-platform/auth-provider` | B2C tenant `nexttechuit.b2clogin.com` |
| Theme | React state + `localStorage['theme']` | `AppConfigContext` |
| Language | `localStorage['language']` | i18next init |
| Basket cache | React Query (`services/basket/hooks.ts`) | Keyed by username from auth |
| Products/categories cache | React Query hooks | 5 min stale time |
| MFE registry | Static array in `microFrontendRegistry.ts` | Not fetched at runtime |

_no server-side persistence in host; all API state is fetched from backend services_

## Dependencies

### Workspace packages (tsconfig path aliases in `micro-frontends/tsconfig.base.json`)

| Package | Path alias | Used in host |
|---------|------------|--------------|
| `@ecommerce-platform/app-injector` | `packages/app-injector/src/index.ts` | `AppConfigContext.tsx` (`MicroFrontendConfig`, `AppContext`) |
| `@ecommerce-platform/auth-provider` | npm package `^1.2.6` | `app.tsx`, `ProtectedRoute`, `LoginPage`, basket hooks, HTTP client |
| `@ecommerce-platform/shared-layout` | `packages/shared-layout/src/index.ts` | Listed in root `package.json` postinstall build; _not imported in host source_ |

### Remote micro-frontends (Module Federation)

| Remote | Dev port | Registry name |
|--------|----------|---------------|
| store | 4201 | `store` |
| checkout | 4202 | `checkout` |
| account | 4203 | `account` |
| admin | 4204 | `admin` |

### Backend services (via Ocelot gateway)

| Service | Host usage |
|---------|------------|
| Basket | Navbar cart preview, `useBasket` hook |
| Catalog | HomePage featured products, navbar categories |

## Patterns

- **Shell + remotes:** Host renders layout and loads remotes at runtime; it does not bundle remote code at build time (`webpack.config.prod.ts` sets `remotes: []`).
- **Registry-driven loading:** `getMicroFrontendConfig(appName)` resolves remote URL, name, and exposed module; unknown apps show `ErrorBoundaryFallback`.
- **Auth wrapper:** `EcommerceAuthProvider` wraps the app in `app.tsx`; protected routes use `ProtectedRoute` which redirects to `/login` with `state.from` for post-login return.
- **Config injection to remotes:** `AppConfigProvider` builds `MicroFrontendConfig` with navigation/logout/error callbacks and auth context for child MFEs.
- **API factory pattern:** `createApiFactory('/Basket', { version: '' })` in basket services; products/categories use direct `axiosClient.get` with Zod schemas.
- **Environment detection:** `helpers/environment.ts` maps hostname to `dev`/`stg`/`prd` for remote URL selection.
- **Navbar fixed positioning:** `Layout.tsx` applies top padding (`NAVBAR_HEIGHT = 152`) for MFE routes under the fixed navbar.

## Gotchas

1. **Multiple API base URL defaults:** `env.config.ts` defaults to `http://localhost:8010`; `AppConfigContext.tsx` passes `http://localhost:3000/api` to remotes; `constants/appConfigs.ts` uses `http://localhost:3001/api`; `helpers/environment.ts` `getApiBaseUrl()` returns `http://localhost:8000/api` for dev — align `NX_API_BASE_URL` explicitly.
2. **No `QueryClientProvider` in host tree:** `useBasket`, `useProducts`, `useCategories`, and `Navbar` use React Query hooks but `app.tsx`/`bootstrap.tsx` do not wrap a provider — verify runtime behavior when changing data-fetching code.
3. **Missing environment file replacements:** `project.json` references `src/environments/environment.ts` and `environment.prod.ts` that do not exist under `host/src/`.
4. **Admin route is outside Layout:** `/admin/*` renders without shared navbar/footer (`routes.tsx`); other MFEs render inside `Layout`.
5. **Protected route list is duplicated:** `PROTECTED_ROUTES` in `routes.tsx` and per-route `isProtected` props must stay in sync when adding remotes.
6. **B2C client ID is hardcoded:** `auth/msal/config.ts` has fallback `B2C_CONFIG.CLIENT_ID`; override with `NX_AZURE_CLIENT_ID` for other tenants.
7. **`@ecommerce-platform/shared-layout` not used:** Host maintains its own `Navbar`, `Footer`, `Layout` despite shared-layout being a workspace dependency.
8. **Amplify deployment:** Production remotes load from `/remotes/{name}/remoteEntry.js`; `_redirects` must be deployed with the host build.
9. **Username for basket:** Derived from `user.email || user.displayName || user.id || 'guest'` — guest carts possible when unauthenticated.
10. **Module Federation runtime re-inits per load:** `MicroFrontendApp.tsx` calls `init()` on each remote load; multiple navigations between MFEs re-initialize the runtime.

## Owners

_not found in micro-frontends/host/ (no CODEOWNERS, README, or team metadata in this directory)_
