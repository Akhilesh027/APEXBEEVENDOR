import React, { useState } from 'react';
import { useSubscription } from '../features/subscription/hooks/useSubscription';
import { ScenarioSwitcher } from '../features/subscription/components/ScenarioSwitcher';
import { SubscriptionDashboard } from '../features/subscription/pages/SubscriptionDashboard';
import { AvailablePlans } from '../features/subscription/pages/AvailablePlans';
import { AddonServices } from '../features/subscription/pages/AddonServices';
import { SubscriptionCheckout } from '../features/subscription/pages/SubscriptionCheckout';
import { PaymentProcessingScreen } from '../features/subscription/pages/PaymentProcessingScreen';
import { PaymentSuccess } from '../features/subscription/pages/PaymentSuccess';
import { PaymentFailed } from '../features/subscription/pages/PaymentFailed';
import { PaymentPending } from '../features/subscription/pages/PaymentPending';
import { PaymentHistory } from '../features/subscription/pages/PaymentHistory';
import { InvoiceHistory } from '../features/subscription/pages/InvoiceHistory';
import { RenewalCenter } from '../features/subscription/pages/RenewalCenter';
import { UpgradeModal } from '../features/subscription/components/UpgradeModal';
import { DowngradeModal } from '../features/subscription/components/DowngradeModal';
import type { SubscriptionPlan, SubscriptionAddon } from '../features/subscription/types/subscription.types';
import {
  Crown,
  LayoutDashboard,
  Sparkles,
  Layers,
  CreditCard,
  RotateCcw,
  Receipt,
  Loader2
} from 'lucide-react';

