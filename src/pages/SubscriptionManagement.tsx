import React, { useState } from 'react';
import { useSubscription } from '../features/subscription/hooks/useSubscription';
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
import { SubscriptionLoadingSkeleton } from '../features/subscription/components/SubscriptionLoadingSkeleton';
import type { SubscriptionPlan, SubscriptionAddon } from '../features/subscription/types/subscription.types';
import {
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
    completeCheckoutPayment,
    upgradeModalOpen,
    setUpgradeModalOpen,
    downgradeModalOpen,
    setDowngradeModalOpen,
    targetPlan,
    setTargetPlan,
    refetch
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
    productTitle: 'Subscription Plan',
    amount: 999,
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

  const handleProceedPayment = async (method: string, outcome: 'SUCCESS' | 'FAILED' | 'PENDING') => {
    if (outcome === 'SUCCESS') {
      const res = await completeCheckoutPayment(method);
      if (res && res.success) {
        await refetch();
        setActiveTab('success');
      } else {
        setActiveTab('failed');
      }
    } else if (outcome === 'FAILED') {
      setActiveTab('failed');
    } else if (outcome === 'PENDING') {
      setActiveTab('pending');
    }
  };

  const handleDowngradeClick = (plan: SubscriptionPlan) => {
    setTargetPlan(plan);
    setDowngradeModalOpen(true);
  };

  const handleUpgradeClick = () => {
    const higherPlan = plans.find((p) => p.tier === 3) || plans[2];
    if (higherPlan) {
      setTargetPlan(higherPlan);
      setUpgradeModalOpen(true);
    }
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

  const handleProcessingComplete = (outcome: 'SUCCESS' | 'FAILED' | 'PENDING') => {
    refetch();
    if (outcome === 'SUCCESS') setActiveTab('success');
    else if (outcome === 'FAILED') setActiveTab('failed');
    else setActiveTab('pending');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-left">
      {/* Navigation Sub-Tabs Header */}
      {!['checkout', 'processing', 'success', 'failed', 'pending'].includes(activeTab) && (
        <div className="p-2 bg-slate-900/90 rounded-2xl shadow-xl flex flex-wrap gap-2 text-left">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black cursor-pointer border-none ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-blue-950 shadow-md scale-[1.02]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-500" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black cursor-pointer border-none ${
              activeTab === 'plans'
                ? 'bg-amber-400 text-blue-950 shadow-md scale-[1.02]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" /> Available Plans
          </button>
          <button
            onClick={() => setActiveTab('addons')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black cursor-pointer border-none ${
              activeTab === 'addons'
                ? 'bg-amber-400 text-blue-950 shadow-md scale-[1.02]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-500" /> Add-on Services
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black cursor-pointer border-none ${
              activeTab === 'history'
                ? 'bg-amber-400 text-blue-950 shadow-md scale-[1.02]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-500" /> Payment History
          </button>
          <button
            onClick={() => setActiveTab('renewals')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black cursor-pointer border-none ${
              activeTab === 'renewals'
                ? 'bg-amber-400 text-blue-950 shadow-md scale-[1.02]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-amber-500" /> Renewal History
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black cursor-pointer border-none ${
              activeTab === 'invoices'
                ? 'bg-amber-400 text-blue-950 shadow-md scale-[1.02]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold'
            }`}
          >
            <Receipt className="w-4 h-4 text-sky-500" /> Billing & Invoices
          </button>
        </div>
      )}

      {/* Main View Router Switch */}
      {loading ? (
        <SubscriptionLoadingSkeleton />
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
              summary={summary}
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
              onExecutePayment={() => completeCheckoutPayment(processingDetails.paymentMethod)}
              onComplete={handleProcessingComplete}
            />
          )}

          {activeTab === 'success' && (
            <PaymentSuccess
              summary={summary}
              checkoutQuote={checkoutQuote}
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
              onCheckStatus={() => refetch()}
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
