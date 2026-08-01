import React from 'react';
import type { SubscriptionPricing, SubscriptionQuote } from '../types/subscription.types';
import { formatCurrency } from '../utils/subscription-formatters';
import { ShieldCheck, Tag } from 'lucide-react';

interface PriceBreakdownProps {
  pricing?: SubscriptionPricing;
  quote?: SubscriptionQuote | null;
  className?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  pricing,
  quote,
  className = ''
}) => {
  const originalPrice = quote?.originalPrice ?? pricing?.originalPrice ?? 0;
  const adminDiscountAmount = quote?.adminDiscount
    ? (quote.adminDiscount.type === 'FLAT'
        ? quote.adminDiscount.value
        : (originalPrice * quote.adminDiscount.value) / 100)
    : pricing?.adminDiscountAmount ?? 0;
  const couponDiscountAmount = quote?.couponDiscountAmount ?? pricing?.couponDiscountAmount ?? 0;
  const taxableAmount = quote?.taxableAmount ?? pricing?.taxableAmount ?? (originalPrice - adminDiscountAmount - couponDiscountAmount);
  const gstRate = quote?.gstRate ?? pricing?.gstRate ?? 0;
  const gstAmount = quote?.gstAmount ?? pricing?.gstAmount ?? 0;
  const finalPayableAmount = quote?.finalPayableAmount ?? pricing?.finalPayableAmount ?? taxableAmount + gstAmount;

  return (
    <div className={`bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left font-sans ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-500" /> Price & Discount Breakdown
        </h4>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Backend Verified
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Original Price */}
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Original List Price</span>
          <span className="font-semibold">{formatCurrency(originalPrice)}</span>
        </div>

        {/* Admin Discount (Read-only) */}
        {adminDiscountAmount > 0 && (
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1">
              Admin Discount {quote?.adminDiscount?.type === 'PERCENTAGE' ? `(${quote.adminDiscount.value}%)` : '(Flat)'}
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold">
                Read-only
              </span>
            </span>
            <span className="font-bold">- {formatCurrency(adminDiscountAmount)}</span>
          </div>
        )}

        {/* Coupon Discount */}
        {couponDiscountAmount > 0 && (
          <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400 font-medium">
            <span>Coupon Promo Code ({quote?.couponCode})</span>
            <span className="font-bold">- {formatCurrency(couponDiscountAmount)}</span>
          </div>
        )}

        {/* Taxable Subtotal */}
        <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-800">
          <span>Taxable Amount</span>
          <span>{formatCurrency(taxableAmount)}</span>
        </div>

        {/* GST Details */}
        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>GST {gstRate > 0 ? `(${gstRate}%)` : '(0% / Exempt)'}</span>
          <span>{formatCurrency(gstAmount)}</span>
        </div>

        {/* Final Amount Payable */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black text-sm">
          <span>Total Amount Payable</span>
          <span className="text-base text-amber-600 dark:text-amber-400">
            {formatCurrency(finalPayableAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
