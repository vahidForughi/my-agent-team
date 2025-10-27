import React from 'react';

export interface LoaderBoundaryProps {
  error?: Error;
  errorCode?: string | number;
  onRetry?: () => void;
}

const HTTP_STATUS_MESSAGES: Record<string, string> = {
  '400': 'Bad Request - The request could not be understood by the server',
  '401': 'Unauthorized - Authentication is required',
  '403': 'Forbidden - You do not have permission to access this resource',
  '404': 'Not Found - The requested resource could not be found',
  '500': 'Internal Server Error - Something went wrong on our end',
  '502': 'Bad Gateway - The server received an invalid response',
  '503': 'Service Unavailable - The service is temporarily unavailable',
  default: 'An unexpected error occurred. Please try again later.',
};

/**
 * LoaderBoundary component displays appropriate error messages for different error types
 * Typically used with React Router's errorElement prop
 */
export const LoaderBoundary: React.FC<LoaderBoundaryProps> = ({
  error,
  errorCode,
  onRetry,
}) => {
  const getErrorMessage = (): string => {
    if (errorCode) {
      return (
        HTTP_STATUS_MESSAGES[errorCode.toString()] ||
        HTTP_STATUS_MESSAGES.default
      );
    }

    if (error) {
      // Try to extract status code from error
      const status = (error as any)?.response?.status || (error as any)?.code;
      if (status) {
        return (
          HTTP_STATUS_MESSAGES[status.toString()] ||
          HTTP_STATUS_MESSAGES.default
        );
      }
      return error.message || HTTP_STATUS_MESSAGES.default;
    }

    return HTTP_STATUS_MESSAGES.default;
  };

  const getErrorTitle = (): string => {
    if (errorCode) {
      return `Error ${errorCode}`;
    }

    const status = (error as any)?.response?.status || (error as any)?.code;
    if (status) {
      return `Error ${status}`;
    }

    return 'Error';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '64px',
          marginBottom: '24px',
          opacity: 0.4,
        }}
      >
        ⚠️
      </div>

      <h3
        style={{
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: '8px',
          color: '#262626',
        }}
      >
        {getErrorTitle()}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: '#8c8c8c',
          marginBottom: '24px',
          maxWidth: '500px',
        }}
      >
        {getErrorMessage()}
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        {onRetry && (
          <button
            onClick={onRetry}
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
          onClick={() => window.history.back()}
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
          Go Back
        </button>
      </div>
    </div>
  );
};

export default LoaderBoundary;
