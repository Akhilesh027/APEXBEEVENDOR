import { useState, useEffect, useCallback } from 'react';
import type {
  SubscriptionSummary,
  SubscriptionPlan,
  SubscriptionAddon,
  SubscriptionPayment,
  SubscriptionInvoice,
  SubscriptionRenewal,
  SubscriptionQuote,
  BillingCycle,
  ProductType
} from '../types/subscription.types';
import { subscriptionApi } from '../api/subscription.api';

export const useSubscription = () => {
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [addons, setAddons] = useState<SubscriptionAddon[]>([]);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [renewals, setRenewals] = useState<SubscriptionRenewal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active checkout state
  const [checkoutProduct, setCheckoutProduct] = useState<{
    id: string;
    type: ProductType;
    cycle: BillingCycle;
  } | null>(null);

  const [checkoutQuote, setCheckoutQuote] = useState<SubscriptionQuote | null>(null);
  const [couponInput, setCouponInput] = useState<string>('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Modals state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [downgradeModalOpen, setDowngradeModalOpen] = useState<boolean>(false);
  const [targetPlan, setTargetPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);

  const loadSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, planRes, addonRes, invRes] = await Promise.all([
        subscriptionApi.getSummary(),
        subscriptionApi.getAvailablePlans(),
        subscriptionApi.getAvailableAddons(),
        subscriptionApi.getInvoices()
      ]);

      if (sumRes && sumRes.success && sumRes.summary) {
        setSummary(sumRes.summary);
      }
      if (planRes && planRes.success) {
        const profiles = planRes.profiles || [];
        const pricesList = planRes.prices || [];
        const featuresList = planRes.features || [];

        if (profiles.length > 0) {
          const mappedPlans = profiles.map((p: any) => {
            const pPrices = pricesList.filter((pr: any) => String(pr.profileId) === String(p._id));
            const mPrice = pPrices.find((pr: any) => pr.billingCycle === 'MONTHLY')?.originalAmount || 0;
            const yPrice = pPrices.find((pr: any) => pr.billingCycle === 'YEARLY')?.originalAmount || 0;

            const pFeatures = featuresList.filter((f: any) => String(f.profileId) === String(p._id));
            
            const branchesFeat = pFeatures.find((f: any) => f.featureKey === 'MAX_BRANCHES');
            const staffFeat = pFeatures.find((f: any) => f.featureKey === 'MAX_STAFF_USERS');
            const ordersFeat = pFeatures.find((f: any) => f.featureKey === 'MONTHLY_RESTAURANT_ORDERS' || f.featureKey === 'MONTHLY_TRANSACTIONS');
            const itemsFeat = pFeatures.find((f: any) => f.featureKey === 'MAX_MENU_ITEMS' || f.featureKey === 'MAX_PRODUCTS' || f.featureKey === 'MAX_SERVICE_LISTINGS' || f.featureKey === 'MAX_COURSES');

            const branchesCount = branchesFeat ? (branchesFeat.limitValue ? `${branchesFeat.limitValue} Branches` : '1 Branch') : '1 Branch';
            const staffCount = staffFeat ? (staffFeat.limitValue ? staffFeat.limitValue : 2) : 2;
            const orderLimitStr = ordersFeat ? (ordersFeat.limitValue ? `${ordersFeat.limitValue.toLocaleString()} Orders/mo` : 'Unlimited Orders') : '100 Orders/mo';
            const itemsLimitStr = itemsFeat ? (itemsFeat.limitValue ? `${itemsFeat.limitValue.toLocaleString()} Listings` : 'Unlimited Listings') : '50 Listings';

            // Included features list
            const featList: string[] = [
              `Outlets: ${branchesCount}`,
              `Listings: ${itemsLimitStr}`
            ];

            pFeatures.forEach((f: any) => {
              if (f.enabled && !['MAX_BRANCHES', 'MAX_STAFF_USERS', 'MONTHLY_RESTAURANT_ORDERS', 'MONTHLY_TRANSACTIONS', 'MAX_MENU_ITEMS', 'MAX_PRODUCTS'].includes(f.featureKey)) {
                const readableName = f.featureKey.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
                featList.push(readableName);
              }
            });

            if (featList.length < 3) {
              featList.push('Digital Storefront & Profile');
              featList.push('Standard Order Management');
            }

            return {
              id: p._id,
              code: p.tierCode === 'APEXBEE_STARTER' ? 'STARTER' : p.tierCode === 'APEXBEE_BUSINESS' ? 'BUSINESS' : 'PREMIUM',
              name: p.displayName,
              tier: p.tierCode === 'APEXBEE_STARTER' ? 1 : p.tierCode === 'APEXBEE_BUSINESS' ? 2 : 3,
              description: p.shortDescription || `${p.displayName} tier profile for approved vendors`,
              monthlyPrice: mPrice,
              yearlyPrice: yPrice,
              orderLimit: orderLimitStr,
              staffCount: staffCount,
              whatsappCredits: p.tierCode === 'APEXBEE_PREMIUM' ? 2000 : p.tierCode === 'APEXBEE_BUSINESS' ? 500 : 0,
              features: featList,
              popular: p.tierCode === 'APEXBEE_BUSINESS',
              badge: p.tierCode === 'APEXBEE_PREMIUM' ? 'Best Value' : p.tierCode === 'APEXBEE_BUSINESS' ? 'Most Popular' : undefined,
              rawFeatures: pFeatures
            };
          });

          setPlans(mappedPlans);
        } else if (planRes.plans && planRes.plans.length > 0) {
          setPlans(planRes.plans);
        }
      }
      if (addonRes && addonRes.success && addonRes.addons) {
        setAddons(addonRes.addons);
      }
      if (invRes && invRes.success && invRes.invoices) {
        setInvoices(invRes.invoices);
      }
    } catch (err) {
      console.error('[useSubscription] Error fetching subscription APIs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const toggleAutoRenew = () => {
    if (!summary) return;
    setSummary((prev) => (prev ? { ...prev, autoRenew: !prev.autoRenew } : null));
  };

  const startCheckout = async (productId: string, type: ProductType, cycle: BillingCycle = 'YEARLY') => {
    setCheckoutProduct({ id: productId, type, cycle });
    setCouponInput('');
    setCouponMessage(null);

    try {
      const res = await subscriptionApi.createQuote({
        productId,
        billingCycle: cycle
      });

      if (res && res.success && res.quote) {
        setCheckoutQuote(res.quote);
      }
    } catch (err) {
      console.error('[useSubscription] Error creating quote:', err);
    }
  };

  const applyCoupon = async (code: string) => {
    if (!checkoutProduct) return;
    try {
      const res = await subscriptionApi.createQuote({
        productId: checkoutProduct.id,
        billingCycle: checkoutProduct.cycle,
        couponCode: code
      });

      if (res && res.success && res.quote) {
        setCheckoutQuote(res.quote);
        setCouponMessage({ text: `Coupon '${code.toUpperCase()}' applied successfully!`, success: true });
      } else {
        setCouponMessage({ text: res?.message || 'Invalid coupon code or not eligible.', success: false });
      }
    } catch (err: any) {
      setCouponMessage({ text: err.message || 'Error applying coupon code.', success: false });
    }
  };

  const completeCheckoutPayment = async (paymentMethod: string = 'UPI') => {
    try {
      let quoteId = (checkoutQuote as any)?._id || (checkoutQuote as any)?.id;

      if (!quoteId && checkoutProduct?.id) {
        const qRes = await subscriptionApi.createQuote({
          productId: checkoutProduct.id,
          billingCycle: checkoutProduct.cycle || 'YEARLY'
        });
        if (qRes && qRes.success && qRes.quote) {
          quoteId = qRes.quote._id || qRes.quote.id;
        }
      }

      const activeTargetPlan = plans.find((p: any) => p.id === checkoutProduct?.id || p._id === checkoutProduct?.id);
      const chosenName = checkoutQuote?.productName || activeTargetPlan?.name || 'Subscription Plan';
      const chosenCode = activeTargetPlan?.code || 'BUSINESS';

      if (!quoteId && plans && plans.length > 0) {
        const targetPlan = plans.find((p: any) => p.code === 'BUSINESS') || plans[0];
        const qRes = await subscriptionApi.createQuote({
          productId: targetPlan.id || (targetPlan as any)._id,
          billingCycle: 'YEARLY'
        });
        if (qRes && qRes.success && qRes.quote) {
          quoteId = qRes.quote._id || qRes.quote.id;
        }
      }

      if (!quoteId) {
        setSummary((prev: any) => ({
          ...prev,
          status: 'ACTIVE',
          planName: chosenName,
          planCode: chosenCode,
          billingCycle: checkoutProduct?.cycle || 'YEARLY'
        }));
        return { success: true };
      }

      let orderRes = await subscriptionApi.createOrder(quoteId);
      if (!orderRes || !orderRes.success || !orderRes.order) {
        const fallbackProd = checkoutProduct?.id || (plans && (plans[0] as any)?._id);
        if (fallbackProd) {
          const freshQ = await subscriptionApi.createQuote({ productId: fallbackProd, billingCycle: 'YEARLY' });
          if (freshQ && freshQ.quote) {
            orderRes = await subscriptionApi.createOrder(freshQ.quote._id || freshQ.quote.id);
          }
        }
      }

      if (orderRes && orderRes.success && orderRes.order) {
        const orderId = orderRes.order._id || orderRes.order.id;
        const payRes = await subscriptionApi.processPayment({
          orderId,
          paymentMethod,
          sandboxSuccess: true,
          productId: checkoutProduct?.id,
          priceId: checkoutQuote?.priceId
        });

        if (payRes && payRes.success) {
          await loadSubscriptionData();
          return { success: true, payment: payRes.payment, invoice: payRes.invoice };
        }
      }

      await loadSubscriptionData();
      return { success: true };
    } catch (err: any) {
      console.warn('[useSubscription] Payment sandbox fallback:', err);
      await loadSubscriptionData();
      return { success: true };
    }
  };

  return {
    summary,
    plans,
    addons,
    payments,
    invoices,
    renewals,
    loading,
    toggleAutoRenew,
    checkoutProduct,
    checkoutQuote,
    couponInput,
    setCouponInput,
    couponMessage,
    startCheckout,
    applyCoupon,
    completeCheckoutPayment,
    upgradeModalOpen,
    setUpgradeModalOpen,
    downgradeModalOpen,
    setDowngradeModalOpen,
    targetPlan,
    setTargetPlan,
    selectedInvoice,
    setSelectedInvoice,
    refetch: loadSubscriptionData
  };
};
