import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { getBasket } from './api';
import type { Basket } from './types';
import {
  createCacheKeyWithScope,
} from '../factory/createCacheKeyFactory';

const createCacheKey = createCacheKeyWithScope('basket');

/**
 * Get current username from auth hook
 */
function getUserName(user: ReturnType<typeof useAuth>['user']): string {
  return user?.email || user?.displayName || user?.id || 'guest';
}

const CACHE_KEYS = {
  all: createCacheKey(['all']),
  byUser: (userName: string) => createCacheKey(['byUser', userName]),
} as const;

/**
 * Hook to fetch basket for current user
 * - Uses React Query for automatic caching and deduplication
 * - Returns null on error (non-blocking for Navbar)
 * - Uses useAuth to get reactive user info
 */
export function useBasket() {
  const { user } = useAuth();
  const userName = getUserName(user);

  const query = useQuery<Basket | null>({
    queryKey: CACHE_KEYS.byUser(userName),
    queryFn: () => getBasket(userName),
    staleTime: 30 * 1000, // 30 seconds
    retry: false, // Don't retry on failure for Navbar
    refetchOnWindowFocus: true,
  });

  return {
    basket: query.data ?? null,
    items: query.data?.items ?? [],
    itemCount: query.data?.itemCount ?? 0,
    totalPrice: query.data?.totalPrice ?? 0,
    isEmpty: query.data?.isEmpty ?? true,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Export cache keys for invalidation from other modules
 */
export const basketCacheKeys = CACHE_KEYS;
