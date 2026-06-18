# Codebase Orientation Map

## 1-Line Summary
The `account` micro-frontend is a React remote application for user account management — profile, order history, and settings — dynamically loaded by the host shell via Module Federation.

## 5-Minute Explanation
- **Primary tasks in code**: Renders the authenticated user's profile, order history, and settings pages. Receives authentication context from the host and consumes it through `AuthConsumerProvider`.
- **Primary inputs**: `AppInjectorProps` passed by the host via `inject(elementId, props)` (carries `appContext` with `user`, `token`, `basePath`, `isAuthenticated`, `requestTokenRefresh`), user interactions (view/edit profile, browse orders, change settings), and API responses from backend order/user services.
- **Primary outputs**: Rendered UI for profile, orders, and settings; API requests to backend services via TanStack Query hooks in `src/services/`.
- **Key files**:
    - `micro-frontends/account/src/remote-entry.ts`: Module Federation entry point — exports `inject` and `unmount`.
    - `micro-frontends/account/src/injector.ts`: Creates an `AccountAppInjector` via `createAppInjector(App)` and exports `inject`/`unmount`.
    - `micro-frontends/account/src/App.tsx`: Wires `ConfigProvider`, `AuthConsumerProvider`, `QueryClientProvider`, `RouterContext`, and `InnerApp`.
    - `micro-frontends/account/src/routes/index.tsx`: Root route (`/`) → `Profile` page.
    - `micro-frontends/account/src/routes/orders.tsx`: `/orders` route → `Orders` page.
    - `micro-frontends/account/src/routes/settings.tsx`: `/settings` route → `Settings` page.
    - `micro-frontends/account/module-federation.config.ts`: Exposes `./ConsoleMicroApp` → `./src/remote-entry.ts`.
- **Main code paths**: Host calls `inject(elementId, props)` → `injector.ts` mounts `App` → `App.tsx` sets up `AuthConsumerProvider` + `QueryClientProvider` + `RouterContext` → `InnerApp` creates `@tanstack/react-router` router with `basepath` from `appContext.basePath` → routes render `Profile`, `Orders`, or `Settings` pages → pages call TanStack Query hooks in `src/services/` for API data.

## Deep Dive
- **Type**: Web application (micro-frontend remote).
- **Primary runtime(s)**: Browser (React 18, TypeScript; Node.js for build/dev).
- **Entry points**:
  - `micro-frontends/account/src/main.ts`: Standard React bootstrap for standalone development mode (uses `src/bootstrap.tsx`).
  - `micro-frontends/account/src/remote-entry.ts`: Module Federation contract, re-exports `inject`/`unmount`/`default` from `injector.ts`.
  - `micro-frontends/account/module-federation.config.ts`: Declares MF remote name `account`, exposes `./ConsoleMicroApp`.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `src/App.tsx` | Main app component | Sets up providers and `RouterContext`. |
| `src/injector.ts` | Mount/unmount contract | Uses `createAppInjector` from `@ecommerce-platform/app-injector`. |
| `src/remote-entry.ts` | MF entry | Re-exports `inject`/`unmount`. |
| `src/bootstrap.tsx` | Standalone bootstrap | Runs the app independently with its own QueryClient and BrowserRouter. |
| `src/routes/` | TanStack Router file routes | `index.tsx` (Profile), `orders.tsx`, `settings.tsx`. |
| `src/pages/` | Page components | `Profile.tsx`, `Orders.tsx`, `Settings.tsx`. |
| `src/components/` | UI components | `OrdersView/`, `ProfileView/` sub-components. |
| `src/services/` | Data fetching | TanStack Query hooks for orders and user data. |
| `src/http/` | Axios HTTP client | Configured with auth token injection. |
| `src/utils/` | Helpers | `basepath.ts`, `searchParams.ts`. |
| `src/config/` | App configuration | Environment-specific configuration. |
| `module-federation.config.ts` | MF configuration | Remote name and exposed modules. |

## Key Boundaries
- **Presentation**: `src/App.tsx`, `src/pages/` (Profile, Orders, Settings), `src/components/` (OrdersView, ProfileView).
- **Application/Domain**: `src/routes/` (route definitions), `src/services/` (data fetching and query hooks), `src/http/` (HTTP client factory).
- **Persistence/External I/O**: `src/services/` — TanStack Query hooks making requests to backend user and order APIs via Axios. `src/services/queryClient.ts` holds the QueryClient instance.
- **Cross-cutting concerns**:
    - Authentication: consumed via `AuthConsumerProvider` and `useAuth()` from `@ecommerce-platform/auth-provider`; token injected by `src/http/httpClient.ts`.
    - Routing: `@tanstack/react-router` with `basepath` from `appContext.basePath`; routes generated to `src/routeTree.gen.ts`.
    - Theming: Ant Design `ConfigProvider` with `sharedThemeConfig` from `@ecommerce-platform/shared-layout`.
