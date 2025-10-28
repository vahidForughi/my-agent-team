import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  MenuOutlined,
  HeartOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Badge, Input, Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { isAuthenticated, logout } from '../../helpers/auth';
import CartPreview from '../CartPreview/CartPreview';
import './Navbar.less';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isAuthenticated();
  const basketCount = 3; // TODO: Connect to basket store
  const [searchValue, setSearchValue] = React.useState('');
  const [showCategories, setShowCategories] = React.useState(false);
  const [showCartPreview, setShowCartPreview] = React.useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchValue)}`);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const categories = [
    { key: 'laptops', label: '💻 Laptops', path: '/store?cat=laptops' },
    { key: 'phones', label: '📱 Smartphones', path: '/store?cat=phones' },
    { key: 'tablets', label: '📱 Tablets', path: '/store?cat=tablets' },
    { key: 'audio', label: '🎧 Audio', path: '/store?cat=audio' },
    {
      key: 'accessories',
      label: '⌨️ Accessories',
      path: '/store?cat=accessories',
    },
    { key: 'gaming', label: '🎮 Gaming', path: '/store?cat=gaming' },
    { key: 'wearables', label: '⌚ Wearables', path: '/store?cat=wearables' },
    { key: 'cameras', label: '📷 Cameras', path: '/store?cat=cameras' },
  ];

  const userMenuItems: MenuProps['items'] = authenticated
    ? [
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'My Account',
          onClick: () => navigate('/account/profile'),
        },
        {
          key: 'orders',
          icon: <ShoppingCartOutlined />,
          label: 'My Orders',
          onClick: () => navigate('/account/orders'),
        },
        {
          key: 'wishlist',
          icon: <HeartOutlined />,
          label: 'Wishlist',
          onClick: () => navigate('/account/wishlist'),
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          label: 'Logout',
          danger: true,
          onClick: handleLogout,
        },
      ]
    : [
        {
          key: 'login',
          label: 'Login',
          onClick: handleLogin,
        },
        {
          key: 'register',
          label: 'Register',
          onClick: () => navigate('/register'),
        },
      ];

  return (
    <div className="enhanced-navbar">
      {/* Main Navbar */}
      <div className="navbar-main">
        <div className="navbar-content">
          {/* Logo */}
          <div className="navbar-logo" onClick={() => navigate('/')}>
            <h1>NextTech</h1>
            <span className="logo-tagline">Tech Store</span>
          </div>

          {/* Search Bar - Most Important! */}
          <div className="navbar-search">
            <Input
              size="large"
              placeholder="Search for products, brands, and more..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              className="search-input"
              suffix={
                <button className="search-button" onClick={handleSearch}>
                  Search
                </button>
              }
            />
            {/* Search suggestions will go here */}
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Notifications */}
            {authenticated && (
              <Badge count={5} size="small">
                <button
                  className="action-btn"
                  onClick={() => navigate('/notifications')}
                >
                  <BellOutlined />
                  <span className="action-label">Notifications</span>
                </button>
              </Badge>
            )}

            {/* Wishlist */}
            <button
              className="action-btn"
              onClick={() => navigate('/wishlist')}
            >
              <HeartOutlined />
              <span className="action-label">Wishlist</span>
            </button>

            {/* Cart with Preview */}
            <div
              className="cart-container"
              onMouseEnter={() => setShowCartPreview(true)}
              onMouseLeave={() => setShowCartPreview(false)}
            >
              <Badge
                count={basketCount}
                showZero={false}
                className="cart-badge"
              >
                <button
                  className="action-btn cart-btn"
                  onClick={() => navigate('/checkout')}
                >
                  <ShoppingCartOutlined />
                  <span className="action-label">Cart</span>
                </button>
              </Badge>
              <CartPreview visible={showCartPreview} />
            </div>

            {/* User Menu */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <button className="action-btn user-btn">
                {authenticated ? (
                  <Avatar size="small" icon={<UserOutlined />} />
                ) : (
                  <UserOutlined />
                )}
                <span className="action-label">
                  {authenticated ? 'Account' : 'Login'}
                </span>
              </button>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="navbar-links">
        <div className="navbar-content">
          {/* Categories Dropdown */}
          <div className="categories-menu">
            <button
              className="categories-trigger"
              onClick={() => setShowCategories(!showCategories)}
            >
              <MenuOutlined />
              <span>All Categories</span>
            </button>
            {showCategories && (
              <div className="categories-dropdown">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    className="category-item"
                    onClick={() => {
                      navigate(cat.path);
                      setShowCategories(false);
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <nav className="quick-links">
            <button
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <button
              className={`nav-link ${isActive('/store') ? 'active' : ''}`}
              onClick={() => navigate('/store')}
            >
              Store
            </button>
            <button
              className="nav-link flash-sale"
              onClick={() => navigate('/deals')}
            >
              <span className="fire-icon" role="img" aria-label="fire">
                🔥
              </span>{' '}
              Flash Sale
            </button>
            <button className="nav-link" onClick={() => navigate('/deals')}>
              Today's Deals
            </button>
            <button
              className="nav-link"
              onClick={() => navigate('/new-arrivals')}
            >
              New Arrivals
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
