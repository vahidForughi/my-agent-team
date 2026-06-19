import React from 'react';
import { Button, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useAuth } from '@ecommerce-platform/auth-provider';
import {
  useFavoritesByUserName,
  useAddFavorite,
  useRemoveFavorite,
} from '../../services/favorites/hooks';

type FavoriteButtonProps = {
  productId: string;
  productName: string;
  productImageUrl?: string | null;
};

function FavoriteButton(props: FavoriteButtonProps) {
  const { productId, productName, productImageUrl } = props;

  const { user, isAuthenticated } = useAuth();

  const userName =
    user?.email || user?.displayName || user?.id || undefined;

  const { data: favoritesData } = useFavoritesByUserName(userName);

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  if (!isAuthenticated) {
    return null;
  }

  const favorites = Array.isArray(favoritesData) ? favoritesData : [];
  const existingFavorite = favorites.find((fav) => fav.productId === productId);
  const isFavorited = Boolean(existingFavorite);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();

    if (!userName) return;

    if (isFavorited && existingFavorite) {
      removeFavorite.mutate({
        favoriteId: existingFavorite.id,
        userName,
      });
    } else {
      addFavorite.mutate({
        userName,
        productId,
        productName,
        productImageUrl,
      });
    }
  }

  const tooltipTitle = isFavorited ? 'Remove from favorites' : 'Add to favorites';

  return (
    <Tooltip title={tooltipTitle}>
      <Button
        type="text"
        size="small"
        icon={
          isFavorited ? (
            <HeartFilled style={{ color: '#ff4d4f' }} />
          ) : (
            <HeartOutlined />
          )
        }
        loading={addFavorite.isPending || removeFavorite.isPending}
        onClick={handleClick}
        aria-label={tooltipTitle}
      />
    </Tooltip>
  );
}

export default FavoriteButton;
