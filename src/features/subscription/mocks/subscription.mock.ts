import type {
  SubscriptionPlan,
  SubscriptionAddon,
  SubscriptionSummary,
  SubscriptionPayment,
  SubscriptionInvoice,
  SubscriptionRenewal,
  SubscriptionUsage,
  PlanComparisonRow,
  SubscriptionScenario
} from '../types/subscription.types';

export const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Free',
    code: 'FREE',
    description: 'Basic access to start listing products on ApexBee marketplace.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    tier: 1,
    features: [
      'List up to 25 products',
      'Basic Order Dashboard',
      'Standard Email Support',
      'Manual Payouts (Weekly)',
      '1 Staff Account'
    ],
    usageLimits: {
      monthlyOrders: '100 Orders/mo',
      staffAccounts: '1 User',
      inventoryItems: '25 Items',
      whatsappCredits: '0 Credits',
      smsCredits: '0 Credits',
      aiCredits: '0 Credits',
      support: 'Email'
    }
  },
  {
    id: 'plan-basic',
    name: 'Basic',
    code: 'BASIC',
    description: 'Essential tools for growing retail stores and local vendors.',
    monthlyPrice: 999,
    yearlyPrice: 9590, // Save 20%
    yearlyDiscountBadge: 'Save 20%',
    tier: 2,
    features: [
      'List up to 250 products',
      'POS Sales Dashboard',
      'Priority Customer CRM',
      '500 WhatsApp SMS Notification Credits',
      '2 Staff Accounts',
      'Daily Payout Processing',
      'Standard Inventory Management'
    ],
    usageLimits: {
      monthlyOrders: '1,000 Orders/mo',
      staffAccounts: '2 Users',
      inventoryItems: '250 Items',
      whatsappCredits: '500 Credits/mo',
      smsCredits: '500 Credits/mo',
      aiCredits: '10 Credits/mo',
      support: 'Chat & Email'
    }
  },
  {
    id: 'plan-premium',
    name: 'POS Premium',
    code: 'PREMIUM',
    description: 'Complete omnichannel suite with POS, subscriptions, and AI tools.',
    monthlyPrice: 1999,
    yearlyPrice: 15990, // Save 33%
    yearlyDiscountBadge: 'Best Value',
    popular: true,
    tier: 3,
    features: [
      'Unlimited Product Listings',
      'Advanced POS & Billing Suite',
      'Hyperlocal Doorstep Subscription Engine',
      'WhatsApp & SMS Marketing Engine (2,000 Credits)',
      'AI Poster & Catalog Banner Generator',
      '5 Staff Accounts & Multi-counter',
      'Automated Wallet Payouts',
      'Dedicated Account Manager'
    ],
    usageLimits: {
      monthlyOrders: 'Unlimited Orders',
      staffAccounts: '5 Users',
      inventoryItems: 'Unlimited Items',
      whatsappCredits: '2,000 Credits/mo',
      smsCredits: '2,000 Credits/mo',
      aiCredits: '100 Credits/mo',
      support: '24/7 Phone & Manager'
    }
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    code: 'ENTERPRISE',
    description: 'Multi-outlet chains, regional distributors, and large brand partners.',
    monthlyPrice: 4999,
    yearlyPrice: 47990,
    yearlyDiscountBadge: 'Save 20%',
    tier: 4,
    features: [
      'Unlimited Outlets & Stores',
      'Custom ERP & Tally Integration',
      'Dedicated Dedicated Server & Custom Domain',
      'Bulk B2B Wholesale Trading Hub',
      'Custom AI Training & Customer Automation',
      'Unlimited Staff Accounts & Audit Logs',
      'Instant Payout Settlement Engine'
    ],
    usageLimits: {
      monthlyOrders: 'Unlimited',
      staffAccounts: 'Unlimited',
      inventoryItems: 'Unlimited',
      whatsappCredits: '10,000 Credits/mo',
      smsCredits: '10,000 Credits/mo',
      aiCredits: '500 Credits/mo',
      support: 'VIP Account Manager'
    }
  }
];

