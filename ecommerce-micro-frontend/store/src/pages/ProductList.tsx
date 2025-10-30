import React, { useState } from 'react';
import { Typography, Card, Row, Col, Button, message, Spin, Alert } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AppInjectorProps } from '@ecommerce/app-injector';
import { useGetProducts } from '../services/products/hooks';
import { StoreParamsInput, Product } from '../services/products';

const { Title, Text } = Typography;

type ProductListProps = {
  config?: AppInjectorProps['config'];
};

const ProductList: React.FC<ProductListProps> = ({ config }) => {
  const navigate = useNavigate();
  const { appContext, onError } = config || {};
  const { user, theme = 'light' } = appContext || {};

  const [params] = useState<StoreParamsInput>({
    pageNumber: 1,
    pageSize: 20,
    useMock: true, // Enable mock data
  });

  const { data: productsResponse, isLoading, error } = useGetProducts(params);

  // Extract products with proper type checking
  const products: Product[] = ((productsResponse as any)?.data?.data) || [];
  const totalCount = ((productsResponse as any)?.data?.count) || 0;

  const handleAddToCart = (_productId: string, productName: string) => {
    try {
      message.success(`${productName} added to cart!`);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        message.error('Failed to add item to cart');
      }
    }
  };

  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error Loading Products"
          description="Failed to load products. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="Loading products..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ShoppingOutlined style={{ marginRight: '12px' }} />
          Product Store
        </Title>
        {user && (
          <Text type="secondary">
            Welcome back, {(user as any).name || 'Guest'}! Browse our latest products.
          </Text>
        )}
        <div style={{ marginTop: '8px' }}>
          <Text type="secondary">
            Showing {products.length} of {totalCount} products
          </Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {products.map((product: Product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              data-testid="product-card"
              data-product-id={product.id}
              cover={
                <div
                  style={{
                    height: 200,
                    background: theme === 'dark' ? '#333' : '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleViewDetails(product.id)}
                  data-testid="product-cover"
                >
                  <ShoppingOutlined
                    style={{
                      fontSize: 48,
                      color: theme === 'dark' ? '#666' : '#d9d9d9',
                    }}
                  />
                </div>
              }
            >
              <Card.Meta
                title={<span data-testid="product-name">{product.name}</span>}
                description={
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                      ${product.price.toFixed(2)}
                    </div>
                    {product.hasDiscount && product.originalPrice && (
                      <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>
                        ${product.originalPrice.toFixed(2)}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {product.description}
                    </div>
                  </div>
                }
              />
              <Button
                type="primary"
                block
                style={{ marginTop: 16 }}
                onClick={() => handleAddToCart(product.id, product.name)}
              >
                Add to Cart
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductList;
