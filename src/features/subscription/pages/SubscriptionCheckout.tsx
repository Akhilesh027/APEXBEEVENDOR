import React, { useState } from 'react';
import type { SubscriptionQuote, SubscriptionPlan, SubscriptionAddon } from '../types/subscription.types';
import { PriceBreakdown } from '../components/PriceBreakdown';
import { ShieldCheck, ArrowLeft, CreditCard, CheckCircle2, Tag, Lock, Smartphone } from 'lucide-react';

interface SubscriptionCheckoutProps {
  quote: SubscriptionQuote | null;
  productObj: SubscriptionPlan | SubscriptionAddon | null;
  couponInput: string;
  onCouponInputChange: (val: string) => void;
  couponMessage: { text: string; success: boolean } | null;
  onApplyCoupon: (code: string) => void;
  onProceedPayment: (paymentMethod: string, mockOutcome: 'SUCCESS' | 'FAILED' | 'PENDING') => void;
  onBack: () => void;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  quote,
  productObj,
  couponInput,
  onCouponInputChange,
  couponMessage,
  onApplyCoupon,
  onProceedPayment,
  onBack
}) => {
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [upiIdInput, setUpiIdInput] = useState<string>('');

  if (!quote || !productObj) return null;

  return (
    <div className="font-sans text-left space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Subscription Overview
      </button>

      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-200">
          Secure Subscription Checkout
        </span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Review Order & Billing Summary
        </h1>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column — Selected Product Details & Vendor Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Product Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Item</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {quote.productName}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase">
                {quote.billingCycle}
              </span>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Duration Validity:</span>
                <strong className="text-slate-900 dark:text-white">{quote.durationDays} Days</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Billing Type:</span>
                <strong className="text-slate-900 dark:text-white">{quote.productType} Subscription</strong>
              </div>
            </div>

            {/* Key Features Included */}
            {'features' in productObj && Array.isArray((productObj as any).features) && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-2">
                  Entitled Features Included:
                </span>
                <div className="space-y-1.5">
                  {((productObj as any).features as string[]).slice(0, 5).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vendor Details Form (Read-only) */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-xs space-y-3">
            <h4 className="font-black text-slate-900 dark:text-white text-sm">
              Vendor Subscriber Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Business Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">GM Super Market</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Phone</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">+91 98765 43210</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Billing Email</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">billing@gmsupermarket.com</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">37AAAAA0000A1Z5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Order Summary & Payment Gateway Simulation */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coupon Code Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs text-xs">
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-indigo-500" /> Have a Coupon Promo Code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo (e.g. APEX20)"
                value={couponInput}
                onChange={(e) => onCouponInputChange(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono text-xs font-bold"
              />
              <button
                onClick={() => onApplyCoupon(couponInput)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p
                className={`mt-2 font-bold text-[11px] ${
                  couponMessage.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {couponMessage.text}
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          <PriceBreakdown quote={quote} />

          {/* Payment Method Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs text-xs space-y-3">
            <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-500" /> Select Payment Method
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'UPI', label: 'UPI (GPay / PhonePe)' },
                { id: 'Credit Card', label: 'Credit / Debit Card' },
                { id: 'Net Banking', label: 'Net Banking' },
                { id: 'Wallet', label: 'Vendor Wallet' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3 rounded-2xl border text-left font-bold transition cursor-pointer ${
                    paymentMethod === m.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'UPI' && (
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Enter VPA / UPI ID</label>
                <input
                  type="text"
                  placeholder="e.g. mobile@upi"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Terms & Conditions Checkbox */}
          <label className="flex items-start gap-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              I agree to the ApexBee subscription terms, auto-renewal policies & recurring billing terms.
            </span>
          </label>

          {/* Mock Simulation Buttons Bar */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2 text-xs">
            <span className="font-extrabold text-amber-900 dark:text-amber-200 block">
              🧪 Verification Mode: Choose Payment Outcome Simulation
            </span>
            <div className="flex flex-col gap-2">
              <button
                disabled={!agreedTerms}
                onClick={() => onProceedPayment(paymentMethod, 'SUCCESS')}
                className={`w-full py-3 rounded-2xl font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  agreedTerms
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Simulate Payment Success
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={!agreedTerms}
                  onClick={() => onProceedPayment(paymentMethod, 'FAILED')}
                  className={`py-2 rounded-xl font-bold text-xs border transition ${
                    agreedTerms
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Simulate Payment Failure
                </button>
                <button
                  disabled={!agreedTerms}
                  onClick={() => onProceedPayment(paymentMethod, 'PENDING')}
                  className={`py-2 rounded-xl font-bold text-xs border transition ${
                    agreedTerms
                      ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Simulate Pending Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
