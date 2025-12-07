/**
 * API Configuration
 * Centralized API endpoint definitions
 */

export const API_CONFIG = {
  CATALOG: {
    BASE: '/Catalog',
    PRODUCTS: '/Catalog/GetAllProducts',
    PRODUCT_BY_ID: (id: string) => `/Catalog/GetProductById/${id}`,
    BRANDS: '/Catalog/GetAllBrands',
    TYPES: '/Catalog/GetAllTypes',
    PRODUCTS_BY_BRAND: (brand: string) => `/Catalog/GetProductByBrandName/${brand}`,
    PRODUCTS_BY_TYPE: (type: string) => `/Catalog/GetProductByTypeName/${type}`,
  },
  BASKET: {
    BASE: '/Basket',
    GET_BASKET: (userName: string) => `/Basket/GetBasket/${userName}`,
    CREATE_BASKET: '/Basket/CreateBasket',
    DELETE_BASKET: (userName: string) => `/Basket/DeleteBasket/${userName}`,
    CHECKOUT: '/Basket/Checkout',
  },
  DISCOUNT: {
    BASE: '/Discount',
    GET_DISCOUNT: (productName: string) => `/Discount/GetDiscount/${productName}`,
    CREATE_DISCOUNT: '/Discount/CreateDiscount',
    UPDATE_DISCOUNT: '/Discount/UpdateDiscount',
    DELETE_DISCOUNT: (productName: string) => `/Discount/DeleteDiscount/${productName}`,
  },
  ORDER: {
    BASE: '/Order',
    GET_ORDERS: (userName: string) => `/Order/GetOrdersByUserName/${userName}`,
  },
} as const;

export type ApiEndpoint = typeof API_CONFIG;
