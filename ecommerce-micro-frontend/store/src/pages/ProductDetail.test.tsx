import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProductDetail from './ProductDetail';
import { message } from 'antd';

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ProductDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (
    ui: React.ReactElement,
    initialRoute = '/product/1'
  ) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/product/:id" element={ui} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Rendering Valid Product', () => {
    it('should render product details for product ID 1', () => {
      renderWithRouter(<ProductDetail />, '/product/1');

      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(
        screen.getByText(/premium wireless headphones/i)
      ).toBeInTheDocument();
    });

    it('should render product details for product ID 3', () => {
      renderWithRouter(<ProductDetail />, '/product/3');

      expect(screen.getByText('Laptop Stand')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(
        screen.getByText(/ergonomic aluminum laptop stand/i)
      ).toBeInTheDocument();
    });

    it('should render product rating and reviews', () => {
      renderWithRouter(<ProductDetail />, '/product/1');

      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('(234 reviews)')).toBeInTheDocument();
    });

    it('should render In Stock tag for available products', () => {
      renderWithRouter(<ProductDetail />, '/product/1');

      expect(screen.getByText('In Stock')).toBeInTheDocument();
    });

    it('should render all product features', () => {
      renderWithRouter(<ProductDetail />, '/product/1');

      expect(screen.getByText('Active Noise Cancellation')).toBeInTheDocument();
      expect(screen.getByText('30-hour battery life')).toBeInTheDocument();
      expect(screen.getByText('Bluetooth 5.0')).toBeInTheDocument();
      expect(
        screen.getByText('Comfortable over-ear design')
      ).toBeInTheDocument();
    });

    it('should render Add to Cart and Buy Now buttons', () => {
      renderWithRouter(<ProductDetail />, '/product/1');

      expect(
        screen.getByRole('button', { name: /add to cart/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /buy now/i })
      ).toBeInTheDocument();
    });

    it('should render Back to Store button', () => {
      renderWithRouter(<ProductDetail />, '/product/1');

      expect(
        screen.getByRole('button', { name: /back to store/i })
      ).toBeInTheDocument();
    });

    it('should render user info when user is logged in', () => {
      const config = {
        appContext: {
          user: { firstName: 'John', lastName: 'Doe' },
        },
      };

      renderWithRouter(<ProductDetail config={config} />, '/product/1');

      expect(screen.getByText(/logged in as john doe/i)).toBeInTheDocument();
    });

    it('should not render user info when user is not logged in', () => {
      renderWithRouter(<ProductDetail />, '/product/1');

      expect(screen.queryByText(/logged in as/i)).not.toBeInTheDocument();
    });
  });

  describe('Rendering Invalid Product', () => {
    it('should show "Product Not Found" for invalid product ID', () => {
      renderWithRouter(<ProductDetail />, '/product/999');

      expect(screen.getByText('Product Not Found')).toBeInTheDocument();
      expect(
        screen.getByText("The product you're looking for doesn't exist.")
      ).toBeInTheDocument();
    });

    it('should show Back to Store button on 404 page', () => {
      renderWithRouter(<ProductDetail />, '/product/999');

      const backButton = screen.getByRole('button', { name: /back to store/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should handle non-numeric product IDs', () => {
      renderWithRouter(<ProductDetail />, '/product/abc');

      expect(screen.getByText('Product Not Found')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call message.success when clicking Add to Cart', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProductDetail />, '/product/1');

      const addToCartButton = screen.getByRole('button', {
        name: /add to cart/i,
      });
      await user.click(addToCartButton);

      expect(message.success).toHaveBeenCalledWith(
        'Wireless Headphones added to cart!'
      );
    });

    it('should call message.success and navigate when clicking Buy Now', async () => {
      const mockOnNavigate = jest.fn();
      const user = userEvent.setup();

      const config = {
        onNavigate: mockOnNavigate,
      };

      renderWithRouter(<ProductDetail config={config} />, '/product/2');

      const buyNowButton = screen.getByRole('button', { name: /buy now/i });
      await user.click(buyNowButton);

      expect(message.success).toHaveBeenCalledWith(
        'Smart Watch added to cart!'
      );
      expect(mockOnNavigate).toHaveBeenCalledWith('/checkout');
    });

    it('should navigate back when clicking Back to Store button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProductDetail />, '/product/1');

      const backButton = screen.getByRole('button', { name: /back to store/i });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate back from 404 page when clicking Back to Store', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProductDetail />, '/product/999');

      const backButton = screen.getByRole('button', { name: /back to store/i });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Error Handling', () => {
    it('should call onError callback when error occurs in Add to Cart', async () => {
      const mockOnError = jest.fn();
      const user = userEvent.setup();

      const mockMessageSuccess = message.success as jest.Mock;
      mockMessageSuccess.mockImplementation(() => {
        throw new Error('Cart error');
      });

      const config = {
        onError: mockOnError,
      };

      renderWithRouter(<ProductDetail config={config} />, '/product/1');

      const addToCartButton = screen.getByRole('button', {
        name: /add to cart/i,
      });
      await user.click(addToCartButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Cart error',
          })
        );
      });
    });

    it('should show error message when onError is not provided', async () => {
      const user = userEvent.setup();

      const mockMessageSuccess = message.success as jest.Mock;
      mockMessageSuccess.mockImplementation(() => {
        throw new Error('Cart error');
      });

      renderWithRouter(<ProductDetail />, '/product/1');

      const addToCartButton = screen.getByRole('button', {
        name: /add to cart/i,
      });
      await user.click(addToCartButton);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith(
          'Failed to add item to cart'
        );
      });
    });

    it('should handle Buy Now when onNavigate is not provided', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProductDetail />, '/product/1');

      const buyNowButton = screen.getByRole('button', { name: /buy now/i });
      await user.click(buyNowButton);

      expect(message.success).toHaveBeenCalled();
    });
  });

  describe('Theme Support', () => {
    it('should apply light theme styles by default', () => {
      const { container } = renderWithRouter(<ProductDetail />, '/product/1');

      const imageContainers = container.querySelectorAll(
        '[style*="height: 400px"]'
      );
      const productImageContainer = imageContainers[0] as HTMLElement;

      expect(productImageContainer).toHaveStyle({
        background: 'rgb(240, 240, 240)',
      });
    });

    it('should apply dark theme styles when theme is dark', () => {
      const config = {
        appContext: {
          theme: 'dark',
        },
      };

      const { container } = renderWithRouter(
        <ProductDetail config={config} />,
        '/product/1'
      );

      const imageContainers = container.querySelectorAll(
        '[style*="height: 400px"]'
      );
      const productImageContainer = imageContainers[0] as HTMLElement;

      expect(productImageContainer).toHaveStyle({
        background: 'rgb(51, 51, 51)',
      });
    });
  });

  describe('Product Data Integrity', () => {
    it('should render correct data for all products', () => {
      const productIds = [1, 2, 3, 4, 5, 6];

      productIds.forEach((id) => {
        const { unmount } = renderWithRouter(
          <ProductDetail />,
          `/product/${id}`
        );

        expect(screen.queryByText('Product Not Found')).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /add to cart/i })
        ).toBeInTheDocument();

        unmount();
      });
    });

    it('should format prices with 2 decimal places', () => {
      renderWithRouter(<ProductDetail />, '/product/4');

      expect(screen.getByText('$19.99')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should enable buttons when product is in stock', () => {
      renderWithRouter(<ProductDetail />, '/product/1');

      const addToCartButton = screen.getByRole('button', {
        name: /add to cart/i,
      });
      const buyNowButton = screen.getByRole('button', { name: /buy now/i });

      expect(addToCartButton).not.toBeDisabled();
      expect(buyNowButton).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty config gracefully', () => {
      renderWithRouter(<ProductDetail config={undefined} />, '/product/1');

      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    });

    it('should handle config without appContext', () => {
      const config = {
        onError: jest.fn(),
      };

      renderWithRouter(<ProductDetail config={config} />, '/product/1');

      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    });

    it('should handle rapid successive clicks on Add to Cart', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProductDetail />, '/product/1');

      const addToCartButton = screen.getByRole('button', {
        name: /add to cart/i,
      });

      await user.click(addToCartButton);
      await user.click(addToCartButton);
      await user.click(addToCartButton);

      expect(message.success).toHaveBeenCalledTimes(3);
    });
  });
});
