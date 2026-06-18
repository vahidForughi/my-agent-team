# micro-frontends — micro-frontend suite

## What & why

The modern frontend: an NX monorepo of React apps composed at runtime with Webpack 5 **Module
Federation**. A `host` shell loads remotes (`store`, `checkout`, `account`, `admin`), with shared
auth/layout/injection provided by local `@ecommerce-platform/*` packages. This supersedes the legacy
Angular `client/` SPA.

## Where it lives

`micro-frontends/` — apps `host/` (`:4200`), `store/` (`:4201`), `checkout/` (`:4202`),
`account/` (`:4203`), `admin/` (`:4204`); `packages/` (shared libs); `e2e/` (Playwright);
`nx.json`, `tsconfig.base.json`, root `package.json`. Each app has a
`module-federation.config.ts` plus `webpack.config.ts` (dev) and `webpack.config.prod.ts` (prod).

Sub-parts (each documented separately):

- [`packages/app-injector/CLAUDE.md`](./packages/app-injector/CLAUDE.md) — `@ecommerce-platform/app-injector`, mounts remotes.
- [`packages/auth-provider/CLAUDE.md`](./packages/auth-provider/CLAUDE.md) — `@ecommerce-platform/auth-provider`, MSAL/Azure AD B2C.
- [`packages/shared-layout/CLAUDE.md`](./packages/shared-layout/CLAUDE.md) — `@ecommerce-platform/shared-layout`, chrome + nav.
- Build/dev/test orchestration (npm scripts + NX, no `scripts/` dir) — documented in the
  "Build / run / test" section below and in each package's CLAUDE.md.

## Tech stack

From `micro-frontends/package.json` and `nx.json`:

- **NX 21.6** (`nx` `21.6.11`), **React 18** (`react`/`react-dom` `^18.3.1`), TypeScript `~5.9.2`.
- **Module Federation** via `@nx/module-federation` + `@module-federation/enhanced`, on **webpack**
  (`@nx/webpack`), transpiled with **SWC**.
- **UI:** Ant Design (`antd` `^5.22.6`) + `@ant-design/icons`; **LESS** stylesheets (NX generator
  default `style: less`), not plain CSS.
- **State:** Zustand `^5.0.14` (client) + TanStack Query `^5.101.0` (server).
- **Routing:** TanStack Router (`@tanstack/react-router`) and React Router (`react-router-dom` `^6`).
- **Other:** Zod, Axios, i18next/react-i18next, dayjs, lodash, xlsx/papaparse.
- **Testing:** Jest (`@nx/jest`) + Playwright (`@nx/playwright`); ESLint 9 + Prettier.

## Build / run / test

Prerequisite: `npm run setup` first; dev apps serve on **4200–4204**.

```bash
cd micro-frontends
npm run setup        # npm install + build:packages (REQUIRED first time)
npm start            # serve host+store+checkout+account+admin in parallel (4200–4204)
npm run build:prod   # nx run-many build --configuration=production --all
npm test             # nx run-many test --all
npm run test:e2e     # playwright test
npm run lint && npm run format
```

The full script/NX-target reference: root `package.json` scripts, `nx.json` target defaults/caching,
per-project `project.json`, and the per-app webpack configs.

## Configuration

- Env vars prefixed **`NX_`** are injected into bundles via webpack `DefinePlugin` (each app's
  `webpack.config.ts` filters `process.env` keys starting with `NX_`).
- **`NX_API_BASE_URL`** points apps at the backend gateway (defaults to `http://localhost:8010`).
- **`NX_MF_DEV_REMOTES`** (declared in `nx.json`) controls which dev remotes are served.
- Shared packages are consumed as `@ecommerce-platform/*` workspace deps and must be built before
  apps run (`build:packages` / `postinstall`).

## Interfaces & contracts

- **Module Federation:** the `host` exposes nothing (`module-federation.config.ts` is just
  `name: 'host'`); each remote exposes exactly one entry **`./ConsoleMicroApp`** →
  `./src/remote-entry.ts` (see `store`/`account`/`checkout`/`admin` configs). The host discovers
  remotes through a central registry `host/src/config/microFrontendRegistry.ts` (name, `remoteName`,
  `exposedModule: ConsoleMicroApp`, `basePath`, and per-env URLs).
