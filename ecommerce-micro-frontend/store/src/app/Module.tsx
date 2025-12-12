import React, { useMemo, useEffect } from 'react';
import { MemoryRouter, useRoutes, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { AuthConsumerProvider, HostAuthContext } from '@ecommerce-platform/auth-provider';
import { createStoreRoutes } from '../routes';
import { queryClient } from '../services/queryClient';

type StoreModuleProps = AppInjectorProps;

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
    const queryString = location.search || '';
    const newPath = `/store${internalPath}${queryString}`;

    const currentPath = window.location.pathname + window.location.search;

    if (currentPath !== newPath) {
      if (isInitialMount.current) {
        window.history.replaceState({}, '', newPath);
      } else {
        window.history.pushState({}, '', newPath);
      }
    }

    isInitialMount.current = false;
  }, [location.pathname, location.search]);

  return null;
};

const StoreRouter: React.FC<{ config?: AppInjectorProps['config'] }> = ({
  config,
}) => {
  const routes = useMemo(() => createStoreRoutes(config), [config]);
  const element = useRoutes(routes);

  return (
    <>
      <LocationSynchronizer />
      {element}
    </>
  );
};

const StoreModule: React.FC<StoreModuleProps> = ({ config }) => {
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/';
    const fullPath = window.location.pathname;
    const queryString = window.location.search;
    const storePath = fullPath.replace(/^\/store/, '') || '/';
    return storePath + queryString;
  };

  const initialPath = getInitialPath();
  const appContext = config?.appContext as Record<string, unknown> | undefined;
  const hostAuth = useMemo(() => buildHostAuth(appContext), [appContext]);

  return (
    <AuthConsumerProvider hostAuth={hostAuth}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]} initialIndex={0}>
          <StoreRouter config={config} />
        </MemoryRouter>
      </QueryClientProvider>
    </AuthConsumerProvider>
  );
};

export default StoreModule;
