import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Flex, Spin } from 'antd';
import { AppInjectorProps } from '@ecommerce/app-injector';

// Lazy load pages for better performance
const ProductList = React.lazy(() => import('../pages/ProductList'));
const ProductDetail = React.lazy(() => import('../pages/ProductDetail'));

/**
 * Loading fallback component for lazy-loaded routes
 * Displays a centered spinner while the route component is loading
 */
const LoadingFallback = () => (
  <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
    <Spin size="large" />
  </Flex>
);

/**
 * Creates route configuration for the Store module
 *
 * Routes:
 * - `/` - Product list page (browsing and filtering products)
 * - `/product/:id` - Product detail page (individual product details)
 *
 * @param config - Application injector configuration passed to pages
 * @returns Array of route objects for react-router
 *
 * @example
 * ```typescript
 * const routes = createStoreRoutes(config);
 * const element = useRoutes(routes);
 * ```
 */
export const createStoreRoutes = (
  config?: AppInjectorProps['config']
): RouteObject[] => [
  {
    path: '/',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <ProductList config={config} />
      </React.Suspense>
    ),
  },
  {
    path: '/product/:id',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <ProductDetail config={config} />
      </React.Suspense>
    ),
  },
];
