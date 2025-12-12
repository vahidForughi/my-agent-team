/**
 * Host MSAL Token Broadcast
 *
 * Broadcasts token updates to remote micro-frontends using custom events.
 * This ensures remotes receive fresh tokens even if they're not
 * directly subscribed to the host's auth context.
 */

/**
 * Token broadcast event detail
 */
export interface TokenBroadcastEventDetail {
  token: string | null;
  tokenExpiry: number | null;
  timestamp: number;
}

/**
 * Custom event name for token broadcasts
 */
export const TOKEN_BROADCAST_EVENT = 'ecommerce:token:refresh';

/**
 * Custom event name for auth state broadcasts
 */
export const AUTH_STATE_BROADCAST_EVENT = 'ecommerce:auth:state';

/**
 * Auth state broadcast event detail
 */
export interface AuthStateBroadcastEventDetail {
  isAuthenticated: boolean;
  user: {
    id?: string;
    username?: string;
    email?: string;
    displayName?: string;
  } | null;
  timestamp: number;
}

/**
 * Broadcast a new token to all micro-frontends
 */
export function broadcastToken(token: string | null, tokenExpiry: number | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  const detail: TokenBroadcastEventDetail = {
    token,
    tokenExpiry,
    timestamp: Date.now(),
  };

  const event = new CustomEvent(TOKEN_BROADCAST_EVENT, { detail });
  window.dispatchEvent(event);

  console.log('[TokenBroadcast] Token broadcasted to remotes');
}

/**
 * Broadcast auth state change to all micro-frontends
 */
export function broadcastAuthState(
  isAuthenticated: boolean,
  user: AuthStateBroadcastEventDetail['user']
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const detail: AuthStateBroadcastEventDetail = {
    isAuthenticated,
    user,
    timestamp: Date.now(),
  };

  const event = new CustomEvent(AUTH_STATE_BROADCAST_EVENT, { detail });
  window.dispatchEvent(event);

  console.log('[TokenBroadcast] Auth state broadcasted to remotes');
}

/**
 * Subscribe to token broadcasts (for use in remotes)
 */
export function subscribeToTokenBroadcast(
  callback: (detail: TokenBroadcastEventDetail) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<TokenBroadcastEventDetail>;
    callback(customEvent.detail);
  };

  window.addEventListener(TOKEN_BROADCAST_EVENT, handler);

  return () => {
    window.removeEventListener(TOKEN_BROADCAST_EVENT, handler);
  };
}

/**
 * Subscribe to auth state broadcasts (for use in remotes)
 */
export function subscribeToAuthStateBroadcast(
  callback: (detail: AuthStateBroadcastEventDetail) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<AuthStateBroadcastEventDetail>;
    callback(customEvent.detail);
  };

  window.addEventListener(AUTH_STATE_BROADCAST_EVENT, handler);

  return () => {
    window.removeEventListener(AUTH_STATE_BROADCAST_EVENT, handler);
  };
}

