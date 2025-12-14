import React from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MicroFrontendApp from './microFe/MicroFrontendApp';
import { ProtectedRoute } from './components/ProtectedRoute';

/**
 * Protected Micro-Frontend Wrapper
 *
 * Wraps micro-frontends that require authentication (checkout, account).
 */
const ProtectedMicroFrontendApp: React.FC = () => (
  <ProtectedRoute>
    <MicroFrontendApp />
  </ProtectedRoute>
);

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = ['checkout', 'account'];

/**
 * Dynamic route element based on whether the route requires authentication
 */
const DynamicMicroFrontendRoute: React.FC = () => {
  // Get the current app name from the URL
  const appName = window.location.pathname.split('/')[1];

  // Check if this route requires authentication
  if (PROTECTED_ROUTES.includes(appName)) {
    return <ProtectedMicroFrontendApp />;
  }

  return <MicroFrontendApp />;
};

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // Store - public route (no auth required)
      {
        path: 'store/*',
        element: <MicroFrontendApp />,
      },
      // Checkout - protected route (auth required)
      {
        path: 'checkout/*',
        element: <ProtectedMicroFrontendApp />,
      },
      // Account - protected route (auth required)
      {
        path: 'account/*',
        element: <ProtectedMicroFrontendApp />,
      },
      // Fallback for other micro-frontends (dynamic check)
      {
        path: ':appName/*',
        element: <DynamicMicroFrontendRoute />,
      },
    ],
  },
];
