/**
 * Retry options configuration
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  delay?: number;

  /**
   * Multiplier for exponential backoff
   * @default 2
   */
  backoffMultiplier?: number;

  /**
   * Maximum delay for exponential backoff
   * @default 10000
   */
  maxDelay?: number;

  /**
   * Function to determine if error should trigger retry
   */
  shouldRetry?: (error: Error) => boolean;

  /**
   * Callback for each retry attempt
   */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Default retry options
 */
const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  shouldRetry: () => true,
  onRetry: () => {},
};

/**
 * Delay utility function
 */
const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Calculate delay with exponential backoff
 */
const calculateDelay = (
  attempt: number,
  baseDelay: number,
  multiplier: number,
  maxDelay: number
): number => {
  const exponentialDelay = baseDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(exponentialDelay, maxDelay);
};

/**
 * Retry a function with configurable options
 *
 * @param fn Function to retry
 * @param options Retry options
 * @returns Promise with the function result
 *
 * @example
 * ```ts
 * const result = await retry(
 *   () => fetchData(),
 *   {
 *     maxAttempts: 3,
 *     delay: 1000,
 *     backoffMultiplier: 2,
 *     onRetry: (attempt, error) => console.log(`Retry attempt ${attempt}`, error)
 *   }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (!config.shouldRetry(lastError)) {
        throw lastError;
      }

      // If this was the last attempt, throw the error
      if (attempt >= config.maxAttempts) {
        throw lastError;
      }

      // Call retry callback
      config.onRetry(attempt, lastError);

      // Calculate delay and wait
      const delayTime = calculateDelay(
        attempt,
        config.delay,
        config.backoffMultiplier,
        config.maxDelay
      );
      await wait(delayTime);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Create a retry function with preset options
 *
 * @param options Default retry options
 * @returns Retry function with preset options
 *
 * @example
 * ```ts
 * const retryWithDefaults = createRetry({
 *   maxAttempts: 5,
 *   delay: 2000,
 * });
 *
 * const result = await retryWithDefaults(() => fetchData());
 * ```
 */
export function createRetry(defaultOptions: RetryOptions) {
  return <T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> => {
    return retry(fn, { ...defaultOptions, ...options });
  };
}

/**
 * Retry with exponential backoff (preset configuration)
 */
export const retryWithBackoff = createRetry({
  maxAttempts: 3,
  delay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
});

/**
 * Retry for network requests (preset configuration)
 */
export const retryNetworkRequest = createRetry({
  maxAttempts: 3,
  delay: 1000,
  backoffMultiplier: 1.5,
  maxDelay: 5000,
  shouldRetry: (error: any) => {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  },
});

export default retry;
