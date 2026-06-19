import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';

const createFavoriteKeys = createCacheKeyWithScope('_favorites');

export const favoriteKeys = {
  byUserName: createCacheSection((userName?: string) =>
    createFavoriteKeys(['favorites', userName])
  ),
};
