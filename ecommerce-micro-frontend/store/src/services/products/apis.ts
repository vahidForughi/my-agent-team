import { createApiFactory } from '../factory/createApiFactory';
import { Request, RequestParamsRequired } from '../types';
import {
  storeParamsInput,
  StoreParamsInput,
  productByIdInput,
  ProductByIdInput,
  brandsInput,
  typesInput,
} from './input';
import {
  paginationProductsMapper,
  productMapper,
  brandArrayMapper,
  productTypeArrayMapper,
} from './mappers';
import { Pagination, Product } from './types';
import {
  BrandArray,
  ProductTypeArray,
  paginationProductsSchema,
  productSchema,
  brandArraySchema,
  productTypeArraySchema,
} from './schemas';

/**
 * Product APIs
 *
 * API functions for product-related endpoints.
 * Following fdw-iraps pattern with input, mappers, and schemas.
 */

// Create API factory for Catalog endpoints
export const apiFactory = createApiFactory('/Catalog');

/**
 * Get all products with pagination and filtering
 * Migrated from client/src/app/store/store.service.ts
 */
export async function getProducts(request?: Request<StoreParamsInput>) {
  return apiFactory<Pagination<Product[]>, Pagination<Product[]>>(
    'GET',
    '/GetAllProducts',
    request,
    {
      transformer: paginationProductsMapper.toDto,
      paramsSchema: storeParamsInput,
      responseSchema: paginationProductsSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Get product by ID
 * Migrated from client/src/app/store/store.service.ts
 */
export async function getProductById(
  request: RequestParamsRequired<ProductByIdInput>
) {
  return apiFactory<Product, Product>('GET', '/GetProductById/:id', request, {
    transformer: productMapper.toDto,
    paramsSchema: productByIdInput,
    responseSchema: productSchema,
    useMock: request?.params?.useMock ?? false,
  });
}

/**
 * Get all brands
 * Migrated from client/src/app/store/store.service.ts
 */
export async function getBrands(request?: Request) {
  return apiFactory<BrandArray, BrandArray>('GET', '/GetAllBrands', request, {
    transformer: brandArrayMapper.toDto,
    paramsSchema: brandsInput,
    responseSchema: brandArraySchema,
    useMock: request?.params?.useMock ?? false,
  });
}

/**
 * Get all product types
 * Migrated from client/src/app/store/store.service.ts
 */
export async function getTypes(request?: Request) {
  return apiFactory<ProductTypeArray, ProductTypeArray>(
    'GET',
    '/GetAllTypes',
    request,
    {
      transformer: productTypeArrayMapper.toDto,
      paramsSchema: typesInput,
      responseSchema: productTypeArraySchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}
