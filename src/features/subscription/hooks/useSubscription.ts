import { useState, useEffect, useCallback } from 'react';
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
import { subscriptionMockApi } from '../api/subscription.mock-api';

export const useSubscription = () => {
  const [scenario, setScenarioState] = useState<SubscriptionScenario>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryScenario = urlParams.get('subscriptionScenario') as SubscriptionScenario;
      if (queryScenario && [
        'active', 'active_basic', 'trial', 'expired', 'pending',
        'paused', 'multi_addons', 'failed', 'no_subscription', 'cancelled'
      ].includes(queryScenario)) {
        return queryScenario;
      }
    }
    return 'active';
  });

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

  // Load summary and datasets when scenario changes
  const loadSubscriptionData = useCallback(async (currentScenario: SubscriptionScenario) => {
    try {
      setLoading(true);
      const [sumData, planList, addonList, payList, invList, renList] = await Promise.all([
        subscriptionMockApi.getSummary(currentScenario),
        subscriptionMockApi.getPlans(),
        subscriptionMockApi.getAddons(),
        subscriptionMockApi.getPaymentHistory(),
        subscriptionMockApi.getInvoices(),
        subscriptionMockApi.getRenewals()
      ]);

      setSummary(sumData);
      setPlans(planList);
      setAddons(addonList);
      setPayments(payList);
      setInvoices(invList);
      setRenewals(renList);
    } catch (err) {
      console.error('Error loading subscription data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptionData(scenario);
  }, [scenario, loadSubscriptionData]);

  const changeScenario = (newScenario: SubscriptionScenario) => {
    setScenarioState(newScenario);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('subscriptionScenario', newScenario);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const toggleAutoRenew = () => {
    if (!summary) return;
    setSummary((prev) => (prev ? { ...prev, autoRenew: !prev.autoRenew } : null));
  };

  const startCheckout = async (productId: string, type: ProductType, cycle: BillingCycle = 'YEARLY') => {
    setCheckoutProduct({ id: productId, type, cycle });
    setCouponInput('');
    setCouponMessage(null);
    const quote = await subscriptionMockApi.getQuote({
      productId,
      productType: type,
      billingCycle: cycle,
      scenario
    });
    setCheckoutQuote(quote);
  };

  const applyCoupon = async (code: string) => {
    if (!checkoutProduct) return;
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setCouponMessage({ text: 'Please enter a valid coupon code.', success: false });
      return;
    }

    if (cleanCode === 'APEX20' || cleanCode === 'FLAT500') {
      const quote = await subscriptionMockApi.getQuote({
        productId: checkoutProduct.id,
        productType: checkoutProduct.type,
        billingCycle: checkoutProduct.cycle,
        couponCode: cleanCode,
        scenario
      });
      setCheckoutQuote(quote);
      setCouponMessage({ text: `Coupon '${cleanCode}' applied successfully!`, success: true });
    } else {
      setCouponMessage({ text: `Coupon '${cleanCode}' is invalid or expired.`, success: false });
    }
  };

  const simulatePaymentOutcome = (outcome: 'SUCCESS' | 'FAILED' | 'PENDING') => {
    if (outcome === 'SUCCESS') {
      changeScenario('active');
    } else if (outcome === 'FAILED') {
      changeScenario('failed');
    } else if (outcome === 'PENDING') {
      changeScenario('pending');
    }
  };

  return {
    scenario,
    changeScenario,
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
    simulatePaymentOutcome,
    upgradeModalOpen,
    setUpgradeModalOpen,
    downgradeModalOpen,
    setDowngradeModalOpen,
    targetPlan,
    setTargetPlan,
    selectedInvoice,
    setSelectedInvoice,
    refetch: () => loadSubscriptionData(scenario)
  };
};
