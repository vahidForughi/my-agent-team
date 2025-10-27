import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {
  renderWithProviders,
  setupLocalStorageMock,
  createMockUser,
} from './setup/testUtils';
import { useAppConfig } from '../../context/AppConfigContext';

jest.mock('../../helpers/auth', () => ({
  getAuthToken: jest.fn(() => 'mock-token-123'),
  isAuthenticated: jest.fn(() => true),
  logout: jest.fn(),
}));

const TestComponent: React.FC = () => {
  const { config, appContext, updateUser, updateTheme } = useAppConfig();

  return (
    <div>
      <div data-testid="user-name">
        {appContext.user?.firstName || 'No user'}
      </div>
      <div data-testid="theme">{appContext.theme}</div>
      <div data-testid="token">{appContext.token}</div>
      <div data-testid="locale">{appContext.locale}</div>
      <div data-testid="base-path">{appContext.basePath}</div>
      <div data-testid="api-url">{appContext.apiBaseUrl}</div>
      <button onClick={() => updateUser(createMockUser({ firstName: 'Jane' }))}>
        Update User
      </button>
      <button onClick={() => updateTheme('dark')}>Change Theme</button>
      <button onClick={() => config.onNavigate?.('/test')}>Navigate</button>
      <button onClick={() => config.onLogout?.()}>Logout</button>
      <button onClick={() => config.onError?.(new Error('Test error'))}>
        Trigger Error
      </button>
    </div>
  );
};

describe('App Context Integration', () => {
  let localStorageMock: ReturnType<typeof setupLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = setupLocalStorageMock();
    jest.clearAllMocks();
  });

  describe('Context Initialization', () => {
    it('should initialize with default values', () => {
      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('token')).toHaveTextContent('mock-token-123');
      expect(screen.getByTestId('locale')).toHaveTextContent('en-US');
      expect(screen.getByTestId('base-path')).toHaveTextContent('');
    });

    it('should load user from localStorage if authenticated', () => {
      const mockUser = createMockUser();
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('user-name')).toHaveTextContent('John');
    });

    it('should load theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'theme') return 'dark';
        return null;
      });

      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
  });

  describe('Context Updates', () => {
    it('should update user and persist to localStorage', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('user-name')).toHaveTextContent('No user');

      const updateButton = screen.getByRole('button', {
        name: /update user/i,
      });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Jane');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        expect.stringContaining('Jane')
      );
    });

    it('should update theme and persist to localStorage', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('theme')).toHaveTextContent('light');

      const themeButton = screen.getByRole('button', {
        name: /change theme/i,
      });
      await user.click(themeButton);

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('Config Callbacks', () => {
    it('should provide navigation callback', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TestComponent />);

      const navButton = screen.getByRole('button', { name: /navigate/i });
      await user.click(navButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/test');
      });
    });

    it('should provide logout callback', async () => {
      const mockLogout = require('../../helpers/auth').logout;
      const user = userEvent.setup();

      const mockUser = createMockUser();
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('user-name')).toHaveTextContent('John');

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      });
    });

    it('should provide error handler callback', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Suppress console errors in tests
        });
      const user = userEvent.setup();

      renderWithProviders(<TestComponent />);

      const errorButton = screen.getByRole('button', {
        name: /trigger error/i,
      });
      await user.click(errorButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AppConfig] Micro-frontend error:'),
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Multiple Component Integration', () => {
    it('should share context across multiple components', async () => {
      const Component1: React.FC = () => {
        const { appContext, updateUser } = useAppConfig();
        return (
          <div>
            <div data-testid="comp1-user">
              {appContext.user?.firstName || 'None'}
            </div>
            <button
              onClick={() =>
                updateUser(createMockUser({ firstName: 'Updated' }))
              }
            >
              Update from Comp1
            </button>
          </div>
        );
      };

      const Component2: React.FC = () => {
        const { appContext } = useAppConfig();
        return (
          <div data-testid="comp2-user">
            {appContext.user?.firstName || 'None'}
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(
        <>
          <Component1 />
          <Component2 />
        </>
      );

      expect(screen.getByTestId('comp1-user')).toHaveTextContent('None');
      expect(screen.getByTestId('comp2-user')).toHaveTextContent('None');

      const updateButton = screen.getByRole('button');
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId('comp1-user')).toHaveTextContent('Updated');
        expect(screen.getByTestId('comp2-user')).toHaveTextContent('Updated');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Suppress console errors in tests
        });
      const user = userEvent.setup();

      renderWithProviders(<TestComponent />);

      const navButton = screen.getByRole('button', { name: /navigate/i });
      await user.click(navButton);

      consoleErrorSpy.mockRestore();
    });

    it('should handle logout errors gracefully', async () => {
      const mockLogout = require('../../helpers/auth').logout;
      mockLogout.mockImplementation(() => {
        throw new Error('Logout failed');
      });

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Suppress console errors in tests
        });
      const user = userEvent.setup();

      renderWithProviders(<TestComponent />);

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AppConfig] Logout error:'),
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
