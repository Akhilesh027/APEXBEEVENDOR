import React from 'react';
import type { SubscriptionSummary, SubscriptionUsage } from '../types/subscription.types';
import { getAlertBannerProps } from '../utils/subscription-status';
import { SubscriptionSummaryCard } from '../components/SubscriptionSummaryCard';
import { CurrentPlanCard } from '../components/CurrentPlanCard';
import { ExpiryAlert } from '../components/ExpiryAlert';
import { UsageProgress } from '../components/UsageProgress';
import { PriceBreakdown } from '../components/PriceBreakdown';
import { MOCK_USAGE } from '../mocks/subscription.mock';
import { Crown, Sparkles, Layers, ArrowRight } from 'lucide-react';

interface SubscriptionDashboardProps {
  summary: SubscriptionSummary | null;
  onNavigateTab: (tab: string) => void;
  onToggleAutoRenew: () => void;
  onDownloadInvoice: () => void;
  onRenewPlan: () => void;
  onUpgradePlan: () => void;
}

export const SubscriptionDashboard: React.FC<SubscriptionDashboardProps> = ({
  summary,
  onNavigateTab,
  onToggleAutoRenew,
  onDownloadInvoice,
  onRenewPlan,
  onUpgradePlan
}) => {
  if (!summary) return null;

  const alertBanner = getAlertBannerProps({
    status: summary.status,
    daysRemaining: summary.daysRemaining,
    trialDaysRemaining: summary.trialDaysRemaining,
    planName: summary.planName
  });

  return (
    <div className="font-sans text-left space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" /> My Subscription
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage your plan, billing, active services, renewals and entitlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRenewPlan}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer"
          >
            Renew Plan
          </button>
          <button
            onClick={onUpgradePlan}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Upgrade Plan
          </button>
          <button
            onClick={() => onNavigateTab('plans')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            View Available Plans
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <ExpiryAlert banner={alertBanner} onActionClick={(route) => onNavigateTab(route)} />

      {/* Top 6 KPI Summary Cards */}
      <SubscriptionSummaryCard summary={summary} onToggleAutoRenew={onToggleAutoRenew} />

      {/* Current Plan Highlight Card */}
      <CurrentPlanCard
        summary={summary}
        onRenew={onRenewPlan}
        onUpgrade={onUpgradePlan}
        onViewFeatures={() => onNavigateTab('plans')}
        onDownloadInvoice={onDownloadInvoice}
      />

      {/* Grid Layout: Active Add-ons & Price Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Add-on Services Column */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" /> Active Add-on Services
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Additional tools & communication gateways enabled for your business
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('addons')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              Browse Add-ons <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summary.activeServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summary.activeServices.map((service) => (
                <div
                  key={service.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {service.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                        {service.status}
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium">{service.usageSummary}</p>
                    <span className="text-[11px] text-slate-400 block mt-2">
                      Expires: <strong>{service.expiryDate}</strong>
                    </span>
                  </div>

                  <div className="flex justify-end pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <button
                      onClick={() => onNavigateTab('addons')}
                      className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline cursor-pointer"
                    >
                      Manage Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                No active add-on services. Subscribe to WhatsApp Marketing, SMS or AI tools to boost your store growth.
              </p>
              <button
                onClick={() => onNavigateTab('addons')}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Browse Available Add-ons
              </button>
            </div>
          )}
        </div>

        {/* Pricing Summary Side Card */}
        <div>
          <PriceBreakdown pricing={summary.pricing} />
        </div>
      </div>

      {/* Feature Usage & Quotas */}
      <UsageProgress usage={MOCK_USAGE} />
    </div>
  );
};
