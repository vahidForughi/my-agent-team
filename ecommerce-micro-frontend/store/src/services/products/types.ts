// Migrated from client/src/app/shared/models/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  imageFile: string;
  price: number;
  productType: string;
  productBrand: string;
  originalPrice?: number;
  discountAmount?: number;
  hasDiscount?: boolean;
}

export interface ProductWithDiscount extends Product {
  originalPrice: number;
  discountAmount: number;
  hasDiscount: boolean;
}

// Migrated from client/src/app/shared/models/pagination.ts
export interface Pagination<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T;
}

// Migrated from client/src/app/shared/models/brand.ts
export interface Brand {
  id: string;
  name: string;
}

// Migrated from client/src/app/shared/models/type.ts
export interface ProductType {
  id: string;
  name: string;
}

// Migrated from client/src/app/shared/models/storeParams.ts
export interface StoreParams {
  brandId?: string;
  typeId?: string;
  sort?: string;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  useMock?: boolean; // For toggling between real API and mock
}

