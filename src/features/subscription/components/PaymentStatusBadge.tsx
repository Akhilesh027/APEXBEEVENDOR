import React from 'react';
import type { PaymentStatus } from '../types/subscription.types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'CAPTURED':
        return { label: 'Paid', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PENDING':
        return { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'FAILED':
        return { label: 'Failed', classes: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'REFUNDED':
        return { label: 'Refunded', classes: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'PARTIALLY_REFUNDED':
        return { label: 'Partial Refund', classes: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: status, classes: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const style = getStyle();

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.classes}`}>
      {style.label}
    </span>
  );
};
