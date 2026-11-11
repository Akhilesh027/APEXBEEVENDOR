import { dailyNeedsSettings } from '../services/dailyNeedsWorkspace';
import { isWaterBusiness, orderInBusiness } from '../services/businessPortal';
import React, { useEffect, useRef, useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { useBusinessWorkspace } from '../context/BusinessWorkspaceContext';
import { useOperationalAlerts } from '../context/OperationalAlertsContext';
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
  FileSpreadsheet,
  Receipt
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

export const Sidebar: React.FC<{ mobileOpen: boolean; desktopOpen: boolean; closeMobile: () => void }> = ({ mobileOpen, desktopOpen, closeMobile }) => {
  const { currentPage, setCurrentPage, products: allProducts, orders: allOrders, profile } = useVendor();
  const { selected, productIds } = useBusinessWorkspace();
  const { current: operationalAlerts } = useOperationalAlerts();
  const products = productIds ? allProducts.filter(p=>productIds.includes(p.id)) : allProducts;
  const orders = productIds ? allOrders.filter(o=>orderInBusiness(o,productIds)) : allOrders;
  const water = isWaterBusiness(selected);
  const dailyNeeds = dailyNeedsSettings(selected);
  const [searchQuery, setSearchQuery] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobile();
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [mobileOpen, closeMobile]);

  // Real-time Badge Metrics
  const approvedCount = products.filter(p => (p.status as string) === 'Live' || p.status === 'Approved').length;
  const lowStockCount = products.filter(p => ((p.status as string) === 'Live' || p.status === 'Approved') && p.stock <= 10 && p.stock > 0).length;
  const newOrdersCount = operationalAlerts.orders.filter(order => order.kind === 'new').length;
  const returnRequestsCount = orders.filter(o => o.refundStatus === 'Pending').length;

  const handlePageClick = (pageId: string) => {
    setCurrentPage(pageId);
    closeMobile();
  };

  const getProductLabel = () => {
    if (dailyNeeds) return dailyNeeds.catalog;
    if (water) return 'Water Product Catalog';
    if (selected?.kind === 'dairy') return 'Milk & Dairy Catalog';
    const catName = (selected ? `${selected.categoryName} ${selected.name}` : profile.primaryCategory || profile.category || '').toLowerCase();
    if (catName.includes('food') || catName.includes('restaurant')) return 'Digital Food Menu';
    if (catName.includes('grocery') || catName.includes('daily')) return 'Supermarket Catalog';
    if (catName.includes('fashion') || catName.includes('apparel')) return 'Apparel & Lookbook';
    if (catName.includes('service') || catName.includes('repair')) return 'Service Packages';
    if (catName.includes('devotional') || catName.includes('puja')) return 'Devotional Catalog';
    return 'Product Catalog';
  };

  const getAddProductLabel = () => {
    if (dailyNeeds) return dailyNeeds.add;
    if (water) return 'Add Water Product';
    if (selected?.kind === 'dairy') return 'Add Dairy Product';
    const catName = (selected ? `${selected.categoryName} ${selected.name}` : profile.primaryCategory || profile.category || '').toLowerCase();
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
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4 text-sky-400" /> },
        { id: 'notifications-list', label: 'Notifications', icon: <Bell className="h-4 w-4 text-blue-400" /> },
      ]
    },
    {
      title: 'DAILY OPERATIONS',
      items: [
        { id: 'pos', label: 'Counter POS & Billing', icon: <Receipt className="h-4 w-4 text-emerald-400" /> },
        ...(water ? [
          { id: 'water-subscriptions', label: 'Water Subscriptions', icon: <Users className="h-4 w-4 text-sky-400" /> },
          { id: 'water-deliveries', label: 'Water Delivery Plan', icon: <Truck className="h-4 w-4 text-sky-400" /> },
          { id: 'water-routes', label: 'Water Delivery Routes', icon: <MapPin className="h-4 w-4 text-sky-400" /> },
          { id: 'water-demand', label: 'Next Day Water Requirements', icon: <Calendar className="h-4 w-4 text-sky-400" /> },
          { id: 'water-accounts', label: 'Containers & Deposits', icon: <RotateCcw className="h-4 w-4 text-sky-400" /> },
        ] : []),
        ...(selected?.kind === 'dairy' ? [{ id: 'dairy-subscriptions', label: 'Customer Subscriptions', icon: <Users className="h-4 w-4 text-emerald-400" /> }] : []),
        ...(selected?.kind === 'dairy' ? [{ id: 'dairy-deliveries', label: 'Daily Delivery Plan', icon: <Truck className="h-4 w-4 text-sky-400" /> }] : []),
        ...(selected?.kind === 'dairy' ? [{ id: 'dairy-routes', label: 'Delivery Routes', icon: <Truck className="h-4 w-4 text-sky-400" /> }] : []),
        ...(selected?.kind === 'dairy' ? [{ id: 'dairy-demand', label: 'Next Day Requirements', icon: <Calendar className="h-4 w-4 text-amber-400" /> }] : []),
        ...(dailyNeeds ? [{ id: 'daily-needs-quality', label: dailyNeeds.quality, icon: <Package className="h-4 w-4 text-emerald-400" /> }] : []),
        ...(selected?.kind === 'catalog' && !water && !dailyNeeds ? [{ id: 'business-operations', label: `${selected.name} Operations`, icon: <Package className="h-4 w-4 text-amber-400" /> }] : []),
      ]
    },
    {
      title: 'CATALOG & STOCK',
      items: [
        ...(water ? [
          { id: 'water-catalog', label: 'Can Sizes & Deposit Settings', icon: <Package className="h-4 w-4 text-sky-400" /> },
          { id: 'water-stock', label: 'Filled Stock & Wastage', icon: <Boxes className="h-4 w-4 text-sky-400" /> },
        ] : []),
        { id: 'products-all', label: getProductLabel, icon: <Package className="h-4 w-4 text-emerald-400" />, badge: approvedCount > 0 ? `${approvedCount} Live` : null, badgeVariant: 'default' },
        { id: 'add-product', label: getAddProductLabel, icon: <PlusCircle className="h-4 w-4 text-amber-400" /> },
        ...(selected && selected.kind !== 'food' && !water ? [{ id: 'business-bundles', label: 'Kits & Combos', icon: <Package className="h-4 w-4 text-amber-400" /> }] : []),
        { id: 'inventory-stock', label: 'Inventory & Stock', icon: <Boxes className="h-4 w-4 text-purple-400" />, badge: lowStockCount > 0 ? `${lowStockCount} Low` : null, badgeVariant: 'destructive' },
        ...(dailyNeeds ? [{ id: 'daily-needs-stock', label: dailyNeeds.stock, icon: <Boxes className="h-4 w-4 text-emerald-400" /> }] : []),
        ...(selected?.kind === 'dairy' ? [{ id: 'dairy-ledger', label: 'Collection & Wastage', icon: <Package className="h-4 w-4 text-amber-400" /> }] : []),
      ]
    },
    {
      title: 'ORDERS & DISPATCH',
      items: [
        { id: 'orders-all', label: 'Orders', icon: <ShoppingBag className="h-4 w-4 text-cyan-400" />, badge: newOrdersCount > 0 ? `${newOrdersCount} New` : null, badgeVariant: 'default' },
        { id: 'delivery', label: 'Delivery & Logistics', icon: <Truck className="h-4 w-4 text-teal-400" /> },
        // Milk & Dairy uses Daily Delivery Plan. Original shortcut retained for reference:
        // { id: 'scheduled-delivery', label: 'Scheduled Deliveries', icon: <Calendar className="h-4 w-4 text-emerald-400" /> },
        ...(selected?.kind !== 'dairy' && !water ? [{ id: 'scheduled-delivery', label: 'Scheduled Deliveries', icon: <Calendar className="h-4 w-4 text-emerald-400" /> }] : []),
        // Milk & Dairy uses Daily Delivery Plan. Original shortcut retained for reference:
        // { id: 'courier-pickup', label: 'Courier Pickup Scheduling', icon: <Package className="h-4 w-4 text-amber-400" /> },
        ...(selected?.kind !== 'dairy' && !water ? [{ id: 'courier-pickup', label: 'Courier Pickup Scheduling', icon: <Package className="h-4 w-4 text-amber-400" /> }] : []),
        { id: 'returns-refunds', label: 'Returns & Refunds', icon: <RotateCcw className="h-4 w-4 text-rose-400" />, badge: returnRequestsCount > 0 ? `${returnRequestsCount} Pending` : null, badgeVariant: 'destructive' },
      ]
    },
    {
      title: 'PURCHASING & SUPPLIERS',
      items: [
        ...(selected && selected.kind !== 'food' ? [{ id: 'procurement-hub', label: 'Purchasing & Goods Receipts', icon: <Package className="h-4 w-4 text-amber-400" /> }] : []),
        { id: 'b2b', label: 'B2B Wholesale Marketplace', icon: <Store className="h-4 w-4 text-sky-400" />, roles: ['Wholesaler', 'Manufacturer'] },
        { id: 'quotation-management', label: 'RFQ & Quotation Hub', icon: <FileSpreadsheet className="h-4 w-4 text-teal-400" />, roles: ['Wholesaler', 'Manufacturer'] },
        { id: 'supplier-network', label: 'Supplier & Factory Network', icon: <Network className="h-4 w-4 text-indigo-400" />, roles: ['Wholesaler', 'Manufacturer'] },
      ]
    },
    {
      title: 'FINANCE & REPORTS',
      items: [
        ...(water ? [
          { id: 'water-billing', label: 'Water Subscriber Billing', icon: <Receipt className="h-4 w-4 text-sky-400" /> },
          { id: 'water-reports', label: 'Container & Deposit Reports', icon: <FileSpreadsheet className="h-4 w-4 text-sky-400" /> },
          { id: 'water-consumption', label: 'Water Delivery Reports', icon: <FileSpreadsheet className="h-4 w-4 text-sky-400" /> },
        ] : []),
        ...(selected?.kind === 'dairy' ? [{ id: 'dairy-billing', label: 'Subscriber Billing', icon: <Receipt className="h-4 w-4 text-amber-400" /> }] : []),
        { id: 'subscriptions', label: 'Payment Links & Invoices', icon: <Receipt className="h-4 w-4 text-amber-400" /> },
        { id: 'wallet', label: 'Wallet & Payout Requests', icon: <Wallet className="h-4 w-4 text-amber-400" /> },
        // Available under Earnings & Commissions; hide the duplicate shortcut.
        // { id: 'settlements', label: 'Settlement History', icon: <Coins className="h-4 w-4 text-emerald-400" /> },
        { id: 'earnings', label: 'Earnings & Commissions', icon: <TrendingUp className="h-4 w-4 text-blue-400" /> },
        ...(dailyNeeds ? [{ id: 'daily-needs-reports', label: dailyNeeds.reports, icon: <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> }] : []),
        ...(selected?.kind === 'dairy' ? [{ id: 'dairy-reports', label: 'Dairy Reports', icon: <Calendar className="h-4 w-4 text-amber-400" /> }] : []),
      ]
    },
    {
      title: 'CUSTOMERS & REVIEWS',
      items: [
        { id: 'customer-management', label: 'Customer Management', icon: <Users className="h-4 w-4 text-sky-400" /> },
        ...(selected?.kind === 'dairy' ? [{ id: 'dairy-reviews', label: 'Delivery Reviews', icon: <Star className="h-4 w-4 text-yellow-400" /> }] : []),
        { id: 'reviews', label: 'Reviews & Ratings', icon: <Star className="h-4 w-4 text-yellow-400" /> },
      ]
    },
    {
      title: 'MARKETING & STORE',
      items: [
        { id: 'coupons', label: 'Coupons & Offers', icon: <Gift className="h-4 w-4 text-amber-400" /> },
        // Hidden until the advertisements module is ready.
        // { id: 'advertisement', label: 'Advertisements', icon: <Megaphone className="h-4 w-4 text-orange-400" />, isComingSoon: true },
        { id: 'qr', label: 'QR Merchant Center', icon: <QrCode className="h-4 w-4 text-emerald-400" />, roles: ['Vendor'] },
        { id: 'store-design', label: 'Store Customization', icon: <Store className="h-4 w-4 text-amber-400" /> },
      ]
    },
    {
      title: 'NETWORK & GROWTH',
      items: [
        // Optional network page hidden from the everyday vendor menu.
        // { id: 'my-network', label: 'My Growth Network', icon: <Network className="h-4 w-4 text-sky-400" /> },
        // Regional coverage page hidden from the everyday vendor menu.
        // { id: 'hl', label: 'Hyperlocal Coverage', icon: <MapPin className="h-4 w-4 text-red-400" /> },
        // Optional franchise coordination page hidden from the everyday vendor menu.
        // { id: 'fc', label: 'Franchise Connect', icon: <Building2 className="h-4 w-4 text-amber-400" /> },
        // Hidden until real training content is connected.
        // { id: 'business-academy', label: 'Business Academy', icon: <BookOpen className="h-4 w-4 text-violet-400" /> },
      ]
    },
    {
      title: 'BUSINESS & SETTINGS',
      items: [
        { id: 'profile', label: 'Business Profile & KYC', icon: <Building2 className="h-4 w-4 text-slate-300" />, badge: profile.kycStatus === 'Verified' ? null : 'KYC Pending', badgeVariant: 'warning' },
        { id: 'staff-management', label: 'Staff Management', icon: <UserCheck className="h-4 w-4 text-teal-400" /> },
        { id: 'security', label: 'Security & Password', icon: <Lock className="h-4 w-4 text-rose-400" /> },
        { id: 'support', label: 'Support Center', icon: <HelpCircle className="h-4 w-4 text-zinc-400" /> },
      ]
    },
  ];

  const flowerSections: NavSection[] = [
    { title: 'FLOWER SHOP', items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      { id: 'pos', label: 'Counter POS & Billing', icon: <Receipt size={16} /> },
      { id: 'orders-all', label: 'Flower Orders', icon: <ShoppingBag size={16} />, badge: newOrdersCount || null },
      { id: 'flower-custom-orders', label: 'Custom Garland Requests', icon: <Calendar size={16} /> },
      { id: 'delivery', label: 'Deliveries & Pickup', icon: <Truck size={16} /> },
      { id: 'notifications-list', label: 'Notifications', icon: <Bell size={16} /> },
    ] },
    { title: 'FLOWERS & GARLANDS', items: [
      { id: 'products-all', label: getProductLabel, icon: <Package size={16} /> },
      { id: 'add-product', label: getAddProductLabel, icon: <PlusCircle size={16} /> },
      { id: 'daily-needs-stock', label: 'Flower Stock & Wastage', icon: <Boxes size={16} /> },
      { id: 'daily-needs-quality', label: 'Freshness & Grading', icon: <Package size={16} /> },
      { id: 'procurement-hub', label: 'Suppliers & Goods Receipts', icon: <Store size={16} /> },
    ] },
    { title: 'REPORTS & STORE', items: [
      { id: 'daily-needs-reports', label: 'Flower Sales & Wastage', icon: <FileSpreadsheet size={16} /> },
      { id: 'returns-refunds', label: 'Returns & Refunds', icon: <RotateCcw size={16} />, badge: returnRequestsCount || null },
      { id: 'withdrawals', label: 'Wallet & Payouts', icon: <Wallet size={16} /> },
      { id: 'profile', label: 'Business Profile & KYC', icon: <Building2 size={16} /> },
      { id: 'support', label: 'Support', icon: <HelpCircle size={16} /> },
    ] },
  ];

  const renderNavItems = () => {
    return (
      <nav aria-label="Vendor navigation" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4">
        {/* Search Bar */}
        <div className="pos-sidebar-search relative sticky top-0 z-10 py-2">
          <Search className="pointer-events-none absolute left-3 top-[19px] h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            aria-label="Search vendor menu"
            className="pos-field h-10 w-full pl-9 pr-3 text-sm"
          />
        </div>

        {(selected?.kind === 'flowers' ? flowerSections : navSections).map(section => {
          // Filter section items based on role & search query
          const visibleItems = section.items.filter(item => {
            // Role filtering
            if (item.roles && !item.roles.includes(userRole as any)) {
              if (item.roles.includes('Wholesaler') && !isWholesalerOrManufacturer) return false;
            }
            // Search query filtering
            const itemText = (typeof item.label === 'function' ? item.label() : item.label).toLowerCase();
            if (searchQuery.trim() && !itemText.includes(searchQuery.trim().toLowerCase())) {
              return false;
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="flex flex-col gap-1">
              <span className="pos-eyebrow px-3">
                {section.title}
              </span>
              <div className="flex flex-col gap-0.5 mt-0.5">
                {visibleItems.map(item => {
                  const itemLabel = typeof item.label === 'function' ? item.label() : item.label;
                  const isSelected = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={isSelected ? 'page' : undefined}
                      title={itemLabel}
                      onClick={() => handlePageClick(item.id)}
                      className="pos-nav-item"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="pos-nav-icon">{item.icon}</span>
                        <span className="min-w-0 whitespace-normal break-words leading-snug text-left">{itemLabel}</span>
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
      {mobileOpen && (
        <button type="button" tabIndex={-1} aria-label="Dismiss navigation" className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm lg:hidden" onClick={closeMobile} />
      )}
      <aside id="vendor-sidebar" className={`pos-sidebar ${mobileOpen ? 'flex' : 'hidden'} ${desktopOpen ? 'lg:flex' : 'lg:hidden'} fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] shrink-0 flex-col lg:relative lg:z-auto xl:w-68`}>
        <div className="pos-brand">
          <button type="button" className="pos-brand-home" aria-label="ApexBee vendor dashboard" onClick={() => handlePageClick('dashboard')}>
            <span className="pos-brand-art"><img src={`${import.meta.env.BASE_URL}apexbee-logo.png`} alt="" /></span>
            <span>Vendor Portal</span>
          </button>
          <button ref={closeButtonRef} type="button" className="pos-icon-button lg:hidden" aria-label="Close navigation" onClick={closeMobile}><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="pos-sidebar-context">
          <span className="pos-eyebrow">Current workspace</span>
          <p className="font-semibold leading-snug text-white">{selected?.name || 'All approved businesses'}</p>
          {selected && <p className="text-xs text-slate-400">{selected.categoryName}</p>}
        </div>
        {renderNavItems()}
      </aside>
    </>
  );
};
