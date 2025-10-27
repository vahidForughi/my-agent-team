/**
 * User information interface for authenticated users
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
}

/**
 * Application context passed to micro-frontends
 */
export interface AppContext {
  user?: User | null;
  token?: string | null;
  theme?: 'light' | 'dark';
  locale?: string;
  basePath?: string;
  apiBaseUrl?: string;
  [key: string]: unknown;
}

/**
 * Configuration object for micro-frontend apps
 */
export interface MicroFrontendConfig {
  appContext?: AppContext;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  onError?: (error: Error) => void;
  [key: string]: unknown;
}

/**
 * Props passed to injected app components
 */
export interface AppInjectorProps {
  config?: MicroFrontendConfig;
  [key: string]: unknown;
}

/**
 * Container element with React root instance
 */
export interface InjectorContainer extends HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __root?: any; // React 18+ Root instance
}

/**
 * Environment type
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * App injector interface
 */
export interface AppInjector {
  inject: (parentElementId: string, props?: AppInjectorProps) => void;
  unmount: (parentElementId: string) => void;
}

/**
 * Enhanced app injector interface with async inject and status checking
 */
export interface EnhancedAppInjector {
  inject: (parentElementId: string, props?: AppInjectorProps) => Promise<void>;
  unmount: (parentElementId: string) => void;
  isInjected: (parentElementId: string) => boolean;
}
