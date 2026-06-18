# Codebase Orientation Map

## 1-Line Summary
`@ecommerce-platform/auth-provider` is a React authentication package wrapping Azure AD B2C via MSAL that provides `EcommerceAuthProvider`, `AuthConsumerProvider`, auth hooks, and cross-app token broadcasting for the micro-frontend platform.

## 5-Minute Explanation
- **Primary tasks in code**: Manages the full authentication lifecycle — MSAL initialization, token acquisition/refresh via TanStack Query, auth state exposure through context and hooks, token persistence via `safeStorage`, and cross-remote auth state synchronization via a `BroadcastChannel`/custom event (`TOKEN_BROADCAST_EVENT`).
- **Primary inputs**: MSAL configuration props (`authority`, `clientId`, `knownAuthorities`, scopes, redirect URIs) and optionally debug options (`presetToken`/`presetUser`). From the host: `EcommerceAuthProviderProps`. From remotes: `AuthConsumerProviderProps` with a `HostAuthContext`.
- **Primary outputs**: Auth context (current user, token, expiry, `isAuthenticated`) via React context; auth state broadcast events; persisted token in localStorage/sessionStorage via `safeStorage`.
- **Key files**:
    - `micro-frontends/packages/auth-provider/src/index.ts`: Public barrel.
    - `micro-frontends/packages/auth-provider/src/EcommerceAuthProvider.tsx`: Full auth provider (host uses this).
    - `micro-frontends/packages/auth-provider/src/AuthConsumerProvider.tsx`: Lightweight consumer provider (remotes use this).
    - `micro-frontends/packages/auth-provider/src/AuthContext.ts`: React context definition.
    - `micro-frontends/packages/auth-provider/src/useAuth.ts`: Primary auth hook.
    - `micro-frontends/packages/auth-provider/src/hooks/`: Additional hooks (`useLogin`, `useLogout`, `useAccessToken`, `useTokenBroadcastSubscription`, etc.).
    - `micro-frontends/packages/auth-provider/src/components/`: `InternalAuthProvider`, `MsalAuthProvider`, `AuthErrorBoundary`.
    - `micro-frontends/packages/auth-provider/src/constants.ts`: `AUTH_TOKEN_KEY`, `TOKEN_BROADCAST_EVENT`, `AUTH_STATE_BROADCAST_EVENT`, `DEFAULT_SCOPES`, etc.
    - `micro-frontends/packages/auth-provider/src/utils/`: Storage helpers, token utilities, account utils.
    - `micro-frontends/packages/auth-provider/tsup.config.ts`: Builds CJS + ESM + `.d.ts`.
- **Main code paths**: Host wraps app in `EcommerceAuthProvider` (MSAL + QueryClient + context) → on login, token is acquired and stored via `safeStorage`, broadcast via `broadcastToken()` → remotes subscribe via `useTokenBroadcastSubscription()` → all components access auth state via `useAuth()`.

