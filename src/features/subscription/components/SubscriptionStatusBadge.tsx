import React from 'react';
import type { SubscriptionStatus } from '../types/subscription.types';
import { getStatusBadgeProps } from '../utils/subscription-status';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  status,
  size = 'md'
}) => {
  const badgeProps = getStatusBadgeProps(status);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs ${sizeClasses} ${badgeProps.className}`}
    >
      <span className={`w-2 h-2 rounded-full ${badgeProps.dotColor} animate-pulse`} />
      {badgeProps.label}
    </span>
  );
};
