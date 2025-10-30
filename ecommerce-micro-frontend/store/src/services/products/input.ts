import { z } from 'zod';
import { createApiInputFactory } from '../factory/createApiInputFactory';

/**
 * Product API Input Schemas
 * 
 * Defines and validates input parameters for product-related API endpoints.
 * Based on fdw-iraps pattern.
 */

// Input for getting all products
export const storeParamsInput = createApiInputFactory(
  z.object({
    brandId: z.string().optional(),
    typeId: z.string().optional(),
    sort: z.string().optional(),
    pageNumber: z.number().optional(),
    pageSize: z.number().optional(),
    search: z.string().optional(),
    useMock: z.boolean().optional(), // For toggling between real API and mock
  }),
);

// Input for getting product by ID
export const productByIdInput = createApiInputFactory(
  z.object({
    id: z.string(),
  }),
);

// Input for getting brands (no specific params needed)
export const brandsInput = createApiInputFactory(z.object({}));

// Input for getting types (no specific params needed)
export const typesInput = createApiInputFactory(z.object({}));

// Export inferred types
export type StoreParamsInput = z.infer<typeof storeParamsInput>;
export type ProductByIdInput = z.infer<typeof productByIdInput>;
export type BrandsInput = z.infer<typeof brandsInput>;
export type TypesInput = z.infer<typeof typesInput>;

