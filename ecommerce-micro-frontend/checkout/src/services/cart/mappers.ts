import { createMapper } from '../factory/createMapper';
import type { CartResponse, Cart, CartItemResponse, CartItem } from './types';
import { cartResponseSchema, cartItemResponseSchema } from './schemas';

export const cartItemMapper = createMapper<CartItemResponse, CartItem>(
  (response) => {
    const itemTotal = response.price * response.quantity;

    return {
      id: response.id,
      productId: response.productId,
      productName: response.productName,
      price: response.price,
      quantity: response.quantity,
      variantId: response.variantId,
      variantName: response.variantName,
      imageUrl: response.imageUrl,
      addedAt: response.addedAt,
      itemTotal,
    };
  },
  cartItemResponseSchema
);

export const cartMapper = createMapper<CartResponse, Cart>((response) => {
  const mappedItems = response.items
    .map((item) => cartItemMapper.toDto(item))
    .filter((item): item is CartItem => item !== null);

  const itemCount = mappedItems.length;
  const isEmpty = itemCount === 0;

  return {
    id: response.id,
    userId: response.userId,
    items: mappedItems,
    subtotal: response.subtotal,
    tax: response.tax,
    shipping: response.shipping,
    discount: response.discount,
    total: response.total,
    currency: response.currency,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    itemCount,
    isEmpty,
  };
}, cartResponseSchema);
