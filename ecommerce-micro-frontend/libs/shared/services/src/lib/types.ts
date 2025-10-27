import { AxiosRequestConfig } from 'axios';
import { z } from 'zod';

export interface Request<P = unknown> {
  params?: P;
  config?: AxiosRequestConfig;
}

export interface ApiFactoryOptions<TResponse, TDto> {
  transformer?: (data: TResponse) => TDto;
  paramsSchema?: z.ZodSchema;
  responseSchema?: z.ZodSchema;
  useMock?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

