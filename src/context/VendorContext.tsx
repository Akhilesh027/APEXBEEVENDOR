import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  VendorProfile,
  Product,
  Order,
  DeliveryAgent,
  WalletTransaction,
  WithdrawalRequest,
  Referral,
  MarketplaceNotification,
  RFQ,
  SupplierNetworkItem,
  TerritoryItem,
  CreditAccount,
  StaffMember,
  CouponItem,
  AdCampaign
} from '../types';
import orderService from '../services/orderService';
import { compressImage } from '../services/imageCompressor';

export interface StoreDesignInfo {
  logoUrl: string;
  bannerUrl: string;
  description: string;
  returnPolicy: string;
  deliveryPolicy: string;
  highlights: string[];
  facebook: string;
  instagram: string;
  twitter: string;
  phone: string;
  email: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
  replyDate?: string;
}

export interface Quotation {
  id: string;
  wholesalerId: string;
  wholesalerName: string;
  pricePerUnit: number;
  moq: number;
  deliveryDays: number;
  rating: number;
}

export interface ProcurementOrder {
  id: string;
  productId: string;
  productName: string;
  wholesalerName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  orderDate: string;
  status: 'Placed' | 'Shipped' | 'In Transit' | 'Delivered';
  timeline: { status: string; timestamp: string; description: string }[];
}

interface VendorContextType {
  profile: VendorProfile;
  products: Product[];
  orders: Order[];
  vendorSubscriptions: any[];
  deliveryAgents: DeliveryAgent[];
  transactions: WalletTransaction[];
  withdrawals: WithdrawalRequest[];
  referrals: Referral[];
  notifications: MarketplaceNotification[];
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Auth state
  isAuthenticated: boolean;
  authPage: 'login' | 'register';
  setAuthPage: (page: 'login' | 'register') => void;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    businessType: 'Manufacturer' | 'Wholesaler' | 'Vendor' | 'Vendor / Retailer';
    address: string;
    gstNumber: string;
    category: string;
  }) => Promise<void>;
  logout: () => void;
  scheduledPickups: any[];
  bookScheduledPickup: (data: { pickupAddress: string; pickupDate: string; timeSlot: string; customer?: string; ordersCount?: number; courier?: string }) => Promise<boolean>;
  assignSubscriptionDelivery: (subId: string, agentId: string, agentType: string) => Promise<boolean>;

  // Extra states
  storeDesign: StoreDesignInfo;
  reviews: ProductReview[];
  procurementOrders: ProcurementOrder[];
  activeQuotations: Quotation[];
  procurementLoading: boolean;
  procurementProduct: string | null;

  // Business Partner Portal States
  rfqs: RFQ[];
  suppliers: SupplierNetworkItem[];
  territories: TerritoryItem[];
  creditAccounts: CreditAccount[];
  staffList: StaffMember[];
  coupons: CouponItem[];
  ads: AdCampaign[];
  entrepreneurs: any[];
  acquisitions: any[];

  // Extra Actions
  saveStoreDesign: (updated: StoreDesignInfo) => Promise<void>;
  submitReviewReply: (reviewId: string, reply: string) => void;
  requestProcurementQuotes: (productId: string) => Promise<void>;
  createProcurementOrder: (quoteId: string, qty: number) => void;
  respondToApprovalTerms: (productId: string, action: 'Accept' | 'Reject' | 'Clarify', comment?: string) => void;
  bulkUpdateProducts: (type: 'stock' | 'price' | 'category', payload: any) => void;
  respondToRFQ: (rfqId: string, action: 'Accept' | 'Reject' | 'Counter', counterPrice?: number) => void;
  addStaff: (member: Omit<StaffMember, 'id'>) => void;
  addCoupon: (coupon: CouponItem) => Promise<boolean>;
  deleteCoupon: (id: string) => Promise<void>;
  addAd: (ad: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'startDate'>) => void;

  // Actions
  updateProfile: (updated: Partial<VendorProfile>) => void;
  uploadDocument: (docId: string, file: File) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'status' | 'commissionRate'>) => void;
  updateProductStock: (id: string, newStock: number) => void;
  updateProductPrice: (id: string, newPrice: number) => void;
  acceptCommission: (productId: string) => void;
  negotiateCommission: (productId: string, proposedRate: number, message: string) => void;

  // Order Actions
  acceptOrder: (orderId: string) => void;
  packOrder: (orderId: string) => void;
  assignDelivery: (orderId: string, agentId: string, agentType: 'Platform' | 'Vendor' | 'Independent') => void;
  shipOrder: (orderId: string) => void;
  deliverOrder: (orderId: string) => void;
  approveReturn: (orderId: string) => void;
  rejectReturn: (orderId: string) => void;

  // Wallet & Withdrawals
  requestWithdrawal: (amount: number, method: 'UPI' | 'Bank Transfer', details: string) => Promise<boolean>;

  // Notifications
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (title: string, description: string, type: 'product' | 'order' | 'wallet' | 'kyc' | 'system') => void;

  // Statistics
  stats: {
    totalRevenue: number;
    totalOrders: number;
    productsListed: number;
    activeProducts: number;
    pendingProducts: number;
    walletBalance: number;
    pendingEarnings: number;
    lowStockCount: number;
    returnRequestsCount: number;
  };
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);


