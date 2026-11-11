import React, { useState, useRef, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { LogOut, User, Store, PhoneCall, ShieldCheck, Menu, PanelLeftClose, PanelLeftOpen, ShoppingBag } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  menuOpen: boolean;
  openMenu: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ menuOpen, openMenu, sidebarOpen, toggleSidebar }) => {
  const { profile, logout, setCurrentPage } = useVendor();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getAuthUser = () => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  };

  const loggedInUser = getAuthUser();
  const rawRoles = Array.isArray(loggedInUser?.roles)
    ? loggedInUser.roles
    : (loggedInUser?.role ? [loggedInUser.role] : []);
  const rolesList = rawRoles.map((r: string) => String(r).toLowerCase().trim());
  if (!rolesList.includes('customer')) {
    rolesList.unshift('customer');
  }

  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const customerPortalUrl = import.meta.env.VITE_FRONTEND_URL || import.meta.env.VITE_CUSTOMER_PORTAL_URL || (isLocalhost ? 'http://localhost:5173' : 'https://apexbee.in');

  const PORTAL_LINKS: Record<string, { label: string; url: string }> = {
    customer: { label: 'User / Customer Portal', url: customerPortalUrl },
    admin: { label: 'Admin Panel', url: isLocalhost ? 'http://localhost:5173/admin' : 'https://apexbee.in/admin' },
    vendor: { label: 'Vendor Portal', url: isLocalhost ? 'http://localhost:5174' : 'https://apexbeevendor.apexbee.in/' },
    wholesaler: { label: 'Vendor Portal', url: isLocalhost ? 'http://localhost:5174' : 'https://apexbeevendor.apexbee.in/' },
    manufacturer: { label: 'Vendor Portal', url: isLocalhost ? 'http://localhost:5174' : 'https://apexbeevendor.apexbee.in/' },
    franchise: { label: 'Franchise Management', url: 'https://franchser.apexbee.in/' },
    state_franchise: { label: 'Franchise Management', url: 'https://franchser.apexbee.in/' },
    district_franchise: { label: 'Franchise Management', url: 'https://franchser.apexbee.in/' },
    mandal_franchise: { label: 'Franchise Management', url: 'https://franchser.apexbee.in/' },
    food_partner: { label: 'Food Partner Portal', url: 'https://food.apexbee.in/' },
    food: { label: 'Food Partner Portal', url: 'https://food.apexbee.in/' },
    delivery_partner: { label: 'Delivery Partner Portal', url: 'https://delivery.apexbee.in/' },
    delivery: { label: 'Delivery Partner Portal', url: 'https://delivery.apexbee.in/' },
    service_provider: { label: 'Service Provider Portal', url: 'https://service.apexbee.in/login' },
    service: { label: 'Service Provider Portal', url: 'https://service.apexbee.in/login' },
    course_provider: { label: 'Course Provider Portal', url: 'http://localhost:5174' },
  };

  const availablePortals = rolesList
    .map((role: string) => {
      const match = PORTAL_LINKS[role];
      return match ? { ...match, role } : null;
    })
    .filter(Boolean);

  const portalsToSwitch = availablePortals.filter((p: any) => p && p.role !== 'vendor');

  const handleSwitchPortal = (role: string, targetUrl: string) => {
    localStorage.setItem('activeRole', role);
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const urlObj = new URL(targetUrl, window.location.origin);
      if (token && urlObj.origin !== window.location.origin) {
        urlObj.searchParams.set('auth_token', token);
        if (userStr) {
          urlObj.searchParams.set('auth_user', encodeURIComponent(userStr));
        }
        window.location.href = urlObj.toString();
        return;
      }
    } catch {
      // fallback
    }
    window.location.href = targetUrl;
  };

  const getInitials = (name: string) => {
    if (!name) return 'V';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLive = (profile.marketplaceStatus as string) === 'Live' || profile.marketplaceStatus === 'Approved';

  return (
    <header className="pos-header relative z-30 flex h-16 shrink-0 items-center justify-between gap-2 px-3 sm:px-5 xl:px-7">
      <div className="flex min-w-0 items-center gap-2.5">
        <button type="button" className="pos-icon-button lg:hidden" aria-label="Open navigation" aria-controls="vendor-sidebar" aria-expanded={menuOpen} onClick={openMenu}>
          <Menu size={20} aria-hidden="true" />
        </button>
        <button type="button" className="pos-icon-button pos-desktop-toggle" aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} aria-controls="vendor-sidebar" aria-expanded={sidebarOpen} onClick={toggleSidebar}>
          {sidebarOpen ? <PanelLeftClose size={20} aria-hidden="true" /> : <PanelLeftOpen size={20} aria-hidden="true" />}
        </button>
        <div className="min-w-0">
          <p className="pos-eyebrow hidden sm:block">Vendor workspace</p>
          <p className="truncate font-heading text-base font-bold text-white">{profile.businessName || 'ApexBee Vendor'}</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Quick Link to Customer / User Portal */}
        <button
          type="button"
          onClick={() => handleSwitchPortal('customer', customerPortalUrl)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-amber-300 hover:text-amber-200 font-extrabold text-xs transition border border-blue-700/50 cursor-pointer shadow-sm"
          title="Switch to User / Customer Shopping Portal"
        >
          <ShoppingBag size={14} className="text-amber-400" />
          <span>User Portal</span>
        </button>

        {/* Quick Counter POS Access Button */}
        <button
          type="button"
          onClick={() => setCurrentPage('pos')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-sm cursor-pointer"
          title="Open Counter POS Terminal"
        >
          <span>🧾</span>
          <span className="hidden sm:inline">Counter POS</span>
        </button>

        {/* Prominent Shop Status Toggle (ONLINE / OFFLINE) */}
        <button
          onClick={() => {
            const next = isLive ? 'Offline' : 'Live';
            (profile as any).marketplaceStatus = next;
            window.dispatchEvent(new Event('storage'));
            alert(`Shop Status changed to: ${next === 'Live' ? 'SHOP ONLINE (Taking Customer Orders)' : 'SHOP OFFLINE (Shop Closed)'}`);
          }}
          className={`pos-status flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${isLive
              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
            }`}
          title="Tap to turn your shop Online or Offline"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`} />
          <span className="font-heading">
            {isLive ? 'SHOP OPEN' : 'SHOP CLOSED'}
          </span>
        </button>


        {/* 1-Tap Call Support Button */}
        <button
          onClick={() => setCurrentPage('support')}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30 transition-all cursor-pointer shadow-xs"
          title="Direct assistance for village vendors"
        >
          <PhoneCall className="h-3.5 w-3.5 text-amber-400" />
          <span>Call Support 📞</span>
        </button>

        {/* Notifications Bell */}
        <NotificationCenter />

        {/* User Profile Menu */}
        <div className="relative" ref={menuRef}>
          <button
            aria-label="Account menu"
            aria-expanded={showProfileMenu}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 text-left hover:bg-blue-900/50 p-1.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-blue-700/40"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-blue-950 text-xs font-black shadow-md ring-2 ring-amber-400/40">
              {getInitials(profile.ownerName)}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-extrabold text-slate-100 leading-none">{profile.ownerName}</span>
              <span className="text-[11px] font-semibold text-blue-300/80 mt-0.5">{profile.businessName}</span>
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-2 w-60 rounded-2xl border border-blue-800/80 bg-blue-950 p-2 shadow-2xl z-50 flex flex-col gap-1"
              >
                <div className="px-3 py-2.5 border-b border-blue-900 flex flex-col bg-blue-900/40 rounded-xl mb-1">
                  <span className="text-xs font-extrabold text-amber-300">{profile.ownerName}</span>
                  <span className="text-xs text-blue-200 font-medium">{profile.email}</span>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setCurrentPage('profile');
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-blue-900/60 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <User className="h-4 w-4 text-blue-400" />
                  My Shop Profile
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setCurrentPage('store-design');
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-blue-900/60 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <Store className="h-4 w-4 text-blue-400" />
                  Store Design & QR
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setCurrentPage('security');
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-blue-900/60 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  Security Settings
                </button>

                <div className="h-px bg-blue-900 my-1" />

                {portalsToSwitch.length > 0 && (
                  <>
                    <p className="text-[10px] uppercase font-black text-blue-400 tracking-wider px-3 py-1">
                      Switch Portal
                    </p>
                    {portalsToSwitch.map((portal: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleSwitchPortal(portal.role, portal.url)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-extrabold text-amber-300 hover:bg-blue-900/60 rounded-lg transition-colors text-left cursor-pointer w-full"
                      >
                        🔄 {portal.label}
                      </button>
                    ))}
                    <div className="h-px bg-blue-900 my-1" />
                  </>
                )}

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left cursor-pointer w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
