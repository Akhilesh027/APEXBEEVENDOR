import React from 'react';
import type { SubscriptionPlan, BillingCycle } from '../types/subscription.types';
import { formatCurrency } from '../utils/subscription-formatters';
import { Check, Sparkles, Crown } from 'lucide-react';

interface PlanCardProps {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  isCurrentPlan: boolean;
  currentPlanTier: number;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onDowngradeClick?: (plan: SubscriptionPlan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  billingCycle,
  isCurrentPlan,
  currentPlanTier,
  onSelectPlan,
  onDowngradeClick
}) => {
  const price = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
  const isHigherTier = plan.tier > currentPlanTier;
  const isLowerTier = plan.tier < currentPlanTier;

  return (
    <div
      className={`rounded-3xl p-6 text-left font-sans flex flex-col justify-between transition-all duration-200 border relative ${
        plan.popular
          ? 'bg-slate-900 text-white border-amber-400/60 shadow-xl ring-2 ring-amber-400/20'
          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
          <Crown className="w-3 h-3" /> Most Popular Choice
        </span>
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-xl font-black">{plan.name}</h3>
          {billingCycle === 'YEARLY' && plan.yearlyDiscountBadge && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {plan.yearlyDiscountBadge}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 min-h-[36px]">
          {plan.description}
        </p>

        {/* Pricing */}
        <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black">{formatCurrency(price)}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              / {billingCycle === 'YEARLY' ? 'year' : 'month'}
            </span>
          </div>
          {billingCycle === 'YEARLY' && plan.monthlyPrice > 0 && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
              Equivalent to {formatCurrency(Math.round(plan.yearlyPrice / 12))}/mo billed annually
            </span>
          )}
        </div>

        {/* Usage limits */}
        <div className="mb-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-xs space-y-1">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Orders Limit:</span>
            <strong className="text-slate-900 dark:text-white">{plan.usageLimits?.monthlyOrders || (plan as any).orderLimit || '1,000 Orders'}</strong>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Staff Users:</span>
            <strong className="text-slate-900 dark:text-white">{plan.usageLimits?.staffAccounts || (plan as any).staffCount || 2}</strong>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>WhatsApp Credits:</span>
            <strong className="text-slate-900 dark:text-white">{plan.usageLimits?.whatsappCredits || (plan as any).whatsappCredits || '0 Credits'}</strong>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-2 mb-6 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Included Features:
          </span>
          {(plan.features || []).map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Button State Logic */}
      <div>
        {isCurrentPlan ? (
          <button
            disabled
            className="w-full py-3 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/40 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Current Active Plan
          </button>
        ) : isHigherTier ? (
          <button
            onClick={() => onSelectPlan(plan)}
            className={`w-full py-3 rounded-2xl font-black text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
              plan.popular
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Upgrade To {plan.name}
          </button>
        ) : isLowerTier ? (
          <button
            onClick={() => onDowngradeClick && onDowngradeClick(plan)}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Downgrade Plan
          </button>
        ) : (
          <button
            onClick={() => onSelectPlan(plan)}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
          >
            Select {plan.name} Plan
          </button>
        )}
      </div>
    </div>
  );
};
