import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { MicroFrontendConfig, AppContext, User } from '@ecommerce-platform/app-injector';
import { getAuthToken, isAuthenticated, logout } from '../helpers/auth';

interface AppConfigContextType {
  appContext: AppContext;
  config: MicroFrontendConfig;
  updateUser: (user: User | null) => void;
  updateTheme: (theme: 'light' | 'dark') => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(
  undefined
);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() => {
    if (isAuthenticated()) {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark' ? 'dark' : 'light';
  });

  const updateUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

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

  const handleLogout = useCallback(() => {
    try {
      logout();
      updateUser(null);
      navigate('/login');
      message.success('Logged out successfully');
    } catch (error) {
      console.error('[AppConfig] Logout error:', error);
      message.error('Logout failed');
    }
  }, [navigate, updateUser]);

  const handleError = useCallback((error: Error) => {
    console.error('[AppConfig] Micro-frontend error:', error);
    message.error(error.message || 'An error occurred');
  }, []);

  const appContext: AppContext = {
    user,
    token: getAuthToken(),
    theme,
    locale: 'en-US',
    basePath: '',
    apiBaseUrl: process.env.NX_API_BASE_URL || 'http://localhost:3000/api',
  };

  const config: MicroFrontendConfig = {
    appContext,
    onNavigate: handleNavigate,
    onLogout: handleLogout,
    onError: handleError,
  };

  const value: AppConfigContextType = {
    appContext,
    config,
    updateUser,
    updateTheme,
  };

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
