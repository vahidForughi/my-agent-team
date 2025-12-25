import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { ReactQueryOptions } from '../types';
import * as apis from './apis';
import { cartKeys } from './keys';
import type {
  GetCartRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
  ClearCartRequest,
  CheckoutRequest,
  Cart,
} from './types';

/**
 * Custom event name for cross-module cart updates
 * Must match the event name in store/src/services/basket/index.ts
 */
const CART_UPDATED_EVENT = 'ecommerce:cart:updated';

/**
 * Get current user's email or fallback to guest
 */
function getUserName(user: ReturnType<typeof useAuth>['user']): string {
  return user?.email || user?.displayName || user?.id || 'guest';
}

// ====================================
// QUERY HOOKS (READ OPERATIONS)
// ====================================

/**
 * Get cart for current user
 * - Refetches on mount to ensure fresh data when navigating back
 * - Listens for CART_UPDATED_EVENT from store module to invalidate cache
 */
export function useGetCart(
  input?: GetCartRequest,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userName = input?.userName || getUserName(user);

  // Listen for cart updates from store module
  useEffect(() => {
    function handleCartUpdated() {
      console.log('[Checkout] Cart updated event received, refetching cart...');
      queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          // Cache keys: ['ecommerce-cache', '_cart', 'get', ...]
          return Array.isArray(key) && key[1] === '_cart';
        },
      });
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, [queryClient]);

  return useQuery<{ data: Cart } | null>({
    queryKey: cartKeys.get.create({ ...input, userName }),
    queryFn: async () => {
      const result = await apis.getCart({
        params: { ...input, userName },
      });
      return result ?? null;
    },
    enabled: Boolean(enabled),
    staleTime: 30 * 1000, // 30 seconds - shorter to ensure fresher data
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

// ====================================
// MUTATION HOOKS (WRITE OPERATIONS)
// ====================================

/**
 * Update cart cache with new data and notify other modules
 * Uses setQueryData instead of refetch to avoid unnecessary API calls
 */
function updateCartCache(
  queryClient: ReturnType<typeof useQueryClient>,
  newCartData: { data: Cart } | null,
  userName: string
) {
  if (newCartData) {
    // Update cache with new data instead of refetching
    // This avoids an extra GET API call since we already have the updated data
    queryClient.setQueryData(cartKeys.get.create({ userName }), newCartData);
    console.log(
      '[Checkout] Cart cache updated with new data for user:',
      userName
    );
  } else {
    // If no data, invalidate to force refetch
    queryClient.invalidateQueries({
      queryKey: cartKeys.get.create({ userName }),
    });
  }

  // Dispatch event to notify other modules (host's Navbar)
  // Other modules can decide whether to refetch or use cached data
  console.log('[Checkout] Dispatching cart updated event...');
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

/**
 * Add item to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userName = getUserName(user);

  return useMutation<{ data: Cart } | null, Error, AddToCartRequest>({
    mutationFn: async (input) => {
      // Try to get current cart from cache to avoid extra API call
      const cachedCart = queryClient.getQueryData<{ data: Cart } | null>(
        cartKeys.get.create({ userName })
      );
      const result = await apis.addToCart(
        {
          payload: { ...input, userName },
        },
        cachedCart ?? null
      );
      return result ?? null;
    },
    onSuccess: (data) => {
      // Update cache with response data instead of refetching
      updateCartCache(queryClient, data, userName);
    },
  });
}

/**
 * Update cart item quantity
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userName = getUserName(user);

  return useMutation<{ data: Cart } | null, Error, UpdateCartItemRequest>({
    mutationFn: async (input) => {
      // Try to get current cart from cache to avoid extra API call
      const cachedCart = queryClient.getQueryData<{ data: Cart } | null>(
        cartKeys.get.create({ userName })
      );
      const result = await apis.updateCartItem(
        {
          payload: { ...input, userName },
        },
        cachedCart ?? null
      );
      return result ?? null;
    },
    onSuccess: (data) => {
      // Update cache with response data instead of refetching
      updateCartCache(queryClient, data, userName);
    },
  });
}

/**
 * Remove item from cart
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userName = getUserName(user);

  return useMutation<{ data: Cart } | null, Error, RemoveCartItemRequest>({
    mutationFn: async (input) => {
      // Try to get current cart from cache to avoid extra API call
      const cachedCart = queryClient.getQueryData<{ data: Cart } | null>(
        cartKeys.get.create({ userName })
      );
      const result = await apis.removeCartItem(
        {
          payload: { ...input, userName },
        },
        cachedCart ?? null
      );
      return result ?? null;
    },
    onSuccess: (data) => {
      // Update cache with response data instead of refetching
      updateCartCache(queryClient, data, userName);
    },
  });
}

/**
 * Clear entire cart
 */
export function useClearCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userName = getUserName(user);

  return useMutation<{ data: Cart } | null, Error, ClearCartRequest | void>({
    mutationFn: async (input) => {
      const result = await apis.clearCart({
        payload: { ...(input || {}), userName },
      });
      return result ?? null;
    },
    onSuccess: (data) => {
      // Update cache with response data instead of refetching
      updateCartCache(queryClient, data, userName);
    },
  });
}

/**
 * Checkout cart (creates order)
 */
export function useCheckout() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userName = getUserName(user);

  return useMutation<
    { success: boolean; orderId?: number },
    Error,
    CheckoutRequest
  >({
    mutationFn: async (input) => {
      return apis.checkout({
        payload: { ...input, userName },
      });
    },
    onSuccess: () => {
      // Clear cart cache after checkout (set to empty cart)
      const emptyCart: { data: Cart } = {
        data: {
          userName,
          items: [],
          totalPrice: 0,
          itemCount: 0,
          isEmpty: true,
        },
      };
      updateCartCache(queryClient, emptyCart, userName);
    },
  });
}

// ====================================
// DEPRECATED - Keep for backward compatibility
// ====================================

/** @deprecated Use useCheckout instead */
export function useApplyShipping() {
  const queryClient = useQueryClient();

  return useMutation<{ data: Cart } | null, Error, unknown>({
    mutationFn: async () => {
      console.warn('useApplyShipping is deprecated, use useCheckout instead');
      const result = await apis.getCart();
      return result ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [cartKeys.all],
      });
    },
  });
}
