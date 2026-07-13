import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import {
  LayoutDashboard,
  Building2,
  Package,
  Boxes,
  ShoppingBag,
  Truck,
  Wallet,
  ArrowDownCircle,
  Users,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  FolderOpen,
  PlusCircle,
  FileCheck,
  Loader2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Menu,
  X,
  Coins,
  Star,
  Store,
  RotateCcw,
  Compass,
  FileSpreadsheet,
  Clock,
  QrCode,
  Calendar,
  ArrowLeftRight,
  TrendingUp,
  Gift,
  Megaphone,
  UserCheck,
  Bell,
  BookOpen,
  Lock,
  Share2,
  Network,
  ShoppingCart,
  MapPin,
  CheckCircle2,
  Award,
  Phone
} from 'lucide-react';
import { Badge } from './ui/Badge';

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, products, orders, profile } = useVendor();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    business: true,
    products: false,
    orders: false,
    wallet: false,
    earnings: false,
    reviews: false,
    reports: false,
    b2b: false,
    qr: false,
    crm: false,
    ai: false,
    hl: false,
    ent: false,
    fc: false,
    acad: false
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpand = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Badge calculations
  const draftProductsCount = products.filter(p => p.status === 'Draft').length;
  const pendingApprovalCount = products.filter(p => p.status === 'Pending Review').length;
  const awaitingVendorCount = products.filter(p => p.status === 'Awaiting Seller Approval' || p.status === 'Awaiting Vendor Approval').length;
  const changeRequestsCount = products.filter(p => p.status === 'Negotiation Requested' || p.status === 'Awaiting Reapproval').length;
  const approvedCount = products.filter(p => p.status === 'Live' || p.status === 'Approved').length;
  const rejectedCount = products.filter(p => p.status === 'Rejected').length;

  const lowStockCount = products.filter(p => (p.status === 'Live' || p.status === 'Approved') && p.stock <= 10 && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const newOrdersCount = orders.filter(o => o.deliveryStatus === 'New').length;
  const returnRequestsCount = orders.filter(o => o.refundStatus === 'Pending').length;

  interface SubMenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string | null;
    count?: number;
  }

  interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    subItems: SubMenuItem[];
  }

  interface MenuGroup {
    groupLabel: string;
    items: MenuItem[];
  }

  const menuGroups: MenuGroup[] = [
    {
      groupLabel: 'Dashboard',
      items: [
        {
          id: 'dashboard',
          label: 'Overview',
          icon: <LayoutDashboard className="h-4 w-4" />,
          subItems: []
        },
        {
          id: 'reports',
          label: 'Reports & Analytics',
          icon: <BarChart3 className="h-4 w-4" />,
          subItems: [
            { id: 'reports-sales', label: 'Sales Report', icon: <BarChart3 className="h-3.5 w-3.5" /> },
            { id: 'reports-products', label: 'Product Report', icon: <Package className="h-3.5 w-3.5" /> },
            { id: 'reports-earnings', label: 'Earnings Report', icon: <Wallet className="h-3.5 w-3.5" /> },
            { id: 'reports-inventory', label: 'Inventory Report', icon: <Boxes className="h-3.5 w-3.5" /> }
          ]
        },
        {
          id: 'notifications-list',
          label: 'Notifications',
          icon: <Bell className="h-4 w-4 text-blue-500" />,
          subItems: []
        }
      ]
    },
    {
      groupLabel: 'Store Operations',
      items: [
        {
          id: 'business',
          label: 'My Business',
          icon: <Building2 className="h-4 w-4" />,
          subItems: [
            { id: 'profile', label: 'Business Profile', icon: <Building2 className="h-3.5 w-3.5" /> },
            { id: 'kyc', label: 'KYC Verification', icon: <ShieldCheck className="h-3.5 w-3.5" />, badge: profile.kycStatus === 'Verified' ? null : 'Pending' },
            { id: 'bank', label: 'Bank Accounts', icon: <CreditCard className="h-3.5 w-3.5" /> },
            { id: 'documents', label: 'Business Documents', icon: <FolderOpen className="h-3.5 w-3.5" /> },
            { id: 'store-design', label: 'My Store', icon: <Store className="h-3.5 w-3.5" /> }
          ]
        },
        {
          id: 'staff-management',
          label: 'Staff Management',
          icon: <UserCheck className="h-4 w-4 text-teal-500" />,
          subItems: []
        },
        {
          id: 'products',
          label: 'Product Management',
          icon: <Package className="h-4 w-4" />,
          subItems: [
            { id: 'add-product', label: 'Add Product', icon: <PlusCircle className="h-3.5 w-3.5" /> },
            { id: 'products-all', label: 'All Products', icon: <Package className="h-3.5 w-3.5" /> },
            { id: 'products-draft', label: 'Draft Products', icon: <FolderOpen className="h-3.5 w-3.5" />, count: draftProductsCount },
            { id: 'products-pending', label: 'Pending Admin Review', icon: <Loader2 className="h-3.5 w-3.5" />, count: pendingApprovalCount },
            { id: 'products-awaiting-vendor', label: 'Awaiting Vendor Approval', icon: <Clock className="h-3.5 w-3.5" />, count: awaitingVendorCount },
            { id: 'products-approved', label: 'Approved Products', icon: <FileCheck className="h-3.5 w-3.5" />, count: approvedCount },
            { id: 'products-rejected', label: 'Rejected Products', icon: <XCircle className="h-3.5 w-3.5" />, count: rejectedCount },
            { id: 'products-change-requests', label: 'Product Change Requests', icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />, count: changeRequestsCount }
          ]
        },
        {
          id: 'inventory',
          label: 'Inventory Management',
          icon: <Boxes className="h-4 w-4" />,
          subItems: [
            { id: 'inventory-stock', label: 'Stock Management', icon: <Boxes className="h-3.5 w-3.5" /> },
            { id: 'inventory-low', label: 'Low Stock Products', icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />, count: lowStockCount },
            { id: 'inventory-out', label: 'Out of Stock', icon: <XCircle className="h-3.5 w-3.5 text-destructive" />, count: outOfStockCount }
          ]
        },
        {
          id: 'orders',
          label: 'Order Management',
          icon: <ShoppingBag className="h-4 w-4" />,
          subItems: [
            { id: 'orders-new', label: 'New Orders', icon: <Sparkles className="h-3.5 w-3.5 text-sky-500 animate-pulse" />, count: newOrdersCount },
            { id: 'orders-all', label: 'Normal Orders', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
            { id: 'orders-localshop', label: 'LocalShop Orders', icon: <Store className="h-3.5 w-3.5" /> },
            { id: 'orders-subscriptions', label: 'Subscription Orders', icon: <Calendar className="h-3.5 w-3.5" /> },
            { id: 'orders-returns', label: 'Return Requests', icon: <XCircle className="h-3.5 w-3.5" />, count: returnRequestsCount }
          ]
        },
        {
          id: 'returns-refunds',
          label: 'Returns & Refunds',
          icon: <RotateCcw className="h-4 w-4 text-rose-500" />,
          subItems: []
        },
        {
          id: 'scheduled-delivery',
          label: 'Courier Pickup',
          icon: <Calendar className="h-4 w-4 text-emerald-500" />,
          subItems: []
        },
        {
          id: 'subscriptions',
          label: 'Scheduled Deliveries',
          icon: <Clock className="h-4 w-4 text-primary" />,
          subItems: []
        }
      ]
    },
    {
      groupLabel: 'Delivery',
      items: [
        {
          id: 'delivery',
          label: 'Delivery Management',
          icon: <Truck className="h-4 w-4" />,
          subItems: [
            { id: 'delivery-agents', label: 'Delivery Agents', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'delivery-assign', label: 'Assign & Tracking', icon: <Truck className="h-3.5 w-3.5" /> }
          ]
        }
      ]
    },
    {
      groupLabel: 'Finance',
      items: [
        {
          id: 'wallet',
          label: 'Wallet & Withdrawals',
          icon: <Wallet className="h-4 w-4 text-primary" />,
          subItems: [
            { id: 'wallet-dashboard', label: 'Wallet Ledger', icon: <Wallet className="h-3.5 w-3.5" /> },
            { id: 'withdrawals-request', label: 'Withdrawal Requests', icon: <ArrowDownCircle className="h-3.5 w-3.5" /> }
          ]
        },
        {
          id: 'settlements',
          label: 'Settlements',
          icon: <Coins className="h-4 w-4 text-emerald-500" />,
          subItems: []
        }
      ]
    },
    {
      groupLabel: 'Growth',
      items: [
        {
          id: 'coupons',
          label: 'Coupons & Offers',
          icon: <Gift className="h-4 w-4 text-amber-500" />,
          subItems: []
        },
        {
          id: 'advertisement',
          label: 'Advertisements',
          icon: <Megaphone className="h-4 w-4 text-orange-500" />,
          subItems: []
        },
        {
          id: 'reviews',
          label: 'Reviews & Ratings',
          icon: <Star className="h-4 w-4 text-amber-500" />,
          subItems: [
            { id: 'reviews-products', label: 'Product Reviews', icon: <Star className="h-3.5 w-3.5" /> },
            { id: 'reviews-store', label: 'Store Reviews', icon: <Building2 className="h-3.5 w-3.5" /> },
            { id: 'reviews-analytics', label: 'Review Analytics', icon: <BarChart3 className="h-3.5 w-3.5" /> }
          ]
        },
        {
          id: 'market-demand',
          label: 'Market Demand',
          icon: <Compass className="h-4 w-4 text-cyan-500" />,
          subItems: []
        },
        {
          id: 'ai',
          label: 'AI Business Insights',
          icon: <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />,
          subItems: [
            { id: 'ai-bestsellers', label: 'Best Selling Products', icon: <Star className="h-3.5 w-3.5" /> },
            { id: 'ai-deadinventory', label: 'Dead Inventory', icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> },
            { id: 'ai-reorders', label: 'Reorder Suggestions', icon: <PlusCircle className="h-3.5 w-3.5" /> },
            { id: 'ai-forecast', label: 'Sales Forecast', icon: <TrendingUp className="h-3.5 w-3.5" /> },
            { id: 'ai-customertrends', label: 'Customer Trends', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'ai-seasonal', label: 'Seasonal Trends', icon: <Calendar className="h-3.5 w-3.5" /> },
            { id: 'ai-predictions', label: 'Revenue Predictions', icon: <TrendingUp className="h-3.5 w-3.5" /> }
          ]
        }
      ]
    },
    {
      groupLabel: 'Partner Programs',
      items: [
        {
          id: 'b2b',
          label: 'B2B Marketplace',
          icon: <Store className="h-4 w-4 text-sky-500" />,
          subItems: [
            { id: 'b2b-buy', label: 'Buy Products', icon: <ShoppingCart className="h-3.5 w-3.5" /> },
            { id: 'b2b-sell', label: 'Sell Products', icon: <PlusCircle className="h-3.5 w-3.5" /> },
            { id: 'b2b-rfq', label: 'RFQ Marketplace', icon: <FileCheck className="h-3.5 w-3.5" /> },
            { id: 'b2b-deals', label: 'Bulk Deals', icon: <Coins className="h-3.5 w-3.5" /> },
            { id: 'b2b-wholesalers', label: 'Nearby Wholesalers', icon: <Building2 className="h-3.5 w-3.5" /> },
            { id: 'b2b-manufacturers', label: 'Nearby Manufacturers', icon: <Network className="h-3.5 w-3.5" /> },
            { id: 'b2b-procurements', label: 'Procurement Requests', icon: <Loader2 className="h-3.5 w-3.5" /> },
            { id: 'b2b-quotations', label: 'Quotations', icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
            { id: 'b2b-pos', label: 'Purchase Orders', icon: <ShoppingCart className="h-3.5 w-3.5" /> },
            { id: 'b2b-trading', label: 'Vendor-to-Vendor Trading', icon: <ArrowLeftRight className="h-3.5 w-3.5" /> }
          ]
        },
        {
          id: 'qr',
          label: 'QR Merchant Center',
          icon: <QrCode className="h-4 w-4 text-primary" />,
          subItems: [
            { id: 'qr-my', label: 'My QR', icon: <QrCode className="h-3.5 w-3.5" /> },
            { id: 'qr-txns', label: 'QR Transactions', icon: <Clock className="h-3.5 w-3.5" /> },
            { id: 'qr-analytics', label: 'QR Analytics', icon: <BarChart3 className="h-3.5 w-3.5" /> },
            { id: 'qr-settlements', label: 'QR Settlements', icon: <Coins className="h-3.5 w-3.5" /> },
            { id: 'qr-customers', label: 'QR Customers', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'qr-cashback', label: 'QR Cashback', icon: <Gift className="h-3.5 w-3.5" /> },
            { id: 'qr-referrals', label: 'QR Referral Earnings', icon: <Share2 className="h-3.5 w-3.5" /> },
            { id: 'qr-growth', label: 'QR Merchant Growth', icon: <TrendingUp className="h-3.5 w-3.5" /> }
          ]
        },
        {
          id: 'crm',
          label: 'CRM & Leads',
          icon: <Users className="h-4 w-4 text-emerald-500" />,
          subItems: [
            { id: 'crm-vendor', label: 'Vendor Leads', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'crm-wholesaler', label: 'Wholesaler Leads', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'crm-manufacturer', label: 'Manufacturer Leads', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'crm-service', label: 'Service Leads', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'crm-franchise', label: 'Franchise Leads', icon: <Building2 className="h-3.5 w-3.5" /> },
            { id: 'crm-followups', label: 'Follow Ups', icon: <Clock className="h-3.5 w-3.5" /> },
            { id: 'crm-tasks', label: 'Tasks', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
            { id: 'crm-conversions', label: 'Conversions', icon: <TrendingUp className="h-3.5 w-3.5" /> },
            { id: 'crm-sources', label: 'Lead Sources', icon: <Compass className="h-3.5 w-3.5" /> }
          ]
        },
        {
          id: 'hl',
          label: 'Hyperlocal Growth',
          icon: <MapPin className="h-4 w-4 text-red-500" />,
          subItems: [
            { id: 'hl-coverage', label: 'Territory Coverage', icon: <MapPin className="h-3.5 w-3.5" /> },
            { id: 'hl-district', label: 'District Performance', icon: <TrendingUp className="h-3.5 w-3.5" /> },
            { id: 'hl-mandal', label: 'Mandal Performance', icon: <BarChart3 className="h-3.5 w-3.5" /> },
            { id: 'hl-penetration', label: 'Market Penetration', icon: <Compass className="h-3.5 w-3.5" /> },
            { id: 'hl-competitors', label: 'Competitor Tracking', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'hl-expansion', label: 'Expansion Requests', icon: <PlusCircle className="h-3.5 w-3.5" /> }
          ]
        },
        {
          id: 'ent',
          label: 'Entrepreneur Network',
          icon: <Users className="h-4 w-4 text-teal-500" />,
          subItems: [
            { id: 'ent-associated', label: 'Associated Entrepreneurs', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'ent-acquisition', label: 'Vendor Acquisition', icon: <PlusCircle className="h-3.5 w-3.5" /> },
            { id: 'ent-sales', label: 'Sales Generated', icon: <Coins className="h-3.5 w-3.5" /> },
            { id: 'ent-incentives', label: 'Incentives', icon: <Gift className="h-3.5 w-3.5" /> },
            { id: 'ent-performance', label: 'Performance', icon: <TrendingUp className="h-3.5 w-3.5" /> },
            { id: 'ent-leaderboard', label: 'Leaderboard', icon: <Award className="h-3.5 w-3.5" /> }
          ]
        },
        {
          id: 'fc',
          label: 'Franchise Connect',
          icon: <Building2 className="h-4 w-4 text-amber-500" />,
          subItems: [
            { id: 'fc-state', label: 'State Franchise', icon: <Building2 className="h-3.5 w-3.5" /> },
            { id: 'fc-district', label: 'District Franchise', icon: <Building2 className="h-3.5 w-3.5" /> },
            { id: 'fc-mandal', label: 'Mandal Franchise', icon: <Building2 className="h-3.5 w-3.5" /> },
            { id: 'fc-support', label: 'Support Requests', icon: <HelpCircle className="h-3.5 w-3.5" /> },
            { id: 'fc-marketing', label: 'Marketing Requests', icon: <Megaphone className="h-3.5 w-3.5" /> },
            { id: 'fc-expansion', label: 'Expansion Requests', icon: <PlusCircle className="h-3.5 w-3.5" /> },
            { id: 'fc-contacts', label: 'Territory Contacts', icon: <Phone className="h-3.5 w-3.5" /> }
          ]
        },
        {
          id: 'business-academy',
          label: 'Business Academy',
          icon: <BookOpen className="h-4 w-4 text-violet-500" />,
          subItems: [
            { id: 'acad-photography', label: 'Product Photography', icon: <Sparkles className="h-3.5 w-3.5" /> },
            { id: 'acad-inventory', label: 'Inventory Management', icon: <Boxes className="h-3.5 w-3.5" /> },
            { id: 'acad-sales', label: 'Sales Training', icon: <TrendingUp className="h-3.5 w-3.5" /> },
            { id: 'acad-marketing', label: 'Digital Marketing', icon: <Megaphone className="h-3.5 w-3.5" /> },
            { id: 'acad-customer', label: 'Customer Service', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'acad-gst', label: 'GST Basics', icon: <Coins className="h-3.5 w-3.5" /> },
            { id: 'acad-franchise', label: 'Franchise Growth', icon: <Building2 className="h-3.5 w-3.5" /> },
            { id: 'acad-entrepreneurship', label: 'Entrepreneurship', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'acad-certs', label: 'Certifications', icon: <Award className="h-3.5 w-3.5" /> }
          ]
        }
      ]
    },
    {
      groupLabel: 'Settings & Support',
      items: [
        {
          id: 'support',
          label: 'Support Center',
          icon: <HelpCircle className="h-4 w-4" />,
          subItems: []
        },
        {
          id: 'security',
          label: 'Security Settings',
          icon: <Lock className="h-4 w-4 text-rose-500" />,
          subItems: []
        }
      ]
    }
  ];

  const handlePageClick = (pageId: string) => {
    setCurrentPage(pageId);
    setMobileOpen(false);
  };

  const renderNav = () => {
    const role = profile.businessType || 'Vendor';
    const isVendor = role === 'Vendor' || role === 'Vendor / Retailer';
    const isWholesaler = role === 'Wholesaler';
    const isManufacturer = role === 'Manufacturer';

    return (
      <nav className="flex-1 flex flex-col gap-4 px-4 py-4 overflow-y-auto no-scrollbar">
        {menuGroups.map(group => {
          // Filter items inside the group first based on roles
          const filteredItems = group.items.filter(item => {
            switch (item.id) {
              // Vendor Exclusive
              case 'qr':
              case 'market-demand':
              case 'procurement-hub':
              case 'referrals':
                return isVendor;

              // Wholesaler & Manufacturer Exclusive
              case 'crm':
              case 'hl':
              case 'fc':
              case 'supply-chain':
              case 'quotation-management':
              case 'supplier-network':
              case 'manufacturer-connect':
              case 'demand-forecasting':
              case 'credit-management':
              case 'staff-management':
                return isWholesaler || isManufacturer;

              default:
                return true;
            }
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={group.groupLabel} className="flex flex-col gap-1.5">
              <span className="px-3 py-1 text-[10px] uppercase font-extrabold text-muted-foreground/60 tracking-wider">
                {group.groupLabel}
              </span>
              <div className="flex flex-col gap-1">
                {filteredItems.map(item => {
                  const hasSubItems = item.subItems.length > 0;
                  const isSelected = currentPage === item.id || item.subItems.some(s => s.id === currentPage);
                  const isExpanded = expandedMenus[item.id];

                  return (
                    <div key={item.id} className="flex flex-col">
                      {hasSubItems ? (
                        <>
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer ${
                              isSelected
                                ? 'bg-primary/5 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="flex flex-col gap-0.5 pl-6 mt-1 border-l border-border/60 ml-5">
                              {item.subItems.map(sub => {
                                const isSubSelected = currentPage === sub.id;
                                return (
                                  <button
                                    key={sub.id}
                                    onClick={() => handlePageClick(sub.id)}
                                    className={`flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-lg transition-all duration-150 cursor-pointer ${
                                      isSubSelected
                                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {sub.icon}
                                      <span>{sub.label}</span>
                                    </div>
                                    {sub.count !== undefined && sub.count > 0 && (
                                      <Badge variant={sub.id.includes('low') || sub.id.includes('out') ? 'destructive' : 'default'} className="px-1.5 py-0">
                                        {sub.count}
                                      </Badge>
                                    )}
                                    {sub.badge && (
                                      <Badge variant="warning" className="px-1.5 py-0 text-[9px]">
                                        {sub.badge}
                                      </Badge>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handlePageClick(item.id)}
                          className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                            currentPage === item.id
                              ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          {item.icon}
                          <span className="flex-1 text-left">{item.label}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 duration-200 cursor-pointer"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card text-foreground h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-border gap-2.5 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/25">
            <span className="text-white font-extrabold text-lg">A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-tight text-foreground leading-none">Apex Market</span>
            <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Vendor Hub</span>
          </div>
        </div>
        {renderNav()}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          {/* Menu Drawer */}
          <aside className="w-64 bg-card border-r border-border h-full relative z-10 flex flex-col shadow-2xl">
            <div className="h-16 flex items-center px-6 border-b border-border gap-2.5 bg-primary/5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Apex Market</span>
                <span className="text-[9px] text-muted-foreground font-bold uppercase">Vendor Hub</span>
              </div>
            </div>
            {renderNav()}
          </aside>
        </div>
      )}
    </>
  );
};
