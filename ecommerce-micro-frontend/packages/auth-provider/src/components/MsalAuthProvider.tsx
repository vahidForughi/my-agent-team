import React, { useMemo } from 'react';
import {
  PublicClientApplication,
  Configuration,
  LogLevel,
} from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import type { MsalConfigOptions } from '../types';
import { getCurrentOrigin } from '../utils/auth';

interface MsalAuthProviderProps {
  children: React.ReactNode;
  config: MsalConfigOptions;
}

/**
 * Create MSAL configuration from options
 */
function createMsalConfiguration(options: MsalConfigOptions): Configuration {
  const redirectUri = options.redirectUri || getCurrentOrigin();

  return {
    auth: {
      clientId: options.clientId,
      authority: options.authority,
      knownAuthorities: options.knownAuthorities,
      redirectUri,
      postLogoutRedirectUri: options.postLogoutRedirectUri || redirectUri,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              break;
            case LogLevel.Warning:
              console.warn(message);
              break;
            default:
              break;
          }
        },
      },
    },
  };
}

/**
 * MsalAuthProvider
 *
 * Wraps application with MSAL provider for Azure AD authentication.
 */
export const MsalAuthProvider: React.FC<MsalAuthProviderProps> = ({
  children,
  config,
}) => {
  const msalInstance = useMemo(() => {
    const msalConfig = createMsalConfiguration(config);
    return new PublicClientApplication(msalConfig);
  }, [config]);

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

