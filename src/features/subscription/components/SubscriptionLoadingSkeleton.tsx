import React from 'react';
import { Sparkles, Crown, Loader2 } from 'lucide-react';

export const SubscriptionLoadingSkeleton: React.FC = () => {
  return (
    <div className="font-sans text-left space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-9 w-32 bg-indigo-500/20 rounded-xl" />
        </div>
      </div>

      {/* Hero Glassmorphism Card Skeleton */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-indigo-900/60 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3">
            <div className="h-5 w-36 bg-amber-400/20 rounded-full border border-amber-400/30" />
            <div className="h-8 w-64 bg-white/20 rounded-xl" />
            <div className="h-4 w-96 bg-white/10 rounded-lg" />
          </div>

          <div className="h-20 w-52 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15" />
        </div>

        {/* 4 Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-white/10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="h-5 w-24 bg-white/20 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Progress Bar Skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-32 bg-white/10 rounded" />
            <div className="h-3 w-24 bg-amber-400/30 rounded" />
          </div>
          <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-amber-400/50 to-indigo-500/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm"
          >
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/60 rounded" />
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-3 w-4/5 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
            <div className="h-11 w-full bg-indigo-600/20 rounded-2xl pt-2" />
          </div>
        ))}
      </div>

      {/* Loading Overlay Badge */}
      <div className="flex items-center justify-center gap-2 pt-4 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
        <span className="tracking-wider uppercase">Loading Subscription Engine & Entitlements...</span>
      </div>
    </div>
  );
};
