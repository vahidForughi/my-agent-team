import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { useAppConfig } from '../context/AppConfigContext';

interface CheckoutModule {
  inject: (elementId: string, props?: unknown) => void;
  unmount: (elementId: string) => void;
}

const CheckoutApp: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { config } = useAppConfig();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<CheckoutModule | null>(null);

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

        const loadedModule = (await import(
          'checkout/Module'
        )) as CheckoutModule;
        if (!isMounted) return;

        setModule(loadedModule);

        if (loadedModule.inject) {
          const containerId = `checkout-container-${Date.now()}`;
          containerRef.current.id = containerId;

          loadedModule.inject(containerId, { config });
          setLoading(false);
        }
      } catch (error) {
        console.error('[CheckoutApp] Failed to load checkout module:', error);
        if (config.onError) {
          config.onError(error as Error);
        }
        setLoading(false);
      }
    };

    loadApp();

    return () => {
      isMounted = false;
      if (containerRef.current?.id && module) {
        try {
          module.unmount(containerRef.current.id);
        } catch (error) {
          console.error('[CheckoutApp] Failed to unmount:', error);
        }
      }
    };
  }, [config]);

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
          <Spin size="large" tip="Loading Checkout..." />
        </div>
      )}
    </div>
  );
};

export default CheckoutApp;
