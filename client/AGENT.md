# Codebase Orientation Map

## 1-Line Summary
The `client` directory contains a legacy Angular single-page application (SPA) for the e-commerce platform's frontend.

## 5-Minute Explanation
- **Primary tasks in code**: Handles product browsing, shopping cart, checkout process, and user account management.
- **Primary inputs**: HTTP requests from the user, responses from the API Gateway, and Azure AD B2C authentication events.
- **Primary outputs**: Rendered UI in the browser, HTTP requests to the API Gateway, and authentication requests to Azure AD B2C.
- **Key files**:
    - `client/src/app/`: Contains feature modules like `home/`, `store/`, `basket/`, `checkout/`, `account/`, `core/` (navbar, footer, header, guards, interceptors, services), and `shared/` (models, order-summary, shared services).
    - `client/src/main.ts`: Application entry point.
    - `client/angular.json`: Angular CLI configuration for build, serve, and test.
    - `client/package.json`: Defines project dependencies and scripts.
- **Main code paths**: User interaction -> Angular components -> Services (business logic, state management) -> HTTP Interceptors -> API Gateway -> Backend services.

## Deep Dive
- **Type**: Web application (Single-Page Application - SPA)
- **Primary runtime(s)**: Browser (Angular, TypeScript, JavaScript)
- **Entry points**:
    - `client/src/main.ts`: Bootstraps the Angular application.
    - `client/src/index.html`: The main HTML file served by the application.
    - `client/src/app/app-routing.module.ts`: Defines top-level application routes.

## Top-Level Structure
| Path | Purpose | Notes |
|---|---|---|
| `client/src/app/` | Angular application modules | Core features, shared components, and services |
| `client/src/assets/` | Static assets | Images, etc. |
| `client/src/environments/` | Environment-specific configurations | `environment.ts` (dev) and `environment.prod.ts` (prod) |
| `client/` | Project configuration and build scripts | `angular.json`, `package.json`, `generate-env.cjs` |

## Key Boundaries
- **Presentation**: `client/src/app/**/*.html`, `client/src/app/**/*.scss`, `client/src/app/**/*.ts` (component logic)
- **Application/Domain**: `client/src/app/**/*.service.ts`, `client/src/app/**/models/*.ts`
- **Persistence/External I/O**: Angular services making HTTP requests (e.g., `store.service.ts`, `basket.service.ts`), `core/interceptors/error.interceptor.ts`, `core/interceptors/loading.interceptor.ts`.
- **Cross-cutting concerns**:
    - **Authentication**: `core/guards/auth.guard.ts`, `account/acnt.service.ts`, and MSAL related dependencies.
    - **Loading/Spinner**: `core/services/loading.service.ts`, `core/interceptors/loading.interceptor.ts`.
    - **Error Handling**: `core/interceptors/error.interceptor.ts`.
- **Responsibilities by file/module**:
    - `client/src/app/store/`: Manages product listing, details, and adding products.
    - `client/src/app/basket/`: Handles shopping cart logic.
    - `client/src/app/checkout/`: Manages the checkout process.
    - `client/src/app/account/`: Manages user authentication and account-related features.
    - `client/src/app/core/`: Contains core application services, guards, interceptors, and layout components.
    - `client/src/app/shared/`: Houses reusable components, models, and services.
- **Detailed code flows**:
    1. User navigates to a route (e.g., `/store`).
    2. `app-routing.module.ts` or `store-routing.module.ts` directs to `StoreComponent`.
    3. `StoreComponent` injects `StoreService`.
    4. `StoreService` makes an HTTP request to the API Gateway to fetch products.
    5. Request goes through `loading.interceptor.ts` and `error.interceptor.ts`.
    6. Response is received, `StoreService` updates its state.
    7. `StoreComponent` updates the UI based on the service's state.
- **How the pieces map together**: Angular modules (`*.module.ts`) define component, service, and routing relationships. Services communicate via method calls and Observables (RxJS). Interceptors modify HTTP requests/responses globally.
- **Files inspected**:
    - `client/package.json`
    - `client/angular.json`
    - `client/amplify.yml`
    - `client/generate-env.cjs`
    - `client/CLAUDE.md`
    - `client/src/main.ts`
    - `client/src/index.html`
    - `client/src/app/app.module.ts`
    - `client/src/app/app-routing.module.ts`
    - `client/src/app/core/interceptors/error.interceptor.ts`
    - `client/src/app/core/interceptors/loading.interceptor.ts`
    - `client/src/app/store/store.component.ts`
    - `client/src/app/store/store.service.ts`
    - `client/src/app/basket/basket.service.ts`
    - `client/src/app/checkout/checkout.service.ts`
    - `client/src/app/account/acnt.service.ts`
    - `client/src/app/core/guards/auth.guard.ts`

## Gotchas & Owners

- **Legacy — confirm before investing**: This SPA is being superseded by `micro-frontends/`. Prefer new UI work there; confirm with the owner before adding features here.
- **Linting is intentionally disabled**: `lint` and `lint:fix` scripts in `package.json` echo a message and exit 0. `angular.json` defines a real `@angular-eslint/builder:lint` target, but `npm run lint` bypasses it entirely.
- **`npm run build` defaults to production**: `defaultConfiguration: production` in `angular.json` means a plain `ng build` applies budgets, file replacements, and all prod optimizations immediately.
- **Production bundle budgets are enforced**: initial bundle warn 1 MB / error 2 MB; component style warn 10 KB / error 20 KB. Large dependency additions can fail `build:prod`.
- **`environment.prod.ts` is generated — do not hand-edit**: `generate-env.cjs` overwrites it on every `build:prod` run. Change the script or the upstream env vars, not the file.
- **Hardcoded Azure B2C fallback in `generate-env.cjs`**: if `AZURE_B2C_CLIENT_ID`, `AZURE_B2C_AUTHORITY`, or `AZURE_B2C_KNOWN_AUTHORITY` are unset, the script silently falls back to hardcoded values for the `nexttechuit.b2clogin.com` tenant (client ID `d0dafab9-cae6-426d-a516-eab88853767c`).
- **`--legacy-peer-deps` required on install**: `amplify.yml` specifies `npm install --legacy-peer-deps`; local installs need the same flag due to peer-dependency conflicts in the Angular 21 + ngx-bootstrap 21 combination.
- **Deployment target**: AWS Amplify (`amplify.yml`); artifacts from `dist/client/`.
- **Owner / agent**: `frontend-developer` — owns Angular feature/UI work in this SPA.
