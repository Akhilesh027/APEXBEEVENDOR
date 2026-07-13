import React, { useMemo, useState } from 'react';
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>('Platform');
  const [subAgentType, setSubAgentType] = useState<AgentType>('Platform');
  const [subAgentId, setSubAgentId] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Packing Checklist and PDF Download states/methods
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

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
    let totalComm = 0;

    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const rate = prod ? prod.commissionRate : 10;
      totalComm += Math.round(item.price * item.quantity * (rate / 100));
    });

    const payout = Math.max(0, order.totalAmount - totalComm);
    const avgRate =
      order.subtotal > 0 ? Math.round((totalComm / order.subtotal) * 100) : 10;

    return { payout, commission: totalComm, avgRate };
  };

  const getDeliveryStatusBadge = (status: string) => {
    const current = normalizeStatus(status);

    switch (current) {
      case 'New':
        return <Badge variant="info">New Order</Badge>;
      case 'Processing':
        return <Badge variant="warning">Accepted / Processing</Badge>;
      case 'Packed':
        return <Badge variant="purple">Packed / Ready</Badge>;
      case 'Shipped':
        return <Badge variant="purple">Shipped / In Transit</Badge>;
      case 'Delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'Returned':
        return <Badge variant="destructive">Returned</Badge>;
      default:
        return <Badge variant="secondary">{current}</Badge>;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const currentStatus = normalizeStatus(o.deliveryStatus);
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query);

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

      // Filter by type: normal orders (isScheduledSubscription = false), or subscription orders (isScheduledSubscription = true)
      let matchesType = true;
      if (mainView === 'orders') {
        matchesType = !o.isScheduledSubscription;
      } else if (mainView === 'subscription') {
        matchesType = !!o.isScheduledSubscription;
      }

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [orders, searchQuery, filterStatus, mainView]);

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
      await assignDelivery(orderId, selectedAgentId, selectedAgentType);
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
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            Order & Subscriber Hub
          </h1>
          <p className="text-xs text-muted-foreground">
            Fulfill hyperlocal orders, manage subscriber schedules, assign delivery agents, and process return requests.
          </p>
        </div>
      </div>


      {mainView !== 'localshop' ? (
        <>
          <Card className="glass">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80 flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Order ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 text-foreground border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-end">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1 hidden md:block" />
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer duration-150 ${filterStatus === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
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
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                No orders found matching the filter.
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((o) => {
              const status = normalizeStatus(o.deliveryStatus);

              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-bold text-foreground">
                    {o.id}
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
                  </TableCell>

                  <TableCell>{getDeliveryStatusBadge(status)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {status === 'New' && (
                        <Button
                          onClick={() =>
                            runAction(`accept-${o.id}`, () => acceptOrder(o.id))
                          }
                          disabled={actionLoading === `accept-${o.id}`}
                          variant="primary"
                          size="sm"
                          className="text-xs h-8 cursor-pointer"
                        >
                          {actionLoading === `accept-${o.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            'Confirm Order'
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
                        onClick={() => setSelectedOrder(o)}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect Details
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
          <div className="flex flex-col gap-6 text-left pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border p-3.5 rounded-xl bg-muted/20 flex flex-col gap-1.5 text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] flex items-center gap-1 text-primary">
                  <Smile className="h-4 w-4" /> Customer Contact
                </span>
                <span className="font-bold text-sm text-foreground">
                  {selectedOrder.customerName}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {selectedOrder.customerPhone}
                  </span>
                  <a
                    href={`https://wa.me/91${selectedOrder.customerPhone}?text=Hello%20${selectedOrder.customerName},%20this%20is%20regarding%20your%20ApexBee%20order%20%23${selectedOrder.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-extrabold flex items-center gap-1 text-[11px]"
                  >
                    💬 WhatsApp Chat
                  </a>
                </div>
              </div>

              <div className="border border-border p-3.5 rounded-xl bg-muted/20 flex flex-col gap-1.5 text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] flex items-center gap-1 text-primary">
                  <MapPin className="h-4 w-4" /> Shipping Address
                </span>
                <p className="text-muted-foreground leading-normal">
                  {selectedOrder.deliveryAddress}
                </p>
              </div>
            </div>

            {selectedOrder.isScheduledSubscription && selectedOrder.scheduleDetails && (
              <div className="border border-indigo-500/30 bg-indigo-500/5 p-4 rounded-xl flex flex-col gap-2 text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <CalendarDays className="h-4 w-4" /> Subscription Plan Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mt-1 text-muted-foreground">
                  <div>
                    <span className="font-bold text-foreground block">Delivery Frequency</span>
                    <span className="capitalize">{selectedOrder.scheduleDetails.frequency || 'Daily'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Duration Limit</span>
                    <span>{selectedOrder.scheduleDetails.durationMonths || '1'} Month(s)</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Start Date</span>
                    <span>{selectedOrder.scheduleDetails.startDate || 'Immediate'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-foreground">
                Items List ({selectedOrder.items.length})
              </span>

              <div className="border border-border/60 rounded-xl overflow-hidden divide-y divide-border/40">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.sku}
                    className="p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(item.productId)}
                          onChange={() => handleToggleChecklist(item.productId)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-9 w-9 rounded object-cover border border-border flex-shrink-0"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground line-clamp-1">
                          {item.productName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          SKU: {item.sku}
                        </span>
                        {item.variantAttributes && (
                          <span className="text-[9px] text-primary">
                            {Object.entries(item.variantAttributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col gap-0.5">
                      <span className="font-bold text-foreground">₹{item.price}</span>
                      <span className="text-muted-foreground text-[10px]">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border/40 pt-4 flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₹{selectedOrder.subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping / Delivery Charge</span>
                <span className="text-foreground">₹{selectedOrder.shippingCharge}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Packing Charge</span>
                <span className="text-foreground">₹{selectedOrder.packingCharge}</span>
              </div>

              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span>Discount</span>
                  <span>-₹{selectedOrder.discount}</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-sm border-t border-border/30 pt-2 text-foreground">
                <span>Total Customer Price</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>

              {(() => {
                const { payout, commission, avgRate } = getOrderPayout(selectedOrder);

                return (
                  <div className="mt-2 bg-secondary/30 border border-border/60 rounded-xl p-3 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                      Settlement & Earnings Sheet
                    </span>

                    <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                      <span>Platform Commission ({avgRate}%)</span>
                      <span className="text-destructive font-semibold">
                        -₹{commission}
                      </span>
                    </div>

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

            {selectedStatus === 'Packed' && (
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
                      ...deliveryAgents
                        .filter((a) => a.type === selectedAgentType)
                        .map((a) => ({
                          value: a.id,
                          label: `${a.name} (${a.status})`,
                        })),
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
    </div>
  );
};