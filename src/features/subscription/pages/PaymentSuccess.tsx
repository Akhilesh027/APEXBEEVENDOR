import React from 'react';
import { formatCurrency } from '../utils/subscription-formatters';
import { CheckCircle2, Download, Crown, ArrowRight } from 'lucide-react';

interface PaymentSuccessProps {
  onGoToDashboard: () => void;
  onDownloadInvoice: () => void;
  onViewFeatures: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  onGoToDashboard,
  onDownloadInvoice,
  onViewFeatures
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Successful
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            Your POS Premium Subscription is Now Active!
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Your transaction has been verified. All entitled features, credits and POS access are unlocked.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-xs space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-slate-500">Invoice Number:</span>
            <strong className="text-slate-900 dark:text-white font-mono">INV-2026-001</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Reference:</span>
            <strong className="text-slate-900 dark:text-white font-mono">UPI-REF-998877665544</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount Paid:</span>
            <strong className="text-emerald-600 font-black text-sm">{formatCurrency(7999)}</strong>
          </div>
          <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
            <span className="text-slate-500">New Expiry Date:</span>
            <strong className="text-slate-900 dark:text-white">31 July 2027</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onGoToDashboard}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Crown className="w-4 h-4" /> Go to Subscription Dashboard
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onDownloadInvoice}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Invoice
            </button>
            <button
              onClick={onViewFeatures}
              className="py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              View Active Features <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
