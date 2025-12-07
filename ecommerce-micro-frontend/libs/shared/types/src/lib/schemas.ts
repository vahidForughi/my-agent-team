/**
 * Zod Schemas for Backend DTOs
 * These schemas match the C# backend models exactly for runtime validation
 */

import { z } from 'zod';

// ============================================================================
// CATALOG SCHEMAS (matching Services/Catalog/Catalog.Core/Entities/*)
// ============================================================================

export const ProductBrandSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

export const ProductTypeSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

export const ProductSchema = z.object({
  Id: z.string(),
  Name: z.string(),
  Summary: z.string().optional(),
  Description: z.string().optional(),
  ImageFile: z.string().optional(),
  Brands: ProductBrandSchema.optional(),
  Types: ProductTypeSchema.optional(),
  Price: z.number(),
});

export const ProductListResponseSchema = z.array(ProductSchema);
export const BrandListResponseSchema = z.array(ProductBrandSchema);
export const TypeListResponseSchema = z.array(ProductTypeSchema);

// ============================================================================
// BASKET SCHEMAS (matching Services/Basket/Basket.Core/Entities/*)
// ============================================================================

export const ShoppingCartItemSchema = z.object({
  Quantity: z.number().int().min(1),
  Price: z.number(),
  OriginalPrice: z.number(),
  DiscountAmount: z.number().default(0),
  ProductId: z.string(),
  ImageFile: z.string().optional(),
  ProductName: z.string(),
});

export const ShoppingCartSchema = z.object({
  UserName: z.string(),
  Items: z.array(ShoppingCartItemSchema).default([]),
});

export const ShoppingCartResponseSchema = ShoppingCartSchema.extend({
  TotalPrice: z.number().optional(),
});

// Basket Commands
export const CreateShoppingCartCommandSchema = z.object({
  UserName: z.string().min(1, 'Username is required'),
  Items: z.array(ShoppingCartItemSchema),
});

export const CheckoutBasketCommandSchema = z.object({
  UserName: z.string().min(1, 'Username is required'),
  TotalPrice: z.number().min(0),
  // Shipping information
  FirstName: z.string().optional(),
  LastName: z.string().optional(),
  EmailAddress: z.string().email().optional(),
  AddressLine: z.string().optional(),
  Country: z.string().optional(),
  State: z.string().optional(),
  ZipCode: z.string().optional(),
  // Payment information
  CardName: z.string().optional(),
  CardNumber: z.string().optional(),
  Expiration: z.string().optional(),
  CVV: z.string().optional(),
  PaymentMethod: z.number().optional(),
});

// ============================================================================
// DISCOUNT SCHEMAS (matching Services/Discount/Discount.Core/Entities/*)
// ============================================================================

export const CouponSchema = z.object({
  Id: z.number(),
  ProductName: z.string(),
  Description: z.string(),
  Amount: z.number().int().min(0),
});

export const CreateDiscountCommandSchema = z.object({
  ProductName: z.string().min(1, 'Product name is required'),
  Description: z.string(),
  Amount: z.number().int().min(0),
});

export const UpdateDiscountCommandSchema = CouponSchema;

// ============================================================================
// ORDER SCHEMAS (matching Services/Ordering/Ordering.Core/Entities/*)
// ============================================================================

export const OrderSchema = z.object({
  Id: z.number().optional(),
  UserName: z.string().nullable(),
  TotalPrice: z.number().nullable(),
  FirstName: z.string().nullable(),
  LastName: z.string().nullable(),
  EmailAddress: z.string().email().nullable(),
  AddressLine: z.string().nullable(),
  Country: z.string().nullable(),
  State: z.string().nullable(),
  ZipCode: z.string().nullable(),
  CardName: z.string().nullable(),
  CardNumber: z.string().nullable(),
  Expiration: z.string().nullable(),
  Cvv: z.string().nullable(),
  PaymentMethod: z.number().nullable(),
  CreatedBy: z.string().nullable().optional(),
  CreatedDate: z.string().or(z.date()).nullable().optional(),
  LastModifiedBy: z.string().nullable().optional(),
  LastModifiedDate: z.string().or(z.date()).nullable().optional(),
});

export const OrderListResponseSchema = z.array(OrderSchema);

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export const ApiErrorSchema = z.object({
  message: z.string(),
  statusCode: z.number().optional(),
  errors: z.record(z.string()).optional(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    success: z.boolean().default(true),
    message: z.string().optional(),
    errors: z.array(z.string()).optional(),
  });

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const UserSchema = z.object({
  username: z.string(),
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  token: z.string().optional(),
});

export const LoginRequestSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

export const LoginResponseSchema = z.object({
  user: UserSchema,
  token: z.string().optional(),
});
