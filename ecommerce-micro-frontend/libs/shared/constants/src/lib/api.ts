export const API_BASE_URL = process.env['NX_API_BASE_URL'] || '/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: '/products/:id',
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
  },
  CART: {
    GET: '/cart',
    ADD: '/cart/items',
    UPDATE: '/cart/items/:id',
    REMOVE: '/cart/items/:id',
    CLEAR: '/cart/clear',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: '/orders/:id',
    CANCEL: '/orders/:id/cancel',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile',
    ADDRESSES: '/user/addresses',
    PAYMENT_METHODS: '/user/payment-methods',
  },
} as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
} as const;

