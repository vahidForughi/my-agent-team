import { axiosClient } from '../httpClient';
import { API_CONFIG } from '../../config';
import { getStoredUser } from '@ecommerce-platform/auth-provider';
import { mapShoppingCartToBasket, createEmptyBasket } from './mappers';
import { shoppingCartResponseSchema } from './schemas';
import type {
  ShoppingCartResponse,
  Basket,
  AddToCartRequest,
  GetBasketRequest,
} from './types';

/**
 * Get current basket for a user
 */
export async function getBasket(request?: GetBasketRequest): Promise<Basket> {
  let userName = request?.userName;
  if (!userName) {
    const storedUser = getStoredUser();
    userName =
      storedUser?.email || storedUser?.displayName || storedUser?.id || 'guest';
  }
  const url = API_CONFIG.BASKET.GET_BASKET(userName);

  try {
    const response = await axiosClient.get<ShoppingCartResponse>(url);

    // Handle 204 No Content - basket doesn't exist yet
    if (response.status === 204) {
      console.log(
        '[Basket API] No basket exists yet (204), returning empty basket'
      );
      return createEmptyBasket(userName);
    }

    // Handle empty or null responses
    const data = response.data as unknown;
    if (!data || data === '' || typeof data === 'string') {
      console.log('[Basket API] Empty response, returning empty basket');
      return createEmptyBasket(userName);
    }

    const parseResult = shoppingCartResponseSchema.safeParse(data);
    if (!parseResult.success) {
      console.warn('[Basket API] Invalid response format:', parseResult.error);
      return createEmptyBasket(userName);
    }

    return mapShoppingCartToBasket(parseResult.data);
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404 || status === 204) {
      console.log(
        `[Basket API] Basket not found (${status}), returning empty basket`
      );
      return createEmptyBasket(userName);
    }
    console.error('[Basket API] Error fetching basket:', error);
    return createEmptyBasket(userName);
  }
}

/**
 * Add item to basket (creates basket if not exists, updates quantity if item exists)
 * @param request - AddToCartRequest with product info
 * @param currentBasket - Optional current basket to avoid extra API call. If not provided, will fetch from API.
 * @param userName - Optional username. If not provided, will get from storage (fallback to 'guest')
 */
export async function addToCart(
  request: AddToCartRequest,
  currentBasket?: Basket,
  userName?: string
): Promise<Basket> {
  // Use provided userName or get from storage - fallback to 'guest'
  const user =
    userName ||
    (() => {
      const storedUser = getStoredUser();
      return (
        storedUser?.email ||
        storedUser?.displayName ||
        storedUser?.id ||
        'guest'
      );
    })();
  const url = API_CONFIG.BASKET.CREATE_BASKET;

  console.log('[Basket API] addToCart - userName:', user);

  // Get current basket first (only if not provided)
  const basket = currentBasket || (await getBasket({ userName: user }));

  // Check if item already exists
  const existingItemIndex = basket.items.findIndex(
    (item) => item.productId === request.productId
  );

  const updatedItems = [...basket.items];

  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    updatedItems[existingItemIndex] = {
      ...updatedItems[existingItemIndex],
      quantity: updatedItems[existingItemIndex].quantity + request.quantity,
      itemTotal:
        (updatedItems[existingItemIndex].quantity + request.quantity) *
        updatedItems[existingItemIndex].price,
    };
  } else {
    // Add new item
    updatedItems.push({
      productId: request.productId,
      productName: request.productName,
      price: request.price,
      originalPrice: request.originalPrice ?? request.price,
      discountAmount: 0,
      quantity: request.quantity,
      imageFile: request.imageFile ?? null,
      itemTotal: request.price * request.quantity,
    });
  }

  // Prepare payload for backend (PascalCase - backend expects this)
  const payload = {
    UserName: user,
    Items: updatedItems.map((item) => ({
      ProductId: item.productId,
      ProductName: item.productName,
      Price: item.price,
      OriginalPrice: item.originalPrice,
      DiscountAmount: item.discountAmount,
      Quantity: item.quantity,
      ImageFile: item.imageFile,
    })),
  };

  try {
    console.log(
      '[Basket API] Sending payload:',
      JSON.stringify(payload, null, 2)
    );
    const response = await axiosClient.post<ShoppingCartResponse>(url, payload);
    console.log(
      '[Basket API] Response:',
      JSON.stringify(response.data, null, 2)
    );

    const parseResult = shoppingCartResponseSchema.safeParse(response.data);
    if (!parseResult.success) {
      console.warn(
        '[Basket API] Response validation failed:',
        parseResult.error
      );
      // Return the basket we expected to create
      const totalPrice = updatedItems.reduce(
        (sum, item) => sum + item.itemTotal,
        0
      );
      return {
        userName: user,
        items: updatedItems,
        totalPrice,
        itemCount: updatedItems.length,
        isEmpty: updatedItems.length === 0,
      };
    }

    return mapShoppingCartToBasket(parseResult.data);
  } catch (error) {
    console.error('[Basket API] Error adding to cart:', error);
    throw error;
  }
}
