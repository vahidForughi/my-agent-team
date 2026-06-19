import * as products from './products/apis';
import * as basket from './basket/apis';
import * as favorites from './favorites/apis';

export const storeClient = {
  products,
  basket,
  favorites,
};

export * from './cache-keys';
