import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  renderWithProviders,
  setupLocalStorageMock,
  createMockModule,
} from './setup/testUtils';
import StoreApp from '../../microFe/StoreApp';
import { ErrorBoundary } from '@shared/ui';

jest.mock('../../helpers/auth', () => ({
  getAuthToken: jest.fn(() => 'mock-token'),
  isAuthenticated: jest.fn(() => true),
  logout: jest.fn(),
}));

const ThrowError: React.FC<{ shouldThrow?: boolean; error?: Error }> = ({
  shouldThrow = true,
  error = new Error('Test error'),
}) => {
  if (shouldThrow) {
    throw error;
  }
  return <div>No Error</div>;
};

const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div role="alert">
    <h2>Something went wrong</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try Again</button>
  </div>
);

describe('Error Boundary Integration', () => {
  let localStorageMock: ReturnType<typeof setupLocalStorageMock>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorageMock = setupLocalStorageMock();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Suppress console errors in tests
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Basic Error Boundary', () => {
    it('should catch and display errors', () => {
      renderWithProviders(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should not display error boundary for successful renders', () => {
      renderWithProviders(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No Error')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should display custom error messages', () => {
      const customError = new Error('Custom error message');

      renderWithProviders(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ThrowError error={customError} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should allow error recovery via reset', async () => {
      const user = userEvent.setup();
      const shouldThrow = true;

      const TestComponent: React.FC = () => {
        const [throwError, setThrowError] = React.useState(shouldThrow);

        return (
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => setThrowError(false)}
          >
            <ThrowError shouldThrow={throwError} />
          </ErrorBoundary>
        );
      };

      renderWithProviders(<TestComponent />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Micro-Frontend Error Handling', () => {
    it('should catch errors during module loading', async () => {
      const mockError = new Error('Failed to load module');
      jest.doMock(
        'store/Module',
        () => {
          throw mockError;
        },
        { virtual: true }
      );

      renderWithProviders(<StoreApp />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[StoreApp] Failed to load'),
          expect.any(Error)
        );
      });
    });

    it('should display error retry option for Store module', async () => {
      const mockStoreModule = {
        inject: jest.fn(() => {
          throw new Error('Inject failed');
        }),
        unmount: jest.fn(),
      };

      jest.doMock('store/Module', () => mockStoreModule, { virtual: true });

      renderWithProviders(<StoreApp />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });

    it('should handle unmount errors gracefully', async () => {
      const mockStoreModule = createMockModule();
      mockStoreModule.unmount.mockImplementation(() => {
        throw new Error('Unmount failed');
      });

      jest.doMock('store/Module', () => mockStoreModule, { virtual: true });

      const { unmount } = renderWithProviders(<StoreApp />);

      await waitFor(() => {
        expect(mockStoreModule.inject).toHaveBeenCalled();
      });

      unmount();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[StoreApp] Failed to unmount:'),
        expect.any(Error)
      );
    });
  });

  describe('Nested Error Boundaries', () => {
    it('should isolate errors to nearest boundary', () => {
      const OuterFallback: React.FC<{ error: Error }> = ({ error }) => (
        <div data-testid="outer-fallback">{error.message}</div>
      );

      const InnerFallback: React.FC<{ error: Error }> = ({ error }) => (
        <div data-testid="inner-fallback">{error.message}</div>
      );

      renderWithProviders(
        <ErrorBoundary FallbackComponent={OuterFallback}>
          <div>Outer Content</div>
          <ErrorBoundary FallbackComponent={InnerFallback}>
            <ThrowError error={new Error('Inner error')} />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('inner-fallback')).toBeInTheDocument();
      expect(screen.getByText('Outer Content')).toBeInTheDocument();
      expect(screen.queryByTestId('outer-fallback')).not.toBeInTheDocument();
    });

    it('should bubble errors to outer boundary if inner catches and rethrows', () => {
      const OuterFallback: React.FC<{ error: Error }> = ({ error }) => (
        <div data-testid="outer-fallback">{error.message}</div>
      );

      const InnerBoundaryThatRethrows: React.FC<{
        children: React.ReactNode;
      }> = ({ children }) => {
        return (
          <ErrorBoundary
            onError={(error) => {
              throw error;
            }}
            FallbackComponent={() => null}
          >
            {children}
          </ErrorBoundary>
        );
      };

      renderWithProviders(
        <ErrorBoundary FallbackComponent={OuterFallback}>
          <InnerBoundaryThatRethrows>
            <ThrowError error={new Error('Bubbled error')} />
          </InnerBoundaryThatRethrows>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('outer-fallback')).toBeInTheDocument();
      expect(screen.getByText('Bubbled error')).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log errors to console', () => {
      renderWithProviders(
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Caught error:', error, errorInfo);
          }}
          FallbackComponent={ErrorFallback}
        >
          <ThrowError error={new Error('Logged error')} />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Caught error:'),
        expect.any(Error),
        expect.anything()
      );
    });

    it('should call custom error handler', () => {
      const customErrorHandler = jest.fn();

      renderWithProviders(
        <ErrorBoundary
          onError={customErrorHandler}
          FallbackComponent={ErrorFallback}
        >
          <ThrowError error={new Error('Custom handled error')} />
        </ErrorBoundary>
      );

      expect(customErrorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Error Boundary with Async Operations', () => {
    it('should handle errors in async component operations', async () => {
      const AsyncErrorComponent: React.FC = () => {
        const [, setError] = React.useState<Error | null>(null);

        React.useEffect(() => {
          setTimeout(() => {
            setError(() => {
              throw new Error('Async error');
            });
          }, 100);
        }, []);

        return <div>Async Component</div>;
      };

      renderWithProviders(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <AsyncErrorComponent />
        </ErrorBoundary>
      );

      await waitFor(
        () => {
          expect(screen.queryByRole('alert')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Error Recovery', () => {
    it('should maintain state after error recovery', async () => {
      const user = userEvent.setup();
      let attemptNumber = 0;

      const UnstableComponent: React.FC = () => {
        const [count, setCount] = React.useState(0);

        attemptNumber++;
        if (attemptNumber === 1) {
          throw new Error('First attempt failed');
        }

        return (
          <div>
            <div>Count: {count}</div>
            <button onClick={() => setCount(count + 1)}>Increment</button>
          </div>
        );
      };

      const TestWithRecovery: React.FC = () => {
        const [key, setKey] = React.useState(0);

        return (
          <ErrorBoundary
            resetKeys={[key]}
            onReset={() => setKey((k) => k + 1)}
            FallbackComponent={ErrorFallback}
          >
            <UnstableComponent />
          </ErrorBoundary>
        );
      };

      renderWithProviders(<TestWithRecovery />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Count: 0')).toBeInTheDocument();
      });

      const incrementButton = screen.getByRole('button', {
        name: /increment/i,
      });
      await user.click(incrementButton);

      await waitFor(() => {
        expect(screen.getByText('Count: 1')).toBeInTheDocument();
      });
    });
  });
});
