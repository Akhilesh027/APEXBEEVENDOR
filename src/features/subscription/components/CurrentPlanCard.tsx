import React from 'react';
import type { SubscriptionSummary } from '../types/subscription.types';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { formatDate, formatCurrency } from '../utils/subscription-formatters';
import { Crown, Sparkles, Download, ArrowUpRight, RotateCcw } from 'lucide-react';

interface CurrentPlanCardProps {
  summary: SubscriptionSummary;
  onRenew: () => void;
  onUpgrade: () => void;
  onViewFeatures: () => void;
  onDownloadInvoice: () => void;
}

export const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({
  summary,
  onRenew,
  onUpgrade,
  onViewFeatures,
  onDownloadInvoice
}) => {
  const daysRemaining = summary?.daysRemaining ?? ((summary?.status as any) === 'TRIAL' || (summary?.status as any) === 'TRIALING' ? 14 : 30);
  const durationDays = summary?.durationDays ?? ((summary?.status as any) === 'TRIAL' || (summary?.status as any) === 'TRIALING' ? 15 : 365);
  const percentRemaining = durationDays > 0
    ? Math.max(0, Math.min(100, Math.round((daysRemaining / durationDays) * 100)))
    : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/60 shadow-xl mb-8 font-sans text-left relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-400/30">
              <Crown className="w-3 h-3 text-amber-400" /> Current Primary Plan
            </span>
            <SubscriptionStatusBadge status={summary?.status || 'ACTIVE'} size="sm" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            {summary?.planName || 'ApexBee Vendor Plan'}
          </h2>
          <p className="text-sm text-slate-300 mt-1 font-medium max-w-xl">
            Complete omnichannel marketplace POS, doorstep subscriptions & automated vendor workflow.
          </p>
        </div>

        {/* Pricing Summary Badge */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[200px]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block mb-1">
            Amount Paid / Payable
          </span>
          <div className="text-2xl font-black text-amber-400">
            {formatCurrency(summary?.pricing?.finalPayableAmount || 0)}
          </div>
          {(summary?.pricing?.adminDiscountAmount || 0) > 0 && (
            <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
              Includes {formatCurrency(summary?.pricing?.adminDiscountAmount || 0)} Admin Discount
            </span>
          )}
        </div>
      </div>

      {/* Subscription Grid Details */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-white/10 text-xs">
        <div>
          <span className="text-slate-400 font-semibold block mb-1">Billing Cycle</span>
          <span className="text-white font-bold text-sm uppercase">{summary?.billingCycle || 'YEARLY'}</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block mb-1">Duration</span>
          <span className="text-white font-bold text-sm">{durationDays} Days</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block mb-1">Start Date</span>
          <span className="text-white font-bold text-sm">{formatDate(summary?.startDate || '')}</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block mb-1">Expiry Date</span>
          <span className="text-white font-bold text-sm">{formatDate(summary?.expiryDate || '')}</span>
        </div>
      </div>

      {/* Days Remaining Progress Bar */}
      <div className="relative z-10 py-4">
        <div className="flex justify-between items-center text-xs font-bold mb-2">
          <span className="text-slate-300">Subscription Validity Period</span>
          <span className={daysRemaining <= 7 ? 'text-rose-400 font-black' : 'text-amber-400'}>
            {daysRemaining > 0 ? `${daysRemaining} Days Left (${percentRemaining}%)` : 'Subscription Expired'}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              daysRemaining <= 7 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-emerald-400'
            }`}
            style={{ width: `${Math.max(3, percentRemaining)}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRenew}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Renew Plan
          </button>
          <button
            onClick={onUpgrade}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 border border-indigo-400/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Upgrade Plan
          </button>
          <button
            onClick={onViewFeatures}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" /> View Features
          </button>
        </div>

        <button
          onClick={onDownloadInvoice}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download Latest Invoice
        </button>
      </div>
    </div>
  );
};
