import React, { useMemo, useEffect } from 'react';
import { MemoryRouter, useRoutes, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppInjectorProps } from '@ecommerce/app-injector';
import { createCheckoutRoutes } from '../routes';
import { queryClient } from '../services/queryClient';

type CheckoutModuleProps = AppInjectorProps;

const LocationSynchronizer: React.FC = () => {
  const location = useLocation();
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    const internalPath = location.pathname === '/' ? '' : location.pathname;
    const newPath = `/checkout${internalPath}`;

    if (window.location.pathname !== newPath) {
      if (isInitialMount.current) {
        window.history.replaceState({}, '', newPath);
      } else {
        window.history.pushState({}, '', newPath);
      }
    }

    isInitialMount.current = false;
  }, [location.pathname]);

  return null;
};

const CheckoutRouter: React.FC<{ config?: AppInjectorProps['config'] }> = ({
  config,
}) => {
  const routes = useMemo(() => createCheckoutRoutes(config), [config]);
  const element = useRoutes(routes);

  return (
    <>
      <LocationSynchronizer />
      {element}
    </>
  );
};

const CheckoutModule: React.FC<CheckoutModuleProps> = ({ config }) => {
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/';
    const fullPath = window.location.pathname;
    const checkoutPath = fullPath.replace(/^\/checkout/, '') || '/';
    return checkoutPath;
  };

  const initialPath = getInitialPath();

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]} initialIndex={0}>
        <CheckoutRouter config={config} />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

export default CheckoutModule;
