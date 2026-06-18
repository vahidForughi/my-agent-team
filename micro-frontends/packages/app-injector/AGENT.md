# Codebase Orientation Map

## 1-Line Summary
`@ecommerce-platform/app-injector` is a pure React mounting utility package that provides `createAppInjector` and `createEnhancedAppInjector` factories for mounting/unmounting micro-frontend components into DOM containers, with React 16/17/18 auto-detection and optional retry logic.

## 5-Minute Explanation
- **Primary tasks in code**: Provides two injector factories — `createAppInjector` (synchronous, basic) and `createEnhancedAppInjector` (async with retry/timeout/callbacks) — that mount a given React component into a DOM element by ID and unmount it on demand.
- **Primary inputs**: A React component constructor and DOM element IDs; optionally `AppInjectorProps` (config with `appContext`, `onNavigate`, `onLogout`, `onError`).
- **Primary outputs**: A mounted React component tree in the target DOM element; an `AppInjector` or `EnhancedAppInjector` object exposing `inject`/`unmount` (and `isInjected` for enhanced).
- **Key files**:
    - `micro-frontends/packages/app-injector/src/index.ts`: Public barrel — re-exports everything.
    - `micro-frontends/packages/app-injector/src/createAppInjector.tsx`: Basic injector factory.
    - `micro-frontends/packages/app-injector/src/createEnhancedAppInjector.tsx`: Enhanced injector with retry/timeout.
    - `micro-frontends/packages/app-injector/src/types.ts`: All TypeScript types and interfaces.
    - `micro-frontends/packages/app-injector/src/env.ts`: Environment detection and configuration helpers.
    - `micro-frontends/packages/app-injector/src/utils.ts`: `delay`, `waitForElement` utilities.
    - `micro-frontends/packages/app-injector/tsup.config.ts`: Builds CJS + ESM + `.d.ts`.
- **Main code paths**: Consumer calls `createAppInjector(MyComponent)` → returns an object with `inject(id, props)` and `unmount(id)`. `inject` finds the DOM element by ID, auto-detects React version (`createRoot` for 18+, `render` for 16/17), mounts `MyComponent` with `props`, and stores the root reference on the element. `unmount` retrieves the root and unmounts it.

## Deep Dive
- **Type**: Shared library (workspace package).
- **Primary runtime(s)**: Browser (consumed by React apps; built with Node.js/tsup).
- **Entry points**:
  - `micro-frontends/packages/app-injector/src/index.ts`: Package public API barrel.
  - `micro-frontends/packages/app-injector/package.json`: `exports` map → `dist/index.mjs` (ESM) / `dist/index.js` (CJS); built by `tsup`.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `src/index.ts` | Public barrel | Re-exports injectors, utils, env helpers, types. |
| `src/createAppInjector.tsx` | Basic injector factory | Synchronous; React 16/17/18 compatible. |
| `src/createEnhancedAppInjector.tsx` | Enhanced injector factory | Async; retry/timeout/callbacks. |
| `src/types.ts` | Type definitions | `AppInjectorProps`, `AppContext`, `User`, `MicroFrontendConfig`, injector interfaces, env types. |
| `src/env.ts` | Environment helpers | `getEnvironment`, `isProductionEnv`, `getApiBaseUrl`, `configureEnvironment`, etc. |
| `src/utils.ts` | Utilities | `delay`, `waitForElement`. |
| `tsup.config.ts` | Build config | Emits CJS + ESM + `.d.ts`/`.d.mts`; `treeshake: true`. |
| `dist/` | Built output | Consumed by apps; must be rebuilt after source changes. |

