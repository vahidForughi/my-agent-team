import axios, {
  AxiosError,
  AxiosRequestHeaders,
  AxiosRequestTransformer,
  AxiosResponse,
  AxiosResponseTransformer,
  InternalAxiosRequestConfig,
} from 'axios';

export interface ErrorData {
  target: string;
  reason: string;
  message: string;
}

// Base URL from environment
const getBaseURL = (): string => {
  // Default to localhost for development
  return process.env.NX_API_BASE_URL || 'http://localhost:8010';
};

export const axiosClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding authentication token
axiosClient.interceptors.request.use(
  function (config) {
    const newConfig: InternalAxiosRequestConfig = {
      ...config,
      headers: { ...config.headers } as AxiosRequestHeaders,
    };

    // TODO: Add MSAL token when authentication is implemented
    // For now, we'll skip authentication for mock data
    // const token = getToken();
    // if (token) {
    //   newConfig.headers.Authorization = `Bearer ${token}`;
    // }

    return newConfig;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosClient.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  function (error: AxiosError) {
    const { status, config } = error.response || {};
    let customMessage = '';

    if (status === 401) {
      customMessage = `You have no access to perform such operation.`;

      if (config?.method === 'get') {
        // TODO: Implement logout and redirect to login
        // removeToken();
        // window.location.href = '/login';
        console.error('Unauthorized access:', customMessage);
      }
    } else if (status === 403) {
      customMessage = `You don't have permission to access this resource.`;
      console.error('Forbidden:', customMessage);
    } else if (status === 404) {
      customMessage = `Resource not found.`;
      console.error('Not found:', customMessage);
    } else if (status && status >= 500) {
      customMessage = `Server error occurred. Please try again later.`;
      console.error('Server error:', customMessage);
    }

    return Promise.reject(error);
  }
);

const transformRequestDefaults = axiosClient.defaults
  .transformRequest as AxiosRequestTransformer[];
const transformResponseDefaults = axiosClient.defaults
  .transformResponse as AxiosResponseTransformer[];

export { transformRequestDefaults, transformResponseDefaults };

