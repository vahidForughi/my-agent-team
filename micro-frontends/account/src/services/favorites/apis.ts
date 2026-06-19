import { createApiFactory } from '../factory/createApiFactory';
import { favoritesArraySchema, favoriteProductResponseSchema } from './schemas';
import type { FavoriteProductResponse } from './schemas';

export const apiFactory = createApiFactory('/Catalog', { version: '' });

export async function getFavoritesByUserName(
  userName: string
): Promise<{ data: FavoriteProductResponse[] } | null> {
  try {
    const result = await apiFactory<FavoriteProductResponse[], FavoriteProductResponse[]>(
      'GET',
      `/favorites/:userName`,
      { params: { userName } },
      {
        transformer: (response) => {
          if (!response || !Array.isArray(response)) {
            return [];
          }
          const favorites: FavoriteProductResponse[] = [];
          for (const item of response) {
            const validatedItem = favoriteProductResponseSchema.parse(item);
            favorites.push(validatedItem);
          }
          return favorites;
        },
        responseSchema: favoritesArraySchema,
      }
    );

    return result ?? { data: [] };
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.response?.status;
    if (status === 404) {
      console.log('[Favorites API] No favorites found (404), returning empty array');
      return { data: [] };
    }

    console.error('[Favorites API] Error fetching favorites:', error);
    return { data: [] };
  }
}

export async function removeFavorite(favoriteId: string): Promise<void> {
  await apiFactory(
    'DELETE',
    `/favorites/:favoriteId`,
    { params: { favoriteId } },
  );
}
