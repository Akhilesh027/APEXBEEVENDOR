import React, { useState, useRef, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { Search, Sun, Moon, LogOut, User, Settings, Building } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { Badge } from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { profile, theme, setTheme, logout } = useVendor();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md px-6 h-16 flex items-center justify-between">
      {/* Search Input */}
      <div className="relative w-64 md:w-96 flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search listings, orders, transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-secondary/60 text-foreground border border-transparent hover:border-border rounded-lg pl-9 pr-4 py-1.5 text-xs md:text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Prominent Business Type Badge */}
        <Badge variant="purple" className="hidden sm:inline-flex items-center gap-1 px-3 py-1">
          <Building className="h-3 w-3" />
          {profile.businessType}
        </Badge>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-500 animate-spin-slow" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-600" />
          )}
        </button>

        {/* Notification Bell */}
        <NotificationCenter />

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 text-left hover:bg-secondary/60 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary/25">
              {getInitials(profile.ownerName)}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-foreground leading-none">{profile.ownerName}</span>
              <span className="text-[10px] text-muted-foreground">{profile.businessName}</span>
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl z-50 flex flex-col gap-1"
              >
                <div className="px-3 py-2 border-b border-border/50 flex flex-col">
                  <span className="text-xs font-bold text-foreground">{profile.ownerName}</span>
                  <span className="text-[10px] text-muted-foreground">{profile.email}</span>
                </div>

                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary rounded-lg transition-colors text-left cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  My Account
                </button>

                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary rounded-lg transition-colors text-left cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  Settings
                </button>

                <div className="h-px bg-border/50 my-1" />

                {availablePortals.length > 1 && (
                  <>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-[0.12em] px-3 py-1">
                      Switch Portal
                    </p>
                    {availablePortals.map((portal: any, idx: number) => {
                      if (portal.role === 'vendor') return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSwitchPortal(portal.role, portal.url)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary hover:bg-secondary rounded-lg transition-colors text-left cursor-pointer w-full font-semibold"
                        >
                          🔄 {portal.label}
                        </button>
                      );
                    })}
                    <div className="h-px bg-border/50 my-1" />
                  </>
                )}

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left cursor-pointer w-full"
                >
                  <LogOut className="h-3.5 w-3.5" />
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
