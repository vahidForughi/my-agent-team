import { Address, PaymentMethod } from './user';
import { CartItem } from './cart';

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethodId: string;
  notes?: string;
}

