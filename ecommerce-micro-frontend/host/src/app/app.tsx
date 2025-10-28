import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AppConfigProvider } from '../context/AppConfigContext';
import AppLayout from '../components/Layout/Layout';
import HomePage from '../pages/HomePage/HomePage';
import LoginPage from '../pages/LoginPage/LoginPage';
import StoreApp from '../microFe/StoreApp';
import CheckoutApp from '../microFe/CheckoutApp';
import AccountApp from '../microFe/AccountApp';

/**
 * Main Application Component
 *
 * This component sets up the routing and layout for the host application.
 * It wraps all micro-frontends with the AppConfigProvider to provide
 * centralized configuration and context.
 */
export function App() {
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark'>(
    () => {
      const storedTheme = localStorage.getItem('theme');
      return (storedTheme as 'light' | 'dark') || 'light';
    }
  );

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
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes with layout */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="store/*" element={<StoreApp />} />
              <Route path="checkout/*" element={<CheckoutApp />} />
              <Route path="account/*" element={<AccountApp />} />
            </Route>

            {/* Fallback route */}
            <Route
              path="*"
              element={
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                  <h1>404 - Page Not Found</h1>
                </div>
              }
            />
          </Routes>
        </AppConfigProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
