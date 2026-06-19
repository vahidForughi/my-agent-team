using Catalog.Core.Entities;

namespace Catalog.Core.Repositories;

public interface IFavoriteRepository
{
    Task<FavoriteProduct> AddFavoriteAsync(FavoriteProduct favorite);
    Task<bool> RemoveFavoriteAsync(string favoriteId);
    Task<IEnumerable<FavoriteProduct>> GetFavoritesByUserNameAsync(string userName);
    Task<bool> IsFavoriteAsync(string userName, string productId);
}
