import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import CartPreview, { CartItem } from '../../CartPreview/CartPreview';
import { navbarActionButtonStyle } from './NavbarActionButton';
import { brandGradient } from '../../../config/theme';

interface CartButtonProps {
  /** Number of items in cart */
  count?: number;
  /** Cart items for preview */
  items?: CartItem[];
  /** Loading state for cart preview */
  isLoading?: boolean;
  /** Callback when removing item from cart */
  onRemoveItem?: (id: string) => void;
}

/**
 * Cart button component for the navbar
 * Displays shopping cart icon with item count and hover preview
 */
export const CartButton: React.FC<CartButtonProps> = ({
  count = 0,
  items = [],
  isLoading = false,
  onRemoveItem,
}) => {
  const navigate = useNavigate();
  const [showCartPreview, setShowCartPreview] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowCartPreview(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setShowCartPreview(false);
    }, 300);
  };

  const handleClick = () => {
    navigate('/checkout');
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      <Badge
        count={count}
        showZero={false}
        style={{
          ['& .ant-badge-count' as string]: {
            background: brandGradient.start,
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
          },
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        <Button
          type="text"
          icon={<ShoppingCartOutlined />}
          onClick={handleClick}
          style={navbarActionButtonStyle}
          aria-label={`Shopping cart with ${count} items`}
        >
          <span style={{ fontSize: 11, fontWeight: 500 }}>Cart</span>
        </Button>
      </Badge>
      <CartPreview
        visible={showCartPreview}
        items={items}
        isLoading={isLoading}
        onRemoveItem={onRemoveItem}
      />
    </div>
  );
};

export default CartButton;

