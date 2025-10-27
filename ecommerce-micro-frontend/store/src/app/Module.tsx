import React, { useMemo, useEffect } from 'react';
import { MemoryRouter, useRoutes, useLocation } from 'react-router-dom';
import { AppInjectorProps } from '@ecommerce/app-injector';
import { createStoreRoutes } from '../routes';

type StoreModuleProps = AppInjectorProps;

const LocationSynchronizer: React.FC = () => {
  const location = useLocation();
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    const internalPath = location.pathname === '/' ? '' : location.pathname;
    const newPath = `/store${internalPath}`;

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
    const storePath = fullPath.replace(/^\/store/, '') || '/';
    return storePath;
  };

  const initialPath = getInitialPath();

  return (
    <MemoryRouter initialEntries={[initialPath]} initialIndex={0}>
      <StoreRouter config={config} />
    </MemoryRouter>
  );
};

export default StoreModule;
