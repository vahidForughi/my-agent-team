import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { navbarActionButtonStyle } from './NavbarActionButton';

/**
 * User menu button component for the navbar
 * Displays user icon with dropdown menu for authenticated/unauthenticated users
 */
export const UserMenuButton: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout: authLogout, user } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await authLogout();
  };

  const userMenuItems: MenuProps['items'] = isAuthenticated
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

  const displayName = isAuthenticated
    ? user?.displayName || 'Account'
    : 'Login';

  return (
    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
      <Button type="text" style={navbarActionButtonStyle} aria-label="User menu">
        <UserOutlined />
        <span style={{ fontSize: 11, fontWeight: 500 }}>{displayName}</span>
      </Button>
    </Dropdown>
  );
};

export default UserMenuButton;

