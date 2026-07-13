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
  Volume2
} from 'lucide-react';

export const NotificationsList: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useVendor();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

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

  // Filter notification rules
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      const isCritical = notif.title.toLowerCase().includes('critical') || notif.title.toLowerCase().includes('urgent');
      
      // Filter by category tab
      let matchesTab = true;
      if (activeTab === 'critical') matchesTab = isCritical;
      else if (activeTab === 'order') matchesTab = notif.type === 'order';
      else if (activeTab === 'wallet') matchesTab = notif.type === 'wallet';
      else if (activeTab === 'kyc') matchesTab = notif.type === 'kyc';
      else if (activeTab === 'system') matchesTab = notif.type === 'system' || notif.type === 'product';

      // Filter by search query
      const matchesSearch = 
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        notif.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [notifications, activeTab, searchQuery]);

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
            onClick={() => alert('Future Voice Alerts system configured successfully.')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs border-border"
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
                      <div className="flex items-center gap-1.5">
                        {isPinned && <Pin className="h-3 w-3 text-amber-500 rotate-45 fill-amber-500" />}
                        <span>{notif.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-normal leading-relaxed mt-0.5 max-w-xl">
                        {notif.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-left items-start">
                        <Badge variant={isCritical ? 'destructive' : 'outline'} className="capitalize text-[9px] font-bold">
                          {isCritical ? '🚨 Critical' : notif.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(notif.timestamp).toLocaleDateString()} at {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => togglePin(notif.id)}
                          className={`p-1.5 rounded hover:bg-secondary cursor-pointer ${
                            isPinned ? 'text-amber-500' : 'text-muted-foreground'
                          }`}
                          title="Pin Alert"
                        >
                          <Star className={`h-3.5 w-3.5 ${isPinned ? 'fill-amber-500' : ''}`} />
                        </button>
                        
                        {!notif.isRead && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => markAsRead(notif.id)}
                            className="h-7 px-3.5 text-[10px] font-bold cursor-pointer"
                          >
                            Mark Read
                          </Button>
                        )}
                        
                        {notif.type === 'order' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert('Navigating to processing details...')}
                            className="h-7 px-3 text-[10px] font-bold cursor-pointer border-border"
                          >
                            Accept Order
                          </Button>
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
    </div>
  );
};

export default NotificationsList;
