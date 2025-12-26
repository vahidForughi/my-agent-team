import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Radio,
  Input,
  Select,
  Divider,
  Row,
  Col,
  InputNumber,
  message,
  Spin,
} from 'antd';
import {
  ShoppingCartOutlined,
  LockOutlined,
  CreditCardOutlined,
  BankOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@ecommerce-platform/auth-provider';
import {
  useGetCart,
  useCheckout,
  useUpdateCartItem,
  useRemoveCartItem,
} from '../services/cart/hooks';
import type { CartItem } from '../services/cart/types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Checkout Page Component
 *
 * Complete checkout flow with:
 * - Order summary with quantity controls
 * - Optional shipping information
 * - Payment method selection
 * - Order total calculation
 */
export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useGetCart();
  const { mutate: checkout, isPending: isCheckingOut } = useCheckout();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveCartItem();

  // Form state (all optional)
  const [paymentMethod, setPaymentMethod] = useState<number>(0); // 0=Cash, 1=Card, 2=Bank
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Vietnam',
    notes: '',
  });

  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem({
      productId: item.productId,
      quantity: newQuantity,
    });
  };

  const handleRemoveItem = (productId: string) => {
    removeItem({ productId });
  };

  const handlePlaceOrder = () => {
    if (!cart?.data || cart.data.items.length === 0) {
      message.warning('Your cart is empty');
      return;
    }

    // Get user info from auth if logged in, otherwise use form values or defaults
    // Priority: user.firstName/lastName > user.displayName > form values > defaults
    const getUserFirstName = () => {
      if (isAuthenticated && user?.firstName) return user.firstName;
      if (isAuthenticated && user?.displayName) {
        return user.displayName.split(' ')[0] || 'Guest';
      }
      if (shippingInfo.fullName) return shippingInfo.fullName.split(' ')[0];
      return 'Guest';
    };

    const getUserLastName = () => {
      if (isAuthenticated && user?.lastName) return user.lastName;
      if (isAuthenticated && user?.displayName) {
        const parts = user.displayName.split(' ');
        return parts.slice(1).join(' ') || 'User';
      }
      if (shippingInfo.fullName) {
        const parts = shippingInfo.fullName.split(' ');
        return parts.slice(1).join(' ') || 'User';
      }
      return 'User';
    };

    const getUserEmail = () => {
      if (isAuthenticated && user?.email) return user.email;
      return 'guest@example.com';
    };

    // Prepare checkout data - use user info if logged in, otherwise use form values or defaults
    checkout(
      {
        totalPrice: cart.data.totalPrice,
        // Shipping info (use user info if logged in, otherwise form values or defaults)
        firstName: getUserFirstName(),
        lastName: getUserLastName(),
        emailAddress: getUserEmail(),
        addressLine: shippingInfo.address || 'N/A',
        country: shippingInfo.country || 'Vietnam',
        state: shippingInfo.city || 'N/A',
        zipCode: shippingInfo.zipCode || '00000',
        // Payment info (required by backend, use defaults)
        cardName: 'N/A',
        cardNumber: '0000000000000000',
        expiration: '12/99',
        cvv: '000',
        paymentMethod: paymentMethod,
      },
      {
        onSuccess: (response) => {
          console.log('[Checkout] Order placed successfully:', response);
          message.success('Order placed successfully!');
          // Navigate to cart page
          navigate({ to: '/' });
          // Clear cart will be handled by checkout API
        },
        onError: (error) => {
          console.error('[Checkout] Order failed:', error);
          message.error('Failed to place order. Please try again.');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!cart?.data || cart.data.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <ShoppingCartOutlined
          style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }}
        />
        <Title level={3}>Your cart is empty</Title>
        <Paragraph>Add some products to continue with checkout.</Paragraph>
        <Button type="primary" onClick={() => navigate({ to: '/' })}>
          Back to Cart
        </Button>
      </div>
    );
  }

  const cartData = cart.data;
  const subtotal = cartData.items.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0; // Free shipping
  const tax = 0; // No tax
  const total = subtotal + shipping + tax;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate({ to: '/' })}
          style={{ padding: 0, marginBottom: 16 }}
        >
          Back to Cart
        </Button>
        <Title level={2}>Checkout</Title>
        <Text type="secondary">Complete your purchase securely</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Order Items & Forms */}
        <Col xs={24} lg={16}>
          {/* Order Summary Section */}
          <Card title="Order Summary" style={{ marginBottom: 24 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {cartData.items.map((item: CartItem) => (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '16px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <img
                    src={item.imageFile || '/placeholder.png'}
                    alt={item.productName}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ marginBottom: 4 }}>
                      {item.productName}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Qty: {item.quantity}
                    </Text>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 8,
                    }}
                  >
                    <Space size="small">
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() =>
                          handleUpdateQuantity(item, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      />
                      <InputNumber
                        size="small"
                        min={1}
                        value={item.quantity}
                        onChange={(value) =>
                          handleUpdateQuantity(item, value || 1)
                        }
                        style={{ width: 60 }}
                      />
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          handleUpdateQuantity(item, item.quantity + 1)
                        }
                      />
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item.productId)}
                      />
                    </Space>
                    <Text strong style={{ fontSize: 16 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </div>
                </div>
              ))}
            </Space>
          </Card>

          {/* Shipping Information (Optional) */}
          <Card
            title="Shipping Information (Optional)"
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text>Full Name</Text>
                <Input
                  placeholder="Your full name"
                  value={shippingInfo.fullName}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      fullName: e.target.value,
                    })
                  }
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text>Phone Number</Text>
                <Input
                  placeholder="Your phone number"
                  value={shippingInfo.phone}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, phone: e.target.value })
                  }
                />
              </Col>
              <Col xs={24}>
                <Text>Address</Text>
                <Input
                  placeholder="Street address"
                  value={shippingInfo.address}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      address: e.target.value,
                    })
                  }
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text>City</Text>
                <Input
                  placeholder="City"
                  value={shippingInfo.city}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, city: e.target.value })
                  }
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text>ZIP Code</Text>
                <Input
                  placeholder="ZIP code"
                  value={shippingInfo.zipCode}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      zipCode: e.target.value,
                    })
                  }
                />
              </Col>
              <Col xs={24}>
                <Text>Country</Text>
                <Select
                  style={{ width: '100%' }}
                  value={shippingInfo.country}
                  onChange={(value) =>
                    setShippingInfo({ ...shippingInfo, country: value })
                  }
                >
                  <Select.Option value="Vietnam">Vietnam</Select.Option>
                  <Select.Option value="United States">
                    United States
                  </Select.Option>
                  <Select.Option value="Japan">Japan</Select.Option>
                  <Select.Option value="South Korea">South Korea</Select.Option>
                  <Select.Option value="Singapore">Singapore</Select.Option>
                </Select>
              </Col>
              <Col xs={24}>
                <Text>Order Notes (Optional)</Text>
                <TextArea
                  rows={3}
                  placeholder="Special instructions for delivery"
                  value={shippingInfo.notes}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, notes: e.target.value })
                  }
                />
              </Col>
            </Row>
          </Card>

          {/* Payment Method */}
          <Card title="Payment Method">
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                <Radio value={0}>
                  <Space>
                    <DollarOutlined style={{ fontSize: 20 }} />
                    <div>
                      <Text strong>Cash on Delivery</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Pay when you receive your order
                      </Text>
                    </div>
                  </Space>
                </Radio>
                <Radio value={1}>
                  <Space>
                    <CreditCardOutlined style={{ fontSize: 20 }} />
                    <div>
                      <Text strong>Credit/Debit Card</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Pay securely with your card
                      </Text>
                    </div>
                  </Space>
                </Radio>
                <Radio value={2}>
                  <Space>
                    <BankOutlined style={{ fontSize: 20 }} />
                    <div>
                      <Text strong>Bank Transfer</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Pay via direct bank transfer
                      </Text>
                    </div>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Card>
        </Col>

        {/* Right Column - Order Total */}
        <Col xs={24} lg={8}>
          <Card title="Order Total" style={{ position: 'sticky', top: 24 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Subtotal</Text>
                <Text>${subtotal.toFixed(2)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Shipping</Text>
                <Text>${shipping.toFixed(2)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Tax</Text>
                <Text>${tax.toFixed(2)}</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 18 }}>
                  Total
                </Text>
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  ${total.toFixed(2)}
                </Text>
              </div>
              <Button
                type="primary"
                size="large"
                block
                icon={<CheckOutlined />}
                loading={isCheckingOut}
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
              <Button
                size="large"
                block
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate({ to: '/' })}
              >
                Edit Cart
              </Button>
              <Card
                size="small"
                style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}
              >
                <Space>
                  <LockOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                  <div>
                    <Text strong style={{ fontSize: 12 }}>
                      Secure Checkout
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Your information is protected with SSL encryption
                    </Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
