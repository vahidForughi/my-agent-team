import { z } from 'zod';

export const favoriteProductResponseSchema = z.object({
  id: z.string(),
  userName: z.string(),
  productId: z.string(),
  productName: z.string(),
  productImageUrl: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type FavoriteProductResponse = z.infer<typeof favoriteProductResponseSchema>;
export const favoritesArraySchema = z.array(favoriteProductResponseSchema);
export type FavoritesArray = z.infer<typeof favoritesArraySchema>;
