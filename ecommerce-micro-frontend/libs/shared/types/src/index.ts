export * from './lib/product';
export * from './lib/user';
export * from './lib/cart';
export * from './lib/order';
export * from './lib/schemas';
// Export mappers with explicit names to avoid conflicts
export {
  mapProductToFrontend,
  mapProductBrandToFrontend,
  mapProductTypeToFrontend,
  mapShoppingCartToFrontend,
  mapShoppingCartItemToFrontend,
  mapShoppingCartItemToBackend,
  mapShoppingCartToBackend,
  mapCouponToFrontend,
  mapOrderToFrontend,
  mapProductsToFrontend,
  mapBrandsToFrontend,
  mapTypesToFrontend,
  mapOrdersToFrontend,
  // Backend types (PascalCase)
  type Product,
  type ProductBrand,
  type ProductType,
  type ShoppingCart,
  type ShoppingCartItem,
  type ShoppingCartResponse,
  type Coupon,
  type Order,
  // Frontend types (camelCase)
  type ProductFrontend,
  type ProductBrandFrontend,
  type ProductTypeFrontend,
  type ShoppingCartItemFrontend,
  type ShoppingCartFrontend,
  type CouponFrontend,
  type OrderFrontend,
} from './lib/mappers';
