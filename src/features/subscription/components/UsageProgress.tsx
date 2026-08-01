import React from 'react';
import type { SubscriptionUsage } from '../types/subscription.types';
import { ShoppingBag, MessageSquare, Sparkles, HardDrive, Smartphone } from 'lucide-react';

interface UsageProgressProps {
  usage: SubscriptionUsage;
}

export const UsageProgress: React.FC<UsageProgressProps> = ({ usage }) => {
  const cards = [
    {
      title: 'WhatsApp Credits',
      used: usage.whatsappUsed,
      limit: usage.whatsappLimit,
      icon: <MessageSquare className="w-4 h-4 text-emerald-500" />,
      unit: 'Messages'
    },
    {
      title: 'SMS Balance',
      used: usage.smsUsed,
      limit: usage.smsLimit,
      icon: <Smartphone className="w-4 h-4 text-indigo-500" />,
      unit: 'SMS'
    },
    {
      title: 'AI Poster Credits',
      used: usage.aiCreditsUsed,
      limit: usage.aiCreditsLimit,
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      unit: 'Designs'
    },
    {
      title: 'Monthly Orders',
      used: usage.ordersUsed,
      limit: usage.ordersLimit,
      icon: <ShoppingBag className="w-4 h-4 text-purple-500" />,
      unit: 'Orders'
    },
    {
      title: 'Media Storage',
      used: usage.storageUsedGb,
      limit: usage.storageLimitGb,
      icon: <HardDrive className="w-4 h-4 text-sky-500" />,
      unit: 'GB'
    }
  ];

  return (
    <div className="mb-8 font-sans text-left">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">
          Active Feature Usage & Quotas
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Resets monthly according to plan limits
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((item, idx) => {
          const remaining = Math.max(0, item.limit - item.used);
          const percent = Math.round((item.used / (item.limit || 1)) * 100);

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">{item.title}</span>
                {item.icon}
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs font-black mb-1">
                  <span className="text-slate-900 dark:text-white">
                    {remaining} <span className="text-[10px] text-slate-400 font-normal">Remaining</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{percent}% Used</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percent > 85 ? 'bg-rose-500' : percent > 60 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                  {item.used} / {item.limit} {item.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
