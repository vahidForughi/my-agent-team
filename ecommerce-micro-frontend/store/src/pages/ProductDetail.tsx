import React from 'react';
import {
  Typography,
  Card,
  Button,
  Row,
  Col,
  Divider,
  Space,
  Tag,
  message,
} from 'antd';
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { AppInjectorProps } from '@ecommerce/app-injector';

const { Title, Text, Paragraph } = Typography;

type ProductDetailProps = {
  config?: AppInjectorProps['config'];
};

const ProductDetail: React.FC<ProductDetailProps> = ({ config }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appContext, onNavigate, onError } = config || {};
  const { user, theme = 'light' } = appContext || {};

  const products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      description:
        'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.',
      features: [
        'Active Noise Cancellation',
        '30-hour battery life',
        'Bluetooth 5.0',
        'Comfortable over-ear design',
      ],
      rating: 4.5,
      reviews: 234,
      inStock: true,
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      description:
        'Advanced fitness tracker with heart rate monitoring, GPS, and smartphone notifications. Track your health and stay connected on the go.',
      features: [
        'Heart Rate Monitor',
        'GPS Tracking',
        'Water Resistant',
        '7-day battery life',
      ],
      rating: 4.7,
      reviews: 567,
      inStock: true,
    },
    {
      id: 3,
      name: 'Laptop Stand',
      price: 49.99,
      description:
        'Ergonomic aluminum laptop stand that improves posture and provides better airflow for your device. Adjustable height and angle for maximum comfort.',
      features: [
        'Aluminum construction',
        'Adjustable height',
        'Improved ergonomics',
        'Better cooling',
      ],
      rating: 4.3,
      reviews: 189,
      inStock: true,
    },
    {
      id: 4,
      name: 'USB-C Cable',
      price: 19.99,
      description:
        'High-speed USB-C cable with fast charging support and data transfer rates up to 10Gbps. Durable braided design for long-lasting use.',
      features: [
        'Fast charging',
        'Data transfer up to 10Gbps',
        'Braided cable',
        '6ft length',
      ],
      rating: 4.6,
      reviews: 892,
      inStock: true,
    },
    {
      id: 5,
      name: 'Phone Case',
      price: 29.99,
      description:
        'Protective phone case with military-grade drop protection and wireless charging compatibility. Slim design that fits in your pocket.',
      features: [
        'Military-grade protection',
        'Wireless charging compatible',
        'Slim design',
        'Anti-slip grip',
      ],
      rating: 4.4,
      reviews: 445,
      inStock: true,
    },
    {
      id: 6,
      name: 'Portable Charger',
      price: 39.99,
      description:
        '20000mAh portable power bank with fast charging and multiple USB ports. Keep all your devices charged on the go.',
      features: [
        '20000mAh capacity',
        'Fast charging',
        'Multiple USB ports',
        'LED battery indicator',
      ],
      rating: 4.8,
      reviews: 1023,
      inStock: true,
    },
  ];

  const product = products.find((p) => p.id === Number(id));

  const handleAddToCart = () => {
    if (!product) return;

    try {
      message.success(`${product.name} added to cart!`);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        message.error('Failed to add item to cart');
      }
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    if (onNavigate) {
      onNavigate('/checkout');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!product) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={3}>Product Not Found</Title>
        <Text type="secondary">
          The product you're looking for doesn't exist.
        </Text>
        <div style={{ marginTop: '24px' }}>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          >
            Back to Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="product-detail"
      data-product-id={product.id}
      style={{ padding: '24px' }}
    >
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: '24px' }}
        data-testid="back-to-store-button"
      >
        Back to Store
      </Button>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card
            cover={
              <div
                style={{
                  height: 400,
                  background: theme === 'dark' ? '#333' : '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingCartOutlined
                  style={{
                    fontSize: 120,
                    color: theme === 'dark' ? '#666' : '#d9d9d9',
                  }}
                />
              </div>
            }
          />
        </Col>

        <Col xs={24} md={14}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={2} style={{ marginBottom: 8 }}>
                {product.name}
              </Title>
              <Space>
                <Text strong style={{ fontSize: 18 }}>
                  <StarFilled style={{ color: '#faad14', marginRight: 4 }} />
                  {product.rating}
                </Text>
                <Text type="secondary">({product.reviews} reviews)</Text>
                {product.inStock ? (
                  <Tag color="success">In Stock</Tag>
                ) : (
                  <Tag color="error">Out of Stock</Tag>
                )}
              </Space>
            </div>

            <div>
              <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                ${product.price.toFixed(2)}
              </Title>
            </div>

            <Divider />

            <div>
              <Title level={4}>Description</Title>
              <Paragraph>{product.description}</Paragraph>
            </div>

            <div>
              <Title level={4}>Key Features</Title>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>
                    <Text>{feature}</Text>
                  </li>
                ))}
              </ul>
            </div>

            <Divider />

            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                Add to Cart
              </Button>
              <Button
                size="large"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Buy Now
              </Button>
            </Space>

            {user && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Logged in as {user.firstName} {user.lastName}
              </Text>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;
