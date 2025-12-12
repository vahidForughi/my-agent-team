import React, { useMemo } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import {
  AuthConsumerProvider,
  HostAuthContext,
} from '@ecommerce-platform/auth-provider';
import { createCheckoutRoutes } from '../routes';
import { queryClient } from '../services/queryClient';

type CheckoutModuleProps = AppInjectorProps;

/**
 * Build host auth context from app context
 */
function buildHostAuth(
  appContext?: Record<string, unknown>
): HostAuthContext | undefined {
  if (!appContext) {
    return undefined;
  }

  return {
    user: appContext.user as HostAuthContext['user'],
    token: appContext.token as string | null | undefined,
    tokenExpiry: appContext.tokenExpiry as number | undefined,
    isAuthenticated: appContext.isAuthenticated as boolean | undefined,
    requestTokenRefresh: appContext.requestTokenRefresh as
      | (() => Promise<string | null>)
      | undefined,
  };
}

const CheckoutRouter: React.FC<{ config?: AppInjectorProps['config'] }> = ({
  config,
}) => {
  const routes = useMemo(() => createCheckoutRoutes(config), [config]);
  const element = useRoutes(routes);

  return element;
};

const CheckoutModule: React.FC<CheckoutModuleProps> = ({ config }) => {
  const appContext = config?.appContext as Record<string, unknown> | undefined;
  const hostAuth = useMemo(() => buildHostAuth(appContext), [appContext]);

  // Get basePath from host config, defaults to '/' for standalone mode
  const basePath = (appContext?.basePath as string) || '/';

  return (
    <AuthConsumerProvider hostAuth={hostAuth}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={basePath}>
          <CheckoutRouter config={config} />
        </BrowserRouter>
      </QueryClientProvider>
    </AuthConsumerProvider>
  );
};

export default CheckoutModule;
