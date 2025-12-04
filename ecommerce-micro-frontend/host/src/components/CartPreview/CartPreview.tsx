import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Empty, Spin, List, Typography, Flex, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { brandGradient } from '../../config/theme';

const { Text } = Typography;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartPreviewProps {
  visible: boolean;
  items?: CartItem[];
  isLoading?: boolean;
  onRemoveItem?: (id: string) => void;
}

const CartPreview: React.FC<CartPreviewProps> = ({
  visible,
  items = [],
  isLoading = false,
  onRemoveItem,
}) => {
  const navigate = useNavigate();

  if (!visible) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleRemoveItem = (id: string) => {
    onRemoveItem?.(id);
  };

  return (
    <Card
      style={{
        position: 'absolute',
        top: 'calc(100% + 16px)',
        right: 0,
        width: 400,
        borderRadius: 16,
        boxShadow: '0 12px 48px rgba(15, 23, 42, 0.12)',
        zIndex: 1002,
        border: '1px solid #f1f5f9',
      }}
      styles={{
        header: {
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          background: 'rgba(102, 126, 234, 0.03)',
          borderRadius: '16px 16px 0 0',
        },
        body: {
          padding: 0,
          maxHeight: 420,
          overflowY: 'auto',
        },
      }}
      title={
        <Text strong style={{ fontSize: 16, fontWeight: 600 }}>
          Shopping Cart ({items.length} items)
        </Text>
      }
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px', minHeight: 200 }}>
          <Spin tip="Loading cart..." />
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: '40px 20px' }}>
          <Empty
            description="Your cart is empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <>
          <List
            dataSource={items}
            style={{ padding: 16 }}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '14px',
                  borderRadius: 12,
                  marginBottom: 10,
                  border: '1px solid transparent',
                }}
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                    style={{
                      color: '#94a3b8',
                    }}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: 70,
                        height: 70,
                        objectFit: 'cover',
                        borderRadius: 10,
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                      }}
                    />
                  }
                  title={
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </Text>
                  }
                  description={
                    <Text
                      style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: brandGradient.start,
                      }}
                    >
                      ${item.price.toFixed(2)} x {item.quantity}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />

          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid #f1f5f9',
              background: '#fafbfc',
              borderRadius: '0 0 16px 16px',
            }}
          >
            <Flex justify="space-between" align="center" style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 16, fontWeight: 600 }}>Subtotal:</Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: brandGradient.start,
                  letterSpacing: '-0.5px',
                }}
              >
                ${totalAmount.toFixed(2)}
              </Text>
            </Flex>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => navigate('/checkout')}
                style={{
                  background: brandGradient.start,
                  border: 'none',
                  height: 48,
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: '0.3px',
                  borderRadius: 12,
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
                }}
              >
                Proceed to Checkout
              </Button>
              <Button
                size="large"
                block
                onClick={() => navigate('/cart')}
                style={{
                  height: 44,
                  borderRadius: 12,
                  border: '2px solid #e2e8f0',
                  fontWeight: 600,
                  color: '#64748b',
                }}
              >
                View Full Cart
              </Button>
            </Space>
          </div>
        </>
      )}
    </Card>
  );
};

export default CartPreview;
