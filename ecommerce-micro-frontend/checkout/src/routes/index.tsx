import React from 'react';
import { RouteObject } from 'react-router-dom';
import { AppInjectorProps } from '@ecommerce/app-injector';

// Lazy load pages for better performance
const Cart = React.lazy(() => import('../pages/Cart'));

export const createCheckoutRoutes = (
  config?: AppInjectorProps['config']
): RouteObject[] => [
  {
    path: '/',
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Cart config={config} />
      </React.Suspense>
    ),
  },
];

