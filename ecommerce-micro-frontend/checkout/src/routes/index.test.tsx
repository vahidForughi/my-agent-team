import { createCheckoutRoutes } from './index';

describe('createCheckoutRoutes', () => {
  it('should create checkout routes', () => {
    const routes = createCheckoutRoutes();
    
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/');
  });

  it('should create routes with config', () => {
    const config = {
      appContext: {
        user: { id: '1', firstName: 'John', lastName: 'Doe' },
      },
    };
    
    const routes = createCheckoutRoutes(config);
    
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/');
  });
});

