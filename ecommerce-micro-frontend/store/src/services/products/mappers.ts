import { createMapper } from '../factory/createMapper';
import {
  Product,
  ProductResponse,
  ProductsResponse,
  ProductDetailResponse,
  ReviewResponse,
  ReviewsResponse,
  Review,
  Brand,
  BrandResponse,
  ProductType,
  ProductTypeResponse,
} from './types';
import {
  productResponseSchema,
  productsResponseSchema,
  productDetailResponseSchema,
  reviewResponseSchema,
  brandResponseSchema,
  productTypeResponseSchema,
  brandArrayResponseSchema,
  productTypeArrayResponseSchema,
  productSchema,
  reviewSchema,
} from './schemas';

export const productMapper = createMapper<ProductResponse, Product>(
  (response) => {
    return {
      id: response.Id,
      name: response.Name,
      description: response.Description,
      imageFile: response.ImageFile,
      price: response.Price,
      productType: response.Types?.Id ?? '',
      productBrand: response.Brands?.Id ?? '',
      // Default values for optional fields (schema will handle these)
      images: [],
      features: [],
      specifications: {},
      hasDiscount: false,
      shippingFreeShipping: false,
      metaKeywords: [],
      relatedProductIds: [],
      reviews: [],
    };
  },
  productResponseSchema
);

export const productsMapper = createMapper<ProductsResponse, Product[]>(
  (response) => {
    return response.Data.map((productResponse) =>
      productMapper.toDto(productResponse)
    ).filter((product): product is Product => product !== null);
  },
  productsResponseSchema
);

export const brandMapper = createMapper<BrandResponse, Brand>((response) => {
  return {
    id: response.Id,
    name: response.Name,
  };
}, brandResponseSchema);

export const brandArrayMapper = createMapper<BrandResponse[], Brand[]>(
  (response) => {
    return response
      .map((brandResponse) => brandMapper.toDto(brandResponse))
      .filter((brand): brand is Brand => brand !== null);
  },
  brandArrayResponseSchema
);

export const productTypeMapper = createMapper<ProductTypeResponse, ProductType>(
  (response) => {
    return {
      id: response.Id,
      name: response.Name,
    };
  },
  productTypeResponseSchema
);

export const productTypeArrayMapper = createMapper<
  ProductTypeResponse[],
  ProductType[]
>((response) => {
  return response
    .map((typeResponse) => productTypeMapper.toDto(typeResponse))
    .filter((type): type is ProductType => type !== null);
}, productTypeArrayResponseSchema);

export const reviewMapper = createMapper<ReviewResponse, Review>((response) => {
  return {
    reviewId: response.reviewId,
    userId: response.userId,
    userName: response.userName,
    rating: response.rating,
    date: response.date,
    comment: response.comment,
    helpfulCount: response.helpfulCount ?? 0,
  };
}, reviewResponseSchema);

export const reviewsMapper = (reviews: ReviewsResponse): Review[] => {
  return reviews
    .map((review) => reviewMapper.toDto(review))
    .filter((review): review is Review => review !== null);
};

export const productDetailMapper = createMapper<ProductDetailResponse, Product>(
  (response) => {
    // Compute stock status
    let stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | undefined;
    if (response.Stock) {
      if (!response.Stock.inStock) {
        stockStatus = 'out-of-stock';
      } else if (
        response.Stock.lowStockThreshold &&
        response.Stock.quantity <= response.Stock.lowStockThreshold
      ) {
        stockStatus = 'low-stock';
      } else {
        stockStatus = 'in-stock';
      }
    }

    return {
      id: response.Id,
      name: response.Name,
      description: response.Description,
      imageFile: response.ImageFile,
      price: response.Price,
      productType: response.Types?.Id ?? '',
      productBrand: response.Brands?.Id ?? '',
      // Detail fields
      images: response.Images ?? [],
      features: response.Features ?? [],
      specifications: response.Specifications ?? {},
      // Stock fields
      stockQuantity: response.Stock?.quantity,
      stockInStock: response.Stock?.inStock,
      stockLowStockThreshold: response.Stock?.lowStockThreshold,
      stockStatus,
      // Rating fields
      ratingAverage: response.Rating?.average,
      ratingCount: response.Rating?.count,
      ratingDistribution: response.Rating?.distribution,
      // Shipping fields
      shippingFreeShipping: response.Shipping?.freeShipping ?? false,
      shippingEstimatedDeliveryDays: response.Shipping?.estimatedDeliveryDays,
      shippingCost: response.Shipping?.shippingCost,
      // Meta fields
      metaTitle: response.Meta?.title,
      metaDescription: response.Meta?.description,
      metaKeywords: response.Meta?.keywords ?? [],
      // Related products
      relatedProductIds: response.RelatedProductIds ?? [],
      // Defaults for other optional fields
      hasDiscount: false,
      reviews: [],
    };
  },
  productDetailResponseSchema
);
