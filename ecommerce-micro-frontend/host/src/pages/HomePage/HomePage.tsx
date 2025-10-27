import React from 'react';
import { Card, Row, Col, Button, Typography } from 'antd';
import { ShopOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './HomePage.less';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShopOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: 'Browse Products',
      description: 'Explore our wide range of products across multiple categories',
      action: () => navigate('/store'),
      buttonText: 'Go to Store',
    },
    {
      icon: <ShoppingCartOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: 'Easy Checkout',
      description: 'Simple and secure checkout process with multiple payment options',
      action: () => navigate('/checkout'),
      buttonText: 'View Cart',
    },
    {
      icon: <UserOutlined style={{ fontSize: 48, color: '#faad14' }} />,
      title: 'Manage Account',
      description: 'Track orders, manage addresses, and update your profile',
      action: () => navigate('/account'),
      buttonText: 'My Account',
    },
  ];

  return (
    <div className="home-page">
      <div className="hero-section">
        <Title level={1}>Welcome to E-Commerce Platform</Title>
        <Paragraph className="hero-description">
          A modern micro-frontend e-commerce application built with Nx, Module Federation, React, and TypeScript
        </Paragraph>
        <Button type="primary" size="large" onClick={() => navigate('/store')}>
          Start Shopping
        </Button>
      </div>

      <Row gutter={[24, 24]} className="features-section">
        {features.map((feature, index) => (
          <Col xs={24} md={8} key={index}>
            <Card className="feature-card" hoverable>
              <div className="feature-icon">{feature.icon}</div>
              <Title level={3}>{feature.title}</Title>
              <Paragraph>{feature.description}</Paragraph>
              <Button type="default" onClick={feature.action}>
                {feature.buttonText}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="tech-stack-section">
        <Title level={2}>Built with Modern Technologies</Title>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={6}>
            <Card>Nx Monorepo</Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card>Module Federation</Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card>React 18</Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card>TypeScript</Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card>TanStack Query</Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card>TanStack Router</Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card>Ant Design</Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card>Zustand</Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HomePage;

