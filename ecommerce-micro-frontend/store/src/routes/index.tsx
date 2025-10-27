import React from 'react';
import { RouteObject } from 'react-router-dom';
import ProductList from '../pages/ProductList';
import ProductDetail from '../pages/ProductDetail';
import { AppInjectorProps } from '@ecommerce/app-injector';

export const createStoreRoutes = (
  config?: AppInjectorProps['config']
): RouteObject[] => [
  {
    path: '/',
    element: <ProductList config={config} />,
  },
  {
    path: '/product/:id',
    element: <ProductDetail config={config} />,
  },
];
