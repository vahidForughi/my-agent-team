/**
 * HTTP Client Factory
 * Creates configured Axios instances with interceptors for auth, logging, and error handling
 */

import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '@ecommerce/shared/config';
import { AuthStorage } from '@ecommerce/shared/auth';
import { ApiErrorHandler } from './api-error.handler';
import type { ApiRequestConfig } from './http-client.types';

export interface HttpClientOptions {
  baseURL?: string;
  timeout?: number;
  useMock?: boolean;
}

export class HttpClientFactory {
  /**
   * Create a configured HTTP client instance
   */
  static create(options: HttpClientOptions = {}): AxiosInstance {
    const instance = axios.create({
      baseURL: options.baseURL || env.apiBaseUrl,
      timeout: options.timeout || env.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Skip auth if explicitly requested
        const customConfig = config as ApiRequestConfig;
        if (customConfig.skipAuth) {
          return config;
        }

        // Add authentication token if available
        const token = AuthStorage.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add username header for backend APIs that use userName parameter
        const username = AuthStorage.getCurrentUsername();
        if (username && config.headers) {
          config.headers['X-User-Name'] = username;
        }

        // Log request in development
        if (env.enableApiLogging) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful response in development
        if (env.enableApiLogging) {
          console.log('✅ API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      (error) => {
        // Log error response in development
        if (env.enableApiLogging) {
          console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Transform and throw standardized error
        return Promise.reject(ApiErrorHandler.handle(error));
      }
    );

    return instance;
  }

  /**
   * Create a client with mock data fallback
   */
  static createWithMock(
    options: HttpClientOptions = {},
    mockHandler?: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>
  ): AxiosInstance {
    const instance = this.create(options);

    // Add mock interceptor if enabled
    if (env.useMockData && mockHandler) {
      instance.interceptors.request.use(
        async (config) => {
          console.warn('🚧 Using mock data for:', config.url);
          const mockResponse = await mockHandler(config);
          // Bypass the actual request by throwing the mock response
          throw {
            config,
            response: mockResponse,
            isAxiosError: false,
            toJSON: () => ({}),
          };
        }
      );

      // Catch the "error" from mock interceptor and return as success
      instance.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response && !error.isAxiosError) {
            return Promise.resolve(error.response);
          }
          return Promise.reject(error);
        }
      );
    }

    return instance;
  }
}

/**
 * Default HTTP client instance for general use
 */
export const httpClient = HttpClientFactory.create();

/**
 * Helper to create typed API client
 */
export function createApiClient(
  baseURL?: string,
  options?: Omit<HttpClientOptions, 'baseURL'>
): AxiosInstance {
  return HttpClientFactory.create({ ...options, baseURL });
}
