import React, { useState } from 'react';
import {
  Typography,
  List,
  Button,
  Divider,
  message,
  InputNumber,
  Space,
  Empty,
} from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { AppInjectorProps } from '@ecommerce/app-injector';

const { Title, Text } = Typography;

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

type CheckoutModuleProps = AppInjectorProps;

const CheckoutModule: React.FC<CheckoutModuleProps> = ({ config }) => {
  const { appContext, onNavigate, onError } = config || {};
  const { user } = appContext || {};

  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: 'Wireless Headphones', price: 99.99, quantity: 2 },
    { id: 2, name: 'Smart Watch', price: 199.99, quantity: 1 },
    { id: 3, name: 'Laptop Stand', price: 49.99, quantity: 1 },
  ]);

  const handleRemoveItem = (itemId: number) => {
    try {
      setCartItems(cartItems.filter((item) => item.id !== itemId));
      message.success('Item removed from cart');
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        message.error('Failed to remove item');
      }
    }
  };

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    try {
      if (quantity < 1) {
        handleRemoveItem(itemId);
        return;
      }

      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      message.success('Quantity updated');
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        message.error('Failed to update quantity');
      }
    }
  };

  const handleProceedToCheckout = () => {
    try {
      if (!user) {
        message.warning('Please login to proceed to checkout');
        if (onNavigate) {
          onNavigate('/login');
        }
        return;
      }

      message.success('Proceeding to checkout...');
      if (onNavigate) {
        onNavigate('/checkout/payment');
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        message.error('Failed to proceed to checkout');
      }
    }
  };

  const handleContinueShopping = () => {
    if (onNavigate) {
      onNavigate('/store');
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>
        <ShoppingCartOutlined style={{ marginRight: '12px' }} />
        Shopping Cart
      </Title>

      {user && (
        <Text
          type="secondary"
          style={{ display: 'block', marginBottom: '24px' }}
        >
          Hi {user.firstName}, review your cart items before checkout
        </Text>
      )}

      {cartItems.length === 0 ? (
        <Empty description="Your cart is empty" style={{ margin: '60px 0' }}>
          <Button type="primary" onClick={handleContinueShopping}>
            Continue Shopping
          </Button>
        </Empty>
      ) : (
        <>
          <List
            itemLayout="horizontal"
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Space key="actions">
                    <InputNumber
                      min={1}
                      max={99}
                      value={item.quantity}
                      onChange={(value) =>
                        handleUpdateQuantity(item.id, value || 1)
                      }
                      size="small"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </Button>
                  </Space>,
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={`$${item.price.toFixed(2)} each`}
                />
                <div>
                  <Text strong>${(item.price * item.quantity).toFixed(2)}</Text>
                </div>
              </List.Item>
            )}
          />

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Subtotal:</Text>
                <Text>${subtotal.toFixed(2)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Tax (10%):</Text>
                <Text>${tax.toFixed(2)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Shipping:</Text>
                <Text>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Title level={4} style={{ margin: 0 }}>
                  Total:
                </Title>
                <Title level={4} style={{ margin: 0 }}>
                  ${total.toFixed(2)}
                </Title>
              </div>
            </Space>

            <Space style={{ marginTop: '24px' }}>
              <Button size="large" onClick={handleContinueShopping}>
                Continue Shopping
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </Button>
            </Space>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckoutModule;