export const MOCK_ADDONS: SubscriptionAddon[] = [
  {
    id: 'addon-wa',
    name: 'WhatsApp Marketing Engine',
    category: 'Communication',
    icon: 'MessageSquare',
    description: 'Send automated broadcast offers, order tracking updates & payment reminders.',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    includedCredits: '2,500 Messages/mo',
    availableDiscount: 'Save 17%',
    status: 'Available'
  },
  {
    id: 'addon-ai-poster',
    name: 'AI Poster & Festival Banner Maker',
    category: 'AI Tools',
    icon: 'Sparkles',
    description: 'Generate high-converting Ugadi, Diwali, and seasonal promo designs in 1-click.',
    monthlyPrice: 399,
    yearlyPrice: 3990,
    includedCredits: '150 Designs/mo',
    availableDiscount: 'Popular',
    status: 'Available'
  },
  {
    id: 'addon-sms',
    name: 'Transactional SMS Gateway',
    category: 'Communication',
    icon: 'Smartphone',
    description: 'DLT registered high-deliverability SMS alerts for invoice receipts and OTPs.',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    includedCredits: '3,000 SMS/mo',
    status: 'Available'
  },
  {
    id: 'addon-custom-domain',
    name: 'Custom Domain & Branded Web Store',
    category: 'Website Services',
    icon: 'Globe',
    description: 'Connect your own domain (e.g. www.yourshop.com) with free SSL certificate.',
    monthlyPrice: 599,
    yearlyPrice: 5990,
    includedCredits: 'Free SSL + DNS',
    status: 'Available'
  },
  {
    id: 'addon-restaurant-website',
    name: 'Online Ordering Menu & QR Table Ordering',
    category: 'Website Services',
    icon: 'Utensils',
    description: 'Digital contactless menu with table QR code scanning & live kitchen display.',
    monthlyPrice: 799,
    yearlyPrice: 7990,
    includedCredits: 'Unlimited Table QRs',
    status: 'Available'
  },
  {
    id: 'addon-crm',
    name: 'VIP Customer Loyalty & CRM',
    category: 'Customer Management',
    icon: 'Users',
    description: 'Track top spending customers, send automated birthday offers & cashback rewards.',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    includedCredits: 'Unlimited Contacts',
    status: 'Available'
  }
];

export const MOCK_USAGE: SubscriptionUsage = {
  ordersUsed: 842,
  ordersLimit: 2000,
  smsUsed: 1420,
  smsLimit: 3000,
  whatsappUsed: 1250,
  whatsappLimit: 2000,
  aiCreditsUsed: 68,
  aiCreditsLimit: 100,
  storageUsedGb: 4.2,
  storageLimitGb: 10.0
};

export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  { featureName: 'POS Access', free: 'Basic POS', basic: 'Standard POS', premium: 'Omnichannel POS Suite', enterprise: 'Custom Enterprise POS' },
  { featureName: 'Monthly Orders', free: '100 Orders', basic: '1,000 Orders', premium: 'Unlimited Orders', enterprise: 'Unlimited Orders' },
  { featureName: 'Staff Accounts', free: '1 User', basic: '2 Users', premium: '5 Users', enterprise: 'Unlimited Users' },
  { featureName: 'Advanced Reports', free: '❌ No', basic: '✓ Standard', premium: '✓ Advanced AI', enterprise: '✓ Custom Analytics' },
  { featureName: 'Inventory Engine', free: '25 Items', basic: '250 Items', premium: 'Unlimited Items', enterprise: 'Multi-warehouse' },
  { featureName: 'Customer CRM', free: '❌ No', basic: '✓ Basic', premium: '✓ Full CRM & Rewards', enterprise: '✓ Dedicated CRM' },
  { featureName: 'WhatsApp Credits', free: '0', basic: '500 / mo', premium: '2,000 / mo', enterprise: '10,000 / mo' },
  { featureName: 'SMS Credits', free: '0', basic: '500 / mo', premium: '2,000 / mo', enterprise: '10,000 / mo' },
  { featureName: 'AI Credits', free: '0', basic: '10 / mo', premium: '100 / mo', enterprise: '500 / mo' },
  { featureName: 'Support Type', free: 'Email', basic: 'Chat & Email', premium: '24/7 Phone & Manager', enterprise: 'VIP Dedicated Manager' }
];

