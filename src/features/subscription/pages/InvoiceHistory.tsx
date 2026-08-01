import React, { useState } from 'react';
import type { SubscriptionInvoice } from '../types/subscription.types';
import { InvoiceCard } from '../components/InvoiceCard';
import { InvoiceDetailModal } from '../components/InvoiceDetailModal';
import { SubscriptionEmptyState } from '../components/SubscriptionEmptyState';
import { Receipt } from 'lucide-react';

interface InvoiceHistoryProps {
  invoices: SubscriptionInvoice[];
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ invoices }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);

  return (
    <div className="font-sans text-left space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-6 h-6 text-emerald-500" /> Billing & Tax Invoices
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Download GST compliant tax invoices, line item breakdowns and billing records.
        </p>
      </div>

      {invoices.length === 0 ? (
        <SubscriptionEmptyState
          title="No Invoices Available"
          description="There are currently no tax invoices generated for your account."
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              onViewDetails={(i) => setSelectedInvoice(i)}
              onDownloadPdf={(i) => alert(`Downloading Invoice PDF: ${i.invoiceNumber}.pdf`)}
            />
          ))}
        </div>
      )}

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
};
