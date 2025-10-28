import React from 'react';
import { PhoneOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import './TopBar.less';

const TopBar: React.FC = () => {
  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <div className="top-bar-left">
          <span className="promo-text">
            🎉 <strong>FREE SHIPPING</strong> on orders over $50
          </span>
          <span className="divider">|</span>
          <span className="promo-text">
            ⚡ <strong>Flash Sale</strong> - Up to 50% OFF
          </span>
        </div>
        <div className="top-bar-right">
          <a href="tel:1234567890" className="top-bar-link">
            <PhoneOutlined /> Hotline: (123) 456-7890
          </a>
          <span className="divider">|</span>
          <a href="#" className="top-bar-link">
            <CustomerServiceOutlined /> Live Chat
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
