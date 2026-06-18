# Codebase Orientation Map

## 1-Line Summary
The `admin` micro-frontend is a React remote application providing the platform administration interface — dashboard, products, orders, brands/types, and activity log — loaded by the host shell via Module Federation.

## 5-Minute Explanation
- **Primary tasks in code**: Renders the admin dashboard (with stats and quick actions), product CRUD, order management, brands/types management, and an activity log. Uses a custom Ant Design theme (`adminThemeConfig`) distinct from the shared layout theme.
- **Primary inputs**: `AppInjectorProps` from the host (carries `appContext` with `user`, `token`, `basePath`, `isAuthenticated`, `requestTokenRefresh`, `onLogout`), admin user interactions, and API responses from backend catalog, order, and brand services.
- **Primary outputs**: Rendered admin UI; API requests via TanStack Query hooks in `src/services/`; navigation events via `@tanstack/react-router`.
- **Key files**:
    - `micro-frontends/admin/src/remote-entry.ts`: Module Federation entry — exports `inject`/`unmount`.
    - `micro-frontends/admin/src/injector.ts`: Creates `AdminAppInjector` via `createAppInjector(App)`.
    - `micro-frontends/admin/src/App.tsx`: Wires `ConfigProvider` (with `adminThemeConfig`), `AuthConsumerProvider`, `QueryClientProvider`, `RouterContext`.
    - `micro-frontends/admin/src/routes/index.tsx`: Root route (`/`) → `Dashboard` component.
    - `micro-frontends/admin/src/config/theme.ts`: Custom `adminThemeConfig` (purple primary `#667eea`, density-optimized).
    - `micro-frontends/admin/module-federation.config.ts`: Exposes `./ConsoleMicroApp` → `./src/remote-entry.ts`.
- **Main code paths**: Host calls `inject(elementId, props)` → `injector.ts` mounts `App` → `App.tsx` wires providers with `adminThemeConfig` + host's `HostAuthContext` → `InnerApp` builds router with `routeTree` → routes render Dashboard/Products/Orders/BrandsTypes/Activities pages → pages call `src/services/` hooks for API data.

## Deep Dive
- **Type**: Web application (micro-frontend remote).
- **Primary runtime(s)**: Browser (React 18, TypeScript; Node.js for build/dev).
- **Entry points**:
  - `micro-frontends/admin/src/main.ts`: Standard React bootstrap for standalone development.
  - `micro-frontends/admin/src/remote-entry.ts`: MF public contract — re-exports `inject`/`unmount`/`default`.
  - `micro-frontends/admin/module-federation.config.ts`: Remote name `admin`, exposes `./ConsoleMicroApp`.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `src/App.tsx` | Main app component | Uses `adminThemeConfig` instead of shared theme; consumes `HostAuthContext`. |
| `src/injector.ts` | Mount/unmount contract | Uses `createAppInjector(App)`. |
| `src/remote-entry.ts` | MF entry | Re-exports `inject`/`unmount`. |
| `src/bootstrap.tsx` | Standalone bootstrap | Runs independently for development. |
| `src/config/theme.ts` | Admin-specific Ant Design theme | `adminThemeConfig` — purple primary, density-optimized. |
| `src/routes/` | TanStack Router file routes | index (Dashboard), products, orders, brands-types, activities, products new/edit. |
| `src/pages/` | Page components | Activities, BrandsTypes, Orders, ProductUpload, Products, plus `Profile.tsx`, `Settings.tsx`. |
| `src/components/` | UI components | `Activities/`, `Dashboard/` (QuickActions, RecentActivity), `Layout/`, `shared/` (StatsCards). |
| `src/services/` | Data fetching | TanStack Query hooks for catalog, orders, products, brands, user, activities. |
| `src/http/` | Axios HTTP client | Token-injected Axios instance. |
| `src/utils/` | Helpers | `basepath.ts`, `searchParams.ts` (serializes `group`, `service`, `configKey`, `env`, `tab` params). |
| `module-federation.config.ts` | MF configuration | Remote name and exposed modules. |

## Key Boundaries
- **Presentation**: `src/App.tsx`, `src/pages/` (Activities, BrandsTypes, Orders, Products, ProductUpload, Profile, Settings), `src/components/` (Dashboard widgets, Layout, shared StatsCards).
- **Application/Domain**: `src/routes/` (file-based routing), `src/services/` (query hooks for all admin domains: catalog, orders, brands, activities, user).
- **Persistence/External I/O**: TanStack Query hooks in `src/services/` → Axios client in `src/http/httpClient.ts` → backend APIs.
- **Cross-cutting concerns**:
    - Authentication: consumed via `AuthConsumerProvider` using `HostAuthContext` from `@ecommerce-platform/auth-provider`; `onLogout` callback is threaded through `RouterContext`.
    - Routing: `@tanstack/react-router` file-based routes including nested product routes (`products.$id.edit`, `products.new`).
    - Theming: Admin-specific `adminThemeConfig` in `src/config/theme.ts`; not the shared `themeConfig`.
    - Search params: Custom `createSearchSerializer(['group', 'service', 'configKey', 'env', 'tab'])` for URL state.
