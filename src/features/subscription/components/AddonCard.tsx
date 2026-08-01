import React from 'react';
import type { SubscriptionAddon, BillingCycle } from '../types/subscription.types';
import { formatCurrency } from '../utils/subscription-formatters';
import { MessageSquare, Sparkles, Smartphone, Globe, Utensils, Users, CheckCircle2, RotateCcw } from 'lucide-react';

interface AddonCardProps {
  addon: SubscriptionAddon;
  billingCycle: BillingCycle;
  isActive: boolean;
  onSubscribe: (addon: SubscriptionAddon) => void;
  onManage?: (addon: SubscriptionAddon) => void;
}

export const AddonCard: React.FC<AddonCardProps> = ({
  addon,
  billingCycle,
  isActive,
  onSubscribe,
  onManage
}) => {
  const price = billingCycle === 'YEARLY' ? addon.yearlyPrice : addon.monthlyPrice;

  const renderIcon = () => {
    switch (addon.icon) {
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-indigo-500" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-sky-500" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-rose-500" />;
      case 'Users':
      default:
        return <Users className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-left font-sans flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
            {renderIcon()}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {addon.category}
          </span>
        </div>

        <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">
          {addon.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 min-h-[36px]">
          {addon.description}
        </p>

        {addon.includedCredits && (
          <div className="mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Includes {addon.includedCredits}</span>
          </div>
        )}

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(price)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            / {billingCycle === 'YEARLY' ? 'year' : 'month'}
          </span>
        </div>
      </div>

      <div>
        {isActive ? (
          <div className="flex gap-2">
            <button
              onClick={() => onManage && onManage(addon)}
              className="flex-1 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" /> Active Service
            </button>
            <button
              onClick={() => onSubscribe(addon)}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSubscribe(addon)}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            Add Service
          </button>
        )}
      </div>
    </div>
  );
};
