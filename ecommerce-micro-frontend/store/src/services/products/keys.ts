import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import { StoreParams } from './types';

const createProductKeys = createCacheKeyWithScope('_product');

export const productKeys = {
  getAll: createCacheSection((input?: StoreParams) =>
    createProductKeys(['products', input])
  ),
  getById: createCacheSection((id?: string) =>
    createProductKeys(['product', id])
  ),
  getBrands: createCacheSection(() => createProductKeys(['brands'])),
  getTypes: createCacheSection(() => createProductKeys(['types'])),
};

