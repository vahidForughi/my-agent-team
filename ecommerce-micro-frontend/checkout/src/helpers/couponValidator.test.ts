import {
  isExpired,
  hasReachedUsageLimit,
  meetsMinPurchase,
  isUserEligible,
  hasProductRestrictions,
  canStack,
} from './couponValidator';
import { Coupon, DiscountType } from '../services/coupon/types';

const createMockCoupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: 'test-coupon',
  code: 'TEST2024',
  discountType: 'PERCENTAGE' as DiscountType,
  discountValue: 20,
  description: 'Test coupon',
  startDate: new Date('2024-01-01').toISOString(),
  endDate: new Date('2025-12-31').toISOString(),
  usageLimit: 100,
  usageCount: 0,
  minPurchaseAmount: 0,
  stackable: true,
  active: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  ...overrides,
});

describe('couponValidator', () => {
  describe('isExpired', () => {
    it('should return false for valid coupon', () => {
      const coupon = createMockCoupon({
        startDate: new Date('2024-01-01').toISOString(),
        endDate: new Date('2025-12-31').toISOString(),
      });

      const result = isExpired(coupon);

      expect(result).toBe(false);
    });

    it('should return true for expired coupon', () => {
      const coupon = createMockCoupon({
        startDate: new Date('2020-01-01').toISOString(),
        endDate: new Date('2020-12-31').toISOString(),
      });

      const result = isExpired(coupon);

      expect(result).toBe(true);
    });

    it('should return true for not yet started coupon', () => {
      const coupon = createMockCoupon({
        startDate: new Date('2026-01-01').toISOString(),
        endDate: new Date('2026-12-31').toISOString(),
      });

      const result = isExpired(coupon);

      expect(result).toBe(true);
    });

    it('should handle edge case of current date', () => {
      const now = new Date();
      const coupon = createMockCoupon({
        startDate: now.toISOString(),
        endDate: now.toISOString(),
      });

      const result = isExpired(coupon);

      // Should be valid on the exact date
      expect(result).toBe(false);
    });
  });

  describe('hasReachedUsageLimit', () => {
    it('should return false when usage is below limit', () => {
      const coupon = createMockCoupon({
        usageLimit: 100,
        usageCount: 50,
      });

      const result = hasReachedUsageLimit(coupon);

      expect(result).toBe(false);
    });

    it('should return true when usage equals limit', () => {
      const coupon = createMockCoupon({
        usageLimit: 100,
        usageCount: 100,
      });

      const result = hasReachedUsageLimit(coupon);

      expect(result).toBe(true);
    });

    it('should return true when usage exceeds limit', () => {
      const coupon = createMockCoupon({
        usageLimit: 100,
        usageCount: 150,
      });

      const result = hasReachedUsageLimit(coupon);

      expect(result).toBe(true);
    });

    it('should return false when usage limit is not set', () => {
      const coupon = createMockCoupon({
        usageLimit: undefined,
        usageCount: 1000,
      });

      const result = hasReachedUsageLimit(coupon);

      expect(result).toBe(false);
    });

    it('should handle zero usage limit', () => {
      const coupon = createMockCoupon({
        usageLimit: 0,
        usageCount: 0,
      });

      const result = hasReachedUsageLimit(coupon);

      expect(result).toBe(true);
    });
  });

  describe('meetsMinPurchase', () => {
    it('should return true when subtotal meets minimum', () => {
      const coupon = createMockCoupon({
        minPurchaseAmount: 50,
      });

      const result = meetsMinPurchase(coupon, 50);

      expect(result).toBe(true);
    });

    it('should return true when subtotal exceeds minimum', () => {
      const coupon = createMockCoupon({
        minPurchaseAmount: 50,
      });

      const result = meetsMinPurchase(coupon, 100);

      expect(result).toBe(true);
    });

    it('should return false when subtotal is below minimum', () => {
      const coupon = createMockCoupon({
        minPurchaseAmount: 50,
      });

      const result = meetsMinPurchase(coupon, 30);

      expect(result).toBe(false);
    });

    it('should return true when no minimum is set', () => {
      const coupon = createMockCoupon({
        minPurchaseAmount: undefined,
      });

      const result = meetsMinPurchase(coupon, 10);

      expect(result).toBe(true);
    });

    it('should return true when minimum is zero', () => {
      const coupon = createMockCoupon({
        minPurchaseAmount: 0,
      });

      const result = meetsMinPurchase(coupon, 0);

      expect(result).toBe(true);
    });
  });

  describe('isUserEligible', () => {
    it('should return true when no user restrictions', () => {
      const coupon = createMockCoupon({
        eligibleUsers: undefined,
      });

      const result = isUserEligible(coupon, 'user123');

      expect(result).toBe(true);
    });

    it('should return true when user is in eligible list', () => {
      const coupon = createMockCoupon({
        eligibleUsers: ['user123', 'user456'],
      });

      const result = isUserEligible(coupon, 'user123');

      expect(result).toBe(true);
    });

    it('should return false when user is not in eligible list', () => {
      const coupon = createMockCoupon({
        eligibleUsers: ['user123', 'user456'],
      });

      const result = isUserEligible(coupon, 'user789');

      expect(result).toBe(false);
    });

    it('should return true when no userId provided and no restrictions', () => {
      const coupon = createMockCoupon({
        eligibleUsers: undefined,
      });

      const result = isUserEligible(coupon, undefined);

      expect(result).toBe(true);
    });

    it('should return false when no userId provided but restrictions exist', () => {
      const coupon = createMockCoupon({
        eligibleUsers: ['user123'],
      });

      const result = isUserEligible(coupon, undefined);

      expect(result).toBe(false);
    });

    it('should handle empty eligible users array', () => {
      const coupon = createMockCoupon({
        eligibleUsers: [],
      });

      const result = isUserEligible(coupon, 'user123');

      expect(result).toBe(false);
    });
  });

  describe('hasProductRestrictions', () => {
    it('should return false when no restrictions', () => {
      const coupon = createMockCoupon({
        productRestrictions: undefined,
      });

      const result = hasProductRestrictions(coupon);

      expect(result).toBe(false);
    });

    it('should return true when include restrictions exist', () => {
      const coupon = createMockCoupon({
        productRestrictions: {
          type: 'INCLUDE',
          includedProductIds: ['product1'],
          excludedProductIds: [],
        },
      });

      const result = hasProductRestrictions(coupon);

      expect(result).toBe(true);
    });

    it('should return true when exclude restrictions exist', () => {
      const coupon = createMockCoupon({
        productRestrictions: {
          type: 'EXCLUDE',
          includedProductIds: [],
          excludedProductIds: ['product1'],
        },
      });

      const result = hasProductRestrictions(coupon);

      expect(result).toBe(true);
    });

    it('should return false when restriction arrays are empty', () => {
      const coupon = createMockCoupon({
        productRestrictions: {
          type: 'INCLUDE',
          includedProductIds: [],
          excludedProductIds: [],
        },
      });

      const result = hasProductRestrictions(coupon);

      expect(result).toBe(false);
    });
  });

  describe('canStack', () => {
    it('should return true when coupon is stackable', () => {
      const coupon = createMockCoupon({
        stackable: true,
      });

      const result = canStack(coupon);

      expect(result).toBe(true);
    });

    it('should return false when coupon is not stackable', () => {
      const coupon = createMockCoupon({
        stackable: false,
      });

      const result = canStack(coupon);

      expect(result).toBe(false);
    });

    it('should return false when stackable is undefined', () => {
      const coupon = createMockCoupon({
        stackable: undefined,
      });

      const result = canStack(coupon);

      expect(result).toBe(false);
    });
  });
});

