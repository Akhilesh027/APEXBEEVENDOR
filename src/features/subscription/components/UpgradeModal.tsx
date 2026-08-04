import React from 'react';
import type { SubscriptionPlan, SubscriptionSummary } from '../types/subscription.types';
import { formatCurrency } from '../utils/subscription-formatters';
import { Sparkles, X, Check, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  currentSummary: SubscriptionSummary | null;
  targetPlan: SubscriptionPlan | null;
  onClose: () => void;
  onConfirmUpgrade: (plan: SubscriptionPlan) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  currentSummary,
  targetPlan,
  onClose,
  onConfirmUpgrade
}) => {
  if (!targetPlan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Upgrade Subscription Plan
              </h3>
              <p className="text-xs text-slate-500 font-medium">Unlock higher limits & premium features</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Comparison Summary */}
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Plan</span>
              <strong className="text-slate-700 dark:text-slate-200">{currentSummary?.planName || 'Basic'}</strong>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="text-right">
              <span className="text-amber-500 block text-[10px] uppercase font-bold">New Plan</span>
              <strong className="text-indigo-600 dark:text-indigo-400 font-black">{targetPlan.name}</strong>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
            <p className="font-bold">⚡ Upgrade Notice:</p>
            <p className="mt-0.5 opacity-90">
              Upgrade takes effect immediately after successful payment. Unused days on your current plan will be credited towards your new billing cycle.
            </p>
          </div>

          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Additional Features Unlocked:
            </span>
            {(targetPlan.features || []).map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black text-sm">
            <span>Upgrade Payable Price</span>
            <span className="text-base text-amber-500">{formatCurrency(targetPlan.yearlyPrice)}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmUpgrade(targetPlan)}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs cursor-pointer shadow-md"
          >
            Proceed To Upgrade Checkout
          </button>
        </div>
      </div>
    </div>
  );
};
