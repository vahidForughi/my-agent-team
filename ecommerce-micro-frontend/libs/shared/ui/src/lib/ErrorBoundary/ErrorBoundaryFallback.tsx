import React, { ErrorInfo } from 'react';

export interface ErrorBoundaryFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  resetError?: () => void;
}

/**
 * Default fallback UI component for ErrorBoundary
 */
export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  errorInfo,
  resetError,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '40px 20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        margin: '20px',
      }}
    >
      <div
        style={{
          fontSize: '48px',
          marginBottom: '16px',
          color: '#ff4d4f',
        }}
      >
        ⚠️
      </div>

      <h2
        style={{
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '8px',
          color: '#262626',
        }}
      >
        Something went wrong
      </h2>

      <p
        style={{
          fontSize: '14px',
          color: '#8c8c8c',
          marginBottom: '24px',
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        We're sorry for the inconvenience. An error occurred while loading this
        page.
      </p>

      {isDevelopment && error && (
        <details
          style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '4px',
            maxWidth: '800px',
            width: '100%',
            overflow: 'auto',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#595959',
            }}
          >
            Error Details (Development Only)
          </summary>
          <div style={{ marginTop: '8px' }}>
            <p
              style={{
                color: '#ff4d4f',
                fontFamily: 'monospace',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            >
              {error.toString()}
            </p>
            {errorInfo && (
              <pre
                style={{
                  fontSize: '11px',
                  color: '#595959',
                  overflow: 'auto',
                  backgroundColor: '#fff',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                }}
              >
                {errorInfo.componentStack}
              </pre>
            )}
          </div>
        </details>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        {resetError && (
          <button
            onClick={resetError}
            style={{
              padding: '8px 24px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#fff',
              backgroundColor: '#1890ff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = '#40a9ff')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = '#1890ff')
            }
          >
            Try Again
          </button>
        )}
        <button
          onClick={() => (window.location.href = '/')}
          style={{
            padding: '8px 24px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#595959',
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#40a9ff';
            e.currentTarget.style.color = '#40a9ff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#d9d9d9';
            e.currentTarget.style.color = '#595959';
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundaryFallback;
