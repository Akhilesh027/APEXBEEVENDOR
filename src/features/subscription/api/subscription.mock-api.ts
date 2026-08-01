import type {
  SubscriptionSummary,
  SubscriptionPlan,
  SubscriptionAddon,
  SubscriptionPayment,
  SubscriptionInvoice,
  SubscriptionRenewal,
  SubscriptionScenario,
  SubscriptionQuote,
  BillingCycle,
  ProductType
} from '../types/subscription.types';
import {
  MOCK_SCENARIOS,
  MOCK_PLANS,
  MOCK_ADDONS,
  MOCK_PAYMENTS,
  MOCK_INVOICES,
  MOCK_RENEWALS
} from '../mocks/subscription.mock';
import { calculateQuote } from '../utils/subscription-formatters';

export const subscriptionMockApi = {
  getSummary: async (scenario: SubscriptionScenario = 'active'): Promise<SubscriptionSummary> => {
    await new Promise((res) => setTimeout(res, 200));
    return MOCK_SCENARIOS[scenario] || MOCK_SCENARIOS.active;
  },

  getPlans: async (): Promise<SubscriptionPlan[]> => {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_PLANS;
  },

  getAddons: async (): Promise<SubscriptionAddon[]> => {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_ADDONS;
  },

  getQuote: async (params: {
    productId: string;
    productType: ProductType;
    billingCycle: BillingCycle;
    couponCode?: string;
    scenario?: SubscriptionScenario;
  }): Promise<SubscriptionQuote> => {
    await new Promise((res) => setTimeout(res, 200));
    const { productId, productType, billingCycle, couponCode, scenario = 'active' } = params;

    let productName = 'Subscription Product';
    let originalPrice = 1999;
    let adminDiscount = MOCK_SCENARIOS[scenario]?.pricing?.adminDiscountAmount
      ? {
          id: 'admin-disc-1',
          type: MOCK_SCENARIOS[scenario].pricing.adminDiscountType || 'FLAT',
          value: MOCK_SCENARIOS[scenario].pricing.adminDiscountAmount,
          description: 'Special Admin Partner Discount',
          appliedByAdmin: true
        }
      : null;

    if (productType === 'PLAN') {
      const plan = MOCK_PLANS.find((p) => p.id === productId);
      if (plan) {
        productName = plan.name;
        originalPrice = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
      }
    } else {
      const addon = MOCK_ADDONS.find((a) => a.id === productId);
      if (addon) {
        productName = addon.name;
        originalPrice = billingCycle === 'YEARLY' ? addon.yearlyPrice : addon.monthlyPrice;
      }
    }

    let couponDiscountValue = 0;
    if (couponCode && couponCode.toUpperCase() === 'APEX20') {
      couponDiscountValue = originalPrice * 0.2;
    } else if (couponCode && couponCode.toUpperCase() === 'FLAT500') {
      couponDiscountValue = 500;
    }

    return calculateQuote({
      productId,
      productName,
      productType,
      billingCycle,
      originalPrice,
      adminDiscount,
      couponCode,
      couponDiscountValue,
      gstRate: 0 // Default GST 0% for demo
    });
  },

  getPaymentHistory: async (): Promise<SubscriptionPayment[]> => {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_PAYMENTS;
  },

  getInvoices: async (): Promise<SubscriptionInvoice[]> => {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_INVOICES;
  },

  getRenewals: async (): Promise<SubscriptionRenewal[]> => {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_RENEWALS;
  }
};
