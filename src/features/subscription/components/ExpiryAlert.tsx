import React from 'react';
import type { AlertBannerData } from '../utils/subscription-status';
import { AlertTriangle, Info, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface ExpiryAlertProps {
  banner: AlertBannerData | null;
  onActionClick?: (route: string) => void;
}

export const ExpiryAlert: React.FC<ExpiryAlertProps> = ({ banner, onActionClick }) => {
  if (!banner) return null;

  const getVariantStyles = () => {
    switch (banner.variant) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200',
          btn: 'bg-rose-600 hover:bg-rose-700 text-white',
          icon: <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 animate-bounce" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        };
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200',
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-200',
          btn: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className={`p-4 rounded-2xl border shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-left ${style.bg}`}>
      <div className="flex items-start gap-3">
        {style.icon}
        <div>
          <h4 className="text-sm font-black">{banner.title}</h4>
          <p className="text-xs font-medium mt-0.5 opacity-90 leading-snug">{banner.message}</p>
        </div>
      </div>
      {banner.actionText && (
        <button
          onClick={() => onActionClick && onActionClick(banner.actionRoute)}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition shadow-xs cursor-pointer ${style.btn}`}
        >
          {banner.actionText}
        </button>
      )}
    </div>
  );
};
