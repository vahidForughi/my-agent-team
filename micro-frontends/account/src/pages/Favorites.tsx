import React from 'react';
import { Typography, Space, List, Button, Spin, Empty } from 'antd';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import type { AuthUser } from '@ecommerce-platform/auth-provider';
import { useFavoritesByUserName, useRemoveFavorite } from '../services/favorites/hooks';

const { Title, Text } = Typography;

type FavoritesPageProps = {
  config?: AppInjectorProps['config'];
};

function getUserName(user: AuthUser | null | undefined): string {
  return (
    user?.email || user?.username || user?.displayName || user?.id || 'guest'
  );
}

function FavoritesPage(props: FavoritesPageProps) {
  const { config } = props;
  const { appContext } = config || {};
  const contextUser = appContext?.user as AuthUser | undefined;

  const userName = contextUser ? getUserName(contextUser) : undefined;

  const { data: favoritesData, isLoading, isError } = useFavoritesByUserName(
    contextUser ? userName : undefined
  );

  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();

  const favorites = favoritesData?.data || [];

  if (isLoading) {
    return (
      <Space
        direction="vertical"
        align="center"
        style={{ width: '100%', padding: '48px' }}
      >
        <Spin size="large" />
      </Space>
    );
  }

  if (isError) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
        <Title level={2}>My Favorites</Title>
        <Text type="danger">Failed to load favorites. Please try again later.</Text>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Title level={2}>My Favorites</Title>
      <Text type="secondary">Products you have saved to your favorites list</Text>
      {favorites.length === 0 ? (
        <Empty description="No favorites yet" />
      ) : (
        <List
          dataSource={favorites}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Button
                  key="remove"
                  danger
                  loading={isRemoving}
                  onClick={() =>
                    removeFavorite({ favoriteId: item.id, userName: userName || 'guest' })
                  }
                >
                  Remove
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  item.productImageUrl ? (
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      width={80}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        background: '#f0f0f0',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        No image
                      </Text>
                    </div>
                  )
                }
                title={<Text strong>{item.productName}</Text>}
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Added: {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Space>
  );
}

export default FavoritesPage;