export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
  const [profile, setProfile] = useState<VendorProfile>(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const type = user.roles?.includes('manufacturer') ? 'Manufacturer' :
          user.roles?.includes('wholesaler') ? 'Wholesaler' : 'Vendor';
        return {
          id: user.id || user._id || "",
          businessName: user.sellerProfile?.businessName || user.name || "My Business",
          ownerName: user.name || "",
          email: user.email || "",
          phone: user.phone || user.mobile || "",
          businessType: type as any,
          category: user.sellerProfile?.businessType || "General",
          address: user.sellerProfile?.addressText || "",
          kycStatus: (user.sellerProfile?.kycStatus === 'Approved') ? 'Verified' : 'Pending Verification',
          kycProgress: (user.sellerProfile?.kycStatus === 'Approved') ? 100 : 50,
          registeredDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          gstNumber: user.sellerProfile?.gstNumber || '',
          panNumber: user.sellerProfile?.panNumber || '',
          aadhaarNumber: user.sellerProfile?.aadhaarNumber || '',
          bankAccounts: [],
          documents: [],
          referralCode: user.referralCode || ''
        };
      } catch (e) {
        console.error(e);
      }
    }
    // Return empty profile — fetchVendorData will hydrate it from backend
    return {
      id: '',
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      businessType: 'Vendor',
      category: 'General',
      address: '',
      kycStatus: 'Not Started',
      kycProgress: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      gstNumber: '',
      panNumber: '',
      aadhaarNumber: '',
      bankAccounts: [],
      documents: []
    };
  });
  const [statsState, setStatsState] = useState<any>(null);

  const fetchVendorData = async (userId: string, token: string) => {
    try {
      const profileRes = await fetch(`https://server.apexbee.in/api/vendor/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.vendor) {
          const v = profileData.vendor;
          const documents = v.documents || [];
          const uploadedOrApproved = documents.filter((d: any) => d.status === 'Approved' || d.status === 'Pending').length;
          const progress = documents.length > 0 ? Math.round((uploadedOrApproved / documents.length) * 100) : 0;
          let newKycStatus: VendorProfile['kycStatus'] = 'Not Started';
          if (progress === 100) {
            newKycStatus = documents.every((d: any) => d.status === 'Approved') ? 'Verified' : 'Pending Verification';
          } else if (progress > 0) {
            newKycStatus = 'Pending Verification';
          }

          setProfile({
            id: v._id,
            businessName: v.businessName,
            ownerName: v.ownerName,
            email: v.email,
            phone: v.mobile || v.phone || '',
            businessType: v.businessType || 'Vendor',
            category: v.category || 'General',
            address: v.address,
            kycStatus: newKycStatus,
            kycProgress: progress,
            registeredDate: new Date(v.createdAt).toISOString().split('T')[0],
            gstNumber: v.gstNumber || '',
            panNumber: v.panNumber || '',
            aadhaarNumber: v.aadhaarNumber || '',
            bankAccounts: v.bankAccounts || [],
            documents: v.documents || [],
            referralCode: v.referralCode || '',
            liveStatus: v.liveStatus,
            deliveryRadiusKm: v.deliveryRadiusKm,
            minOrder: v.minOrder,
            deliveryCharge: v.deliveryCharge,
            estimatedDeliveryMinutes: v.estimatedDeliveryMinutes,
            whatsappNumber: v.whatsappNumber,
            location: v.location,
            marketplaceStatus: v.marketplaceStatus,
            storeTags: v.storeTags || [],
            storeServices: v.storeServices || [],
            fssaiNumber: v.fssaiNumber || '',
            state: v.state || '',
            district: v.district || '',
            mandal: v.mandal || '',
            village: v.village || '',
            pincode: v.pincode || '',
            businessHours: v.businessHours || {}
          });

          if (v.storeDesign) {
            setStoreDesign(v.storeDesign);
          }
        }
      }

      const statsRes = await fetch(`https://server.apexbee.in/api/vendor/dashboard-stats/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) {
          setStatsState(statsData.stats);
        }
      }

      // Fetch actual orders for vendor
      const ordersRes = await fetch(`https://server.apexbee.in/api/orders?sellerId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const list = ordersData.orders || [];
        const mapped = list.map((order: any) => {
          const timeline = (order.timeline || []).map((t: any) => ({
            status: t.status === 'Placed' ? 'New' : t.status as any,
            timestamp: t.date || new Date().toISOString(),
            description: t.note || ''
          }));

          const subtotal = order.orderSummary?.subtotal || order.totalAmount || 0;
          const discount = order.orderSummary?.discount || 0;
          const shippingCharge = order.orderSummary?.shipping || 0;
          const packingCharge = order.orderSummary?.packing || 0;
          const totalAmount = order.orderSummary?.total || order.totalAmount || 0;

          const paymentMethod = order.paymentDetails?.method === 'upi' ? 'UPI' :
            order.paymentDetails?.method === 'cod' ? 'COD' :
              order.paymentDetails?.method === 'wallet' ? 'Card' : 'COD';

          const paymentStatus = order.paymentStatus === 'Paid' || order.paymentDetails?.status === 'completed' ? 'Paid' :
            order.paymentStatus === 'Refunded' ? 'Refunded' : 'Pending';

          let deliveryStatus: any = 'New';
          if (order.orderStatus === 'Placed') deliveryStatus = 'New';
          else if (order.orderStatus === 'Confirmed') deliveryStatus = 'Processing';
          else if (order.orderStatus === 'Packed') deliveryStatus = 'Packed';
          else if (order.orderStatus === 'Shipped') deliveryStatus = 'Shipped';
          else if (order.orderStatus === 'Delivered') deliveryStatus = 'Delivered';
          else if (order.orderStatus === 'Returned') deliveryStatus = 'Returned';
          else if (order.orderStatus === 'Payment Verified') deliveryStatus = 'Processing';

          return {
            id: order.orderNumber || order._id,
            _id: order._id,
            customerName: order.shippingAddress?.name || order.customerId?.name || 'Customer',
            customerPhone: order.shippingAddress?.phone || order.customerId?.phone || '',
            deliveryAddress: order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}` : 'No address',
            items: (order.orderItems || order.items || []).map((it: any) => ({
              productId: it.productId,
              productName: it.name || it.productName || 'Product',
              sku: it.sku || '',
              quantity: it.quantity || 1,
              price: it.price || 0,
              image: it.image || '/placeholder.png'
            })),
            subtotal,
            shippingCharge,
            packingCharge,
            discount,
            totalAmount,
            paymentMethod,
            paymentStatus,
            deliveryStatus,
            orderDate: order.createdAt || new Date().toISOString(),
            timeline,
            assignedDeliveryAgent: order.assignedDeliveryAgent || '',
            assignedDeliveryAgentType: order.assignedDeliveryAgentType || 'Platform',
            returnReason: order.returnReason || '',
            customerNotes: order.customerNotes || '',
            refundStatus: order.refundStatus || 'None',
            isScheduledSubscription: order.isScheduledSubscription || false,
            scheduleDetails: order.scheduleDetails || null
          };
        });
        setOrders(mapped);
      }

      // Fetch vendor subscriptions
      try {
        const subsRes = await fetch(`https://server.apexbee.in/api/local-shop/subscriptions/vendor/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (subsRes.ok) {
          const subsData = await subsRes.json();
          if (subsData.success) {
            setVendorSubscriptions(subsData.subscriptions || []);
          }
        }
      } catch (err) {
        console.error("Error fetching vendor subscriptions:", err);
      }

      // Fetch actual delivery agents
      try {
        const agentsRes = await fetch(`https://server.apexbee.in/api/delivery/agents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          if (agentsData.success && agentsData.deliveryAgents) {
            setDeliveryAgents(agentsData.deliveryAgents);
          }
        }
      } catch (err) {
        console.error("Error fetching delivery agents:", err);
      }

      // Fetch actual scheduled pickups
      try {
        const pickupsRes = await fetch(`https://server.apexbee.in/api/delivery/pickups`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (pickupsRes.ok) {
          const pickupsData = await pickupsRes.json();
          if (pickupsData.success && pickupsData.pickups) {
            setScheduledPickups(pickupsData.pickups);
          }
        }
      } catch (err) {
        console.error("Error fetching scheduled pickups:", err);
      }

      // Fetch actual products for vendor
      const productsRes = await fetch(`https://server.apexbee.in/api/products?sellerId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        const plist = productsData.products || productsData.data || [];
        const mappedProds = plist.map((p: any) => ({
          id: p._id,
          name: p.name,
          sku: p.sku || '',
          category: p.category || '',
          subCategory: p.subCategory || '',
          brand: p.brand || '',
          description: p.description || '',
          images: p.images || [],
          price: p.price || 0,
          discount: p.discount || 0,
          stock: p.stock || 0,
          reservedStock: p.reservedStock || 0,
          weight: p.weight || 0,
          shippingCharges: p.shippingCharges || 0,
          packingCharges: p.packingCharges || 0,
          status: p.status || 'Approved',
          commissionRate: p.commissionRate || 10,
          variants: p.variants || [],
          isVariantProduct: p.isVariantProduct || false
        }));
        setProducts(mappedProds);
      }

      // Fetch actual withdrawals
      const withdrawalsRes = await fetch(`https://server.apexbee.in/api/wallet/withdrawals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (withdrawalsRes.ok) {
        const withdrawalsData = await withdrawalsRes.json();
        if (withdrawalsData.success && withdrawalsData.withdrawals) {
          const wlist = withdrawalsData.withdrawals.map((w: any) => {
            const noteParts = (w.note || '').split(' | ');
            const paymentMethod = noteParts[0] || 'UPI';
            const details = noteParts[1] || w.note || '';
            return {
              id: w._id || w.id,
              amount: w.amount,
              requestDate: w.createdAt || new Date().toISOString(),
              status: w.status === 'pending' ? 'Pending' : w.status === 'completed' ? 'Completed' : w.status === 'rejected' ? 'Rejected' : w.status,
              paymentMethod: paymentMethod as any,
              details: details
            };
          });
          setWithdrawals(wlist);
        }
      }

      // Fetch actual referrals
      const referralsRes = await fetch(`https://server.apexbee.in/api/referrals/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        if (Array.isArray(referralsData)) {
          const rlist = referralsData.map((r: any, idx: number) => ({
            id: `REF-${idx}-${Date.now()}`,
            referredBusinessName: r.name,
            referredType: (r.role.includes('vendor') ? 'Vendor / Retailer' : r.role.includes('wholesaler') ? 'Wholesaler' : 'Manufacturer') as 'Vendor / Retailer' | 'Wholesaler' | 'Manufacturer',
            status: (r.status === 'rewarded' ? 'First Sale Completed' : r.status === 'approved' ? 'Approved' : 'Registered') as 'Approved' | 'Registered' | 'First Sale Completed',
            referredDate: new Date().toISOString().split('T')[0],
            earnings: r.reward
          }));
          setReferrals(rlist);
        }
      }

      // Fetch actual notifications
      const notificationsRes = await fetch(`https://server.apexbee.in/api/notifications/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        if (notificationsData.success && notificationsData.notifications) {
          const nlist = notificationsData.notifications.map((n: any) => ({
            id: n._id || n.id,
            title: n.title,
            description: n.message || n.description,
            type: n.type || 'system',
            timestamp: n.createdAt || new Date().toISOString(),
            isRead: n.isRead || false
          }));
          setNotifications(nlist);
        }
      }

      // Fetch actual coupons
      const couponsRes = await fetch(`https://server.apexbee.in/api/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        if (couponsData.success && couponsData.coupons) {
          const clist = couponsData.coupons.map((c: any) => ({
            _id: c._id,
            code: c.code,
            discountType: c.discountType,
            value: c.discountValue,
            minSubtotal: c.minSubtotal || 0,
            expiryDate: c.expiryDate,
            usageCount: c.usageCount || 0,
            status: c.status
          }));
          setCoupons(clist);
        }
      }

      const entRes = await fetch(`https://server.apexbee.in/api/vendor/entrepreneurs/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (entRes.ok) {
        const entData = await entRes.json();
        if (entData.success) {
          setEntrepreneurs(entData.entrepreneurs || []);
          setAcquisitions(entData.acquisitions || []);
        }
      }
    } catch (err) {
      console.error('Error fetching vendor data:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (token && user) {
      setIsAuthenticated(true);
      fetchVendorData(user.id || user._id, token);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && profile && profile.businessName && profile.businessName !== "Mumbai Fashion Hub") {
      setProducts(prev => prev.map(p => {
        if (p.brand === "Mumbai Fashion Hub" || !p.brand) {
          return { ...p, brand: profile.businessName };
        }
        return p;
      }));

      setStoreDesign(prev => {
        const updated = { ...prev };
        if (prev.email === 'support@mumbaifashionhub.com') {
          updated.email = profile.email || `support@${profile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        }
        if (prev.phone === '+91 98765 43210') {
          updated.phone = profile.phone || prev.phone;
        }
        if (prev.facebook === 'https://facebook.com/mumbaifashionhub') {
          updated.facebook = `https://facebook.com/${profile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        }
        if (prev.instagram === 'https://instagram.com/mumbaifashionhub') {
          updated.instagram = `https://instagram.com/${profile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        }
        if (prev.twitter === 'https://twitter.com/mumbaifashion') {
          updated.twitter = `https://twitter.com/${profile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        }
        return updated;
      });
    }
  }, [isAuthenticated, profile.businessName, profile.email, profile.phone]);

  const [products, setProducts] = useState<Product[]>([]);


  const [storeDesign, setStoreDesign] = useState<StoreDesignInfo>({
    logoUrl: '',
    bannerUrl: '',
    description: '',
    returnPolicy: 'Easy 7-day returns on all unused items.',
    deliveryPolicy: 'Dispatch within 24 hours.',
    highlights: [],
    facebook: '',
    instagram: '',
    twitter: '',
    phone: '',
    email: ''
  });

  const [reviews, setReviews] = useState<ProductReview[]>([]);

  const [procurementOrders, setProcurementOrders] = useState<ProcurementOrder[]>([]);
  const [activeQuotations, setActiveQuotations] = useState<Quotation[]>([]);
  const [procurementLoading, setProcurementLoading] = useState<boolean>(false);
  const [procurementProduct, setProcurementProduct] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorSubscriptions, setVendorSubscriptions] = useState<any[]>([]);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [scheduledPickups, setScheduledPickups] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>([]);

  // Business Partner Portal States
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [suppliers] = useState<SupplierNetworkItem[]>([]);
  const [territories] = useState<TerritoryItem[]>([]);
  const [creditAccounts] = useState<CreditAccount[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [acquisitions, setAcquisitions] = useState<any[]>([]);

  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [currentPage, setCurrentPageState] = useState<string>(() => {
    return localStorage.getItem('vendor_current_page') || 'dashboard';
  });

  const setCurrentPage = (page: string) => {
    localStorage.setItem('vendor_current_page', page);
    setCurrentPageState(page);
  };

  // Load theme from body class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  const updateProfile = async (updated: Partial<VendorProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!token || !user) return;
    try {
      const payload: any = {};
      if (updated.businessName !== undefined) payload.businessName = updated.businessName;
      if (updated.ownerName !== undefined) payload.ownerName = updated.ownerName;
      if (updated.email !== undefined) payload.email = updated.email;
      if (updated.phone !== undefined) payload.mobile = updated.phone;
      if (updated.address !== undefined) payload.address = updated.address;
      if (updated.gstNumber !== undefined) payload.gstNumber = updated.gstNumber;
      if (updated.panNumber !== undefined) payload.panNumber = updated.panNumber;
      if (updated.bankAccounts !== undefined) payload.bankAccounts = updated.bankAccounts;
      if (updated.liveStatus !== undefined) payload.liveStatus = updated.liveStatus;
      if (updated.deliveryRadiusKm !== undefined) payload.deliveryRadiusKm = updated.deliveryRadiusKm;
      if (updated.minOrder !== undefined) payload.minOrder = updated.minOrder;
      if (updated.deliveryCharge !== undefined) payload.deliveryCharge = updated.deliveryCharge;
      if (updated.estimatedDeliveryMinutes !== undefined) payload.estimatedDeliveryMinutes = updated.estimatedDeliveryMinutes;
      if (updated.whatsappNumber !== undefined) payload.whatsappNumber = updated.whatsappNumber;
      if (updated.location !== undefined) payload.location = updated.location;
      if (updated.marketplaceStatus !== undefined) payload.marketplaceStatus = updated.marketplaceStatus;
      if (updated.storeTags !== undefined) payload.storeTags = updated.storeTags;
      if (updated.storeServices !== undefined) payload.storeServices = updated.storeServices;
      if (updated.fssaiNumber !== undefined) payload.fssaiNumber = updated.fssaiNumber;
      if (updated.state !== undefined) payload.state = updated.state;
      if (updated.district !== undefined) payload.district = updated.district;
      if (updated.mandal !== undefined) payload.mandal = updated.mandal;
      if (updated.village !== undefined) payload.village = updated.village;
      if (updated.pincode !== undefined) payload.pincode = updated.pincode;
      if (updated.businessHours !== undefined) payload.businessHours = updated.businessHours;

      await fetch(`https://server.apexbee.in/api/vendor/profile/${user.id || user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Failed to sync profile update to server:', err);
    }
  };

  const uploadDocument = async (docId: string, file: File) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!token || !user) return;

    try {
      // Auto-compress image if it's an image file
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        try {
          processedFile = await compressImage(file, { maxSizeKB: 3072, maxDimension: 2048, quality: 0.85 });
        } catch {
          processedFile = file; // Use original if compression fails
        }
      }

      const formData = new FormData();
      formData.append('file', processedFile);

      const uploadRes = await fetch('https://server.apexbee.in/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadData = await uploadRes.json();
      const fileUrl = uploadData.url;

      const updateRes = await fetch(`https://server.apexbee.in/api/vendor/profile/${user.id || user._id}/document`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          docId,
          url: fileUrl,
          fileName: file.name
        })
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update document metadata');
      }

      const updateData = await updateRes.json();
      if (updateData.success && updateData.vendor) {
        const v = updateData.vendor;
        const documents = v.documents || [];
        const uploadedOrApproved = documents.filter((d: any) => d.status === 'Approved' || d.status === 'Pending').length;
        const progress = documents.length > 0 ? Math.round((uploadedOrApproved / documents.length) * 100) : 0;
        let newKycStatus: VendorProfile['kycStatus'] = 'Not Started';
        if (progress === 100) {
          newKycStatus = documents.every((d: any) => d.status === 'Approved') ? 'Verified' : 'Pending Verification';
        } else if (progress > 0) {
          newKycStatus = 'Pending Verification';
        }

        setProfile({
          id: v._id,
          businessName: v.businessName,
          ownerName: v.ownerName,
          email: v.email,
          phone: v.mobile || v.phone || '',
          businessType: v.businessType || 'Vendor',
          category: v.category || 'General',
          address: v.address,
          kycStatus: newKycStatus,
          kycProgress: progress,
          registeredDate: new Date(v.createdAt).toISOString().split('T')[0],
          gstNumber: v.gstNumber || '',
          panNumber: v.panNumber || '',
          aadhaarNumber: v.aadhaarNumber || '',
          bankAccounts: v.bankAccounts || [],
          documents: v.documents || []
        });
      }

      addNotification(
        "Document Uploaded",
        `Document updated. Admin review pending.`,
        'kyc'
      );
    } catch (err) {
      console.error('Failed uploading document:', err);
      alert('Failed to upload document.');
    }
  };

  const addNotification = (title: string, description: string, type: 'product' | 'order' | 'wallet' | 'kyc' | 'system') => {
    const newNotif: MarketplaceNotification = {
      id: `NOT-${Date.now()}`,
      title,
      description,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addProduct = async (newProduct: Omit<Product, 'id' | 'status' | 'commissionRate'>) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('https://server.apexbee.in/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        await fetchVendorData(profile.id, token);
        addNotification(
          "Product Submitted",
          `Product "${newProduct.name}" has been uploaded and sent for Admin Approval.`,
          'product'
        );
      }
    } catch (err) {
      console.error('Add product error:', err);
    }
  };

  const updateProductStock = async (id: string, newStock: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`https://server.apexbee.in/api/products/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds: [id],
          updateData: { stock: newStock }
        })
      });
      if (res.ok) {
        await fetchVendorData(profile.id, token);
        addNotification(
          "Stock Updated",
          `Stock updated to ${newStock} units.`,
          'product'
        );
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  const updateProductPrice = async (id: string, newPrice: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`https://server.apexbee.in/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ baseSellingPrice: newPrice })
      });
      if (res.ok) {
        await fetchVendorData(profile.id, token);
        addNotification(
          "Price Update Requested",
          `Price update request to ₹${newPrice} sent for Admin Review.`,
          'product'
        );
      }
    } catch (err) {
      console.error('Failed to update price:', err);
    }
  };

  const saveStoreDesign = async (updated: StoreDesignInfo) => {
    setStoreDesign(updated);
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!token || !user) return;
    try {
      await fetch(`https://server.apexbee.in/api/vendor/profile/${user.id || user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ storeDesign: updated })
      });
      addNotification("Storefront Updated", "Your store customization settings have been saved successfully.", "system");
    } catch (err) {
      console.error('Failed to save store design:', err);
    }
  };

  const submitReviewReply = (reviewId: string, reply: string) => {
    setReviews(prev =>
      prev.map(r => r.id === reviewId ? { ...r, reply, replyDate: new Date().toISOString().split('T')[0] } : r)
    );
    addNotification("Review Replied", "Your response has been published online.", "system");
  };

  const requestProcurementQuotes = async (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setProcurementProduct(productId);
    setProcurementLoading(true);
    setActiveQuotations([]);

    // Simulate wholesalers sending quotes after 1.5s
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockQuotes: Quotation[] = [
      { id: 'Q-1', wholesalerId: 'W-1', wholesalerName: 'Surat Textiles Wholesalers', pricePerUnit: Math.round(prod.price * 0.4), moq: 100, deliveryDays: 5, rating: 4.8 },
      { id: 'Q-2', wholesalerId: 'W-2', wholesalerName: 'Deccan Fabric Distributors', pricePerUnit: Math.round(prod.price * 0.43), moq: 50, deliveryDays: 3, rating: 4.6 },
      { id: 'Q-3', wholesalerId: 'W-3', wholesalerName: 'Mumbai Garment Depot', pricePerUnit: Math.round(prod.price * 0.48), moq: 20, deliveryDays: 1, rating: 4.2 }
    ];

    setActiveQuotations(mockQuotes);
    setProcurementLoading(false);
    addNotification("Quotations Received", `Received 3 wholesaler quotes for "${prod.name}".`, "system");
  };

  const createProcurementOrder = (quoteId: string, qty: number) => {
    const quote = activeQuotations.find(q => q.id === quoteId);
    const prod = products.find(p => p.id === procurementProduct);
    if (!quote || !prod) return;

    const newOrder: ProcurementOrder = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: prod.id,
      productName: prod.name,
      wholesalerName: quote.wholesalerName,
      quantity: qty,
      pricePerUnit: quote.pricePerUnit,
      totalAmount: quote.pricePerUnit * qty,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Placed',
      timeline: [
        { status: 'Placed', timestamp: new Date().toISOString(), description: `Purchase Order placed with ${quote.wholesalerName} for ${qty} units.` }
      ]
    };

    setProcurementOrders(prev => [newOrder, ...prev]);

    // Outbound payment
    const newTxn = {
      id: `TXN-PO-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString(),
      type: 'Refund Deduction' as const,
      amount: -(quote.pricePerUnit * qty),
      referenceId: newOrder.id,
      description: `Procurement payment for PO ${newOrder.id} (${quote.wholesalerName})`,
      status: 'Completed' as const
    };
    setTransactions(prev => [newTxn, ...prev]);

    addNotification("Procurement Order Placed", `PO placed successfully with ${quote.wholesalerName} for ₹${newOrder.totalAmount.toLocaleString('en-IN')}.`, "wallet");

    // consignment tracking simulation in 15 seconds
    setTimeout(() => {
      setProcurementOrders(prev =>
        prev.map(o => {
          if (o.id === newOrder.id) {
            return {
              ...o,
              status: 'Shipped',
              timeline: [...o.timeline, { status: 'Shipped', timestamp: new Date().toISOString(), description: "Wholesaler dispatched the consignment via local freight cargo." }]
            };
          }
          return o;
        })
      );
      addNotification("PO Shipped", `Procurement shipment for PO ${newOrder.id} is in transit.`, "system");
    }, 15000);
  };

  const acceptCommission = async (productId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`https://server.apexbee.in/api/products/${productId}/seller-accept-pricing`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchVendorData(profile.id, token);
        addNotification(
          "Commission Accepted",
          `You accepted the commission. Product is now Live.`,
          'product'
        );
      }
    } catch (err) {
      console.error('Failed to accept commission:', err);
    }
  };

  const negotiateCommission = async (productId: string, proposedRate: number, message: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`https://server.apexbee.in/api/products/${productId}/seller-negotiate-pricing`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          requestedPlatformFeePercent: proposedRate
        })
      });
      if (res.ok) {
        await fetchVendorData(profile.id, token);
        addNotification(
          "Negotiation Submitted",
          `Proposed counter-offer of ${proposedRate}% commission submitted.`,
          'product'
        );
      }
    } catch (err) {
      console.error('Failed to negotiate commission:', err);
    }
  };

  const respondToApprovalTerms = async (productId: string, action: 'Accept' | 'Reject' | 'Clarify', comment?: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (action === 'Accept') {
        await acceptCommission(productId);
      } else if (action === 'Reject') {
        const res = await fetch(`https://server.apexbee.in/api/products/${productId}/reject`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: comment || 'Rejected by vendor' })
        });
        if (res.ok) {
          await fetchVendorData(profile.id, token);
          addNotification("Terms Rejected", `Listing rejected by vendor.`, "product");
        }
      } else {
        await negotiateCommission(productId, 10, comment || 'Vendor clarification');
      }
    } catch (err) {
      console.error('Failed to respond to terms:', err);
    }
  };

  const bulkUpdateProducts = async (type: 'stock' | 'price' | 'category', payload: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`https://server.apexbee.in/api/products/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds: payload.productIds || [],
          updateData: { [type]: payload.value }
        })
      });
      if (res.ok) {
        await fetchVendorData(profile.id, token);
        addNotification(
          "Products Updated",
          `Bulk updated products successfully.`,
          'product'
        );
      }
    } catch (err) {
      console.error('Bulk update error:', err);
    }
  };

  // Order Actions
  const acceptOrder = async (orderId: string) => {
    const matched = orders.find(o => o.id === orderId);
    if (!matched) return;

    try {
      await orderService.acceptOrder(matched);
      const token = localStorage.getItem('token');
      if (token) await fetchVendorData(profile.id, token);

      addNotification('Order Confirmed', `Order ${orderId} has been confirmed.`, 'order');
    } catch (err: any) {
      alert(err.message || 'Failed to confirm order');
    }
  };

  const packOrder = async (orderId: string) => {
    const matched = orders.find(o => o.id === orderId);
    if (!matched) return;

    try {
      await orderService.packOrder(matched);
      const token = localStorage.getItem('token');
      if (token) await fetchVendorData(profile.id, token);

      addNotification('Order Packed', `Order ${orderId} is packed and ready.`, 'order');
    } catch (err: any) {
      alert(err.message || 'Failed to pack order');
    }
  };

  const assignDelivery = async (
    orderId: string,
    agentId: string,
    agentType: 'Platform' | 'Vendor' | 'Independent'
  ) => {
    const matched = orders.find(o => o.id === orderId);
    if (!matched) return;

    const agent = deliveryAgents.find(a => a.id === agentId);

    try {
      await orderService.assignDelivery(matched, agentId, agentType, agent?.name);

      setDeliveryAgents(prev =>
        prev.map(a => a.id === agentId ? { ...a, status: 'On Delivery' } : a)
      );

      const token = localStorage.getItem('token');
      if (token) await fetchVendorData(profile.id, token);

      addNotification('Delivery Agent Assigned', `Agent assigned to order ${orderId}.`, 'order');
    } catch (err: any) {
      alert(err.message || 'Failed to assign delivery agent');
    }
  };

  const shipOrder = async (orderId: string) => {
    const matched = orders.find(o => o.id === orderId);
    if (!matched) return;

    try {
      await orderService.shipOrder(matched);
      const token = localStorage.getItem('token');
      if (token) await fetchVendorData(profile.id, token);

      addNotification('Order Shipped', `Order ${orderId} has been marked as shipped.`, 'order');
    } catch (err: any) {
      alert(err.message || 'Failed to ship order');
    }
  };

  const deliverOrder = async (orderId: string) => {
    const matched = orders.find(o => o.id === orderId);
    if (!matched) return;

    try {
      await orderService.deliverOrder(matched);

      const token = localStorage.getItem('token');
      if (token) await fetchVendorData(profile.id, token);

      addNotification('Order Delivered', `Order ${orderId} has been delivered successfully.`, 'wallet');
    } catch (err: any) {
      alert(err.message || 'Failed to deliver order');
    }
  };

  const approveReturn = async (orderId: string) => {
    const matched = orders.find(o => o.id === orderId);
    if (!matched) return;

    try {
      await orderService.approveReturn(matched);

      const token = localStorage.getItem('token');
      if (token) await fetchVendorData(profile.id, token);

      addNotification('Return Approved', `Refund processed for order ${orderId}.`, 'order');
    } catch (err: any) {
      alert(err.message || 'Failed to approve return');
    }
  };

  const rejectReturn = async (orderId: string) => {
    const matched = orders.find(o => o.id === orderId);
    if (!matched) return;

    try {
      await orderService.rejectReturn(matched);

      const token = localStorage.getItem('token');
      if (token) await fetchVendorData(profile.id, token);

      addNotification('Return Rejected', `Return request for order ${orderId} was rejected.`, 'order');
    } catch (err: any) {
      alert(err.message || 'Failed to reject return');
    }
  };

  const requestWithdrawal = async (amount: number, method: 'UPI' | 'Bank Transfer', details: string): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const res = await fetch('https://server.apexbee.in/api/wallet/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          note: `${method} | ${details}`
        })
      });
      if (res.ok) {
        await fetchVendorData(profile.id, token);
        addNotification(
          "Withdrawal Requested",
          `Withdrawal request for ₹${amount} submitted successfully.`,
          'wallet'
        );
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Withdrawal request failed');
        return false;
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      return false;
    }
  };

  const bookScheduledPickup = async (data: {
    pickupAddress: string;
    pickupDate: string;
    timeSlot: string;
    customer?: string;
    ordersCount?: number;
    courier?: string;
  }): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const res = await fetch('https://server.apexbee.in/api/delivery/pickups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await fetchVendorData(profile.id, token);
        addNotification(
          "Pickup Scheduled",
          `Reserved slot for date ${data.pickupDate} successfully.`,
          'system'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to book scheduled pickup:', err);
      return false;
    }
  };

  const assignSubscriptionDelivery = async (subId: string, agentId: string, agentType: string): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const agent = deliveryAgents.find(a => a.id === agentId);
      const agentName = agent ? agent.name : 'Platform Agent';

      const res = await fetch(`https://server.apexbee.in/api/local-shop/subscriptions/${subId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deliveryAgentId: agentId,
          deliveryAgentType: agentType,
          deliveryAgentName: agentName
        })
      });
      if (res.ok) {
        await fetchVendorData(profile.id, token);
        addNotification(
          "Delivery Assigned",
          `Assigned ${agentName} to subscription ${subId}.`,
          'system'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to assign subscription delivery:', err);
      return false;
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('https://server.apexbee.in/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const token = data.token;
      const user = data.user;

      const userRoles = user.roles || [user.role];

      const permittedRoles = ['vendor', 'wholesaler', 'manufacturer', 'admin'];

      const hasRole = userRoles.some((r: string) =>
        permittedRoles.includes(String(r).toLowerCase())
      );

      if (!hasRole) {
        throw new Error('Access Denied: You do not have an active vendor profile.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      await fetchVendorData(user.id || user._id, token);

      setIsAuthenticated(true);
      setCurrentPage('dashboard');
      addNotification(
        'Welcome Back!',
        'Logged into your Vendor Portal successfully.',
        'system'
      );

      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (data: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    businessType: 'Manufacturer' | 'Wholesaler' | 'Vendor' | 'Vendor / Retailer';
    address: string;
    gstNumber: string;
    category: string;
  }): Promise<void> => {
    // Call real registration API
    const res = await fetch('https://server.apexbee.in/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.ownerName,
        email: data.email,
        phone: data.phone,
        password: (data as any).password || '',
        role: data.businessType.toLowerCase().replace(/\//g, '').replace(/\s+/g, '_'),
        businessName: data.businessName,
        businessType: data.businessType,
        category: data.category,
        address: data.address,
        gstNumber: data.gstNumber
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }
    const regData = await res.json();
    // Store token & user from backend
    if (regData.token) localStorage.setItem('token', regData.token);
    if (regData.user) localStorage.setItem('user', JSON.stringify(regData.user));

    setProducts([]);
    setOrders([]);
    setTransactions([]);
    setWithdrawals([]);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    // Fetch real profile from backend
    if (regData.user) {
      await fetchVendorData(regData.user.id || regData.user._id, regData.token || localStorage.getItem('token') || '');
    }
    addNotification("Account Created", `Welcome ${data.ownerName}! Your business "${data.businessName}" is now registered. Please complete your KYC verification.`, "system");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthPage('login');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('vendor_current_page');
    setStatsState(null);
    // Reset all state to empty — no mock data
    setProfile({
      id: '', businessName: '', ownerName: '', email: '', phone: '',
      businessType: 'Vendor', category: 'General', address: '',
      kycStatus: 'Not Started', kycProgress: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      gstNumber: '', panNumber: '', aadhaarNumber: '',
      bankAccounts: [], documents: []
    });
    setProducts([]);
    setOrders([]);
    setTransactions([]);
    setWithdrawals([]);
    setStoreDesign({ logoUrl: '', bannerUrl: '', description: '', returnPolicy: '', deliveryPolicy: '', highlights: [], facebook: '', instagram: '', twitter: '', phone: '', email: '' });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const respondToRFQ = (rfqId: string, action: 'Accept' | 'Reject' | 'Counter', counterPrice?: number) => {
    setRfqs(prev =>
      prev.map(r => {
        if (r.id === rfqId) {
          addNotification(
            "RFQ Responded",
            `RFQ ${rfqId} has been ${action.toLowerCase()}ed.`,
            'system'
          );
          return {
            ...r,
            status: action === 'Accept' ? 'Accepted' : action === 'Reject' ? 'Rejected' : 'Counter Offered',
            wholesalerOffer: counterPrice !== undefined ? counterPrice : r.wholesalerOffer
          };
        }
        return r;
      })
    );
  };

  const addStaff = (member: Omit<StaffMember, 'id'>) => {
    const newMember: StaffMember = {
      ...member,
      id: `STF-${Math.floor(100 + Math.random() * 900)}`
    };
    setStaffList(prev => [...prev, newMember]);
    addNotification("Staff Added", `Staff member ${member.name} has been added.`, 'system');
  };

  const addCoupon = async (coupon: CouponItem): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const res = await fetch('https://server.apexbee.in/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.value,
          minSubtotal: coupon.minSubtotal,
          expiryDate: coupon.expiryDate,
          usageCount: coupon.usageCount,
          status: coupon.status
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.coupon) {
          const createdCoupon: CouponItem = {
            _id: data.coupon._id,
            code: data.coupon.code,
            discountType: data.coupon.discountType,
            value: data.coupon.discountValue,
            minSubtotal: data.coupon.minSubtotal || 0,
            expiryDate: data.coupon.expiryDate,
            usageCount: data.coupon.usageCount || 0,
            status: data.coupon.status
          };
          setCoupons(prev => [createdCoupon, ...prev]);
          addNotification("Coupon Created", `Discount coupon ${coupon.code} is now active.`, 'system');
          return true;
        }
        return false;
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to create coupon');
        return false;
      }
    } catch (err: any) {
      console.error('Create coupon error:', err);
      alert('Failed to save coupon: ' + (err.message || err));
      return false;
    }
  };

  const deleteCoupon = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`https://server.apexbee.in/api/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c._id !== id));
        addNotification("Coupon Deleted", "Discount coupon was successfully deleted.", "system");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to delete coupon');
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
    }
  };

  const addAd = (ad: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'startDate'>) => {
    const newAd: AdCampaign = {
      ...ad,
      id: `AD-${Math.floor(100 + Math.random() * 900)}`,
      impressions: 0,
      clicks: 0,
      startDate: new Date().toISOString().split('T')[0]
    };
    setAds(prev => [newAd, ...prev]);
    addNotification("Campaign Launched", `Ad Campaign "${ad.title}" has been launched.`, 'system');
  };

  // Computations for KPI cards
  const stats = statsState || (() => {
    // Wallet calculation
    // Start with a base of 38420, add all Completed Order Earnings, Referral Bonuses, deduct completed withdrawals/refunds
    let base = 0;
    transactions.forEach(t => {
      // Don't calculate the initial list again as they are already counted in the baseline,
      // only count transactions added dynamically (which don't match the hardcoded initial list IDs)
      const initialIds = ["TXN-88029", "TXN-87910", "TXN-87401", "TXN-87320"];
      if (!initialIds.includes(t.id) && t.status === 'Completed') {
        base += t.amount;
      } else if (!initialIds.includes(t.id) && t.status === 'Pending') {
        base += t.amount; // Withdrawals are negative, so this deducts it from the display balance immediately
      }
    });

    const activeProducts = products.filter(p => p.status === 'Approved').length;
    const pendingProducts = products.filter(p => p.status === 'Pending Review' || p.status === 'Awaiting Reapproval').length;
    const lowStockCount = products.filter(p => p.status === 'Approved' && p.stock <= 10 && p.stock > 0).length;

    // Returns counts
    const returnRequestsCount = orders.filter(o => o.deliveryStatus === 'Returned' || o.refundStatus === 'Pending').length;

    // Total orders count
    const totalOrders = orders.length;

    // Total Revenue (earnings from delivered orders)
    // Dynamic + baseline
    let totalRevenue = 0;
    orders.forEach(o => {
      if (o.deliveryStatus === 'Delivered') {
        totalRevenue += o.totalAmount;
      }
    });

    // Pending earnings (orders placed but not yet delivered)
    let pendingEarnings = 0;
    orders.forEach(o => {
      if (['New', 'Processing', 'Packed', 'Shipped'].includes(o.deliveryStatus)) {
        pendingEarnings += o.totalAmount;
      }
    });

    return {
      totalRevenue,
      totalOrders,
      productsListed: products.length,
      activeProducts,
      pendingProducts,
      walletBalance: Math.max(0, base),
      pendingEarnings,
      lowStockCount,
      returnRequestsCount
    };
  })();

  return (
    <VendorContext.Provider
      value={{
        profile,
        products,
        orders,
        vendorSubscriptions,
        deliveryAgents,
        scheduledPickups,
        bookScheduledPickup,
        assignSubscriptionDelivery,
        transactions,
        withdrawals,
        referrals,
        notifications,
        theme,
        setTheme,
        currentPage,
        setCurrentPage,
        isAuthenticated,
        authPage,
        setAuthPage,
        login,
        register,
        logout,

        storeDesign,
        reviews,
        procurementOrders,
        activeQuotations,
        procurementLoading,
        procurementProduct,

        rfqs,
        suppliers,
        territories,
        creditAccounts,
        staffList,
        coupons,
        ads,

        saveStoreDesign,
        submitReviewReply,
        requestProcurementQuotes,
        createProcurementOrder,
        respondToApprovalTerms,
        bulkUpdateProducts,
        respondToRFQ,
        addStaff,
        addCoupon,
        deleteCoupon,
        addAd,

        updateProfile,
        uploadDocument,
        addProduct,
        updateProductStock,
        updateProductPrice,
        acceptCommission,
        negotiateCommission,

        acceptOrder,
        packOrder,
        assignDelivery,
        shipOrder,

        deliverOrder,
        approveReturn,
        rejectReturn,

        requestWithdrawal,
        markAsRead,
        markAllAsRead,
        addNotification,
        stats,
        entrepreneurs,
        acquisitions
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};

export const useVendor = () => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
};
