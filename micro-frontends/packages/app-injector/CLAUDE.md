# app-injector — `@ecommerce-platform/app-injector`

## What & why

A small, framework-agnostic utility package for mounting/unmounting React micro-frontends into DOM
containers. It auto-detects the React version (uses `createRoot` for 18+, falls back to `render`
for 16/17) and offers an enhanced variant with retry/timeout logic for containers that don't exist
yet. This is the standard way remotes get injected into the host shell.

## Where it lives

`micro-frontends/packages/app-injector/` (`package.json` `name: @ecommerce-platform/app-injector`,
`version: 1.0.0`).

- `src/index.ts` — public barrel (re-exports injectors, utils, env helpers, types).
- `src/createAppInjector.ts`, `src/createEnhancedAppInjector.ts` — the two injector factories.
- `src/env.ts`, `src/utils.ts`, `src/types.ts` — environment detection, helpers, type definitions.
- `tsup.config.ts` — build config. `dist/` — built output (committed dependency for consumers).

## Tech stack

From `packages/app-injector/package.json` and `tsup.config.ts`:

- **Build:** tsup `^8.0.0`, TypeScript `^5.3.0`. Emits `cjs` + `esm` + `.d.ts`/`.d.mts`
  (`format: ['cjs','esm']`, `dts: true`, `sourcemap: true`, `treeshake: true`, `minify: false`),
  with `.js`/`.mjs` output extensions and `jsx: 'automatic'`.
- **Peer deps:** `react` / `react-dom` `>=16.8.0` (both required). **No runtime dependencies.**
- `react`, `react-dom`, `react-dom/client` are marked `external` in tsup so they aren't bundled.
- `engines.node` `>=16.0.0`; `sideEffects: false`.

## Build / run / test

```bash
# From micro-frontends root (installs + builds the package):
npm run build:app-injector        # cd packages/app-injector && npm install && npm run build

# Direct, inside the package:
cd micro-frontends/packages/app-injector
npm run build         # tsup → dist (cjs + esm + d.ts)
npm run build:watch   # tsup --watch
npm run typecheck     # tsc --noEmit
npm run clean         # rm -rf dist
```

No unit-test script is defined — _not found in `packages/app-injector/package.json` scripts_
(only `build`, `build:watch`, `typecheck`, `clean`, `prepublishOnly`, `release`).

## Configuration

No build-time env vars of its own. At runtime it exposes environment helpers
(`getEnvironment()`, `isProductionEnv()`, `isStagingEnv()`, `isDevelopmentEnv()`,
`getApiBaseUrl()`, `configureEnvironment()`, `getEnvironmentConfig()`, `resetEnvironmentConfig()`,
`createEnvironmentDetector()`) so consumers can read/override environment detection
(see `src/env.ts`).

## Interfaces & contracts

Public surface from `src/index.ts`:

- **Injectors:** `createAppInjector()`, `createEnhancedAppInjector()` (retry/timeout/callbacks).
- **Utils:** `delay`, `waitForElement`.
- **Env helpers:** see Configuration.
- **Types:** `User`, `AppContext`, `MicroFrontendConfig`, `AppInjectorProps`, `InjectorContainer`,
  `AppInjector`, `EnhancedAppInjector`, `InjectorOptions`, `Environment`, `EnvironmentConfig`.

Consumed via the package `exports` map (`import` → `dist/index.mjs`, `require` → `dist/index.js`).

## Data & state

Pure utility package — it owns no client/server state and has no caches. It manages only the
React root lifecycle (mount/unmount) for the components it injects. No Zustand/TanStack Query here.

## Dependencies

- **Imported by** the micro-frontend apps (host + remotes) to mount remotes. The `store` app even
  aliases it directly to the built file in `store/webpack.config.ts`
  (`@ecommerce-platform/app-injector` → `../packages/app-injector/dist/index.js`).
- Depends only on the host app providing `react`/`react-dom` (peer deps); no other workspace
  packages.

## Patterns

- Components mounted by the injector should accept `AppInjectorProps` (optional `config` with
  `appContext`, `onNavigate`, etc.) — see `src/types.ts`.
- Use `createEnhancedAppInjector()` when the target container may not exist yet; it retries with
  configurable `maxRetries`/`retryDelay`/`elementTimeout` (await the promises it returns).

## Gotchas

- Injection requires the target container element to exist in the DOM; the enhanced injector returns
  promises that **must be awaited**.
- It is **React-version-agnostic by design** — don't hardcode `createRoot`/`render`; let the package
  detect the version.
- It is a **build dependency** of the apps — rebuild it (`npm run build:app-injector`) after edits or
  consumers will see stale `dist` types/behavior.

## Owners / agents

- **frontend-developer** — owns this React mounting utility and its consumer integration.
