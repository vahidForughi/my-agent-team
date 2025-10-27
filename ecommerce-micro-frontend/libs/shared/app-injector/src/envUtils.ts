import { Environment } from './types';

export const ECOMMERCE_PRD_HOSTNAME = 'ecommerce.example.com';
export const ECOMMERCE_STG_HOSTNAME = 'ecommerce.staging.example.com';
export const ECOMMERCE_DEV_HOSTNAME = 'localhost';

/**
 * Check if running in production environment
 */
export const isProductionEnv = (): boolean =>
  window?.location?.hostname === ECOMMERCE_PRD_HOSTNAME;

/**
 * Check if running in staging environment
 */
export const isStagingEnv = (): boolean =>
  window?.location?.hostname === ECOMMERCE_STG_HOSTNAME;

/**
 * Check if running in development environment
 */
export const isDevelopmentEnv = (): boolean =>
  window?.location?.hostname === ECOMMERCE_DEV_HOSTNAME ||
  window?.location?.hostname.includes('localhost');

/**
 * Get current environment
 */
export const getEnvironment = (): Environment => {
  if (isProductionEnv()) return 'production';
  if (isStagingEnv()) return 'staging';
  return 'development';
};

/**
 * Check if running in ecommerce app
 */
export const isEcommerceApp = (): boolean =>
  [ECOMMERCE_PRD_HOSTNAME, ECOMMERCE_STG_HOSTNAME, ECOMMERCE_DEV_HOSTNAME].some(
    (hostname) => window.location.hostname.includes(hostname)
  );

/**
 * Get API base URL based on environment
 */
export const getApiBaseUrl = (): string => {
  const env = getEnvironment();

  const apiUrls = {
    production: 'https://api.ecommerce.example.com',
    staging: 'https://api.staging.ecommerce.example.com',
    development: 'http://localhost:3000/api',
  };

  return apiUrls[env];
};
