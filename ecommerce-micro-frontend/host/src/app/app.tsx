import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AppConfigProvider } from '../context/AppConfigContext';
import { routes } from '../routes';

/**
 * Router Component that uses useRoutes hook
 */
function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

/**
 * Main Application Component
 *
 * This component sets up the routing and layout for the host application.
 * It wraps all micro-frontends with the AppConfigProvider to provide
 * centralized configuration and context.
 *
 * Routes are defined in routes.tsx using the refactored micro frontend architecture.
 */
export function App() {
  const [currentTheme] = React.useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('theme');
    return (storedTheme as 'light' | 'dark') || 'light';
  });

  return (
    <ConfigProvider
      theme={{
        algorithm:
          currentTheme === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#3048a5', // NextTech primary color
          borderRadius: 6,
          fontFamily: "'Poppins', sans-serif",
        },
      }}
    >
      <BrowserRouter>
        <AppConfigProvider>
          <AppRoutes />
        </AppConfigProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
