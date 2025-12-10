import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { message, Pagination } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppInjectorProps } from '@ecommerce/app-injector';
import { useGetProducts, useGetTypes } from '../services/products/hooks';
import { StoreParamsInput, Product } from '../services/products';
import { useAddToCart } from '../services/basket';
import {
  ProductHeader,
  ProductGrid,
  LoadingState,
  ErrorState,
  ProductFilterType,
  SortOption,
} from '../components/ProductList';

type ProductListProps = {
  config?: AppInjectorProps['config'];
};

const ProductList: React.FC<ProductListProps> = ({ config }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { onError } = config || {};

  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>();
  const [selectedFilter, setSelectedFilter] =
    useState<ProductFilterType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Backend returns max 10 items per page

  const { data: productTypes } = useGetTypes();

  // Read typeId from URL query parameters
  useEffect(() => {
    const typeIdFromUrl = searchParams.get('typeId');
    const catFromUrl = searchParams.get('cat');

    if (typeIdFromUrl) {
      // Direct typeId from URL (e.g., ?typeId=63ca5d8849bc19321b8be5f1)
      setSelectedTypeId(typeIdFromUrl);
      setSelectedFilter('all' as ProductFilterType); // Explicitly set to clear special filters
    } else if (catFromUrl && productTypes) {
      // Category name from URL (e.g., ?cat=laptops) - need to find matching type by name
      const matchingType = productTypes.find(
        (type) => type.name.toLowerCase() === catFromUrl.toLowerCase()
      );
      if (matchingType) {
        setSelectedTypeId(matchingType.id);
        setSelectedFilter('all' as ProductFilterType); // Explicitly set to clear special filters
      } else {
        // If no match found, clear the filter
        setSelectedTypeId(undefined);
        setSelectedFilter('all');
      }
    } else {
      // No filter in URL, clear selection and set to 'all'
      setSelectedTypeId(undefined);
      if (selectedFilter !== 'all') {
        setSelectedFilter('all');
      }
    }
  }, [searchParams, productTypes]);

  const params = useMemo<StoreParamsInput>(() => {
    const baseParams: StoreParamsInput = {
      page: currentPage,
      limit: pageSize,
    };

    if (selectedTypeId) {
      baseParams.TypeId = selectedTypeId;
    }

    if (sortOption !== 'default') {
      baseParams.Sort = sortOption;
    }

    console.log('[ProductList] API params:', baseParams);
    return baseParams;
  }, [selectedTypeId, sortOption, currentPage]);

  const { data: paginatedProducts, isLoading, error } = useGetProducts(params);

  // Add to cart mutation
  const addToCartMutation = useAddToCart();

  console.log('[ProductList] Products data:', {
    count: paginatedProducts?.data.length,
    totalCount: paginatedProducts?.count,
    pageIndex: paginatedProducts?.pageIndex,
    pageSize: paginatedProducts?.pageSize,
    selectedTypeId,
    params
  });

  const products = useMemo(() => {
    return paginatedProducts?.data || [];
  }, [paginatedProducts]);

  const productCount = useMemo(() => {
    return products.length;
  }, [products]);

  const totalCount = useMemo(() => {
    return paginatedProducts?.count || 0;
  }, [paginatedProducts]);

  const handleAddToCart = useCallback(
    async (productId: string, productName: string) => {
      // Find the product from the list
      const product = products.find((p: Product) => p.id === productId);

      if (!product) {
        message.error('Product not found');
        return;
      }

      try {
        await addToCartMutation.mutateAsync({
          productId: product.id,
          productName: product.name,
          price: product.price,
          originalPrice: product.originalPrice ?? product.price,
          quantity: 1,
          imageFile: product.imageFile ?? null,
        });

        message.success(`${productName} added to cart!`);
      } catch (err) {
        if (onError) {
          onError(err as Error);
        } else {
          message.error('Failed to add item to cart');
        }
      }
    },
    [products, addToCartMutation, onError]
  );

  function handleViewDetails(productId: string) {
    navigate(`/product/${productId}`);
  }

  if (error) {
    return <ErrorState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  function handleTypeChange(typeId: string | undefined) {
    setSelectedTypeId(typeId);
    setCurrentPage(1); // Reset to first page when filter changes
  }

  function handleFilterChange(filter: ProductFilterType) {
    setSelectedFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
    if (filter !== 'all') {
      setSelectedTypeId(undefined);
    } else {
      // When clicking "All Products", clear both category and URL
      setSelectedTypeId(undefined);
      navigate('/', { replace: true });
    }
  }

  function handleSortChange(sort: SortOption) {
    setSortOption(sort);
    setCurrentPage(1); // Reset to first page when sort changes
  }

  if (!products || products.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <ProductHeader
          productCount={0}
          totalCount={0}
          productTypes={productTypes || undefined}
          selectedTypeId={selectedTypeId}
          selectedFilter={selectedFilter}
          sortOption={sortOption}
          onTypeChange={handleTypeChange}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <ProductHeader
        productCount={productCount}
        totalCount={totalCount}
        productTypes={productTypes || undefined}
        selectedTypeId={selectedTypeId}
        selectedFilter={selectedFilter}
        sortOption={sortOption}
        onTypeChange={handleTypeChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />
      <ProductGrid
        products={products}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewDetails}
      />
      {totalCount > pageSize && (
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            onChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            showSizeChanger={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} products`}
          />
        </div>
      )}
    </div>
  );
};

export default ProductList;
