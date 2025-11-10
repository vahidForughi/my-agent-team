import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import type { GetCartRequest } from './types';

const createCartKeys = createCacheKeyWithScope('_cart');

export const cartKeys = {
  get: createCacheSection((input?: GetCartRequest) =>
    createCartKeys(['get', input?.userId])
  ),

  all: createCartKeys(['all']),
  detail: (userId?: string) => createCartKeys(['get', userId]),
};