## Deep Dive
- **Type**: Shared library (workspace package).
- **Primary runtime(s)**: Browser (React 18+ only per peer deps; built with Node.js/tsup).
- **Entry points**:
  - `micro-frontends/packages/auth-provider/src/index.ts`: Package public API barrel.
  - `micro-frontends/packages/auth-provider/package.json`: `exports` map → `dist/index.mjs` (ESM) / `dist/index.js` (CJS).

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `src/index.ts` | Public barrel | Exports providers, hooks, context, utils, constants, types. |
| `src/EcommerceAuthProvider.tsx` | Full auth provider | Used by host; includes MSAL + QueryClient + context. |
| `src/AuthConsumerProvider.tsx` | Consumer provider | Used by remotes; receives `HostAuthContext` from host. |
| `src/AuthContext.ts` | React context | `AuthContext` and `AuthContextType`. |
| `src/useAuth.ts` | Primary auth hook | Reads from `AuthContext`. |
| `src/hooks/` | Additional hooks | `useLogin`, `useLogout`, `useAccessToken`, `useIsAuthenticated`, `useCurrentUser`, `useTokenBroadcastSubscription`, `useMsalAuth`, etc. |
| `src/components/` | Internal providers | `InternalAuthProvider`, `MsalAuthProvider`, `AuthErrorBoundary`. |
| `src/constants.ts` | Broadcast/storage keys | `AUTH_TOKEN_KEY`, `AUTH_USER_KEY`, `TOKEN_BROADCAST_EVENT`, `DEFAULT_SCOPES`, `TOKEN_EXPIRY_BUFFER_SECONDS`. |
| `src/utils/` | Helpers | Storage (`safeStorage`, `get/set/removeStoredToken`, `clearAuthStorage`), token (`getTokenExpiry`, `isTokenExpired`), account (`accountInfoToAuthUser`). |
| `src/types.ts` | TypeScript types | `AuthUser`, `AuthState`, `AuthContextType`, `EcommerceAuthProviderProps`, `DebugOptions`, `MsalConfigOptions`, `HostAuthContext`, `AuthConsumerProviderProps`, `TokenBroadcastState`. |
| `tsup.config.ts` | Build config | CJS + ESM + `.d.ts`/`.d.mts`. |
| `dist/` | Built output | Consumed by apps; must be rebuilt after edits. |

## Key Boundaries
- **Presentation**: `src/components/AuthErrorBoundary` — an error boundary for auth failures.
- **Application/Domain**: `EcommerceAuthProvider.tsx`, `AuthConsumerProvider.tsx`, `InternalAuthProvider`, `MsalAuthProvider` — the provider chain; hooks in `src/hooks/`.
- **Persistence/External I/O**: `src/utils/` storage helpers (localStorage/sessionStorage via `safeStorage`); MSAL for Azure AD B2C token acquisition; TanStack Query `QueryClient` for token refresh.
- **Cross-cutting concerns**: Token broadcasting (`broadcastToken`, `TOKEN_BROADCAST_EVENT`), `AuthErrorBoundary` for error surfaces.
- **Responsibilities by file/module**:
    - `EcommerceAuthProvider.tsx`: Full provider for the host — initializes MSAL, QueryClient, and auth context.
    - `AuthConsumerProvider.tsx`: Lightweight provider for remotes — receives `HostAuthContext` and makes it available via `AuthContext`.
    - `src/hooks/useTokenBroadcastSubscription.ts`: Remote hook to subscribe to token broadcasts from the host.
    - `src/constants.ts`: Shared keys used for storage and broadcasting — consumers must use these constants.
    - `src/utils/`: Storage and token helpers — used internally and exportable for consumers.
- **Detailed code flows**:
    1. Host wraps the app in `EcommerceAuthProvider` with MSAL config props.
    2. `EcommerceAuthProvider` initializes MSAL (`MsalAuthProvider`) and wraps with `InternalAuthProvider` and `AuthContext`.
    3. User logs in → MSAL acquires token → token stored via `safeStorage` under `AUTH_TOKEN_KEY` → `broadcastToken()` dispatches `TOKEN_BROADCAST_EVENT`.
    4. Each remote's `AuthConsumerProvider` receives `HostAuthContext` from the host via `AppInjectorProps`.
    5. Remotes optionally subscribe to token updates via `useTokenBroadcastSubscription()`.
    6. All components call `useAuth()` to read `{ user, token, isAuthenticated, ... }` from `AuthContext`.
- **How the pieces map together**: `EcommerceAuthProvider` (host) and `AuthConsumerProvider` (remotes) both write to the same `AuthContext`; hooks read from it. Token state crosses the MF boundary via a `BroadcastChannel`/custom event and the `hostAuthContext` passed through `AppInjectorProps`.

## Configuration
- Configured via props (no `NX_*` env vars):
  - `EcommerceAuthProviderProps`: `authority`, `clientId`, `knownAuthorities`, `scopes`, `redirectUri`, `postLogoutRedirectUri`, `debug` (`DebugOptions`).
  - `DebugOptions`: `presetToken`, `presetUser` — bypasses MSAL for local development.
