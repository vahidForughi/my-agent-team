import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { setAuthToken } from '../../helpers/auth';
import { useAppConfig } from '../../context/AppConfigContext';
import { User } from '@ecommerce/app-injector';
import './LoginPage.less';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Login Page Component
 *
 * Handles user authentication and updates the app context with user information.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAppConfig();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data - in real app, this would come from API
      const mockUser: User = {
        id: '1',
        email: values.email,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1 234 567 8900',
        avatar: undefined,
        role: 'user',
      };

      // Mock token
      const mockToken = 'mock-jwt-token-' + Date.now();

      // Store auth token
      setAuthToken(mockToken);

      // Update app context with user
      updateUser(mockUser);

      message.success('Login successful!');
      navigate('/');
    } catch (error) {
      message.error('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <Title level={2}>Welcome Back</Title>
          <Text type="secondary">Please sign in to your account</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Demo credentials: any email / any password (min 6 chars)
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
