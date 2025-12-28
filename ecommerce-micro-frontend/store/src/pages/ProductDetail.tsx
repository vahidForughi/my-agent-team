// 1. React imports
import React from 'react';

// 2. Third-party libraries
import { Row, Col, Space, Divider, Button, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';

// 3. Local types and services
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useGetProductById } from '../services/products/hooks';
import { useProductActions } from '../hooks/useProductActions';
import {
  ProductImageGallery,
  ProductTitle,
  ProductPrice,
  ProductDescription,
  ProductActions,
  StickyBuyBar,
} from '../components/ProductDetail';
import ProductDetailSkeleton from '../components/ProductDetail/ProductDetailSkeleton';

type ProductDetailProps = {
  productId: string;
  config?: AppInjectorProps['config'];
};

function ProductDetail(props: ProductDetailProps) {
  const { productId, config } = props;
  const navigate = useNavigate();

  const {
    data: productData,
    isLoading,
    isError,
    error,
  } = useGetProductById(productId, {
    enabled: Boolean(productId),
  });

  const product = productData ?? null;

  const {
    quantity,
    setQuantity,
    handleAddToCart,
    canAddToCart,
    maxQuantity,
    isAddingToCart,
  } = useProductActions({
    product,
    config,
  });

  function handleBack() {
    navigate({ to: '/', search: {} });
  }

  async function handleBuyNow() {
    if (!product) {
      return;
    }

    if (!canAddToCart) {
      return;
    }

    try {
      const success = await handleAddToCart();
      if (success) {
        window.location.href = '/checkout';
      }
    } catch (error) {
      console.error('Failed to proceed to checkout:', error);
    }
  }

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <Space
        direction="vertical"
        align="center"
        size="large"
        style={{ width: '100%', padding: '24px' }}
      >
        <Empty
          description={
            error?.message || "The product you're looking for doesn't exist."
          }
        />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          Back to Store
        </Button>
      </Space>
    );
  }

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: '100%', padding: '24px' }}
    >
      <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
        Back to Store
      </Button>

      <Row gutter={[24, 24]}>
        {/* Left Column - Product Images */}
        <Col xs={24} md={12}>
          <ProductImageGallery
            images={[product.imageFile]}
            productName={product.name}
          />
        </Col>

        {/* Right Column - Product Info */}
        <Col xs={24} md={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <ProductTitle name={product.name} />
            <ProductPrice price={product.price} />
            <Divider />
            <ProductDescription description={product.description} />
            <Divider />
            <ProductActions
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              canAddToCart={canAddToCart}
              maxQuantity={maxQuantity}
              isInStock={true}
              isLoading={isAddingToCart}
            />
          </Space>
        </Col>
      </Row>

      {/* Mobile Sticky Buy Bar */}
      <StickyBuyBar
        price={product.price}
        onAddToCart={handleAddToCart}
        canAddToCart={canAddToCart}
        isInStock={true}
      />
    </Space>
  );
}

export default ProductDetail;
