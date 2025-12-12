import React, { useMemo } from 'react';
import { Typography, Tabs, Spin, Result, Button, Flex } from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  SettingOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import {
  AccountAuthProvider,
  useAccountAuth,
  HostAuthProps,
  DebugOptions,
} from '../auth';
import { ProfileView, OrdersView, SettingsView } from '../components/account';

const { Title, Text } = Typography;

type AccountModuleProps = AppInjectorProps;

interface AccountModuleContentProps {
  onNavigate?: (path: string) => void;
  onError?: (error: Error) => void;
}

/**
 * AccountModuleContent
 *
 * Main content component that displays account tabs.
 */
const AccountModuleContent: React.FC<AccountModuleContentProps> = ({
  onNavigate,
  onError,
}) => {
  const { user, isAuthenticated, isLoading, logout } = useAccountAuth();

  // Loading state
  if (isLoading) {
    return (
      <Flex vertical align="center" justify="center" style={{ padding: 48 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <Text style={{ marginTop: 16 }}>Loading account...</Text>
      </Flex>
    );
  }

  // Not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <Flex style={{ padding: 24 }}>
        <Result
          status="403"
          title="Not Authenticated"
          subTitle="Please sign in to access your account."
          extra={
            <Button type="primary" onClick={() => onNavigate?.('/login')}>
              Go to Login
            </Button>
          }
        />
      </Flex>
    );
  }

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      children: (
        <ProfileView user={user} onNavigate={onNavigate} onError={onError} />
      ),
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: <ShoppingOutlined />,
      children: <OrdersView onNavigate={onNavigate} onError={onError} />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      children: (
        <SettingsView
          onLogout={logout}
          onNavigate={onNavigate}
          onError={onError}
        />
      ),
    },
  ];

  return (
    <Flex vertical gap={16} style={{ padding: 24 }}>
      <header>
        <Title level={2} style={{ marginBottom: 8 }}>
          My Account
        </Title>
        <Text type="secondary">
          Manage your account settings and view your order history
        </Text>
      </header>
      <Tabs items={tabItems} />
    </Flex>
  );
};

/**
 * Get debug options for development mode
 */
function getDebugOptions(): DebugOptions {
  // Only enable debug mode in development
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return {};
  }

  return {
    logging: true,
    // Uncomment and set a preset token for local development without host
    // presetToken: 'dev-token-123',
    // presetUser: {
    //   id: 'dev-user-1',
    //   email: 'dev@example.com',
    //   displayName: 'Dev User',
    //   firstName: 'Dev',
    //   lastName: 'User',
    // },
  };
}

/**
 * AccountModule
 *
 * Main entry point for the account micro-frontend.
 * Wraps content with AccountAuthProvider for unified auth handling.
 */
const AccountModule: React.FC<AccountModuleProps> = ({ config }) => {
  const { appContext, onNavigate, onLogout, onError } = config || {};

  const hostAuth = useMemo<HostAuthProps | undefined>(() => {
    if (!appContext) {
      return undefined;
    }

    return {
      user: appContext.user,
      token: appContext.token,
      tokenExpiry: (appContext as Record<string, unknown>).tokenExpiry as
        | number
        | undefined,
      isAuthenticated: (appContext as Record<string, unknown>)
        .isAuthenticated as boolean | undefined,
      requestTokenRefresh: (appContext as Record<string, unknown>)
        .requestTokenRefresh as (() => Promise<string | null>) | undefined,
      onLogout,
    };
  }, [appContext, onLogout]);

  const debug = useMemo(() => getDebugOptions(), []);

  return (
    <AccountAuthProvider hostAuth={hostAuth} debug={debug}>
      <AccountModuleContent onNavigate={onNavigate} onError={onError} />
    </AccountAuthProvider>
  );
};

export default AccountModule;
