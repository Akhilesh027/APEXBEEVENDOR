import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PaymentProcessingScreenProps {
  productTitle: string;
  amount: number;
  paymentMethod: string;
  outcome: 'SUCCESS' | 'FAILED' | 'PENDING';
  onComplete: (outcome: 'SUCCESS' | 'FAILED' | 'PENDING') => void;
}

export const PaymentProcessingScreen: React.FC<PaymentProcessingScreenProps> = ({
  productTitle,
  amount,
  paymentMethod,
  outcome,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    'Creating Subscription Order',
    'Connecting to Payment Gateway',
    'Verifying Payment Authorization',
    'Activating Vendor Features & Entitlements',
    'Generating Tax Invoice'
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 800);
    const timer2 = setTimeout(() => setCurrentStep(2), 1600);
    const timer3 = setTimeout(() => setCurrentStep(3), 2400);
    const timer4 = setTimeout(() => setCurrentStep(4), 3200);
    const timer5 = setTimeout(() => {
      onComplete(outcome);
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [outcome, onComplete]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Processing Your Payment
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Please do not close, refresh or press back on this page.
          </p>
        </div>

        {/* Step Progress Checklist */}
        <div className="space-y-3 text-left bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-xs">
          {steps.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={idx} className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                )}
                <span
                  className={
                    isDone
                      ? 'text-slate-700 dark:text-slate-300 font-bold'
                      : isCurrent
                      ? 'text-indigo-600 dark:text-indigo-400 font-black'
                      : 'text-slate-400 font-medium'
                  }
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-xs text-slate-400 font-mono">
          Via {paymentMethod} • Item: {productTitle}
        </div>
      </div>
    </div>
  );
};
