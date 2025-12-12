import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { isExpiryTimestampExpired } from '@ecommerce-platform/auth';
import { connectAuthToTokenProvider } from '../../http/auth-token-provider';
import { useTokenBroadcastSubscription } from '../hooks/useTokenBroadcast';
import { AccountAuthContext } from './AccountAuthContext';
import type {
  HostAuthProps,
  AuthState,
  AccountAuthContextValue,
  DebugOptions,
} from './types';
import { createInitialAuthState, extractUserInfo } from './utils';

interface Props {
  children: React.ReactNode;
  hostAuth?: HostAuthProps;
  debug?: DebugOptions;
}

/**
 * InternalAuthProvider
 *
 * Internal auth provider that handles both host-integrated and debug modes.
 * - Uses debug.presetToken for local development
 * - Uses hostAuth props when running as a remote module
 * - Falls back to unauthenticated state otherwise
 */
export const InternalAuthProvider: React.FC<Props> = ({
  children,
  hostAuth,
  debug = {},
}) => {
  const { requestTokenRefresh, onLogout } = hostAuth || {};
  const isDebugMode = Boolean(debug.presetToken);

  const [authState, setAuthState] = useState<AuthState>(() =>
    createInitialAuthState(hostAuth, debug)
  );

  // Subscribe to token broadcasts from host (only when not in debug mode)
  const broadcastState = useTokenBroadcastSubscription(!isDebugMode);

  // Sync state when host props change (not in debug mode)
  useEffect(() => {
    if (!isDebugMode) {
      setAuthState(createInitialAuthState(hostAuth, debug));
    }
  }, [hostAuth, isDebugMode, debug]);

  // Sync state when broadcast token changes (not in debug mode)
  useEffect(() => {
    if (
      !isDebugMode &&
      broadcastState.token &&
      broadcastState.lastUpdated > 0
    ) {
      setAuthState((prev) => ({
        ...prev,
        accessToken: broadcastState.token,
        tokenExpiry: broadcastState.tokenExpiry,
      }));
    }
  }, [
    isDebugMode,
    broadcastState.token,
    broadcastState.tokenExpiry,
    broadcastState.lastUpdated,
  ]);

  // Auth operations
  const login = useCallback(async (): Promise<void> => {
    if (isDebugMode) {
      if (debug.logging) {
        console.log('[AccountAuth] Login not available in debug mode');
      }
      return;
    }
    console.warn('[AccountAuth] Login should be handled by host application');
  }, [isDebugMode, debug.logging]);

  const logout = useCallback(async (): Promise<void> => {
    if (isDebugMode) {
      if (debug.logging) {
        console.log('[AccountAuth] Logout in debug mode - clearing state');
      }
      setAuthState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        accessToken: null,
      }));
      return;
    }
    onLogout?.();
  }, [isDebugMode, debug.logging, onLogout]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    // In debug mode, return preset token
    if (isDebugMode && debug.presetToken) {
      return debug.presetToken;
    }

    // Return cached token if still valid
    if (
      authState.accessToken &&
      !isExpiryTimestampExpired(authState.tokenExpiry, 60)
    ) {
      return authState.accessToken;
    }

    // Request fresh token from host
    if (requestTokenRefresh) {
      try {
        const newToken = await requestTokenRefresh();
        if (newToken) {
          setAuthState((prev) => ({ ...prev, accessToken: newToken }));
          return newToken;
        }
      } catch (error) {
        console.error('[AccountAuth] Token refresh failed:', error);
      }
    }

    return authState.accessToken;
  }, [
    isDebugMode,
    debug.presetToken,
    authState.accessToken,
    authState.tokenExpiry,
    requestTokenRefresh,
  ]);

  const isTokenExpired = useCallback((): boolean => {
    // In debug mode, token never expires
    if (isDebugMode) {
      return false;
    }
    return isExpiryTimestampExpired(authState.tokenExpiry, 60);
  }, [isDebugMode, authState.tokenExpiry]);

  // Connect auth to HTTP token provider
  useEffect(() => {
    const getUserInfo = () => extractUserInfo(authState.user);
    return connectAuthToTokenProvider(
      getAccessToken,
      getUserInfo,
      authState.accessToken,
      authState.tokenExpiry
    );
  }, [
    getAccessToken,
    authState.user,
    authState.accessToken,
    authState.tokenExpiry,
  ]);

  const contextValue = useMemo<AccountAuthContextValue>(
    () => ({
      ...authState,
      login,
      logout,
      getAccessToken,
      isTokenExpired,
    }),
    [authState, login, logout, getAccessToken, isTokenExpired]
  );

  return (
    <AccountAuthContext.Provider value={contextValue}>
      {children}
    </AccountAuthContext.Provider>
  );
};

