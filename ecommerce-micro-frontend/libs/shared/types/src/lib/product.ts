export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  imageUrl: string;
  images?: string[];
  category: string;
  brand?: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  productCount?: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  tags?: string[];
  search?: string;
}

