import React from 'react';
import type { SubscriptionSummary } from '../types/subscription.types';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { formatDate, formatDaysRemaining } from '../utils/subscription-formatters';
import { Crown, Calendar, Clock, Layers, RefreshCw } from 'lucide-react';

interface SubscriptionSummaryCardProps {
  summary: SubscriptionSummary;
  onToggleAutoRenew?: () => void;
}

export const SubscriptionSummaryCard: React.FC<SubscriptionSummaryCardProps> = ({
  summary,
  onToggleAutoRenew
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 font-sans text-left">
      {/* Card 1 — Current Plan */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Current Plan</span>
          <Crown className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
            {summary.planName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{summary.planType}</p>
        </div>
      </div>

      {/* Card 2 — Plan Status */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Plan Status</span>
        </div>
        <div className="pt-1">
          <SubscriptionStatusBadge status={summary.status} size="md" />
        </div>
      </div>

      {/* Card 3 — Expiry Date */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Expiry Date</span>
          <Calendar className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {formatDate(summary.expiryDate)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Start: {formatDate(summary.startDate)}
          </p>
        </div>
      </div>

      {/* Card 4 — Days Remaining */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Days Remaining</span>
          <Clock className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <h3 className={`text-base font-black ${summary.daysRemaining <= 7 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {formatDaysRemaining(summary.daysRemaining)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cycle: {summary.billingCycle}</p>
        </div>
      </div>

      {/* Card 5 — Active Add-ons */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Active Add-ons</span>
          <Layers className="w-4 h-4 text-purple-500" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {summary.activeAddonsCount} Active
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Services Subscribed</p>
        </div>
      </div>

      {/* Card 6 — Auto Renewal */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Auto Renewal</span>
          <RefreshCw className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className={`text-xs font-bold ${summary.autoRenew ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            {summary.autoRenew ? 'Enabled' : 'Disabled'}
          </span>
          <button
            onClick={onToggleAutoRenew}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
              summary.autoRenew ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};
