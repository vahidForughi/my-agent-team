import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as apis from './apis';
import { favoriteKeys } from './keys';

export function useFavoritesByUserName(userName: string | undefined) {
  return useQuery({
    queryKey: favoriteKeys.byUserName.create(userName),
    queryFn: async () => {
      if (!userName) return { data: [] };
      const result = await apis.getFavoritesByUserName(userName);
      return result ?? { data: [] };
    },
    enabled: !!userName,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ favoriteId }: { favoriteId: string; userName: string }) =>
      apis.removeFavorite(favoriteId),
    onSuccess: (_data, variables) => {
      favoriteKeys.byUserName.invalidateQueries(queryClient, variables.userName);
    },
  });
}
