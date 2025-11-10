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
  Spin,
  Alert,
  Card,
  Row,
  Col,
} from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  TagsFilled,
} from '@ant-design/icons';
import { AppInjectorProps } from '@ecommerce/app-injector';
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from '../services/cart/hooks';
import { CartItem, Cart as CartType } from '../services/cart/types';
import { Coupon } from '../services/coupon/types';
import { ApiResponse } from '../services/types';
import CouponInput from '../components/CouponInput';
import AppliedCouponsList from '../components/AppliedCouponsList';
import AvailableCouponsModal from '../components/AvailableCouponsModal';
import { calculateDiscountAmount } from '../helpers/couponUtils';
import { formatCurrency } from '../helpers/formatUtils';

const { Title, Text } = Typography;

interface CartProps {
  config?: AppInjectorProps['config'];
}

/**
 * Shopping Cart Page
 * Simplified for basic coupon structure
 */
function Cart(props: CartProps) {
  // Props destructuring
  const { config } = props;
  const { appContext, onNavigate, onError } = config || {};
  const { user } = appContext || {};

  // State
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [appliedCoupons, setAppliedCoupons] = useState<Coupon[]>([]);

  // React Query hooks
  const { data: cart, isLoading, isError, error } = useGetCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  // Defined functions
  async function handleRemoveItem(itemId: string) {
    try {
      await removeCartItem.mutateAsync({ itemId });
      message.success('Item removed from cart');
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        message.error('Failed to remove item');
      }
    }
  }

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    try {
      if (quantity < 1) {
        handleRemoveItem(itemId);
        return;
      }

      await updateCartItem.mutateAsync({ itemId, quantity });
      message.success('Quantity updated');
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        message.error('Failed to update quantity');
      }
    }
  }

  function handleProceedToCheckout() {
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
  }

  function handleContinueShopping() {
    if (onNavigate) {
      onNavigate('/store');
    }
  }

  function handleRemoveCoupon(code: string) {
    setAppliedCoupons((prev) => prev.filter((c) => c.code !== code));
    message.success('Coupon removed');
  }

  function handleApplyCoupon(code: string) {
    // In real implementation, this would call the backend to validate and get coupon
    // For now, we'll create a mock coupon - in production this should come from API
    const mockCoupon: Coupon = {
      id: `mock-${Date.now()}`,
      code: code.toUpperCase(),
      description: `Discount coupon: ${code}`,
      discountType: 'percentage',
      discountValue: 10,
      usedCount: 0,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAppliedCoupons((prev) => [...prev, mockCoupon]);
    message.success(`Coupon ${code} applied!`);
  }

  function handleOpenCouponsModal() {
    setShowCouponsModal(true);
  }

  function handleCloseCouponsModal() {
    setShowCouponsModal(false);
  }

  // useEffect hooks
  // (none needed in simplified version)

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Alert
          message="Error"
          description={error?.message || 'Failed to load cart'}
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Access cart data
  const cartData = (cart as ApiResponse<CartType> | null)?.data;
  const cartItems: CartItem[] = cartData?.items || [];
  const subtotal = cartData?.subtotal || 0;
  
  // Calculate coupon discount based on discount type
  const couponDiscount = appliedCoupons.reduce((sum, coupon) => {
    return sum + calculateDiscountAmount(coupon, subtotal);
  }, 0);
  
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal - couponDiscount + tax + shipping;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <ShoppingCartOutlined style={{ marginRight: '12px' }} />
        Shopping Cart
      </Title>

      {user && (
        <Text
          type="secondary"
          style={{ display: 'block', marginBottom: '24px' }}
        >
          Hi {user.firstName || 'Guest'}, review your cart items before checkout
        </Text>
      )}

      {cartItems.length === 0 ? (
        <Empty description="Your cart is empty" style={{ margin: '60px 0' }}>
          <Button type="primary" onClick={handleContinueShopping}>
            Continue Shopping
          </Button>
        </Empty>
      ) : (
        <Row gutter={24}>
          {/* Cart Items Column */}
          <Col xs={24} lg={16}>
            <List
              itemLayout="horizontal"
              dataSource={cartItems}
              renderItem={(item: CartItem) => (
                <List.Item
                  actions={[
                    <InputNumber
                      key="quantity"
                      min={0}
                      value={item.quantity}
                      onChange={(value) =>
                        handleUpdateQuantity(item.id, value || 0)
                      }
                    />,
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(item.id)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={item.productName}
                    description={`${formatCurrency(item.price)} each`}
                  />
                  <div style={{ fontWeight: 'bold' }}>
                    {formatCurrency(item.itemTotal || item.price * item.quantity)}
                  </div>
                </List.Item>
              )}
            />
          </Col>

          {/* Summary Column */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Coupon Input */}
              <Card
                title={
                  <Space>
                    <TagsFilled />
                    <span>Apply Coupon</span>
                  </Space>
                }
              >
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  size="middle"
                >
                  <CouponInput onApplyCoupon={handleApplyCoupon} />
                  <Button block onClick={handleOpenCouponsModal}>
                    View Available Coupons
                  </Button>
                </Space>
              </Card>

              {/* Applied Coupons */}
              {appliedCoupons.length > 0 && (
                <AppliedCouponsList
                  coupons={appliedCoupons}
                  onRemove={handleRemoveCoupon}
                  subtotal={subtotal}
                />
              )}

              {/* Order Summary */}
              <Card title="Order Summary">
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  size="small"
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Text>Subtotal:</Text>
                    <Text>{formatCurrency(subtotal)}</Text>
                  </div>

                  {couponDiscount > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text>Coupon Discount:</Text>
                      <Text style={{ color: '#52c41a' }}>
                        -{formatCurrency(couponDiscount)}
                      </Text>
                    </div>
                  )}

                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Text>Tax:</Text>
                    <Text>{formatCurrency(tax)}</Text>
                  </div>

                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Text>Shipping:</Text>
                    <Text>{formatCurrency(shipping)}</Text>
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Title level={4} style={{ margin: 0 }}>
                      Total:
                    </Title>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                      {formatCurrency(total)}
                    </Title>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleProceedToCheckout}
                    style={{ marginTop: 16 }}
                  >
                    Proceed to Checkout
                  </Button>

                  <Button size="large" block onClick={handleContinueShopping}>
                    Continue Shopping
                  </Button>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      )}

      {/* Coupons Modal */}
      <AvailableCouponsModal
        visible={showCouponsModal}
        onClose={handleCloseCouponsModal}
        onApplyCoupon={handleApplyCoupon}
      />
    </div>
  );
}

export default Cart;
