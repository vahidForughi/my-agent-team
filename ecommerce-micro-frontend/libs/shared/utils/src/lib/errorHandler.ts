import { logger } from './logger';

/**
 * Error handler options
 */
export interface ErrorHandlerOptions {
  /**
   * Whether to log the error
   * @default true
   */
  log?: boolean;

  /**
   * Whether to show error to user
   * @default true
   */
  showToUser?: boolean;

  /**
   * Custom error message for user
   */
  userMessage?: string;

  /**
   * Callback for error reporting service
   */
  onError?: (error: Error, context?: any) => void;

  /**
   * Additional context for error
   */
  context?: any;
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly context?: any;

  constructor(
    message: string,
    code: string = 'APP_ERROR',
    statusCode?: number,
    context?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Network error class
 */
export class NetworkError extends AppError {
  constructor(message: string, statusCode?: number, context?: any) {
    super(message, 'NETWORK_ERROR', statusCode, context);
    this.name = 'NetworkError';
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: any) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: any) {
    super(message, 'AUTH_ERROR', 401, context);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied', context?: any) {
    super(message, 'AUTHORIZATION_ERROR', 403, context);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: any) {
    super(message, 'NOT_FOUND_ERROR', 404, context);
    this.name = 'NotFoundError';
  }
}

/**
 * Check if error is an AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(error: Error): string {
  if (isAppError(error)) {
    return error.message;
  }

  // Handle axios/network errors
  if ((error as any).response) {
    const status = (error as any).response.status;
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Please log in to continue.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Generic error message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle error with various options
 *
 * @param error The error to handle
 * @param options Error handler options
 *
 * @example
 * ```ts
 * try {
 *   await fetchData();
 * } catch (error) {
 *   handleError(error, {
 *     log: true,
 *     showToUser: true,
 *     userMessage: 'Failed to load data',
 *     context: { userId: 123 }
 *   });
 * }
 * ```
 */
export function handleError(
  error: Error,
  options: ErrorHandlerOptions = {}
): void {
  const {
    log = true,
    showToUser = true,
    userMessage,
    onError,
    context,
  } = options;

  // Log error if enabled
  if (log) {
    logger.error('Error occurred:', {
      error: error.message,
      stack: error.stack,
      code: isAppError(error) ? error.code : undefined,
      context,
    });
  }

  // Call error reporting service if provided
  if (onError) {
    onError(error, context);
  }

  // Show error to user if enabled
  if (showToUser) {
    const message = userMessage || getUserMessage(error);
    // In a real app, this would trigger a toast/notification
    console.error('[User Error]', message);
  }
}

/**
 * Create error handler with default options
 *
 * @param defaultOptions Default error handler options
 * @returns Error handler function with preset options
 *
 * @example
 * ```ts
 * const handleAppError = createErrorHandler({
 *   log: true,
 *   showToUser: true,
 *   onError: (error) => reportToSentry(error)
 * });
 *
 * try {
 *   await fetchData();
 * } catch (error) {
 *   handleAppError(error);
 * }
 * ```
 */
export function createErrorHandler(defaultOptions: ErrorHandlerOptions) {
  return (error: Error, options?: ErrorHandlerOptions): void => {
    handleError(error, { ...defaultOptions, ...options });
  };
}

export default {
  AppError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  isAppError,
  getUserMessage,
  handleError,
  createErrorHandler,
};
