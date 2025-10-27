import React from 'react';
import { Typography, Card, Row, Col, Button, message } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AppInjectorProps } from '@ecommerce/app-injector';

const { Title, Text } = Typography;

type ProductListProps = {
  config?: AppInjectorProps['config'];
};

const ProductList: React.FC<ProductListProps> = ({ config }) => {
  const navigate = useNavigate();
  const { appContext, onError } = config || {};
  const { user, theme = 'light' } = appContext || {};

  const handleAddToCart = (_productId: number, productName: string) => {
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

  const handleViewDetails = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const products = [
    { id: 1, name: 'Wireless Headphones', price: 99.99 },
    { id: 2, name: 'Smart Watch', price: 199.99 },
    { id: 3, name: 'Laptop Stand', price: 49.99 },
    { id: 4, name: 'USB-C Cable', price: 19.99 },
    { id: 5, name: 'Phone Case', price: 29.99 },
    { id: 6, name: 'Portable Charger', price: 39.99 },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ShoppingOutlined style={{ marginRight: '12px' }} />
          Product Store
        </Title>
        {user && (
          <Text type="secondary">
            Welcome back, {user.firstName}! Browse our latest products.
          </Text>
        )}
      </div>

      <Row gutter={[16, 16]}>
        {products.map((product) => (
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
                description={`$${product.price.toFixed(2)}`}
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
