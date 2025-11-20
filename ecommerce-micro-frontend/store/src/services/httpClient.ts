import axios, {
  AxiosError,
  AxiosRequestHeaders,
  AxiosRequestTransformer,
  AxiosResponse,
  AxiosResponseTransformer,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * Error data structure for API errors
 */
export interface ErrorData {
  target: string;
  reason: string;
  message: string;
}

/**
 * Get API base URL from environment
 * Ensures URL always ends with '/api' for consistency
 *
 * @returns Base URL with '/api' suffix
 *
 * @example
 * // If NX_API_BASE_URL = 'http://localhost:5032'
 * // Returns: 'http://localhost:5032/api'
 *
 * // If NX_API_BASE_URL = 'http://localhost:5032/api'
 * // Returns: 'http://localhost:5032/api' (unchanged)
 */
const getBaseURL = (): string => {
  const DEFAULT_BASE_URL = 'http://localhost:5032';
  const envBaseURL = process.env.NX_API_BASE_URL || DEFAULT_BASE_URL;
  const HAS_API_SUFFIX = envBaseURL.endsWith('/api');

  return HAS_API_SUFFIX ? envBaseURL : `${envBaseURL}/api`;
};

/**
 * Axios HTTP client for Store API
 *
 * Pre-configured with:
 * - Base URL from environment variable
 * - 60-second timeout
 * - JSON content-type headers
 * - Request/response interceptors for error handling
 *
 * @example
 * ```typescript
 * const response = await axiosClient.get('/v1/Catalog/GetAllProducts');
 * const data = response.data;
 * ```
 */
export const axiosClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 *
 * Currently passes through requests unchanged.
 * Future enhancements:
 * - Add authentication tokens
 * - Add request logging
 * - Add correlation IDs
 */
axiosClient.interceptors.request.use(
  function (config) {
    const newConfig: InternalAxiosRequestConfig = {
      ...config,
      headers: { ...config.headers } as AxiosRequestHeaders,
    };

    // TODO: Add authentication token injection when auth is implemented
    // const token = getAuthToken();
    // if (token) {
    //   newConfig.headers.Authorization = `Bearer ${token}`;
    // }

    return newConfig;
  },
  function (error) {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 *
 * Handles HTTP error responses and logs appropriate messages:
 * - 401: Unauthorized access
 * - 403: Forbidden (permission denied)
 * - 404: Resource not found
 * - 5xx: Server errors
 *
 * Errors are logged to console and then re-thrown for handling by callers.
 */
axiosClient.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  function (error: AxiosError) {
    const { status, config } = error.response || {};
    let customMessage = '';

    if (status === 401) {
      customMessage = 'You have no access to perform such operation.';

      if (config?.method === 'get') {
        console.error('Unauthorized access:', customMessage);
      }
    } else if (status === 403) {
      customMessage = "You don't have permission to access this resource.";
      console.error('Forbidden:', customMessage);
    } else if (status === 404) {
      customMessage = 'Resource not found.';
      console.error('Not found:', customMessage);
    } else if (status && status >= 500) {
      customMessage = 'Server error occurred. Please try again later.';
      console.error('Server error:', customMessage);
    }

    return Promise.reject(error);
  }
);

/**
 * Default request transformers from Axios
 * Exported for custom request transformation if needed
 */
const transformRequestDefaults = axiosClient.defaults
  .transformRequest as AxiosRequestTransformer[];

/**
 * Default response transformers from Axios
 * Exported for custom response transformation if needed
 */
const transformResponseDefaults = axiosClient.defaults
  .transformResponse as AxiosResponseTransformer[];

export { transformRequestDefaults, transformResponseDefaults };
