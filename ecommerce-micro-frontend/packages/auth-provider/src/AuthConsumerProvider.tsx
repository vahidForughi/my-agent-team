import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { AuthUser, AuthState, AuthContextType, DebugOptions } from './types';
import { AuthContext } from './AuthContext';
import { useTokenBroadcastSubscription, broadcastToken } from './hooks/useTokenBroadcast';
import {
  createDebugAuthState,
  createUnauthenticatedState,
  debugLog,
} from './utils/auth';
import { isExpiryTimestampExpired } from './utils/token';

/**
 * Host auth context passed from host app via appContext
 */
export interface HostAuthContext {
  user?: {
    id?: string;
    username?: string;
    displayName?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: unknown;
  } | null;
  token?: string | null;
  tokenExpiry?: number | null;
  isAuthenticated?: boolean;
  requestTokenRefresh?: () => Promise<string | null>;
  onLogout?: () => void | Promise<void>;
}

/**
 * Props for AuthConsumerProvider
 */
export interface AuthConsumerProviderProps {
  children: React.ReactNode;
  /** Host auth context from appContext */
  hostAuth?: HostAuthContext | null;
  /** Debug options for development */
  debug?: DebugOptions;
}

/**
 * Convert host user to AuthUser format
 */
function convertToAuthUser(hostUser: HostAuthContext['user']): AuthUser | null {
  if (!hostUser) return null;

  return {
    id: hostUser.id || hostUser.username || 'unknown',
    username: hostUser.username || hostUser.email || 'unknown',
    displayName:
      hostUser.displayName ||
      `${hostUser.firstName || ''} ${hostUser.lastName || ''}`.trim() ||
      hostUser.username ||
      'User',
    email: hostUser.email,
    firstName: hostUser.firstName,
    lastName: hostUser.lastName,
  };
}

/**
 * Create initial auth state from host context
 */
function createInitialState(
  hostAuth?: HostAuthContext | null,
  debug?: DebugOptions
): AuthState {
  // Debug mode with preset token
  if (debug?.presetToken && debug?.presetUser) {
    return createDebugAuthState(debug);
  }

  // No host auth - unauthenticated
  if (!hostAuth) {
    return createUnauthenticatedState();
  }

  // Use host auth state
  return {
    user: convertToAuthUser(hostAuth.user),
    isAuthenticated: hostAuth.isAuthenticated ?? Boolean(hostAuth.token && hostAuth.user),
    isLoading: false,
    accessToken: hostAuth.token ?? null,
    tokenExpiry: hostAuth.tokenExpiry ?? null,
    error: null,
  };
}

/**
 * AuthConsumerProvider
 *
 * Lightweight auth provider for remote micro-frontends.
 * Consumes auth state from host app via appContext instead of managing MSAL directly.
 *
 * @example
 * ```tsx
 * import { AuthConsumerProvider, useAuth } from '@ecommerce-platform/auth-provider';
 *
 * function RemoteModule({ config }) {
 *   return (
 *     <AuthConsumerProvider hostAuth={config?.appContext}>
 *       <ModuleContent />
 *     </AuthConsumerProvider>
 *   );
 * }
 *
 * function ModuleContent() {
 *   const { user, isAuthenticated, accessToken } = useAuth();
 *   // Use auth state...
 * }
 * ```
 */
export const AuthConsumerProvider: React.FC<AuthConsumerProviderProps> = ({
  children,
  hostAuth,
  debug = {},
}) => {
  const isDebugMode = Boolean(debug.presetToken);
  const [authState, setAuthState] = useState<AuthState>(() =>
    createInitialState(hostAuth, debug)
  );

  // Subscribe to token broadcast events from host
  const broadcastState = useTokenBroadcastSubscription(true);

  // Update state when hostAuth changes
  useEffect(() => {
    debugLog(debug, 'Host auth changed', { hostAuth });
    setAuthState(createInitialState(hostAuth, debug));
  }, [hostAuth, debug]);

  // Update token from broadcast
  useEffect(() => {
    if (broadcastState.token && broadcastState.lastUpdated > 0) {
      debugLog(debug, 'Token broadcast received', {
        hasToken: !!broadcastState.token,
        expiry: broadcastState.tokenExpiry,
      });
      setAuthState((prev) => ({
        ...prev,
        accessToken: broadcastState.token,
        tokenExpiry: broadcastState.tokenExpiry,
      }));
    }
  }, [broadcastState.token, broadcastState.tokenExpiry, broadcastState.lastUpdated, debug]);

  // Login - delegate to host or warn
  const login = useCallback(async (): Promise<void> => {
    console.warn(
      '[AuthConsumerProvider] login() called - remotes should not initiate login. ' +
        'Navigate to host login page instead.'
    );
  }, []);

  // Logout - delegate to host
  const logout = useCallback(async (): Promise<void> => {
    debugLog(debug, 'Logout requested');
    if (hostAuth?.onLogout) {
      await hostAuth.onLogout();
    } else {
      console.warn('[AuthConsumerProvider] No logout handler provided by host');
    }
  }, [hostAuth, debug]);

  // Get access token - use current or request refresh from host
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    // Debug mode - return preset token
    if (isDebugMode && debug.presetToken) {
      return debug.presetToken;
    }

    // Check if current token is still valid
    if (authState.accessToken && !isExpiryTimestampExpired(authState.tokenExpiry, 60)) {
      return authState.accessToken;
    }

    // Request refresh from host
    if (hostAuth?.requestTokenRefresh) {
      try {
        const newToken = await hostAuth.requestTokenRefresh();
        if (newToken) {
          setAuthState((prev) => ({ ...prev, accessToken: newToken }));
          // Broadcast the new token to other remotes
          broadcastToken(newToken, authState.tokenExpiry);
          return newToken;
        }
      } catch (error) {
        debugLog(debug, 'Token refresh failed', { error });
      }
    }

    return authState.accessToken;
  }, [authState.accessToken, authState.tokenExpiry, hostAuth, isDebugMode, debug]);

  // Check if token is expired
  const isTokenExpired = useCallback((): boolean => {
    return isExpiryTimestampExpired(authState.tokenExpiry, 60);
  }, [authState.tokenExpiry]);

  // Build context value
  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...authState,
      login,
      logout,
      getAccessToken,
      isTokenExpired,
      isDebugMode,
    }),
    [authState, login, logout, getAccessToken, isTokenExpired, isDebugMode]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthConsumerProvider;
