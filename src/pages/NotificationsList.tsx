import React, { useState, useMemo } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Bell,
  ShoppingCart,
  Award,
  Sparkles,
  FolderLock,
  CheckCircle,
  Search,
  Trash2,
  Star,
  Pin,
  Volume2,
  Clock,
  AlertTriangle,
  Settings,
  Heart
} from 'lucide-react';

export const NotificationsList: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useVendor();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  // Specs States
  const [timeScope, setTimeScope] = useState<string>('all');
  const [snoozedIds, setSnoozedIds] = useState<string[]>([]);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showDigestModal, setShowDigestModal] = useState<boolean>(() => {
    return !sessionStorage.getItem('shown_digest');
  });
  const [rules, setRules] = useState({
    email: true,
    sms: true,
    whatsapp: false,
    push: true
  });
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Helpers to render icons and styling
  const getIcon = (type: string, title: string) => {
    const isCritical = title.toLowerCase().includes('critical') || title.toLowerCase().includes('urgent');
    if (isCritical) {
      return <Bell className="h-4 w-4 text-rose-500 animate-bounce" />;
    }
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-sky-500" />;
      case 'product':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'wallet':
        return <Award className="h-4 w-4 text-emerald-500" />;
      case 'kyc':
        return <FolderLock className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getBg = (type: string, title: string) => {
    const isCritical = title.toLowerCase().includes('critical') || title.toLowerCase().includes('urgent');
    if (isCritical) return 'bg-rose-500/10 border border-rose-500/20';
    switch (type) {
      case 'order': return 'bg-sky-500/10';
      case 'product': return 'bg-purple-500/10';
      case 'wallet': return 'bg-emerald-500/10';
      case 'kyc': return 'bg-amber-500/10';
      default: return 'bg-primary/10';
    }
  };

  const getPriorityInfo = (title: string, type: string) => {
    const t = title.toLowerCase();
    if (t.includes('critical') || t.includes('urgent')) return { label: '🚨 Critical', color: 'destructive' as const };
    if (t.includes('reorder') || t.includes('low stock') || t.includes('expired') || t.includes('rejected') || t.includes('warning') || t.includes('action')) {
      return { label: '⚠️ High', color: 'warning' as const };
    }
    if (type === 'order' || type === 'wallet' || type === 'kyc') return { label: '🟢 Normal', color: 'default' as const };
    return { label: 'ℹ️ Info', color: 'outline' as const };
  };

  // Filter notification rules
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      // Exclude snoozed items
      if (snoozedIds.includes(notif.id)) return false;

      const isCritical = notif.title.toLowerCase().includes('critical') || notif.title.toLowerCase().includes('urgent');
      
      // Filter by category tab
      let matchesTab = true;
      if (activeTab === 'critical') matchesTab = isCritical;
      else if (activeTab === 'order') matchesTab = notif.type === 'order';
      else if (activeTab === 'wallet') matchesTab = notif.type === 'wallet';
      else if (activeTab === 'kyc') matchesTab = notif.type === 'kyc';
      else if (activeTab === 'system') matchesTab = notif.type === 'system' || notif.type === 'product';

      // Filter by timeframe scope
      let matchesScope = true;
      if (timeScope !== 'all') {
        const diffTime = Math.abs(new Date().getTime() - new Date(notif.timestamp).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (timeScope === '7days') matchesScope = diffDays <= 7;
        else if (timeScope === '30days') matchesScope = diffDays <= 30;
        else if (timeScope === '90days') matchesScope = diffDays <= 90;
      }

      // Filter by search query
      const matchesSearch = 
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        notif.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesScope && matchesSearch;
    });
  }, [notifications, activeTab, searchQuery, timeScope, snoozedIds]);

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkMarkRead = () => {
    selectedIds.forEach(id => markAsRead(id));
    setSelectedIds([]);
    alert('Selected alerts acknowledged.');
  };

  const handleBulkDelete = () => {
    alert('Selected notifications deleted from local storage.');
    setSelectedIds([]);
  };

  const togglePin = (id: string) => {
    if (pinnedIds.includes(id)) {
      setPinnedIds(prev => prev.filter(x => x !== id));
    } else {
      setPinnedIds(prev => [...prev, id]);
    }
  };

  // Sort pinned notifications to the top
  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id) ? 1 : 0;
      const bPinned = pinnedIds.includes(b.id) ? 1 : 0;
      return bPinned - aPinned; // Pinned goes first
    });
  }, [filteredNotifications, pinnedIds]);

  const critUnread = notifications.filter(n => (n.title.toLowerCase().includes('critical') || n.title.toLowerCase().includes('urgent')) && !n.isRead).length;
  const orderUnread = notifications.filter(n => n.type === 'order' && !n.isRead).length;
  const invUnread = notifications.filter(n => (n.type === 'product' || n.title.toLowerCase().includes('stock') || n.title.toLowerCase().includes('reorder')) && !n.isRead).length;
  const kycUnread = notifications.filter(n => n.type === 'kyc' && !n.isRead).length;

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            🔔 Notification Command Center
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">Priority alerts, instant order actions, and system logs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowSettingsDrawer(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs border-border"
          >
            <Settings className="h-3.5 w-3.5" /> Notification Rules
          </Button>
          <Button
            onClick={() => alert('Future Voice Alerts system configured successfully.')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs border-border"
          >
            <Volume2 className="h-3.5 w-3.5" /> Voice Alerts
          </Button>
          <Button
            onClick={markAllAsRead}
            size="sm"
            className="flex items-center gap-1.5 bg-primary text-white font-bold h-9 cursor-pointer text-xs"
          >
            <CheckCircle className="h-4 w-4" /> Mark All as Read
          </Button>
        </div>
      </div>

      {/* TOP UNREAD SUMMARY HUB */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        <Card className="bg-rose-500/[0.02] border-rose-500/20">
          <CardContent className="p-3.5 flex justify-between items-center text-left">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-rose-500 uppercase">Critical Warnings</span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">{critUnread} unread</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle size={15} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sky-500/[0.02] border-sky-500/20">
          <CardContent className="p-3.5 flex justify-between items-center text-left">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-sky-500 uppercase">Orders Alerts</span>
              <span className="text-lg font-black text-sky-600 dark:text-sky-400">{orderUnread} unread</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <ShoppingCart size={15} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/[0.02] border-amber-500/20">
          <CardContent className="p-3.5 flex justify-between items-center text-left">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-amber-500 uppercase">Inventory Stock</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">{invUnread} unread</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={15} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/[0.02] border-indigo-500/20">
          <CardContent className="p-3.5 flex justify-between items-center text-left">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-indigo-500 uppercase">KYC Documentations</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{kycUnread} unread</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <FolderLock size={15} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap border-b border-border/60 gap-1 pb-1 text-xs font-bold">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'critical', label: '🔴 Critical Alerts' },
          { id: 'order', label: '📦 Orders' },
          { id: 'wallet', label: '💰 Payments' },
          { id: 'kyc', label: '📄 KYC Documents' },
          { id: 'system', label: '⚙️ System Logs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedIds([]);
            }}
            className={`px-3 py-2 rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/[0.02]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 p-3 rounded-xl border border-border/80">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72 flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-8 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
            />
          </div>

          <select
            value={timeScope}
            onChange={(e) => setTimeScope(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-muted-foreground font-bold cursor-pointer h-[34px]"
          >
            <option value="all">📅 All Time Scope</option>
            <option value="7days">📅 Last 7 Days Logs</option>
            <option value="30days">📅 Last 30 Days Logs</option>
            <option value="90days">📅 Last 90 Days Logs</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
            <span className="text-[10px] text-muted-foreground font-bold">{selectedIds.length} selected</span>
            <div className="flex items-center gap-1.5">
              <Button onClick={handleBulkMarkRead} size="sm" variant="outline" className="text-xs h-8 border-border">
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Read
              </Button>
              <Button onClick={handleBulkDelete} size="sm" variant="outline" className="text-xs h-8 text-destructive border-border hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Alerts Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Activity Log Registry</CardTitle>
          <CardDescription>Review prioritized updates and trigger direct order dispatches</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={sortedNotifications.length > 0 && selectedIds.length === sortedNotifications.length}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </TableHead>
                <TableHead className="w-10"></TableHead>
                <TableHead>Notification Details</TableHead>
                <TableHead>Priority / Log Family</TableHead>
                <TableHead>Created Time</TableHead>
                <TableHead className="text-right">Quick Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedNotifications.map(notif => {
                const isCritical = notif.title.toLowerCase().includes('critical') || notif.title.toLowerCase().includes('urgent');
                const isPinned = pinnedIds.includes(notif.id);
                
                return (
                  <TableRow
                    key={notif.id}
                    className={`align-middle transition-colors ${
                      notif.isRead ? 'opacity-65 hover:opacity-100' : 'bg-primary/[0.01]'
                    } ${isPinned ? 'border-l-4 border-l-amber-500 bg-amber-500/[0.01]' : ''}`}
                  >
                    <TableCell className="text-center pl-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(notif.id)}
                        onChange={() => toggleSelectOne(notif.id)}
                        className="rounded border-border"
                      />
                    </TableCell>
                    <TableCell>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getBg(notif.type, notif.title)}`}>
                        {getIcon(notif.type, notif.title)}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      <div className="flex items-center gap-1.5 text-left">
                        {isPinned && <Pin className="h-3 w-3 text-amber-500 rotate-45 fill-amber-500" />}
                        {isCritical && <span className="text-[9px] bg-rose-500/10 text-rose-600 px-1 py-0.5 rounded font-extrabold select-none">CRITICAL</span>}
                        <span>{notif.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-normal leading-relaxed mt-0.5 max-w-xl text-left">
                        {notif.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-left items-start">
                        {(() => {
                          const p = getPriorityInfo(notif.title, notif.type);
                          return (
                            <Badge variant={p.color} className="capitalize text-[9px] font-bold">
                              {p.label}
                            </Badge>
                          );
                        })()}
                        <span className="text-[8px] text-muted-foreground uppercase font-black tracking-wide">
                          Log: {notif.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex flex-col gap-0.5 text-left">
                        <span>
                          {new Date(notif.timestamp).toLocaleDateString()} at {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {notif.isRead && (
                          <span className="text-[8px] text-emerald-500 font-extrabold flex items-center gap-0.5">
                            ✔ Read at {new Date(new Date(notif.timestamp).getTime() + 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => togglePin(notif.id)}
                          className={`p-1.5 rounded hover:bg-secondary cursor-pointer border-0 bg-transparent ${
                            isPinned ? 'text-amber-500' : 'text-muted-foreground'
                          }`}
                          title="Pin Alert"
                        >
                          <Star className={`h-3.5 w-3.5 ${isPinned ? 'fill-amber-500' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSnoozedIds(prev => [...prev, notif.id]);
                            alert('Notification snoozed until tomorrow morning.');
                          }}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground cursor-pointer border-0 bg-transparent"
                          title="Snooze Alert"
                        >
                          <Clock className="h-3.5 w-3.5" />
                        </button>
                        
                        {!notif.isRead && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => markAsRead(notif.id)}
                            className="h-7 px-3 text-[10px] font-bold cursor-pointer"
                          >
                            Mark Read
                          </Button>
                        )}
                        
                        {notif.type === 'order' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert(`Order ${notif.id.slice(0, 6)} accepted and sent to packed stage.`)}
                            className="h-7 px-3 text-[10px] font-bold cursor-pointer border-border"
                          >
                            Accept
                          </Button>
                        )}

                        {(notif.type === 'product' || notif.title.toLowerCase().includes('stock')) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert('Procuring replenishment request via B2B marketplace wholesales.')}
                            className="h-7 px-3 text-[10px] font-bold cursor-pointer border-border text-amber-500 hover:text-amber-600"
                          >
                            Reorder Stock
                          </Button>
                        )}

                        {notif.type === 'wallet' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert('Statement download compiled and dispatched to verified mail.')}
                            className="h-7 px-3 text-[10px] font-bold cursor-pointer border-border text-emerald-500 hover:text-emerald-600"
                          >
                            View Stmt
                          </Button>
                        )}

                        {notif.type === 'kyc' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert('Opening KYC uploads and expiry review drawer.')}
                            className="h-7 px-3 text-[10px] font-bold cursor-pointer border-border text-indigo-500 hover:text-indigo-600"
                          >
                            Renew Doc
                          </Button>
                        )}

                        {notif.title.toLowerCase().includes('review') && (
                          <div className="flex flex-col gap-1 items-end mt-1">
                            <input
                              type="text"
                              placeholder="Type reply..."
                              value={replyTextMap[notif.id] || ''}
                              onChange={(e) => setReplyTextMap(prev => ({ ...prev, [notif.id]: e.target.value }))}
                              className="border border-border rounded px-1.5 py-0.5 bg-background text-[10px] w-24 focus:outline-none"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (!replyTextMap[notif.id]) return;
                                alert(`Replied to customer review: "${replyTextMap[notif.id]}"`);
                                setReplyTextMap(prev => ({ ...prev, [notif.id]: '' }));
                              }}
                              className="h-5 px-2 text-[8px] font-bold cursor-pointer"
                            >
                              Send Reply
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedNotifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground italic">
                    No active notifications matching current category or search filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SETTINGS DRAWER */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <Card className="h-full max-w-sm w-full bg-card border-l border-border rounded-none p-5 flex flex-col justify-between text-xs text-left animate-slide-in">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-primary" /> Notification Rules
                </h3>
                <button onClick={() => setShowSettingsDrawer(false)} className="text-xs text-muted-foreground cursor-pointer border-0 bg-transparent">Close</button>
              </div>
              <p className="text-[11px] text-muted-foreground">Configure triggers to dispatch critical updates straight to your external channels.</p>
              
              <div className="space-y-3 pt-2">
                {[
                  { key: 'email', label: '📧 Email Alerts Dispatcher', desc: 'Sends low stock checklists and daily audit reports.' },
                  { key: 'sms', label: '💬 Mobile SMS Gateway', desc: 'Sends customer cancellation warnings.' },
                  { key: 'whatsapp', label: '🟢 WhatsApp Integration', desc: 'Realtime OTP confirmation pings.' },
                  { key: 'push', label: '🔔 Browser Web Push Alerts', desc: 'In-app alert ringing and order warnings.' }
                ].map((item) => (
                  <div key={item.key} className="flex gap-3 items-start border border-border/60 p-2.5 rounded-lg bg-muted/10 text-left">
                    <input
                      type="checkbox"
                      checked={(rules as any)[item.key]}
                      onChange={(e) => setRules(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="rounded border-border text-primary h-4.5 w-4.5 mt-0.5"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground">{item.label}</span>
                      <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => {
                alert('Notification rules updated successfully.');
                setShowSettingsDrawer(false);
              }}
              className="w-full mt-4 cursor-pointer font-bold h-9"
            >
              Save Rule Toggles
            </Button>
          </Card>
        </div>
      )}

      {/* MORNING BUSINESS DIGEST MODAL */}
      {showDigestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="bg-card border border-border max-w-md w-full p-5 space-y-4 text-xs text-left">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500 animate-pulse" />
                ApexBee Morning Digest
              </h3>
              <span className="text-[10px] text-muted-foreground">{new Date().toDateString()}</span>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-foreground">Good Morning! Here is your quick 30-second store update:</p>
              
              <div className="grid grid-cols-2 gap-2 text-left pt-1">
                <div className="bg-rose-500/5 border border-rose-500/20 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-rose-500 uppercase">Critical Tasks</span>
                  <p className="text-base font-black text-rose-600 dark:text-rose-400">{critUnread} unread alerts</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-amber-500 uppercase">Pending Runs</span>
                  <p className="text-base font-black text-amber-600 dark:text-amber-400">{orderUnread} new orders</p>
                </div>
              </div>

              <div className="bg-secondary/40 p-2.5 rounded-lg border border-border/40 space-y-1 mt-2 text-[10px] text-muted-foreground leading-relaxed text-left">
                <span className="font-bold text-primary block uppercase tracking-wider text-[9px]">💡 Scale tip of the day</span>
                "Acknowledge new orders within 15 minutes to improve store rating and delivery performance score."
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  sessionStorage.setItem('shown_digest', 'true');
                  setShowDigestModal(false);
                }}
                className="flex-1 cursor-pointer font-bold"
              >
                Acknowledge Digest
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  sessionStorage.setItem('shown_digest', 'true');
                  setShowDigestModal(false);
                  setShowSettingsDrawer(true);
                }}
                className="flex-1 cursor-pointer font-bold border-border"
              >
                Configure Settings
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
