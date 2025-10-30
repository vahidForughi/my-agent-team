import React from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MicroFrontendApp from './microFe/MicroFrontendApp';

/**
 * Application Routes
 * 
 * Architecture:
 * - Host provides layout shell and homepage
 * - Single wildcard route (/:appName/*) handles ALL micro frontends
 * - No hardcoded knowledge of specific apps (store/checkout/account)
 * - New micro frontends work automatically via registry
 */
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
      {
        /**
         * Generic Micro Frontend Route
         * 
         * Matches: /store/*, /checkout/*, /account/*, etc.
         * Dynamically loads micro frontend based on :appName parameter
         * 
         * To add new micro frontend:
         * 1. Register in host/src/config/microFrontendRegistry.ts
         * 2. That's it! No route changes needed.
         */
        path: ':appName/*',
        element: <MicroFrontendApp />,
      },
    ],
  },
];
