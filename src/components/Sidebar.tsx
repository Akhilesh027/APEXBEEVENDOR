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
  Users,
  HelpCircle,
  CreditCard,
  PlusCircle,
  Sparkles,
  Menu,
  X,
  Coins,
  Star,
  Store,
  RotateCcw,
  Calendar,
  TrendingUp,
  Gift,
  Megaphone,
  UserCheck,
  Bell,
  BookOpen,
  Lock,
  Network,
  QrCode,
  MapPin,
  Search,
  FileSpreadsheet
} from 'lucide-react';
import { useSubscription } from '../features/subscription/hooks/useSubscription';
import { Badge } from './ui/Badge';

interface NavItem {
  id: string;
  label: string | (() => string);
  icon: React.ReactNode;
  badge?: string | number | null;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning';
  roles?: ('Vendor' | 'Wholesaler' | 'Manufacturer')[];
  isComingSoon?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, products, orders, profile } = useVendor();
  const { summary } = useSubscription();
  const activePlanName = summary?.planName || '15-Day Free Trial';
  const activePlanStatus = summary?.status || 'TRIAL';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time Badge Metrics
  const approvedCount = products.filter(p => (p.status as string) === 'Live' || p.status === 'Approved').length;
  const lowStockCount = products.filter(p => ((p.status as string) === 'Live' || p.status === 'Approved') && p.stock <= 10 && p.stock > 0).length;
  const newOrdersCount = orders.filter(o => o.deliveryStatus === 'New').length;
  const returnRequestsCount = orders.filter(o => o.refundStatus === 'Pending').length;

  const handlePageClick = (pageId: string) => {
    setCurrentPage(pageId);
    setMobileOpen(false);
  };

  const getProductLabel = () => {
    const catName = (profile.primaryCategory || profile.category || '').toLowerCase();
    if (catName.includes('food') || catName.includes('restaurant')) return 'Digital Food Menu';
    if (catName.includes('grocery') || catName.includes('daily')) return 'Supermarket Catalog';
    if (catName.includes('fashion') || catName.includes('apparel')) return 'Apparel & Lookbook';
    if (catName.includes('service') || catName.includes('repair')) return 'Service Packages';
    if (catName.includes('devotional') || catName.includes('puja')) return 'Devotional Catalog';
    return 'Product Catalog';
  };

  const getAddProductLabel = () => {
    const catName = (profile.primaryCategory || profile.category || '').toLowerCase();
    if (catName.includes('food') || catName.includes('restaurant')) return 'Add Dish / Menu Item';
    if (catName.includes('grocery') || catName.includes('daily')) return 'Add Supermarket Item';
    if (catName.includes('fashion') || catName.includes('apparel')) return 'Add Fashion Item';
    if (catName.includes('service') || catName.includes('repair')) return 'Add Service Package';
    if (catName.includes('devotional') || catName.includes('puja')) return 'Add Sacred Item';
    return 'Add New Product';
  };

  const userRole = profile.businessType || 'Vendor';
  const isWholesalerOrManufacturer = userRole === 'Wholesaler' || userRole === 'Manufacturer';

  const navSections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard className="h-4 w-4 text-sky-400" /> },
        { id: 'notifications-list', label: 'Notifications', icon: <Bell className="h-4 w-4 text-blue-400" /> },
        { id: 'products-all', label: getProductLabel, icon: <Package className="h-4 w-4 text-emerald-400" />, badge: approvedCount > 0 ? `${approvedCount} Live` : null, badgeVariant: 'default' },
        { id: 'add-product', label: getAddProductLabel, icon: <PlusCircle className="h-4 w-4 text-amber-400" /> },
        { id: 'inventory-stock', label: 'Inventory & Stock', icon: <Boxes className="h-4 w-4 text-purple-400" />, badge: lowStockCount > 0 ? `${lowStockCount} Low` : null, badgeVariant: 'destructive' },
        { id: 'orders-all', label: 'Order Command Center', icon: <ShoppingBag className="h-4 w-4 text-cyan-400" />, badge: newOrdersCount > 0 ? `${newOrdersCount} New` : null, badgeVariant: 'default' },
        { id: 'returns-refunds', label: 'Returns & Refunds', icon: <RotateCcw className="h-4 w-4 text-rose-400" />, badge: returnRequestsCount > 0 ? `${returnRequestsCount} Pending` : null, badgeVariant: 'destructive' },
      ]
    },
    {
      title: 'DELIVERY & FULFILLMENT',
      items: [
        { id: 'delivery', label: 'Delivery & Logistics', icon: <Truck className="h-4 w-4 text-teal-400" /> },
        { id: 'courier-pickup', label: 'Courier Pickup Scheduling', icon: <Package className="h-4 w-4 text-amber-400" /> },
        { id: 'scheduled-delivery', label: 'Scheduled Deliveries', icon: <Calendar className="h-4 w-4 text-emerald-400" /> },
      ]
    },
    {
      title: 'FINANCE & WALLET',
      items: [
        { id: 'subscriptions', label: 'Subscription Plan', icon: <CreditCard className="h-4 w-4 text-indigo-400" /> },
        { id: 'wallet', label: 'Wallet & Payout Requests', icon: <Wallet className="h-4 w-4 text-amber-400" /> },
        { id: 'settlements', label: 'Settlement History', icon: <Coins className="h-4 w-4 text-emerald-400" /> },
        { id: 'earnings', label: 'Earnings & Commissions', icon: <TrendingUp className="h-4 w-4 text-blue-400" /> },
      ]
    },
    {
      title: 'GROWTH & CUSTOMERS',
      items: [
        { id: 'coupons', label: 'Promotions & Offers', icon: <Gift className="h-4 w-4 text-amber-400" /> },
        { id: 'advertisement', label: 'Promotions & Ads', icon: <Megaphone className="h-4 w-4 text-orange-400" />, isComingSoon: true },
        { id: 'reviews', label: 'Reviews & Ratings', icon: <Star className="h-4 w-4 text-yellow-400" /> },
        { id: 'customer-management', label: 'Customer Management', icon: <Users className="h-4 w-4 text-sky-400" /> },
        { id: 'qr', label: 'QR Merchant Center', icon: <QrCode className="h-4 w-4 text-emerald-400" />, roles: ['Vendor'] },
      ]
    },
    {
      title: 'B2B & WHOLESALE',
      items: [
        { id: 'b2b', label: 'B2B Wholesale Marketplace', icon: <Store className="h-4 w-4 text-sky-400" />, roles: ['Wholesaler', 'Manufacturer'] },
        { id: 'quotation-management', label: 'RFQ & Quotation Hub', icon: <FileSpreadsheet className="h-4 w-4 text-teal-400" />, roles: ['Wholesaler', 'Manufacturer'] },
        { id: 'supplier-network', label: 'Supplier & Factory Network', icon: <Network className="h-4 w-4 text-indigo-400" />, roles: ['Wholesaler', 'Manufacturer'] },
      ]
    },
    {
      title: 'NETWORK & REGIONAL',
      items: [
        { id: 'my-network', label: 'My Growth Network', icon: <Network className="h-4 w-4 text-sky-400" /> },
        { id: 'hl', label: 'Hyperlocal Coverage', icon: <MapPin className="h-4 w-4 text-red-400" /> },
        { id: 'fc', label: 'Franchise Connect', icon: <Building2 className="h-4 w-4 text-amber-400" /> },
      ]
    },
    {
      title: 'STORE & SETTINGS',
      items: [
        { id: 'profile', label: 'Business Profile & KYC', icon: <Building2 className="h-4 w-4 text-slate-300" />, badge: profile.kycStatus === 'Verified' ? null : 'KYC Pending', badgeVariant: 'warning' },
        { id: 'store-design', label: 'Store Customization', icon: <Store className="h-4 w-4 text-amber-400" /> },
        { id: 'staff-management', label: 'Staff Management', icon: <UserCheck className="h-4 w-4 text-teal-400" /> },
        { id: 'security', label: 'Security & Password', icon: <Lock className="h-4 w-4 text-rose-400" /> },
        { id: 'support', label: 'Support Center', icon: <HelpCircle className="h-4 w-4 text-zinc-400" /> },
        { id: 'business-academy', label: 'Business Academy', icon: <BookOpen className="h-4 w-4 text-violet-400" /> },
      ]
    }
  ];

  const renderNavItems = () => {
    return (
      <nav className="flex-1 flex flex-col gap-5 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Search Bar */}
        <div className="relative sticky top-0 z-10 bg-blue-950 pb-2">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className="w-full pl-8 pr-3 py-1.5 bg-blue-900/60 border border-blue-800/60 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          />
        </div>

        {navSections.map(section => {
          // Filter section items based on role & search query
          const visibleItems = section.items.filter(item => {
            // Role filtering
            if (item.roles && !item.roles.includes(userRole as any)) {
              if (item.roles.includes('Wholesaler') && !isWholesalerOrManufacturer) return false;
            }
            // Search query filtering
            const itemText = (typeof item.label === 'function' ? item.label() : item.label).toLowerCase();
            if (searchQuery.trim() && !itemText.includes(searchQuery.toLowerCase())) {
              return false;
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="flex flex-col gap-1">
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-amber-400/80">
                {section.title}
              </span>
              <div className="flex flex-col gap-0.5 mt-0.5">
                {visibleItems.map(item => {
                  const itemLabel = typeof item.label === 'function' ? item.label() : item.label;
                  const isSelected = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePageClick(item.id)}
                      className={`flex items-center justify-between w-full px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-blue-950 font-bold shadow-md shadow-amber-400/20'
                          : 'text-slate-300 hover:bg-blue-900/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={isSelected ? 'text-blue-950' : ''}>{item.icon}</span>
                        <span className="truncate">{itemLabel}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {item.isComingSoon && (
                          <span className="text-[8px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                            Soon
                          </span>
                        )}
                        {item.badge !== null && item.badge !== undefined && (
                          <Badge variant={item.badgeVariant || 'default'} className="px-1.5 py-0 text-[10px] font-bold">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </button>
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
          className="h-12 w-12 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 duration-200 cursor-pointer"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-blue-950 border-r border-blue-900/50 text-slate-100 h-screen sticky top-0 shadow-2xl">
        {/* Branding Header */}
        <div className="h-16 flex items-center px-5 gap-2.5 bg-gradient-to-r from-blue-900/60 to-transparent border-b border-blue-900/40">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-blue-950 flex items-center justify-center font-black text-xl font-heading shadow-md ring-2 ring-amber-400/30 shrink-0">
            🐝
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold font-heading tracking-tight text-white leading-none truncate">
              APEXBee Market
            </span>
            <span className="text-[10px] text-amber-400 font-black tracking-wider uppercase mt-0.5 truncate">
              Vendor Portal
            </span>
          </div>
        </div>

        {/* Active Plan Card */}
        <div
          onClick={() => handlePageClick('subscriptions')}
          className="mx-3 my-2 p-2.5 rounded-xl bg-blue-900/50 border border-blue-800/40 hover:bg-blue-900/80 cursor-pointer transition-all flex items-center justify-between group shadow-sm shrink-0"
          title="Click to manage active subscription plan"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-7 w-7 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center shrink-0 font-black shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[9px] uppercase tracking-wider font-black text-amber-300">
                Active Plan
              </span>
              <span className="text-xs font-extrabold text-white group-hover:text-amber-300 transition-colors truncate">
                {activePlanName}
              </span>
            </div>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase bg-amber-400 text-blue-950 shrink-0 ml-1">
            {activePlanStatus}
          </span>
        </div>

        {renderNavItems()}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Drawer Menu */}
          <aside className="w-64 bg-blue-950 h-full relative z-10 flex flex-col shadow-2xl border-r border-blue-900/60">
            <div className="h-16 flex items-center px-5 gap-2.5 bg-blue-900/60 border-b border-blue-900/40">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-blue-950 flex items-center justify-center font-black shrink-0">
                🐝
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-extrabold text-white truncate">APEXBee Market</span>
                <span className="text-[10px] text-amber-400 font-black uppercase truncate">Vendor Portal</span>
              </div>
            </div>

            <div
              onClick={() => handlePageClick('subscriptions')}
              className="mx-3 my-2 p-2.5 rounded-xl bg-blue-900/60 border border-blue-800/40 cursor-pointer flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-[9px] font-black text-amber-300 uppercase">Active Plan</span>
                  <span className="text-xs font-bold text-white truncate">{activePlanName}</span>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase bg-amber-400 text-blue-950">
                {activePlanStatus}
              </span>
            </div>

            {renderNavItems()}
          </aside>
        </div>
      )}
    </>
  );
};
