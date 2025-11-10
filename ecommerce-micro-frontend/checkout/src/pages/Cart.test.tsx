import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Cart from './Cart';

describe('Cart', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderCart = (config?: any) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Cart config={config} />
      </QueryClientProvider>
    );
  };

  it('should render cart title', () => {
    renderCart();
    expect(screen.getByText(/Shopping Cart/i)).toBeInTheDocument();
  });

  it('should display user greeting when user is provided', () => {
    const config = {
      appContext: {
        user: { id: '1', firstName: 'John', lastName: 'Doe' },
      },
    };
    
    renderCart(config);
    expect(screen.getByText(/Hi John/i)).toBeInTheDocument();
  });
});

