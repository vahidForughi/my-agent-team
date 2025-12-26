import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@ecommerce-platform/auth-provider';
import * as apis from './apis';
import { basketKeys } from './keys';
import type { AddToCartRequest, Basket } from './types';

/**
 * Custom event name for cross-module cart updates
 */
export const CART_UPDATED_EVENT = 'ecommerce:cart:updated';

/**
 * Get current username from auth hook
 */
function getUserName(user: ReturnType<typeof useAuth>['user']): string {
  return user?.email || user?.displayName || user?.id || 'guest';
}

/**
 * Hook to add item to cart
 * 
 * Features:
 * - Calls real Basket API
 * - Invalidates basket cache on success
 * - Dispatches CustomEvent to notify other modules (e.g., host Navbar)
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userName = getUserName(user);

  return useMutation<Basket, Error, AddToCartRequest>({
    mutationFn: async (request) => {
      // Try to get current basket from cache to avoid extra API call
      const cachedBasket = queryClient.getQueryData<Basket>(
        basketKeys.detail(userName)
      );
      // Pass userName from hook to ensure we use the correct user
      return apis.addToCart(request, cachedBasket, userName);
    },
    onSuccess: (basket) => {
      // Update cache with new basket data instead of invalidating
      // This avoids an extra refetch API call
      queryClient.setQueryData(basketKeys.detail(userName), basket);

      // Dispatch CustomEvent to notify other modules (e.g., host Navbar)
      // Using window.dispatchEvent for cross-module communication
      window.dispatchEvent(
        new CustomEvent(CART_UPDATED_EVENT, {
          detail: {
            itemCount: basket.itemCount,
            totalPrice: basket.totalPrice,
          },
        })
      );
    },
    onError: (error) => {
      console.error('[useAddToCart] Error:', error);
      // Invalidate cache on error to ensure fresh data on retry
      queryClient.invalidateQueries({
        queryKey: basketKeys.detail(userName),
      });
    },
  });
}

