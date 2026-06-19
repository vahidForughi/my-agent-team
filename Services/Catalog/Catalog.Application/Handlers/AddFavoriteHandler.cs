using Catalog.Application.Commands;
using Catalog.Application.Responses;
using Catalog.Core.Entities;
using Catalog.Core.Repositories;
using Common.Mediator;

namespace Catalog.Application.Handlers;

public class AddFavoriteHandler : IRequestHandler<AddFavoriteCommand, FavoriteProductResponse>
{
    private readonly IFavoriteRepository _favoriteRepository;

    public AddFavoriteHandler(IFavoriteRepository favoriteRepository)
    {
        _favoriteRepository = favoriteRepository;
    }

    public async Task<FavoriteProductResponse> Handle(AddFavoriteCommand request, CancellationToken cancellationToken)
    {
        var favorite = new FavoriteProduct
        {
            UserName = request.UserName,
            ProductId = request.ProductId,
            ProductName = request.ProductName,
            ProductImageUrl = request.ProductImageUrl,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _favoriteRepository.AddFavoriteAsync(favorite);

        return new FavoriteProductResponse
        {
            Id = created.Id,
            UserName = created.UserName,
            ProductId = created.ProductId,
            ProductName = created.ProductName,
            ProductImageUrl = created.ProductImageUrl,
            CreatedAt = created.CreatedAt
        };
    }
}
