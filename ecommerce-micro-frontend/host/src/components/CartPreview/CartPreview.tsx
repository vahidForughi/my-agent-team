import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import './CartPreview.less';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartPreviewProps {
  visible: boolean;
}

const CartPreview: React.FC<CartPreviewProps> = ({ visible }) => {
  const navigate = useNavigate();

  // TODO: Connect to actual cart store
  const cartItems: CartItem[] = [
    {
      id: '1',
      name: 'Gaming Keyboard RGB Mechanical',
      price: 89.99,
      quantity: 1,
      image:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&h=100&fit=crop',
    },
    {
      id: '2',
      name: 'Wireless Mouse Pro',
      price: 49.99,
      quantity: 2,
      image:
        'https://images.unsplash.com/photo-1527814050087-3793815479db?w=100&h=100&fit=crop',
    },
    {
      id: '3',
      name: 'USB-C Charging Cable',
      price: 19.99,
      quantity: 1,
      image:
        'https://images.unsplash.com/photo-1620570483311-5f58e615b050?w=100&h=100&fit=crop',
    },
  ];

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleRemoveItem = (id: string) => {
    // TODO: Implement remove from cart
    console.log('Remove item:', id);
  };

  if (!visible) return null;

  return (
    <div className="cart-preview">
      <div className="cart-preview-header">
        <h3>Shopping Cart ({cartItems.length} items)</h3>
      </div>

      <div className="cart-preview-body">
        {cartItems.length === 0 ? (
          <Empty
            description="Your cart is empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-preview-footer">
              <div className="cart-total">
                <span>Subtotal:</span>
                <span className="cart-total-amount">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <Button
                type="primary"
                size="large"
                block
                onClick={() => navigate('/checkout')}
                className="cart-checkout-btn"
              >
                Proceed to Checkout
              </Button>
              <Button
                size="large"
                block
                onClick={() => navigate('/cart')}
                style={{ marginTop: '8px' }}
              >
                View Full Cart
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPreview;
