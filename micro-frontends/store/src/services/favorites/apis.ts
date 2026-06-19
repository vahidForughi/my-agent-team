import { createApiFactory } from '../factory/createApiFactory';
import { FavoriteProductResponse, favoritesArraySchema, favoriteProductResponseSchema } from './schemas';

export const apiFactory = createApiFactory('/Catalog', { version: '' });

export async function getFavoritesByUserName(userName: string) {
  return apiFactory<FavoriteProductResponse[]>(
    'GET',
    '/favorites/:userName',
    { params: { userName } },
    {
      responseSchema: favoritesArraySchema,
    }
  );
}

export async function addFavorite(payload: {
  userName: string;
  productId: string;
  productName: string;
  productImageUrl?: string | null;
}) {
  return apiFactory<FavoriteProductResponse>(
    'POST',
    '/favorites',
    { payload },
    {
      responseSchema: favoriteProductResponseSchema,
    }
  );
}

export async function removeFavorite(favoriteId: string) {
  return apiFactory<null>(
    'DELETE',
    '/favorites/:favoriteId',
    { params: { favoriteId } }
  );
}
