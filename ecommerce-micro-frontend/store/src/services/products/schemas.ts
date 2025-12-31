import { z } from 'zod';

export const stockStatusEnum = z.enum([
  'in-stock',
  'low-stock',
  'out-of-stock',
]);

export const brandResponseSchema = z.object({
  name: z.string(),
  id: z.string(),
});

export const productTypeResponseSchema = z.object({
  name: z.string(),
  id: z.string(),
});

export const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  description: z.string(),
  imageFile: z.string(),
  brands: brandResponseSchema,
  types: productTypeResponseSchema,
  price: z.number().nonnegative(),
});

export const productsResponseSchema = z.object({
  pageIndex: z.number().nonnegative(),
  pageSize: z.number().positive(),
  count: z.number().nonnegative(),
  data: z.array(productResponseSchema),
});

export const reviewResponseSchema = z.object({
  reviewId: z.string(),
  userId: z.string(),
  userName: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string(), // ISO date string
  comment: z.string(),
  helpfulCount: z.number().nonnegative().optional(),
});

export const reviewsResponseSchema = z.array(reviewResponseSchema);

export const productDetailResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  description: z.string(),
  imageFile: z.string(),
  brands: brandResponseSchema,
  types: productTypeResponseSchema,
  price: z.number().nonnegative(),
});

export const productDetailWithReviewsResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  description: z.string(),
  imageFile: z.string(),
  brands: brandResponseSchema,
  types: productTypeResponseSchema,
  price: z.number().nonnegative(),
  reviews: z.array(reviewResponseSchema).optional(),
});

export const reviewSchema = z.object({
  reviewId: z.string(),
  userId: z.string(),
  userName: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string(),
  comment: z.string(),
  helpfulCount: z.number().nonnegative().default(0),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  description: z.string(),
  imageFile: z.string(),
  brands: brandResponseSchema,
  types: productTypeResponseSchema,
  price: z.number().nonnegative(),
});

export const productArraySchema = z.array(productSchema);

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const brandArraySchema = z.array(brandSchema);

export const brandArrayResponseSchema = z.array(brandResponseSchema);

export const productTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const productTypeArraySchema = z.array(productTypeSchema);

export const productTypeArrayResponseSchema = z.array(
  productTypeResponseSchema
);
