# Codebase Orientation Map

## 1-Line Summary
The `checkout` micro-frontend is a React remote application for the purchase checkout flow — basket review, shipping, and payment — requiring authentication, loaded by the host via Module Federation.

## 5-Minute Explanation
- **Primary tasks in code**: Renders the checkout page with basket items, order summary, shipping info, and payment method components. Calls basket/order APIs via TanStack Query hooks. Sets up MSW mocks via `src/services/mocks` (called in `injector.ts` before mounting).
- **Primary inputs**: `AppInjectorProps` from the host (carries `appContext` with auth context and `basePath`), user interactions (reviewing basket, entering shipping/payment details), and API responses from basket and order services.
- **Primary outputs**: Rendered checkout UI; API requests to basket and order endpoints; order placement results.
- **Key files**:
    - `micro-frontends/checkout/src/remote-entry.ts`: Module Federation entry — exports `inject`/`unmount`.
    - `micro-frontends/checkout/src/injector.ts`: Calls `setupMocks()` then creates `CheckoutAppInjector` via `createAppInjector(App)`.
    - `micro-frontends/checkout/src/App.tsx`: Wires `ConfigProvider`, `AuthConsumerProvider`, `QueryClientProvider`, `RouterContext`.
    - `micro-frontends/checkout/src/routes/index.tsx`: Root route (`/`) → `Checkout` page.
    - `micro-frontends/checkout/src/routes/checkout.tsx`: `/checkout` named route.
    - `micro-frontends/checkout/src/pages/Checkout.tsx`: Main checkout page component.
    - `micro-frontends/checkout/module-federation.config.ts`: Exposes `./ConsoleMicroApp` → `./src/remote-entry.ts`.
- **Main code paths**: Host calls `inject(elementId, props)` → `injector.ts` calls `setupMocks()` then mounts `App` → `App.tsx` sets up providers with auth context → `InnerApp` builds router → root route renders `Checkout` page → `Checkout.tsx` uses `src/services/basket/` hooks for basket data and `src/services/` for order placement.

## Deep Dive
- **Type**: Web application (micro-frontend remote).
- **Primary runtime(s)**: Browser (React 18, TypeScript; Node.js for build/dev).
- **Entry points**:
  - `micro-frontends/checkout/src/main.ts`: Standard React bootstrap for standalone development.
  - `micro-frontends/checkout/src/remote-entry.ts`: MF public contract — re-exports `inject`/`unmount`/`default`.
  - `micro-frontends/checkout/module-federation.config.ts`: Remote name `checkout`, exposes `./ConsoleMicroApp`.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `src/App.tsx` | Main app component | Provider wiring with shared theme. |
| `src/injector.ts` | Mount/unmount contract | Calls `setupMocks()` before mounting. |
| `src/remote-entry.ts` | MF entry | Re-exports `inject`/`unmount`. |
| `src/bootstrap.tsx` | Standalone bootstrap | Runs independently for development. |
| `src/routes/` | TanStack Router file routes | `index.tsx` (Checkout root), `checkout.tsx` (named route). |
| `src/pages/Checkout.tsx` | Main checkout page | Composes checkout step components. |
| `src/components/` | Checkout UI components | `BasketItemRow`, `OrderSummaryCard`, `OrderTotalCard`, `PaymentMethodCard`, `ShippingInfoCard`. |
| `src/services/` | Data fetching | `basket/` hooks for basket data; others for order placement. |
| `src/http/` | Axios HTTP client | Token-injected Axios instance. |
| `src/hooks/` | Custom React hooks | Checkout-specific hooks. |
| `src/helpers/` | Helper functions | Checkout-specific utility helpers. |
| `src/utils/` | Utilities | `basepath.ts`, `searchParams.ts`. |
| `src/types/` | TypeScript types | Checkout domain types. |
| `module-federation.config.ts` | MF configuration | Remote name and exposed modules. |

## Key Boundaries
- **Presentation**: `src/pages/Checkout.tsx` and `src/components/` (BasketItemRow, OrderSummaryCard, OrderTotalCard, PaymentMethodCard, ShippingInfoCard).
- **Application/Domain**: `src/routes/` (routing), `src/services/basket/` (basket data), `src/hooks/` (checkout logic hooks), `src/helpers/` (business helpers).
- **Persistence/External I/O**: TanStack Query hooks in `src/services/basket/` → Axios → basket and order backend APIs.
- **Cross-cutting concerns**:
    - Authentication: consumed via `AuthConsumerProvider`/`useAuth()` from `@ecommerce-platform/auth-provider`; required (checkout is a protected route in the host).
    - Mocking: `setupMocks()` (MSW or similar) is called at injection time in `src/services/mocks/`.
    - Routing: `@tanstack/react-router` with two routes: root (`/`) and `/checkout`.
    - Theming: Shared `themeConfig` from `@ecommerce-platform/shared-layout`.
