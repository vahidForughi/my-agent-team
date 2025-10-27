import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { useAppConfig } from '../context/AppConfigContext';
import { ErrorBoundary, SuspenseWrapper, LoaderBoundary } from '@shared/ui';

interface StoreModule {
  inject: (elementId: string, props?: unknown) => void;
  unmount: (elementId: string) => void;
}

const StoreAppContent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { config } = useAppConfig();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [module, setModule] = useState<StoreModule | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadApp = async () => {
      try {
        if (!containerRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (!containerRef.current) {
            throw new Error('Container ref not available after retry');
          }
        }

        const loadedModule = (await import('store/Module')) as StoreModule;
        if (!isMounted) return;

        setModule(loadedModule);

        if (loadedModule.inject) {
          const containerId = `store-container-${Date.now()}`;
          containerRef.current.id = containerId;

          loadedModule.inject(containerId, { config });
          setLoading(false);
        } else {
          throw new Error('Store module does not have inject method');
        }
      } catch (err) {
        const error = err as Error;
        console.error('[StoreApp] Failed to load store module:', error);

        if (config.onError) {
          config.onError(error);
        }

        setError(error);
        setLoading(false);
      }
    };

    loadApp();

    return () => {
      isMounted = false;
      if (containerRef.current?.id && module) {
        try {
          module.unmount(containerRef.current.id);
        } catch (err) {
          console.error('[StoreApp] Failed to unmount:', err);
        }
      }
    };
  }, [config]);

  if (error) {
    return (
      <LoaderBoundary
        error={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ minHeight: '400px', position: 'relative' }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 1000,
          }}
        >
          <Spin size="large" tip="Loading Store..." />
        </div>
      )}
    </div>
  );
};

const StoreApp: React.FC = () => {
  return (
    <ErrorBoundary
      onError={(error: Error, errorInfo: React.ErrorInfo) => {
        console.error('[StoreApp] Error:', error, errorInfo);
      }}
    >
      <SuspenseWrapper>
        <StoreAppContent />
      </SuspenseWrapper>
    </ErrorBoundary>
  );
};

export default StoreApp;