- Storage keys: `AUTH_TOKEN_KEY`, `AUTH_TOKEN_EXPIRY_KEY`, `AUTH_USER_KEY` (from `src/constants.ts`).
- Broadcast events: `TOKEN_BROADCAST_EVENT`, `AUTH_STATE_BROADCAST_EVENT` (from `src/constants.ts`).
- `TOKEN_EXPIRY_BUFFER_SECONDS`: Buffer before considering a token expired.
- `DEFAULT_SCOPES`: Default OAuth scopes array.

## Interfaces & Contracts
- **`EcommerceAuthProvider`**: Host-level provider; accepts `EcommerceAuthProviderProps` (MSAL config + debug options).
- **`AuthConsumerProvider`**: Remote-level provider; accepts `AuthConsumerProviderProps` (wraps `HostAuthContext`).
- **`useAuth()`** → `AuthContextType`: `{ user, token, isAuthenticated, isLoading, login, logout, ... }`.
- **`useTokenBroadcastSubscription()`**: Subscribes remotes to cross-app token updates.
- **`broadcastToken(token, expiry)`**: Dispatches `TOKEN_BROADCAST_EVENT` for remotes.
- **`HostAuthContext`**: `{ user, token, tokenExpiry, isAuthenticated, requestTokenRefresh, onLogout? }` — the shape passed from host to remotes via `AppInjectorProps`.
- Full hook list: `useAuth`, `useLogin`, `useLogout`, `useAccessToken`, `useIsAuthenticated`, `useCurrentUser`, `useAuthLoading`, `useUserDisplayName`, `useUserEmail`, `useMsalAuth`, `useTokenBroadcastSubscription`.

## Data & State
- Owns **auth state**: current `AuthUser`, `token`, `tokenExpiry`, `isAuthenticated`, `isLoading`.
- Uses **TanStack Query `QueryClient`** for token acquisition/refresh mutations.
- Persists token/user to storage via `safeStorage` utilities.
- Cross-app sync is event-based: `broadcastToken` → `TOKEN_BROADCAST_EVENT` → `useTokenBroadcastSubscription`.

## Dependencies
- Runtime deps: `@azure/msal-browser` `^3.27.0`, `@azure/msal-react` `^2.1.1`, `@tanstack/react-query` `^5.52.1`.
- Peer deps: `react` / `react-dom` `>=18.0.0` — **React 18+ only**.
- Consumed by: host (`EcommerceAuthProvider`), all remotes (`AuthConsumerProvider`, hooks). Also a **peer dependency of `@ecommerce-platform/shared-layout`**.

## Patterns
- Host uses `EcommerceAuthProvider`; remotes use `AuthConsumerProvider` with `HostAuthContext` from `AppInjectorProps`.
- Consume auth state through the exported hooks — do not access MSAL APIs directly.
- For local dev without Azure AD B2C, use the `debug` prop with `presetToken`/`presetUser`.
- Must be rebuilt after source changes: `npm run build:auth-provider` from `micro-frontends/`.

## Gotchas & Owners
- **React 18+ only** — peer deps require `>=18.0.0`, stricter than `app-injector`'s `>=16.8.0`.
- MSAL `authority` must be the exact Azure AD B2C URL; `knownAuthorities` must be set; scopes vary per backend API.
- A `QueryClient` must be in the provider tree for token refresh — do not remove it.
- Token refresh depends on `@tanstack/react-query` — mismatching query key invalidation breaks refresh.
- Stale `dist/` after source edits will silently serve old behavior to consumers.
- **Owners**: `frontend-developer` — owns the auth provider, hooks, and MSAL/Query wiring.

## Files Inspected
- `micro-frontends/packages/auth-provider/src/index.ts` (via CLAUDE.md)
- `micro-frontends/packages/auth-provider/src/` (directory listing)
- `micro-frontends/packages/auth-provider/CLAUDE.md`
