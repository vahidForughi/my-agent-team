/**
 * Host MSAL Auth Hooks
 *
 * Custom hooks for authentication in the host application.
 */

import { useCallback, useEffect, useState } from 'react';
import { useMsalAuth } from './MsalAuthProvider';
import type { MsalUser, AuthState } from './types';

/**
 * Hook to check if user is authenticated
 */
export const useIsUserAuthenticated = (): boolean => {
  const { isAuthenticated } = useMsalAuth();
  return isAuthenticated;
};

/**
 * Hook to get current user
 */
export const useCurrentUser = (): MsalUser | null => {
  const { user } = useMsalAuth();
  return user;
};

/**
 * Hook to get auth loading state
 */
export const useAuthLoading = (): boolean => {
  const { isLoading } = useMsalAuth();
  return isLoading;
};

/**
 * Hook for login functionality
 */
export const useLogin = () => {
  const { login, isLoading, error } = useMsalAuth();
  return { login, isLoading, error };
};

/**
 * Hook for logout functionality
 */
export const useLogout = () => {
  const { logout } = useMsalAuth();
  return { logout };
};

/**
 * Hook to get access token
 *
 * @returns Function to get access token
 */
export const useAccessToken = () => {
  const { getAccessToken, accessToken, isTokenExpired } = useMsalAuth();
  
  const getToken = useCallback(async () => {
    if (accessToken && !isTokenExpired()) {
      return accessToken;
    }
    return getAccessToken();
  }, [accessToken, isTokenExpired, getAccessToken]);

  return { getToken, currentToken: accessToken };
};

/**
 * Hook to get auth state for remote modules
 *
 * Returns auth context that can be passed to micro-frontends
 */
export const useAuthContextForRemote = () => {
  const {
    user,
    accessToken,
    tokenExpiry,
    isAuthenticated,
    requestTokenRefresh,
    logout,
  } = useMsalAuth();

  return {
    user,
    token: accessToken,
    tokenExpiry,
    isAuthenticated,
    requestTokenRefresh,
    logout,
  };
};

/**
 * Hook to manage auth state subscription
 *
 * @param onAuthStateChange - Callback when auth state changes
 */
export const useAuthStateSubscription = (
  onAuthStateChange?: (state: AuthState) => void
) => {
  const auth = useMsalAuth();

  useEffect(() => {
    if (onAuthStateChange) {
      onAuthStateChange({
        user: auth.user,
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        accessToken: auth.accessToken,
        tokenExpiry: auth.tokenExpiry,
        error: auth.error,
      });
    }
  }, [
    auth.user,
    auth.isAuthenticated,
    auth.isLoading,
    auth.accessToken,
    auth.tokenExpiry,
    auth.error,
    onAuthStateChange,
  ]);
};

/**
 * Hook to require authentication
 *
 * Redirects to login if not authenticated
 */
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading, login } = useMsalAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [isLoading, isAuthenticated]);

  return { isAuthenticated, isLoading, shouldRedirect };
};
