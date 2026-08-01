import React from 'react';
import { XCircle, RotateCcw, ArrowLeft } from 'lucide-react';

interface PaymentFailedProps {
  onRetryPayment: () => void;
  onReturnToSubscription: () => void;
}

export const PaymentFailed: React.FC<PaymentFailedProps> = ({
  onRetryPayment,
  onReturnToSubscription
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <XCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full border border-rose-200">
            Payment Failed
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            We Could Not Complete Your Payment
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Your bank or payment processor declined the transaction. No funds were debited from your account.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl text-xs space-y-2 text-left border border-rose-200 dark:border-rose-900">
          <div className="flex justify-between text-rose-900 dark:text-rose-200">
            <span>Product Name:</span>
            <strong className="font-bold">POS Premium Subscription</strong>
          </div>
          <div className="flex justify-between text-rose-900 dark:text-rose-200">
            <span>Failure Reason:</span>
            <strong className="font-bold">Bank Server Timeout / Insufficient Funds</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onRetryPayment}
            className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Retry Payment Now
          </button>
          <button
            onClick={onReturnToSubscription}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Subscription Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
