import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse, ReactQueryOptions } from '../types';
import * as apis from './apis';
import { cartKeys } from './keys';
import type {
  GetCartRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
  ClearCartRequest,
  ApplyShippingRequest,
  Cart,
} from './types';

export function useGetCart(
  input?: GetCartRequest,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};

  return useQuery<ApiResponse<Cart> | null>({
    queryKey: cartKeys.get.create(input),
    queryFn: async () => {
      const result = await apis.getCart({
        params: { ...input, useMock: true },
      });
      return result ?? null;
    },
    enabled: Boolean(enabled),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Cart> | null, Error, AddToCartRequest>({
    mutationFn: async (input) => {
      const result = await apis.addToCart({
        payload: { ...input, useMock: true },
      });
      return result ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [cartKeys.all],
      });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Cart> | null, Error, UpdateCartItemRequest>({
    mutationFn: async (input) => {
      const result = await apis.updateCartItem({
        payload: { ...input, useMock: true },
      });
      return result ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [cartKeys.all],
      });
    },
  });
}

/**
 * Remove item from cart
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Cart> | null, Error, RemoveCartItemRequest>({
    mutationFn: async (input) => {
      const result = await apis.removeCartItem({
        payload: { ...input, useMock: true },
      });
      return result ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [cartKeys.all],
      });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Cart> | null, Error, ClearCartRequest>({
    mutationFn: async (input) => {
      const result = await apis.clearCart({
        payload: { ...input, useMock: true },
      });
      return result ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [cartKeys.all],
      });
    },
  });
}

export function useApplyShipping() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Cart> | null, Error, ApplyShippingRequest>({
    mutationFn: async (input) => {
      const result = await apis.applyShipping({
        payload: { ...input, useMock: true },
      });
      return result ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [cartKeys.all],
      });
    },
  });
}
