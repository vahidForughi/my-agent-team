import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Space } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  HeartOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Badge, Dropdown, Avatar, Button } from 'antd';
import type { MenuProps } from 'antd';
import { isAuthenticated, logout } from '../../helpers/auth';
import CartPreview, { CartItem } from '../CartPreview/CartPreview';
import { brandGradient } from '../../config/theme';

interface NavbarActionsProps {
  basketCount?: number;
  cartItems?: CartItem[];
  isLoading?: boolean;
  onRemoveCartItem?: (id: string) => void;
}

function NavbarActions({
  basketCount = 0,
  cartItems = [],
  isLoading = false,
  onRemoveCartItem,
}: NavbarActionsProps) {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const [showCartPreview, setShowCartPreview] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowCartPreview(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setShowCartPreview(false);
    }, 300);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = authenticated
    ? [
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'My Account',
          onClick: () => navigate('/account/profile'),
        },
        {
          key: 'orders',
          icon: <ShoppingCartOutlined />,
          label: 'My Orders',
          onClick: () => navigate('/account/orders'),
        },
        {
          key: 'wishlist',
          icon: <HeartOutlined />,
          label: 'Wishlist',
          onClick: () => navigate('/account/wishlist'),
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          label: 'Logout',
          danger: true,
          onClick: handleLogout,
        },
      ]
    : [
        {
          key: 'login',
          label: 'Login',
          onClick: handleLogin,
        },
        {
          key: 'register',
          label: 'Register',
          onClick: () => navigate('/register'),
        },
      ];

  return (
    <Space size="large">
      {authenticated && (
        <Badge count={5} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            onClick={() => navigate('/notifications')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '12px 16px',
              borderRadius: 12,
              color: '#64748b',
            }}
            aria-label="Notifications"
          >
            <span style={{ fontSize: 11, fontWeight: 500 }}>Notifications</span>
          </Button>
        </Badge>
      )}

      <Button
        type="text"
        icon={<HeartOutlined />}
        onClick={() => navigate('/wishlist')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '12px 16px',
          borderRadius: 12,
          color: '#64748b',
        }}
        aria-label="Wishlist"
      >
        <span style={{ fontSize: 11, fontWeight: 500 }}>Wishlist</span>
      </Button>

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: 'relative' }}
      >
        <Badge
          count={basketCount}
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
            onClick={() => navigate('/checkout')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '12px 16px',
              borderRadius: 12,
              color: '#64748b',
            }}
            aria-label={`Shopping cart with ${basketCount} items`}
          >
            <span style={{ fontSize: 11, fontWeight: 500 }}>Cart</span>
          </Button>
        </Badge>
        <CartPreview
          visible={showCartPreview}
          items={cartItems}
          isLoading={isLoading}
          onRemoveItem={onRemoveCartItem}
        />
      </div>

      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <Button
          type="text"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '12px 16px',
            borderRadius: 12,
            color: '#64748b',
          }}
          aria-label="User menu"
        >
          {authenticated ? (
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{
              background: brandGradient.start,
              boxShadow: '0 2px 6px rgba(102, 126, 234, 0.2)',
              }}
            />
          ) : (
            <UserOutlined />
          )}
          <span style={{ fontSize: 11, fontWeight: 500 }}>
            {authenticated ? 'Account' : 'Login'}
          </span>
        </Button>
      </Dropdown>
    </Space>
  );
}

export default NavbarActions;
