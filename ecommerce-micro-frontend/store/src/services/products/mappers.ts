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
      id: response.id,
      name: response.name,
      summary: response.summary,
      description: response.description,
      imageFile: response.imageFile,
      brands: response.brands,
      types: response.types,
      price: response.price,
    };
  },
  productResponseSchema
);

export const productsMapper = createMapper<ProductsResponse, import('./types').PaginatedProducts>(
  (response) => {
    return {
      pageIndex: response.pageIndex,
      pageSize: response.pageSize,
      count: response.count,
      data: response.data.map((productResponse) =>
        productMapper.toDto(productResponse)
      ).filter((product): product is Product => product !== null),
    };
  },
  productsResponseSchema
);

export const brandMapper = createMapper<BrandResponse, Brand>((response) => {
  return {
    id: response.id,
    name: response.name,
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
      id: response.id,
      name: response.name,
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
    return {
      id: response.id,
      name: response.name,
      summary: response.summary,
      description: response.description,
      imageFile: response.imageFile,
      brands: response.brands,
      types: response.types,
      price: response.price,
    };
  },
  productDetailResponseSchema
);
