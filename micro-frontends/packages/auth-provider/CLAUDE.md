# auth-provider — `@ecommerce-platform/auth-provider`

## What & why

A reusable React authentication provider wrapping Azure AD B2C via MSAL. It handles token
acquisition/refresh, exposes an auth context + hooks, and broadcasts token updates so the host can
share auth state with all remotes. Includes a debug mode to bypass MSAL during local development.

## Where it lives

`micro-frontends/packages/auth-provider/` (`package.json` `name: @ecommerce-platform/auth-provider`,
`version: 1.2.6`).

- `src/index.ts` — public barrel (providers, hooks, context, utils, constants, types).
- `src/EcommerceAuthProvider.tsx`, `src/AuthConsumerProvider.tsx` — the two top-level providers.
- `src/components/` — `InternalAuthProvider`, `MsalAuthProvider`, `AuthErrorBoundary`.
- `src/hooks/`, `src/useAuth.ts`, `src/AuthContext.ts` — hooks + context.
- `src/utils/`, `src/constants/`, `src/types.ts` — helpers, broadcast/storage keys, types.
- `tsup.config.ts` — build config. `dist/` — built output consumed by apps.

## Tech stack

From `packages/auth-provider/package.json` and `tsup.config.ts`:

- **Build:** tsup `^8.0.0`, TypeScript `^5.3.0`. Emits `cjs` + `esm` + types (same tsup pattern as
  the other packages). `engines.node` `>=16.0.0`; `sideEffects: false`.
- **Peer deps:** `react` / `react-dom` `>=18.0.0` (both required) — **React 18+ only**, stricter
  than app-injector.
- **Runtime deps:** `@azure/msal-browser` `^3.27.0`, `@azure/msal-react` `^2.1.1`,
  `@tanstack/react-query` `^5.52.1`.

## Build / run / test

```bash
# From micro-frontends root:
npm run build:auth-provider       # cd packages/auth-provider && npm install && npm run build

# Direct, inside the package:
cd micro-frontends/packages/auth-provider
npm run build         # tsup → dist
npm run build:watch   # tsup --watch
npm run typecheck     # tsc --noEmit
npm run clean         # rm -rf dist
```

No unit-test script is defined — _not found in `packages/auth-provider/package.json` scripts_
(only `build`, `build:watch`, `typecheck`, `clean`, `prepublishOnly`, `release`).

## Configuration

Configured via props, not env vars (no `NX_*`/build vars of its own):

- MSAL config is passed in via `MsalConfigOptions` / `EcommerceAuthProviderProps` — `authority`,
  `knownAuthorities`, `clientId`, scopes, redirect URIs (see `src/types.ts`).
- **Debug mode:** `debug` prop with `presetToken`/`presetUser` (`DebugOptions`) bypasses MSAL for
  local dev; helpers `createDebugUser`/`createDebugAuthState` back it.
- Storage/broadcast keys are exported constants: `AUTH_TOKEN_KEY`, `AUTH_TOKEN_EXPIRY_KEY`,
  `AUTH_USER_KEY`, `TOKEN_BROADCAST_EVENT`, `AUTH_STATE_BROADCAST_EVENT`,
  `TOKEN_EXPIRY_BUFFER_SECONDS`, `DEFAULT_SCOPES` (from `src/constants/`).

## Interfaces & contracts

Public surface from `src/index.ts`:

- **Providers:** `EcommerceAuthProvider` (full: MSAL + QueryClient + context),
  `AuthConsumerProvider` (lightweight consumer), plus internals `InternalAuthProvider`,
  `MsalAuthProvider`, `AuthErrorBoundary`.
- **Hooks:** `useAuth`, `useLogin`, `useLogout`, `useAccessToken`, `useIsAuthenticated`,
  `useCurrentUser`, `useAuthLoading`, `useUserDisplayName`, `useUserEmail`, `useMsalAuth`,
  `useTokenBroadcastSubscription`; plus `broadcastToken` and `AuthContext`.
- **Utils:** account/token/storage helpers (`accountInfoToAuthUser`, `getTokenExpiry`,
  `isTokenExpired`, `safeStorage`, `get/set/removeStoredToken`, `clearAuthStorage`, …).
- **Types:** `AuthUser`, `DebugOptions`, `MsalConfigOptions`, `AuthState`, `AuthContextType`,
  `EcommerceAuthProviderProps`, `InternalAuthProviderProps`, `TokenBroadcastEventDetail`,
  `TokenBroadcastState`, `HostUser`, `HostAuthContext`, `AuthConsumerProviderProps`.

## Data & state

Owns **auth state** (current user, token, expiry) exposed through `AuthContext` and the hooks. Uses
a **TanStack Query `QueryClient`** for token acquisition/refresh, and persists token/user via the
`safeStorage` utilities under the exported storage keys. Cross-app sync is event-based:
`broadcastToken` dispatches `TOKEN_BROADCAST_EVENT`; remotes subscribe via
`useTokenBroadcastSubscription()`.

## Dependencies

- **Imported by** the host (wraps the app in `EcommerceAuthProvider`) and by remotes/consumers; it
  is also a **peer dependency of `@ecommerce-platform/shared-layout`**.
- Depends on **Azure AD B2C** (via MSAL) and requires a **TanStack Query `QueryClient`** in the
  provider tree for token refresh.

## Patterns

- The host wraps the app in `EcommerceAuthProvider` and broadcasts token updates; remotes stay in
  sync by subscribing via `useTokenBroadcastSubscription()`. Use `AuthConsumerProvider` for the
  lightweight consumer case.
- Consume auth through the hooks rather than touching MSAL directly.
- For local dev without Azure AD, use the `debug` prop (`presetToken`/`presetUser`).

## Gotchas

- **React 18+ only** (peer deps `>=18`) — stricter than app-injector's `>=16.8`.
- MSAL `authority` must be the exact Azure AD B2C URL with `knownAuthorities` set; scopes vary per
  backend API and some configs need an explicit `postLogoutRedirectUri`.
- Token refresh depends on a `QueryClient` being present in the provider tree — don't remove it.
- Built with tsup; rebuild (`npm run build:auth-provider`) after edits since apps consume `dist`.

## Owners / agents

- **frontend-developer** — owns the auth provider, hooks, and MSAL/Query wiring.
