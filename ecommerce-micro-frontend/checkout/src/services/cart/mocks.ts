import type { CartResponse } from './types';

export const mockCartResponse: CartResponse = {
  id: 'cart-123',
  userId: 'user-456',
  items: [
    {
      id: '1',
      productId: 'prod-101',
      productName: 'iPhone X',
      price: 999,
      quantity: 1,
      imageUrl: '/images/iphone-x.jpg',
      addedAt: new Date().toISOString(),
    },
    {
      id: '2',
      productId: 'prod-102',
      productName: 'Samsung S21',
      price: 799,
      quantity: 1,
      imageUrl: '/images/samsung-s21.jpg',
      addedAt: new Date().toISOString(),
    },
  ],
  subtotal: 1798,
  tax: 143.84,
  shipping: 0,
  discount: 0,
  total: 1941.84,
  currency: 'USD',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockEmptyCartResponse: CartResponse = {
  id: 'cart-empty',
  userId: 'user-456',
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  currency: 'USD',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
