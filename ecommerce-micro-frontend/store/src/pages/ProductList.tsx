import React, { useState, useMemo } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AppInjectorProps } from '@ecommerce/app-injector';
import { useGetProducts, useGetTypes } from '../services/products/hooks';
import { StoreParamsInput } from '../services/products';
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
  const { onError } = config || {};

  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>();
  const [selectedFilter, setSelectedFilter] =
    useState<ProductFilterType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  const { data: productTypes } = useGetTypes({ useMock: true });

  const params = useMemo<StoreParamsInput>(() => {
    const baseParams: StoreParamsInput = {
      page: 1,
      limit: 20,
    };

    if (selectedTypeId) {
      baseParams.TypeId = selectedTypeId;
    }

    if (sortOption !== 'default') {
      baseParams.Sort = sortOption;
    }

    return baseParams;
  }, [selectedTypeId, sortOption]);

  const { data: products, isLoading, error } = useGetProducts(params, {
    useMock: true,
  });

  const productCount = useMemo(() => {
    return products?.length || 0;
  }, [products]);

  const totalCount = useMemo(() => {
    return products?.length || 0;
  }, [products]);

  function handleAddToCart(_productId: string, productName: string) {
    try {
      message.success(`${productName} added to cart!`);
    } catch (err) {
      if (onError) {
        onError(err as Error);
      } else {
        message.error('Failed to add item to cart');
      }
    }
  }

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
  }

  function handleFilterChange(filter: ProductFilterType) {
    setSelectedFilter(filter);
    if (filter !== 'all') {
      setSelectedTypeId(undefined);
    }
  }

  function handleSortChange(sort: SortOption) {
    setSortOption(sort);
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
    </div>
  );
};

export default ProductList;