export const MOCK_SCENARIOS: Record<SubscriptionScenario, SubscriptionSummary> = {
  // Scenario 1: Active POS Premium (Yearly, Flat ₹2,000 discount, 365 days)
  active: {
    scenario: 'active',
    planId: 'plan-premium',
    planName: 'POS Premium',
    planType: 'Yearly Plan',
    billingCycle: 'YEARLY',
    startDate: '2026-08-01',
    expiryDate: '2027-07-31',
    durationDays: 365,
    daysRemaining: 365,
    status: 'ACTIVE',
    autoRenew: true,
    activeAddonsCount: 2,
    pricing: {
      originalPrice: 9999,
      adminDiscountAmount: 2000,
      adminDiscountType: 'FLAT',
      couponDiscountAmount: 0,
      taxableAmount: 7999,
      gstRate: 0,
      gstAmount: 0,
      finalPayableAmount: 7999
    },
    activeServices: [
      {
        id: 'active-wa',
        addonId: 'addon-wa',
        name: 'WhatsApp Marketing Engine',
        icon: 'MessageSquare',
        status: 'Active',
        billingCycle: 'MONTHLY',
        startDate: '2026-07-01',
        expiryDate: '2026-08-30',
        usageSummary: '1,250 / 2,000 credits used',
        creditsRemaining: 1250,
        totalCredits: 2000,
        renewalPrice: 499
      },
      {
        id: 'active-poster',
        addonId: 'addon-ai-poster',
        name: 'AI Poster Generator',
        icon: 'Sparkles',
        status: 'Active',
        billingCycle: 'MONTHLY',
        startDate: '2026-07-15',
        expiryDate: '2026-08-15',
        usageSummary: '68 / 100 credits used',
        creditsRemaining: 32,
        totalCredits: 100,
        renewalPrice: 399
      }
    ]
  },

  // Scenario 2: Active Basic Plan (Monthly, 20% discount, 7 days remaining)
  active_basic: {
    scenario: 'active_basic',
    planId: 'plan-basic',
    planName: 'Basic Retail Plan',
    planType: 'Monthly Plan',
    billingCycle: 'MONTHLY',
    startDate: '2026-07-07',
    expiryDate: '2026-08-07',
    durationDays: 30,
    daysRemaining: 7,
    status: 'ACTIVE',
    autoRenew: false,
    activeAddonsCount: 1,
    pricing: {
      originalPrice: 999,
      adminDiscountAmount: 199.8,
      adminDiscountType: 'PERCENTAGE',
      couponDiscountAmount: 0,
      taxableAmount: 799.2,
      gstRate: 18,
      gstAmount: 143.85,
      finalPayableAmount: 943.05
    },
    activeServices: [
      {
        id: 'active-sms',
        addonId: 'addon-sms',
        name: 'Transactional SMS Gateway',
        icon: 'Smartphone',
        status: 'Active',
        billingCycle: 'MONTHLY',
        startDate: '2026-07-07',
        expiryDate: '2026-08-07',
        usageSummary: '420 / 500 SMS used',
        creditsRemaining: 80,
        totalCredits: 500,
        renewalPrice: 299
      }
    ]
  },

  // Scenario 3: Free Trial Plan (5 days remaining)
  trial: {
    scenario: 'trial',
    planId: 'plan-premium',
    planName: 'POS Premium (14-Day Free Trial)',
    planType: 'Trial Plan',
    billingCycle: 'MONTHLY',
    startDate: '2026-07-20',
    expiryDate: '2026-08-05',
    durationDays: 14,
    daysRemaining: 5,
    trialDaysRemaining: 5,
    status: 'TRIALING',
    autoRenew: false,
    activeAddonsCount: 0,
    pricing: {
      originalPrice: 1999,
      adminDiscountAmount: 1999,
      adminDiscountType: 'FLAT',
      couponDiscountAmount: 0,
      taxableAmount: 0,
      gstRate: 0,
      gstAmount: 0,
      finalPayableAmount: 0
    },
    activeServices: []
  },

  // Scenario 4: Expired Subscription (Features Locked)
  expired: {
    scenario: 'expired',
    planId: 'plan-premium',
    planName: 'POS Premium',
    planType: 'Yearly Plan',
    billingCycle: 'YEARLY',
    startDate: '2025-07-25',
    expiryDate: '2026-07-25',
    durationDays: 365,
    daysRemaining: -6,
    status: 'EXPIRED',
    autoRenew: false,
    activeAddonsCount: 0,
    pricing: {
      originalPrice: 9999,
      adminDiscountAmount: 2000,
      adminDiscountType: 'FLAT',
      couponDiscountAmount: 0,
      taxableAmount: 7999,
      gstRate: 18,
      gstAmount: 1439.82,
      finalPayableAmount: 9438.82
    },
    activeServices: [
      {
        id: 'expired-wa',
        addonId: 'addon-wa',
        name: 'WhatsApp Marketing Engine',
        icon: 'MessageSquare',
        status: 'Expired',
        billingCycle: 'MONTHLY',
        startDate: '2026-06-25',
        expiryDate: '2026-07-25',
        usageSummary: 'Expired 6 days ago',
        creditsRemaining: 0,
        totalCredits: 2000,
        renewalPrice: 499
      }
    ]
  },

  // Scenario 5: Pending Payment Verification
  pending: {
    scenario: 'pending',
    planId: 'plan-premium',
    planName: 'POS Premium Renewal',
    planType: 'Yearly Plan',
    billingCycle: 'YEARLY',
    startDate: '2026-07-30',
    expiryDate: '2027-07-30',
    durationDays: 365,
    daysRemaining: 365,
    status: 'PENDING_PAYMENT',
    autoRenew: true,
    activeAddonsCount: 1,
    pricing: {
      originalPrice: 9999,
      adminDiscountAmount: 2000,
      adminDiscountType: 'FLAT',
      couponDiscountAmount: 0,
      taxableAmount: 7999,
      gstRate: 0,
      gstAmount: 0,
      finalPayableAmount: 7999
    },
    activeServices: []
  },

  // Scenario 6: Paused Subscription (Admin Paused)
  paused: {
    scenario: 'paused',
    planId: 'plan-premium',
    planName: 'POS Premium',
    planType: 'Yearly Plan',
    billingCycle: 'YEARLY',
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    durationDays: 365,
    daysRemaining: 153,
    status: 'PAUSED',
    autoRenew: false,
    activeAddonsCount: 0,
    pricing: {
      originalPrice: 9999,
      adminDiscountAmount: 1000,
      adminDiscountType: 'FLAT',
      couponDiscountAmount: 0,
      taxableAmount: 8999,
      gstRate: 0,
      gstAmount: 0,
      finalPayableAmount: 8999
    },
    activeServices: []
  },

  // Scenario 7: Active Plan + 3 Active Addons
  multi_addons: {
    scenario: 'multi_addons',
    planId: 'plan-premium',
    planName: 'POS Premium Multi-Suite',
    planType: 'Yearly Plan',
    billingCycle: 'YEARLY',
    startDate: '2026-05-10',
    expiryDate: '2027-05-09',
    durationDays: 365,
    daysRemaining: 282,
    status: 'ACTIVE',
    autoRenew: true,
    activeAddonsCount: 3,
    pricing: {
      originalPrice: 9999,
      adminDiscountAmount: 2000,
      adminDiscountType: 'FLAT',
      couponDiscountAmount: 0,
      taxableAmount: 7999,
      gstRate: 18,
      gstAmount: 1439.82,
      finalPayableAmount: 9438.82
    },
    activeServices: [
      {
        id: 'ma-1',
        addonId: 'addon-wa',
        name: 'WhatsApp Marketing Engine',
        icon: 'MessageSquare',
        status: 'Active',
        billingCycle: 'MONTHLY',
        startDate: '2026-07-10',
        expiryDate: '2026-08-10',
        usageSummary: '1,890 / 2,000 credits used',
        creditsRemaining: 110,
        totalCredits: 2000,
        renewalPrice: 499
      },
      {
        id: 'ma-2',
        addonId: 'addon-custom-domain',
        name: 'Custom Domain SSL',
        icon: 'Globe',
        status: 'Active',
        billingCycle: 'YEARLY',
        startDate: '2026-05-10',
        expiryDate: '2027-05-09',
        usageSummary: 'Active: www.apexbeevendor.com',
        renewalPrice: 5990
      },
      {
        id: 'ma-3',
        addonId: 'addon-restaurant-website',
        name: 'QR Table Order Engine',
        icon: 'Utensils',
        status: 'Active',
        billingCycle: 'MONTHLY',
        startDate: '2026-07-01',
        expiryDate: '2026-08-01',
        usageSummary: '14 Active Table QRs',
        renewalPrice: 799
      }
    ]
  },

  // Scenario 8: Payment Failed State
  failed: {
    scenario: 'failed',
    planId: 'plan-basic',
    planName: 'Basic Retail Plan',
    planType: 'Monthly Plan',
    billingCycle: 'MONTHLY',
    startDate: '2026-06-01',
    expiryDate: '2026-07-01',
    durationDays: 30,
    daysRemaining: -30,
    status: 'PAST_DUE',
    autoRenew: false,
    activeAddonsCount: 0,
    pricing: {
      originalPrice: 999,
      adminDiscountAmount: 0,
      couponDiscountAmount: 0,
      taxableAmount: 999,
      gstRate: 18,
      gstAmount: 179.82,
      finalPayableAmount: 1178.82
    },
    activeServices: []
  },

  // Scenario 9: No Subscription Assigned
  no_subscription: {
    scenario: 'no_subscription',
    planId: 'plan-free',
    planName: 'No Subscription Assigned',
    planType: 'Unassigned',
    billingCycle: 'MONTHLY',
    startDate: '2026-07-31',
    expiryDate: '2026-07-31',
    durationDays: 0,
    daysRemaining: 0,
    status: 'CANCELLED',
    autoRenew: false,
    activeAddonsCount: 0,
    pricing: {
      originalPrice: 0,
      adminDiscountAmount: 0,
      couponDiscountAmount: 0,
      taxableAmount: 0,
      gstRate: 0,
      gstAmount: 0,
      finalPayableAmount: 0
    },
    activeServices: []
  },

  // Scenario 10: Cancelled Subscription
  cancelled: {
    scenario: 'cancelled',
    planId: 'plan-basic',
    planName: 'Basic Plan (Cancelled)',
    planType: 'Monthly Plan',
    billingCycle: 'MONTHLY',
    startDate: '2026-05-01',
    expiryDate: '2026-06-01',
    durationDays: 30,
    daysRemaining: 0,
    status: 'CANCELLED',
    autoRenew: false,
    activeAddonsCount: 0,
    pricing: {
      originalPrice: 999,
      adminDiscountAmount: 0,
      couponDiscountAmount: 0,
      taxableAmount: 0,
      gstRate: 0,
      gstAmount: 0,
      finalPayableAmount: 0
    },
    activeServices: []
  }
};

