import React, { useState, useRef, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { useSubscription } from '../features/subscription/hooks/useSubscription';
import { Search, LogOut, User, Settings, Sparkles, Store, PhoneCall, ShieldCheck } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { profile, logout, setCurrentPage } = useVendor();
  const { summary } = useSubscription();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const activePlanName = summary?.planName || '15-Day Free Trial';
  const activePlanStatus = summary?.status || 'TRIAL';

  const getAuthUser = () => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  };

  const loggedInUser = getAuthUser();
  const userRoles = Array.isArray(loggedInUser?.roles) ? loggedInUser.roles : [];
  const rolesList = userRoles.map((r: string) => r.toLowerCase());
  if (loggedInUser && !rolesList.includes('customer')) {
    rolesList.unshift('customer');
  }

  const PORTAL_LINKS: Record<string, { label: string; url: string }> = {
    customer: { label: 'Customer Portal', url: 'http://localhost:5173' },
    admin: { label: 'Admin Panel', url: 'http://localhost:5173/admin' },
    vendor: { label: 'Vendor Portal', url: 'http://localhost:5177' },
    franchise: { label: 'Franchise Management', url: 'http://localhost:5175' },
    state_franchise: { label: 'Franchise Management', url: 'http://localhost:5175' },
    district_franchise: { label: 'Franchise Management', url: 'http://localhost:5175' },
    mandal_franchise: { label: 'Franchise Management', url: 'http://localhost:5175' },
    service_provider: { label: 'Service Provider Portal', url: 'http://localhost:5176' },
    course_provider: { label: 'Course Provider Portal', url: 'http://localhost:5174' },
  };

  const availablePortals = rolesList
    .map((role: string) => {
      const match = PORTAL_LINKS[role];
      return match ? { ...match, role } : null;
    })
    .filter(Boolean);

  const handleSwitchPortal = (role: string, url: string) => {
    localStorage.setItem('activeRole', role);
    window.location.href = url;
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
    <header className="sticky top-0 z-40 w-full bg-blue-950/95 backdrop-blur-md px-4 md:px-6 h-16 flex items-center justify-between shadow-xl">
      {/* Search Bar */}
      <div className="relative w-48 md:w-80 flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-blue-300 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products, orders, transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-blue-900/40 text-slate-100 rounded-xl pl-9 pr-4 py-1.5 text-xs md:text-sm focus:outline-none focus:bg-blue-900/80 focus:ring-2 focus:ring-amber-400/30 transition-all placeholder:text-blue-300/70 font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 text-xs text-blue-300 hover:text-amber-400 cursor-pointer font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Prominent Shop Status Toggle (ONLINE / OFFLINE) */}
        <button
          onClick={() => {
            const next = isLive ? 'Offline' : 'Live';
            (profile as any).marketplaceStatus = next;
            window.dispatchEvent(new Event('storage'));
            alert(`Shop Status changed to: ${next === 'Live' ? 'SHOP ONLINE (Taking Customer Orders)' : 'SHOP OFFLINE (Shop Closed)'}`);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-black text-xs transition-all shadow-md cursor-pointer ${
            isLive
              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
          }`}
          title="Tap to turn your shop Online or Offline"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${
            isLive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
          }`} />
          <span className="font-heading">
            {isLive ? 'SHOP OPEN' : 'SHOP CLOSED'}
          </span>
        </button>

        {/* Active Subscription Badge */}
        <button
          onClick={() => setCurrentPage('subscription')}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-900/60 text-amber-300 hover:bg-blue-900 transition-all cursor-pointer shadow-xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span>{activePlanName}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-amber-400 text-blue-950 ml-0.5">
            {activePlanStatus}
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

                {availablePortals.length > 1 && (
                  <>
                    <p className="text-[10px] uppercase font-black text-blue-400 tracking-wider px-3 py-1">
                      Switch Portal
                    </p>
                    {availablePortals.map((portal: any, idx: number) => {
                      if (portal.role === 'vendor') return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSwitchPortal(portal.role, portal.url)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-extrabold text-amber-300 hover:bg-blue-900/60 rounded-lg transition-colors text-left cursor-pointer w-full"
                        >
                          🔄 {portal.label}
                        </button>
                      );
                    })}
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
