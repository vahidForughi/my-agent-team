import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storeClient } from '@services/index';
import { favoriteKeys } from './keys';

export function useFavoritesByUserName(userName: string | undefined) {
  return useQuery({
    queryKey: favoriteKeys.byUserName.create(userName),
    queryFn: () => storeClient.favorites.getFavoritesByUserName(userName!),
    enabled: !!userName,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      userName: string;
      productId: string;
      productName: string;
      productImageUrl?: string | null;
    }) => storeClient.favorites.addFavorite(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: favoriteKeys.byUserName.create(variables.userName),
      });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ favoriteId }: { favoriteId: string; userName: string }) =>
      storeClient.favorites.removeFavorite(favoriteId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: favoriteKeys.byUserName.create(variables.userName),
      });
    },
  });
}
