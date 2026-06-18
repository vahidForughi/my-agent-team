# host — shell application

## Do

- Register remotes with `registerRemotes([{ name, entry }])` from `@module-federation/runtime` — never call `init()` again after the host is initialized at build time.
- Guard each remote registration with the module-level `Set` in `MicroFrontendApp.tsx` so each remote registers at most once (avoids "remote already registered" warnings on re-render).
- Protect authenticated routes using the `ProtectedRoute` component from `src/routes.tsx`.
- Configure MSAL via `src/auth/msal/config.ts` and pass options through `EcommerceAuthProvider` in `src/app/app.tsx`.
- Use `HttpClientFactory` from `src/http/http-client.factory.ts` for all API calls — it injects auth tokens automatically.
- Look up remote URLs from `src/config/microFrontendRegistry.ts` rather than hardcoding URLs.

## Don't

- Do not call `@module-federation/runtime` `init()` with a new `name` after the host MF runtime has started — this throws `#RUNTIME-010` and breaks the ErrorBoundary.
- Do not add domain business logic to the host — the host orchestrates; domain logic belongs inside each remote MFE.
- Do not import from remotes at compile time; always consume them dynamically through Module Federation.
- Do not bypass `ProtectedRoute` for checkout, account, or admin routes — they require authentication.
- Do not hardcode port numbers or remote URLs; use `microFrontendRegistry.ts` and `NX_API_BASE_URL`.

@AGENT.md