export const MOCK_PAYMENTS: SubscriptionPayment[] = [
  {
    id: 'pay-1001',
    orderId: 'ORD-2026-8891',
    invoiceNo: 'INV-2026-001',
    itemTitle: 'POS Premium (Yearly Plan)',
    itemType: 'PLAN',
    originalAmount: 9999,
    discountAmount: 2000,
    gstAmount: 0,
    paidAmount: 7999,
    paymentMethod: 'UPI',
    paymentDate: '2026-08-01 10:30 AM',
    status: 'CAPTURED',
    pdfUrl: 'https://server.apexbee.in/uploads/invoices/mock-inv-001.pdf'
  },
  {
    id: 'pay-1002',
    orderId: 'ORD-2026-8892',
    invoiceNo: 'INV-2026-002',
    itemTitle: 'WhatsApp Marketing Engine (Monthly)',
    itemType: 'ADDON',
    originalAmount: 499,
    discountAmount: 0,
    gstAmount: 89.82,
    paidAmount: 588.82,
    paymentMethod: 'Credit Card',
    paymentDate: '2026-07-01 02:15 PM',
    status: 'CAPTURED',
    pdfUrl: 'https://server.apexbee.in/uploads/invoices/mock-inv-002.pdf'
  },
  {
    id: 'pay-1003',
    orderId: 'ORD-2026-8893',
    invoiceNo: 'INV-2026-003',
    itemTitle: 'AI Poster Generator Add-on',
    itemType: 'ADDON',
    originalAmount: 399,
    discountAmount: 0,
    gstAmount: 71.82,
    paidAmount: 470.82,
    paymentMethod: 'UPI',
    paymentDate: '2026-07-15 11:45 AM',
    status: 'CAPTURED',
    pdfUrl: 'https://server.apexbee.in/uploads/invoices/mock-inv-003.pdf'
  },
  {
    id: 'pay-1004',
    orderId: 'ORD-2026-8894',
    invoiceNo: 'INV-2026-004',
    itemTitle: 'Basic Plan Renewal Attempt',
    itemType: 'PLAN',
    originalAmount: 999,
    discountAmount: 0,
    gstAmount: 179.82,
    paidAmount: 1178.82,
    paymentMethod: 'Net Banking',
    paymentDate: '2026-07-25 04:00 PM',
    status: 'FAILED',
    failureReason: 'Bank Server Timeout / Insufficient Funds'
  },
  {
    id: 'pay-1005',
    orderId: 'ORD-2026-8895',
    invoiceNo: 'INV-2026-005',
    itemTitle: 'POS Premium Trial Security Hold',
    itemType: 'PLAN',
    originalAmount: 1,
    discountAmount: 0,
    gstAmount: 0,
    paidAmount: 1,
    paymentMethod: 'UPI',
    paymentDate: '2026-07-20 09:12 AM',
    status: 'REFUNDED',
    pdfUrl: 'https://server.apexbee.in/uploads/invoices/mock-inv-005.pdf'
  }
];

