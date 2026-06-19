using Catalog.Application.Responses;
using Common.Mediator;

namespace Catalog.Application.Commands;

public class AddFavoriteCommand : IRequest<FavoriteProductResponse>
{
    public string UserName { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
}
