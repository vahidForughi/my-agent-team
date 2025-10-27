import React from 'react';
import { screen, waitFor } from '@testing-library/react';
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

jest.mock(
  'store/Module',
  () => ({
    inject: jest.fn(),
    unmount: jest.fn(),
  }),
  { virtual: true }
);

jest.mock(
  'account/Module',
  () => ({
    inject: jest.fn(),
    unmount: jest.fn(),
  }),
  { virtual: true }
);

jest.mock(
  'checkout/Module',
  () => ({
    inject: jest.fn(),
    unmount: jest.fn(),
  }),
  { virtual: true }
);

describe('Micro-Frontend Loading Integration', () => {
  let localStorageMock: ReturnType<typeof setupLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = setupLocalStorageMock();
    jest.clearAllMocks();
  });

  describe('Store Micro-Frontend', () => {
    it('should load Store micro-frontend successfully', async () => {
      const mockStoreModule = require('store/Module');

      renderWithProviders(<StoreApp />);

      expect(screen.getByText(/loading store/i)).toBeInTheDocument();

      await waitFor(
        () => {
          expect(mockStoreModule.inject).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      const injectCall = mockStoreModule.inject.mock.calls[0];
      expect(injectCall[0]).toMatch(/store-container-/);
      expect(injectCall[1]).toHaveProperty('config');
      expect(injectCall[1].config).toHaveProperty('appContext');
      expect(injectCall[1].config).toHaveProperty('onNavigate');
      expect(injectCall[1].config).toHaveProperty('onError');
    });

    it('should handle Store module loading error', async () => {
      const mockError = new Error('Failed to load store module');
      jest.doMock(
        'store/Module',
        () => {
          throw mockError;
        },
        { virtual: true }
      );

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Suppress console errors in tests
        });

      renderWithProviders(<StoreApp />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[StoreApp] Failed to load'),
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should unmount Store module on cleanup', async () => {
      const mockStoreModule = createMockModule();
      jest.doMock('store/Module', () => mockStoreModule, { virtual: true });

      const { unmount } = renderWithProviders(<StoreApp />);

      await waitFor(() => {
        expect(mockStoreModule.inject).toHaveBeenCalled();
      });

      unmount();

      expect(mockStoreModule.unmount).toHaveBeenCalled();
    });
  });

  describe('Account Micro-Frontend', () => {
    it('should load Account micro-frontend successfully', async () => {
      const mockAccountModule = createMockModule();
      jest.doMock('account/Module', () => mockAccountModule, { virtual: true });

      renderWithProviders(<AccountApp />);

      expect(screen.getByText(/loading account/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(mockAccountModule.inject).toHaveBeenCalled();
      });

      const injectCall = mockAccountModule.inject.mock.calls[0];
      expect(injectCall[0]).toMatch(/account-container-/);
      expect(injectCall[1]).toHaveProperty('config');
    });

    it('should unmount Account module on cleanup', async () => {
      const mockAccountModule = createMockModule();
      jest.doMock('account/Module', () => mockAccountModule, { virtual: true });

      const { unmount } = renderWithProviders(<AccountApp />);

      await waitFor(() => {
        expect(mockAccountModule.inject).toHaveBeenCalled();
      });

      unmount();

      expect(mockAccountModule.unmount).toHaveBeenCalled();
    });
  });

  describe('Checkout Micro-Frontend', () => {
    it('should load Checkout micro-frontend successfully', async () => {
      const mockCheckoutModule = createMockModule();
      jest.doMock('checkout/Module', () => mockCheckoutModule, {
        virtual: true,
      });

      renderWithProviders(<CheckoutApp />);

      expect(screen.getByText(/loading checkout/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(mockCheckoutModule.inject).toHaveBeenCalled();
      });

      const injectCall = mockCheckoutModule.inject.mock.calls[0];
      expect(injectCall[0]).toMatch(/checkout-container-/);
      expect(injectCall[1]).toHaveProperty('config');
    });

    it('should unmount Checkout module on cleanup', async () => {
      const mockCheckoutModule = createMockModule();
      jest.doMock('checkout/Module', () => mockCheckoutModule, {
        virtual: true,
      });

      const { unmount } = renderWithProviders(<CheckoutApp />);

      await waitFor(() => {
        expect(mockCheckoutModule.inject).toHaveBeenCalled();
      });

      unmount();

      expect(mockCheckoutModule.unmount).toHaveBeenCalled();
    });
  });

  describe('Module Loading Error Scenarios', () => {
    it('should handle missing inject method', async () => {
      const mockModule = {
        unmount: jest.fn(),
      };

      jest.doMock('store/Module', () => mockModule, { virtual: true });

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Suppress console errors in tests
        });

      renderWithProviders(<StoreApp />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[StoreApp] Failed to load'),
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle container ref not available', async () => {
      const mockStoreModule = createMockModule();
      jest.doMock('store/Module', () => mockStoreModule, { virtual: true });

      Object.defineProperty(HTMLElement.prototype, 'current', {
        get: () => null,
        configurable: true,
      });

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Suppress console errors in tests
        });

      renderWithProviders(<StoreApp />);

      await waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Concurrent Module Loading', () => {
    it('should load multiple micro-frontends concurrently', async () => {
      const mockStoreModule = createMockModule();
      const mockAccountModule = createMockModule();
      const mockCheckoutModule = createMockModule();

      jest.doMock('store/Module', () => mockStoreModule, { virtual: true });
      jest.doMock('account/Module', () => mockAccountModule, { virtual: true });
      jest.doMock('checkout/Module', () => mockCheckoutModule, {
        virtual: true,
      });

      const { container: storeContainer } = renderWithProviders(<StoreApp />);
      const { container: accountContainer } = renderWithProviders(
        <AccountApp />
      );
      const { container: checkoutContainer } = renderWithProviders(
        <CheckoutApp />
      );

      await waitFor(() => {
        expect(mockStoreModule.inject).toHaveBeenCalled();
        expect(mockAccountModule.inject).toHaveBeenCalled();
        expect(mockCheckoutModule.inject).toHaveBeenCalled();
      });

      expect(storeContainer).toBeTruthy();
      expect(accountContainer).toBeTruthy();
      expect(checkoutContainer).toBeTruthy();
    });
  });
});
