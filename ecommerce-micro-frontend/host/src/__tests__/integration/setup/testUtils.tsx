/// <reference types="jest" />
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { AppConfigProvider } from '../../../context/AppConfigContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: Partial<MemoryRouterProps>;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
) => {
  const { routerProps, ...renderOptions } = options || {};

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={['/']} {...routerProps}>
      <AppConfigProvider>{children}</AppConfigProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export const mockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

export const setupLocalStorageMock = () => {
  const mockStorage = mockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });
  return mockStorage;
};

export const createMockUser = (overrides = {}) => ({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'user' as const,
  ...overrides,
});

export const createMockModule = () => ({
  inject: jest.fn(),
  unmount: jest.fn(),
  default: jest.fn(() => <div>Mocked Module</div>),
});

export * from '@testing-library/react';