- **Responsibilities by file/module**:
    - `src/remote-entry.ts`: MF public contract.
    - `src/injector.ts`: Calls `setupMocks()` and mounts/unmounts via `createAppInjector`.
    - `src/App.tsx`: Provider wiring; maps `appContext` → `authConfig` for `AuthConsumerProvider`.
    - `src/routes/index.tsx`: Root route → `Checkout` page.
    - `src/pages/Checkout.tsx`: Composes BasketItemRow, OrderSummaryCard, etc.
    - `src/services/basket/`: TanStack Query hooks for basket item data.
    - `src/components/`: Individual checkout step UI components.
- **Detailed code flows**:
    1. Host's `ProtectedRoute` checks auth, then calls `checkout`'s `inject(elementId, props)`.
    2. `injector.ts` calls `setupMocks()` to register MSW service worker handlers, then mounts `App` via `createAppInjector`.
    3. `App.tsx` maps `appContext` → `authConfig`, renders providers, and creates `RouterContext`.
    4. `InnerApp` creates the `@tanstack/react-router` router with `routeTree`.
    5. Root route renders `Checkout` page via `CheckoutRoute` in `routes/index.tsx`.
    6. `Checkout.tsx` renders basket items using `src/services/basket/` hooks and sub-components.
- **How the pieces map together**: `checkout` is a self-contained React app. Its notable distinction from other remotes is that `injector.ts` calls `setupMocks()` before mounting — indicating active MSW mocking for API interactions. Auth flows in from the host; routing uses a `basepath` from `appContext`.

## Configuration
- Dev port: **4202** (defined in `project.json` `serve.options.port`).
- Builds to `dist/checkout`. Prod config swaps `environment.ts` with `environment.prod.ts`.
- `NX_API_BASE_URL` controls the backend API base URL.
- `basePath` and auth context are received at runtime from the host.
- Mocks: `src/services/mocks/` — `setupMocks()` is called at injection time.

## Interfaces & Contracts
- **Exposed MF module**: `./ConsoleMicroApp` → `src/remote-entry.ts` (exports `inject`, `unmount`, `default`).
- **`inject(elementId: string, props?: AppInjectorProps)`**: Initializes mocks and mounts the Checkout app.
- **`unmount(elementId: string)`**: Unmounts it.
- **`AppInjectorProps.config.appContext`**: Carries `user`, `token`, `tokenExpiry`, `isAuthenticated`, `basePath`, `requestTokenRefresh`.

## Data & State
- **Server state**: TanStack Query for basket items and order data.
- **Client state**: Component-local state for checkout form steps.
- **Auth state**: Consumed from host via `AuthConsumerProvider`; checkout requires authentication.

## Dependencies
- `@ecommerce-platform/app-injector` — `createAppInjector`.
- `@ecommerce-platform/auth-provider` — `AuthConsumerProvider`, `useAuth`.
- `@ecommerce-platform/shared-layout` — `themeConfig`.
- `@tanstack/react-router`, `@tanstack/react-query`, `antd`, `axios`.
- Backend basket and order APIs at `NX_API_BASE_URL`.

## Patterns
- Follows the standard MFE remote pattern: `module-federation.config.ts` → `remote-entry.ts` → `injector.ts` → `App.tsx`.
- `injector.ts` calls `setupMocks()` before mounting — distinguishes checkout from other remotes.
- `bootstrap.tsx` provides standalone development mode.
- Routes are file-based with `routeTree.gen.ts` generated by `@tanstack/router-cli`.

## Gotchas & Owners
- `setupMocks()` is called at injection time every time the remote is mounted — verify this is intentional for production builds.
- `src/routeTree.gen.ts` is generated — run `npm run routes:generate` after adding/renaming route files.
- Checkout is a protected route in the host — it will not be reachable without authentication.
- **Owners**: `frontend-developer` — owns checkout flow components, routes, and services.

## Files Inspected
- `micro-frontends/checkout/module-federation.config.ts`
- `micro-frontends/checkout/project.json`
- `micro-frontends/checkout/src/App.tsx`
- `micro-frontends/checkout/src/remote-entry.ts`
- `micro-frontends/checkout/src/injector.ts`
- `micro-frontends/checkout/src/routes/index.tsx`
- `micro-frontends/checkout/src/` (directory listing)
- `micro-frontends/checkout/src/routes/` (directory listing)
- `micro-frontends/checkout/src/pages/` (directory listing)
- `micro-frontends/checkout/src/services/` (directory listing)
- `micro-frontends/checkout/src/components/` (directory listing)
