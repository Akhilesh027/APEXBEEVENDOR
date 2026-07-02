import React, { useState, useRef, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { Bell, Check, CircleAlert, ShoppingCart, Award, Sparkles, FolderLock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationCenter: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useVendor();
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
        return <ShoppingCart className="h-4 w-4 text-sky-500" />;
      case 'product':
        return <CircleAlert className="h-4 w-4 text-purple-500" />;
      case 'wallet':
        return <Award className="h-4 w-4 text-emerald-500" />;
      case 'kyc':
        return <FolderLock className="h-4 w-4 text-amber-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'order': return 'bg-sky-500/10';
      case 'product': return 'bg-purple-500/10';
      case 'wallet': return 'bg-emerald-500/10';
      case 'kyc': return 'bg-amber-500/10';
      default: return 'bg-primary/10';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-background animate-pulse">
            {unreadCount}
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
            className="absolute right-0 mt-2.5 w-80 md:w-96 rounded-xl border border-border bg-card p-4 shadow-xl z-50 flex flex-col max-h-[480px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">Alerts & Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            {/* Notification Filter Tabs */}
            <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/40 mb-3 text-[10px] font-bold">
              {['All', 'Orders', 'Payments', 'Approvals'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat as any)}
                  className={`flex-1 py-1 rounded cursor-pointer duration-100 ${
                    activeFilter === cat 
                      ? 'bg-background text-foreground shadow-xs' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="overflow-y-auto no-scrollbar flex-1 flex flex-col gap-2">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                  <Bell className="h-8 w-8 text-muted-foreground/35" />
                  <span className="text-xs font-semibold">No notifications</span>
                  <span className="text-[10px]">No alerts found in this category.</span>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`flex gap-3 p-2.5 rounded-lg border transition-all duration-200 cursor-pointer text-left ${
                      notif.isRead
                        ? 'bg-card border-transparent opacity-70 hover:opacity-100'
                        : 'bg-primary/[0.02] border-primary/5 hover:bg-primary/[0.04]'
                    }`}
                  >
                    <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${getBg(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className={`text-xs ${notif.isRead ? 'font-medium text-foreground' : 'font-bold text-foreground'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {notif.description}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="flex-shrink-0 flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
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
