import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MsalAuthProvider } from '../auth/msal';
import { AppConfigProvider, useAppConfig } from '../context/AppConfigContext';
import { routes } from '../routes';
import { themeConfig } from '../config/theme';
import '../i18n/config';
import '../styles.less';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Router Component that uses useRoutes hook
 */
function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

/**
 * Theme Wrapper Component
 *
 * This internal component consumes the theme from AppConfigContext
 * and applies it to the Ant Design ConfigProvider.
 * Must be rendered inside AppConfigProvider.
 */
function ThemedApp() {
  const { appContext } = useAppConfig();

  return (
    <ConfigProvider
      theme={{
        ...themeConfig,
        algorithm:
          appContext.theme === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
}

/**
 * Main Application Component
 *
 * This component sets up the routing and layout for the host application.
 * It wraps all micro-frontends with the AppConfigProvider to provide
 * centralized configuration and context.
 *
 * Routes are defined in routes.tsx using the refactored micro frontend architecture.
 *
 * Theme is now managed through AppConfigContext for proper state management
 * and synchronization across the application.
 *
 * Authentication is managed by MsalAuthProvider using Azure AD B2C.
 */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MsalAuthProvider>
        <AppConfigProvider>
          <ThemedApp />
        </AppConfigProvider>
        </MsalAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
