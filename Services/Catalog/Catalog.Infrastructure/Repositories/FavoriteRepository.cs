using Catalog.Core.Entities;
using Catalog.Core.Repositories;
using Catalog.Infrastructure.Data;
using MongoDB.Driver;

namespace Catalog.Infrastructure.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly ICatalogContext _context;

    public FavoriteRepository(ICatalogContext context)
    {
        _context = context;
    }

    public async Task<FavoriteProduct> AddFavoriteAsync(FavoriteProduct favorite)
    {
        await _context.Favorites.InsertOneAsync(favorite);
        return favorite;
    }

    public async Task<bool> RemoveFavoriteAsync(string favoriteId)
    {
        var result = await _context.Favorites.DeleteOneAsync(f => f.Id == favoriteId);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }

    public async Task<IEnumerable<FavoriteProduct>> GetFavoritesByUserNameAsync(string userName)
    {
        return await _context.Favorites
            .Find(f => f.UserName == userName)
            .ToListAsync();
    }

    public async Task<bool> IsFavoriteAsync(string userName, string productId)
    {
        return await _context.Favorites
            .Find(f => f.UserName == userName && f.ProductId == productId)
            .AnyAsync();
    }
}
