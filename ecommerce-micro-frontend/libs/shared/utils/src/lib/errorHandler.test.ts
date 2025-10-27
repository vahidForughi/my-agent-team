import {
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
} from './errorHandler';
import { logger } from './logger';

jest.mock('./logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create AppError with all properties', () => {
      const error = new AppError('Test error', 'TEST_CODE', 500, {
        test: 'context',
      });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.context).toEqual({ test: 'context' });
      expect(error.name).toBe('AppError');
    });

    it('should create AppError with defaults', () => {
      const error = new AppError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('APP_ERROR');
      expect(error.statusCode).toBeUndefined();
      expect(error.context).toBeUndefined();
    });

    it('should maintain proper stack trace', () => {
      const error = new AppError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('NetworkError', () => {
    it('should create NetworkError with correct properties', () => {
      const error = new NetworkError('Network failed', 503, { url: 'test' });

      expect(error.message).toBe('Network failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(503);
      expect(error.context).toEqual({ url: 'test' });
      expect(error.name).toBe('NetworkError');
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });

      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ field: 'email' });
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with default message', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('Authentication required');
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should create AuthenticationError with custom message', () => {
      const error = new AuthenticationError('Invalid token');

      expect(error.message).toBe('Invalid token');
    });
  });

  describe('AuthorizationError', () => {
    it('should create AuthorizationError with default message', () => {
      const error = new AuthorizationError();

      expect(error.message).toBe('Permission denied');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });

    it('should create AuthorizationError with custom message', () => {
      const error = new AuthorizationError('Admin access required');

      expect(error.message).toBe('Admin access required');
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with default message', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should create NotFoundError with custom message', () => {
      const error = new NotFoundError('User not found');

      expect(error.message).toBe('User not found');
    });
  });
});

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    const error = new AppError('Test');

    expect(isAppError(error)).toBe(true);
  });

  it('should return true for subclasses of AppError', () => {
    expect(isAppError(new NetworkError('Test'))).toBe(true);
    expect(isAppError(new ValidationError('Test'))).toBe(true);
    expect(isAppError(new AuthenticationError())).toBe(true);
    expect(isAppError(new AuthorizationError())).toBe(true);
    expect(isAppError(new NotFoundError())).toBe(true);
  });

  it('should return false for regular Error', () => {
    const error = new Error('Test');

    expect(isAppError(error)).toBe(false);
  });

  it('should return false for non-error objects', () => {
    expect(isAppError({})).toBe(false);
    expect(isAppError('error')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});

describe('getUserMessage', () => {
  describe('AppError Messages', () => {
    it('should return message from AppError', () => {
      const error = new AppError('Custom app error');

      expect(getUserMessage(error)).toBe('Custom app error');
    });

    it('should return message from ValidationError', () => {
      const error = new ValidationError('Invalid email format');

      expect(getUserMessage(error)).toBe('Invalid email format');
    });
  });

  describe('HTTP Status Code Messages', () => {
    it('should return message for 400 Bad Request', () => {
      const error = { response: { status: 400 } } as any;

      expect(getUserMessage(error)).toBe(
        'Invalid request. Please check your input.'
      );
    });

    it('should return message for 401 Unauthorized', () => {
      const error = { response: { status: 401 } } as any;

      expect(getUserMessage(error)).toBe('Please log in to continue.');
    });

    it('should return message for 403 Forbidden', () => {
      const error = { response: { status: 403 } } as any;

      expect(getUserMessage(error)).toBe(
        'You do not have permission to perform this action.'
      );
    });

    it('should return message for 404 Not Found', () => {
      const error = { response: { status: 404 } } as any;

      expect(getUserMessage(error)).toBe(
        'The requested resource was not found.'
      );
    });

    it('should return message for 500 Internal Server Error', () => {
      const error = { response: { status: 500 } } as any;

      expect(getUserMessage(error)).toBe(
        'A server error occurred. Please try again later.'
      );
    });

    it('should return generic message for other status codes', () => {
      const error = { response: { status: 418 } } as any;

      expect(getUserMessage(error)).toBe(
        'An error occurred. Please try again.'
      );
    });
  });

  describe('Generic Error Messages', () => {
    it('should return generic message for Error without response', () => {
      const error = new Error('Some error');

      expect(getUserMessage(error)).toBe(
        'An unexpected error occurred. Please try again.'
      );
    });

    it('should return generic message for unknown error type', () => {
      const error = { message: 'Unknown' } as any;

      expect(getUserMessage(error)).toBe(
        'An unexpected error occurred. Please try again.'
      );
    });
  });
});

describe('handleError', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Default Behavior', () => {
    it('should log error by default', () => {
      const error = new Error('Test error');

      handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Error occurred:', {
        error: 'Test error',
        stack: expect.any(String),
        code: undefined,
        context: undefined,
      });
    });

    it('should show error to user by default', () => {
      const error = new Error('Test error');

      handleError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[User Error]',
        'An unexpected error occurred. Please try again.'
      );
    });
  });

  describe('Logging Options', () => {
    it('should not log when log option is false', () => {
      const error = new Error('Test error');

      handleError(error, { log: false });

      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log AppError with error code', () => {
      const error = new AppError('App error', 'APP_CODE', 500);

      handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Error occurred:', {
        error: 'App error',
        stack: expect.any(String),
        code: 'APP_CODE',
        context: undefined,
      });
    });

    it('should log with additional context', () => {
      const error = new Error('Test error');
      const context = { userId: 123, action: 'fetch_data' };

      handleError(error, { context });

      expect(logger.error).toHaveBeenCalledWith('Error occurred:', {
        error: 'Test error',
        stack: expect.any(String),
        code: undefined,
        context,
      });
    });
  });

  describe('User Display Options', () => {
    it('should not show error to user when showToUser is false', () => {
      const error = new Error('Test error');

      handleError(error, { showToUser: false });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should show custom user message', () => {
      const error = new Error('Internal error');

      handleError(error, { userMessage: 'Please try again later' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[User Error]',
        'Please try again later'
      );
    });

    it('should show AppError message to user', () => {
      const error = new ValidationError('Email is required');

      handleError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[User Error]',
        'Email is required'
      );
    });
  });

  describe('Custom Error Handler', () => {
    it('should call onError callback', () => {
      const error = new Error('Test error');
      const onError = jest.fn();

      handleError(error, { onError });

      expect(onError).toHaveBeenCalledWith(error, undefined);
    });

    it('should call onError with context', () => {
      const error = new Error('Test error');
      const onError = jest.fn();
      const context = { test: 'context' };

      handleError(error, { onError, context });

      expect(onError).toHaveBeenCalledWith(error, context);
    });
  });

  describe('Combined Options', () => {
    it('should handle all options together', () => {
      const error = new AppError('Custom error', 'CUSTOM_CODE');
      const onError = jest.fn();
      const context = { test: 'data' };

      handleError(error, {
        log: true,
        showToUser: true,
        userMessage: 'Operation failed',
        onError,
        context,
      });

      expect(logger.error).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(error, context);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[User Error]',
        'Operation failed'
      );
    });

    it('should handle disabled options', () => {
      const error = new Error('Test error');
      const onError = jest.fn();

      handleError(error, {
        log: false,
        showToUser: false,
        onError,
      });

      expect(logger.error).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('createErrorHandler', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should create error handler with default options', () => {
    const onError = jest.fn();
    const errorHandler = createErrorHandler({
      log: true,
      showToUser: true,
      onError,
    });

    const error = new Error('Test error');
    errorHandler(error);

    expect(logger.error).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(error, undefined);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should allow overriding default options', () => {
    const defaultOnError = jest.fn();
    const overrideOnError = jest.fn();

    const errorHandler = createErrorHandler({
      log: true,
      showToUser: true,
      onError: defaultOnError,
    });

    const error = new Error('Test error');
    errorHandler(error, {
      log: false,
      showToUser: false,
      onError: overrideOnError,
    });

    expect(logger.error).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(defaultOnError).not.toHaveBeenCalled();
    expect(overrideOnError).toHaveBeenCalled();
  });

  it('should use custom user message from defaults', () => {
    const errorHandler = createErrorHandler({
      userMessage: 'Default error message',
    });

    const error = new Error('Internal error');
    errorHandler(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[User Error]',
      'Default error message'
    );
  });

  it('should merge default and override options', () => {
    const onError = jest.fn();
    const errorHandler = createErrorHandler({
      log: true,
      onError,
    });

    const error = new Error('Test error');
    const context = { test: 'data' };

    errorHandler(error, { context });

    expect(logger.error).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(error, context);
  });
});
