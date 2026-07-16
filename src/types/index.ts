export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  accountType: 'Savings' | 'Current';
  isDefault: boolean;
  verified?: boolean;
}

export interface BusinessDocument {
  id: string;
  name: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Not Uploaded';
  uploadDate?: string;
  fileName?: string;
  url?: string;
  expiryDate?: string;
  adminNote?: string;
  category?: 'Identity' | 'Business & Tax' | 'Food & Drug License' | 'Bank' | 'Others';
}

export interface VendorProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: 'Manufacturer' | 'Wholesaler' | 'Vendor' | 'Vendor / Retailer';
  category: string;
  address: string;
  kycStatus: 'Verified' | 'Pending Verification' | 'Rejected' | 'Not Started';
  kycProgress: number; // 0 to 100
  registeredDate: string;
  gstNumber: string;
  panNumber: string;
  aadhaarNumber: string;
  bankAccounts: BankAccount[];
  documents: BusinessDocument[];
  referralCode?: string;

  // New Live Shop Settings fields
  liveStatus?: "open" | "closed" | "busy" | "vacation" | "temporarily_closed" | "accepting_preorders";
  deliveryRadiusKm?: number;
  minOrder?: number;
  deliveryCharge?: number;
  estimatedDeliveryMinutes?: number;
  whatsappNumber?: string;
  location?: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  marketplaceStatus?: 'Draft' | 'Incomplete' | 'Pending Review' | 'Approved' | 'Rejected' | 'Suspended' | 'Hidden';
  storeTags?: string[];
  storeServices?: string[];
  fssaiNumber?: string;
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
  pincode?: string;
  businessHours?: any;
  gallery?: string[];
  gstExpiry?: string;
  fssaiExpiry?: string;
  ownerContact?: string;
  managerContact?: string;
  deliveryManagerContact?: string;
  refundPolicy?: string;
  replacementPolicy?: string;
  verifiedBadge?: boolean;
}

export interface ProductVariant {
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>; // size, color, RAM, storage, weight, quantity etc.
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  subCategory: string;
  brand: string;
  description: string;
  images: string[];
  price: number; // selling price
  discount: number; // in percentage
  stock: number;
  reservedStock: number;
  weight: number; // in kg
  shippingCharges: number;
  packingCharges: number;
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Live' | 'Rejected' | 'Awaiting Reapproval' | 'Awaiting Vendor Approval';
  commissionRate: number; // percentage (admin set)
  adminReviewNotes?: string;
  isVariantProduct: boolean;
  variants: ProductVariant[];
  lastUpdated?: string;
  isStoreProduct?: boolean;
  isSubscriptionAvailable?: boolean;
  badges?: string[];
  rating?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number; // customer price
  image: string;
  variantAttributes?: Record<string, string>;
}

export interface OrderTimeline {
  status: 'New' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Returned' | 'Refunded';
  timestamp: string;
  description: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  packingCharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Card' | 'COD' | 'NetBanking';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  deliveryStatus: 'New' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Returned' | 'Refunded';
  orderDate: string;
  timeline: OrderTimeline[];
  assignedDeliveryAgent?: string;
  assignedDeliveryAgentType?: 'Platform' | 'Vendor' | 'Independent';
  returnReason?: string;
  customerNotes?: string;
  returnPhotos?: string[];
  refundStatus?: 'Pending' | 'Approved' | 'Rejected' | 'None';
  isScheduledSubscription?: boolean;
  scheduleDetails?: any;
  isLocalShopOrder?: boolean;
  deliveryAgentId?: string;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  type: 'Platform' | 'Vendor' | 'Independent';
  status: 'Active' | 'On Delivery' | 'Offline';
  rating: number;
}

export interface WalletTransaction {
  id: string;
  date: string;
  type: 'Order Earning' | 'Withdrawal' | 'Referral Bonus' | 'Refund Deduction';
  amount: number;
  referenceId: string;
  description: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  requestDate: string;
  processedDate?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  paymentMethod: 'UPI' | 'Bank Transfer';
  details: string; // UPI ID or Bank Account Details
  rejectionReason?: string;
}

export interface Referral {
  id: string;
  referredBusinessName: string;
  referredType: 'Manufacturer' | 'Wholesaler' | 'Vendor / Retailer';
  status: 'Registered' | 'Approved' | 'First Sale Completed';
  referredDate: string;
  earnings: number;
}

export interface MarketplaceNotification {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'order' | 'wallet' | 'kyc' | 'system';
  timestamp: string;
  isRead: boolean;
}

export interface RFQ {
  id: string;
  productName: string;
  sku: string;
  qtyRequested: number;
  targetPrice: number;
  status: 'Pending' | 'Sent' | 'Accepted' | 'Rejected' | 'Counter Offered';
  dateCreated: string;
  wholesalerOffer?: number;
  adminReviewNotes?: string;
}

export interface SupplierNetworkItem {
  id: string;
  name: string;
  type: 'Manufacturer' | 'Brand' | 'Distributor' | 'Supplier';
  category: string;
  rating: number;
  activeContracts: number;
  onTimeDelivery: number;
  location: string;
}

export interface TerritoryItem {
  id: string;
  state: string;
  district: string;
  mandal: string;
  activePartners: number;
  salesVolume: number;
  status: 'Active' | 'Under Expansion' | 'Inactive';
}

export interface CreditAccount {
  partnerId: string;
  partnerName: string;
  creditLimit: number;
  outstandingAmount: number;
  daysOverdue: number;
  status: 'Excellent' | 'Good' | 'Overdue' | 'Critical';
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Manager' | 'Cashier' | 'Stock Clerk' | 'Delivery Coordinator';
  email: string;
  status: 'Active' | 'Inactive';
  permissions: string[];
}

export interface CouponItem {
  _id?: string;
  code: string;
  discountType: 'Percentage' | 'Fixed Amount';
  value: number;
  minSubtotal: number;
  expiryDate: string;
  usageCount: number;
  status: 'Active' | 'Expired';
}

export interface AdCampaign {
  id: string;
  title: string;
  budget: number;
  cpc: number;
  impressions: number;
  clicks: number;
  status: 'Active' | 'Paused' | 'Completed';
  startDate: string;
}
