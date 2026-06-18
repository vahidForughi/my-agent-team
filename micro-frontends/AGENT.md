# Codebase Orientation Map

## 1-Line Summary
The modern frontend: an NX monorepo of React apps composed at runtime with Webpack 5 Module Federation.

## 5-Minute Explanation
- **Primary tasks in code**: The MicroFrontends codebase manages the entire user interface of the e-commerce platform. This includes hosting the main application shell, loading remote micro-frontends (store, checkout, account, admin), and providing shared functionalities like authentication, layout, and dependency injection.
- **Primary inputs**: User interactions (clicks, form submissions), backend API responses, authentication tokens from Azure AD B2C, and internal events for inter-micro-frontend communication.
- **Primary outputs**: Rendered user interface, HTTP requests to backend APIs, authentication state updates, and published events.
- **Key files**:
    - `micro-frontends/host/`: The main host application that orchestrates other micro-frontends.
    - `micro-frontends/store/`: The product catalog and shopping experience micro-frontend.
    - `micro-frontends/checkout/`: The checkout process micro-frontend.
    - `micro-frontends/account/`: The user account management micro-frontend.
    - `micro-frontends/admin/`: The administration panel micro-frontend.
    - `micro-frontends/packages/`: Contains shared libraries for authentication, app injection, and shared UI components.
    - `micro-frontends/package.json`: Defines the overall build, run, and test scripts for the monorepo.
    - `micro-frontends/host/src/config/microFrontendRegistry.ts`: Central registry for micro-frontend configuration.
- **Main code paths**: The `host` application starts, loads its configuration including the `microFrontendRegistry.ts`. It then dynamically loads other remote micro-frontends (store, checkout, etc.) as needed using Webpack Module Federation. User authentication flows through the `@ecommerce-platform/auth-provider` package.

## Deep Dive
- **Type**: monorepo
- **Primary runtime(s)**: browser, Node.js (for build/dev operations)
- **Entry points**:
  - `micro-frontends/host/src/main.ts`: This is the main entry point for the host application, responsible for initializing the React application and setting up the Module Federation environment.
  - `micro-frontends/host/src/config/microFrontendRegistry.ts`: This file acts as a central configuration for all micro-frontends, defining their names, remote entry points, and base paths for routing.
  - `micro-frontends/package.json`: This file defines the npm scripts for setting up the monorepo, building individual packages and applications, running development servers, and executing tests.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `host/` | Host application | Orchestrates other micro-frontends, handles routing and authentication context. |
| `store/` | Store micro-frontend | Implements product catalog, browsing, and shopping cart functionalities. |
| `checkout/` | Checkout micro-frontend | Manages the checkout process. |
| `account/` | Account micro-frontend | Handles user account management and profiles. |
| `admin/` | Admin micro-frontend | Provides administrative interfaces. |
| `packages/` | Shared libraries | Contains reusable components and utilities (e.g., app-injector, auth-provider, shared-layout). |
| `e2e/` | Playwright tests | End-to-end tests for the micro-frontends. |

## Key Boundaries
- **Presentation**: `host/`, `store/`, `checkout/`, `account/`, `admin/`, `packages/shared-layout`. These directories contain the React components and UI logic for each part of the application.
- **Application/Domain**: Each micro-frontend (`store`, `checkout`, `account`, `admin`) effectively represents a distinct application domain with its own logic and responsibilities. The `host` application serves as the integration layer.
- **Persistence/External I/O**: Communication with the backend is primarily done via an API gateway, configured through `NX_API_BASE_URL`. Authentication against Azure AD B2C is handled by the `auth-provider` package. Data persistence for client-side state uses Zustand, while server state is managed by TanStack Query.
- **Cross-cutting concerns**:
    - Authentication: Handled by `packages/auth-provider`.
    - Shared Layout/Navigation: Provided by `packages/shared-layout`.
    - Micro-frontend Injection: Managed by `packages/app-injector`.
- **Responsibilities by file/module**:
    - `micro-frontends/host`: Responsible for bootstrapping the entire micro-frontend application, managing global routing, and providing a shared authentication context to other micro-frontends.
    - `micro-frontends/store`: Focuses on displaying products, handling user search and filtering, and managing the shopping cart state.
    - `micro-frontends/checkout`: Manages the steps and logic involved in completing a purchase, including shipping, payment, and order confirmation.
    - `micro-frontends/account`: Provides functionality for users to manage their profiles, view order history, and update personal information.
    - `micro-frontends/admin`: Offers tools and interfaces for administrators to manage products, orders, users, and other platform-level configurations.
    - `micro-frontends/packages/app-injector`: Provides mechanisms for dynamically mounting and unmounting micro-frontends within the host application.
    - `micro-frontends/packages/auth-provider`: Encapsulates the logic for user authentication using MSAL and Azure AD B2C, providing hooks and context for auth state.
    - `micro-frontends/packages/shared-layout`: Contains common UI components like the navigation bar, footer, and other elements that are consistent across all micro-frontends.
- **Detailed code flows**:
  1. A user navigates to the e-commerce platform, which loads the `host` application (`micro-frontends/host/src/main.ts`).
  2. The `host` application initializes Module Federation and consults `microFrontendRegistry.ts` to determine which micro-frontends are available and their entry points.
  3. The `host` uses `packages/auth-provider` to establish the user's authentication state, potentially redirecting to Azure AD B2C for login.
  4. As the user navigates through the application, the `host` dynamically loads and mounts the relevant micro-frontends (e.g., `store` for product browsing, `checkout` for purchasing) using the functionality provided by `packages/app-injector`.
  5. Shared UI elements from `packages/shared-layout` are rendered by the host, providing a consistent user experience.
  6. Individual micro-frontends make API calls to the backend gateway to fetch and update data within their respective domains.
- **How the pieces map together**: The micro-frontends are composed at runtime using Webpack Module Federation, orchestrated by the `host` application. Shared functionalities and UI elements are provided through internal `@ecommerce-platform/*` packages. Backend communication is centralized through an API gateway, and authentication is handled by a dedicated provider.
- **Files inspected**:
    - `micro-frontends/package.json`
    - `micro-frontends/CLAUDE.md`
    - `micro-frontends/host/src/main.ts`
    - `micro-frontends/host/src/config/microFrontendRegistry.ts`
    - `micro-frontends/host/src/microFe/MicroFrontendApp.tsx`
    - `micro-frontends/packages/auth-provider/CLAUDE.md`
    - `micro-frontends/packages/shared-layout/CLAUDE.md`
    - `micro-frontends/packages/app-injector/CLAUDE.md`
    - `micro-frontends/nx.json`
