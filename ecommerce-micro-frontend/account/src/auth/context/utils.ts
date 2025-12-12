import type { User } from '@ecommerce-platform/app-injector';
import type { MsalUser } from '@ecommerce-platform/auth';
import type { HostAuthProps, AuthState, DebugOptions } from './types';

/**
 * Convert app-injector User to MsalUser format
 */
export function convertToMsalUser(user: User | Partial<User>): MsalUser {
  const displayName =
    user.displayName ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    'User';

  return {
    id: user.id || '',
    username: user.username || user.email || '',
    displayName,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    accountInfo: {} as never, // Not available in host mode
    claims: undefined,
  };
}

/**
 * Create initial auth state from host props or debug options
 */
export function createInitialAuthState(
  hostAuth?: HostAuthProps,
  debug?: DebugOptions
): AuthState {
  // Use debug preset if available
  if (debug?.presetToken) {
    return {
      user: debug.presetUser ? convertToMsalUser(debug.presetUser) : null,
      isAuthenticated: true,
      isLoading: false,
      accessToken: debug.presetToken,
      tokenExpiry: null,
      error: null,
    };
  }

  // Use host auth if available
  if (hostAuth) {
    return {
      user: hostAuth.user ? convertToMsalUser(hostAuth.user) : null,
      isAuthenticated: hostAuth.isAuthenticated ?? false,
      isLoading: false,
      accessToken: hostAuth.token ?? null,
      tokenExpiry: hostAuth.tokenExpiry ?? null,
      error: null,
    };
  }

  // Default: not authenticated
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
    tokenExpiry: null,
    error: null,
  };
}

/**
 * Extract user info for HTTP client
 */
export function extractUserInfo(user: MsalUser | null) {
  if (!user) return null;
  return {
    username: user.username,
    email: user.email,
  };
}
