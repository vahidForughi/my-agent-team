# Codebase Orientation Map

## 1-Line Summary
The `store` micro-frontend is a React application that displays product listings and details, integrated into the host shell via Module Federation.

## 5-Minute Explanation
- **Primary tasks in code**: The `store` micro-frontend is responsible for rendering product lists, product details, and handling user interactions related to browsing products. It consumes product data from backend APIs, presents it to the user, and allows navigation within the store section.
- **Primary inputs**: HTTP requests (for initial page load, product data), user interactions (filtering, sorting, viewing product details), and shared context from the host application (authentication status, base path).
- **Primary outputs**: Rendered UI for product catalog, navigation events for routing, and API calls to fetch product-related data.
- **Key files**:
    - `micro-frontends/store/src/main.ts`: Application entry point.
    - `micro-frontends/store/src/remote-entry.ts`: Module Federation entry point, exposing `inject` and `unmount` functions.
    - `micro-frontends/store/src/injector.ts`: Handles the injection and unmounting of the Store application when loaded by the host.
    - `micro-frontends/store/src/App.tsx`: Main React component, sets up routing, theming, and authentication context.
    - `micro-frontends/store/src/routes/index.tsx`: Defines the routing for the product list page using `@tanstack/react-router`.
    - `micro-frontends/store/module-federation.config.ts`: Module Federation configuration for the `store` micro-frontend.
- **Main code paths**: The `store` micro-frontend is loaded by the `host` via Module Federation, which calls its `inject` function. `main.ts` bootstraps the application, which then renders `App.tsx`. `App.tsx` sets up the router defined in `routeTree.gen.ts` (generated from `src/routes/`). `src/routes/index.tsx` specifies the component (`ProductList`) for the root route. `ProductList` then interacts with `src/services/` to fetch data.

## Deep Dive
- **Type**: Web application (micro-frontend remote).
- **Primary runtime(s)**: Browser (React 18, TypeScript, Node.js for development/build).
- **Entry points**:
  - `micro-frontends/store/src/main.ts`: Standard React application bootstrap.
  - `micro-frontends/store/src/remote-entry.ts`: The entry point exposed for Module Federation, which re-exports `inject` and `unmount` from `injector.ts`.
  - `micro-frontends/store/module-federation.config.ts`: Defines the `store` as a remote micro-frontend and specifies `./ConsoleMicroApp` as its exposed entry.

## Top-Level Structure
| Path | Purpose | Notes |
|---|---|---|
| `src/App.tsx` | Main application component | Wires up providers, router. |
| `src/injector.ts` | Micro-frontend injection logic | Exposes `inject` and `unmount` for host. |
| `src/pages/` | Page components | `ProductList.tsx` for displaying products. |
| `src/routes/` | Application routing | Defines routes for the `store` micro-frontend. |
| `src/services/` | Data fetching services | TanStack Query hooks for Catalog APIs. |
| `module-federation.config.ts` | Module Federation setup | Exposes the `store` micro-frontend. |

## Key Boundaries
- **Presentation**: `src/App.tsx` (main layout, theming), `src/pages/ProductList.tsx` (product listing UI), `src/components/` (reusable UI components).
- **Application/Domain**: Business logic specific to the store functionality (e.g., product display, filtering) resides within this micro-frontend, interacting with backend services via `src/services/`.
- **Persistence/External I/O**: `src/services/queryClient.ts` and other files in `src/services/` handle data fetching using TanStack Query, making HTTP requests to the backend catalog APIs.
- **Cross-cutting concerns**:
    - **Authentication**: Consumes authentication context from the host via `AuthConsumerProvider` and `useAuth` hook from `@ecommerce-platform/auth-provider`.
    - **Routing**: Uses `@tanstack/react-router` for internal navigation, with its base path configured based on the host's `appContext.basePath`.
    - **State Management**: Zustand for client-side state, TanStack Query for server-side state.
- **Responsibilities by file/module**:
    - `micro-frontends/store/src/main.ts`: Application initialization.
    - `micro-frontends/store/src/remote-entry.ts`: Module Federation contract.
    - `micro-frontends/store/src/injector.ts`: Mounts/unmounts the React app.
    - `micro-frontends/store/src/App.tsx`: Central orchestrator for the store MFE, context setup.
    - `micro-frontends/store/src/routes/index.tsx`: Defines the route for the product list.
    - `micro-frontends/store/src/pages/ProductList.tsx`: Renders the product list UI.
- **Detailed code flows**:
    1. The `host` MFE calls `store`'s `inject` function from `micro-frontends/store/src/injector.ts`.
    2. `main.ts` (triggered by `inject`) bootstraps the React app.
    3. `App.tsx` sets up `ConfigProvider` (Ant Design theming), `AuthConsumerProvider` (auth context from host), and `QueryClientProvider` (TanStack Query).
    4. `InnerApp` in `App.tsx` initializes `@tanstack/react-router` with the `routeTree` (generated from `src/routes/index.tsx`).
    5. The router renders `ProductListRoute` from `src/routes/index.tsx`, which in turn renders `ProductList` from `src/pages/ProductList.tsx`.
    6. `ProductList` components use hooks from `src/services/` to fetch product data from the backend APIs.
- **How the pieces map together**: `store` is a self-contained React application that is dynamically loaded and rendered by the `host`. It relies on shared packages (`@ecommerce-platform/app-injector`, `@ecommerce-platform/auth-provider`, `@ecommerce-platform/shared-layout`) for essential functionalities. Routing is managed internally by `@tanstack/react-router` and `@nx/module-federation` handles its exposure to the host.

## Files inspected
- `micro-frontends/store/src/main.ts`
- `micro-frontends/store/module-federation.config.ts`
- `micro-frontends/store/src/remote-entry.ts`
- `micro-frontends/store/src/injector.ts`
- `micro-frontends/store/src/App.tsx`
- `micro-frontends/store/src/routes/index.tsx`
- `micro-frontends/store/src/` (directory listing)
- `micro-frontends/CLAUDE.md`