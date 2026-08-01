import React from 'react';
import { Clock, RefreshCw, HelpCircle, ArrowLeft } from 'lucide-react';

interface PaymentPendingProps {
  onCheckStatus: () => void;
  onReturnToDashboard: () => void;
}

export const PaymentPending: React.FC<PaymentPendingProps> = ({
  onCheckStatus,
  onReturnToDashboard
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200">
            Payment Verification Pending
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            Your Payment is Being Verified
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            We are waiting for final confirmation from your bank/gateway provider. Features will unlock automatically once confirmed.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl text-xs space-y-1 text-left border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
          <p className="font-bold">⏳ Verification Note:</p>
          <p className="opacity-90">
            Payment verification usually completes within 5 to 15 minutes. Duplicate charges will be automatically refunded.
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onCheckStatus}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Check Payment Status Again
          </button>
          <button
            onClick={onReturnToDashboard}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
