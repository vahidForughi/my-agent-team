using Basket.Application.Mappers;
using Basket.Application.Queries;
using Basket.Application.Responses;
using Basket.Core.Entities;
using Basket.Core.Repositories;
using Common.Mediator;

namespace Basket.Application.Handlers;

public class GetBasketByUserNameHandler : IRequestHandler<GetBasketByUserNameQuery, ShoppingCartResponse>
{
    private readonly IBasketRepository _basketRepository;

    public GetBasketByUserNameHandler(IBasketRepository basketRepository)
    {
        _basketRepository = basketRepository;
    }

    public async Task<ShoppingCartResponse> Handle(GetBasketByUserNameQuery request,
        CancellationToken cancellationToken)
    {
        // GetBasket returns null when the user has no cart stored in Redis (e.g. a guest's
        // first visit). Fall back to an empty cart so callers get a valid, empty
        // ShoppingCartResponse instead of a NullReferenceException from the mapper.
        var shoppingCart = await _basketRepository.GetBasket(request.UserName)
                           ?? new ShoppingCart(request.UserName);
        return BasketMapper.Instance.ToShoppingCartResponse(shoppingCart);
    }
}