import { z } from 'zod';
import {
  getCartRequestSchema,
  addToCartRequestSchema,
  updateCartItemRequestSchema,
  removeCartItemRequestSchema,
  clearCartRequestSchema,
  applyShippingRequestSchema,
  cartItemResponseSchema,
  cartResponseSchema,
  cartItemSchema,
  cartSchema,
} from './schemas';

export type GetCartRequest = z.infer<typeof getCartRequestSchema>;
export type AddToCartRequest = z.infer<typeof addToCartRequestSchema>;
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>;
export type RemoveCartItemRequest = z.infer<typeof removeCartItemRequestSchema>;
export type ClearCartRequest = z.infer<typeof clearCartRequestSchema>;
export type ApplyShippingRequest = z.infer<typeof applyShippingRequestSchema>;

export type CartItemResponse = z.infer<typeof cartItemResponseSchema>;
export type CartResponse = z.infer<typeof cartResponseSchema>;

export type CartItem = z.infer<typeof cartItemSchema>;

export type Cart = z.infer<typeof cartSchema>;

export enum ShippingMethod {
  Standard = 'standard',
  Express = 'express',
}
