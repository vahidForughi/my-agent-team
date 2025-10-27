import React from 'react';
import { createStoreRoutes } from './index';
import '@testing-library/jest-dom';

describe('createStoreRoutes', () => {
  it('should create routes with correct paths', () => {
    const routes = createStoreRoutes();

    expect(routes).toHaveLength(2);
    expect(routes[0].path).toBe('/');
    expect(routes[1].path).toBe('/product/:id');
  });

  it('should create routes with correct elements', () => {
    const routes = createStoreRoutes();

    expect(routes[0].element).toBeDefined();
    expect(routes[1].element).toBeDefined();
  });

  it('should pass config to route elements', () => {
    const config = {
      appContext: {
        user: { firstName: 'John', lastName: 'Doe' },
      },
    };

    const routes = createStoreRoutes(config);

    expect(routes[0].element).toBeDefined();
    expect(routes[1].element).toBeDefined();
  });

  it('should handle undefined config', () => {
    const routes = createStoreRoutes(undefined);

    expect(routes).toHaveLength(2);
    expect(routes[0].element).toBeDefined();
    expect(routes[1].element).toBeDefined();
  });

  it('should return product detail route with dynamic id parameter', () => {
    const routes = createStoreRoutes();
    const productRoute = routes.find((r) => r.path === '/product/:id');

    expect(productRoute).toBeDefined();
    expect(productRoute?.path).toContain(':id');
  });
});
