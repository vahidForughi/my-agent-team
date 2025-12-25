/**
 * Cart/Basket API Service
 * Integrates with backend Basket API endpoints
 */

import { axiosClient } from '../httpClient';
import { API_CONFIG } from '../../config';
import { mapCart } from './mappers';
import { shoppingCartResponseSchema } from './schemas';
import type {
  GetCartRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
  ClearCartRequest,
  CheckoutRequest,
  ShoppingCartResponse,
  Cart,
  CartItem,
} from './types';

/**
 * Backend item format (PascalCase) - backend accepts PascalCase in requests
 */
interface BackendCartItem {
  ProductId: string;
  ProductName: string;
  Price: number;
  OriginalPrice: number;
  DiscountAmount: number;
  Quantity: number;
  ImageFile?: string | null;
}

/**
 * Helper to convert frontend CartItem to backend format (PascalCase)
 * Note: Backend accepts PascalCase in requests but returns camelCase in responses
 */
function toBackendItem(item: CartItem): BackendCartItem {
  return {
    ProductId: item.productId,
    ProductName: item.productName,
    Price: item.price,
    OriginalPrice: item.originalPrice,
    DiscountAmount: item.discountAmount,
    Quantity: item.quantity,
    ImageFile: item.imageFile ?? null,
  };
}

/**
 * Create an empty cart for a user
 */
function createEmptyCart(userName: string): { data: Cart } {
  return {
    data: {
      userName,
      items: [],
      totalPrice: 0,
      itemCount: 0,
      isEmpty: true,
    },
  };
}

/**
 * Get cart/basket for current user
 * @param request - Request object with userName. If not provided, defaults to 'guest'
 */
export async function getCart(request?: {
  params?: GetCartRequest;
}): Promise<{ data: Cart } | null> {
  // userName should be passed from the hook using useAuth()
  const userName = request?.params?.userName || 'guest';
  const url = API_CONFIG.BASKET.GET_BASKET(userName);

  try {
    const response = await axiosClient.get<ShoppingCartResponse>(url);

    // Handle 204 No Content - basket doesn't exist yet
    if (response.status === 204) {
      console.log(
        '[Cart API] No basket exists yet (204), returning empty cart'
      );
      return createEmptyCart(userName);
    }

    // Handle empty or null responses (backend may return "" or null when basket doesn't exist)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = response.data as any;
    if (!data || data === '' || typeof data === 'string') {
      console.log('[Cart API] Empty response, returning empty cart');
      return createEmptyCart(userName);
    }

    // Validate response with Zod schema
    const parseResult = shoppingCartResponseSchema.safeParse(response.data);

    if (!parseResult.success) {
      console.warn('[Cart API] Invalid response format:', parseResult.error);
      return createEmptyCart(userName);
    }

    // Transform to frontend Cart format
    const cart = mapCart(parseResult.data);

    if (!cart) {
      return createEmptyCart(userName);
    }

    return { data: cart };
  } catch (error) {
    // Return empty cart if basket doesn't exist (404 or 204)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.response?.status;
    if (status === 404 || status === 204) {
      console.log(
        `[Cart API] Basket not found (${status}), returning empty cart`
      );
      return createEmptyCart(userName);
    }

    // Log other errors but return empty cart to not crash the app
    console.error('[Cart API] Error fetching cart:', error);
    return createEmptyCart(userName);
  }
}

/**
 * Add item to cart (creates or updates basket)
 * @param request - AddToCartRequest with product info and userName
 * @param currentCart - Optional current cart data from cache to avoid extra API call
 */
export async function addToCart(
  request: {
    payload: AddToCartRequest & { userName?: string };
  },
  currentCart?: { data: Cart } | null
): Promise<{ data: Cart } | null> {
  // userName should be passed from the hook using useAuth()
  const userName = request.payload.userName || 'guest';
  const url = API_CONFIG.BASKET.CREATE_BASKET;

  // Use provided currentCart or fetch if not available
  let currentItems = currentCart?.data?.items || [];

  // If no currentCart provided, fetch from API (fallback)
  if (!currentCart) {
    const fetchedCart = await getCart({ params: { userName } });
    currentItems = fetchedCart?.data?.items || [];
  }

  // Check if item already exists
  const existingItemIndex = currentItems.findIndex(
    (item) => item.productId === request.payload.productId
  );

  // Build items array for backend
  let backendItems: BackendCartItem[];

  if (existingItemIndex >= 0) {
    // Update quantity if item exists
    backendItems = currentItems.map((item, index) => {
      const newQuantity =
        index === existingItemIndex
          ? item.quantity + request.payload.quantity
          : item.quantity;
      return toBackendItem({
        ...item,
        quantity: newQuantity,
      });
    });
  } else {
    // Add new item
    const newItem: BackendCartItem = {
      ProductId: request.payload.productId,
      ProductName: request.payload.productName,
      Price: request.payload.price,
      OriginalPrice: request.payload.originalPrice ?? request.payload.price,
      DiscountAmount: 0,
      Quantity: request.payload.quantity,
      ImageFile: request.payload.imageFile ?? null,
    };

    backendItems = [
      ...currentItems.map((item) => toBackendItem(item)),
      newItem,
    ];
  }

  // Send to backend (PascalCase payload)
  const payload = {
    UserName: userName,
    Items: backendItems,
  };

  const response = await axiosClient.post<ShoppingCartResponse>(url, payload);

  // Validate and transform response (camelCase from backend)
  const validatedData = shoppingCartResponseSchema.parse(response.data);
  const cart = mapCart(validatedData);

  if (!cart) {
    return null;
  }

  return { data: cart };
}