- **Shared packages** expose their public APIs via the sub-parts:
  injectors (`createAppInjector`/`createEnhancedAppInjector`) from
  [`packages/app-injector/CLAUDE.md`](./packages/app-injector/CLAUDE.md); the `EcommerceAuthProvider`/hooks from
  [`packages/auth-provider/CLAUDE.md`](./packages/auth-provider/CLAUDE.md); `Layout`/`Navbar`/nav utils from
  [`packages/shared-layout/CLAUDE.md`](./packages/shared-layout/CLAUDE.md).

## Data & state

- **Client state:** Zustand. **Server state:** TanStack Query (`QueryClient`), which
  [`packages/auth-provider/CLAUDE.md`](./packages/auth-provider/CLAUDE.md) also relies on for token refresh.
- **Auth state** is owned by [`packages/auth-provider/CLAUDE.md`](./packages/auth-provider/CLAUDE.md): the host holds it and
  broadcasts token updates; remotes subscribe via `useTokenBroadcastSubscription()`.
- `store` carries real cart state; [`packages/shared-layout/CLAUDE.md`](./packages/shared-layout/CLAUDE.md)'s `CartPreview` is
  display-only.

## Dependencies

- Apps import the workspace packages `@ecommerce-platform/app-injector`,
  `@ecommerce-platform/auth-provider`, `@ecommerce-platform/shared-layout` (built first via the
  `build:packages` script). `shared-layout` itself peer-depends on `auth-provider`.
- Talks to the backend **API gateway at `:8010`** via `NX_API_BASE_URL`; authenticates against
  **Azure AD B2C** through `auth-provider`.

## Patterns

- Run `npm run setup` (or `build:packages`) before anything — apps import `@ecommerce-platform/*`
  packages that must be built first.
- Each remote exposes exactly one entry, `./ConsoleMicroApp`; the registry defines app
  names/paths/URLs. Dev uses fixed ports 4200–4204; prod resolves remote URLs from
  `window.location.origin` under `/remotes/<name>` (`microFrontendRegistry.ts`).
- Two webpack configs per app: `webpack.config.ts` (dev) and `webpack.config.prod.ts` (prod).
- Stylesheets use **LESS** (`.less`), not plain CSS (NX generator default in `nx.json`).

## Gotchas

- After a fresh clone or package change, IDE type errors usually mean packages aren't built —
  rebuild packages and restart the TS server.
- Port conflicts on 4200–4204 break `npm start`.
- Module Federation expose/remote names are case-sensitive and must match
  `module-federation.config.ts` and the registry (`exposedModule: ConsoleMicroApp`).
- Protected remotes (checkout/account/admin) require auth; `store` is public.
- **Runtime remote loading: use `registerRemotes`, never `init`.** The host is already initialized as
  an MF host at build time by `@nx/module-federation`. Calling `@module-federation/runtime` `init()`
  again (especially with a different `name`) throws `#RUNTIME-010` ("The name option cannot be changed
  after initialization") and renders the ErrorBoundary. `host/src/microFe/MicroFrontendApp.tsx` adds
  remotes with `registerRemotes([{ name, entry }])`, guarded by a module-level `Set` so each remote
  registers at most once (avoids the "remote already registered" warning on re-render).
- **NX version skew:** `package.json` mixes NX majors — core/`@nx/eslint|jest|js|web|workspace` are
  `21.6.11` while `@nx/module-federation|react|webpack|playwright` are `22.7.5`. The NX daemon can fail
  to compute the project graph in restricted/CI environments; typecheck a single project directly with
  `tsc --noEmit -p <app>/tsconfig.app.json` as a fallback.

## Owners / agents

- **frontend-developer** — owns the React apps, Module Federation wiring, and shared packages.
- **devops-automator** — owns NX/CI orchestration and build/deploy (root `package.json` scripts + NX targets).