- **Responsibilities by file/module**:
    - `src/remote-entry.ts`: MF public contract — exports `inject`/`unmount`.
    - `src/injector.ts`: Mounts/unmounts the React app via `createAppInjector`.
    - `src/App.tsx`: Provider wiring; bridges host-provided `appContext` to `AuthConsumerProvider`.
    - `src/routes/index.tsx`: Root route → `Profile` page.
    - `src/routes/orders.tsx`: `/orders` route → `Orders` page.
    - `src/routes/settings.tsx`: `/settings` route → `Settings` page.
    - `src/services/`: Data fetching for user profile and order history.
- **Detailed code flows**:
    1. Host calls `account`'s `inject(elementId, props)` from `src/injector.ts`.
    2. `createAppInjector(App)` mounts `App` into the target DOM element.
    3. `App.tsx` reads `appContext` from `props.config`, constructs `authConfig`, and renders `ConfigProvider` → `AuthConsumerProvider` → `QueryClientProvider` → `RouterContext.Provider` → `InnerApp`.
    4. `InnerApp` reads `config` from `RouterContext`, derives `basePath`, and creates the `@tanstack/react-router` router with `routeTree` (generated in `routeTree.gen.ts`).
    5. The router matches the URL and renders the corresponding page: `Profile`, `Orders`, or `Settings`.
    6. Pages call TanStack Query hooks in `src/services/` which use `src/http/httpClient.ts` (Axios, token-injected) to fetch data from the backend.
- **How the pieces map together**: `account` is a self-contained React app mounted by the host. Auth state flows in via `appContext` → `AuthConsumerProvider`; routing is internal with a host-controlled `basepath`; API calls go through a TanStack Query / Axios layer; MF contract is the `./ConsoleMicroApp` expose in `module-federation.config.ts`.

## Configuration
- Dev port: **4203** (defined in `project.json` `serve.options.port`).
- Builds to `dist/account`. Prod config swaps `environment.ts` with `environment.prod.ts`.
- `NX_API_BASE_URL` controls the backend API base URL (injected via webpack `DefinePlugin`).
- `basePath` is received at runtime from the host via `appContext.basePath`.
- Route generation: `npx @tanstack/router-cli generate` (NX target `routes:generate`).

## Interfaces & Contracts
- **Exposed MF module**: `./ConsoleMicroApp` → `src/remote-entry.ts` (exports `inject`, `unmount`, `default`).
- **`inject(elementId: string, props?: AppInjectorProps)`**: Mounts the Account React app.
- **`unmount(elementId: string)`**: Unmounts it.
- **`AppInjectorProps.config.appContext`**: Carries `user`, `token`, `tokenExpiry`, `isAuthenticated`, `basePath`, `requestTokenRefresh`.

## Data & State
- **Server state**: TanStack Query (`QueryClient` in `src/services/queryClient.ts`) for user profile and order data.
- **Client state**: No dedicated Zustand stores observed in `src/`; component-local state via React hooks.
- **Auth state**: Consumed from host via `AuthConsumerProvider`; not owned here.

## Dependencies
- `@ecommerce-platform/app-injector` — `createAppInjector`.
- `@ecommerce-platform/auth-provider` — `AuthConsumerProvider`, `useAuth`.
- `@ecommerce-platform/shared-layout` — `themeConfig`, layout components.
- `@tanstack/react-router`, `@tanstack/react-query`, `antd`, `axios`.
- Backend API at `NX_API_BASE_URL` for user profile and order history endpoints.

## Patterns
- Follows the standard MFE remote pattern: `module-federation.config.ts` exposes `./ConsoleMicroApp` → `remote-entry.ts` → `injector.ts` → `App.tsx`.
- `bootstrap.tsx` provides a standalone mode (runs at `:4203` independently) for development without the host.
- Routes are file-based (`@tanstack/router-cli`) and generated into `src/routeTree.gen.ts` — do not edit that file manually.
- Auth context flows in through `AppInjectorProps`; the app does not own an MSAL instance when hosted.

## Gotchas & Owners
- `src/routeTree.gen.ts` is generated — run `npm run routes:generate` (inside `micro-frontends/`) after adding/renaming route files.
- Auth is not set up in standalone mode unless `bootstrap.tsx` is modified; the app expects the host to provide auth context when hosted.
- `src/App.tsx` contains debug `console.log` statements that should be cleaned up before production.
- **Owners**: `frontend-developer` — owns React components, routes, and services.

## Files Inspected
- `micro-frontends/account/module-federation.config.ts`
- `micro-frontends/account/project.json`
- `micro-frontends/account/src/App.tsx`
- `micro-frontends/account/src/bootstrap.tsx`
- `micro-frontends/account/src/remote-entry.ts`
- `micro-frontends/account/src/injector.ts`
- `micro-frontends/account/src/routes/index.tsx`
- `micro-frontends/account/src/` (directory listing)
- `micro-frontends/account/src/routes/` (directory listing)
- `micro-frontends/account/src/pages/` (directory listing)
- `micro-frontends/account/src/services/` (directory listing)
- `micro-frontends/account/src/components/` (directory listing)
