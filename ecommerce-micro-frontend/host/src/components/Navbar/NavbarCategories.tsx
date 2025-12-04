import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { NAVBAR_CATEGORIES } from '../../constants/navbar';

function NavbarCategories() {
  const navigate = useNavigate();

  const menuItems: MenuProps['items'] = NAVBAR_CATEGORIES.map((cat) => ({
    key: cat.key,
    label: cat.label,
    onClick: () => navigate(cat.path),
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomLeft"
      trigger={['click']}
    >
      <Button type="primary" icon={<MenuOutlined />}>
        All Categories
      </Button>
    </Dropdown>
  );
}

export default NavbarCategories;