- **Responsibilities by file/module**:
    - `src/remote-entry.ts`: MF public contract.
    - `src/injector.ts`: Mounts/unmounts via `createAppInjector`.
    - `src/App.tsx`: Provider wiring; maps `appContext` → `HostAuthContext`; threads `onLogout` into context.
    - `src/config/theme.ts`: Admin's `adminThemeConfig` with layout constants.
    - `src/routes/index.tsx`: Root route → `Dashboard`.
    - `src/routes/products.tsx`, `products.new.tsx`, `products.$id.edit.tsx`: Product management routes.
    - `src/routes/orders.tsx`, `activities.tsx`, `brands-types.tsx`: Management and activity routes.
    - `src/services/`: Data fetching across catalog, orders, brands, user, and activities.
- **Detailed code flows**:
    1. Host calls `admin`'s `inject(elementId, props)` from `src/injector.ts`.
    2. `createAppInjector(App)` mounts `App`.
    3. `App.tsx` maps `appContext` → `HostAuthContext`, renders `ConfigProvider` (with `adminThemeConfig`) → `AuthConsumerProvider` → `QueryClientProvider` → `RouterContext.Provider` → `InnerApp`.
    4. `InnerApp` reads `hostAuth`/`config`/`onLogout` from `RouterContext`, derives `basePath`, creates router with `routeTree`.
    5. Router renders the matching page component (e.g., Dashboard, Products, Orders).
    6. Page components call `src/services/` hooks → Axios → backend APIs.
- **How the pieces map together**: `admin` is a self-contained React app with its own Ant Design theme. Auth flows in from the host via `HostAuthContext`; `onLogout` is passed through to the router context. Routing is file-based with generated `routeTree.gen.ts`. All data fetching goes through TanStack Query hooks in `src/services/`.

## Configuration
- Dev port: **4204** (defined in `project.json` `serve.options.port`).
- Builds to `dist/admin`. Prod config swaps `environment.ts` with `environment.prod.ts`.
- `NX_API_BASE_URL` controls the backend API base URL.
- `basePath` and auth context are received at runtime from the host.
- Search params serialized for: `group`, `service`, `configKey`, `env`, `tab`.
- Theme: `adminThemeConfig` (`src/config/theme.ts`) — primary color `#667eea`, sidebar 280px, header 64px.

## Interfaces & Contracts
- **Exposed MF module**: `./ConsoleMicroApp` → `src/remote-entry.ts` (exports `inject`, `unmount`, `default`).
- **`inject(elementId: string, props?: AppInjectorProps)`**: Mounts Admin React app.
- **`unmount(elementId: string)`**: Unmounts it.
- **`AppInjectorProps.config`**: Carries `appContext` (with `user`, `token`, `isAuthenticated`, etc.) and `onLogout`.
- **`HostAuthContext`** (from `@ecommerce-platform/auth-provider`): The auth type `App.tsx` maps `appContext` into.

## Data & State
- **Server state**: TanStack Query for all admin data — products, orders, brands, activities, user profile.
- **Client state**: Component-local React state; `RouterContext` holds `hostAuth`, `config`, `onLogout`.
- **Auth state**: Consumed from host; not owned here.

## Dependencies
- `@ecommerce-platform/app-injector` — `createAppInjector`.
- `@ecommerce-platform/auth-provider` — `AuthConsumerProvider`, `HostAuthContext`.
- `@tanstack/react-router`, `@tanstack/react-query`, `antd`, `axios`.
- Backend APIs for catalog, orders, brands, and activity data at `NX_API_BASE_URL`.

## Patterns
- Follows the standard MFE remote pattern: `module-federation.config.ts` → `remote-entry.ts` → `injector.ts` → `App.tsx`.
- Uses `HostAuthContext` (not the consumer's `useAuth` directly) — `App.tsx` manually maps `appContext` to it.
- Routes are file-based; includes parameterized nested routes (`products.$id.edit.tsx`).
- Has its own `adminThemeConfig` — does not use `sharedThemeConfig` from `shared-layout`.
- `src/components/shared/StatsCards` is a reusable stats display used on the Dashboard route.

## Gotchas & Owners
- `src/routeTree.gen.ts` is generated — run `npm run routes:generate` after adding/renaming route files.
- Admin uses `HostAuthContext` directly from `@ecommerce-platform/auth-provider` rather than `useAuth()` — different pattern from `account` and `checkout`.
- Admin does not use `@ecommerce-platform/shared-layout`'s `themeConfig`; it has its own `adminThemeConfig`.
- The `onLogout` callback is threaded into `RouterContext` for use in nested route components.
- **Owners**: `frontend-developer` — owns React components, routes, and services; `ui-designer` — owns `adminThemeConfig`.

## Files Inspected
- `micro-frontends/admin/module-federation.config.ts`
- `micro-frontends/admin/project.json`
- `micro-frontends/admin/src/App.tsx`
- `micro-frontends/admin/src/remote-entry.ts`
- `micro-frontends/admin/src/injector.ts`
- `micro-frontends/admin/src/routes/index.tsx`
- `micro-frontends/admin/src/config/theme.ts`
- `micro-frontends/admin/src/` (directory listing)
- `micro-frontends/admin/src/routes/` (directory listing)
- `micro-frontends/admin/src/pages/` (directory listing)
- `micro-frontends/admin/src/services/` (directory listing)
- `micro-frontends/admin/src/components/` (directory listing)
