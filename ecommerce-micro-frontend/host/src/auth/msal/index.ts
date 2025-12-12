/**
 * Host MSAL Auth Module
 */

// Types
export type {
  MsalUser,
  MsalUserClaims,
  AuthState,
  AuthContextValue,
  HostAuthContextValue,
  AuthEventType,
  AuthEvent,
  AuthEventListener,
} from './types';

export {
  initialAuthState,
  accountInfoToMsalUser,
  isExpiryTimestampExpired,
  getTokenExpiry,
  authEventEmitter,
  createAuthEvent,
} from './types';

// Provider and context
export { MsalAuthProvider, useMsalAuth } from './MsalAuthProvider';

// Configuration
export {
  B2C_CONFIG,
  buildB2CAuthority,
  buildApiScope,
  defaultScopes,
  createMsalConfig,
  msalConfig,
  loginRequest,
  tokenRequest,
  scopes,
  getMsalInstance,
  initializeMsal,
  hostMsalConfig,
} from './config';

// Hooks
export {
  useIsUserAuthenticated,
  useCurrentUser,
  useAuthLoading,
  useLogin,
  useLogout,
  useAccessToken,
  useAuthContextForRemote,
  useAuthStateSubscription,
  useRequireAuth,
} from './hooks';

// Token broadcasting
export {
  broadcastToken,
  broadcastAuthState,
  subscribeToTokenBroadcast,
  subscribeToAuthStateBroadcast,
  TOKEN_BROADCAST_EVENT,
  AUTH_STATE_BROADCAST_EVENT,
} from './token-broadcast';

export type {
  TokenBroadcastEventDetail,
  AuthStateBroadcastEventDetail,
} from './token-broadcast';
