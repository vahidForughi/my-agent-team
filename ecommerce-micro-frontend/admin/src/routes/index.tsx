import React, { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Typography,
  Button,
  Tag,
  Divider,
  Badge,
  theme,
} from 'antd';
import {
  ShoppingOutlined,
  UserOutlined,
  ArrowRightOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  PlusOutlined,
  RiseOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useRouteContext } from '@tanstack/react-router';
import { useGetAllProducts } from '../services/products';
import { useGetAllOrders } from '../services/orders';
import type { Order } from '../services/orders';
import { AuthService } from '../auth';

const { Title, Paragraph, Text } = Typography;

export const Route = createFileRoute('/')({
  component: Dashboard,
});

/**
 * Dashboard Component
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for displaying admin dashboard statistics
 * - OCP: Open for extension via additional stat cards
 */
function Dashboard() {
  // Other hooks
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const routeContext = useRouteContext({ from: '__root__' });
  const { data: productsData, isLoading: isLoadingProducts } = useGetAllProducts({
    pageIndex: 1,
    pageSize: 1,
  });
  // Get current user's username - backend requires userName parameter
  // Note: Backend doesn't support "all orders" - it filters by specific userName
  // For admin dashboard showing all orders, backend would need to be modified
  // Try router context auth first (from host app), then fall back to local auth
  const routerUser = routeContext?.auth?.user as { username?: string } | undefined;
  const localUser = AuthService.getCurrentUser();
  const currentUserName = routerUser?.username || localUser?.username;
  const { data: orders = [], isLoading: isLoadingOrders } = useGetAllOrders(
    currentUserName || '',
    { enabled: !!currentUserName }
  );

  // Derived state
  const totalProducts = productsData?.count || 0;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order: Order) => sum + (order.totalPrice || 0), 0);
  const uniqueUsers = new Set(
    orders.map((order: Order) => order.userName).filter(Boolean)
  ).size;

  // Calculate growth metrics (mock for now - in real app, compare with previous period)
  const revenueGrowth = totalRevenue > 0 ? 12.5 : 0;
  const ordersGrowth = totalOrders > 0 ? 8.3 : 0;

  // Event handlers
  function handleNavigateToProducts() {
    navigate({ to: '/products' });
  }

  function handleNavigateToOrders() {
    navigate({ to: '/orders' });
  }

  function handleCreateProduct() {
    navigate({ to: '/products/new' });
  }

  // Memoized values
  const statistics = useMemo(
    () => [
      {
        title: 'Total Products',
        value: totalProducts,
        prefix: <ShoppingOutlined style={{ fontSize: 28, color: token.colorInfo }} />,
        valueStyle: { color: token.colorInfo, fontSize: 32, fontWeight: 700 },
        loading: isLoadingProducts,
        backgroundColor: token.colorInfoBg,
        borderColor: token.colorInfo,
      },
      {
        title: 'Total Orders',
        value: totalOrders,
        prefix: <ShoppingCartOutlined style={{ fontSize: 28, color: token.colorSuccess }} />,
        valueStyle: { color: token.colorSuccess, fontSize: 32, fontWeight: 700 },
        loading: isLoadingOrders,
        backgroundColor: token.colorSuccessBg,
        borderColor: token.colorSuccess,
        trend: ordersGrowth > 0 ? { value: ordersGrowth, positive: true } : null,
      },
      {
        title: 'Total Revenue',
        value: totalRevenue,
        prefix: <DollarOutlined style={{ fontSize: 28, color: token.colorPrimary }} />,
        precision: 2,
        valueStyle: { color: token.colorPrimary, fontSize: 32, fontWeight: 700 },
        loading: isLoadingOrders,
        backgroundColor: token.colorPrimaryBg,
        borderColor: token.colorPrimary,
        trend: revenueGrowth > 0 ? { value: revenueGrowth, positive: true } : null,
      },
      {
        title: 'Active Users',
        value: uniqueUsers,
        prefix: <UserOutlined style={{ fontSize: 28, color: token.colorWarning }} />,
        valueStyle: { color: token.colorWarning, fontSize: 32, fontWeight: 700 },
        loading: isLoadingOrders,
        backgroundColor: token.colorWarningBg,
        borderColor: token.colorWarning,
      },
    ],
    [totalProducts, totalOrders, totalRevenue, uniqueUsers, isLoadingProducts, isLoadingOrders, ordersGrowth, revenueGrowth, token]
  );

  const recentActivities = useMemo(
    () => [
      {
        id: 1,
        type: 'product',
        title: 'Product Created',
        description: 'Wireless Headphones',
        time: '12:30 PM',
        icon: <FileTextOutlined style={{ color: token.colorInfo }} />,
        color: 'blue',
      },
      {
        id: 2,
        type: 'order',
        title: 'New Order',
        description: 'Order #12345 received',
        time: '11:15 AM',
        icon: <ShoppingCartOutlined style={{ color: token.colorSuccess }} />,
        color: 'green',
      },
      {
        id: 3,
        type: 'product',
        title: 'Product Updated',
        description: 'Smart Watch details updated',
        time: '10:00 AM',
        icon: <FileTextOutlined style={{ color: token.colorPrimary }} />,
        color: 'purple',
      },
    ],
    [token]
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header Section */}
      <Space direction="vertical" size={2} style={{ width: '100%' }}>
        <Title level={3} style={{ marginBottom: 0, fontWeight: 600 }}>
          Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Monitor your e-commerce platform performance and manage your business efficiently
        </Text>
      </Space>

      {/* Statistics Cards */}
      <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              loading={stat.loading}
              hoverable
              bodyStyle={{ padding: token.sizeUnit * 3 }}
              style={{
                borderRadius: token.borderRadiusLG,
                background: stat.backgroundColor,
                border: `1px solid ${stat.borderColor}40`,
                height: '100%',
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      {stat.title}
                    </Text>
                    <Statistic
                      value={stat.value}
                      precision={stat.precision}
                      valueStyle={{ ...stat.valueStyle, fontSize: token.fontSizeHeading3 }}
                      prefix={stat.prefix}
                    />
                  </Space>
                  {stat.trend && (
                    <Badge
                      count={
                        <Space size={4}>
                          <RiseOutlined style={{ fontSize: 12 }} />
                          <Text strong style={{ fontSize: 12 }}>
                            {stat.trend.value}%
                          </Text>
                        </Space>
                      }
                      style={{
                        backgroundColor: stat.trend.positive ? token.colorSuccess : token.colorError,
                      }}
                    />
                  )}
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Area */}
      <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
        {/* Quick Actions */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Text strong style={{ fontSize: token.fontSizeLG }}>
                Quick Actions
              </Text>
            }
            bodyStyle={{ padding: token.sizeUnit * 4 }}
          >
            <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
              <Col xs={24} sm={12}>
                <Button
                  type="primary"
                  block
                  icon={<PlusOutlined />}
                  onClick={handleCreateProduct}
                >
                  Create New Product
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button
                  block
                  icon={<ShoppingOutlined />}
                  onClick={handleNavigateToProducts}
                >
                  Manage Products
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button
                  block
                  icon={<ShoppingCartOutlined />}
                  onClick={handleNavigateToOrders}
                >
                  View Orders
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button
                  block
                  icon={<FileTextOutlined />}
                  onClick={handleNavigateToProducts}
                >
                  View Reports
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Text strong style={{ fontSize: token.fontSizeLG }}>
                Recent Activity
              </Text>
            }
            bodyStyle={{ padding: token.sizeUnit * 4 }}
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                size="small"
              >
                View All
              </Button>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {recentActivities.map((activity, index) => (
                <Space key={activity.id} direction="vertical" size={0} style={{ width: '100%' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Space size={token.sizeUnit * 2}>
                      <Space
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: token.borderRadius,
                          background: token.colorFillTertiary,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {activity.icon}
                      </Space>
                      <Space direction="vertical" size={2}>
                        <Text strong style={{ fontSize: token.fontSizeSM }}>
                          {activity.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                          {activity.description}
                        </Text>
                      </Space>
                    </Space>
                    <Tag color={activity.color} style={{ margin: 0 }}>
                      {activity.time}
                    </Tag>
                  </Space>
                  {index < recentActivities.length - 1 && (
                    <Divider style={{ margin: `${token.sizeUnit * 3}px 0 0 0` }} />
                  )}
                </Space>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default React.memo(Dashboard);
