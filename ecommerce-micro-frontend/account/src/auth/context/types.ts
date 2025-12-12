import type { User } from '@ecommerce-platform/app-injector';
import type { MsalUser } from '@ecommerce-platform/auth';

/**
 * Debug options for development mode
 */
export interface DebugOptions {
  /** Enable console logs */
  logging?: boolean;
  /** Preset token to use in development */
  presetToken?: string;
  /** Preset user info for development */
  presetUser?: Partial<User>;
}

/**
 * Props passed from host to account module via AppInjectorProps
 */
export interface HostAuthProps {
  user?: User | null;
  token?: string | null;
  tokenExpiry?: number | null;
  isAuthenticated?: boolean;
  requestTokenRefresh?: () => Promise<string | null>;
  onLogout?: () => void;
}

/**
 * Internal auth state for provider components
 */
export interface AuthState {
  user: MsalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  tokenExpiry: number | null;
  error: Error | null;
}

/**
 * Account auth context value with all auth operations
 */
export interface AccountAuthContextValue extends AuthState {
  /** Initiate login flow */
  login: () => Promise<void>;
  /** Initiate logout flow */
  logout: () => Promise<void>;
  /** Get access token */
  getAccessToken: () => Promise<string | null>;
  /** Check if token is expired */
  isTokenExpired: () => boolean;
}

/**
 * Props for AccountAuthProvider
 */
export interface AccountAuthProviderProps {
  children: React.ReactNode;
  /** Auth props from host (if integrated) */
  hostAuth?: HostAuthProps;
  /** Debug options for development */
  debug?: DebugOptions;
}
