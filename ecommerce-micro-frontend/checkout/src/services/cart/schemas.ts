import { z } from 'zod';

export const getCartRequestSchema = z.object({
  userId: z.string().optional(),
  useMock: z.boolean().optional(),
});

export const addToCartRequestSchema = z.object({
  productId: z.string(),
  productName: z.string().min(1).max(200),
  price: z.number().min(0),
  quantity: z.number().min(1).max(99),
  variantId: z.string().optional(),
  useMock: z.boolean().optional(),
});

export const updateCartItemRequestSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(0).max(99),
  useMock: z.boolean().optional(),
});

export const removeCartItemRequestSchema = z.object({
  itemId: z.string(),
  useMock: z.boolean().optional(),
});

export const clearCartRequestSchema = z.object({
  userId: z.string().optional(),
  useMock: z.boolean().optional(),
});

export const applyShippingRequestSchema = z.object({
  shippingMethod: z.enum(['standard', 'express']),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  useMock: z.boolean().optional(),
});

export const cartItemResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
  imageUrl: z.string().optional(),
  addedAt: z.string(),
});

export const cartResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(cartItemResponseSchema),
  subtotal: z.number(),
  tax: z.number().optional(),
  shipping: z.number().optional(),
  discount: z.number().optional(),
  total: z.number(),
  currency: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const cartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
  imageUrl: z.string().optional(),
  addedAt: z.string(),
  itemTotal: z.number().optional(),
});

export const cartSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(cartItemSchema),
  subtotal: z.number(),
  tax: z.number().optional(),
  shipping: z.number().optional(),
  discount: z.number().optional(),
  total: z.number(),
  currency: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  itemCount: z.number().optional(),
  isEmpty: z.boolean().optional(),
});