export const MOCK_INVOICES: SubscriptionInvoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-001',
    orderId: 'ORD-2026-8891',
    issuedDate: '1 August 2026',
    billingPeriod: '1 Aug 2026 - 31 Jul 2027',
    productName: 'POS Premium Yearly Subscription',
    vendorName: 'GM Super Market Nellore',
    vendorAddress: 'Door No. 12-4-501, Trunk Road, Buchireddypalem, Nellore, AP - 524305',
    gstin: '37AAAAA0000A1Z5',
    lineItems: [
      { description: 'POS Premium Yearly Plan (365 Days)', qty: 1, unitPrice: 9999, amount: 9999 },
      { description: 'Special Admin Promotion Discount (FLAT)', qty: 1, unitPrice: -2000, amount: -2000 }
    ],
    originalAmount: 9999,
    discountAmount: 2000,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalAmount: 7999,
    paymentMethod: 'UPI (Google Pay)',
    paymentReference: 'UPI-REF-998877665544',
    status: 'PAID',
    pdfUrl: 'https://server.apexbee.in/uploads/invoices/mock-inv-001.pdf'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-002',
    orderId: 'ORD-2026-8892',
    issuedDate: '1 July 2026',
    billingPeriod: '1 Jul 2026 - 31 Jul 2026',
    productName: 'WhatsApp Marketing Engine (Monthly Add-on)',
    vendorName: 'GM Super Market Nellore',
    vendorAddress: 'Door No. 12-4-501, Trunk Road, Buchireddypalem, Nellore, AP - 524305',
    gstin: '37AAAAA0000A1Z5',
    lineItems: [
      { description: 'WhatsApp Marketing Engine (2,000 SMS Credits)', qty: 1, unitPrice: 499, amount: 499 }
    ],
    originalAmount: 499,
    discountAmount: 0,
    cgst: 44.91,
    sgst: 44.91,
    igst: 0,
    totalAmount: 588.82,
    paymentMethod: 'Credit Card (HDFC **** 4910)',
    paymentReference: 'PAY-CC-7788112233',
    status: 'PAID',
    pdfUrl: 'https://server.apexbee.in/uploads/invoices/mock-inv-002.pdf'
  }
];

export const MOCK_RENEWALS: SubscriptionRenewal[] = [
  {
    id: 'ren-001',
    productId: 'plan-premium',
    productName: 'POS Premium Yearly Plan',
    productType: 'PLAN',
    currentExpiryDate: '31 July 2027',
    daysRemaining: 365,
    renewalBillingCycle: 'YEARLY',
    originalPrice: 9999,
    discountAmount: 2000,
    renewalAmount: 7999,
    isExpiringSoon: false,
    isExpired: false
  },
  {
    id: 'ren-002',
    productId: 'addon-wa',
    productName: 'WhatsApp Marketing Engine',
    productType: 'ADDON',
    currentExpiryDate: '30 August 2026',
    daysRemaining: 30,
    renewalBillingCycle: 'MONTHLY',
    originalPrice: 499,
    discountAmount: 0,
    renewalAmount: 499,
    isExpiringSoon: true,
    isExpired: false
  }
];
