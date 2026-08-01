import React, { useState } from 'react';
import type { SubscriptionPayment, PaymentStatus } from '../types/subscription.types';
import { PaymentStatusBadge } from '../components/PaymentStatusBadge';
import { SubscriptionEmptyState } from '../components/SubscriptionEmptyState';
import { formatCurrency } from '../utils/subscription-formatters';
import { CreditCard, Download, Eye, RotateCcw, Filter } from 'lucide-react';

interface PaymentHistoryProps {
  payments: SubscriptionPayment[];
  onDownloadPdf: (pay: SubscriptionPayment) => void;
  onRetryPayment: () => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  onDownloadPdf,
  onRetryPayment
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = filterStatus === 'ALL'
    ? payments
    : payments.filter((p) => {
        if (filterStatus === 'PAID') return p.status === 'CAPTURED';
        if (filterStatus === 'PENDING') return p.status === 'PENDING';
        if (filterStatus === 'FAILED') return p.status === 'FAILED';
        if (filterStatus === 'REFUNDED') return p.status === 'REFUNDED';
        return true;
      });

  return (
    <div className="font-sans text-left space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-500" /> Subscription Payment History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Complete transaction history, order IDs, invoice receipts and payment statuses.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                filterStatus === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <SubscriptionEmptyState
          title="No Payment History Found"
          description="There are no payment transactions matching your selected filter criteria."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Invoice / Order</th>
                  <th className="py-3 px-4">Plan / Add-on</th>
                  <th className="py-3 px-3 text-right">Original</th>
                  <th className="py-3 px-3 text-right">Discount</th>
                  <th className="py-3 px-3 text-right">Paid Amount</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      <div>{pay.invoiceNo}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{pay.orderId}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {pay.itemTitle}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-500">
                      {formatCurrency(pay.originalAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-emerald-600 font-semibold">
                      {pay.discountAmount > 0 ? `- ${formatCurrency(pay.discountAmount)}` : '₹0.00'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-white">
                      {formatCurrency(pay.paidAmount)}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {pay.paymentMethod}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium whitespace-nowrap">
                      {pay.paymentDate}
                    </td>
                    <td className="py-3.5 px-3">
                      <PaymentStatusBadge status={pay.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {pay.status === 'CAPTURED' && (
                          <button
                            onClick={() => onDownloadPdf(pay)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 transition"
                            title="Download Invoice PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {pay.status === 'FAILED' && (
                          <button
                            onClick={onRetryPayment}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> Retry
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4">
            {filtered.map((pay) => (
              <div
                key={pay.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {pay.invoiceNo}
                  </span>
                  <PaymentStatusBadge status={pay.status} />
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{pay.itemTitle}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{pay.paymentDate} via {pay.paymentMethod}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Amount Paid</span>
                    <span className="text-sm font-black text-emerald-600">{formatCurrency(pay.paidAmount)}</span>
                  </div>

                  {pay.status === 'CAPTURED' && (
                    <button
                      onClick={() => onDownloadPdf(pay)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Invoice
                    </button>
                  )}
                  {pay.status === 'FAILED' && (
                    <button
                      onClick={onRetryPayment}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
