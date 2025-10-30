/**
 * Products Service Index
 * 
 * Central export point for all product-related services.
 * Following fdw-iraps pattern with complete service layer.
 */

// Export types from types.ts (original interfaces)
export type { Product, ProductWithDiscount, Brand, ProductType, StoreParams, Pagination } from './types';

// Export schemas and zod-inferred types from schemas.ts
export * from './schemas';

// Export input schemas and types
export * from './input';

// Export mappers
export * from './mappers';

// Export APIs, hooks, and keys
export * from './apis';
export * from './hooks';
export * from './keys';

