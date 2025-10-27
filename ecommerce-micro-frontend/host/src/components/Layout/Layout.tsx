import React from 'react';
import {
  Layout as AntLayout,
  Menu,
  Button,
  Badge,
  Avatar,
  Dropdown,
} from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  HomeOutlined,
  ShopOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { APP_NAME } from '../../constants/appConfigs';
import { isAuthenticated, logout } from '../../helpers/auth';
import './Layout.less';

const { Header, Content, Footer } = AntLayout;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isAuthenticated();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/'),
      'data-testid': 'nav-home',
    },
    {
      key: '/store',
      icon: <ShopOutlined />,
      label: 'Store',
      onClick: () => navigate('/store'),
      'data-testid': 'nav-store',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/account/profile'),
      'data-testid': 'nav-profile',
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: 'Orders',
      onClick: () => navigate('/account/orders'),
      'data-testid': 'nav-orders',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/account/settings'),
      'data-testid': 'nav-settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
      danger: true,
      'data-testid': 'nav-logout',
    },
  ];

  return (
    <AntLayout className="app-layout">
      <Header className="app-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            {APP_NAME}
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="main-menu"
          />
          <div className="header-actions">
            <Badge count={0} showZero={false}>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                size="large"
                onClick={() => navigate('/checkout')}
                data-testid="nav-checkout"
              />
            </Badge>
            {authenticated ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar
                  icon={<UserOutlined />}
                  className="user-avatar"
                  data-testid="user-avatar"
                />
              </Dropdown>
            ) : (
              <Button
                type="primary"
                onClick={() => navigate('/login')}
                data-testid="login-button"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </Header>
      <Content className="app-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </Content>
      <Footer className="app-footer">
        {APP_NAME} ©{new Date().getFullYear()} - Built with Nx & Module
        Federation
      </Footer>
    </AntLayout>
  );
};

export default AppLayout;
