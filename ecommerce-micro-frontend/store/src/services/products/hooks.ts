import { useQuery } from '@tanstack/react-query';
import { ReactQueryOptions } from '../types';
import * as apis from './apis';
import { productKeys } from './keys';
import { StoreParamsInput } from './input';

/**
 * Product Hooks
 * 
 * TanStack Query hooks for product-related data fetching.
 * Following fdw-iraps pattern - useMock is handled in apis layer.
 */

/**
 * Hook to get all products with pagination and filtering
 */
export const useGetProducts = (
  params?: StoreParamsInput,
  options?: ReactQueryOptions,
) => {
  return useQuery({
    queryKey: [productKeys.getAll.create(params)],
    queryFn: () => apis.getProducts({ params }),
    ...options,
  });
};

/**
 * Hook to get product by ID
 */
export const useGetProductById = (
  id: string,
  options?: ReactQueryOptions,
) => {
  return useQuery({
    queryKey: [productKeys.getById.create(id)],
    queryFn: () => apis.getProductById({ params: { id } }),
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to get all brands
 */
export const useGetBrands = (options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: [productKeys.getBrands.create()],
    queryFn: () => apis.getBrands(),
    ...options,
  });
};

/**
 * Hook to get all product types
 */
export const useGetTypes = (options?: ReactQueryOptions) => {
  return useQuery({
    queryKey: [productKeys.getTypes.create()],
    queryFn: () => apis.getTypes(),
    ...options,
  });
};
