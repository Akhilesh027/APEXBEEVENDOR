import React from 'react';
import type { SubscriptionInvoice } from '../types/subscription.types';
import { formatCurrency } from '../utils/subscription-formatters';
import { X, Download, ShieldCheck, Printer } from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: SubscriptionInvoice | null;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  onClose
}) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              Tax Invoice
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {invoice.invoiceNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vendor & Billed To details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px] mb-1">Issued By</span>
            <strong className="text-slate-900 dark:text-white font-black block">ApexBee Technologies India Pvt Ltd</strong>
            <p className="text-slate-500 mt-0.5">Plot 42, Tech City, Hitec Hub, Hyderabad - 500081</p>
            <p className="text-slate-500 font-mono">GSTIN: 36AAACA1234B1Z9</p>
          </div>

          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px] mb-1">Billed To (Vendor)</span>
            <strong className="text-slate-900 dark:text-white font-black block">{invoice.vendorName}</strong>
            <p className="text-slate-500 mt-0.5">{invoice.vendorAddress}</p>
            <p className="text-slate-500 font-mono">GSTIN: {invoice.gstin}</p>
          </div>
        </div>

        {/* Dates & Payment Ref */}
        <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 text-xs my-4">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Issued Date</span>
            <span className="font-black text-slate-900 dark:text-white">{invoice.issuedDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
            <span className="font-black text-slate-900 dark:text-white">{invoice.paymentMethod}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Ref</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate block">
              {invoice.paymentReference}
            </span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoice.lineItems.map((item, idx) => (
                <tr key={idx} className="text-slate-700 dark:text-slate-300">
                  <td className="py-2.5 font-medium">{item.description}</td>
                  <td className="py-2.5 text-center">{item.qty}</td>
                  <td className="py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2.5 text-right font-bold">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-1.5 text-xs mb-6">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Original Amount</span>
            <span>{formatCurrency(invoice.originalAmount)}</span>
          </div>

          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Admin Discount</span>
              <span>- {formatCurrency(invoice.discountAmount)}</span>
            </div>
          )}

          {invoice.cgst > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>CGST (9%)</span>
              <span>{formatCurrency(invoice.cgst)}</span>
            </div>
          )}
          {invoice.sgst > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>SGST (9%)</span>
              <span>{formatCurrency(invoice.sgst)}</span>
            </div>
          )}
          {invoice.igst > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>IGST (18%)</span>
              <span>{formatCurrency(invoice.igst)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
            <span>Total Payable Amount</span>
            <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Verified Tax Invoice
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={() => alert(`Downloading Invoice PDF: ${invoice.invoiceNumber}.pdf`)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
