import type { SubscriptionStatus } from '../types/subscription.types';

export interface StatusBadgeProps {
  label: string;
  className: string;
  dotColor: string;
}

export const getStatusBadgeProps = (status: SubscriptionStatus): StatusBadgeProps => {
  switch (status) {
    case 'ACTIVE':
      return {
        label: 'Active',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        dotColor: 'bg-emerald-500'
      };
    case 'TRIALING':
      return {
        label: 'Trial Mode',
        className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        dotColor: 'bg-blue-500'
      };
    case 'PENDING_PAYMENT':
      return {
        label: 'Pending Payment',
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        dotColor: 'bg-amber-500'
      };
    case 'PAST_DUE':
      return {
        label: 'Past Due',
        className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
        dotColor: 'bg-orange-500'
      };
    case 'PAUSED':
      return {
        label: 'Paused',
        className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dotColor: 'bg-slate-400'
      };
    case 'EXPIRED':
      return {
        label: 'Expired',
        className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        dotColor: 'bg-rose-500'
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        className: 'bg-slate-200 text-slate-800 border-slate-400 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700',
        dotColor: 'bg-slate-600'
      };
    default:
      return {
        label: status,
        className: 'bg-gray-100 text-gray-700 border-gray-200',
        dotColor: 'bg-gray-400'
      };
  }
};

export interface AlertBannerData {
  variant: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  actionText: string;
  actionRoute: string;
}

export const getAlertBannerProps = (params: {
  status: SubscriptionStatus;
  daysRemaining: number;
  trialDaysRemaining?: number;
  planName: string;
}): AlertBannerData | null => {
  const { status, daysRemaining, trialDaysRemaining, planName } = params;

  if (status === 'EXPIRED') {
    return {
      variant: 'critical',
      title: 'Subscription Expired',
      message: `Your ${planName} subscription has expired. Renew your plan to restore access to premium features.`,
      actionText: 'Renew Plan Now',
      actionRoute: 'plans'
    };
  }

  if (status === 'TRIALING') {
    const trialDays = trialDaysRemaining ?? daysRemaining;
    return {
      variant: 'info',
      title: 'Free Trial Active',
      message: `Your free trial of ${planName} ends in ${trialDays} days. Choose a plan to continue using subscription features.`,
      actionText: 'Choose A Plan',
      actionRoute: 'plans'
    };
  }

  if (status === 'PENDING_PAYMENT') {
    return {
      variant: 'warning',
      title: 'Payment Verification Pending',
      message: 'Your payment transaction is being verified. Premium features will unlock automatically once confirmed.',
      actionText: 'Check Payment History',
      actionRoute: 'history'
    };
  }

  if (status === 'PAST_DUE') {
    return {
      variant: 'critical',
      title: 'Payment Past Due',
      message: 'We were unable to charge your subscription. Please retry payment to avoid access restriction.',
      actionText: 'Retry Payment',
      actionRoute: 'history'
    };
  }

  if (status === 'PAUSED') {
    return {
      variant: 'warning',
      title: 'Subscription Paused',
      message: 'Your subscription access has been temporarily paused by administration. Contact support for reactivation.',
      actionText: 'Contact Support',
      actionRoute: 'support'
    };
  }

  if (status === 'ACTIVE') {
    if (daysRemaining <= 7 && daysRemaining > 0) {
      return {
        variant: 'warning',
        title: 'Expiring Very Soon!',
        message: `Your ${planName} subscription expires in ${daysRemaining} days. Renew now to continue using premium features.`,
        actionText: 'Renew Now',
        actionRoute: 'plans'
      };
    }
    if (daysRemaining <= 30 && daysRemaining > 7) {
      return {
        variant: 'info',
        title: 'Upcoming Expiry',
        message: `Your ${planName} subscription expires in ${daysRemaining} days. Renew early to preserve your uninterrupted service.`,
        actionText: 'Renew Plan',
        actionRoute: 'plans'
      };
    }
  }

  return null;
};
