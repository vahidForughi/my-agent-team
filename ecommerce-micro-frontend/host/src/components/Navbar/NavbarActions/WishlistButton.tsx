import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartOutlined } from '@ant-design/icons';
import { NavbarActionButton } from './NavbarActionButton';

interface WishlistButtonProps {
  /** Number of items in wishlist (optional) */
  count?: number;
}

/**
 * Wishlist button component for the navbar
 * Displays heart icon for accessing user's wishlist
 */
export const WishlistButton: React.FC<WishlistButtonProps> = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/wishlist');
  };

  return (
    <NavbarActionButton
      icon={<HeartOutlined />}
      label="Wishlist"
      onClick={handleClick}
      ariaLabel="Wishlist"
    />
  );
};

export default WishlistButton;

