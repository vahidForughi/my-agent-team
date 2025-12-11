import React, { useState } from 'react';
import {
  Typography,
  Card,
  Descriptions,
  Button,
  Tabs,
  Table,
  Tag,
  Switch,
  Space,
  message,
  Avatar,
} from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';

const { Title, Text } = Typography;

type AccountModuleProps = AppInjectorProps;

const AccountModule: React.FC<AccountModuleProps> = ({ config }) => {
  const { appContext, onNavigate, onLogout, onError } = config || {};
  const { user } = appContext || {};

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const orders = [
    {
      id: '1001',
      date: '2024-01-15',
      total: 299.97,
      status: 'delivered',
      items: 3,
    },
    {
      id: '1002',
      date: '2024-01-20',
      total: 149.99,
      status: 'shipped',
      items: 2,
    },
    {
      id: '1003',
      date: '2024-01-25',
      total: 79.99,
      status: 'processing',
      items: 1,
    },
  ];

  const handleEditProfile = () => {
    try {
      message.info('Edit profile functionality coming soon');
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const handleViewOrder = (orderId: string) => {
    try {
      if (onNavigate) {
        onNavigate(`/account/orders/${orderId}`);
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const handleLogout = () => {
    try {
      if (onLogout) {
        onLogout();
      } else if (onNavigate) {
        onNavigate('/login');
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const handleToggleNotifications = (checked: boolean) => {
    setNotificationsEnabled(checked);
    message.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleToggleEmailUpdates = (checked: boolean) => {
    setEmailUpdates(checked);
    message.success(`Email updates ${checked ? 'enabled' : 'disabled'}`);
  };

  const ProfileView = () => (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Avatar
            size={100}
            icon={<UserOutlined />}
            src={user?.avatar}
            style={{ marginBottom: 16 }}
          />
          <Title level={3} style={{ margin: 0 }}>
            {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
          </Title>
          <Text type="secondary">{user?.role || 'guest'}</Text>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Full Name">
            {user ? `${user.firstName} ${user.lastName}` : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user?.email || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {user?.phone || 'Not provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={user?.role === 'admin' ? 'red' : 'blue'}>
              {user?.role || 'guest'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Button type="primary" onClick={handleEditProfile} block>
          Edit Profile
        </Button>
      </Space>
    </Card>
  );

  const OrdersView = () => {
    const columns = [
      {
        title: 'Order ID',
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => <Text strong>#{id}</Text>,
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: 'Items',
        dataIndex: 'items',
        key: 'items',
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
        render: (total: number) => `$${total.toFixed(2)}`,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const colors: Record<string, string> = {
            delivered: 'green',
            shipped: 'blue',
            processing: 'orange',
            cancelled: 'red',
          };
          return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
        },
      },
      {
        title: 'Action',
        key: 'action',
        render: (_: unknown, record: { id: string }) => (
          <Button type="link" onClick={() => handleViewOrder(record.id)}>
            View Details
          </Button>
        ),
      },
    ];

    return (
      <Card>
        <Title level={3}>Order History</Title>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    );
  };

  const SettingsView = () => (
    <Card>
      <Title level={3}>Account Settings</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={5}>Notifications</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Text strong>Push Notifications</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Receive notifications about orders and promotions
                </Text>
              </div>
              <Switch
                checked={notificationsEnabled}
                onChange={handleToggleNotifications}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Text strong>Email Updates</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Receive email updates about your orders
                </Text>
              </div>
              <Switch
                checked={emailUpdates}
                onChange={handleToggleEmailUpdates}
              />
            </div>
          </Space>
        </div>

        <div>
          <Title level={5}>Account Actions</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block onClick={handleEditProfile}>
              Change Password
            </Button>
            <Button danger block onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </div>
      </Space>
    </Card>
  );

  const items = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      children: <ProfileView />,
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: <ShoppingOutlined />,
      children: <OrdersView />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      children: <SettingsView />,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>My Account</Title>
      {user && (
        <Text
          type="secondary"
          style={{ display: 'block', marginBottom: '24px' }}
        >
          Manage your account settings and view your order history
        </Text>
      )}
      <Tabs items={items} />
    </div>
  );
};

export default AccountModule;
