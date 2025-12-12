/**
 * Account Module - Authentication Exports
 */

// Legacy mock auth (kept for backward compatibility)
export { AuthService } from './auth.service';
export { AuthStorage } from './auth.storage';
export type { User, AuthState, LoginRequest, LoginResponse } from './auth.types';

// Auth Provider (Context Bridge) - Main entry point for auth
export { AccountAuthProvider, useAccountAuth } from './context';

export type {
  AccountAuthProviderProps,
  AccountAuthContextValue,
  HostAuthProps,
  DebugOptions,
} from './context';

// Auth hooks
export {
  useIsAuthenticated,
  useCurrentUser,
  useAuthLoading,
  useLogin,
  useLogout,
  useAccessToken,
  useRequireAuth,
  useAuthState,
  useUserDisplayName,
  useUserEmail,
  useTokenBroadcastSubscription,
} from './hooks';
