/**
 * Environment Configuration
 * Centralized configuration for all environment variables with validation
 */

interface EnvironmentConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  useMockData: boolean;
  enableAuthentication: boolean;
  enableDiscountService: boolean;
  enableOrderTracking: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableApiLogging: boolean;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  // For Nx with webpack: environment variables are injected at build time via process.env
  // The NX_ prefix makes them automatically available in the browser bundle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const envValue = (process as any).env?.[key];

  if (envValue === undefined) {
    if (defaultValue === undefined) {
      console.warn(`[env.config] Variable ${key} is not set, using empty string`);
      return '';
    }
    console.log(`[env.config] Variable ${key} not found, using default:`, defaultValue);
    return defaultValue;
  }

  console.log(`[env.config] Loaded ${key}:`, envValue);
  return envValue;
};

const getBooleanEnv = (key: string, defaultValue = false): boolean => {
  const value = getEnvVar(key, String(defaultValue));
  return value === 'true' || value === '1';
};

const getNumberEnv = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key, String(defaultValue));
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const env: EnvironmentConfig = {
  apiBaseUrl: getEnvVar('NX_API_BASE_URL', 'http://localhost:8010'),
  apiTimeout: getNumberEnv('NX_API_TIMEOUT', 30000),
  useMockData: getBooleanEnv('NX_USE_MOCK_DATA', false),
  enableAuthentication: getBooleanEnv('NX_ENABLE_AUTHENTICATION', true),
  enableDiscountService: getBooleanEnv('NX_ENABLE_DISCOUNT_SERVICE', true),
  enableOrderTracking: getBooleanEnv('NX_ENABLE_ORDER_TRACKING', true),
  logLevel: (getEnvVar('NX_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error'),
  enableApiLogging: getBooleanEnv('NX_ENABLE_API_LOGGING', false),
};

// Validate configuration
const validateConfig = () => {
  if (!env.apiBaseUrl) {
    throw new Error('API Base URL is required');
  }

  if (env.useMockData) {
    console.warn('🚧 Running in MOCK DATA mode - using simulated API responses');
  }

  if (env.enableApiLogging) {
    console.log('📡 API Configuration:', {
      baseUrl: env.apiBaseUrl,
      timeout: env.apiTimeout,
      mockData: env.useMockData,
    });
  }
};

validateConfig();
