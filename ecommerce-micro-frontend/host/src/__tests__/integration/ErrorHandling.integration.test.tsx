import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, setupLocalStorageMock } from './setup/testUtils';
import { useAppConfig } from '../../context/AppConfigContext';

jest.mock('../../helpers/auth', () => ({
  getAuthToken: jest.fn(() => 'mock-token'),
  isAuthenticated: jest.fn(() => true),
  logout: jest.fn(),
}));

describe('Error Handling Integration', () => {
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

  describe('Config Error Handler', () => {
    it('should handle errors via config.onError', async () => {
      const TestComponent: React.FC = () => {
        const { config } = useAppConfig();

        return (
          <button onClick={() => config.onError?.(new Error('Test error'))}>
            Trigger Error
          </button>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<TestComponent />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AppConfig] Micro-frontend error:'),
          expect.any(Error)
        );
      });
    });

    it('should log error message to console', async () => {
      const TestComponent: React.FC = () => {
        const { config } = useAppConfig();

        return (
          <button
            onClick={() => config.onError?.(new Error('Custom error message'))}
          >
            Error
          </button>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<TestComponent />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        const errorCall = consoleErrorSpy.mock.calls.find((call) =>
          call[0].includes('[AppConfig] Micro-frontend error:')
        );
        expect(errorCall).toBeTruthy();
        expect(errorCall[1].message).toBe('Custom error message');
      });
    });
  });

  describe('Navigation Error Handling', () => {
    it('should catch navigation errors', async () => {
      const TestComponent: React.FC = () => {
        const { config } = useAppConfig();

        return (
          <button onClick={() => config.onNavigate?.('/test-route')}>
            Navigate
          </button>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<TestComponent />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(window.location.pathname).toBe('/test-route');
    });
  });

  describe('Logout Error Handling', () => {
    it('should handle logout errors gracefully', async () => {
      const mockLogout = require('../../helpers/auth').logout;
      mockLogout.mockImplementation(() => {
        throw new Error('Logout failed');
      });

      const TestComponent: React.FC = () => {
        const { config } = useAppConfig();

        return <button onClick={() => config.onLogout?.()}>Logout</button>;
      };

      const user = userEvent.setup();
      renderWithProviders(<TestComponent />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AppConfig] Logout error:'),
          expect.any(Error)
        );
      });
    });

    it('should clear user data after logout', async () => {
      const TestComponent: React.FC = () => {
        const { config, appContext } = useAppConfig();

        return (
          <div>
            <div data-testid="user">{appContext.user?.firstName || 'None'}</div>
            <button onClick={() => config.onLogout?.()}>Logout</button>
          </div>
        );
      };

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('user')).toHaveTextContent('John');

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      });
    });
  });

  describe('Error Propagation', () => {
    it('should propagate errors from child components', async () => {
      const ChildWithError: React.FC<{ shouldError: boolean }> = ({
        shouldError,
      }) => {
        const { config } = useAppConfig();

        React.useEffect(() => {
          if (shouldError) {
            config.onError?.(new Error('Child component error'));
          }
        }, [shouldError, config]);

        return <div>Child Component</div>;
      };

      const Parent: React.FC = () => {
        const [hasError, setHasError] = React.useState(false);

        return (
          <div>
            <button onClick={() => setHasError(true)}>Cause Error</button>
            <ChildWithError shouldError={hasError} />
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<Parent />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });
  });
});
