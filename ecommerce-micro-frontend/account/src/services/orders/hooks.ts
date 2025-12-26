import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { ReactQueryOptions } from '../types';
import * as apis from './apis';
import { orderKeys } from './keys';
import type { GetOrdersRequest, GetOrderByIdRequest, Order } from './types';

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
 * Get orders for current user
 */
export function useGetOrders(
  input?: GetOrdersRequest,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};
  const { user } = useAuth();
  const userName = input?.userName || getUserName(user);

  return useQuery<{ data: Order[] } | null>({
    queryKey: orderKeys.get.create({ ...input, userName }),
    queryFn: async () => {
      const result = await apis.getOrders({
        params: { ...input, userName },
      });
      return result ?? null;
    },
    enabled: Boolean(enabled),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

/**
 * Get order by ID
 */
export function useGetOrderById(
  input: GetOrderByIdRequest,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};

  return useQuery<{ data: Order } | null>({
    queryKey: orderKeys.getById.create(input),
    queryFn: async () => {
      const result = await apis.getOrderById({
        params: input,
      });
      return result ?? null;
    },
    enabled: Boolean(enabled && input.orderId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

