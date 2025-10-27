import {
  retry,
  createRetry,
  retryWithBackoff,
  retryNetworkRequest,
} from './retry';

describe('retry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Retry', () => {
    it('should resolve on first attempt if successful', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await retry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const result = await retry(fn, { delay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(retry(fn, { maxAttempts: 3, delay: 10 })).rejects.toThrow(
        'Failed'
      );
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Retry Options', () => {
    it('should respect custom maxAttempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(retry(fn, { maxAttempts: 5, delay: 10 })).rejects.toThrow(
        'Failed'
      );
      expect(fn).toHaveBeenCalledTimes(5);
    });
  });

  describe('shouldRetry Option', () => {
    it('should stop retrying if shouldRetry returns false', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Non-retryable'));

      const shouldRetry = jest.fn().mockReturnValue(false);

      await expect(retry(fn, { shouldRetry, maxAttempts: 5 })).rejects.toThrow(
        'Non-retryable'
      );
      expect(fn).toHaveBeenCalledTimes(1);
      expect(shouldRetry).toHaveBeenCalledTimes(1);
    });

    it('should continue retrying if shouldRetry returns true', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Retryable'))
        .mockResolvedValue('success');

      const shouldRetry = jest.fn().mockReturnValue(true);

      const result = await retry(fn, { shouldRetry, delay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(shouldRetry).toHaveBeenCalledTimes(1);
    });

    it('should pass error to shouldRetry function', async () => {
      const testError = new Error('Test error');
      const fn = jest.fn().mockRejectedValue(testError);

      const shouldRetry = jest.fn().mockReturnValue(false);

      await expect(retry(fn, { shouldRetry })).rejects.toThrow('Test error');
      expect(shouldRetry).toHaveBeenCalledWith(testError);
    });
  });

  describe('onRetry Callback', () => {
    it('should call onRetry callback for each retry attempt', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const onRetry = jest.fn();

      await retry(fn, { onRetry, delay: 10 });

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, expect.any(Error));
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, expect.any(Error));
    });

    it('should not call onRetry on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const onRetry = jest.fn();

      await retry(fn, { onRetry });

      expect(onRetry).not.toHaveBeenCalled();
    });

    it('should pass attempt number and error to onRetry', async () => {
      const error1 = new Error('Attempt 1');
      const error2 = new Error('Attempt 2');
      const fn = jest
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockResolvedValue('success');

      const onRetry = jest.fn();

      await retry(fn, { onRetry, delay: 10 });

      expect(onRetry).toHaveBeenNthCalledWith(1, 1, error1);
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, error2);
    });
  });

  describe('createRetry Factory', () => {
    it('should create retry function with default options', async () => {
      const retryWithDefaults = createRetry({
        maxAttempts: 5,
        delay: 10,
      });

      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(retryWithDefaults(fn)).rejects.toThrow('Failed');
      expect(fn).toHaveBeenCalledTimes(5);
    });

    it('should allow overriding default options', async () => {
      const retryWithDefaults = createRetry({
        maxAttempts: 5,
        delay: 10,
      });

      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(retryWithDefaults(fn, { maxAttempts: 2 })).rejects.toThrow(
        'Failed'
      );
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Preset Configurations', () => {
    it('should use retryWithBackoff preset', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockResolvedValue('success');

      const result = await retryWithBackoff(fn, { delay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use retryNetworkRequest preset', async () => {
      const networkError = { response: { status: 500 } };
      const fn = jest
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue('success');

      const result = await retryNetworkRequest(fn, { delay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry 4xx errors with retryNetworkRequest', async () => {
      const clientError = { response: { status: 404 } };
      const fn = jest.fn().mockRejectedValue(clientError);

      await expect(retryNetworkRequest(fn)).rejects.toEqual(clientError);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry 5xx errors with retryNetworkRequest', async () => {
      const serverError = { response: { status: 503 } };
      const fn = jest
        .fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValue('success');

      const result = await retryNetworkRequest(fn, { delay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry network errors (no response) with retryNetworkRequest', async () => {
      const networkError = new Error('Network error');
      const fn = jest
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue('success');

      const result = await retryNetworkRequest(fn, { delay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle maxAttempts = 1', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(retry(fn, { maxAttempts: 1 })).rejects.toThrow('Failed');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle zero delay', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockResolvedValue('success');

      const result = await retry(fn, { delay: 0 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should handle backoffMultiplier = 1 (no backoff)', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const result = await retry(fn, { delay: 10, backoffMultiplier: 1 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
});
