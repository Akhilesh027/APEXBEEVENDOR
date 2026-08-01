import type { SubscriptionQuote, SubscriptionDiscount, BillingCycle, ProductType } from '../types/subscription.types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatDaysRemaining = (days: number): string => {
  if (days < 0) {
    return `Expired ${Math.abs(days)} Days Ago`;
  }
  if (days === 0) {
    return 'Expires Today';
  }
  return `${days} Days Remaining`;
};

export const calculateQuote = (params: {
  productId: string;
  productName: string;
  productType: ProductType;
  billingCycle: BillingCycle;
  originalPrice: number;
  adminDiscount?: SubscriptionDiscount | null;
  couponCode?: string;
  couponDiscountValue?: number;
  gstRate?: number;
}): SubscriptionQuote => {
  const {
    productId,
    productName,
    productType,
    billingCycle,
    originalPrice,
    adminDiscount = null,
    couponCode,
    couponDiscountValue = 0,
    gstRate = 0
  } = params;

  let adminDiscountAmount = 0;
  if (adminDiscount) {
    if (adminDiscount.type === 'FLAT') {
      adminDiscountAmount = adminDiscount.value;
    } else if (adminDiscount.type === 'PERCENTAGE') {
      adminDiscountAmount = (originalPrice * adminDiscount.value) / 100;
    }
  }

  // Cap discount to originalPrice
  adminDiscountAmount = Math.min(adminDiscountAmount, originalPrice);

  const priceAfterAdminDiscount = Math.max(0, originalPrice - adminDiscountAmount);
  const couponDiscountAmount = Math.min(couponDiscountValue, priceAfterAdminDiscount);
  const taxableAmount = Math.max(0, priceAfterAdminDiscount - couponDiscountAmount);

  const gstAmount = (taxableAmount * gstRate) / 100;
  const finalPayableAmount = taxableAmount + gstAmount;

  return {
    productId,
    productName,
    productType,
    billingCycle,
    durationDays: billingCycle === 'YEARLY' ? 365 : 30,
    originalPrice,
    adminDiscount,
    couponCode,
    couponDiscountAmount,
    taxableAmount,
    gstRate,
    gstAmount,
    finalPayableAmount
  };
};
