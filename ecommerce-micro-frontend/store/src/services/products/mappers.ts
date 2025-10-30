import { createMapper } from '../factory/createMapper';
import { Product, ProductWithDiscount, Brand, ProductType, Pagination } from './types';
import {
  productSchema,
  productWithDiscountSchema,
  brandSchema,
  productTypeSchema,
  paginationProductsSchema,
  brandArraySchema,
  productTypeArraySchema,
} from './schemas';

/**
 * Product Mappers
 * 
 * Transform API responses to DTOs with validation.
 * Based on fdw-iraps pattern.
 */

// Mapper for single product
export const productMapper = createMapper<Product, Product>(
  (entity) => entity,
  productSchema,
);

// Mapper for product with discount
export const productWithDiscountMapper = createMapper<
  ProductWithDiscount,
  ProductWithDiscount
>((entity) => entity, productWithDiscountSchema);

// Mapper for paginated products
export const paginationProductsMapper = createMapper<
  Pagination<Product[]>,
  Pagination<Product[]>
>((entity) => entity, paginationProductsSchema);

// Mapper for brand
export const brandMapper = createMapper<Brand, Brand>(
  (entity) => entity,
  brandSchema,
);

// Mapper for brand array
export const brandArrayMapper = createMapper<Brand[], Brand[]>(
  (entity) => entity,
  brandArraySchema,
);

// Mapper for product type
export const productTypeMapper = createMapper<ProductType, ProductType>(
  (entity) => entity,
  productTypeSchema,
);

// Mapper for product type array
export const productTypeArrayMapper = createMapper<ProductType[], ProductType[]>(
  (entity) => entity,
  productTypeArraySchema,
);

