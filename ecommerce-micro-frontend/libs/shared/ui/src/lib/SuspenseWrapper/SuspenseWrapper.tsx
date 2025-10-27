import React, { Suspense, ReactNode } from 'react';

export interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Default loading fallback component
 */
export const DefaultLoadingFallback: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      width: '100%',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f0f0f0',
          borderTop: '4px solid #1890ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <p style={{ color: '#8c8c8c', fontSize: '14px', margin: 0 }}>
        Loading...
      </p>
    </div>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

/**
 * SuspenseWrapper provides a consistent loading experience across the application
 * It wraps React.Suspense with a default or custom loading fallback
 *
 * @example
 * ```tsx
 * <SuspenseWrapper>
 *   <LazyComponent />
 * </SuspenseWrapper>
 * ```
 */
export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback,
}) => {
  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      {children}
    </Suspense>
  );
};

export default SuspenseWrapper;
