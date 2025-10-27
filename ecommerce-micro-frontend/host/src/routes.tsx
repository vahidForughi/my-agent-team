import React from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import StoreApp from './microFe/StoreApp';
import CheckoutApp from './microFe/CheckoutApp';
import AccountApp from './microFe/AccountApp';

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
        path: 'store/*',
        element: <StoreApp />,
      },
      {
        path: 'checkout/*',
        element: <CheckoutApp />,
      },
      {
        path: 'account/*',
        element: <AccountApp />,
      },
    ],
  },
];
