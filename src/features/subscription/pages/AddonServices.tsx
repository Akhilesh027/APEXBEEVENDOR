import React, { useState } from 'react';
import type { SubscriptionAddon, BillingCycle, SubscriptionSummary } from '../types/subscription.types';
import { AddonCard } from '../components/AddonCard';
import { Layers, Sparkles } from 'lucide-react';

interface AddonServicesProps {
  addons: SubscriptionAddon[];
  summary: SubscriptionSummary | null;
  onSubscribeAddon: (addon: SubscriptionAddon, cycle: BillingCycle) => void;
}

export const AddonServices: React.FC<AddonServicesProps> = ({
  addons,
  summary,
  onSubscribeAddon
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Communication', 'AI Tools', 'Website Services', 'Customer Management', 'Marketing'];

  const filteredAddons = selectedCategory === 'ALL'
    ? addons
    : addons.filter((a) => a.category === selectedCategory);

  const activeAddonIds = summary?.activeServices?.map((s) => s.addonId) || [];

  return (
    <div className="font-sans text-left space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-500" /> Add-on Services Catalogue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Supercharge your store with WhatsApp automation, AI poster generators, QR table ordering & custom domain.
          </p>
        </div>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              billingCycle === 'MONTHLY'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              billingCycle === 'YEARLY'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Yearly (Save 15%)
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            {cat === 'ALL' ? 'All Add-on Services' : cat}
          </button>
        ))}
      </div>

      {/* Addons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAddons.map((addon) => (
          <AddonCard
            key={addon.id}
            addon={addon}
            billingCycle={billingCycle}
            isActive={activeAddonIds.includes(addon.id)}
            onSubscribe={(a) => onSubscribeAddon(a, billingCycle)}
          />
        ))}
      </div>
    </div>
  );
};
