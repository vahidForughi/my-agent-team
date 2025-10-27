# @ecommerce/app-injector

A utility library to standardize the process of injecting and unmounting React micro-frontend applications in an e-commerce platform.

## Features

- ✅ Standardized inject/unmount mechanism
- ✅ Support for both React 16/17 and React 18+
- ✅ Automatic detection of React version with dynamic imports
- ✅ Type-safe configuration
- ✅ Environment utilities
- ✅ Error handling with retry logic (Enhanced version)
- ✅ Consistent micro-frontend integration

## Installation

This is a shared library within the Nx monorepo. Import it using the TypeScript path alias:

```typescript
import { createAppInjector } from '@ecommerce/app-injector';
```

## Usage

### Basic Usage

```tsx
import { createAppInjector } from '@ecommerce/app-injector';
import StoreApp from './StoreApp';

// Create the injector
const StoreAppInjector = createAppInjector(StoreApp);

// Export inject and unmount methods
export const inject = (elementId: string, props: any) => {
  StoreAppInjector.inject(elementId, props);
};

export const unmount = (elementId: string) => {
  StoreAppInjector.unmount(elementId);
};

export default {
  inject,
  unmount,
};
```

### With Configuration

```tsx
import { createAppInjector, AppInjectorProps } from '@ecommerce/app-injector';
import CheckoutApp from './CheckoutApp';

const CheckoutAppInjector = createAppInjector(CheckoutApp);

export const inject = (elementId: string, props: AppInjectorProps) => {
  CheckoutAppInjector.inject(elementId, {
    ...props,
    config: {
      appContext: {
        user: props.config?.appContext?.user,
        token: props.config?.appContext?.token,
        theme: 'light',
        locale: 'en-US',
      },
      onNavigate: (path) => console.log('Navigate to:', path),
      onError: (error) => console.error('App error:', error),
    },
  });
};

export const unmount = (elementId: string) => {
  CheckoutAppInjector.unmount(elementId);
};
```

### Environment Utilities

```typescript
import { getEnvironment, isProductionEnv, isDevelopmentEnv, getApiBaseUrl } from '@ecommerce/app-injector';

// Get current environment
const env = getEnvironment(); // 'development' | 'staging' | 'production'

// Check environment
if (isProductionEnv()) {
  console.log('Running in production');
}

// Get API URL
const apiUrl = getApiBaseUrl();
```

### Enhanced App Injector with Retry Logic

For more robust injection with automatic retries:

```tsx
import { createEnhancedAppInjector, InjectorOptions } from '@ecommerce/app-injector';

const options: InjectorOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  debug: true,
  onSuccess: (elementId) => console.log(`Injected into ${elementId}`),
  onFailure: (elementId, error) => console.error(`Failed to inject into ${elementId}`, error),
};

const EnhancedInjector = createEnhancedAppInjector(MyApp, options);

// Async injection with retry
await EnhancedInjector.inject('app-container', props);

// Check if injected
if (EnhancedInjector.isInjected('app-container')) {
  console.log('App is currently injected');
}

// Unmount
EnhancedInjector.unmount('app-container');
```

## API Reference

### `createAppInjector(AppComponent)`

Creates an app injector with standardized inject and unmount methods.

**Parameters:**

- `AppComponent` (React.ComponentType): The React component to be injected

**Returns:**

- `AppInjector` object with `inject` and `unmount` methods

### `inject(parentElementId, props)`

Injects the component into the specified DOM element.

**Parameters:**

- `parentElementId` (string): The ID of the parent element
- `props` (AppInjectorProps): Props to pass to the component

### `unmount(parentElementId)`

Unmounts the component from the specified DOM element.

**Parameters:**

- `parentElementId` (string): The ID of the parent element

## Types

### `AppInjectorProps`

```typescript
interface AppInjectorProps {
  config?: MicroFrontendConfig;
  [key: string]: unknown;
}
```

### `MicroFrontendConfig`

```typescript
interface MicroFrontendConfig {
  appContext?: AppContext;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  onError?: (error: Error) => void;
  [key: string]: unknown;
}
```

### `AppContext`

```typescript
interface AppContext {
  user?: User | null;
  token?: string | null;
  theme?: 'light' | 'dark';
  locale?: string;
  basePath?: string;
  apiBaseUrl?: string;
  [key: string]: unknown;
}
```

## Building

This library is built automatically as part of the Nx workspace. To build it explicitly:

```bash
nx build shared-app-injector
```

## Testing

```bash
nx test shared-app-injector
```

## React Version Detection

The library automatically detects whether you're using React 18+ or React 16/17 by dynamically checking for the `createRoot` API from `react-dom/client`. This ensures compatibility across different React versions without requiring manual configuration.

**How it works:**

- Uses dynamic `require()` to check for `react-dom/client` availability
- Falls back gracefully to React 16/17 rendering if `createRoot` is not available
- No need to configure anything - works out of the box

## Recent Changes

### v2.0.0 (Latest)

- ✅ Fixed React 18+ detection logic to properly identify available React version
- ✅ Removed static imports of `createRoot` to prevent errors in React 16/17 environments
- ✅ Improved dynamic import strategy for better cross-version compatibility
- ✅ Enhanced error handling and logging

## License

UNLICENSED - Internal use only
