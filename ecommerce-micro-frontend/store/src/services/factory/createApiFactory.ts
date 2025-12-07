import { Method } from 'axios';
import { ZodType } from 'zod';

import { buildPath } from '../helpers/buildPath';
import { filterUsedKeys } from '../helpers/filterUsedKeys';
import { mergeHeaderLocale } from '../helpers/mergeHeaderLocale';
import { parseParams, parseResponse } from '../helpers/validations';
import { axiosClient } from '../httpClient';
import {
  ApiResponse,
  ApiResult,
  Nullable,
  Request,
  RequestParams,
  RequestPayload,
} from '../types';
import { isApiErrorResponse } from '../utils/common';

export type ApiFactoryOptions<TResponse, TTransformed = TResponse> = {
  transformer?: (data: TResponse) => Nullable<TTransformed>;
  useMock?: boolean;
  paramsSchema?: ZodType<unknown>;
  responseSchema?: ZodType<unknown>;
  [key: PropertyKey]: unknown;
};

type CreateApiFactoryOptions = {
  version?: string;
};

/**
 * Determines the base URL based on mock mode
 *
 * @param useMock - Whether to use mock API
 * @param defaultBaseURL - Default base URL from axios client
 * @returns Appropriate base URL for mock, or undefined to use axios default
 */
function getBaseURL(useMock: boolean, defaultBaseURL: string): string | undefined {
  return useMock ? '/api' : undefined; // Return undefined to use axios client's configured baseURL
}

/**
 * Creates an API factory function for making HTTP requests with validation and transformation
 *
 * This factory provides:
 * - Automatic request/response validation using Zod schemas
 * - Data transformation via mapper functions
 * - Mock API support for development/testing
 * - URL parameter interpolation
 * - Consistent error handling
 *
 * @param rootEndpoint - Base endpoint path (e.g., '/Catalog', '/Orders')
 * @param options - Configuration options
 * @param options.version - API version prefix (defaults to 'v1')
 *
 * @returns API factory function for making requests
 *
 * @example
 * ```typescript
 * // Create factory for product endpoints
 * const apiFactory = createApiFactory('/Catalog');
 *
 * // Make GET request with query params
 * const products = await apiFactory('GET', '/GetAllProducts', {
 *   params: { page: 1, limit: 10 }
 * }, {
 *   transformer: productMapper.toListDto,
 *   paramsSchema: listProductsInput
 * });
 *
 * // Make POST request with payload
 * const newProduct = await apiFactory('POST', '/CreateProduct', {
 *   payload: { name: 'New Product', price: 99.99 }
 * }, {
 *   transformer: productMapper.toDto,
 *   payloadSchema: createProductSchema
 * });
 * ```
 */
export function createApiFactory(
  rootEndpoint: string,
  options: CreateApiFactoryOptions = { version: 'v1' }
) {
  const { version = 'v1' } = options;

  return async function <
    TResponse,
    TTransformed = TResponse,
    Options extends ApiFactoryOptions<
      TResponse,
      TTransformed
    > = ApiFactoryOptions<TResponse, TTransformed>,
    TParams extends RequestParams = RequestParams,
    TPayload extends RequestPayload = RequestPayload
  >(
    method: Method | string,
    path: `/${string}` | null,
    request?: Request<TParams, TPayload>,
    options?: Options
  ): Promise<Nullable<ApiResponse<TTransformed>>> {
    const { params = {}, payload = {} } = request ?? {};

    const { finalPath: processedRootEndpoint, usedKeys: rootPathUsedKeys } =
      buildPath(rootEndpoint, params, payload);

    const pathSegment = path ?? '';
    const { finalPath: processedPathSegment, usedKeys: segmentPathUsedKeys } =
      buildPath(pathSegment, params, payload);

    const finalUrlPath = processedRootEndpoint + processedPathSegment;

    const allKeysUsedInPath = new Set<string>([
      ...rootPathUsedKeys,
      ...segmentPathUsedKeys,
    ]);

    const defaultBaseURL = axiosClient.defaults.baseURL ?? '';
    const baseURL = getBaseURL(options?.useMock ?? false, defaultBaseURL);

    console.log('[createApiFactory] Request:', {
      endpoint: finalUrlPath,
      useMock: options?.useMock ?? false,
      baseURL,
      axiosDefaultBaseURL: defaultBaseURL,
    });

    const cleanPath = finalUrlPath.startsWith('/')
      ? finalUrlPath.slice(1)
      : finalUrlPath;

    const url = options?.useMock
      ? `${version}/mock/${cleanPath}`
      : cleanPath; // Real API doesn't need version prefix

    const headers = mergeHeaderLocale(request);

    let validParams;

    if (options?.paramsSchema) {
      validParams = parseParams(params, options.paramsSchema);
    } else {
      validParams = params;
    }

    const filteredParams = filterUsedKeys(
      validParams as Record<PropertyKey, unknown>,
      allKeysUsedInPath
    );
    const filteredPayload = filterUsedKeys(
      payload as Record<PropertyKey, unknown>,
      allKeysUsedInPath
    );

    // Build axios config, only include baseURL if it's defined (for mock mode)
    const axiosConfig: Record<string, unknown> = {
      method,
      url,
      headers,
      params: {
        ...filteredParams,
      },
      data: filteredPayload,
      ...request?.options,
    };

    // Only override baseURL for mock mode, otherwise use axios client's default
    if (baseURL !== undefined) {
      axiosConfig.baseURL = baseURL;
    }

    const response = await axiosClient<ApiResult<TResponse>>(axiosConfig).then((res) => res.data);

    let validResponse: Nullable<ApiResult<TResponse>>;

    if (isApiErrorResponse(response)) {
      console.error('[API Error]', response.error.message);
      const error = new Error(
        `API Error: ${response.error.message} (${response.error.code})`
      ) as Error & { cause?: typeof response };
      error.cause = response;
      throw error;
    }

    if (options?.responseSchema) {
      validResponse = parseResponse(
        response,
        options.responseSchema
      ) as Nullable<ApiResult<TResponse>>;
    } else {
      validResponse = response;
    }

    if (validResponse === null && method !== 'DELETE') {
      console.error('Parsed response is null or invalid format');
      throw new Error('Parsed response is null or invalid format');
    }

    let transformedData = validResponse as unknown as Nullable<
      ApiResponse<TTransformed>
    >;

    if (typeof options?.transformer === 'function' && validResponse) {
      const transformed = options.transformer(validResponse as TResponse);
      if (transformed === null || transformed === undefined) {
        throw new Error('Transformed data cannot be null or undefined');
      }

      transformedData = transformed;
    }

    return transformedData;
  };
}
