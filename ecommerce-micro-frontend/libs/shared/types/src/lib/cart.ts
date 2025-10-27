import { Product } from './product';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

