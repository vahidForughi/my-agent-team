using Catalog.Application.Commands;
using Catalog.Core.Repositories;
using Common.Mediator;

namespace Catalog.Application.Handlers;

public class RemoveFavoriteHandler : IRequestHandler<RemoveFavoriteCommand, bool>
{
    private readonly IFavoriteRepository _favoriteRepository;

    public RemoveFavoriteHandler(IFavoriteRepository favoriteRepository)
    {
        _favoriteRepository = favoriteRepository;
    }

    public async Task<bool> Handle(RemoveFavoriteCommand request, CancellationToken cancellationToken)
    {
        return await _favoriteRepository.RemoveFavoriteAsync(request.FavoriteId);
    }
}
