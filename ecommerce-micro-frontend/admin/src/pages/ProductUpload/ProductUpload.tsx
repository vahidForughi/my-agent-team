import React, { useState, useCallback } from 'react';
import {
  Upload,
  Button,
  Card,
  Typography,
  Space,
  Image,
  Alert,
  Row,
  Col,
  theme,
} from 'antd';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useUploadProductImage } from '../../services';

const { Title, Text } = Typography;
const { Dragger } = Upload;

/**
 * ProductUpload Component
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for product image upload functionality
 * - OCP: Open for extension via additional upload options
 */
function ProductUpload() {
  // State hooks
  const [fileList, setFileList] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Other hooks
  const { token } = theme.useToken();
  const { mutate: uploadImage, isPending, isSuccess } = useUploadProductImage();

  // Event handlers
  function handleFileSelect(file: File) {
    setFileList([file]);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  }

  function handleRemove() {
    setFileList([]);
    setPreviewUrl(null);
    setUploadedUrl(null);
  }

  function handleUpload() {
    if (fileList.length === 0) {
      return;
    }

    uploadImage(fileList[0], {
      onSuccess: (data) => {
        if (data?.success && data.imageUrl) {
          setUploadedUrl(data.imageUrl);
        }
      },
    });
  }

  const handleCustomRequest = useCallback(
    (options: UploadRequestOption) => {
      const { file, onSuccess, onError } = options;
      const fileObj = file as File;
      
      uploadImage(fileObj, {
        onSuccess: (data) => {
          if (data?.success) {
            onSuccess?.('ok');
            if (data.imageUrl) {
              setUploadedUrl(data.imageUrl);
            }
          } else {
            onError?.(new Error(data?.message || 'Upload failed'));
          }
        },
        onError: (error) => {
          onError?.(error as Error);
        },
      });
    },
    [uploadImage]
  );

  // Early returns
  if (isSuccess && uploadedUrl) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="Upload Successful"
          description="Your image has been uploaded to S3 successfully."
          type="success"
          icon={<CheckCircleOutlined />}
          showIcon
        />
        <Card title="Uploaded Image">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Image src={uploadedUrl} alt="Uploaded" style={{ maxWidth: '100%' }} />
            <Text copyable={{ text: uploadedUrl }}>Image URL: {uploadedUrl}</Text>
            <Button onClick={handleRemove}>Upload Another Image</Button>
          </Space>
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Title level={2}>Upload Product Image</Title>
        <Text type="secondary">
          Upload product images to S3 storage. Supported formats: JPG, PNG, GIF. Max size: 10MB.
        </Text>
      </Space>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Upload Area">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Dragger
                customRequest={handleCustomRequest}
                fileList={fileList.map((file) => ({
                  uid: file.name,
                  name: file.name,
                  status: 'done' as const,
                }))}
                beforeUpload={(file) => {
                  handleFileSelect(file);
                  return false;
                }}
                onRemove={handleRemove}
                maxCount={1}
                accept="image/*"
                disabled={isPending}
                style={{
                  background: token.colorFillTertiary,
                  border: `2px dashed ${token.colorBorder}`,
                }}
              >
                <Space direction="vertical" align="center" size="middle">
                  <UploadOutlined style={{ fontSize: 48, color: token.colorPrimary }} />
                  <Text strong>Click or drag file to this area to upload</Text>
                  <Text type="secondary">Support for single image upload</Text>
                </Space>
              </Dragger>
              {fileList.length > 0 && (
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={isPending}
                  onClick={handleUpload}
                  icon={<UploadOutlined />}
                >
                  Upload to S3
                </Button>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Preview">
            {previewUrl && (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Image src={previewUrl} alt="Preview" style={{ maxWidth: '100%' }} />
                <Text type="secondary">File: {fileList[0]?.name}</Text>
                <Text type="secondary">Size: {(fileList[0]?.size / 1024 / 1024).toFixed(2)} MB</Text>
              </Space>
            )}

            {!previewUrl && (
              <Space
                direction="vertical"
                align="center"
                style={{ width: '100%', padding: `${token.sizeUnit * 12}px 0`, minHeight: 200 }}
              >
                <Text type="secondary">No image selected</Text>
                <Text type="secondary">Select an image to see preview</Text>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default React.memo(ProductUpload);
