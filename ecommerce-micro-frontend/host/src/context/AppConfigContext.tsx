import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { MicroFrontendConfig, AppContext, User } from '@ecommerce-platform/app-injector';
import { useMsalAuth, useAuthContextForRemote } from '../auth/msal';

interface AppConfigContextType {
  appContext: AppContext;
  config: MicroFrontendConfig;
  updateTheme: (theme: 'light' | 'dark') => void;
  /** Force refresh auth token */
  refreshToken: () => Promise<string | null>;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(
  undefined
);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const msalAuth = useMsalAuth();
  const authContextForRemote = useAuthContextForRemote();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark' ? 'dark' : 'light';
  });

  const updateTheme = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  const handleNavigate = useCallback(
    (path: string) => {
      try {
        navigate(path);
      } catch (error) {
        console.error('[AppConfig] Navigation error:', error);
        message.error('Navigation failed');
      }
    },
    [navigate]
  );

  const handleLogout = useCallback(async () => {
    try {
      await msalAuth.logout();
      message.success('Logged out successfully');
    } catch (error) {
      console.error('[AppConfig] Logout error:', error);
      message.error('Logout failed');
    }
  }, [msalAuth]);

  const handleError = useCallback((error: Error) => {
    console.error('[AppConfig] Micro-frontend error:', error);
    message.error(error.message || 'An error occurred');
  }, []);

  /**
   * Refresh token function for remote modules
   */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    return msalAuth.getAccessToken();
  }, [msalAuth]);

  /**
   * Convert MSAL user to app-injector User type
   */
  const convertToAppUser = useCallback((): User | null => {
    if (!msalAuth.user) {
      return null;
    }

    return {
      id: msalAuth.user.id,
      email: msalAuth.user.email,
      username: msalAuth.user.username,
      firstName: msalAuth.user.firstName,
      lastName: msalAuth.user.lastName,
      displayName: msalAuth.user.displayName,
    };
  }, [msalAuth.user]);

  /**
   * App context with MSAL auth data
   */
  const appContext = useMemo<AppContext>(() => ({
    user: convertToAppUser(),
    token: msalAuth.accessToken,
    theme,
    locale: 'en-US',
    basePath: '',
    apiBaseUrl: process.env.NX_API_BASE_URL || 'http://localhost:3000/api',
    // Additional auth context for remotes
    isAuthenticated: msalAuth.isAuthenticated,
    tokenExpiry: msalAuth.tokenExpiry,
    requestTokenRefresh: authContextForRemote.requestTokenRefresh,
  }), [
    convertToAppUser,
    msalAuth.accessToken,
    msalAuth.isAuthenticated,
    msalAuth.tokenExpiry,
    authContextForRemote.requestTokenRefresh,
    theme,
  ]);

  /**
   * Micro-frontend config with callbacks
   */
  const config = useMemo<MicroFrontendConfig>(() => ({
    appContext,
    onNavigate: handleNavigate,
    onLogout: handleLogout,
    onError: handleError,
  }), [appContext, handleNavigate, handleLogout, handleError]);

  const value = useMemo<AppConfigContextType>(() => ({
    appContext,
    config,
    updateTheme,
    refreshToken,
  }), [appContext, config, updateTheme, refreshToken]);

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = (): AppConfigContextType => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
};
