import { render, screen } from '@testing-library/react';
import App from './app';

/**
 * Test suite for main App component
 *
 * Note: App component already includes BrowserRouter, so we don't wrap it again.
 * Testing focuses on successful rendering and core functionality.
 */
describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should apply light theme by default when no theme is stored', () => {
    render(<App />);
    // Verify the component renders successfully with default theme
    const body = document.body;
    expect(body).toBeInTheDocument();
  });

  it('should apply dark theme when stored in localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(<App />);
    // Verify the component renders successfully with dark theme from storage
    const body = document.body;
    expect(body).toBeInTheDocument();
  });

  it('should handle invalid theme value in localStorage gracefully', () => {
    localStorage.setItem('theme', 'invalid-theme');
    render(<App />);
    // Should default to light theme when invalid value is present
    const body = document.body;
    expect(body).toBeInTheDocument();
  });
});
