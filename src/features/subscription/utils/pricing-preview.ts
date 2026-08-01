import type { SubscriptionPricing, SubscriptionDiscount } from '../types/subscription.types';

export const buildPricingPreview = (params: {
  originalPrice: number;
  adminDiscount?: SubscriptionDiscount | null;
  couponDiscountAmount?: number;
  gstRate?: number;
}): SubscriptionPricing => {
  const { originalPrice, adminDiscount, couponDiscountAmount = 0, gstRate = 0 } = params;

  let adminDiscountAmount = 0;
  if (adminDiscount) {
    if (adminDiscount.type === 'FLAT') {
      adminDiscountAmount = adminDiscount.value;
    } else if (adminDiscount.type === 'PERCENTAGE') {
      adminDiscountAmount = (originalPrice * adminDiscount.value) / 100;
    }
  }

  adminDiscountAmount = Math.min(adminDiscountAmount, originalPrice);
  const afterAdmin = Math.max(0, originalPrice - adminDiscountAmount);
  const validCouponDiscount = Math.min(couponDiscountAmount, afterAdmin);

  const taxableAmount = Math.max(0, afterAdmin - validCouponDiscount);
  const gstAmount = (taxableAmount * gstRate) / 100;
  const finalPayableAmount = taxableAmount + gstAmount;

  return {
    originalPrice,
    adminDiscountAmount,
    adminDiscountType: adminDiscount?.type,
    couponDiscountAmount: validCouponDiscount,
    taxableAmount,
    gstRate,
    gstAmount,
    finalPayableAmount
  };
};
