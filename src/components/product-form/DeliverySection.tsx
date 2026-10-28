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
    isPreOrder?: boolean;
    preOrderType?: string;
    preOrderLeadTimeDays?: number | string;
    preOrderLeadTimeHours?: number | string;
    preOrderDailyCutoffTime?: string;
    preOrderAllowCustomMessage?: boolean;
    preOrderAllowTimeSlot?: boolean;
    preOrderCustomMessageLabel?: string;
    preOrderReleaseDate?: string;
    preOrderMessage?: string;
    preOrderLimit?: number | string;
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

        {/* 📦 PRE-ORDER AVAILABILITY TOGGLE */}
        <label className="flex items-center space-x-2.5 cursor-pointer p-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-600/10 to-purple-600/10 border border-purple-400/40 hover:border-purple-400 transition-all md:col-span-2">
          <input
            type="checkbox"
            checked={!!policy.isPreOrder}
            onChange={() => togglePolicy('isPreOrder')}
            className="h-4.5 w-4.5 rounded text-purple-400 focus:ring-purple-400 bg-slate-950 border-purple-400 cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-purple-300 font-extrabold text-xs flex items-center gap-1.5">
              <span>📅 Enable Pre-Order (Advance Booking)</span>
              <span className="text-[9px] bg-purple-500 text-white px-1.5 py-0.2 rounded font-black tracking-wider uppercase">ADVANCE BOOKING</span>
            </span>
            <span className="text-[10px] text-slate-300 font-normal">
              Accept orders and advance payments before stock arrives. Product will be marked as Pre-Order with expected dispatch date.
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

      {/* 📅 PRE-ORDER FULFILLMENT RULES CONFIGURATION (ApexBee Amber & Navy Brand) */}
      {policy.isPreOrder && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/60 space-y-4 text-xs shadow-lg">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <div className="font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
              <span>📅</span> Pre-Order Fulfillment &amp; Bakery Schedule
            </div>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">
              Visible on Customer Product Card &amp; Details
            </span>
          </div>

          {/* Pre-Order Type Selector */}
          <div>
            <label className="block text-xs font-bold text-amber-200 mb-1.5">
              Select Pre-Order Scheduling Model <span className="text-amber-400">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...policy, preOrderType: 'ADVANCE_NOTICE' })}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  (policy.preOrderType || 'ADVANCE_NOTICE') === 'ADVANCE_NOTICE'
                    ? 'border-amber-400 bg-amber-500/15 text-white ring-1 ring-amber-400 shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1">
                  <span>🎂</span> Advance Notice Days
                </span>
                <span className="text-[10px] text-slate-300">
                  e.g. Order before 2 days (custom cakes, catering, bakery)
                </span>
              </button>

              <button
                type="button"
                onClick={() => onChange({ ...policy, preOrderType: 'DAILY_CUTOFF' })}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  policy.preOrderType === 'DAILY_CUTOFF'
                    ? 'border-amber-400 bg-amber-500/15 text-white ring-1 ring-amber-400 shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1">
                  <span>🌅</span> Daily Cutoff / Next-Day
                </span>
                <span className="text-[10px] text-slate-300">
                  e.g. Order before 6 PM today for tomorrow morning
                </span>
              </button>

              <button
                type="button"
                onClick={() => onChange({ ...policy, preOrderType: 'RELEASE_DATE' })}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  policy.preOrderType === 'RELEASE_DATE'
                    ? 'border-amber-400 bg-amber-500/15 text-white ring-1 ring-amber-400 shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1">
                  <span>🚀</span> Fixed Launch Date
                </span>
                <span className="text-[10px] text-slate-300">
                  e.g. Festival hamper or book releasing on a fixed date
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-200">
            {/* Advance Notice Type Fields */}
            {(policy.preOrderType || 'ADVANCE_NOTICE') === 'ADVANCE_NOTICE' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">
                    Minimum Notice Required Before Delivery <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={policy.preOrderLeadTimeDays || 2}
                    onChange={(e) => onChange({ ...policy, preOrderLeadTimeDays: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs rounded-xl border border-amber-500/40 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/50 outline-none font-semibold cursor-pointer"
                  >
                    <option value={1}>1 Day Notice (Tomorrow Delivery)</option>
                    <option value={2}>2 Days Notice (Recommended for Cakes &amp; Bakes)</option>
                    <option value={3}>3 Days Notice (Designer / Fondant Cakes)</option>
                    <option value={4}>4 Days Notice</option>
                    <option value={5}>5 Days Notice</option>
                    <option value={7}>7 Days Notice (Weekly Bulk Orders)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Customers can only pick dates that are at least <strong className="text-amber-300">{policy.preOrderLeadTimeDays || 2} days</strong> ahead.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">
                    Daily Order Cut-off Time
                  </label>
                  <input
                    type="time"
                    value={policy.preOrderDailyCutoffTime || '18:00'}
                    onChange={(e) => onChange({ ...policy, preOrderDailyCutoffTime: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-amber-500/40 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/50 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Orders placed after this time add an extra 1 day to the minimum lead time.
                  </p>
                </div>
              </>
            )}

            {/* Daily Cutoff Mode Fields */}
            {policy.preOrderType === 'DAILY_CUTOFF' && (
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Cut-off Time for Next-Day Dispatch <span className="text-amber-400">*</span>
                </label>
                <input
                  type="time"
                  value={policy.preOrderDailyCutoffTime || '20:00'}
                  onChange={(e) => onChange({ ...policy, preOrderDailyCutoffTime: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-amber-500/40 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/50 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Orders placed before this time will be fulfilled tomorrow morning.
                </p>
              </div>
            )}

            {/* Fixed Release Date Mode Fields */}
            {policy.preOrderType === 'RELEASE_DATE' && (
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Expected Release / Shipping Date <span className="text-amber-400">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={policy.preOrderReleaseDate ? String(policy.preOrderReleaseDate).split('T')[0] : ''}
                  onChange={(e) => onChange({ ...policy, preOrderReleaseDate: e.target.value })}
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-amber-500/40 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/50 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Date when stock arrives and customer delivery begins.
                </p>
              </div>
            )}

            {/* Max Pre-Order Limit */}
            <div>
              <label className="block text-xs font-bold text-amber-200 mb-1">
                Max Daily Pre-Order Capacity (Optional)
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 10 (leave empty for unlimited)"
                value={policy.preOrderLimit ?? ''}
                onChange={(e) => onChange({ ...policy, preOrderLimit: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-amber-500/40 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/50 outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Maximum units you can prepare and fulfill per day.
              </p>
            </div>

            {/* Additional Features: Cake Inscription & Time Slot Toggles */}
            <div className="md:col-span-2 pt-2 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-amber-500/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.preOrderAllowCustomMessage !== false}
                  onChange={(e) => onChange({ ...policy, preOrderAllowCustomMessage: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-amber-400"
                />
                <div>
                  <span className="font-bold text-amber-200 text-xs">Allow Custom Customer Note / Instructions</span>
                  <p className="text-[10px] text-slate-400">Auto-tailored to product (e.g. Message on cake, gift greeting, cooking requests)</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-amber-500/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.preOrderAllowTimeSlot !== false}
                  onChange={(e) => onChange({ ...policy, preOrderAllowTimeSlot: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-amber-400"
                />
                <div>
                  <span className="font-bold text-amber-200 text-xs">Allow Delivery Time Slot Choice</span>
                  <p className="text-[10px] text-slate-400">Morning (9am-1pm) / Afternoon (1pm-5pm) / Evening (5pm-9pm)</p>
                </div>
              </label>
            </div>

            {policy.preOrderAllowCustomMessage !== false && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Custom Input Field Label (Optional Override)
                </label>
                <input
                  type="text"
                  placeholder="Auto-detected based on product (e.g. Message on Cake, Gift Note, Cooking Instructions)"
                  value={policy.preOrderCustomMessageLabel || ''}
                  onChange={(e) => onChange({ ...policy, preOrderCustomMessageLabel: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-amber-500/40 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/50 outline-none placeholder:text-slate-500"
                />
              </div>
            )}

            {/* Pre-Order Notice Message */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-purple-200 mb-1">
                Pre-Order Notice / Message for Customers
              </label>
              <input
                type="text"
                placeholder="e.g. Freshly baked on the morning of delivery. Order at least 2 days prior."
                value={policy.preOrderMessage || ''}
                onChange={(e) => onChange({ ...policy, preOrderMessage: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-purple-500/50 bg-slate-900 text-white focus:ring-2 focus:ring-purple-400/50 outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Shown prominently on the product card, details page, and checkout.
              </p>
            </div>
          </div>
        </div>
      )}

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
