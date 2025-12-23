import React, { useMemo, useEffect, ReactNode } from 'react';
import {
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import {
  AuthConsumerProvider as AuthConsumerProviderOriginal,
  HostAuthContext,
  DebugOptions,
} from '@ecommerce-platform/auth-provider';
import { ConfigProvider } from 'antd';
import { adminThemeConfig } from '../config/theme';
import { routeTree } from '../routeTree.gen';
import { queryClient } from '../services/queryClient';

// Type assertion to fix React types version mismatch in monorepo
const AuthConsumerProvider =
  AuthConsumerProviderOriginal as React.ComponentType<{
    hostAuth?: HostAuthContext;
    debug?: DebugOptions;
    children: ReactNode;
  }>;

type AdminModuleProps = AppInjectorProps;

type RouterContext = {
  queryClient: typeof queryClient;
  auth?: {
    user: unknown;
    isAuthenticated: boolean;
    logout: () => void;
  };
  config?: AppInjectorProps['config'];
};

function createAdminRouter(basePath: string, initialPath = '/') {
  const memoryHistory = createMemoryHistory({
    initialEntries: [initialPath],
  });

  return createRouter({
    routeTree,
    history: memoryHistory,
    basepath: basePath,
    defaultPreload: 'intent',
    scrollRestoration: true,
    context: {
      queryClient,
      auth: undefined,
      config: undefined,
    } as RouterContext,
  });
}

/**
 * AdminModule
 *
 * Main entry point for the admin micro-frontend.
 * Uses TanStack Router for file-based routing.
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for module initialization and provider composition
 */
function AdminModule(props: AdminModuleProps) {
  // 1. Props destructuring
  const { config } = props;
  const { appContext, onLogout } = config || {};

  // 2. Derived state
  const typedAppContext = appContext as Record<string, unknown> | undefined;
  const basePath = (typedAppContext?.basePath as string) || '/';
  const initialPath = (typedAppContext?.initialPath as string) || '/';

  // 3. Memoized values
  const hostAuth = useMemo<HostAuthContext | undefined>(() => {
    if (!typedAppContext) {
      return undefined;
    }

    return {
      user: typedAppContext.user as HostAuthContext['user'],
      token: typedAppContext.token as string | null | undefined,
      tokenExpiry: typedAppContext.tokenExpiry as number | undefined,
      isAuthenticated: typedAppContext.isAuthenticated as boolean | undefined,
      requestTokenRefresh: typedAppContext.requestTokenRefresh as
        | (() => Promise<string | null>)
        | undefined,
      onLogout,
    };
  }, [typedAppContext, onLogout]);

  const router = useMemo(() => {
    const r = createAdminRouter(basePath, initialPath);
    r.update({
      context: {
        queryClient,
        auth: hostAuth
          ? {
              user: hostAuth.user,
              isAuthenticated: hostAuth.isAuthenticated ?? false,
              logout: onLogout ? onLogout : () => undefined,
            }
          : undefined,
        config,
      },
    });
    return r;
  }, [basePath, initialPath, hostAuth, config, onLogout]);

  // Subscribe to router changes and sync path to browser URL
  useEffect(() => {
    const unsubscribe = router.subscribe('onResolved', (event) => {
      const location = event.toLocation;
      if (!location) {
        return;
      }

      // Build the full path including basePath
      // Router's pathname is relative to basePath, so combine them
      const routerPath = location.pathname;
      const fullPath = routerPath.startsWith(basePath)
        ? routerPath
        : `${basePath}${routerPath === '/' ? '' : routerPath}`;

      // Build search string
      const search = location.search;
      let searchString = '';
      if (search && typeof search === 'object') {
        const params = new URLSearchParams();
        Object.entries(search).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
          }
        });
        searchString = params.toString() ? `?${params.toString()}` : '';
      }

      const newUrl = `${fullPath}${searchString}`;
      const currentUrl = window.location.pathname + window.location.search;

      // Update browser URL to maintain proper history
      if (currentUrl !== newUrl) {
        window.history.pushState(
          { ...window.history.state, pathname: newUrl },
          '',
          newUrl
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router, basePath]);

  // 4. Main render
  return (
    <ConfigProvider theme={adminThemeConfig}>
      <AuthConsumerProvider hostAuth={hostAuth}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthConsumerProvider>
    </ConfigProvider>
  );
}

export default AdminModule;
