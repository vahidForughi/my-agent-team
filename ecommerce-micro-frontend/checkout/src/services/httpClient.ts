/**
 * HTTP Client for Checkout Micro-Frontend
 * Configured with shared authentication, error handling, and logging
 */

import { HttpClientFactory } from '@ecommerce/shared/http-client';
import { env } from '@ecommerce/shared/config';

/**
 * Default HTTP client for Checkout app
 * - Uses shared configuration from .env files
 * - Includes authentication interceptors
 * - Centralized error handling
 * - API logging in development mode
 */
export const httpClient = HttpClientFactory.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
});

/**
 * Legacy export for backward compatibility
 */
export const axiosClient = httpClient;
export default httpClient;
