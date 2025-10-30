import MockAdapter from 'axios-mock-adapter';
import { axiosClient } from '../httpClient';
import registerProductMocks from './products/apis';

let mockAdapter: MockAdapter | null = null;

/**
 * Setup mock adapter for Axios client
 * This should be called before any API requests
 */
export function setupMocks() {
  if (!mockAdapter) {
    mockAdapter = new MockAdapter(axiosClient, { 
      delayResponse: 500, // Simulate network delay
      onNoMatch: 'passthrough', // Pass through requests that don't match any mock
    });
    
    // Register all mock endpoints
    registerProductMocks(mockAdapter);
    
    console.log('[Mocks] Mock adapter initialized');
  }
  return mockAdapter;
}

/**
 * Reset all mocks
 */
export function resetMocks() {
  if (mockAdapter) {
    mockAdapter.reset();
    console.log('[Mocks] Mock adapter reset');
  }
}

/**
 * Restore original axios behavior (disable mocks)
 */
export function restoreMocks() {
  if (mockAdapter) {
    mockAdapter.restore();
    mockAdapter = null;
    console.log('[Mocks] Mock adapter restored');
  }
}

