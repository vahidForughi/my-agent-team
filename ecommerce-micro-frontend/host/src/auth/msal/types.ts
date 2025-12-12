/**
 * Host MSAL Auth Types
 *
 * Local type definitions for MSAL auth.
 */

/**
 * MSAL Account Info (simplified)
 */
export interface MsalAccountInfo {
  homeAccountId: string;
  localAccountId: string;
  environment: string;
  tenantId: string;
  username: string;
  name?: string;
  idTokenClaims?: Record<string, unknown>;
}

/**
 * User claims from ID token
 */
export interface MsalUserClaims {
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  oid?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  nbf?: number;
  aud?: string;
  iss?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Normalized user object from MSAL authentication
 */
export interface MsalUser {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  accountInfo: MsalAccountInfo;
  claims?: MsalUserClaims;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: MsalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  tokenExpiry: number | null;
  error: Error | null;
}

/**
 * Initial auth state
 */
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,
  tokenExpiry: null,
  error: null,
};

/**
 * Auth context value
 */
export interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  isTokenExpired: () => boolean;
}

/**
 * Host auth context value with additional methods
 */
export interface HostAuthContextValue extends AuthContextValue {
  requestTokenRefresh: () => Promise<string | null>;
}

/**
 * Convert MSAL AccountInfo to MsalUser
 */
export function accountInfoToMsalUser(
  account: MsalAccountInfo,
  idTokenClaims?: MsalUserClaims
): MsalUser {
  const claims = idTokenClaims ?? (account.idTokenClaims as MsalUserClaims | undefined);

  return {
    id: claims?.oid ?? account.localAccountId ?? account.homeAccountId,
    username: account.username || claims?.email || '',
    displayName: account.name || claims?.name || claims?.given_name || account.username || 'User',
    email: claims?.email,
    firstName: claims?.given_name,
    lastName: claims?.family_name,
    accountInfo: account,
    claims,
  };
}

/**
 * Check if token expiry timestamp is expired
 */
export function isExpiryTimestampExpired(
  expiryTimestamp: number | null | undefined,
  bufferSeconds: number = 300
): boolean {
  if (!expiryTimestamp) {
    return true;
  }
  const currentTime = Date.now();
  const bufferTime = bufferSeconds * 1000;
  return currentTime >= expiryTimestamp - bufferTime;
}

/**
 * Get token expiry from JWT
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const claims = JSON.parse(jsonPayload);
    if (typeof claims.exp === 'number') {
      return claims.exp * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Auth event types
 */
export type AuthEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT_SUCCESS'
  | 'TOKEN_ACQUIRED'
  | 'TOKEN_REFRESH'
  | 'TOKEN_EXPIRED'
  | 'AUTH_STATE_CHANGED';

/**
 * Auth event
 */
export interface AuthEvent {
  type: AuthEventType;
  payload?: {
    user?: MsalUser | null;
    accessToken?: string | null;
    error?: Error;
    timestamp: number;
  };
}

/**
 * Auth event listener
 */
export type AuthEventListener = (event: AuthEvent) => void;

/**
 * Auth event emitter
 */
class AuthEventEmitter {
  private listeners: Set<AuthEventListener> = new Set();

  subscribe(listener: AuthEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: AuthEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('[auth] Error in auth event listener:', error);
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const authEventEmitter = new AuthEventEmitter();

export function createAuthEvent(
  type: AuthEventType,
  payload?: Omit<NonNullable<AuthEvent['payload']>, 'timestamp'>
): AuthEvent {
  return {
    type,
    payload: payload
      ? {
          ...payload,
          timestamp: Date.now(),
        }
      : undefined,
  };
}
