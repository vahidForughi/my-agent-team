import React, { useState, useEffect, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Space,
  Typography,
  Upload,
  Select,
  message,
  Row,
  Col,
  Alert,
  theme,
  Image,
  Tag,
  Flex,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  InboxOutlined,
  FileImageOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import {
  useCreateProduct,
  useUpdateProduct,
  useGetProductById,
  useGetAllBrands,
  useGetAllTypes,
  useUploadProductImage,
} from '../../services';
import type { CreateProductInput, UpdateProductInput } from '../../services/products';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

type ProductFormProps = {
  productId?: string;
};

/**
 * ProductForm Component
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for product form (create/edit)
 * - OCP: Open for extension via additional fields
 */
function ProductForm(props: ProductFormProps) {
  // Props destructuring
  const { productId } = props;

  // State hooks
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [pendingSubmit, setPendingSubmit] = useState<boolean>(false);
  const [pendingFormValues, setPendingFormValues] = useState<CreateProductInput & { brandId?: string; typeId?: string } | null>(null);

  // Other hooks
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const isEditMode = !!productId;
  const { data: product, isLoading: isLoadingProduct } = useGetProductById(
    productId || '',
    { enabled: isEditMode }
  );
  const { data: brands } = useGetAllBrands();
  const { data: types } = useGetAllTypes();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: uploadImage, isPending: isUploading } = useUploadProductImage();

  // Memoized values
  const brandOptions = useMemo(
    () => brands?.map((brand) => ({ label: brand.name, value: brand.id })) || [],
    [brands]
  );

  const typeOptions = useMemo(
    () => types?.map((type) => ({ label: type.name, value: type.id })) || [],
    [types]
  );

  // Effects
  useEffect(() => {
    if (product && isEditMode) {
      form.setFieldsValue({
        name: product.name,
        summary: product.summary,
        description: product.description,
        price: product.price,
        brandId: product.brands?.id,
        typeId: product.types?.id,
      });
      if (product.imageFile) {
        setImageUrl(product.imageFile);
      }
    }
  }, [product, isEditMode, form]);

  // Event handlers
  function handleBack() {
    navigate({ to: '/products' });
  }

  function handleFileSelect(file: File) {
    // Prevent selecting a new file while upload is in progress
    if (isUploading) {
      message.warning('Please wait for the current upload to complete');
      return false;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Invalid file type. Allowed types: PNG, JPG, JPEG, WebP, GIF';
      message.error(errorMsg);
      setUploadError(errorMsg);
      return false;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = 'File size exceeds 10MB limit';
      message.error(errorMsg);
      setUploadError(errorMsg);
      return false;
    }

    // Set selected file and immediately upload to S3
    setSelectedFile(file);
    setUploadError('');
    
    // Automatically upload the image to S3
    handleImageUpload(file);
    
    return false; // Prevent default upload
  }

  function handleImageUpload(file: File, shouldSubmitAfterUpload = false) {
    setUploadError('');
    uploadImage(file, {
      onSuccess: (data) => {
        if (data?.success && data.imageUrl) {
          setImageUrl(data.imageUrl);
          setSelectedFile(null);
          form.setFieldValue('imageFile', data.imageUrl);
          
          // If we were waiting to submit after upload, do it now
          if (shouldSubmitAfterUpload && pendingFormValues) {
            setPendingSubmit(false);
            submitFormWithValues(pendingFormValues, data.imageUrl);
            setPendingFormValues(null);
          }
        } else {
          const errorMsg = data?.message || 'Failed to upload image';
          setUploadError(errorMsg);
          message.error(errorMsg);
          if (shouldSubmitAfterUpload) {
            setPendingSubmit(false);
            setPendingFormValues(null);
          }
        }
      },
      onError: () => {
        const errorMsg = 'An error occurred during upload. Please try again.';
        setUploadError(errorMsg);
        message.error(errorMsg);
        if (shouldSubmitAfterUpload) {
          setPendingSubmit(false);
          setPendingFormValues(null);
        }
      },
    });
  }

  function handleRemoveImage() {
    setImageUrl('');
    setSelectedFile(null);
    setUploadError('');
    form.setFieldValue('imageFile', undefined);
  }

  function submitFormWithValues(formValues: CreateProductInput & { brandId?: string; typeId?: string }, imageUrlToUse: string) {
    console.log('[ProductForm] submitFormWithValues called', { formValues, imageUrlToUse, isEditMode });

    const selectedBrand = brands?.find((b) => b.id === formValues.brandId);
    const selectedType = types?.find((t) => t.id === formValues.typeId);

    if (!selectedBrand) {
      message.error('Please select a valid brand');
      return;
    }

    if (!selectedType) {
      message.error('Please select a valid product type');
      return;
    }

    if (isEditMode && productId) {
      const updateData: UpdateProductInput = {
        id: productId,
        name: formValues.name,
        summary: formValues.summary,
        description: formValues.description,
        price: formValues.price,
        imageFile: imageUrlToUse || undefined,
        brands: { id: selectedBrand.id, name: selectedBrand.name },
        types: { id: selectedType.id, name: selectedType.name },
      };

      console.log('[ProductForm] Calling updateProduct with data:', updateData);

      updateProduct(updateData, {
        onSuccess: () => {
          message.success('Product updated successfully');
          navigate({ to: '/products' });
        },
        onError: (error) => {
          console.error('[ProductForm] Update product error:', error);
          message.error(error?.message || 'Failed to update product. Please try again.');
        },
      });
    } else {
      const createData: CreateProductInput = {
        name: formValues.name,
        summary: formValues.summary,
        description: formValues.description,
        price: formValues.price,
        imageFile: imageUrlToUse,
        brands: { id: selectedBrand.id, name: selectedBrand.name },
        types: { id: selectedType.id, name: selectedType.name },
      };

      console.log('[ProductForm] Calling createProduct with data:', createData);

      createProduct(createData, {
        onSuccess: () => {
          message.success('Product created successfully');
          navigate({ to: '/products' });
        },
        onError: (error) => {
          console.error('[ProductForm] Create product error:', error);
          message.error(error?.message || 'Failed to create product. Please try again.');
        },
      });
    }
  }

  function handleSubmit(values: unknown) {
    const formValues = values as CreateProductInput & { brandId?: string; typeId?: string };

    // Validate image for create mode
    if (!isEditMode && !imageUrl && !selectedFile) {
      message.error('Please upload a product image');
      setUploadError('Product image is required');
      return;
    }

    // If upload is already in progress, wait
    if (isUploading) {
      message.warning('Please wait for image upload to complete');
      return;
    }

    // If file is selected but not uploaded yet, upload it first then submit
    if (selectedFile && !imageUrl) {
      setPendingSubmit(true);
      setPendingFormValues(formValues);
      handleImageUpload(selectedFile, true);
      return;
    }

    // Submit with existing image URL
    submitFormWithValues(formValues, imageUrl);
  }

  // Early returns
  if (isLoadingProduct && isEditMode) {
    return <Card loading style={{ minHeight: 400 }} />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <Row justify="space-between" align="middle">
        <Col>
          <Space direction="vertical" size={2}>
            <Title level={3} style={{ marginBottom: 0, fontWeight: 600 }}>
              {isEditMode ? 'Edit Product' : 'Create New Product'}
            </Title>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {isEditMode
                ? 'Update product information and details'
                : 'Add a new product to your catalog'}
            </Text>
          </Space>
        </Col>
        <Col>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back
          </Button>
        </Col>
      </Row>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          price: 0,
        }}
        requiredMark={false}
        scrollToFirstError
      >
        <Row gutter={[token.sizeUnit * 4, token.sizeUnit * 4]}>
          {/* Left Column - Form Fields */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Basic Information Section */}
              <Card
                title={
                  <Text strong style={{ fontSize: token.fontSizeLG }}>
                    Basic Information
                  </Text>
                }
                bodyStyle={{ padding: token.sizeUnit * 4 }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Form.Item
                    name="name"
                    label={
                      <Text strong>
                        Product Name <Text type="danger">*</Text>
                      </Text>
                    }
                    rules={[
                      { required: true, message: 'Please enter product name' },
                      { min: 3, message: 'Product name must be at least 3 characters' },
                      { max: 200, message: 'Product name must not exceed 200 characters' },
                    ]}
                    hasFeedback
                  >
                    <Input placeholder="Enter product name" />
                  </Form.Item>

                  <Form.Item
                  required
                    name="summary"
                    label={
                      <Text strong>
                        Summary <Text type="danger">*</Text>
                      </Text>
                    }
                    help="A brief description that appears in product listings (max 200 characters)"
                    rules={[
                      { required: true, message: 'Please enter product summary' },
                      { min: 1, message: 'Summary is required' },
                      { max: 200, message: 'Summary must not exceed 200 characters' },
                    ]}
                    hasFeedback
                  >
                    <Input
                      placeholder="Enter a short summary"
                      maxLength={200}
                      showCount
                    />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={
                      <Text strong>
                        Description <Text type="danger">*</Text>
                      </Text>
                    }
                    help="Detailed product description for customers (max 2000 characters)"
                    rules={[
                      { required: true, message: 'Please enter product description' },
                      { min: 1, message: 'Description is required' },
                      { max: 2000, message: 'Description must not exceed 2000 characters' },
                    ]}
                    hasFeedback
                  >
                    <TextArea
                      rows={6}
                      placeholder="Enter detailed product description"
                      showCount
                      maxLength={2000}
                    />
                  </Form.Item>
                </Space>
              </Card>

              {/* Pricing & Classification Section */}
              <Card
                title={
                  <Text strong style={{ fontSize: token.fontSizeLG }}>
                    Pricing & Classification
                  </Text>
                }
                bodyStyle={{ padding: token.sizeUnit * 4 }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Row gutter={token.sizeUnit * 2}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="price"
                        label={
                          <Text strong>
                            Price <Text type="danger">*</Text>
                          </Text>
                        }
                        rules={[
                          { required: true, message: 'Please enter price' },
                          { type: 'number', min: 0, message: 'Price must be positive' },
                        ]}
                        hasFeedback
                      >
                        <InputNumber
                          prefix="$"
                          style={{ width: '100%' }}
                          min={0}
                          step={0.01}
                          precision={2}
                          placeholder="0.00"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="brandId"
                        label={
                          <Text strong>
                            Brand <Text type="danger">*</Text>
                          </Text>
                        }
                        rules={[
                          { required: true, message: 'Please select a brand' },
                        ]}
                        hasFeedback
                      >
                        <Select
                          placeholder="Select brand"
                          options={brandOptions}
                          notFoundContent={<Text type="secondary">No brands available</Text>}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="typeId"
                    label={
                      <Text strong>
                        Type <Text type="danger">*</Text>
                      </Text>
                    }
                    rules={[
                      { required: true, message: 'Please select a product type' },
                    ]}
                    hasFeedback
                  >
                    <Select
                      placeholder="Select product type"
                      options={typeOptions}
                      notFoundContent={<Text type="secondary">No types available</Text>}
                    />
                  </Form.Item>
                </Space>
              </Card>
            </Space>
          </Col>

          {/* Right Column - Image Upload */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Flex align="center" gap={8}>
                  <FileImageOutlined />
                  <Text strong>
                    Product Image
                    {!isEditMode && <Text type="danger"> *</Text>}
                  </Text>
                </Flex>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {imageUrl && (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Card
                      hoverable
                      cover={
                        <Image
                          src={imageUrl}
                          alt="Product"
                          style={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                          }}
                          preview
                        />
                      }
                    />
                    
                    <Flex justify="space-between" align="center">
                      <Tag color="success" icon={<FileImageOutlined />}>
                        Image Uploaded
                      </Tag>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </Button>
                    </Flex>
                  </Space>
                )}

                {!imageUrl && (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Dragger
                      beforeUpload={handleFileSelect}
                      showUploadList={false}
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      disabled={isUploading}
                    >
                      <Space
                        direction="vertical"
                        align="center"
                        size="large"
                        style={{ padding: '48px 0' }}
                      >
                        <InboxOutlined style={{ fontSize: 56, color: token.colorPrimary }} />
                        <Space direction="vertical" size="small" align="center">
                          <Text strong style={{ fontSize: 15 }}>
                            Click or drag image to upload
                          </Text>
                          <Text type="secondary">
                            PNG, JPG, JPEG, WebP, GIF. Max 10MB
                          </Text>
                        </Space>
                      </Space>
                    </Dragger>

                    {isUploading && (
                      <Alert
                        message="Uploading..."
                        description="Please wait while your image is being uploaded to S3."
                        type="info"
                        showIcon
                      />
                    )}

                    {uploadError && (
                      <Alert
                        message="Upload Error"
                        description={uploadError}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setUploadError('')}
                      />
                    )}

                    {selectedFile && !isUploading && !uploadError && (
                      <Alert
                        message="Ready to Upload"
                        description={`Selected: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`}
                        type="success"
                        showIcon
                      />
                    )}
                  </Space>
                )}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Form Actions */}
        <Card bodyStyle={{ padding: token.sizeUnit * 4, background: token.colorFillTertiary }}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isCreating || isUpdating || isUploading}
                disabled={isUploading}
              >
                {isUploading
                  ? 'Uploading Image...'
                  : isEditMode
                    ? 'Update Product'
                    : 'Create Product'}
              </Button>
              <Button onClick={handleBack}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Card>
      </Form>
    </Space>
  );
}

export default React.memo(ProductForm);
