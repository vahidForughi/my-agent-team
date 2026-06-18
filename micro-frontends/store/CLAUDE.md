# store — product catalog micro-frontend

## Do

- Expose the Module Federation entry as `./ConsoleMicroApp` pointing to `src/remote-entry.ts` — this is the contract the host uses to load the remote.
- Use the `inject` / `unmount` functions from `src/injector.ts` as the mount/unmount contract.
- Consume auth context from the host via `AuthConsumerProvider` and `useAuth()` from `@ecommerce-platform/auth-provider` — never create a new auth provider.
- Use `@tanstack/react-router` for internal routing with the `basepath` derived from `appContext.basePath`.
- Fetch product data through TanStack Query hooks in `src/services/`.
- Use `@ecommerce-platform/shared-layout` for consistent chrome.

## Don't

- Do not own or mutate the shopping cart state from shared-layout's `CartPreview` — real cart state lives here in the store app.
- Do not hardcode base paths; always read `appContext.basePath` passed in through `AppInjectorProps`.
- Do not run without having the host registered — `store` at `:4201` standalone works for development only.
- Do not skip building shared packages (`npm run build:packages`) before running — TypeScript will error on missing `@ecommerce-platform/*` types.

@AGENT.md
