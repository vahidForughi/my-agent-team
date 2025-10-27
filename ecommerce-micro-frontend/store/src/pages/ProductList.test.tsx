import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProductList from './ProductList';
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

describe('ProductList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  describe('Rendering', () => {
    it('should render product store title', () => {
      renderWithRouter(<ProductList />);

      expect(screen.getByText('Product Store')).toBeInTheDocument();
    });

    it('should render all 6 products', () => {
      renderWithRouter(<ProductList />);

      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      expect(screen.getByText('Smart Watch')).toBeInTheDocument();
      expect(screen.getByText('Laptop Stand')).toBeInTheDocument();
      expect(screen.getByText('USB-C Cable')).toBeInTheDocument();
      expect(screen.getByText('Phone Case')).toBeInTheDocument();
      expect(screen.getByText('Portable Charger')).toBeInTheDocument();
    });

    it('should render product prices correctly', () => {
      renderWithRouter(<ProductList />);

      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('$199.99')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
    });

    it('should render Add to Cart buttons for each product', () => {
      renderWithRouter(<ProductList />);

      const addToCartButtons = screen.getAllByRole('button', {
        name: /add to cart/i,
      });
      expect(addToCartButtons).toHaveLength(6);
    });

    it('should render welcome message when user is provided', () => {
      const config = {
        appContext: {
          user: { firstName: 'John', lastName: 'Doe' },
        },
      };

      renderWithRouter(<ProductList config={config} />);

      expect(screen.getByText(/welcome back, john!/i)).toBeInTheDocument();
    });

    it('should not render welcome message when no user', () => {
      renderWithRouter(<ProductList />);

      expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call message.success when adding item to cart', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProductList />);

      const addToCartButtons = screen.getAllByRole('button', {
        name: /add to cart/i,
      });

      await user.click(addToCartButtons[0]);

      expect(message.success).toHaveBeenCalledWith(
        'Wireless Headphones added to cart!'
      );
    });

    it('should navigate to product detail when clicking on product image', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<ProductList />);

      const imageContainers = container.querySelectorAll(
        '[style*="cursor: pointer"]'
      );
      const firstProductImage = imageContainers[0] as HTMLElement;

      if (firstProductImage) {
        await user.click(firstProductImage);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/product/1');
    });

    it('should handle add to cart for multiple products', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProductList />);

      const addToCartButtons = screen.getAllByRole('button', {
        name: /add to cart/i,
      });

      await user.click(addToCartButtons[0]);
      await user.click(addToCartButtons[2]);

      expect(message.success).toHaveBeenCalledTimes(2);
      expect(message.success).toHaveBeenNthCalledWith(
        1,
        'Wireless Headphones added to cart!'
      );
      expect(message.success).toHaveBeenNthCalledWith(
        2,
        'Laptop Stand added to cart!'
      );
    });
  });

  describe('Error Handling', () => {
    it('should call onError callback when error occurs', async () => {
      const mockOnError = jest.fn();
      const user = userEvent.setup();

      const mockMessageSuccess = message.success as jest.Mock;
      mockMessageSuccess.mockImplementation(() => {
        throw new Error('Message system error');
      });

      const config = {
        onError: mockOnError,
      };

      renderWithRouter(<ProductList config={config} />);

      const addToCartButtons = screen.getAllByRole('button', {
        name: /add to cart/i,
      });

      await user.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Message system error',
          })
        );
      });
    });

    it('should show error message when onError is not provided', async () => {
      const user = userEvent.setup();

      const mockMessageSuccess = message.success as jest.Mock;
      mockMessageSuccess.mockImplementation(() => {
        throw new Error('Message system error');
      });

      renderWithRouter(<ProductList />);

      const addToCartButtons = screen.getAllByRole('button', {
        name: /add to cart/i,
      });

      await user.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith(
          'Failed to add item to cart'
        );
      });
    });
  });

  describe('Theme Support', () => {
    it('should apply light theme styles by default', () => {
      const { container } = renderWithRouter(<ProductList />);

      const imageContainers = container.querySelectorAll(
        '[style*="background"]'
      );
      const firstImageContainer = imageContainers[0] as HTMLElement;

      expect(firstImageContainer).toHaveStyle({
        background: 'rgb(240, 240, 240)',
      });
    });

    it('should apply dark theme styles when theme is dark', () => {
      const config = {
        appContext: {
          theme: 'dark',
        },
      };

      const { container } = renderWithRouter(<ProductList config={config} />);

      const imageContainers = container.querySelectorAll(
        '[style*="background"]'
      );
      const firstImageContainer = imageContainers[0] as HTMLElement;

      expect(firstImageContainer).toHaveStyle({
        background: 'rgb(51, 51, 51)',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty config gracefully', () => {
      renderWithRouter(<ProductList config={undefined} />);

      expect(screen.getByText('Product Store')).toBeInTheDocument();
    });

    it('should handle config without appContext', () => {
      const config = {
        onError: jest.fn(),
      };

      renderWithRouter(<ProductList config={config} />);

      expect(screen.getByText('Product Store')).toBeInTheDocument();
    });

    it('should handle rapid successive clicks on Add to Cart', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProductList />);

      const addToCartButtons = screen.getAllByRole('button', {
        name: /add to cart/i,
      });

      await user.click(addToCartButtons[0]);
      await user.click(addToCartButtons[0]);
      await user.click(addToCartButtons[0]);

      expect(message.success).toHaveBeenCalledTimes(3);
    });
  });
});
