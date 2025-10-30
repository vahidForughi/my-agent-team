import { z } from 'zod';

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  imageFile: z.string(),
  price: z.number(),
  productType: z.string(),
  productBrand: z.string(),
  originalPrice: z.number().optional(),
  discountAmount: z.number().optional(),
  hasDiscount: z.boolean().optional(),
});

export const productWithDiscountSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  imageFile: z.string(),
  price: z.number(),
  productType: z.string(),
  productBrand: z.string(),
  originalPrice: z.number(),
  discountAmount: z.number(),
  hasDiscount: z.boolean(),
});

export const productArraySchema = z.array(productSchema);
export const productWithDiscountArraySchema = z.array(
  productWithDiscountSchema
);

export const paginationSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    pageIndex: z.number(),
    pageSize: z.number(),
    count: z.number(),
    data: dataSchema,
  });

export const paginationProductsSchema = paginationSchema(productArraySchema);
export const paginationProductsWithDiscountSchema = paginationSchema(
  productWithDiscountArraySchema
);

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const brandArraySchema = z.array(brandSchema);

export const productTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const productTypeArraySchema = z.array(productTypeSchema);

export const storeParamsSchema = z.object({
  brandId: z.string().optional(),
  typeId: z.string().optional(),
  sort: z.string().optional(),
  pageNumber: z.number().optional(),
  pageSize: z.number().optional(),
  search: z.string().optional(),
  useMock: z.boolean().optional(),
});

// Zod-inferred types (these will be used internally by schemas)
export type ProductArray = z.infer<typeof productArraySchema>;
export type ProductWithDiscountArray = z.infer<
  typeof productWithDiscountArraySchema
>;
export type PaginationProducts = z.infer<typeof paginationProductsSchema>;
export type BrandArray = z.infer<typeof brandArraySchema>;
export type ProductTypeArray = z.infer<typeof productTypeArraySchema>;
