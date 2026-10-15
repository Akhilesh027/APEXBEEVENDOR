import React from 'react';
import { AdminFeeInvoices } from '../features/subscription/pages/AdminFeeInvoices';
import { Receipt, ShieldCheck } from 'lucide-react';

export const SubscriptionManagement: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full text-slate-100 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white flex items-center gap-2.5">
            <Receipt className="h-7 w-7 text-amber-400" />
            <span>Invoices & Payment Links</span>
          </h1>
          <p className="text-xs text-blue-300 mt-1">
            View admin-issued fee invoices, complete payments for your store license, and track settlement status.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="h-4 w-4" />
          <span>Instant Commission Settlement Enabled</span>
        </div>
      </div>

      {/* Main Admin Fee Invoices & Payment Links View */}
      <AdminFeeInvoices />
    </div>
  );
};
