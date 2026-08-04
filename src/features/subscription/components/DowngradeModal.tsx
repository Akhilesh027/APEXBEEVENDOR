import React, { useState } from 'react';
import type { SubscriptionPlan, SubscriptionSummary } from '../types/subscription.types';
import { formatDate } from '../utils/subscription-formatters';
import { AlertTriangle, X } from 'lucide-react';

interface DowngradeModalProps {
  currentSummary: SubscriptionSummary | null;
  targetPlan: SubscriptionPlan | null;
  onClose: () => void;
  onConfirmDowngrade: (plan: SubscriptionPlan) => void;
}

export const DowngradeModal: React.FC<DowngradeModalProps> = ({
  currentSummary,
  targetPlan,
  onClose,
  onConfirmDowngrade
}) => {
  const [agreed, setAgreed] = useState<boolean>(false);

  if (!targetPlan) return null;

  const expiryStr = formatDate(currentSummary?.expiryDate || '2027-07-31');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Confirm Plan Downgrade
              </h3>
              <p className="text-xs text-slate-500 font-medium">Scheduled for next billing cycle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schedule Downgrade Banner */}
        <div className="py-4 space-y-3">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs">
            <p className="font-extrabold text-sm mb-1">📅 Next Billing Cycle Schedule:</p>
            <p className="leading-relaxed">
              Your current plan (<strong>{currentSummary?.planName}</strong>) will remain fully active until{' '}
              <strong>{expiryStr}</strong>.
            </p>
            <p className="mt-1 leading-relaxed">
              The <strong>{targetPlan.name}</strong> plan features and pricing will automatically take effect starting on the day after expiry.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <span className="font-bold block text-slate-900 dark:text-white">What changes with this downgrade?</span>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-500 dark:text-slate-400">
              <li>Order limit will change to: {targetPlan.usageLimits?.monthlyOrders || (targetPlan as any).orderLimit || '1,000 Orders'}</li>
              <li>Staff accounts will be limited to: {targetPlan.usageLimits?.staffAccounts || (targetPlan as any).staffCount || 2}</li>
              <li>WhatsApp credits set to: {targetPlan.usageLimits?.whatsappCredits || (targetPlan as any).whatsappCredits || 0}</li>
            </ul>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              I understand that some features, staff accounts, and usage limits will change on the scheduled effective date.
            </span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
          >
            Keep Current Plan
          </button>
          <button
            disabled={!agreed}
            onClick={() => onConfirmDowngrade(targetPlan)}
            className={`flex-1 py-3 rounded-2xl font-black text-xs transition cursor-pointer shadow-md ${
              agreed
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
            }`}
          >
            Confirm Downgrade Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
