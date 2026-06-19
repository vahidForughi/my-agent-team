using Catalog.Application.Responses;
using Common.Mediator;

namespace Catalog.Application.Queries;

public class GetFavoritesByUserNameQuery : IRequest<IEnumerable<FavoriteProductResponse>>
{
    public string UserName { get; set; }

    public GetFavoritesByUserNameQuery(string userName)
    {
        UserName = userName;
    }
}
