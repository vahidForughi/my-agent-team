import { createApiFactory } from '../factory/createApiFactory';
import { Request, RequestPayloadRequired } from '../types';
import {
  getCartRequestSchema,
  addToCartRequestSchema,
  updateCartItemRequestSchema,
  removeCartItemRequestSchema,
  clearCartRequestSchema,
  applyShippingRequestSchema,
} from './schemas';
import { cartMapper } from './mappers';
import type {
  GetCartRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
  ClearCartRequest,
  ApplyShippingRequest,
  Cart,
} from './types';

export const apiFactory = createApiFactory('/cart');

export async function getCart(request?: Request<GetCartRequest>) {
  return apiFactory<Cart, Cart>('GET', null, request, {
    transformer: cartMapper.toDto,
    paramsSchema: getCartRequestSchema,
    useMock: request?.params?.useMock ?? false,
  });
}

export async function addToCart(
  request: RequestPayloadRequired<AddToCartRequest>
) {
  return apiFactory<Cart, Cart>('POST', '/items', request, {
    transformer: cartMapper.toDto,
    payloadSchema: addToCartRequestSchema,
    useMock: request?.payload?.useMock ?? false,
  });
}

export async function updateCartItem(
  request: RequestPayloadRequired<UpdateCartItemRequest>
) {
  return apiFactory<Cart, Cart>(
    'PUT',
    `/items/${request.payload.itemId}`,
    request,
    {
      transformer: cartMapper.toDto,
      payloadSchema: updateCartItemRequestSchema,
      useMock: request?.payload?.useMock ?? false,
    }
  );
}

export async function removeCartItem(
  request: RequestPayloadRequired<RemoveCartItemRequest>
) {
  return apiFactory<Cart, Cart>(
    'DELETE',
    `/items/${request.payload.itemId}`,
    request,
    {
      transformer: cartMapper.toDto,
      payloadSchema: removeCartItemRequestSchema,
      useMock: request?.payload?.useMock ?? false,
    }
  );
}

export async function clearCart(
  request?: RequestPayloadRequired<ClearCartRequest>
) {
  return apiFactory<Cart, Cart>('DELETE', null, request, {
    transformer: cartMapper.toDto,
    payloadSchema: clearCartRequestSchema,
    useMock: request?.payload?.useMock ?? false,
  });
}

export async function applyShipping(
  request: RequestPayloadRequired<ApplyShippingRequest>
) {
  return apiFactory<Cart, Cart>('POST', '/shipping', request, {
    transformer: cartMapper.toDto,
    payloadSchema: applyShippingRequestSchema,
    useMock: request?.payload?.useMock ?? false,
  });
}