export const SubscriptionManagement: React.FC = () => {
  const {
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
    checkoutQuote,
    couponInput,
    setCouponInput,
    couponMessage,
    startCheckout,
    applyCoupon,
    upgradeModalOpen,
    setUpgradeModalOpen,
    downgradeModalOpen,
    setDowngradeModalOpen,
    targetPlan,
    setTargetPlan
  } = useSubscription();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'plans' | 'addons' | 'history' | 'renewals' | 'invoices' | 'checkout' | 'processing' | 'success' | 'failed' | 'pending'
  >('overview');

  const [selectedProductObj, setSelectedProductObj] = useState<SubscriptionPlan | SubscriptionAddon | null>(null);
  const [processingDetails, setProcessingDetails] = useState<{
    productTitle: string;
    amount: number;
    paymentMethod: string;
    outcome: 'SUCCESS' | 'FAILED' | 'PENDING';
  }>({
    productTitle: 'POS Premium Subscription',
    amount: 7999,
    paymentMethod: 'UPI',
    outcome: 'SUCCESS'
  });

  const handleSelectPlan = async (plan: SubscriptionPlan, cycle: any = 'YEARLY') => {
    setSelectedProductObj(plan);
    await startCheckout(plan.id, 'PLAN', cycle);
    setActiveTab('checkout');
  };

  const handleSelectAddon = async (addon: SubscriptionAddon, cycle: any = 'MONTHLY') => {
    setSelectedProductObj(addon);
    await startCheckout(addon.id, 'ADDON', cycle);
    setActiveTab('checkout');
  };

  const handleProceedPayment = (method: string, outcome: 'SUCCESS' | 'FAILED' | 'PENDING') => {
    setProcessingDetails({
      productTitle: checkoutQuote?.productName || 'Subscription Product',
      amount: checkoutQuote?.finalPayableAmount || 7999,
      paymentMethod: method,
      outcome
    });
    setActiveTab('processing');
  };

  const handleProcessingComplete = (outcome: 'SUCCESS' | 'FAILED' | 'PENDING') => {
    if (outcome === 'SUCCESS') {
      changeScenario('active');
      setActiveTab('success');
    } else if (outcome === 'FAILED') {
      changeScenario('failed');
      setActiveTab('failed');
    } else if (outcome === 'PENDING') {
      changeScenario('pending');
      setActiveTab('pending');
    }
  };

  const handleDowngradeClick = (plan: SubscriptionPlan) => {
    setTargetPlan(plan);
    setDowngradeModalOpen(true);
  };

  const handleUpgradeClick = () => {
    const higherPlan = plans.find((p) => p.tier === 3) || plans[2];
    setTargetPlan(higherPlan);
    setUpgradeModalOpen(true);
  };

  const handleConfirmUpgrade = (plan: SubscriptionPlan) => {
    setUpgradeModalOpen(false);
    handleSelectPlan(plan, 'YEARLY');
  };

  const handleConfirmDowngrade = (plan: SubscriptionPlan) => {
    setDowngradeModalOpen(false);
    alert(`Downgrade scheduled! Your current plan will remain active until expiry. ${plan.name} will start on the next billing cycle.`);
    setActiveTab('overview');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-left">
      {/* QA Scenario Switcher Bar */}
      <ScenarioSwitcher
        currentScenario={scenario}
        onSelectScenario={(s) => changeScenario(s)}
      />

      {/* Navigation Sub-Tabs Header */}
      {!['checkout', 'processing', 'success', 'failed', 'pending'].includes(activeTab) && (
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto whitespace-nowrap text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-500" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" /> Available Plans
          </button>
          <button
            onClick={() => setActiveTab('addons')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'addons'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-500" /> Add-on Services
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-500" /> Payment History
          </button>
          <button
            onClick={() => setActiveTab('renewals')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'renewals'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-amber-500" /> Renewal History
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4 text-sky-500" /> Billing & Invoices
          </button>
        </div>
      )}

      {/* Main View Router Switch */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs text-slate-500 font-bold mt-2">Loading subscription details...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <SubscriptionDashboard
              summary={summary}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onToggleAutoRenew={toggleAutoRenew}
              onDownloadInvoice={() => setActiveTab('invoices')}
              onRenewPlan={() => setActiveTab('plans')}
              onUpgradePlan={handleUpgradeClick}
            />
          )}

          {activeTab === 'plans' && (
            <AvailablePlans
              plans={plans}
              summary={summary}
              onSelectPlan={handleSelectPlan}
              onDowngradeClick={handleDowngradeClick}
            />
          )}

          {activeTab === 'addons' && (
            <AddonServices
              addons={addons}
              summary={summary}
              onSubscribeAddon={handleSelectAddon}
            />
          )}

          {activeTab === 'checkout' && (
            <SubscriptionCheckout
              quote={checkoutQuote}
              productObj={selectedProductObj}
              couponInput={couponInput}
              onCouponInputChange={setCouponInput}
              couponMessage={couponMessage}
              onApplyCoupon={applyCoupon}
              onProceedPayment={handleProceedPayment}
              onBack={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'processing' && (
            <PaymentProcessingScreen
              productTitle={processingDetails.productTitle}
              amount={processingDetails.amount}
              paymentMethod={processingDetails.paymentMethod}
              outcome={processingDetails.outcome}
              onComplete={handleProcessingComplete}
            />
          )}

          {activeTab === 'success' && (
            <PaymentSuccess
              onGoToDashboard={() => setActiveTab('overview')}
              onDownloadInvoice={() => setActiveTab('invoices')}
              onViewFeatures={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'failed' && (
            <PaymentFailed
              onRetryPayment={() => setActiveTab('checkout')}
              onReturnToSubscription={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'pending' && (
            <PaymentPending
              onCheckStatus={() => changeScenario('active')}
              onReturnToDashboard={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'history' && (
            <PaymentHistory
              payments={payments}
              onDownloadPdf={(pay) => alert(`Downloading invoice PDF for order ${pay.orderId}`)}
              onRetryPayment={() => setActiveTab('plans')}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceHistory invoices={invoices} />
          )}

          {activeTab === 'renewals' && (
            <RenewalCenter
              renewals={renewals}
              summary={summary}
              onRenewItem={(item) => {
                const plan = plans.find((p) => p.id === item.productId);
                if (plan) handleSelectPlan(plan, item.renewalBillingCycle as any);
                else setActiveTab('checkout');
              }}
            />
          )}
        </>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        currentSummary={summary}
        targetPlan={targetPlan}
        onClose={() => setUpgradeModalOpen(false)}
        onConfirmUpgrade={handleConfirmUpgrade}
      />

      {/* Downgrade Modal */}
      <DowngradeModal
        currentSummary={summary}
        targetPlan={targetPlan}
        onClose={() => setDowngradeModalOpen(false)}
        onConfirmDowngrade={handleConfirmDowngrade}
      />
    </div>
  );
};