## Key Boundaries
- **Presentation**: None — this is a pure utility package with no UI.
- **Application/Domain**: `createAppInjector.tsx` and `createEnhancedAppInjector.tsx` — the core mounting logic.
- **Persistence/External I/O**: None — no network calls, no storage. Manages only the React root lifecycle on DOM nodes.
- **Cross-cutting concerns**: Environment detection via `src/env.ts`; type definitions for `AppContext`/`User`/`MicroFrontendConfig` used across all remotes.
- **Responsibilities by file/module**:
    - `src/createAppInjector.tsx`: Synchronous mount/unmount; React version auto-detection via `InjectorContainer.__root`.
    - `src/createEnhancedAppInjector.tsx`: Async mount with `maxRetries`, `retryDelay`, `elementTimeout`, `onSuccess`/`onFailure` callbacks; `isInjected` check.
    - `src/types.ts`: Defines `AppInjectorProps` (the contract every remote's `inject` function accepts), `AppContext`, `User`, `MicroFrontendConfig`, `InjectorContainer`, `AppInjector`, `EnhancedAppInjector`, `InjectorOptions`, `Environment`, `EnvironmentConfig`.
    - `src/env.ts`: Provides `getApiBaseUrl()`, `configureEnvironment()`, `getEnvironmentConfig()`, `resetEnvironmentConfig()`, `createEnvironmentDetector()`.
    - `src/utils.ts`: `delay(ms)` and `waitForElement(id, timeout)` — used internally by the enhanced injector.
- **Detailed code flows**:
    1. Consumer calls `createAppInjector(MyComponent)` → returns `{ inject, unmount }`.
    2. `inject(elementId, props)`: finds `document.getElementById(elementId)`, checks React version, calls `createRoot(el).render(<MyComponent {...props} />)` (React 18) or `render(<MyComponent {...props} />, el)` (older), stores root on `el.__root`.
    3. `unmount(elementId)`: finds `el.__root`, calls `root.unmount()` (React 18) or `unmountComponentAtNode(el)`.
    4. Enhanced variant wraps step 2 in a retry loop using `waitForElement` and `delay` utilities.
- **How the pieces map together**: `src/types.ts` defines the contract; `createAppInjector.tsx` and `createEnhancedAppInjector.tsx` implement it; `src/env.ts` and `src/utils.ts` are support modules; `src/index.ts` re-exports all. The `dist/` is committed and consumed by the NX apps directly.

## Configuration
- No build-time env vars. Environment detection uses `window.location.hostname` at runtime.
- Configurable at runtime via `configureEnvironment(config)` / `getEnvironmentConfig()` / `resetEnvironmentConfig()` from `src/env.ts`.
- `InjectorOptions` controls enhanced injector behavior: `maxRetries` (default 3), `retryDelay` (default 1000ms), `elementTimeout` (default 5000ms), `debug`, `onSuccess`, `onFailure`.

## Interfaces & Contracts
- **`createAppInjector(Component)`** → `AppInjector` (`{ inject(id, props?), unmount(id) }`).
- **`createEnhancedAppInjector(Component, options?)`** → `EnhancedAppInjector` (`{ inject(id, props?): Promise<void>, unmount(id), isInjected(id) }`).
- **`AppInjectorProps`**: `{ config?: MicroFrontendConfig }` — passed to every remote's mounted component.
- **`MicroFrontendConfig`**: `{ appContext?, onNavigate?, onLogout?, onError? }`.
- **`AppContext`**: `{ user?, token?, theme?, locale?, basePath?, apiBaseUrl?, ... }`.
- **`User`**: `{ id?, email?, username?, firstName?, lastName?, displayName?, phone?, avatar?, role?, ... }`.

## Data & State
- Pure utility package — owns no client or server state. Manages only the React root lifecycle stored on `InjectorContainer.__root`.

## Dependencies
- Peer deps: `react` / `react-dom` `>=16.8.0`. No other runtime dependencies.
- Consumed by: all MFE apps (host, store, account, admin, checkout) as `@ecommerce-platform/app-injector`. The `store` app's `webpack.config.ts` aliases it directly to `dist/index.js`.

## Patterns
- React-version-agnostic by design — auto-detects `createRoot` vs `render`; do not bypass this.
- Use `createEnhancedAppInjector` when the target container may not yet exist (async pages, dynamic layouts).
- Components mounted by the injector should accept `AppInjectorProps` — see `src/types.ts`.
- Must be rebuilt after source changes: `npm run build:app-injector` from `micro-frontends/`.

## Gotchas & Owners
- The `dist/` directory is a build artifact consumed directly — stale `dist` files cause subtle type and runtime bugs; always rebuild after editing source.
- `createEnhancedAppInjector`'s `inject` returns a `Promise<void>` — it **must be awaited** or errors are silently lost.
- Do not hardcode `createRoot` or `render`; the package's auto-detection handles both.
- `sideEffects: false` in `package.json` — safe for tree-shaking; do not add side effects at module level.
- **Owners**: `frontend-developer` — owns the mounting utility and its consumer integration.

## Files Inspected
- `micro-frontends/packages/app-injector/src/index.ts` (via CLAUDE.md)
- `micro-frontends/packages/app-injector/src/types.ts`
- `micro-frontends/packages/app-injector/src/` (directory listing)
- `micro-frontends/packages/app-injector/CLAUDE.md`
