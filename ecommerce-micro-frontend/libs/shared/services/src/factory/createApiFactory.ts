import httpClient from '../lib/httpClient';
import { ApiMethod, ApiFactoryOptions, Request } from '../lib/types';
import { AxiosResponse } from 'axios';

export function createApiFactory(basePath: string) {
  return async function apiCall<TResponse = unknown, TDto = TResponse>(
    method: ApiMethod,
    endpoint: string | null,
    request?: Request,
    options?: ApiFactoryOptions<TResponse, TDto>
  ): Promise<TDto> {
    const {
      transformer,
      paramsSchema,
      responseSchema,
      useMock = false,
    } = options || {};

    // Validate params if schema provided
    if (paramsSchema && request?.params) {
      paramsSchema.parse(request.params);
    }

    // Construct URL
    const url = endpoint ? `${basePath}${endpoint}` : basePath;

    // Make API call
    let response: AxiosResponse<TResponse>;

    try {
      switch (method) {
        case 'GET':
          response = await httpClient.get<TResponse>(url, {
            params: request?.params,
            ...request?.config,
          });
          break;
        case 'POST':
          response = await httpClient.post<TResponse>(
            url,
            request?.params,
            request?.config
          );
          break;
        case 'PUT':
          response = await httpClient.put<TResponse>(
            url,
            request?.params,
            request?.config
          );
          break;
        case 'PATCH':
          response = await httpClient.patch<TResponse>(
            url,
            request?.params,
            request?.config
          );
          break;
        case 'DELETE':
          response = await httpClient.delete<TResponse>(url, {
            data: request?.params,
            ...request?.config,
          });
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      // Validate response if schema provided
      if (responseSchema) {
        responseSchema.parse(response.data);
      }

      // Transform response if transformer provided
      if (transformer) {
        return transformer(response.data);
      }

      return response.data as unknown as TDto;
    } catch (error) {
      console.error(`API call failed: ${method} ${url}`, error);
      throw error;
    }
  };
}

export default createApiFactory;

