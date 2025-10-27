/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode, ErrorInfo } from 'react';
import { ErrorBoundaryFallback } from './ErrorBoundaryFallback';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ): void {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (
      hasError &&
      resetKeys &&
      prevProps.resetKeys &&
      !this.areKeysEqual(prevProps.resetKeys, resetKeys)
    ) {
      this.resetErrorBoundary();
    }
  }

  areKeysEqual(
    prevKeys: Array<string | number>,
    nextKeys: Array<string | number>
  ): boolean {
    return (
      prevKeys.length === nextKeys.length &&
      prevKeys.every((key, index) => key === nextKeys[index])
    );
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Render custom fallback or default fallback
      if (fallback) {
        // If fallback is a function component, pass error props
        if (React.isValidElement(fallback)) {
          return React.cloneElement(fallback as React.ReactElement<any>, {
            error,
            errorInfo,
            resetError: this.resetErrorBoundary,
          });
        }
        return fallback;
      }

      // Default fallback UI
      return (
        <ErrorBoundaryFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
