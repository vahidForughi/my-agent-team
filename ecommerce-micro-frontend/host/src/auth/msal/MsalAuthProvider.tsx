/**
 * Host MSAL Auth Provider
 *
 * Provides MSAL authentication context for the host application.
 * Handles login, logout, token acquisition, and auth state management.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  MsalProvider,
  useMsal,
  useIsAuthenticated,
} from '@azure/msal-react';
import {
  InteractionStatus,
  EventType,
  AuthenticationResult,
  EventMessage,
} from '@azure/msal-browser';
import {
  MsalUser,
  MsalAccountInfo,
  AuthState,
  HostAuthContextValue,
  initialAuthState,
  accountInfoToMsalUser,
  authEventEmitter,
  createAuthEvent,
  isExpiryTimestampExpired,
  getTokenExpiry,
} from './types';
import { getMsalInstance, initializeMsal, loginRequest, tokenRequest } from './config';
import { broadcastToken, broadcastAuthState } from './token-broadcast';

/**
 * Auth Context
 */
const HostAuthContext = createContext<HostAuthContextValue | null>(null);

/**
 * Internal provider that uses MSAL hooks
 */
const MsalAuthProviderInternal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const isMsalAuthenticated = useIsAuthenticated();

  // State
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const tokenRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Get the active account
   */
  const getActiveAccount = useCallback((): MsalAccountInfo | null => {
    const activeAccount = instance.getActiveAccount();
    if (activeAccount) {
      return activeAccount as unknown as MsalAccountInfo;
    }
    if (accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
      return accounts[0] as unknown as MsalAccountInfo;
    }
    return null;
  }, [instance, accounts]);

  /**
   * Update auth state
   */
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState((prev: AuthState) => {
      const newState = { ...prev, ...updates };
      // Emit auth state change event
      authEventEmitter.emit(
        createAuthEvent('AUTH_STATE_CHANGED', {
          user: newState.user,
          accessToken: newState.accessToken,
        })
      );
      return newState;
    });
  }, []);

  /**
   * Acquire access token silently
   */
  const acquireToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    const account = getActiveAccount();
    if (!account) {
      console.warn('[MsalAuthProvider] No active account for token acquisition');
      return null;
    }

    try {
      const response = await instance.acquireTokenSilent({
        ...tokenRequest,
        account,
        forceRefresh,
      });

      const accessToken = response.accessToken;
      const tokenExpiry = getTokenExpiry(response.idToken) || (response.expiresOn?.getTime() ?? null);

      updateAuthState({
        accessToken,
        tokenExpiry,
        error: null,
      });

      // Emit token acquired event
      authEventEmitter.emit(
        createAuthEvent('TOKEN_ACQUIRED', { accessToken })
      );

      return accessToken;
    } catch (error) {
      console.error('[MsalAuthProvider] Silent token acquisition failed:', error);
      
      // Try interactive if silent fails
      try {
        await instance.acquireTokenRedirect({
          ...tokenRequest,
          account,
        });
        return null;
      } catch (interactiveError) {
        console.error('[MsalAuthProvider] Interactive token acquisition failed:', interactiveError);
        updateAuthState({ error: interactiveError as Error });
        return null;
      }
    }
  }, [instance, getActiveAccount, updateAuthState]);

  /**
   * Login
   */
  const login = useCallback(async (): Promise<void> => {
    try {
      updateAuthState({ isLoading: true, error: null });
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('[MsalAuthProvider] Login failed:', error);
      updateAuthState({ isLoading: false, error: error as Error });
      authEventEmitter.emit(
        createAuthEvent('LOGIN_FAILURE', { error: error as Error })
      );
    }
  }, [instance, updateAuthState]);

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Clear token refresh timer
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
        tokenRefreshTimerRef.current = null;
      }

      const account = getActiveAccount();
      await instance.logoutRedirect({
        account: account ?? undefined,
        postLogoutRedirectUri: window.location.origin,
      });

      updateAuthState({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        tokenExpiry: null,
      });

      authEventEmitter.emit(createAuthEvent('LOGOUT_SUCCESS'));
    } catch (error) {
      console.error('[MsalAuthProvider] Logout failed:', error);
      updateAuthState({ error: error as Error });
    }
  }, [instance, getActiveAccount, updateAuthState]);

  /**
   * Get access token (public method)
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    // Check if current token is still valid
    if (authState.accessToken && !isExpiryTimestampExpired(authState.tokenExpiry, 60)) {
      return authState.accessToken;
    }
    // Acquire new token
    return acquireToken();
  }, [authState.accessToken, authState.tokenExpiry, acquireToken]);

  /**
   * Check if token is expired
   */
  const isTokenExpiredFn = useCallback((): boolean => {
    return isExpiryTimestampExpired(authState.tokenExpiry, 60);
  }, [authState.tokenExpiry]);

  /**
   * Request token refresh (for remote modules)
   */
  const requestTokenRefresh = useCallback(async (): Promise<string | null> => {
    return acquireToken(true);
  }, [acquireToken]);

  /**
   * Schedule token refresh before expiry
   */
  const scheduleTokenRefresh = useCallback(() => {
    if (tokenRefreshTimerRef.current) {
      clearTimeout(tokenRefreshTimerRef.current);
    }

    if (!authState.tokenExpiry) {
      return;
    }

    // Refresh 5 minutes before expiry
    const refreshTime = authState.tokenExpiry - Date.now() - 5 * 60 * 1000;
    
    if (refreshTime > 0) {
      tokenRefreshTimerRef.current = setTimeout(async () => {
        console.log('[MsalAuthProvider] Refreshing token...');
        const newToken = await acquireToken(true);
        if (newToken) {
          authEventEmitter.emit(createAuthEvent('TOKEN_REFRESH', { accessToken: newToken }));
        }
      }, refreshTime);
    }
  }, [authState.tokenExpiry, acquireToken]);

  /**
   * Handle MSAL events
   */
  useEffect(() => {
    const callbackId = instance.addEventCallback((event: EventMessage) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const result = event.payload as AuthenticationResult;
        const account = result.account;
        
        if (account) {
          instance.setActiveAccount(account);
          const msalUser = accountInfoToMsalUser(account, result.idTokenClaims as Record<string, unknown>);
          
          updateAuthState({
            user: msalUser,
            isAuthenticated: true,
            isLoading: false,
            accessToken: result.accessToken,
            tokenExpiry: getTokenExpiry(result.idToken) || (result.expiresOn?.getTime() ?? null),
            error: null,
          });

          authEventEmitter.emit(
            createAuthEvent('LOGIN_SUCCESS', {
              user: msalUser,
              accessToken: result.accessToken,
            })
          );
        }
      }

      if (event.eventType === EventType.LOGOUT_SUCCESS) {
        updateAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          accessToken: null,
          tokenExpiry: null,
        });
      }

      if (event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS && event.payload) {
        const result = event.payload as AuthenticationResult;
        updateAuthState({
          accessToken: result.accessToken,
          tokenExpiry: getTokenExpiry(result.idToken) || (result.expiresOn?.getTime() ?? null),
        });
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance, updateAuthState]);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      // Handle redirect response
      try {
        const response = await instance.handleRedirectPromise();
        if (response) {
          const msalUser = accountInfoToMsalUser(response.account!, response.idTokenClaims as Record<string, unknown>);
          updateAuthState({
            user: msalUser,
            isAuthenticated: true,
            isLoading: false,
            accessToken: response.accessToken,
            tokenExpiry: getTokenExpiry(response.idToken) || (response.expiresOn?.getTime() ?? null),
            error: null,
          });
          return;
        }
      } catch (error) {
        console.error('[MsalAuthProvider] Redirect handling error:', error);
      }

      // Check for existing session
      const account = getActiveAccount();
      if (account) {
        const msalUser = accountInfoToMsalUser(account);
        updateAuthState({
          user: msalUser,
          isAuthenticated: true,
          isLoading: false,
        });

        // Acquire initial token
        await acquireToken();
      } else {
        updateAuthState({ isLoading: false });
      }
    };

    if (inProgress === InteractionStatus.None) {
      initializeAuth();
    }
  }, [instance, inProgress, getActiveAccount, updateAuthState, acquireToken]);

  /**
   * Schedule token refresh when token changes
   */
  useEffect(() => {
    if (authState.accessToken && authState.tokenExpiry) {
      scheduleTokenRefresh();
    }
  }, [authState.accessToken, authState.tokenExpiry, scheduleTokenRefresh]);

  /**
   * Broadcast token updates to remote micro-frontends
   */
  useEffect(() => {
    broadcastToken(authState.accessToken, authState.tokenExpiry);
  }, [authState.accessToken, authState.tokenExpiry]);

  /**
   * Broadcast auth state changes to remote micro-frontends
   */
  useEffect(() => {
    broadcastAuthState(authState.isAuthenticated, authState.user ? {
      id: authState.user.id,
      username: authState.user.username,
      email: authState.user.email,
      displayName: authState.user.displayName,
    } : null);
  }, [authState.isAuthenticated, authState.user]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
      }
    };
  }, []);

  /**
   * Context value
   */
  const contextValue = useMemo<HostAuthContextValue>(
    () => ({
      ...authState,
      login,
      logout,
      getAccessToken,
      isTokenExpired: isTokenExpiredFn,
      requestTokenRefresh,
    }),
    [authState, login, logout, getAccessToken, isTokenExpiredFn, requestTokenRefresh]
  );

  return (
    <HostAuthContext.Provider value={contextValue}>
      {children}
    </HostAuthContext.Provider>
  );
};

/**
 * MSAL Auth Provider Component
 *
 * Wraps the application with MSAL provider and auth context.
 */
export const MsalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [msalReady, setMsalReady] = useState(false);
  const [msalError, setMsalError] = useState<Error | null>(null);

  useEffect(() => {
    initializeMsal()
      .then(() => setMsalReady(true))
      .catch((error) => {
        console.error('[MsalAuthProvider] MSAL initialization failed:', error);
        setMsalError(error);
      });
  }, []);

  if (msalError) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        Authentication initialization failed. Please refresh the page.
      </div>
    );
  }

  if (!msalReady) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        Initializing authentication...
      </div>
    );
  }

  return (
    <MsalProvider instance={getMsalInstance()}>
      <MsalAuthProviderInternal>{children}</MsalAuthProviderInternal>
    </MsalProvider>
  );
};

/**
 * Hook to use auth context
 */
export const useMsalAuth = (): HostAuthContextValue => {
  const context = useContext(HostAuthContext);
  if (!context) {
    throw new Error('useMsalAuth must be used within MsalAuthProvider');
  }
  return context;
};

export default MsalAuthProvider;
