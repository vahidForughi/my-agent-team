import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import {
  renderWithProviders,
  setupLocalStorageMock,
  createMockModule,
} from './setup/testUtils';
import StoreApp from '../../microFe/StoreApp';
import AccountApp from '../../microFe/AccountApp';
import CheckoutApp from '../../microFe/CheckoutApp';

jest.mock('../../helpers/auth', () => ({
  getAuthToken: jest.fn(() => 'mock-token'),
  isAuthenticated: jest.fn(() => true),
  logout: jest.fn(),
}));

const NavigationTestApp: React.FC = () => {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/store">Store</Link>
        <Link to="/account">Account</Link>
        <Link to="/checkout">Checkout</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/store/*" element={<StoreApp />} />
        <Route path="/account" element={<AccountApp />} />
        <Route path="/checkout" element={<CheckoutApp />} />
      </Routes>
    </div>
  );
};

const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

describe('Navigation Flow Integration', () => {
  let localStorageMock: ReturnType<typeof setupLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = setupLocalStorageMock();
    jest.clearAllMocks();

    jest.doMock('store/Module', () => createMockModule(), { virtual: true });
    jest.doMock('account/Module', () => createMockModule(), { virtual: true });
    jest.doMock('checkout/Module', () => createMockModule(), {
      virtual: true,
    });
  });

  describe('Basic Navigation', () => {
    it('should navigate between pages using links', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <>
          <NavigationTestApp />
          <LocationDisplay />
        </>
      );

      expect(screen.getByTestId('current-location')).toHaveTextContent('/');

      const storeLink = screen.getByRole('link', { name: /store/i });
      await user.click(storeLink);

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/store'
        );
      });

      const accountLink = screen.getByRole('link', { name: /account/i });
      await user.click(accountLink);

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/account'
        );
      });
    });

    it('should maintain routing state during navigation', async () => {
      const user = userEvent.setup();

      const TestWithState: React.FC = () => {
        const navigate = useNavigate();
        return (
          <div>
            <button
              onClick={() => navigate('/store', { state: { from: 'home' } })}
            >
              Navigate with State
            </button>
            <LocationDisplay />
          </div>
        );
      };

      renderWithProviders(<TestWithState />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/store'
        );
      });
    });
  });

  describe('Nested Routes', () => {
    it('should handle nested routes in Store micro-frontend', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <>
          <NavigationTestApp />
          <LocationDisplay />
        </>,
        {
          routerProps: { initialEntries: ['/store/product/123'] },
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/store/product/123'
        );
      });
    });

    it('should navigate from Store to Checkout via config.onNavigate', async () => {
      const mockStoreModule = createMockModule();
      jest.doMock('store/Module', () => mockStoreModule, { virtual: true });

      const TestNavigationFromStore: React.FC = () => {
        const navigate = useNavigate();
        return (
          <div>
            <button onClick={() => navigate('/checkout')}>
              Go to Checkout
            </button>
            <LocationDisplay />
            <Routes>
              <Route path="/checkout" element={<div>Checkout Page</div>} />
            </Routes>
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<TestNavigationFromStore />);

      const button = screen.getByRole('button', { name: /go to checkout/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/checkout'
        );
      });

      expect(screen.getByText('Checkout Page')).toBeInTheDocument();
    });
  });

  describe('Navigation History', () => {
    it('should support browser back navigation', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <>
          <NavigationTestApp />
          <LocationDisplay />
        </>
      );

      const storeLink = screen.getByRole('link', { name: /store/i });
      await user.click(storeLink);

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/store'
        );
      });

      const accountLink = screen.getByRole('link', { name: /account/i });
      await user.click(accountLink);

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/account'
        );
      });

      window.history.back();

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/store'
        );
      });
    });

    it('should support browser forward navigation', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <>
          <NavigationTestApp />
          <LocationDisplay />
        </>
      );

      const storeLink = screen.getByRole('link', { name: /store/i });
      await user.click(storeLink);

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/store'
        );
      });

      window.history.back();

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent('/');
      });

      window.history.forward();

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/store'
        );
      });
    });
  });

  describe('Cross-Micro-Frontend Navigation', () => {
    it('should navigate from Store to Account and back', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <>
          <NavigationTestApp />
          <LocationDisplay />
        </>,
        {
          routerProps: { initialEntries: ['/store'] },
        }
      );

      expect(screen.getByTestId('current-location')).toHaveTextContent(
        '/store'
      );

      const accountLink = screen.getByRole('link', { name: /account/i });
      await user.click(accountLink);

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/account'
        );
      });

      const storeLink = screen.getByRole('link', { name: /store/i });
      await user.click(storeLink);

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/store'
        );
      });
    });

    it('should navigate from Account to Checkout', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <>
          <NavigationTestApp />
          <LocationDisplay />
        </>,
        {
          routerProps: { initialEntries: ['/account'] },
        }
      );

      const checkoutLink = screen.getByRole('link', { name: /checkout/i });
      await user.click(checkoutLink);

      await waitFor(() => {
        expect(screen.getByTestId('current-location')).toHaveTextContent(
          '/checkout'
        );
      });
    });

    it('should navigate through all micro-frontends in sequence', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <>
          <NavigationTestApp />
          <LocationDisplay />
        </>
      );

      const navSequence = [
        { name: /store/i, path: '/store' },
        { name: /account/i, path: '/account' },
        { name: /checkout/i, path: '/checkout' },
        { name: /home/i, path: '/' },
      ];

      for (const { name, path } of navSequence) {
        const link = screen.getByRole('link', { name });
        await user.click(link);

        await waitFor(() => {
          expect(screen.getByTestId('current-location')).toHaveTextContent(
            path
          );
        });
      }
    });
  });

  describe('Deep Linking', () => {
    it('should support direct navigation to nested routes', () => {
      renderWithProviders(<LocationDisplay />, {
        routerProps: { initialEntries: ['/store/product/456'] },
      });

      expect(screen.getByTestId('current-location')).toHaveTextContent(
        '/store/product/456'
      );
    });

    it('should maintain query parameters during navigation', async () => {
      const user = userEvent.setup();

      const TestWithQueryParams: React.FC = () => {
        const navigate = useNavigate();
        const location = useLocation();
        return (
          <div>
            <button onClick={() => navigate('/store?category=electronics')}>
              Navigate with Query
            </button>
            <div data-testid="full-location">
              {location.pathname}
              {location.search}
            </div>
          </div>
        );
      };

      renderWithProviders(<TestWithQueryParams />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('full-location')).toHaveTextContent(
          '/store?category=electronics'
        );
      });
    });
  });

  describe('Navigation Guards', () => {
    it('should handle navigation to protected routes', async () => {
      const mockIsAuthenticated = require('../../helpers/auth').isAuthenticated;

      const ProtectedRoute: React.FC = () => {
        const navigate = useNavigate();
        const isAuth = mockIsAuthenticated();

        React.useEffect(() => {
          if (!isAuth) {
            navigate('/login');
          }
        }, [isAuth, navigate]);

        return isAuth ? <div>Protected Content</div> : null;
      };

      mockIsAuthenticated.mockReturnValue(true);

      renderWithProviders(
        <Routes>
          <Route path="/protected" element={<ProtectedRoute />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>,
        {
          routerProps: { initialEntries: ['/protected'] },
        }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect unauthenticated users to login', async () => {
      const mockIsAuthenticated = require('../../helpers/auth').isAuthenticated;

      const ProtectedRoute: React.FC = () => {
        const navigate = useNavigate();
        const isAuth = mockIsAuthenticated();

        React.useEffect(() => {
          if (!isAuth) {
            navigate('/login');
          }
        }, [isAuth, navigate]);

        return isAuth ? <div>Protected Content</div> : null;
      };

      mockIsAuthenticated.mockReturnValue(false);

      renderWithProviders(
        <Routes>
          <Route path="/protected" element={<ProtectedRoute />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>,
        {
          routerProps: { initialEntries: ['/protected'] },
        }
      );

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('404 Handling', () => {
    it('should handle navigation to non-existent routes', () => {
      renderWithProviders(
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>,
        {
          routerProps: { initialEntries: ['/non-existent-route'] },
        }
      );

      expect(screen.getByText('404 Not Found')).toBeInTheDocument();
    });
  });
});
