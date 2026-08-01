import React from 'react';
import type { SubscriptionInvoice } from '../types/subscription.types';
import { formatCurrency } from '../utils/subscription-formatters';
import { FileText, Download, Eye } from 'lucide-react';

interface InvoiceCardProps {
  invoice: SubscriptionInvoice;
  onViewDetails: (invoice: SubscriptionInvoice) => void;
  onDownloadPdf: (invoice: SubscriptionInvoice) => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onViewDetails,
  onDownloadPdf
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {invoice.invoiceNumber}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
              {invoice.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {invoice.productName} • Issued {invoice.issuedDate}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount</span>
          <span className="text-base font-black text-slate-900 dark:text-white">
            {formatCurrency(invoice.totalAmount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(invoice)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDownloadPdf(invoice)}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
            title="Download PDF Invoice"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
