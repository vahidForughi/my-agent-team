# shared-layout — `@ecommerce-platform/shared-layout`

## What & why

Shared UI/layout package providing consistent branding and navigation across every micro-frontend:
`Layout`, `Navbar`, `Footer`, `CartPreview`, `LanguageSwitcher`, plus navigation utilities that work
in both **standalone** and **hosted (MFE)** modes. Centralizes Ant Design theming so apps don't
re-implement chrome.

## Where it lives

`micro-frontends/packages/shared-layout/` (`package.json` `name: @ecommerce-platform/shared-layout`,
`version: 1.0.1`).

- `src/index.ts` — public barrel (components, nav utils, constants, types).
- `src/components/` — `Layout`, `Navbar/Navbar`, `Footer`, `CartPreview`, `LanguageSwitcher`.
- `src/utils/navigation.ts`, `src/utils/navigation-handler.ts` — mode-aware navigation helpers.
- `src/constants/` — `theme` (`themeConfig`), `navbar`, `footer` constants.
- `tsup.config.ts` — build config. `dist/` — built output consumed by apps.

## Tech stack

From `packages/shared-layout/package.json` and `tsup.config.ts`:

- **Build:** tsup `^8.0.0`, TypeScript `^5.3.0`. Emits `cjs` + `esm` + types; `jsx: 'automatic'`,
  `engines.node` `>=16.0.0`, `sideEffects: false`.
- **Peer deps:** `react` / `react-dom` `>=16.8.0`, `react-router-dom` `>=6.0.0`, `antd` `>=5.0.0`,
  `@tanstack/react-query` `>=5.0.0`, and `@ecommerce-platform/auth-provider` (`*`). All marked
  `external` in tsup so they resolve from the consumer.

## Build / run / test

```bash
# From micro-frontends root:
npm run build:shared-layout       # cd packages/shared-layout && npm install && npm run build

# Direct, inside the package:
cd micro-frontends/packages/shared-layout
npm run build         # tsup → dist
npm run build:watch   # tsup --watch
npm run typecheck     # tsc --noEmit
npm run clean         # rm -rf dist
```

No unit-test script is defined — _not found in `packages/shared-layout/package.json` scripts_
(only `build`, `build:watch`, `typecheck`, `clean`, `prepublishOnly`, `release`).

## Configuration

No env vars of its own. Behavior is configured at runtime:

- `configureNavigation()` / `getNavigationConfig()` set the host URL and navigation behavior used by
  mode detection (`src/utils/navigation.ts`).
- Theming via the exported `themeConfig` constant fed to Ant Design `ConfigProvider`
  (`src/constants/theme`); navbar/footer content via `src/constants/navbar` and `src/constants/footer`.

## Interfaces & contracts

Public surface from `src/index.ts`:

- **Components:** `Layout` (+ `LayoutProps`), `Navbar` (+ `NavbarProps`), `Footer`,
  `CartPreview` (+ `CartItem`), `LanguageSwitcher`.
- **Navigation utils:** `configureNavigation`, `getNavigationConfig`, `isStandaloneMode`,
  `getStandaloneUrl`, `getHostUrl`, `checkHostAvailability`, `navigateWithFallback`,
  `createNavigationHandler`, plus hooks `useNavigate`, `useNavigationHandler`.
- **Constants/types:** `themeConfig`, navbar/footer constants (`export *`), and `ThemeConfig`
  (re-exported from `antd`).

Consumed via the package `exports` map (`import` → `dist/index.mjs`, `require` → `dist/index.js`).

## Data & state

Largely presentational. `CartPreview` is **display-only** — real cart state lives in the store app.
Navigation config is module-level state set via `configureNavigation()`. It expects (peer dep) a
`@tanstack/react-query` `QueryClient` and the `auth-provider` context from consumers, but does not
own server/auth state itself.

## Dependencies

- **Imported by** the micro-frontend apps (host + remotes) as `@ecommerce-platform/shared-layout`.
- **Peer-depends on `@ecommerce-platform/auth-provider`** (and on `antd`, `react-router-dom`,
  `@tanstack/react-query` supplied by the host app).

## Patterns

- Navigation is mode-aware: use `navigateWithFallback()` / `createNavigationHandler()` (and
  `useNavigate`/`useNavigationHandler`) so links resolve in both standalone and hosted modes —
  don't hardcode router navigation. `isStandaloneMode()` decides by comparing `window.location.origin`
  to the host URL.
- Theme through Ant Design `ConfigProvider` with the exported `themeConfig`, not ad-hoc CSS.

## Gotchas

- Mode detection compares `window.location.origin` against the configured host URL — when navigation
  misbehaves, verify the host config first.
- `CartPreview` carries no cart logic; don't put state there.
- `LanguageSwitcher` does **not** bundle i18n — consumers must set up i18next themselves.
- Consumers must have Ant Design (and its CSS) available; this package assumes it.
- Built with tsup; rebuild (`npm run build:shared-layout`) after edits so consumers get fresh types.

## Owners / agents

- **frontend-developer** — owns the shared components and navigation utilities.
- **ui-designer** — owns visual/theming decisions (`themeConfig`, navbar/footer chrome).
