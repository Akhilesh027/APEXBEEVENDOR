export type SubscriptionStatus =
  | 'TRIALING'
  | 'PENDING_PAYMENT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'PAST_DUE'
  | 'EXPIRED'
  | 'CANCELLED';

export type ProductType = 'PLAN' | 'ADDON';

export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';

export type DiscountType = 'FLAT' | 'PERCENTAGE';

export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type SubscriptionScenario =
  | 'active'
  | 'active_basic'
  | 'trial'
  | 'expired'
  | 'pending'
  | 'paused'
  | 'multi_addons'
  | 'failed'
  | 'no_subscription'
  | 'cancelled';

export interface SubscriptionFeature {
  id: string;
  name: string;
  included: boolean;
  limitText?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscountBadge?: string;
  popular?: boolean;
  tier: number;
  features: string[];
  usageLimits: {
    monthlyOrders: string;
    staffAccounts: string;
    inventoryItems: string;
    whatsappCredits: string;
    smsCredits: string;
    aiCredits: string;
    support: string;
  };
}

export interface SubscriptionAddon {
  id: string;
  name: string;
  category: 'Marketing' | 'Business Tools' | 'Communication' | 'Website Services' | 'AI Tools' | 'Customer Management';
  icon: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  includedCredits?: string;
  availableDiscount?: string;
  status: 'Available' | 'Active' | 'Pending Payment' | 'Expired' | 'Paused';
  billingCycle?: BillingCycle;
  startDate?: string;
  expiryDate?: string;
  creditsRemaining?: number;
  totalCredits?: number;
}

export interface ActiveAddonService {
  id: string;
  addonId: string;
  name: string;
  icon: string;
  status: 'Active' | 'Pending Payment' | 'Expired' | 'Paused' | 'Cancelled';
  billingCycle: BillingCycle;
  startDate: string;
  expiryDate: string;
  usageSummary?: string;
  creditsRemaining?: number;
  totalCredits?: number;
  renewalPrice: number;
}

export interface SubscriptionDiscount {
  id: string;
  code?: string;
  type: DiscountType;
  value: number;
  description: string;
  appliedByAdmin: boolean;
}

export interface SubscriptionPricing {
  originalPrice: number;
  adminDiscountAmount: number;
  adminDiscountType?: DiscountType;
  couponDiscountAmount: number;
  taxableAmount: number;
  gstRate: number; // e.g. 0 or 18
  gstAmount: number;
  finalPayableAmount: number;
}

export interface SubscriptionSummary {
  scenario: SubscriptionScenario;
  planId: string;
  planName: string;
  planType: string;
  billingCycle: BillingCycle;
  startDate: string;
  expiryDate: string;
  durationDays: number;
  daysRemaining: number;
  status: SubscriptionStatus;
  autoRenew: boolean;
  trialDaysRemaining?: number;
  activeAddonsCount: number;
  pricing: SubscriptionPricing;
  activeServices: ActiveAddonService[];
  scheduledDowngrade?: {
    targetPlanName: string;
    effectiveDate: string;
  };
}

export interface SubscriptionQuote {
  productId: string;
  productName: string;
  productType: ProductType;
  billingCycle: BillingCycle;
  durationDays: number;
  originalPrice: number;
  adminDiscount: SubscriptionDiscount | null;
  couponCode?: string;
  couponDiscountAmount: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  finalPayableAmount: number;
}

export interface SubscriptionPayment {
  id: string;
  orderId: string;
  invoiceNo: string;
  itemTitle: string;
  itemType: ProductType;
  originalAmount: number;
  discountAmount: number;
  gstAmount: number;
  paidAmount: number;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet';
  paymentDate: string;
  status: PaymentStatus;
  failureReason?: string;
  pdfUrl?: string;
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  issuedDate: string;
  billingPeriod: string;
  productName: string;
  vendorName: string;
  vendorAddress: string;
  gstin: string;
  lineItems: {
    description: string;
    qty: number;
    unitPrice: number;
    amount: number;
  }[];
  originalAmount: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  paymentMethod: string;
  paymentReference: string;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
  pdfUrl: string;
}

export interface SubscriptionRenewal {
  id: string;
  productId: string;
  productName: string;
  productType: ProductType;
  currentExpiryDate: string;
  daysRemaining: number;
  renewalBillingCycle: BillingCycle;
  originalPrice: number;
  discountAmount: number;
  renewalAmount: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
}

export interface SubscriptionUsage {
  ordersUsed: number;
  ordersLimit: number;
  smsUsed: number;
  smsLimit: number;
  whatsappUsed: number;
  whatsappLimit: number;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  storageUsedGb: number;
  storageLimitGb: number;
}

export interface PlanComparisonRow {
  featureName: string;
  free: string;
  basic: string;
  premium: string;
  enterprise: string;
}
