using Common.Mediator;

namespace Catalog.Application.Commands;

public class RemoveFavoriteCommand : IRequest<bool>
{
    public string FavoriteId { get; set; }

    public RemoveFavoriteCommand(string favoriteId)
    {
        FavoriteId = favoriteId;
    }
}
