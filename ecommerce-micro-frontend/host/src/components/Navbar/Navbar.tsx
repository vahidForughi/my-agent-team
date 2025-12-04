import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Typography, Button } from 'antd';
import NavbarSearch from './NavbarSearch';
import NavbarActions from './NavbarActions';
import NavbarCategories from './NavbarCategories';
import NavbarQuickLinks from './NavbarQuickLinks';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { CartItem } from '../CartPreview/CartPreview';
import { brandGradient } from '../../config/theme';

const { Title } = Typography;

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  // TODO: Connect to actual cart store
  const basketCount = 0;
  const cartItems: CartItem[] = [];

  const handleRemoveCartItem = (id: string) => {
    // TODO: Implement cart item removal
    console.info('Remove cart item:', id);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#ffffff',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.1)',
      }}
    >
      <Flex
        vertical
        style={{
          background: '#ffffff',
        }}
      >
        <Flex
          style={{
            background: '#ffffff',
            padding: '16px 0',
            borderBottom: '1px solid #f1f5f9',
            height: 88,
            alignItems: 'center',
          }}
        >
          <Flex
            style={{
              maxWidth: 1400,
              margin: '0 auto',
              padding: '0 32px',
              width: '100%',
              alignItems: 'center',
              gap: 40,
            }}
          >
            <Button
              type="text"
              onClick={() => navigate('/')}
              style={{
                minWidth: 180,
                padding: 0,
                height: 'auto',
                textAlign: 'left',
              }}
              aria-label="NextTech home"
            >
              <Title
                level={1}
                style={{
                  margin: 0,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: brandGradient.start,
                  letterSpacing: '-0.5px',
                }}
              >
                NextTech
              </Title>
              <Typography.Text
                type="secondary"
                style={{
                  fontSize: 10,
                  letterSpacing: '1.5px',
                  marginTop: 4,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                }}
              >
                Tech Store
              </Typography.Text>
            </Button>

            <div style={{ flex: 1, maxWidth: 700 }}>
              <NavbarSearch />
            </div>

            <LanguageSwitcher />

            <NavbarActions
              basketCount={basketCount}
              cartItems={cartItems}
              onRemoveCartItem={handleRemoveCartItem}
            />
          </Flex>
        </Flex>

        <Flex
          style={{
            borderBottom: '1px solid #f1f1f1',
            height: 64,
            alignItems: 'center',
          }}
        >
          <Flex
            style={{
              maxWidth: 1400,
              margin: '0 auto',
              padding: '0 32px',
              width: '100%',
              alignItems: 'center',
              gap: 32,
            }}
          >
            <NavbarCategories />
            <NavbarQuickLinks />
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default Navbar;
