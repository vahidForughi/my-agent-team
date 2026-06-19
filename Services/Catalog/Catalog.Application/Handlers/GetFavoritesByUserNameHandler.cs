using Catalog.Application.Queries;
using Catalog.Application.Responses;
using Catalog.Core.Repositories;
using Common.Mediator;

namespace Catalog.Application.Handlers;

public class GetFavoritesByUserNameHandler : IRequestHandler<GetFavoritesByUserNameQuery, IEnumerable<FavoriteProductResponse>>
{
    private readonly IFavoriteRepository _favoriteRepository;

    public GetFavoritesByUserNameHandler(IFavoriteRepository favoriteRepository)
    {
        _favoriteRepository = favoriteRepository;
    }

    public async Task<IEnumerable<FavoriteProductResponse>> Handle(GetFavoritesByUserNameQuery request, CancellationToken cancellationToken)
    {
        var favorites = await _favoriteRepository.GetFavoritesByUserNameAsync(request.UserName);

        return favorites.Select(f => new FavoriteProductResponse
        {
            Id = f.Id,
            UserName = f.UserName,
            ProductId = f.ProductId,
            ProductName = f.ProductName,
            ProductImageUrl = f.ProductImageUrl,
            CreatedAt = f.CreatedAt
        });
    }
}
