import React, { useState, useCallback, useMemo } from 'react';

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
  message,
  Spin,
  Flex,
} from 'antd';
import {
  ShoppingCartOutlined,
  LockOutlined,
  CreditCardOutlined,
  BankOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  TagOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';

import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useAuth } from '@ecommerce-platform/auth-provider';
import {
  useGetBasket,
  useCheckout,
  useUpdateBasketItem,
  useRemoveBasketItem,
} from '../services/basket/hooks';
import BasketItemRow from '../components/BasketItemRow';
import {
  getUserEmail,
  handleNavigateToStore,
} from '../helpers/checkoutHelpers';
import type { BasketItem } from '../services/basket/schemas';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type CheckoutProps = {
  config?: AppInjectorProps['config'];
};

export default function Checkout(props: CheckoutProps) {
  const { config } = props;

  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: basketResponse, isLoading } = useGetBasket();
  const { mutate: checkout, isPending: isCheckingOut } = useCheckout();
  const { mutate: updateItem } = useUpdateBasketItem();
  const { mutate: removeItem } = useRemoveBasketItem();

  const [paymentMethod, setPaymentMethod] = useState<number>(0);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Vietnam',
    notes: '',
  });

  const basket = basketResponse?.data ?? null;

  const handleUpdateQuantity = useCallback(
    (item: BasketItem, newQuantity: number) => {
      if (newQuantity < 1) return;
      updateItem({
        productId: item.productId,
        quantity: newQuantity,
      });
    },
    [updateItem]
  );

  const handleRemoveItem = useCallback(
    (productId: string) => {
      removeItem({ productId });
    },
    [removeItem]
  );

  const subtotal = useMemo(
    () =>
      basket?.items?.reduce(
        (sum: number, item: BasketItem) => sum + item.price * item.quantity,
        0
      ) ?? 0,
    [basket?.items]
  );

  const originalTotal = useMemo(
    () =>
      basket?.items?.reduce(
        (sum: number, item: BasketItem) => sum + item.originalPrice * item.quantity,
        0
      ) ?? 0,
    [basket?.items]
  );

  const totalSavings = useMemo(
    () =>
      basket?.items?.reduce(
        (sum: number, item: BasketItem) => sum + item.discountAmount * item.quantity,
        0
      ) ?? 0,
    [basket?.items]
  );

  const shipping = 0;
  const tax = 0;
  const total = useMemo(() => subtotal + shipping + tax, [subtotal]);

  function handlePlaceOrder() {
    if (!basket || !basket.items || basket.items.length === 0) {
      message.warning('Your cart is empty');
      return;
    }

    checkout(
      {
        totalPrice: basket.totalPrice,
        emailAddress: getUserEmail(user),
        addressLine: shippingInfo.address || 'N/A',
        country: shippingInfo.country || 'Vietnam',
        state: shippingInfo.city || 'N/A',
        zipCode: shippingInfo.zipCode || '00000',
        cardName: 'N/A',
        cardNumber: '0000000000000000',
        expiration: '12/99',
        cvv: '000',
        paymentMethod: paymentMethod,
      },
      {
        onSuccess: () => {
          message.success('Order placed successfully!');
          navigate({ to: '/' });
        },
        onError: () => {
          message.error('Failed to place order. Please try again.');
        },
      }
    );
  }

  function handleBackToShopping() {
    handleNavigateToStore(config);
  }

  if (isLoading) {
    return (
      <Space
        direction="vertical"
        align="center"
        style={{ width: '100%', padding: '100px 0' }}
      >
        <Spin size="large" />
      </Space>
    );
  }

  if (!basket || !basket.items || basket.items.length === 0) {
    return (
      <Space
        direction="vertical"
        align="center"
        size="large"
        style={{ width: '100%', padding: '100px 20px' }}
      >
        <ShoppingCartOutlined style={{ fontSize: 64 }} />
        <Title level={3}>Your cart is empty</Title>
        <Paragraph>Add some products to continue with checkout.</Paragraph>
        <Button type="primary" onClick={handleBackToShopping}>
          Back to Shopping
        </Button>
      </Space>
    );
  }

  return (
    <Space
      direction="vertical"
      size="large"
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '24px 16px',
        width: '100%',
      }}
    >
      {/* Header */}
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToShopping}
          style={{ padding: 0 }}
        >
          Back to Shopping
        </Button>
        <Title level={2}>Checkout</Title>
        <Text type="secondary">Complete your purchase securely</Text>
      </Space>

      <Row gutter={[24, 24]}>
        {/* Left Column - Order Items & Forms */}
        <Col xs={24} lg={16}>
          {/* Order Summary Section */}
          <Card title="Order Summary" style={{ marginBottom: 24 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {basket.items.map((item: BasketItem) => (
                <BasketItemRow
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
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
                    <Space direction="vertical" size={0}>
                      <Text strong>Cash on Delivery</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Pay when you receive your order
                      </Text>
                    </Space>
                  </Space>
                </Radio>
                <Radio value={1}>
                  <Space>
                    <CreditCardOutlined style={{ fontSize: 20 }} />
                    <Space direction="vertical" size={0}>
                      <Text strong>Credit/Debit Card</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Pay securely with your card
                      </Text>
                    </Space>
                  </Space>
                </Radio>
                <Radio value={2}>
                  <Space>
                    <BankOutlined style={{ fontSize: 20 }} />
                    <Space direction="vertical" size={0}>
                      <Text strong>Bank Transfer</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Pay via direct bank transfer
                      </Text>
                    </Space>
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
              {totalSavings > 0 && (
                <Flex justify="space-between" style={{ width: '100%' }}>
                  <Text>Original Subtotal</Text>
                  <Text>${originalTotal.toFixed(2)}</Text>
                </Flex>
              )}
              {totalSavings > 0 && (
                <Flex justify="space-between" style={{ width: '100%' }}>
                  <Text type="success" style={{ fontWeight: 600 }}>
                    <TagOutlined /> Total Savings
                  </Text>
                  <Text type="success" style={{ fontWeight: 600 }}>
                    -${totalSavings.toFixed(2)}
                  </Text>
                </Flex>
              )}
              <Flex justify="space-between" style={{ width: '100%' }}>
                <Text>Subtotal</Text>
                <Text>${subtotal.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between" style={{ width: '100%' }}>
                <Text>Shipping</Text>
                <Text>${shipping.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between" style={{ width: '100%' }}>
                <Text>Tax</Text>
                <Text>${tax.toFixed(2)}</Text>
              </Flex>
              <Divider style={{ margin: '8px 0' }} />
              <Flex justify="space-between" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 18 }}>
                  Total
                </Text>
                <Text strong type="success" style={{ fontSize: 18 }}>
                  ${total.toFixed(2)}
                </Text>
              </Flex>
              {totalSavings > 0 && (
                <Card
                  size="small"
                  style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    color: 'white',
                  }}
                >
                  <Flex align="center" justify="center" gap="small">
                    <StarOutlined style={{ fontSize: 16 }} />
                    <Text strong style={{ color: 'white', fontSize: 14 }}>
                      You're saving ${totalSavings.toFixed(2)}!
                    </Text>
                  </Flex>
                </Card>
              )}
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
              <Card
                size="small"
                style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}
              >
                <Space>
                  <LockOutlined style={{ fontSize: 20 }} />
                  <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: 12 }}>
                      Secure Checkout
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Your information is protected with SSL encryption
                    </Text>
                  </Space>
                </Space>
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
