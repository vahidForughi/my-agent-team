# Codebase Orientation Map

## 1-Line Summary
The `host` micro-frontend is the shell application that orchestrates and loads other micro-frontends at runtime using Module Federation.

## 5-Minute Explanation
- **Primary tasks in code**: The host application serves as the entry point for the entire micro-frontend ecosystem. It is responsible for initializing the Module Federation runtime, registering and loading remote micro-frontends, handling routing between them, and providing shared authentication and layout.
- **Primary inputs**: HTTP requests (for initial page load and routing), user interactions (for navigation), and configuration from `microFrontendRegistry.ts` for remote MFE details.
- **Primary outputs**: Rendered UI composed of the host's layout and dynamically loaded remote micro-frontends, authenticated user sessions, and dispatched HTTP requests to backend APIs.
- **Key files**:
    - `micro-frontends/host/src/main.ts`: Application entry point.
    - `micro-frontends/host/src/microFe/MicroFrontendApp.tsx`: Handles Module Federation runtime and remote MFE loading.
    - `micro-frontends/host/src/routes.tsx`: Defines the routing table for the host and remote MFEs.
    - `micro-frontends/host/src/auth/msal/config.ts`: MSAL/Azure AD B2C authentication configuration.
    - `micro-frontends/host/src/app/app.tsx`: Wires up the `EcommerceAuthProvider` and overall application structure.
    - `micro-frontends/host/module-federation.config.ts`: Module Federation configuration for the host.
- **Main code paths**: A user request comes to the host (main.ts), which initializes the app (app.tsx). Module Federation handles loading of remote MFEs via MicroFrontendApp.tsx. Routing is managed by routes.tsx, often with authentication checks by ProtectedRoute. Authentication is handled by EcommerceAuthProvider and related MSAL configs.

## Deep Dive
- **Type**: Web application (micro-frontend host).
- **Primary runtime(s)**: Browser (React 18, TypeScript, Node.js for development/build).
- **Entry points**:
  - `micro-frontends/host/src/main.ts`: The main entry point for the React application, which bootstraps the application.
  - `micro-frontends/host/src/routes.tsx`: Centralized routing definition for the application, including routes for dynamically loaded micro-frontends.
  - `micro-frontends/host/module-federation.config.ts`: Configures the host as a Module Federation host, although it doesn't expose any modules itself.

## Top-Level Structure
| Path | Purpose | Notes |
|---|---|---|
| `src/app/` | Main application component | Contains `app.tsx` where providers are wired. |
| `src/auth/` | Authentication logic | MSAL/Azure AD B2C configuration and utilities. |
| `src/config/` | Application configuration | Micro-frontend registry (`microFrontendRegistry.ts`). |
| `src/http/` | HTTP client utilities | `HttpClientFactory` for API calls. |
| `src/microFe/` | Micro-frontend loading logic | `MicroFrontendApp.tsx` handles dynamic loading. |
| `src/routes.tsx` | Application routing | Defines main routes and integrates with remote MFEs. |
| `src/services/` | Data fetching services | React Query hooks for various APIs. |
| `module-federation.config.ts` | Module Federation setup | Defines the host's Module Federation configuration. |

## Key Boundaries
- **Presentation**: `src/app/app.tsx` (main application shell, wiring of providers), `src/microFe/MicroFrontendApp.tsx` (MFE rendering), `src/routes.tsx` (route-driven presentation logic).
- **Application/Domain**: The host primarily orchestrates, with domain logic delegated to the loaded micro-frontends. Shared concerns like authentication (`src/auth/`) and HTTP client setup (`src/http/`) reside here.
- **Persistence/External I/O**: `src/services/` (data fetching via React Query, interacting with backend APIs), `src/http/http-client.factory.ts` (configures Axios for API calls).
- **Cross-cutting concerns**:
    - **Authentication**: `src/auth/`, `src/app/app.tsx` (Auth Provider wiring), `src/routes.tsx` (`ProtectedRoute`).
    - **Logging**: Common logging configuration (from `infrastructure/common-logging` skill) would apply.
    - **Configuration**: `src/config/microFrontendRegistry.ts` (MFE definitions), environment variables via webpack `DefinePlugin` (e.g., `NX_API_BASE_URL`).
- **Responsibilities by file/module**:
    - `micro-frontends/host/src/main.ts`: Application bootstrap.
    - `micro-frontends/host/src/app/app.tsx`: Top-level application component, context providers.
    - `micro-frontends/host/src/auth/msal/config.ts`: MSAL configuration for Azure AD B2C.
    - `micro-frontends/host/src/microFe/MicroFrontendApp.tsx`: Manages Module Federation runtime and dynamic remote loading.
    - `micro-frontends/host/src/routes.tsx`: Defines application routes and handles navigation.
    - `micro-frontends/host/src/config/microFrontendRegistry.ts`: Central registry for available micro-frontends.
- **Detailed code flows**:
    1. A request comes to the host (e.g., `http://localhost:4200/store`).
    2. `src/main.ts` initializes the React app.
    3. `src/app/app.tsx` sets up global providers, including `EcommerceAuthProvider` and `QueryClientProvider`.
    4. `src/routes.tsx` matches the URL to a route. If it's an MFE route, it delegates rendering to `MicroFrontendApp.tsx`.
    5. `MicroFrontendApp.tsx` uses `registerRemotes` from `@module-federation/runtime` and dynamically loads the specified remote micro-frontend (e.g., 'store') based on the `microFrontendRegistry.ts` configuration.
    6. The loaded remote MFE is rendered within the host's layout.
    7. API calls from the remote MFE (or host) use `HttpClientFactory` (`src/http/http-client.factory.ts`), which injects authentication tokens from `auth-provider`.
- **How the pieces map together**: The host is the central orchestrator. It uses Module Federation to load remotes, `react-router-dom` and `@tanstack/react-router` for routing, and shared packages (`@ecommerce-platform/auth-provider`, `@ecommerce-platform/app-injector`, `@ecommerce-platform/shared-layout`) for common functionalities like authentication and layout. `webpack` and `nx` manage the build and development processes.

## Files inspected
- `micro-frontends/host/src/main.ts`
- `micro-frontends/host/module-federation.config.ts`
- `micro-frontends/host/src/` (directory listing)
- `.cursor/rules/workspace/micro-frontends/host/Host.mdc`
- `micro-frontends/CLAUDE.md`