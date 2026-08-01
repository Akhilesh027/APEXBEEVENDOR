import React, { useState } from 'react';
import type { SubscriptionPlan, BillingCycle, SubscriptionSummary } from '../types/subscription.types';
import { PlanCard } from '../components/PlanCard';
import { PLAN_COMPARISON_ROWS } from '../mocks/subscription.mock';
import { Sparkles, Check, HelpCircle } from 'lucide-react';

interface AvailablePlansProps {
  plans: SubscriptionPlan[];
  summary: SubscriptionSummary | null;
  onSelectPlan: (plan: SubscriptionPlan, cycle: BillingCycle) => void;
  onDowngradeClick: (plan: SubscriptionPlan) => void;
}

export const AvailablePlans: React.FC<AvailablePlansProps> = ({
  plans,
  summary,
  onSelectPlan,
  onDowngradeClick
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('YEARLY');

  const currentPlanCode = summary?.planId === 'plan-premium' ? 'PREMIUM' : summary?.planId === 'plan-basic' ? 'BASIC' : 'FREE';
  const currentPlanObj = plans.find((p) => p.code === currentPlanCode) || plans[1];

  return (
    <div className="font-sans text-left space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
          Flexible Subscription Plans
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Choose the Perfect Plan for Your Business
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Scale your store with omnichannel POS billing, doorstep subscription engine & AI marketing tools.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-5 py-2 rounded-xl text-xs font-black transition ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                billingCycle === 'YEARLY'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            isCurrentPlan={plan.code === currentPlanCode}
            currentPlanTier={currentPlanObj.tier}
            onSelectPlan={(p) => onSelectPlan(p, billingCycle)}
            onDowngradeClick={onDowngradeClick}
          />
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs mt-12">
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Complete Plan Feature Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Detailed breakdown of order limits, staff accounts, and marketing quotas across all tiers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold">
                <th className="py-3 px-4 w-1/3">Feature Capabilities</th>
                <th className="py-3 px-3 text-center">Free</th>
                <th className="py-3 px-3 text-center">Basic</th>
                <th className="py-3 px-3 text-center text-amber-600 font-black">POS Premium</th>
                <th className="py-3 px-3 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PLAN_COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {row.featureName}
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-slate-500 dark:text-slate-400">
                    {row.free}
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                    {row.basic}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20">
                    {row.premium}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                    {row.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
