import React from 'react';
import { Button } from 'antd';

/**
 * Common styles for navbar action buttons
 */
export const navbarActionButtonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: '12px 16px',
  borderRadius: 12,
  color: '#64748b',
};

interface NavbarActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

/**
 * Base button component for navbar actions
 */
export const NavbarActionButton: React.FC<NavbarActionButtonProps> = ({
  icon,
  label,
  onClick,
  ariaLabel,
  style,
}) => {
  return (
    <Button
      type="text"
      icon={icon}
      onClick={onClick}
      style={{ ...navbarActionButtonStyle, ...style }}
      aria-label={ariaLabel || label}
    >
      <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
    </Button>
  );
};

export default NavbarActionButton;

