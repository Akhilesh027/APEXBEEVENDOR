import React from 'react';
import type { SubscriptionRenewal, SubscriptionSummary } from '../types/subscription.types';
import { formatCurrency, formatDaysRemaining } from '../utils/subscription-formatters';
import { RotateCcw, Clock, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RenewalCenterProps {
  renewals: SubscriptionRenewal[];
  summary: SubscriptionSummary | null;
  onRenewItem: (item: SubscriptionRenewal) => void;
}

export const RenewalCenter: React.FC<RenewalCenterProps> = ({
  renewals,
  summary,
  onRenewItem
}) => {
  return (
    <div className="font-sans text-left space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-amber-500" /> Renewal Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Review upcoming service expirations, preserve remaining days, and manage automatic renewals.
        </p>
      </div>

      {/* Early Renewal Preservation Notice */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm">🛡️ Early Renewal Preservation Guarantee:</h4>
          <p className="mt-0.5 opacity-90 leading-relaxed">
            When you renew an active plan or add-on service early, <strong>your remaining days will be preserved</strong>. The new subscription period automatically starts after your current expiry date.
          </p>
        </div>
      </div>

      {/* Primary Renewals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renewals.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200">
                  {item.productType} RENEWAL
                </span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {formatDaysRemaining(item.daysRemaining)}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                {item.productName}
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Current Expiry: <strong>{item.currentExpiryDate}</strong>
              </p>

              {/* Renewal Pricing Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-xs space-y-1 mb-4">
                <div className="flex justify-between text-slate-500">
                  <span>Renewal Cycle:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{item.renewalBillingCycle}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>List Price:</span>
                  <span>{formatCurrency(item.originalPrice)}</span>
                </div>
                {item.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Admin Discount:</span>
                    <span>- {formatCurrency(item.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                  <span>Renewal Amount:</span>
                  <span className="text-amber-500">{formatCurrency(item.renewalAmount)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onRenewItem(item)}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Renew Service Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
