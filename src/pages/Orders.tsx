import React, { useEffect, useMemo, useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../components/ui/Table';
import { Drawer } from '../components/ui/Drawer';
import { Select } from '../components/ui/Select';
import {
  Search,
  Eye,
  SlidersHorizontal,
  Truck,
  Smile,
  Phone,
  MapPin,
  RefreshCw,
  Loader2,
  Store,
  CalendarDays,
} from 'lucide-react';
import type { Order } from '../types';

type AgentType = 'Platform' | 'Vendor' | 'Independent';

const normalizeStatus = (status?: string) => {
  if (!status) return 'New';
  if (status === 'Confirmed') return 'Processing';
  return status;
};

export const Orders: React.FC = () => {
  const {
    orders,
    products,
    deliveryAgents,
    acceptOrder,
    packOrder,
    assignDelivery,
    deliverOrder,
    approveReturn,
    rejectReturn,
    vendorSubscriptions,
    assignSubscriptionDelivery,
    currentPage,
  } = useVendor();

  const mainView = React.useMemo(() => {
    if (currentPage === 'orders-localshop') return 'localshop';
    if (currentPage === 'orders-subscriptions') return 'subscription';
    return 'orders';
  }, [currentPage]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'normal' | 'pickup' | 'subscribed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>('Platform');
  const [subAgentType, setSubAgentType] = useState<AgentType>('Platform');
  const [subAgentId, setSubAgentId] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  // Prep Time Modal State
  const [prepModalOrder, setPrepModalOrder] = useState<Order | null>(null);
  const [selectedPrepTime, setSelectedPrepTime] = useState<number>(20);

  // Specs States
  const [otpValue, setOtpValue] = useState('');
  const [validatedOrders, setValidatedOrders] = useState<string[]>([]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrOrder, setQrOrder] = useState<any | null>(null);
  const [returnsLedger] = useState<any[]>([
    { orderId: 'ORD-7740', customer: 'Ravi Kumar', item: 'Fresh Organic Mangoes', refundAmt: 250, status: 'Completed', date: '2026-07-12' },
    { orderId: 'ORD-7711', customer: 'Suresh Babu', item: 'Cold Pressed Coconut Oil', refundAmt: 320, status: 'Awaiting Pickup', date: '2026-07-13' }
  ]);
  const [showReturnLedgerModal, setShowReturnLedgerModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState<Record<string, string>>({});
  const [tempNote, setTempNote] = useState('');

  React.useEffect(() => {
    if (selectedOrder) {
      setCheckedItems((selectedOrder as any).packingChecklist || []);
    } else {
      setCheckedItems([]);
    }
  }, [selectedOrder]);

  const handleDownloadInvoice = async (orderId: string, filename: string) => {
    try {
      setDownloadingPdf('invoice');
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/orders/${orderId}/invoice`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Invoice file generation failed.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleDownloadPackingSlip = async (orderId: string, filename: string) => {
    try {
      setDownloadingPdf('slip');
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/orders/${orderId}/packing-slip`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Packing slip file generation failed.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PackingSlip_${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleToggleChecklist = async (productId: string) => {
    if (!selectedOrder) return;
    const updated = checkedItems.includes(productId)
      ? checkedItems.filter(id => id !== productId)
      : [...checkedItems, productId];

    setCheckedItems(updated);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/orders/${selectedOrder.id}/packing-checklist`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ checklist: updated })
      });
      if (res.ok) {
        const data = await res.json();
        (selectedOrder as any).packingChecklist = updated;
        if (data.order?.orderStatus) {
          selectedOrder.deliveryStatus = data.order.orderStatus;
          selectedOrder.timeline = data.order.timeline;
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshSelectedOrder = (orderId: string) => {
    const updated = orders.find((o) => o.id === orderId);
    if (updated) setSelectedOrder(updated);
  };

  const runAction = async (
    key: string,
    callback: () => Promise<void> | void,
    closeDrawer = false
  ) => {
    try {
      setActionLoading(key);
      await callback();
      if (closeDrawer) setSelectedOrder(null);
    } finally {
      setActionLoading(null);
    }
  };

  const getOrderPayout = (order: Order) => {
    const orderDistType = ((order as any).distributionType || (order as any).commissionType || (order as any).fulfillmentType || '').toLowerCase();
    const distributedFrom = ((order as any).distributedFrom || (order as any).commissionSource || '').toLowerCase();
    const vendorCommAmount = (order as any).vendorCommissionAmount;

    // Strictly check if order is under ApexBee Commission model vs Platform Fee model
    // If distributedFrom === 'platform_fee' or vendorCommissionAmount === 0, it is NOT an ApexBee vendor commission deduction!
    const isExplicitApexBeeCommission =
      (distributedFrom === 'apexbee_commission' || distributedFrom === 'apexbee' || orderDistType === 'apexbee') &&
      vendorCommAmount !== 0;

    let totalComm = 0;

    if (isExplicitApexBeeCommission) {
      totalComm = (order as any).commissionAmount ?? (order as any).vendorCommissionAmount ?? (order as any).platformCommission ?? 0;

      if (!totalComm && order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId);
          const rate = prod && typeof prod.commissionRate === 'number' ? prod.commissionRate : 0;
          totalComm += Math.round(item.price * item.quantity * (rate / 100));
        });
      }
    } else {
      // Platform fee model or standard order: 0 commission deduction for vendor
      totalComm = 0;
    }

    const payout = Math.max(0, order.totalAmount - totalComm);
    const avgRate =
      order.subtotal > 0 && totalComm > 0 ? Math.round((totalComm / order.subtotal) * 100) : 0;

    const isApexBeeCommissionModel = isExplicitApexBeeCommission && totalComm > 0;

    return { payout, commission: totalComm, avgRate, isApexBeeCommissionModel };
  };

  const LiveOrderTimerBadge = ({ estimatedDeliveryTime, prepMins }: { estimatedDeliveryTime?: string; prepMins?: number }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isOverdue, setIsOverdue] = useState<boolean>(false);

    useEffect(() => {
      if (!estimatedDeliveryTime) return;

      const updateTimer = () => {
        const target = new Date(estimatedDeliveryTime).getTime();
        const now = Date.now();
        const diffSecs = Math.floor((target - now) / 1000);

        if (diffSecs <= 0) {
          const overMins = Math.floor(Math.abs(diffSecs) / 60);
          setTimeLeft(`🚨 PREP OVERDUE (${overMins}m EXPIRED)`);
          setIsOverdue(true);
        } else {
          const m = Math.floor(diffSecs / 60);
          const s = diffSecs % 60;
          setTimeLeft(`⏱️ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
          setIsOverdue(false);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }, [estimatedDeliveryTime]);

    if (!estimatedDeliveryTime) {
      return <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px]">⏱️ {prepMins || 20}m Prep</span>;
    }

    if (isOverdue) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-mono font-black text-[10px] border border-red-400 animate-pulse shadow-sm">
          {timeLeft}
        </span>
      );
    }

    return (
      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-black text-[10px] border border-amber-400/40 animate-pulse">
        {timeLeft || '⏱️ Calculating...'}
      </span>
    );
  };

  const getDeliveryStatusBadge = (status: string, order?: Order) => {
    const current = normalizeStatus(status);
    const hasAgent = Boolean(order?.assignedDeliveryAgent || (order as any)?.deliveryAgentId);

    switch (current) {
      case 'New':
      case 'Pending':
      case 'pending':
      case 'Unassigned':
        return <Badge variant="warning">⏳ Unassigned / Pending Rider</Badge>;
      case 'Accepted':
      case 'Assigned':
      case 'assigned':
        if (!hasAgent) {
          return <Badge variant="warning">⏳ Unassigned / Pending Rider</Badge>;
        }
        return <Badge variant="warning">🛵 Rider Accepted ({order?.assignedDeliveryAgent})</Badge>;
      case 'Reached Vendor':
        return <Badge variant="purple">🏬 Rider at Store</Badge>;
      case 'Processing':
      case 'preparing':
      case 'Confirmed':
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge variant="warning">Confirmed / Processing</Badge>
            {((order as any)?.estimatedDeliveryTime || (order as any)?.estimatedDeliveryMinutes) && (
              <LiveOrderTimerBadge
                estimatedDeliveryTime={(order as any)?.estimatedDeliveryTime}
                prepMins={(order as any)?.estimatedDeliveryMinutes}
              />
            )}
          </div>
        );
      case 'Packed':
        return <Badge variant="purple">Packed / Ready</Badge>;
      case 'Shipped':
        return <Badge variant="purple">Shipped / In Transit</Badge>;
      case 'Reached Customer':
        return <Badge variant="purple">📍 Arrived at Customer</Badge>;
      case 'Delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'Returned':
        return <Badge variant="destructive">Returned</Badge>;
      default:
        return <Badge variant="secondary">{current}</Badge>;
    }
  };

  const allCombinedOrders = useMemo(() => {
    const existingIds = new Set(orders.map((o) => o.id));
    const subOrdersMapped: Order[] = (vendorSubscriptions || []).map((sub: any) => {
      const subId = sub.id || sub._id || 'SUB-100';
      const hasAgent = Boolean(sub.assignedDeliveryAgent || sub.deliveryAgentId);
      return {
        id: subId,
        _id: sub._id || subId,
        customerName: sub.customerName || 'Subscriber',
        customerPhone: sub.customerPhone || '',
        deliveryAddress: sub.address || sub.deliveryAddress || 'Subscription Address',
        items: [
          {
            productId: sub._id || 'sub-item',
            productName: sub.productName || 'Daily Subscription Product',
            sku: 'SUB-SKU',
            quantity: sub.quantity || 1,
            price: sub.unitPrice || 0,
            image: '/placeholder.png'
          }
        ],
        subtotal: (sub.unitPrice || 0) * (sub.quantity || 1),
        shippingCharge: 0,
        packingCharge: 0,
        discount: 0,
        totalAmount: (sub.unitPrice || 0) * (sub.quantity || 1),
        paymentMethod: 'Prepaid (Subscription)',
        paymentStatus: 'Paid',
        deliveryStatus: hasAgent
          ? (sub.status === 'active' || sub.status === 'Active' ? 'Accepted' : sub.status || 'Assigned')
          : 'Pending',
        orderDate: sub.startDate || new Date().toISOString(),
        timeline: [],
        assignedDeliveryAgent: sub.assignedDeliveryAgent || '',
        assignedDeliveryAgentType: sub.deliveryAgentType || 'Platform',
        isScheduledSubscription: true,
        isSubscription: true,
        scheduleDetails: {
          frequency: sub.frequency || 'Daily',
          startDate: sub.startDate || '',
          slot: sub.deliverySlot || ''
        }
      } as Order;
    }).filter((so) => !existingIds.has(so.id));

    return [...orders, ...subOrdersMapped];
  }, [orders, vendorSubscriptions]);

  const filteredOrders = useMemo(() => {
    return allCombinedOrders.filter((o) => {
      const currentStatus = normalizeStatus(o.deliveryStatus);
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        (o.items && o.items.some((it) => it.productName.toLowerCase().includes(query)));

      let matchesStatus = true;

      if (filterStatus === 'new') matchesStatus = currentStatus === 'New';
      else if (filterStatus === 'processing')
        matchesStatus = currentStatus === 'Processing';
      else if (filterStatus === 'packed') matchesStatus = currentStatus === 'Packed';
      else if (filterStatus === 'shipped') matchesStatus = currentStatus === 'Shipped';
      else if (filterStatus === 'delivered')
        matchesStatus = currentStatus === 'Delivered';
      else if (filterStatus === 'returns')
        matchesStatus = currentStatus === 'Returned' || o.refundStatus === 'Pending';

      // 3 Order Types: Normal, Self Pickup, Subscribed
      let matchesOrderType = true;
      const isSub = Boolean(o.isScheduledSubscription || o.isSubscription);
      const isPickup = Boolean(o.fulfillment?.type === 'pickup' || o.deliveryType === 'pickup' || (o as any).isSelfPickup);

      if (orderTypeFilter === 'normal') matchesOrderType = !isSub && !isPickup;
      else if (orderTypeFilter === 'pickup') matchesOrderType = isPickup && !isSub;
      else if (orderTypeFilter === 'subscribed') matchesOrderType = isSub;

      return matchesSearch && matchesStatus && matchesOrderType;
    });
  }, [allCombinedOrders, searchQuery, filterStatus, orderTypeFilter]);

  const getSubMetrics = (sub: any) => {
    if (!sub || !sub.startDate) {
      return { totalDays: 0, skippedDays: 0, deliveredDays: 0, totalSpend: 0, totalSkippedSavings: 0 };
    }
    const start = new Date(sub.startDate);
    const today = new Date();
    const diffTime = Math.max(0, today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const skippedDays = Array.isArray(sub.skippedDates) ? sub.skippedDates.length : 0;
    const deliveredDays = Math.max(0, diffDays - skippedDays);
    const totalSpend = deliveredDays * (sub.quantity || 1) * (sub.unitPrice || 0);
    const totalSkippedSavings = skippedDays * (sub.quantity || 1) * (sub.unitPrice || 0);

    return {
      totalDays: diffDays,
      skippedDays,
      deliveredDays,
      totalSpend,
      totalSkippedSavings
    };
  };

  const handleAssignSubmit = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!selectedAgentId) return;

    await runAction(`assign-${orderId}`, async () => {
      if (selectedOrder?.isScheduledSubscription || selectedOrder?.isSubscription) {
        await assignSubscriptionDelivery(orderId, selectedAgentId, selectedAgentType);
      } else {
        await assignDelivery(orderId, selectedAgentId, selectedAgentType);
      }
      setSelectedAgentId('');
      refreshSelectedOrder(orderId);
    });
  };

  const handleAssignSubSubmit = async (e: React.FormEvent, subId: string) => {
    e.preventDefault();
    if (!subAgentId) return;
    await runAction(`assign-sub-${subId}`, async () => {
      const ok = await assignSubscriptionDelivery(subId, subAgentId, subAgentType);
      if (ok) {
        setSubAgentId('');
        setSelectedSubscription(null);
      }
    });
  };

  const selectedStatus = selectedOrder
    ? normalizeStatus(selectedOrder.deliveryStatus)
    : '';

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">
            Order & Subscriber Hub
          </h1>
          <p className="text-xs text-blue-300">
            Fulfill hyperlocal orders, manage subscriber schedules, assign delivery agents, and process return requests.
          </p>
        </div>
      </div>

      {mainView !== 'localshop' ? (
        <>
          {/* 3 Order Types Bar: Normal Delivery, Self Pickup, Subscribed */}
          <div className="flex items-center gap-2 p-2 bg-slate-900/90 rounded-2xl shadow-xl w-fit flex-wrap">
            {[
              { id: 'all', label: '🌐 All Types' },
              { id: 'normal', label: '🚚 Normal Delivery' },
              { id: 'pickup', label: '🏪 In-Store Self Pickup' },
              { id: 'subscribed', label: '🔁 Subscribed Orders' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setOrderTypeFilter(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${orderTypeFilter === t.id
                  ? 'bg-amber-400 text-blue-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-slate-900/90 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80 flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-blue-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by Order ID or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 text-white border-none rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none shadow-inner"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <SlidersHorizontal className="h-4 w-4 text-blue-300 mr-1 hidden md:block" />
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'new', label: 'New' },
                { id: 'processing', label: 'Processing' },
                { id: 'packed', label: 'Packed' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'returns', label: 'Return Requests' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${filterStatus === tab.id
                    ? 'bg-amber-400 text-blue-950 shadow-md font-black'
                    : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowReturnLedgerModal(true)}
                className="text-xs font-black border-none bg-amber-400 text-blue-950 hover:bg-amber-500 rounded-xl h-9 flex items-center cursor-pointer shadow-md"
              >
                🔄 Returns Ledger
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Fulfillment Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Ordered Products</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    No orders found matching the filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((o) => {
                  const status = normalizeStatus(o.deliveryStatus);

                  return (
                    <TableRow key={o.id} className="align-middle">
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {o.id}
                      </TableCell>

                      <TableCell>
                        {Boolean(o.isScheduledSubscription || o.isSubscription) ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 font-black text-[10px] border border-purple-500/30">🔁 Subscribed</span>
                        ) : Boolean(o.fulfillment?.type === 'pickup' || o.deliveryType === 'pickup' || (o as any).isSelfPickup) ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-black text-[10px] border border-amber-500/30">🏪 Self Pickup</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 font-black text-[10px] border border-blue-500/30">🚚 Normal Delivery</span>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        <div className="font-bold text-foreground">{o.customerName}</div>
                        <div className="text-[10px] opacity-75">
                          {new Date(o.orderDate).toLocaleDateString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-xs text-foreground max-w-xs truncate">
                          {o.items.map((item) => (
                            <span key={item.sku} className="font-semibold">
                              {item.productName} ({item.quantity}x)
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        <div className="font-bold text-foreground">
                          ₹{o.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                          Payout: ₹{getOrderPayout(o).payout.toLocaleString('en-IN')}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            o.paymentStatus === 'Paid'
                              ? 'success'
                              : o.paymentStatus === 'Refunded'
                                ? 'destructive'
                                : 'warning'
                          }
                          className="py-0"
                        >
                          {o.paymentStatus}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground block mt-1 font-semibold">
                          Mode: {o.paymentMethod || 'UPI / Online'}
                        </span>
                      </TableCell>

                      <TableCell>{getDeliveryStatusBadge(status, o)}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5 items-center">
                          {status === 'New' && (
                            <Button
                              onClick={() => {
                                setPrepModalOrder(o);
                                setSelectedPrepTime(20);
                              }}
                              disabled={actionLoading === `accept-${o.id}`}
                              variant="primary"
                              size="sm"
                              className="text-xs h-8 cursor-pointer bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold"
                            >
                              {actionLoading === `accept-${o.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                '⏱️ Accept & Set Time'
                              )}
                            </Button>
                          )}

                          {status === 'Processing' && (
                            <Button
                              onClick={() => runAction(`pack-${o.id}`, () => packOrder(o.id))}
                              disabled={actionLoading === `pack-${o.id}`}
                              variant="primary"
                              size="sm"
                              className="text-xs h-8 cursor-pointer"
                            >
                              {actionLoading === `pack-${o.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                'Pack Order'
                              )}
                            </Button>
                          )}

                          <Button
                            type="button"
                            onClick={() => {
                              setQrOrder(o);
                              setShowQrModal(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs cursor-pointer flex items-center gap-1 border-border font-bold bg-secondary"
                            title="Print QR Packing code tag label"
                          >
                            🏷️ QR Tag
                          </Button>

                          <Button
                            onClick={() => setSelectedOrder(o)}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs cursor-pointer border-border font-bold bg-secondary"
                          >
                            <Eye className="h-3.5 w-3.5" /> Inspect
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {selectedOrder && (
            <Drawer
              isOpen={!!selectedOrder}
              onClose={() => setSelectedOrder(null)}
              title={`Order Details: ${selectedOrder.id}`}
              size="lg"
            >
              <div className="flex flex-col gap-5 text-left pb-10 text-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-950/80 p-4.5 flex flex-col gap-2 text-xs shadow-xl">
                    <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-heading">
                      <Smile className="h-4 w-4" /> Customer Contact
                    </span>
                    <span className="font-extrabold text-base text-white">
                      {selectedOrder.customerName}
                    </span>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-blue-200 flex items-center gap-1 font-mono">
                        <Phone className="h-3.5 w-3.5 text-blue-400" /> {selectedOrder.customerPhone}
                      </span>
                      <a
                        href={`https://wa.me/91${selectedOrder.customerPhone}?text=Hello%20${selectedOrder.customerName},%20this%20is%20regarding%20your%20ApexBee%20order%20%23${selectedOrder.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-3 py-1 rounded-xl font-black flex items-center gap-1 text-[11px] transition-all"
                      >
                        💬 WhatsApp Chat
                      </a>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 p-4.5 flex flex-col gap-2 text-xs shadow-xl">
                    <span className="font-extrabold text-blue-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-heading">
                      <MapPin className="h-4 w-4" /> Delivery Address
                    </span>
                    <p className="text-blue-200 leading-relaxed text-xs">
                      {selectedOrder.deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* 📝 Customer Selected Delivery Preferences & Driver Instructions */}
                {selectedOrder.fulfillment?.type !== 'pickup' && (
                  <div className="rounded-2xl bg-slate-950/80 p-4.5 flex flex-col gap-3 text-xs shadow-xl border border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-heading">
                        <span>📝</span> Customer Delivery Preferences & Driver Instructions
                      </span>
                      <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase">
                        {selectedOrder.fulfillment?.deliveryMode === 'express' || (selectedOrder as any).deliveryMode === 'express'
                          ? '🚀 Express 15-30 Min'
                          : selectedOrder.fulfillment?.deliveryMode === 'same_day' || (selectedOrder as any).deliveryMode === 'same_day'
                            ? '🌆 Same Day Slot'
                            : '🚚 Standard Delivery'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-blue-200">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="font-extrabold text-white block text-[11px] mb-1">⚡ Selected Delivery Speed</span>
                        <span className="font-bold text-amber-300">
                          {selectedOrder.fulfillment?.deliveryMode === 'express' || (selectedOrder as any).deliveryMode === 'express'
                            ? '🚀 Express 15-30 Mins (+₹49)'
                            : selectedOrder.fulfillment?.deliveryMode === 'same_day' || (selectedOrder as any).deliveryMode === 'same_day'
                              ? '🌆 Same Day Slot (+₹19)'
                              : '🚚 Standard Local Delivery (Free)'}
                        </span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="font-extrabold text-white block text-[11px] mb-1">🔔 Driver Drop-off Preference</span>
                        <span className="font-bold text-emerald-300">
                          {selectedOrder.fulfillment?.deliveryInstruction === 'call_before' || (selectedOrder as any).deliveryInstruction === 'call_before'
                            ? '📞 Call me before delivery'
                            : selectedOrder.fulfillment?.deliveryInstruction === 'ring_bell' || (selectedOrder as any).deliveryInstruction === 'ring_bell'
                              ? '🔔 Ring doorbell'
                              : selectedOrder.fulfillment?.deliveryInstruction === 'leave_gate' || (selectedOrder as any).deliveryInstruction === 'leave_gate'
                                ? '🚪 Leave at gate / door'
                                : selectedOrder.fulfillment?.deliveryInstruction === 'contactless' || (selectedOrder as any).deliveryInstruction === 'contactless'
                                  ? '🛡️ Contactless drop-off'
                                  : '📞 Call me before delivery'}
                        </span>
                      </div>
                    </div>

                    {(selectedOrder.fulfillment?.customInstruction || (selectedOrder as any).customInstruction || (selectedOrder as any).deliveryInstructions) && (
                      <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/40 text-amber-200">
                        <span className="font-extrabold text-amber-400 block text-[11px] mb-0.5">💬 Special Driver Note from Customer:</span>
                        <p className="font-medium text-xs italic">
                          "{selectedOrder.fulfillment?.customInstruction || (selectedOrder as any).customInstruction || (selectedOrder as any).deliveryInstructions}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {(selectedOrder.fulfillment?.type === 'pickup' || selectedOrder.deliveryType === 'pickup' || (selectedOrder as any).isSelfPickup) && (
                  <div className="rounded-2xl bg-slate-950/80 p-4.5 flex flex-col gap-2.5 text-xs shadow-xl">
                    <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-heading">
                      <Store className="h-4 w-4" /> In-Store Self Pickup Order Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-blue-200">
                      <div>
                        <span className="font-extrabold text-white block">Pickup Store</span>
                        <span>{selectedOrder.fulfillment?.pickupLocationId || 'Main Store Hub'}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-white block">Pickup Time Slot</span>
                        <span>{selectedOrder.fulfillment?.pickupSlot?.date || 'Today'} • {selectedOrder.fulfillment?.pickupSlot?.time || '10:00 AM - 06:00 PM'}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-amber-400 block">STORE PICKUP OTP</span>
                        <span className="font-mono font-black text-sm text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-xl">
                          {selectedOrder.pickupVerification?.otp || '9823'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.isScheduledSubscription && selectedOrder.scheduleDetails && (
                  <div className="rounded-2xl bg-slate-950/80 p-4.5 flex flex-col gap-2.5 text-xs shadow-xl">
                    <span className="font-extrabold text-purple-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-heading">
                      <CalendarDays className="h-4 w-4" /> Subscription Plan Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-blue-200">
                      <div>
                        <span className="font-extrabold text-white block">Delivery Frequency</span>
                        <span className="capitalize">{selectedOrder.scheduleDetails.frequency || 'Daily'}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-white block">Duration Limit</span>
                        <span>{selectedOrder.scheduleDetails.durationMonths || '1'} Month(s)</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-white block">Start Date</span>
                        <span>{selectedOrder.scheduleDetails.startDate || 'Immediate'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Internal staff notes card */}
                <div className="rounded-2xl bg-slate-950/80 p-4.5 space-y-2.5 text-xs shadow-xl">
                  <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] font-heading block">✍️ Internal Fulfillment Staff Notes</span>
                  <textarea
                    value={orderNotes[selectedOrder.id] || tempNote}
                    onChange={(e) => {
                      setTempNote(e.target.value);
                      setOrderNotes(prev => ({ ...prev, [selectedOrder.id]: e.target.value }));
                    }}
                    placeholder="e.g. Wrap in cold pack, check mango freshness, leave at gate..."
                    className="w-full p-3 rounded-xl bg-slate-900 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none border-none shadow-inner"
                    rows={2}
                  />
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-blue-300">Notes are auto-saved locally.</span>
                    <button
                      type="button"
                      onClick={() => {
                        alert("Internal order note saved to registry!");
                      }}
                      className="text-amber-400 font-extrabold hover:underline cursor-pointer border-0 bg-transparent"
                    >
                      Save Note ➔
                    </button>
                  </div>
                </div>

                {/* Courier dispatch ETA card */}
                <div className="rounded-2xl bg-slate-950/80 p-4.5 space-y-2 text-xs shadow-xl">
                  <span className="font-extrabold text-blue-400 uppercase tracking-wider text-[11px] font-heading block">🚚 Hyperlocal Courier Dispatch ETA Log</span>
                  <div className="grid grid-cols-2 gap-3 text-left text-blue-200">
                    <div>Courier Assigned: <b className="text-white">{deliveryAgents.find(a => a.id === selectedOrder.deliveryAgentId)?.name || 'Awaiting Assign'}</b></div>
                    <div>Estimated Delivery ETA: <b className="text-white">{selectedOrder.deliveryStatus === 'Delivered' ? 'Delivered' : 'Within 45 Minutes'}</b></div>
                  </div>
                </div>

                {/* Secure OTP Verification confirmation input */}
                {selectedStatus !== 'New' && selectedStatus !== 'Delivered' && (
                  <div className="rounded-2xl bg-slate-950/80 p-4.5 space-y-3 text-xs shadow-xl">
                    <span className="font-extrabold text-indigo-400 uppercase tracking-wider text-[11px] font-heading block">🔐 Dispatch/Delivery Secure OTP verification</span>
                    <p className="text-xs text-blue-300">Enter 4-digit OTP provided by customer or driver to execute state transfer check.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="XXXX"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-24 border-none rounded-xl p-2.5 bg-slate-900 text-white text-center font-mono font-black text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (otpValue === '1234' || otpValue.length === 4) {
                            setValidatedOrders(prev => [...prev, selectedOrder.id]);
                            alert("OTP verified! Security handshake completed.");
                            setOtpValue('');
                          } else {
                            alert("Invalid verification code. Try again.");
                          }
                        }}
                        className="px-4 bg-amber-400 text-blue-950 font-black rounded-xl border-0 cursor-pointer text-xs shadow-md"
                      >
                        Verify OTP Handshake
                      </button>
                    </div>
                    {validatedOrders.includes(selectedOrder.id) && (
                      <span className="text-xs text-emerald-400 font-black block">✓ Verified OTP Handoff Handshake Complete</span>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider font-heading flex items-center justify-between">
                    <span>📦 Ordered Products List ({selectedOrder.items.length} items)</span>
                    <span className="text-[10px] text-amber-400 font-bold lowercase">packing checklist</span>
                  </span>

                  <div className="rounded-2xl bg-slate-950/90 overflow-hidden divide-y divide-slate-800/80 border border-slate-800 shadow-2xl">
                    {selectedOrder.items.map((item) => {
                      // Extract all variant attributes (with SKU suffix & title fallback parsing)
                      const attrObj = item.variantAttributes || (item as any).selectedAttributes || (item as any).attributes;
                      const attrsList: string[] = [];
                      if (attrObj && typeof attrObj === 'object') {
                        Object.entries(attrObj).forEach(([k, v]) => {
                          if (v && v !== 'default' && k !== 'default') {
                            attrsList.push(`${k}: ${v}`);
                          }
                        });
                      }
                      if (attrsList.length === 0) {
                        if ((item as any).color && (item as any).color !== 'default') attrsList.push(`Color: ${(item as any).color}`);
                        if ((item as any).size && (item as any).size !== 'default') attrsList.push(`Size: ${(item as any).size}`);
                        if ((item as any).selectedColor && (item as any).selectedColor !== 'default') attrsList.push(`Color: ${(item as any).selectedColor}`);
                        if ((item as any).selectedSize && (item as any).selectedSize !== 'default') attrsList.push(`Size: ${(item as any).selectedSize}`);
                      }
                      if (attrsList.length === 0 && (item as any).variantName) {
                        attrsList.push(`Variant: ${(item as any).variantName}`);
                      }
                      // Fallback: Parse SKU hyphenated variant e.g. PHO-IDOL-06384-2CM -> 2CM
                      if (attrsList.length === 0 && item.sku && typeof item.sku === 'string') {
                        const parts = item.sku.split('-');
                        if (parts.length > 1) {
                          const lastPart = parts[parts.length - 1].trim();
                          if (/^(\d+cm|\d+g|\d+kg|xl|l|m|s|2cm|3cm|4cm|5cm)$/i.test(lastPart) || lastPart.length <= 5) {
                            attrsList.push(`Variant / Size: ${lastPart.toUpperCase()}`);
                          }
                        }
                      }
                      // Fallback: Parse Title bracket e.g. "Idol (2cm)"
                      if (attrsList.length === 0 && (item.productName || (item as any).itemName)) {
                        const titleText = item.productName || (item as any).itemName;
                        const match = titleText.match(/\(([^)]+)\)/);
                        if (match && match[1]) {
                          attrsList.push(`Variant: ${match[1]}`);
                        }
                      }

                      const hasSub = (item as any).isSubscription || (item as any).subscriptionFrequency || selectedOrder.isScheduledSubscription;
                      const subFreq = (item as any).subscriptionFrequency || selectedOrder.scheduleDetails?.frequency || 'Daily';
                      const subSlot = (item as any).deliverySlot || selectedOrder.scheduleDetails?.deliverySlot || '6:00 AM - 8:00 AM';

                      return (
                        <div
                          key={item.sku || item.productId}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-900/40 hover:bg-slate-900/80 transition-all"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="flex items-center gap-2 shrink-0 pt-1">
                              <input
                                type="checkbox"
                                checked={checkedItems.includes(item.productId)}
                                onChange={() => handleToggleChecklist(item.productId)}
                                className="h-4 w-4 rounded border-none bg-slate-950 text-amber-400 focus:ring-amber-400 cursor-pointer"
                              />
                              <img
                                src={item.image || "/placeholder.png"}
                                alt={item.productName}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="%2364748b" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                                }}
                                className="h-12 w-12 rounded-xl object-cover border border-slate-700 flex-shrink-0 shadow-md bg-slate-950"
                              />
                            </div>

                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                              <span className="font-extrabold text-white text-xs leading-snug">
                                {item.productName}
                              </span>

                              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                <span className="text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                  SKU: {item.sku || 'N/A'}
                                </span>

                                {(item as any).brand && (
                                  <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                    {(item as any).brand}
                                  </span>
                                )}
                              </div>

                              {/* Selected Variant Badges */}
                              {attrsList.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Selected Variant:</span>
                                  {attrsList.map((attr, idx) => (
                                    <span key={idx} className="text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md shadow-xs">
                                      {attr}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Subscription badge on item */}
                              {hasSub && (
                                <div className="mt-1 flex items-center gap-1.5 bg-purple-950/80 border border-purple-800/80 rounded-lg p-1.5 text-[10px]">
                                  <span className="text-purple-300 font-bold">🔄 Recurring Subscription:</span>
                                  <span className="text-amber-400 font-black uppercase">{subFreq}</span>
                                  <span className="text-purple-200">({subSlot})</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right flex sm:flex-col items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                            <span className="font-black text-white text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            <span className="text-slate-400 text-[11px] font-medium">
                              ₹{item.price} × {item.quantity} units
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-semibold">₹{selectedOrder.subtotal}</span>
                  </div>

                  {/* GST Tax Breakdown */}
                  {(() => {
                    const gstPct = (selectedOrder as any).gstPercent || (selectedOrder as any).gstRate || (selectedOrder as any).taxPercent || 5;
                    const gstVal = (selectedOrder as any).gstAmount || Math.round(selectedOrder.subtotal * (gstPct / 100));
                    return (
                      <div className="flex justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span>🧾 GST ({gstPct}% Tax Included)</span>
                        </span>
                        <span className="font-mono text-amber-400 text-[11px]">₹{gstVal}</span>
                      </div>
                    );
                  })()}

                  {selectedOrder.shippingCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping / Delivery Charge</span>
                      <span className="text-foreground">₹{selectedOrder.shippingCharge}</span>
                    </div>
                  )}

                  {selectedOrder.packingCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Packing Charge</span>
                      <span className="text-foreground">₹{selectedOrder.packingCharge}</span>
                    </div>
                  )}

                  {/* Applied Coupon / Discount Breakdown - ONLY IF ACTUALLY APPLIED */}
                  {(((selectedOrder as any).couponCode || (selectedOrder as any).coupon) && ((selectedOrder as any).couponDiscount > 0 || selectedOrder.discount > 0)) && (
                    <div className="flex justify-between items-center text-emerald-400 font-extrabold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 my-1">
                      <span className="flex items-center gap-1.5">
                        <span>🎟️ Coupon Applied:</span>
                        <span className="font-mono bg-emerald-950 px-2 py-0.5 rounded text-amber-400 border border-emerald-800 text-[11px]">
                          {(selectedOrder as any).couponCode || (selectedOrder as any).coupon}
                        </span>
                      </span>
                      <span className="text-emerald-300 font-mono font-black text-sm">
                        -₹{(selectedOrder as any).couponDiscount || selectedOrder.discount}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between font-extrabold text-sm border-t border-border/30 pt-2 text-foreground">
                    <span>Total Customer Price</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>

                  {(() => {
                    const { payout, commission, avgRate, isApexBeeCommissionModel } = getOrderPayout(selectedOrder);

                    return (
                      <div className="mt-2 bg-secondary/30 border border-border/60 rounded-xl p-3 flex flex-col gap-1.5 text-left">
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                          Settlement &amp; Earnings Sheet
                        </span>

                        {isApexBeeCommissionModel ? (
                          <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                            <span>ApexBee Commission ({avgRate}%)</span>
                            <span className="text-destructive font-semibold">
                              -₹{commission}
                            </span>
                          </div>
                        ) : null}

                        <div className="flex justify-between items-center text-xs font-black text-indigo-600 dark:text-indigo-400 border-t border-border/30 pt-1.5 mt-0.5">
                          <span>Net Vendor Earnings</span>
                          <span>₹{payout}</span>
                        </div>

                        <div className="flex gap-2 mt-2 pt-2 border-t border-border/30">
                          <Button
                            onClick={() => handleDownloadInvoice(selectedOrder.id, selectedOrder.id)}
                            disabled={downloadingPdf !== null}
                            variant="outline"
                            className="flex-1 text-[10px] font-bold h-7.5 border-border hover:bg-secondary cursor-pointer"
                          >
                            {downloadingPdf === 'invoice' ? 'Generating...' : '🖨️ Tax Invoice PDF'}
                          </Button>
                          <Button
                            onClick={() => handleDownloadPackingSlip(selectedOrder.id, selectedOrder.id)}
                            disabled={downloadingPdf !== null}
                            variant="outline"
                            className="flex-1 text-[10px] font-bold h-7.5 border-border hover:bg-secondary cursor-pointer"
                          >
                            {downloadingPdf === 'slip' ? 'Generating...' : '📋 Packing Slip PDF'}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {selectedStatus === 'New' && (
                  <div className="border border-border/80 bg-muted/20 p-4 rounded-xl">
                    <Button
                      onClick={() =>
                        runAction(
                          `drawer-accept-${selectedOrder.id}`,
                          () => acceptOrder(selectedOrder.id),
                          true
                        )
                      }
                      disabled={actionLoading === `drawer-accept-${selectedOrder.id}`}
                      className="w-full cursor-pointer"
                    >
                      {actionLoading === `drawer-accept-${selectedOrder.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Confirm Order'
                      )}
                    </Button>
                  </div>
                )}

                {selectedStatus === 'Processing' && (
                  <div className="border border-border/80 bg-muted/20 p-4 rounded-xl">
                    <Button
                      onClick={() =>
                        runAction(
                          `drawer-pack-${selectedOrder.id}`,
                          () => packOrder(selectedOrder.id),
                          true
                        )
                      }
                      disabled={actionLoading === `drawer-pack-${selectedOrder.id}`}
                      className="w-full cursor-pointer"
                    >
                      {actionLoading === `drawer-pack-${selectedOrder.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Pack Order'
                      )}
                    </Button>
                  </div>
                )}

                {selectedStatus !== 'Delivered' && selectedStatus !== 'Returned' && (
                  <form
                    onSubmit={(e) => handleAssignSubmit(e, selectedOrder.id)}
                    className="border border-border/80 bg-muted/20 p-4 rounded-xl flex flex-col gap-3"
                  >
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1 text-primary">
                      <Truck className="h-4.5 w-4.5" /> Assign Delivery Agent
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Select
                        label="Select Agent Type"
                        value={selectedAgentType}
                        onChange={(e) => setSelectedAgentType(e.target.value as AgentType)}
                        options={[
                          { value: 'Platform', label: 'Platform Delivery Agent' },
                          { value: 'Vendor', label: 'Vendor Delivery Agent' },
                          { value: 'Independent', label: 'Independent Delivery Partner' },
                        ]}
                      />

                      <Select
                        label="Available Executive"
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        options={[
                          { value: '', label: '-- Choose Agent --' },
                          ...(
                            (deliveryAgents.filter((a) => a.type === selectedAgentType).length > 0
                              ? deliveryAgents.filter((a) => a.type === selectedAgentType)
                              : deliveryAgents
                            ).map((a) => ({
                              value: a.id || (a as any)._id,
                              label: `${a.name} (${a.status || 'Active'}) - ${a.phone}`,
                            }))
                          ),
                        ]}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!selectedAgentId || actionLoading === `assign-${selectedOrder.id}`}
                      className="w-full mt-2 cursor-pointer"
                    >
                      {actionLoading === `assign-${selectedOrder.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Assign Agent & Handover Package'
                      )}
                    </Button>
                  </form>
                )}

                {selectedStatus === 'Shipped' && (
                  <div className="border border-border/80 bg-muted/20 p-4 rounded-xl flex flex-col gap-2">
                    <span className="text-xs font-bold text-foreground">
                      Delivery Confirmation
                    </span>

                    <Button
                      onClick={() =>
                        runAction(
                          `deliver-${selectedOrder.id}`,
                          () => deliverOrder(selectedOrder.id),
                          true
                        )
                      }
                      disabled={actionLoading === `deliver-${selectedOrder.id}`}
                      className="w-full cursor-pointer"
                    >
                      {actionLoading === `deliver-${selectedOrder.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Confirm Order Delivered'
                      )}
                    </Button>
                  </div>
                )}

                {selectedOrder.refundStatus === 'Pending' && (
                  <div className="border border-pink-500/20 bg-pink-500/5 p-4 rounded-xl flex flex-col gap-3">
                    <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                      <RefreshCw className="h-4.5 w-4.5" /> Active Return Request
                    </span>

                    <div className="flex flex-col gap-2 text-xs">
                      <div>
                        <span className="font-bold text-foreground">Reason for Return: </span>
                        <span className="text-muted-foreground">
                          {selectedOrder.returnReason || 'Not provided'}
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-foreground">Customer Notes: </span>
                        <p className="text-muted-foreground bg-background p-2 rounded border border-border/40 mt-1 leading-normal">
                          {selectedOrder.customerNotes || 'No notes added'}
                        </p>
                      </div>

                      {selectedOrder.returnPhotos && selectedOrder.returnPhotos.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground">
                            Product Photo Uploads:
                          </span>
                          <div className="flex gap-2 mt-1">
                            <img
                              src={selectedOrder.returnPhotos[0]}
                              alt="returned product"
                              className="h-14 w-14 rounded object-cover border border-border bg-muted"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        onClick={() =>
                          runAction(
                            `approve-return-${selectedOrder.id}`,
                            () => approveReturn(selectedOrder.id),
                            true
                          )
                        }
                        disabled={actionLoading === `approve-return-${selectedOrder.id}`}
                        variant="primary"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
                      >
                        Approve Return & Refund
                      </Button>

                      <Button
                        onClick={() =>
                          runAction(
                            `reject-return-${selectedOrder.id}`,
                            () => rejectReturn(selectedOrder.id),
                            true
                          )
                        }
                        disabled={actionLoading === `reject-return-${selectedOrder.id}`}
                        variant="outline"
                        className="border-red-500/30 text-red-600 hover:bg-red-500/10 cursor-pointer"
                      >
                        Reject Return Request
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
                  <span className="text-xs font-bold text-foreground">
                    Visual Order Timeline
                  </span>

                  <div className="flex flex-col gap-4 pl-3 mt-2">
                    {(selectedOrder.timeline || []).map((step, idx) => (
                      <div key={idx} className="flex gap-3 text-left text-xs">
                        <div className="flex flex-col items-center">
                          <div className="h-4.5 w-4.5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold border border-primary text-[10px]">
                            {idx + 1}
                          </div>

                          {idx !== selectedOrder.timeline.length - 1 && (
                            <div className="w-0.5 bg-border/60 flex-1 min-h-[20px] my-1" />
                          )}
                        </div>

                        <div className="flex-1 flex flex-col gap-0.5 pb-1">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="font-bold text-foreground uppercase tracking-wide text-[10px]">
                              {step.status}
                            </span>
                            <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                              {new Date(step.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-[11px] text-muted-foreground leading-normal">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}

                    {(!selectedOrder.timeline || selectedOrder.timeline.length === 0) && (
                      <p className="text-xs text-muted-foreground">No timeline found.</p>
                    )}
                  </div>
                </div>
              </div>
            </Drawer>
          )}
        </>
      ) : (
        <Card className="glass">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscriber ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Delivery Slot</TableHead>
                  <TableHead>Auto-Renew</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs">
                      No active product subscriptions found for your storefront.
                    </TableCell>
                  </TableRow>
                ) : (
                  vendorSubscriptions.map((sub: any) => (
                    <TableRow key={sub._id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {sub.userId}
                      </TableCell>
                      <TableCell className="text-xs text-left">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-border">
                            {sub.productImage ? (
                              <img src={sub.productImage} alt={sub.productName} className="h-full w-full object-cover" />
                            ) : (
                              <Store className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{sub.productName}</div>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">ID: {sub.productId}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground">
                        {sub.quantity} units (₹{sub.unitPrice}/u)
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground capitalize">
                        {sub.frequency === 'custom' ? (
                          <div className="flex flex-col gap-0.5">
                            <span>Custom Days</span>
                            <span className="text-[10px] text-muted-foreground normal-case font-normal">{(sub.customDays || []).join(', ')}</span>
                          </div>
                        ) : sub.frequency}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-semibold">
                        {sub.deliverySlot}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={sub.autoRenew ? 'success' : 'secondary'}>
                          {sub.autoRenew ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {sub.startDate}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={sub.status === 'active' ? 'success' : 'warning'} className="capitalize">
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => setSelectedSubscription(sub)}
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedSubscription && (
        <Drawer
          isOpen={!!selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          title={`Subscription Details: ${selectedSubscription._id}`}
          size="lg"
        >
          <div className="flex flex-col gap-6 text-left pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border p-3.5 rounded-xl bg-muted/20 flex flex-col gap-1.5 text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] flex items-center gap-1 text-primary">
                  <Smile className="h-4 w-4" /> Customer / Subscriber ID
                </span>
                <span className="font-mono font-bold text-sm text-foreground">
                  {selectedSubscription.userId}
                </span>
              </div>

              <div className="border border-border p-3.5 rounded-xl bg-muted/20 flex flex-col gap-1.5 text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] flex items-center gap-1 text-primary">
                  <CalendarDays className="h-4 w-4" /> Schedule Plan
                </span>
                <span className="font-bold text-sm text-foreground capitalize">
                  {selectedSubscription.frequency}
                </span>
                {selectedSubscription.frequency === 'custom' && (
                  <span className="text-muted-foreground text-[10px] block mt-0.5">
                    Days: {(selectedSubscription.customDays || []).join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* Subscription Delivery Report Card */}
            {(() => {
              const metrics = getSubMetrics(selectedSubscription);
              return (
                <div className="border border-border/80 bg-muted/10 p-4 rounded-xl flex flex-col gap-3 text-xs">
                  <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-primary block">
                    Subscription Delivery Report Card
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-background border border-border/40 p-3 rounded-lg text-center">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold block mb-0.5">Total Days Active</span>
                      <span className="text-sm font-extrabold text-foreground">{metrics.totalDays} Days</span>
                    </div>
                    <div className="bg-background border border-border/40 p-3 rounded-lg text-center">
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block mb-0.5">Delivered Runs</span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.deliveredDays} Days</span>
                    </div>
                    <div className="bg-background border border-border/40 p-3 rounded-lg text-center">
                      <span className="text-[9px] text-rose-500 uppercase font-bold block mb-0.5">Skipped Days</span>
                      <span className="text-sm font-extrabold text-rose-500">{metrics.skippedDays} Days</span>
                    </div>
                    <div className="bg-background border border-border/40 p-3 rounded-lg text-center">
                      <span className="text-[9px] text-indigo-500 uppercase font-bold block mb-0.5">Total Revenue</span>
                      <span className="text-sm font-extrabold text-indigo-500">₹{metrics.totalSpend}</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground bg-muted/20 p-2.5 rounded border border-dashed border-border/60">
                    <span>Vendor Revenue Accrued: <strong className="text-foreground">₹{metrics.totalSpend}</strong></span>
                    <span>Customer Skip Adjustments: <strong className="text-rose-500">₹{metrics.totalSkippedSavings}</strong></span>
                  </div>
                </div>
              );
            })()}

            <div className="border border-border/80 bg-muted/5 p-4 rounded-xl flex flex-col gap-2 text-xs">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-primary">
                <Store className="h-4.5 w-4.5" /> Subscribed Product
              </span>
              <div className="flex items-center gap-3 mt-1">
                <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-border">
                  {selectedSubscription.productImage ? (
                    <img src={selectedSubscription.productImage} alt={selectedSubscription.productName} className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-sm">{selectedSubscription.productName}</span>
                  <span className="text-[10px] text-muted-foreground">Product ID: {selectedSubscription.productId}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left">
              <div className="border border-border p-3.5 rounded-xl bg-muted/10">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-0.5">Quantity</span>
                <span className="text-sm font-extrabold text-foreground">{selectedSubscription.quantity} units</span>
              </div>
              <div className="border border-border p-3.5 rounded-xl bg-muted/10">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-0.5">Unit Price</span>
                <span className="text-sm font-extrabold text-foreground">₹{selectedSubscription.unitPrice}</span>
              </div>
              <div className="border border-border p-3.5 rounded-xl bg-muted/10">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-0.5">Delivery Slot</span>
                <span className="text-sm font-extrabold text-foreground">{selectedSubscription.deliverySlot}</span>
              </div>
            </div>

            <div className="border border-border/80 bg-muted/20 p-4 rounded-xl flex flex-col gap-2.5 text-xs">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block text-primary">
                Status & Configurations
              </span>
              <div className="flex justify-between items-center py-1 border-b border-border/30">
                <span className="text-muted-foreground font-semibold">Subscription Status</span>
                <Badge variant={selectedSubscription.status === 'active' ? 'success' : 'warning'} className="capitalize">
                  {selectedSubscription.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/30">
                <span className="text-muted-foreground font-semibold">Auto-Renewal</span>
                <Badge variant={selectedSubscription.autoRenew ? 'success' : 'secondary'}>
                  {selectedSubscription.autoRenew ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground font-semibold">Start Date</span>
                <span className="font-bold text-foreground">{selectedSubscription.startDate}</span>
              </div>
            </div>

            <div className="border border-border/80 bg-muted/20 p-4 rounded-xl flex flex-col gap-2.5 text-xs">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block text-primary">
                Delivery Agent Assignment
              </span>
              {selectedSubscription.deliveryAgentId ? (
                <div className="flex justify-between items-center py-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-foreground font-bold">{selectedSubscription.deliveryAgentName || 'Assigned Agent'}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{selectedSubscription.deliveryAgentType} Partner</span>
                  </div>
                  <Badge variant="success">Assigned</Badge>
                </div>
              ) : (
                <span className="text-muted-foreground italic text-xs py-1">No delivery partner assigned yet.</span>
              )}
            </div>

            {/* Form to Assign/Update Agent */}
            <form
              onSubmit={(e) => handleAssignSubSubmit(e, selectedSubscription._id)}
              className="border border-border/80 bg-muted/20 p-4 rounded-xl flex flex-col gap-3"
            >
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1 text-primary">
                <Truck className="h-4.5 w-4.5" /> Assign/Update Subscription Agent
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  label="Select Agent Type"
                  value={subAgentType}
                  onChange={(e) => setSubAgentType(e.target.value as AgentType)}
                  options={[
                    { value: 'Platform', label: 'Platform Delivery Agent' },
                    { value: 'Vendor', label: 'Vendor Delivery Agent' },
                    { value: 'Independent', label: 'Independent Delivery Partner' },
                  ]}
                />

                <Select
                  label="Available Executive"
                  value={subAgentId}
                  onChange={(e) => setSubAgentId(e.target.value)}
                  options={[
                    { value: '', label: '-- Choose Agent --' },
                    ...deliveryAgents
                      .filter((a) => a.type === subAgentType)
                      .map((a) => ({
                        value: a.id,
                        label: `${a.name} (${a.status})`,
                      })),
                  ]}
                />
              </div>

              <Button
                type="submit"
                disabled={!subAgentId || actionLoading === `assign-sub-${selectedSubscription._id}`}
                className="w-full mt-2 cursor-pointer"
              >
                {actionLoading === `assign-sub-${selectedSubscription._id}` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Assign Agent to Schedule'
                )}
              </Button>
            </form>

            {selectedSubscription.skippedDates?.length > 0 && (
              <div className="border border-border/80 bg-muted/20 p-4 rounded-xl flex flex-col gap-2 text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-destructive block">
                  Skipped Dates History
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedSubscription.skippedDates.map((dateStr: string) => (
                    <span key={dateStr} className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-bold">
                      {dateStr}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Drawer>
      )}
      {showQrModal && qrOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-5 space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1">
                🏷️ Order packing QR tag labels
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  setQrOrder(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer border-0 bg-transparent"
              >
                Close
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Print RFID-ready packaging scan tags containing customer shipping routes and invoice references.</p>

            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-border/60">
              {/* Simulated QR Code using CSS grid */}
              <div className="w-36 h-36 bg-slate-900 flex flex-col items-center justify-center text-white text-[9px] font-black tracking-widest relative select-none">
                <span className="p-2 border border-dashed border-white/50 text-center font-mono">
                  APEXBEE<br />
                  {qrOrder.id}
                </span>
                <div className="absolute top-2 left-2 w-3 h-3 bg-white" />
                <div className="absolute top-2 right-2 w-3 h-3 bg-white" />
                <div className="absolute bottom-2 left-2 w-3 h-3 bg-white" />
              </div>
              <span className="text-[10px] text-slate-800 font-extrabold mt-3 font-mono">CODE: {qrOrder.id}-RFID-9830</span>
              <span className="text-[9px] text-slate-500 font-semibold mt-0.5">Route: Hyperlocal-Sector-E10</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  alert("Sent pack tag code print job to registered bluetooth printer!");
                  setShowQrModal(false);
                  setQrOrder(null);
                }}
                className="flex-1 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl border-0 cursor-pointer"
              >
                Print QR Tag Label
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Verification barcode tag test job success!");
                }}
                className="px-3 py-2 bg-secondary text-foreground text-xs font-bold rounded-xl border border-border cursor-pointer"
              >
                Test Code
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnLedgerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-5 space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                🔄 Customer Returns & Refund Ledger Audit
              </h3>
              <button
                type="button"
                onClick={() => setShowReturnLedgerModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer border-0 bg-transparent"
              >
                Close
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Detailed logs of customer return audits, refund payouts, and pickup status updates.</p>

            <div className="overflow-x-auto border border-border/60 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-secondary/40 border-b border-border/50 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Returned Product</th>
                    <th className="p-3">Refund Amount</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {returnsLedger.map((ret, idx) => (
                    <tr key={idx} className="hover:bg-secondary/10">
                      <td className="p-3 font-mono font-bold text-foreground">{ret.orderId}</td>
                      <td className="p-3 font-bold">{ret.customer}</td>
                      <td className="p-3 text-muted-foreground">{ret.item}</td>
                      <td className="p-3 font-extrabold text-rose-500">₹{ret.refundAmt}</td>
                      <td className="p-3 text-muted-foreground">{ret.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] ${ret.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}>
                          {ret.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ⏱️ PREP TIME SELECTION MODAL */}
      {prepModalOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-amber-400 font-heading flex items-center gap-2">
                <span>⏱️</span> Set Delivery & Prep Time
              </h3>
              <button
                type="button"
                onClick={() => setPrepModalOrder(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Confirm order <strong>#{prepModalOrder.id}</strong> ({prepModalOrder.customerName}). Select expected prep & delivery duration — live countdown clock will start immediately on Customer Home Screen!
              </p>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedPrepTime(mins)}
                    className={`py-3 px-2 rounded-2xl text-xs font-black border transition cursor-pointer flex flex-col items-center justify-center ${selectedPrepTime === mins
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg scale-105'
                      : 'bg-slate-800/90 text-white border-slate-700 hover:border-amber-400/50'
                      }`}
                  >
                    <span className="text-base font-black">{mins}</span>
                    <span className="text-[10px] font-bold">Mins</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <label className="text-xs font-bold text-slate-300 shrink-0">Custom Duration:</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={selectedPrepTime}
                  onChange={(e) => setSelectedPrepTime(Number(e.target.value) || 20)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                type="button"
                onClick={() => setPrepModalOrder(null)}
                variant="outline"
                className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const oId = prepModalOrder.id || (prepModalOrder as any)._id;
                  const mins = selectedPrepTime;
                  setPrepModalOrder(null);
                  runAction(`accept-${oId}`, () => acceptOrder(oId, mins));
                }}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-xl cursor-pointer"
              >
                Start {selectedPrepTime} Min Timer 🚀
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;