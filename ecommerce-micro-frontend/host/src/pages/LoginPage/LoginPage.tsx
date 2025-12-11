import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Flex } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { setAuthToken } from '../../helpers/auth';
import { useAppConfig } from '../../context/AppConfigContext';
import { User } from '@ecommerce-platform/app-injector';
import { brandGradient } from '../../config/theme';

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
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: brandGradient.start,
        margin: 0,
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 32,
          boxShadow: '0 25px 80px rgba(15, 23, 42, 0.35), 0 10px 30px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          padding: '56px 48px',
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(20px)',
        }}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
          <Title
            level={2}
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: brandGradient.start,
              marginBottom: 12,
              position: 'relative',
              letterSpacing: '-0.5px',
            }}
          >
            Welcome Back
          </Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 400 }}>
            Please sign in to your account
          </Text>
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
              style={{
                padding: '16px 20px',
                borderRadius: 16,
                border: '2px solid #e2e8f0',
                background: 'rgba(248, 250, 252, 0.8)',
                fontSize: 15,
              }}
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
              style={{
                padding: '16px 20px',
                borderRadius: 16,
                border: '2px solid #e2e8f0',
                background: 'rgba(248, 250, 252, 0.8)',
                fontSize: 15,
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 56,
                borderRadius: 16,
                background: brandGradient.start,
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
              }}
            >
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Demo credentials: any email / any password (min 6 chars)
            </Text>
          </div>
        </Form>
      </Card>
    </Flex>
  );
};

export default LoginPage;
