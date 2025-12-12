import React, { useMemo, useEffect } from 'react';
import { MemoryRouter, useRoutes, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { AuthConsumerProvider, HostAuthContext } from '@ecommerce-platform/auth-provider';
import { createCheckoutRoutes } from '../routes';
import { queryClient } from '../services/queryClient';

type CheckoutModuleProps = AppInjectorProps;

/**
 * Build host auth context from app context
 */
function buildHostAuth(appContext?: Record<string, unknown>): HostAuthContext | undefined {
  if (!appContext) {
    return undefined;
  }

  return {
    user: appContext.user as HostAuthContext['user'],
    token: appContext.token as string | null | undefined,
    tokenExpiry: appContext.tokenExpiry as number | undefined,
    isAuthenticated: appContext.isAuthenticated as boolean | undefined,
    requestTokenRefresh: appContext.requestTokenRefresh as (() => Promise<string | null>) | undefined,
  };
}

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
  const appContext = config?.appContext as Record<string, unknown> | undefined;
  const hostAuth = useMemo(() => buildHostAuth(appContext), [appContext]);

  return (
    <AuthConsumerProvider hostAuth={hostAuth}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]} initialIndex={0}>
          <CheckoutRouter config={config} />
        </MemoryRouter>
      </QueryClientProvider>
    </AuthConsumerProvider>
  );
};

export default CheckoutModule;
