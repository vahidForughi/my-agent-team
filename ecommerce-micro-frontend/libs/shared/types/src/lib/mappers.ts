/**
 * Type Mappers
 * Convert between backend PascalCase DTOs and frontend camelCase models
 */

import type { z } from 'zod';
import type {
  ProductSchema,
  ProductBrandSchema,
  ProductTypeSchema,
  ShoppingCartSchema,
  ShoppingCartItemSchema,
  ShoppingCartResponseSchema,
  CouponSchema,
  OrderSchema,
} from './schemas';

// Infer types from Zod schemas
export type Product = z.infer<typeof ProductSchema>;
export type ProductBrand = z.infer<typeof ProductBrandSchema>;
export type ProductType = z.infer<typeof ProductTypeSchema>;
export type ShoppingCart = z.infer<typeof ShoppingCartSchema>;
export type ShoppingCartItem = z.infer<typeof ShoppingCartItemSchema>;
export type ShoppingCartResponse = z.infer<typeof ShoppingCartResponseSchema>;
export type Coupon = z.infer<typeof CouponSchema>;
export type Order = z.infer<typeof OrderSchema>;

// Frontend camelCase types
export interface ProductFrontend {
  id: string;
  name: string;
  summary?: string;
  description?: string;
  imageFile?: string;
  brand?: ProductBrandFrontend;
  type?: ProductTypeFrontend;
  price: number;
}

export interface ProductBrandFrontend {
  id: string;
  name: string;
}

export interface ProductTypeFrontend {
  id: string;
  name: string;
}

export interface ShoppingCartItemFrontend {
  quantity: number;
  price: number;
  originalPrice: number;
  discountAmount: number;
  productId: string;
  imageFile?: string;
  productName: string;
}

export interface ShoppingCartFrontend {
  userName: string;
  items: ShoppingCartItemFrontend[];
  totalPrice?: number;
}

export interface CouponFrontend {
  id: number;
  productName: string;
  description: string;
  amount: number;
}

export interface OrderFrontend {
  id?: number;
  userName: string | null;
  totalPrice: number | null;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  addressLine: string | null;
  country: string | null;
  state: string | null;
  zipCode: string | null;
  cardName: string | null;
  cardNumber: string | null;
  expiration: string | null;
  cvv: string | null;
  paymentMethod: number | null;
  createdDate?: string | Date | null;
}

// ============================================================================
// MAPPERS: Backend PascalCase -> Frontend camelCase
// ============================================================================

export const mapProductToFrontend = (product: Product): ProductFrontend => ({
  id: product.Id,
  name: product.Name,
  summary: product.Summary,
  description: product.Description,
  imageFile: product.ImageFile,
  brand: product.Brands ? mapProductBrandToFrontend(product.Brands) : undefined,
  type: product.Types ? mapProductTypeToFrontend(product.Types) : undefined,
  price: product.Price,
});

export const mapProductBrandToFrontend = (brand: ProductBrand): ProductBrandFrontend => ({
  id: brand.Id,
  name: brand.Name,
});

export const mapProductTypeToFrontend = (type: ProductType): ProductTypeFrontend => ({
  id: type.Id,
  name: type.Name,
});

export const mapShoppingCartToFrontend = (cart: ShoppingCartResponse): ShoppingCartFrontend => ({
  userName: cart.UserName,
  items: cart.Items.map(mapShoppingCartItemToFrontend),
  totalPrice: cart.TotalPrice,
});

export const mapShoppingCartItemToFrontend = (item: ShoppingCartItem): ShoppingCartItemFrontend => ({
  quantity: item.Quantity,
  price: item.Price,
  originalPrice: item.OriginalPrice,
  discountAmount: item.DiscountAmount,
  productId: item.ProductId,
  imageFile: item.ImageFile,
  productName: item.ProductName,
});

export const mapCouponToFrontend = (coupon: Coupon): CouponFrontend => ({
  id: coupon.Id,
  productName: coupon.ProductName,
  description: coupon.Description,
  amount: coupon.Amount,
});

export const mapOrderToFrontend = (order: Order): OrderFrontend => ({
  id: order.Id,
  userName: order.UserName,
  totalPrice: order.TotalPrice,
  firstName: order.FirstName,
  lastName: order.LastName,
  emailAddress: order.EmailAddress,
  addressLine: order.AddressLine,
  country: order.Country,
  state: order.State,
  zipCode: order.ZipCode,
  cardName: order.CardName,
  cardNumber: order.CardNumber,
  expiration: order.Expiration,
  cvv: order.Cvv,
  paymentMethod: order.PaymentMethod,
  createdDate: order.CreatedDate,
});

// ============================================================================
// MAPPERS: Frontend camelCase -> Backend PascalCase
// ============================================================================

export const mapShoppingCartItemToBackend = (item: ShoppingCartItemFrontend): ShoppingCartItem => ({
  Quantity: item.quantity,
  Price: item.price,
  OriginalPrice: item.originalPrice,
  DiscountAmount: item.discountAmount,
  ProductId: item.productId,
  ImageFile: item.imageFile,
  ProductName: item.productName,
});

export const mapShoppingCartToBackend = (cart: ShoppingCartFrontend): ShoppingCart => ({
  UserName: cart.userName,
  Items: cart.items.map(mapShoppingCartItemToBackend),
});

// List mappers
export const mapProductsToFrontend = (products: Product[]): ProductFrontend[] =>
  products.map(mapProductToFrontend);

export const mapBrandsToFrontend = (brands: ProductBrand[]): ProductBrandFrontend[] =>
  brands.map(mapProductBrandToFrontend);

export const mapTypesToFrontend = (types: ProductType[]): ProductTypeFrontend[] =>
  types.map(mapProductTypeToFrontend);

export const mapOrdersToFrontend = (orders: Order[]): OrderFrontend[] =>
  orders.map(mapOrderToFrontend);
