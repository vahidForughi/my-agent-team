import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import './Footer.less';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribe email:', email);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container section-fade-in">
        <div className="footer-about">
          <h3 className="footer-logo">NextTech</h3>
          <p className="footer-desc">
            Your premier destination for cutting-edge tech gadgets and
            accessories. Empowering your digital lifestyle since 2023.
          </p>
        </div>
        <div className="footer-links">
          <h4>Navigation</h4>
          <ul>
            <li>
              <a className="footer-link" onClick={() => navigate('/')}>
                Home
              </a>
            </li>
            <li>
              <a className="footer-link" onClick={() => navigate('/store')}>
                Shop
              </a>
            </li>
            <li>
              <a className="footer-link" href="#">
                About Us
              </a>
            </li>
            <li>
              <a className="footer-link" href="#">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>
            <PhoneOutlined /> (123) 456-7890
          </p>
          <p>
            <MailOutlined /> support@nexttech.com
          </p>
          <p>
            <EnvironmentOutlined /> 123 Tech Avenue, CA
          </p>
        </div>
        <div className="footer-social">
          <h4>Connect With Us</h4>
          <div className="social-icons">
            <a href="#" className="social-icon" aria-label="Facebook">
              <FacebookOutlined />
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <InstagramOutlined />
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <TwitterOutlined />
            </a>
            <a href="#" className="social-icon" aria-label="LinkedIn">
              <LinkedinOutlined />
            </a>
          </div>
          <div className="newsletter">
            <h5>Subscribe to our newsletter</h5>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2023 NextTech. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
