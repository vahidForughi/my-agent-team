/**
 * Account Module - Auth Provider
 *
 * Unified authentication provider that receives auth from host application.
 * Includes debug mode with preset token for local development.
 */

import React, { useContext, useState, useEffect } from 'react';
import { InternalAuthProvider } from './InternalAuthProvider';
import { AccountAuthContext } from './AccountAuthContext';
import type { AccountAuthProviderProps, AccountAuthContextValue } from './types';

// Re-export types
export type { HostAuthProps, AccountAuthContextValue, DebugOptions } from './types';

/**
 * AccountAuthProvider
 *
 * Main auth provider for the account module.
 * - Uses host auth when running as a remote module
 * - Uses debug.presetToken for local development
 */
export const AccountAuthProvider: React.FC<AccountAuthProviderProps> = ({
  children,
  hostAuth,
  debug = {},
}) => {
  const [isDoneSetup, setIsDoneSetup] = useState(false);

  useEffect(() => {
    if (debug.presetToken) {
      if (debug.logging) {
        console.log('[AccountAuth] Using preset token for development');
      }
    }
    setIsDoneSetup(true);
  }, [debug.presetToken, debug.logging]);

  return (
    <InternalAuthProvider hostAuth={hostAuth} debug={debug}>
      {isDoneSetup ? children : null}
    </InternalAuthProvider>
  );
};

/**
 * Hook to access account auth context
 */
export const useAccountAuth = (): AccountAuthContextValue => {
  const context = useContext(AccountAuthContext);
  if (!context) {
    throw new Error('useAccountAuth must be used within AccountAuthProvider');
  }
  return context;
};
