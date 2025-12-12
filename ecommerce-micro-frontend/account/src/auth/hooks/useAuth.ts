/**
 * Account Module - Auth Hooks
 *
 * Unified authentication hooks that work with host-integrated auth.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAccountAuth, AccountAuthContextValue } from '../context/AuthProvider';
import type { MsalUser } from '@ecommerce-platform/auth';

/**
 * Auth state type for callbacks
 */
interface AuthState {
  user: MsalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  tokenExpiry: number | null;
  error: Error | null;
}

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAccountAuth();
  return isAuthenticated;
};

/**
 * Hook to get current user
 */
export const useCurrentUser = (): MsalUser | null => {
  const { user } = useAccountAuth();
  return user;
};

/**
 * Hook to get auth loading state
 */
export const useAuthLoading = (): boolean => {
  const { isLoading } = useAccountAuth();
  return isLoading;
};

/**
 * Hook for login functionality
 */
export const useLogin = () => {
  const { login, isLoading, error } = useAccountAuth();
  return { login, isLoading, error };
};

/**
 * Hook for logout functionality
 */
export const useLogout = () => {
  const { logout } = useAccountAuth();
  return { logout };
};

/**
 * Hook to get access token
 */
export const useAccessToken = () => {
  const { getAccessToken, accessToken, isTokenExpired } = useAccountAuth();

  const getToken = useCallback(async () => {
    if (accessToken && !isTokenExpired()) {
      return accessToken;
    }
    return getAccessToken();
  }, [accessToken, isTokenExpired, getAccessToken]);

  return { getToken, currentToken: accessToken };
};

/**
 * Hook to require authentication
 *
 * @returns Object with auth state and shouldRedirect flag
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading, login } = useAccountAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [isLoading, isAuthenticated]);

  return {
    isAuthenticated,
    isLoading,
    shouldRedirect,
    login,
  };
};

/**
 * Hook to subscribe to auth state changes
 */
export const useAuthState = (onAuthStateChange?: (state: AuthState) => void) => {
  const auth = useAccountAuth();

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

  return auth;
};

/**
 * Hook to get user display name
 */
export const useUserDisplayName = (): string => {
  const user = useCurrentUser();
  return user?.displayName || 'Guest';
};

/**
 * Hook to get user email
 */
export const useUserEmail = (): string | undefined => {
  const user = useCurrentUser();
  return user?.email;
};
