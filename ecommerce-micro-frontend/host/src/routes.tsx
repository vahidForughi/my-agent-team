import React from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MicroFrontendApp from './microFe/MicroFrontendApp';

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
        path: ':appName/*',
        element: <MicroFrontendApp />,
      },
    ],
  },
];
