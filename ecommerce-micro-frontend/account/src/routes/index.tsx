import React from 'react';
import { RouteObject } from 'react-router-dom';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';

// Lazy load pages for better performance
const Profile = React.lazy(() => import('../pages/Profile'));
const Orders = React.lazy(() => import('../pages/Orders'));
const Settings = React.lazy(() => import('../pages/Settings'));

export const createAccountRoutes = (
  config?: AppInjectorProps['config']
): RouteObject[] => [
  {
    path: '/',
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Profile config={config} />
      </React.Suspense>
    ),
  },
  {
    path: '/orders',
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Orders config={config} />
      </React.Suspense>
    ),
  },
  {
    path: '/settings',
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Settings config={config} />
      </React.Suspense>
    ),
  },
];
