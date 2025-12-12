import { createContext } from 'react';
import type { AccountAuthContextValue } from './types';

/**
 * Account Auth Context
 *
 * Provides authentication state and operations to child components.
 */
export const AccountAuthContext = createContext<AccountAuthContextValue | null>(
  null
);
