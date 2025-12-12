/**
 * Account Module - Token Broadcast Subscription Hook
 *
 * Subscribes to token broadcasts from the host application.
 * Used in host-integrated mode to receive fresh tokens.
 */

import { useEffect, useState, useCallback } from 'react';
import { authTokenProvider } from '../../http/auth-token-provider';

const TOKEN_BROADCAST_EVENT = 'ecommerce:token:refresh';

interface TokenBroadcastEventDetail {
  token: string | null;
  tokenExpiry: number | null;
  timestamp: number;
}

interface TokenBroadcastState {
  token: string | null;
  tokenExpiry: number | null;
  lastUpdated: number;
}

/**
 * Hook to subscribe to token broadcasts from host
 *
 * Returns the latest broadcasted token state.
 * Automatically updates authTokenProvider cache.
 */
export function useTokenBroadcastSubscription(enabled = true): TokenBroadcastState {
  const [state, setState] = useState<TokenBroadcastState>({
    token: null,
    tokenExpiry: null,
    lastUpdated: 0,
  });

  const handleTokenBroadcast = useCallback((event: Event) => {
    const { token, tokenExpiry, timestamp } = (event as CustomEvent<TokenBroadcastEventDetail>).detail;

    console.log('[Account] Received token broadcast from host:', {
      hasToken: !!token,
      timestamp: new Date(timestamp).toISOString(),
    });

    // Update token provider cache
    authTokenProvider.setCachedToken(token, tokenExpiry);

    // Update local state
    setState({
      token,
      tokenExpiry,
      lastUpdated: timestamp,
    });
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    window.addEventListener(TOKEN_BROADCAST_EVENT, handleTokenBroadcast);
    return () => window.removeEventListener(TOKEN_BROADCAST_EVENT, handleTokenBroadcast);
  }, [enabled, handleTokenBroadcast]);

  return state;
}
