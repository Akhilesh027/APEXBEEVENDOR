import React from 'react';

interface DeliverySectionProps {
  policy: {
    homeDelivery: boolean;
    storePickup: boolean;
    sameDay: boolean;
    scheduled: boolean;
    fragile: boolean;
    isPanIndia?: boolean;
    isLocalDelivery?: boolean;
    isSubscriptionAvailable?: boolean;
    cutoffTime?: string;
    deliverySlots?: string[];
  };
  onChange: (policy: any) => void;
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({ policy, onChange }) => {
  const togglePolicy = (key: string) => {
    const updated = {
      ...policy,
      [key]: !policy[key as keyof typeof policy],
    };
    if (key === 'isSubscriptionAvailable') {
      updated.scheduled = !!updated.isSubscriptionAvailable;
    }
    onChange(updated);
  };

  return (
    <div className="p-5 border border-blue-900/60 rounded-2xl bg-slate-950/80 space-y-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
        <h4 className="font-extrabold font-heading text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
          <span>🚚</span> Delivery Scope & Fulfillment Rules
        </h4>
        <span className="text-[10px] font-black bg-blue-900/60 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Vendor Delivery Policy
        </span>
      </div>

      {/* 🌐 DELIVERY SCOPE SELECTION (Local vs Pan-India) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <label className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
          policy.homeDelivery || policy.isLocalDelivery !== false
            ? 'bg-blue-950/60 border-blue-500/60 ring-1 ring-blue-500/30'
            : 'bg-slate-900 border-blue-900/40 opacity-70'
        }`}>
          <input
            type="checkbox"
            checked={policy.homeDelivery || policy.isLocalDelivery !== false}
            onChange={() => {
              const val = !(policy.homeDelivery || policy.isLocalDelivery !== false);
              onChange({ ...policy, homeDelivery: val, isLocalDelivery: val });
            }}
            className="mt-0.5 h-4.5 w-4.5 rounded text-amber-400 focus:ring-amber-400 bg-slate-950 border-blue-900 cursor-pointer shrink-0"
          />
          <div className="space-y-0.5">
            <div className="text-xs font-extrabold text-white flex items-center gap-2">
              <span>⚡ Local 15-30 Min Delivery</span>
              <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-black">LOCAL ONLY</span>
            </div>
            <p className="text-[11px] text-slate-300 font-normal leading-relaxed">
              Delivered quickly to customers within your local mandal / town / district zone by local delivery partners.
            </p>
          </div>
        </label>

        <label className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
          policy.isPanIndia
            ? 'bg-amber-400/10 border-amber-400/60 ring-1 ring-amber-400/30'
            : 'bg-slate-900 border-blue-900/40 opacity-70'
        }`}>
          <input
            type="checkbox"
            checked={!!policy.isPanIndia}
            onChange={() => onChange({ ...policy, isPanIndia: !policy.isPanIndia })}
            className="mt-0.5 h-4.5 w-4.5 rounded text-amber-400 focus:ring-amber-400 bg-slate-950 border-amber-400 cursor-pointer shrink-0"
          />
          <div className="space-y-0.5">
            <div className="text-xs font-extrabold text-amber-300 flex items-center gap-2">
              <span>🇮🇳 PAN-India Courier Delivery</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">NATIONAL</span>
            </div>
            <p className="text-[11px] text-slate-300 font-normal leading-relaxed">
              Select if you can ship this product across India via national courier / speed post (e.g. clothing, dry goods, non-perishables).
            </p>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-white">
        <label className="flex items-center space-x-2.5 cursor-pointer p-3.5 rounded-xl bg-slate-900 border border-blue-900/40 hover:border-amber-400/40 transition-all">
          <input
            type="checkbox"
            checked={policy.homeDelivery}
            onChange={() => togglePolicy('homeDelivery')}
            className="h-4 w-4 rounded text-amber-400 focus:ring-amber-400 bg-slate-950 border-blue-900 cursor-pointer"
          />
          <span>Home Delivery Available</span>
        </label>

        <label className="flex items-center space-x-2.5 cursor-pointer p-3.5 rounded-xl bg-slate-900 border border-blue-900/40 hover:border-amber-400/40 transition-all">
          <input
            type="checkbox"
            checked={policy.storePickup}
            onChange={() => togglePolicy('storePickup')}
            className="h-4 w-4 rounded text-amber-400 focus:ring-amber-400 bg-slate-950 border-blue-900 cursor-pointer"
          />
          <span>Store Pickup Available</span>
        </label>

        <label className="flex items-center space-x-2.5 cursor-pointer p-3.5 rounded-xl bg-slate-900 border border-blue-900/40 hover:border-amber-400/40 transition-all">
          <input
            type="checkbox"
            checked={policy.sameDay}
            onChange={() => togglePolicy('sameDay')}
            className="h-4 w-4 rounded text-amber-400 focus:ring-amber-400 bg-slate-950 border-blue-900 cursor-pointer"
          />
          <span>Same Day Express Delivery</span>
        </label>

        {/* 🔄 SUBSCRIPTION ORDER AVAILABILITY TOGGLE */}
        <label className="flex items-center space-x-2.5 cursor-pointer p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-400/40 hover:border-amber-400 transition-all md:col-span-2">
          <input
            type="checkbox"
            checked={policy.isSubscriptionAvailable ?? policy.scheduled}
            onChange={() => togglePolicy('isSubscriptionAvailable')}
            className="h-4.5 w-4.5 rounded text-amber-400 focus:ring-amber-400 bg-slate-950 border-amber-400 cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-amber-300 font-extrabold text-xs flex items-center gap-1.5">
              <span>🔄 Enable Subscription Orders (Subscribe & Save)</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">POPULAR</span>
            </span>
            <span className="text-[10px] text-slate-300 font-normal">
              Allow customers to set up daily/weekly/monthly recurring doorstep deliveries for this product.
            </span>
          </div>
        </label>

        <label className="flex items-center space-x-2.5 cursor-pointer p-3.5 rounded-xl bg-slate-900 border border-rose-500/40 hover:border-rose-400 transition-all text-rose-300">
          <input
            type="checkbox"
            checked={policy.fragile}
            onChange={() => togglePolicy('fragile')}
            className="h-4 w-4 rounded text-rose-500 focus:ring-rose-400 bg-slate-950 border-rose-900 cursor-pointer"
          />
          <span>Fragile / Special Care</span>
        </label>
      </div>

      {/* 📜 SUBSCRIPTION FULFILLMENT & DELIVERY RULES CONFIGURATION */}
      {(policy.isSubscriptionAvailable ?? policy.scheduled) && (
        <div className="p-4 rounded-xl border border-amber-400/30 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 space-y-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-amber-400/20 pb-2">
            <div className="font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
              <span>⚙️</span> Subscription Delivery Rules Configured for Customers
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-200">
            <div className="bg-slate-900/90 p-3 rounded-lg border border-blue-900/50 space-y-1">
              <span className="font-extrabold text-amber-300 block">⏱️ Order Modification Cut-Off:</span>
              <p className="text-[11px] text-slate-300 leading-tight">
                Customers can pause, skip or edit quantity up to <strong>10:00 PM</strong> on the previous day.
              </p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-blue-900/50 space-y-1">
              <span className="font-extrabold text-amber-300 block">🚚 Doorstep Delivery Slots:</span>
              <p className="text-[11px] text-slate-300 leading-tight">
                Early Morning (6-8 AM), Morning (8-11 AM), Evening (5-8 PM).
              </p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-blue-900/50 space-y-1">
              <span className="font-extrabold text-amber-300 block">💳 Automated Recurring Billing:</span>
              <p className="text-[11px] text-slate-300 leading-tight">
                Auto-debited per delivery with <strong>10% instant discount</strong> applied for subscriber.
              </p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-blue-900/50 space-y-1">
              <span className="font-extrabold text-amber-300 block">❌ Zero Lock-In Contract:</span>
              <p className="text-[11px] text-slate-300 leading-tight">
                Free pause or cancellation anytime from customer dashboard with no penalty.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
