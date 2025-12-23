import { z } from 'zod';
import { createApiInputFactory } from '../factory/createApiInputFactory';

// Input for list endpoints with pagination and filters
// Note: createApiInputFactory adds page, limit, orderBy, useMock automatically
// API uses pageIndex/pageSize, so we include them directly
export const productsParamsInput = createApiInputFactory(
  z.object({
    brandId: z.string().optional(),
    typeId: z.string().optional(),
    sort: z.string().optional(),
    search: z.string().optional(),
    pageIndex: z.number().optional(),
    pageSize: z.number().optional(),
  })
);

// Input for single product by ID
export const productByIdInput = createApiInputFactory(
  z.object({
    id: z.string(),
  })
);

// Input for create product operation
export const createProductInput = createApiInputFactory(
  z.object({
    name: z.string().min(1, 'Product name is required'),
    summary: z.string().optional(),
    description: z.string().optional(),
    imageFile: z.string().optional(),
    price: z.number().min(0, 'Price must be positive'),
    brands: z
      .object({
        id: z.string().optional(),
        name: z.string(),
      })
      .optional(),
    types: z
      .object({
        id: z.string().optional(),
        name: z.string(),
      })
      .optional(),
  })
);

// Input for update product operation
export const updateProductInput = createApiInputFactory(
  z.object({
    id: z.string().min(1, 'Product ID is required'),
    name: z.string().min(1, 'Product name is required'),
    summary: z.string().optional(),
    description: z.string().optional(),
    imageFile: z.string().optional(),
    price: z.number().min(0, 'Price must be positive'),
    brands: z
      .object({
        id: z.string().optional(),
        name: z.string(),
      })
      .optional(),
    types: z
      .object({
        id: z.string().optional(),
        name: z.string(),
      })
      .optional(),
  })
);

// Export inferred types
export type ProductsParamsInput = z.infer<typeof productsParamsInput>;
export type ProductByIdInput = z.infer<typeof productByIdInput>;
export type CreateProductInput = z.infer<typeof createProductInput>;
export type UpdateProductInput = z.infer<typeof updateProductInput>;

