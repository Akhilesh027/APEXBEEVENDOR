import React from 'react';
import { PackageX } from 'lucide-react';

interface SubscriptionEmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const SubscriptionEmptyState: React.FC<SubscriptionEmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are no active items or history available in this category.',
  actionText,
  onAction
}) => {
  return (
    <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-6 font-sans">
      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <PackageX className="w-8 h-8" />
      </div>
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
