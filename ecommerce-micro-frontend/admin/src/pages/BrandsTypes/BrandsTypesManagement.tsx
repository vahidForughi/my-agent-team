import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Space,
  Row,
  Col,
  Tabs,
  Tag,
  theme,
} from 'antd';
import {
  PlusOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  useGetAllBrands,
  useCreateBrand,
  useGetAllTypes,
  useCreateType,
} from '../../services';
import { DataTable, EmptyState, SkeletonLoader } from '../../components/shared';

const { Title, Text } = Typography;

/**
 * BrandsTypesManagement Component
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for brands and types management
 */
function BrandsTypesManagement() {
  // State hooks
  const [brandForm] = Form.useForm();
  const [typeForm] = Form.useForm();

  // Other hooks
  const { token } = theme.useToken();
  const { data: brands = [], refetch: refetchBrands } = useGetAllBrands();
  const { mutate: createBrand, isPending: isCreatingBrand } = useCreateBrand();
  const { data: types = [], refetch: refetchTypes } = useGetAllTypes();
  const { mutate: createType, isPending: isCreatingType } = useCreateType();

  // Event handlers
  function handleCreateBrand(values: { name: string }) {
    createBrand(values, {
      onSuccess: () => {
        brandForm.resetFields();
        refetchBrands();
      },
    });
  }

  function handleCreateType(values: { name: string }) {
    createType(values, {
      onSuccess: () => {
        typeForm.resetFields();
        refetchTypes();
      },
    });
  }

  // Memoized values
  const brandColumns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        render: (id: string) => (
          <Text type="secondary" style={{ fontFamily: 'monospace' }}>
            {id.slice(-8)}
          </Text>
        ),
      },
      {
        title: 'Brand Name',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => (
          <Tag color="blue">
            {name}
          </Tag>
        ),
      },
    ],
    []
  );

  const typeColumns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        render: (id: string) => (
          <Text type="secondary" style={{ fontFamily: 'monospace' }}>
            {id.slice(-8)}
          </Text>
        ),
      },
      {
        title: 'Type Name',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => (
          <Tag color="purple">
            {name}
          </Tag>
        ),
      },
    ],
    []
  );

  const tabItems = useMemo(
    () => [
      {
        key: 'brands',
        label: (
          <Space>
            <ShoppingOutlined />
            <Text strong>Brands</Text>
            {brands.length > 0 && (
              <Tag color="blue">
                {brands.length}
              </Tag>
            )}
          </Space>
        ),
        children: (
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Create Brand Form */}
              <Card
                title={
                  <Text strong style={{ fontSize: token.fontSizeLG }}>
                    Create New Brand
                  </Text>
                }
                bodyStyle={{ padding: token.sizeUnit * 3, background: token.colorFillTertiary }}
              >
                <Form
                  form={brandForm}
                  onFinish={handleCreateBrand}
                  layout="vertical"
                >
                  <Row gutter={token.sizeUnit * 2}>
                    <Col xs={24} sm={16} md={18}>
                      <Form.Item
                        name="name"
                        label={<Text strong>Brand Name</Text>}
                        rules={[
                          { required: true, message: 'Brand name is required' },
                          { min: 2, message: 'Brand name must be at least 2 characters' },
                          { max: 100, message: 'Brand name must not exceed 100 characters' },
                        ]}
                        hasFeedback
                      >
                        <Input
                          placeholder="Enter brand name (e.g., Apple, Samsung)"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                      <Form.Item label={<Space />} style={{ marginBottom: 0 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<PlusOutlined />}
                          loading={isCreatingBrand}
                          block
                        >
                          Add Brand
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              {/* Brands Table */}
              <Card bodyStyle={{ padding: 0 }}>
                {brands.length === 0 ? (
                  <div style={{ padding: token.sizeUnit * 8 }}>
                    <EmptyState
                      title="No brands yet"
                      description="Create your first brand to get started"
                    />
                  </div>
                ) : (
                  <DataTable
                    columns={brandColumns}
                    dataSource={brands}
                    rowKey="id"
                    stickyHeader
                    pagination={false}
                  />
                )}
              </Card>
            </Space>
          </Card>
        ),
      },
      {
        key: 'types',
        label: (
          <Space>
            <AppstoreOutlined />
            <Text strong>Types</Text>
            {types.length > 0 && (
              <Tag color="purple">
                {types.length}
              </Tag>
            )}
          </Space>
        ),
        children: (
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Create Type Form */}
              <Card
                title={
                  <Text strong style={{ fontSize: token.fontSizeLG }}>
                    Create New Type
                  </Text>
                }
                bodyStyle={{ padding: token.sizeUnit * 3, background: token.colorFillTertiary }}
              >
                <Form
                  form={typeForm}
                  onFinish={handleCreateType}
                  layout="vertical"
                >
                  <Row gutter={token.sizeUnit * 2}>
                    <Col xs={24} sm={16} md={18}>
                      <Form.Item
                        name="name"
                        label={<Text strong>Type Name</Text>}
                        rules={[
                          { required: true, message: 'Type name is required' },
                          { min: 2, message: 'Type name must be at least 2 characters' },
                          { max: 100, message: 'Type name must not exceed 100 characters' },
                        ]}
                        hasFeedback
                      >
                        <Input
                          placeholder="Enter type name (e.g., Electronics, Clothing)"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                      <Form.Item label={<Space />} style={{ marginBottom: 0 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<PlusOutlined />}
                          loading={isCreatingType}
                          block
                        >
                          Add Type
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              {/* Types Table */}
              <Card bodyStyle={{ padding: 0 }}>
                {types.length === 0 ? (
                  <div style={{ padding: token.sizeUnit * 8 }}>
                    <EmptyState
                      title="No types yet"
                      description="Create your first type to get started"
                    />
                  </div>
                ) : (
                  <DataTable
                    columns={typeColumns}
                    dataSource={types}
                    rowKey="id"
                    stickyHeader
                    pagination={false}
                  />
                )}
              </Card>
            </Space>
          </Card>
        ),
      },
    ],
    [brands, types, brandForm, typeForm, isCreatingBrand, isCreatingType, token, brandColumns, typeColumns, handleCreateBrand, handleCreateType]
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <Space direction="vertical" size={2}>
        <Title level={3} style={{ marginBottom: 0, fontWeight: 600 }}>
          Brands & Types
        </Title>
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Manage product brands and categories
        </Text>
      </Space>

      <Tabs items={tabItems} />
    </Space>
  );
}

export default React.memo(BrandsTypesManagement);