/**
 * Update cart item quantity
 * @param request - UpdateCartItemRequest with product info and userName
 * @param currentCart - Optional current cart data from cache to avoid extra API call
 */
export async function updateCartItem(
  request: {
    payload: UpdateCartItemRequest & { userName?: string };
  },
  currentCart?: { data: Cart } | null
): Promise<{ data: Cart } | null> {
  // userName should be passed from the hook using useAuth()
  const userName = request.payload.userName || 'guest';
  const url = API_CONFIG.BASKET.CREATE_BASKET;

  // Use provided currentCart or fetch if not available
  let currentItems = currentCart?.data?.items || [];

  // If no currentCart provided, fetch from API (fallback)
  if (!currentCart) {
    const fetchedCart = await getCart({ params: { userName } });
    currentItems = fetchedCart?.data?.items || [];
  }

  // Update item quantity (filter out if quantity is 0 or less)
  const updatedItems = currentItems
    .map((item) => {
      if (item.productId === request.payload.productId) {
        if (request.payload.quantity <= 0) {
          return null;
        }
        return { ...item, quantity: request.payload.quantity };
      }
      return item;
    })
    .filter((item): item is CartItem => item !== null);

  // Send to backend (PascalCase payload)
  const payload = {
    UserName: userName,
    Items: updatedItems.map((item) => toBackendItem(item)),
  };

  const response = await axiosClient.post<ShoppingCartResponse>(url, payload);

  // Validate and transform response
  const validatedData = shoppingCartResponseSchema.parse(response.data);
  const cart = mapCart(validatedData);

  if (!cart) {
    return null;
  }

  return { data: cart };
}

/**
 * Remove item from cart
 * @param request - RemoveCartItemRequest with productId and userName
 * @param currentCart - Optional current cart data from cache to avoid extra API call
 */
export async function removeCartItem(
  request: {
    payload: RemoveCartItemRequest & { userName?: string };
  },
  currentCart?: { data: Cart } | null
): Promise<{ data: Cart } | null> {
  // Remove by setting quantity to 0
  return updateCartItem(
    {
      payload: {
        productId: request.payload.productId,
        quantity: 0,
        userName: request.payload.userName,
      },
    },
    currentCart
  );
}

/**
 * Clear entire cart
 * @param request - ClearCartRequest with userName. If not provided, defaults to 'guest'
 */
export async function clearCart(request?: {
  payload?: ClearCartRequest;
}): Promise<{ data: Cart } | null> {
  // userName should be passed from the hook using useAuth()
  const userName = request?.payload?.userName || 'guest';
  const url = API_CONFIG.BASKET.DELETE_BASKET(userName);

  await axiosClient.delete(url);

  // Return empty cart
  return {
    data: {
      userName,
      items: [],
      totalPrice: 0,
      itemCount: 0,
      isEmpty: true,
    },
  };
}

/**
 * Checkout cart (creates order from basket)
 * @param request - CheckoutRequest with order info and userName
 */
export async function checkout(request: {
  payload: CheckoutRequest & { userName?: string };
}): Promise<{ success: boolean; orderId?: number }> {
  // userName should be passed from the hook using useAuth()
  const userName = request.payload.userName || 'guest';
  const url = API_CONFIG.BASKET.CHECKOUT;

  // Transform to backend PascalCase format
  const payload = {
    UserName: userName,
    TotalPrice: request.payload.totalPrice,
    FirstName: request.payload.firstName,
    LastName: request.payload.lastName,
    EmailAddress: request.payload.emailAddress,
    AddressLine: request.payload.addressLine,
    Country: request.payload.country,
    State: request.payload.state,
    ZipCode: request.payload.zipCode,
    CardName: request.payload.cardName,
    CardNumber: request.payload.cardNumber,
    Expiration: request.payload.expiration,
    CVV: request.payload.cvv,
    PaymentMethod: request.payload.paymentMethod,
  };

  const response = await axiosClient.post(url, payload);

  return {
    success: true,
    orderId: response.data?.orderId,
  };
}

// ====================================
// DEPRECATED - Keep for backward compatibility
// ====================================

/** @deprecated Use checkout instead */
export async function applyShipping(): Promise<{ data: Cart } | null> {
  console.warn('applyShipping is deprecated, use checkout instead');
  return getCart();
}
