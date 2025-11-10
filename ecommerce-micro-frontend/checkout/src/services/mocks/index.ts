import MockAdapter from 'axios-mock-adapter';
import { axiosClient } from '../httpClient';
import registerCouponMocks from './coupon/apis';
import registerCartMocks from './cart/apis';

let mockAdapter: MockAdapter | null = null;

/**
 * Setup mock adapter for Axios client
 */
export function setupMocks() {
  if (mockAdapter) {
    console.warn('[Mocks] Mock adapter already initialized');
    return;
  }

  mockAdapter = new MockAdapter(axiosClient, {
    delayResponse: 500,
  });

  registerCouponMocks(mockAdapter);
  registerCartMocks(mockAdapter);

  console.log(
    '[Mocks] Checkout mock adapter initialized with coupon and cart endpoints'
  );
}

/**
 * Reset mock adapter
 */
export function resetMocks() {
  if (mockAdapter) {
    mockAdapter.reset();
    console.log('[Mocks] Mock adapter reset');
  }
}

/**
 * Restore Axios to its original state
 */
export function restoreMocks() {
  if (mockAdapter) {
    mockAdapter.restore();
    mockAdapter = null;
    console.log('[Mocks] Mock adapter restored');
  }
}
