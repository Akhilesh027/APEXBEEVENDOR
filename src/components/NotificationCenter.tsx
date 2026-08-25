import React, { useState, useRef, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { Bell, Check, CircleAlert, ShoppingCart, Award, Sparkles, FolderLock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationCenter: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, setCurrentPage } = useVendor();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Orders' | 'Payments' | 'Approvals'>('All');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'Orders') return n.type === 'order';
    if (activeFilter === 'Payments') return n.type === 'wallet';
    if (activeFilter === 'Approvals') return n.type === 'product' || n.type === 'kyc';
    return true;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-sky-400" />;
      case 'product':
        return <CircleAlert className="h-4 w-4 text-purple-400" />;
      case 'wallet':
        return <Award className="h-4 w-4 text-emerald-400" />;
      case 'kyc':
        return <FolderLock className="h-4 w-4 text-amber-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-amber-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'order': return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
      case 'product': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'wallet': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'kyc': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    }
  };

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.type === 'order') {
      setCurrentPage('orders');
    } else if (notif.type === 'wallet') {
      setCurrentPage('wallet');
    } else if (notif.type === 'kyc') {
      setCurrentPage('kyc-compliance');
    } else if (notif.type === 'product') {
      setCurrentPage('products');
    } else {
      setCurrentPage('notifications');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer border-none bg-transparent"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-84 sm:w-96 rounded-2xl border border-slate-700/80 bg-[#0F172A] p-4 shadow-2xl shadow-black/90 z-[999] flex flex-col max-h-[500px] text-white"
            style={{ backgroundColor: '#0F172A' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-tight">Alerts & Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer border-none bg-transparent"
                  >
                    <Check className="h-3 w-3" /> Mark read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 border-none bg-transparent cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification Filter Tabs */}
            <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 mb-3 text-[11px] font-bold gap-1">
              {(['All', 'Orders', 'Payments', 'Approvals'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`flex-1 py-1.5 rounded-lg cursor-pointer duration-150 border-none transition-all font-bold ${
                    activeFilter === cat 
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50 bg-transparent'
                  }`}
                >
                  {cat === 'Orders' ? '📦 Orders' : cat === 'Payments' ? '💰 Payments' : cat === 'Approvals' ? '✅ Approvals' : 'All'}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="overflow-y-auto pr-1 flex-1 flex flex-col gap-2 max-h-[340px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <Bell className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">No notifications</span>
                  <span className="text-[11px] text-slate-400">No alerts found in this category.</span>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                      notif.isRead
                        ? 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/80 opacity-75 hover:opacity-100'
                        : 'bg-slate-800/90 border-amber-400/40 hover:bg-slate-750 shadow-sm'
                    }`}
                  >
                    <div className={`flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center ${getBg(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className={`text-xs truncate ${notif.isRead ? 'font-semibold text-slate-200' : 'font-extrabold text-white'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                        {notif.description}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="flex-shrink-0 flex items-center">
                        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50 animate-pulse" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
