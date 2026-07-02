import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Drawer } from '../components/ui/Drawer';
import { 
  RotateCcw, 
  Search, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { Order } from '../types';

export const ReturnsRefunds: React.FC = () => {
  const { orders, approveReturn, rejectReturn } = useVendor();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter return orders (orders that have a return request)
  const returnOrders = orders.filter(o => o.refundStatus && o.refundStatus !== 'None');

  const filteredReturns = returnOrders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.returnReason && o.returnReason.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesType = true;
    if (filterType === 'pending') matchesType = o.refundStatus === 'Pending';
    else if (filterType === 'approved') matchesType = o.refundStatus === 'Approved';
    else if (filterType === 'rejected') matchesType = o.refundStatus === 'Rejected';

    return matchesSearch && matchesType;
  });

  // Calculate return analytics
  const totalReturns = returnOrders.length;
  const pendingRefunds = returnOrders.filter(o => o.refundStatus === 'Pending').length;
  const approvedRefunds = returnOrders.filter(o => o.refundStatus === 'Approved').length;
  const returnRate = orders.length > 0 ? ((totalReturns / orders.length) * 100).toFixed(1) : '0.0';

  // Return reason statistics
  const reasonCounts: Record<string, number> = {};
  returnOrders.forEach(o => {
    const reason = o.returnReason || 'Unspecified';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });

  // If empty, add dummy counts for chart visual
  if (Object.keys(reasonCounts).length === 0) {
    reasonCounts['Wrong Size'] = 4;
    reasonCounts['Defective Item'] = 3;
    reasonCounts['Quality Not as Expected'] = 2;
    reasonCounts['Late Delivery'] = 1;
  }

  const chartColors = ['#f43f5e', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
  const reasonChartData = Object.entries(reasonCounts).map(([name, value], index) => ({
    name,
    value,
    color: chartColors[index % chartColors.length]
  }));

  const getRefundStatusBadge = (status?: string) => {
    switch (status) {
      case 'Pending': return <Badge variant="warning">Awaiting Action</Badge>;
      case 'Approved': return <Badge variant="success">Refund Approved</Badge>;
      case 'Rejected': return <Badge variant="destructive">Request Denied</Badge>;
      default: return <Badge variant="secondary">None</Badge>;
    }
  };

  const handleAction = (orderId: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      approveReturn(orderId);
    } else {
      rejectReturn(orderId);
    }
    
    // Update local drawer state reference
    const updated = orders.find(o => o.id === orderId);
    if (updated) setSelectedOrder(updated);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-pink-500 animate-spin-slow" /> Returns & Refunds Management
          </h1>
          <p className="text-xs text-muted-foreground">Monitor return rates, analyze return reasons, and resolve customer refund claims.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0 text-pink-500">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Return Claims</span>
              <span className="text-xl font-black text-foreground">{totalReturns}</span>
              <span className="text-[9px] text-muted-foreground">Received return requests</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Pending Claims</span>
              <span className="text-xl font-black text-foreground">{pendingRefunds}</span>
              <span className="text-[9px] text-amber-500 font-bold">Needs immediate resolution</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-500">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Settled Refunds</span>
              <span className="text-xl font-black text-foreground">{approvedRefunds}</span>
              <span className="text-[9px] text-emerald-500 font-bold">Refunded to customers</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0 text-sky-500">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Overall Return Rate</span>
              <span className="text-xl font-black text-foreground">{returnRate}%</span>
              <span className="text-[9px] text-muted-foreground">Target limit: &lt; 5.0%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Return Requests Table */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card className="glass">
            <CardHeader className="pb-3 text-left">
              <CardTitle className="text-base font-bold">Returns & Refunds Request Claims</CardTitle>
              <CardDescription>View, check validation photos, and resolve claims</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search & Tabs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-4">
                <div className="relative w-full sm:w-72 flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, customer or reason..."
                    className="w-full border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs bg-background text-foreground"
                  />
                </div>

                <div className="flex bg-muted/30 p-0.5 rounded-lg border border-border/40 w-full sm:w-auto">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-colors ${filterType === 'all' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('pending')}
                    className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-colors ${filterType === 'pending' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilterType('approved')}
                    className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-colors ${filterType === 'approved' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setFilterType('rejected')}
                    className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-colors ${filterType === 'rejected' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Claim ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items Count</TableHead>
                      <TableHead>Refund Amount</TableHead>
                      <TableHead>Return Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReturns.map((claim) => (
                      <TableRow key={claim.id} className="hover:bg-muted/10">
                        <TableCell className="font-bold text-xs">{claim.id}</TableCell>
                        <TableCell className="text-xs font-semibold">{claim.customerName}</TableCell>
                        <TableCell className="text-xs">{claim.items.length} Product(s)</TableCell>
                        <TableCell className="text-xs font-extrabold text-foreground">₹{claim.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-xs max-w-[150px] truncate text-muted-foreground font-medium">{claim.returnReason || "Unspecified"}</TableCell>
                        <TableCell>{getRefundStatusBadge(claim.refundStatus)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setSelectedOrder(claim)}
                            className="cursor-pointer h-7 text-[10px]"
                          >
                            Inspect Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredReturns.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground italic">
                          No return claims match your filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reason Distribution Charts */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="glass h-full">
            <CardHeader className="text-left">
              <CardTitle className="text-base font-bold">Return Reason Distribution</CardTitle>
              <CardDescription>Analyze key drivers of customer returns</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[280px]">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reasonChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {reasonChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="w-full flex flex-col gap-2 mt-4 px-2 text-left">
                {reasonChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate max-w-[180px]">{item.name}</span>
                    </div>
                    <span className="text-foreground font-black">{item.value} ({((item.value / totalReturns || 1) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Claim Inspection Drawer */}
      <Drawer isOpen={selectedOrder !== null} onClose={() => setSelectedOrder(null)} title={`Claim Details - ${selectedOrder?.id}`}>
        {selectedOrder && (
          <div className="flex flex-col gap-5 text-left p-1 h-full max-h-[85vh] overflow-y-auto no-scrollbar">
            {/* Customer & Info section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/60">
              <div className="flex flex-col gap-0.5 text-xs">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Customer Details</span>
                <span className="font-extrabold text-foreground">{selectedOrder.customerName}</span>
                <span className="text-muted-foreground">{selectedOrder.customerPhone}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-xs sm:text-right">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Claim Date / Payment</span>
                <span className="font-bold text-foreground">{selectedOrder.orderDate}</span>
                <span className="text-muted-foreground">{selectedOrder.paymentMethod} • ₹{selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Pipeline Step: Refund or Replacement */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-muted-foreground">Claims Validation Pipeline</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Step 1</span>
                  <span>Validation Check</span>
                </div>
                <div className={`p-2.5 rounded-lg font-bold flex flex-col items-center justify-center border ${selectedOrder.refundStatus === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}`}>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Step 2</span>
                  <span>Approval Review</span>
                </div>
                <div className={`p-2.5 rounded-lg font-bold flex flex-col items-center justify-center border ${selectedOrder.refundStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : selectedOrder.refundStatus === 'Rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Step 3</span>
                  <span>Payout Settlement</span>
                </div>
              </div>
            </div>

            {/* Refund Reason & Images */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-muted-foreground">Return Reason & Validation Files</span>
              <div className="p-3 border border-border/80 rounded-xl bg-card flex flex-col gap-2.5">
                <div className="flex gap-2 items-start text-xs font-semibold leading-relaxed">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-foreground block mb-0.5">Customer Claim Comment</span>
                    <span className="text-muted-foreground italic">"{selectedOrder.returnReason || "No comments provided. Customer selected return without detailed text description."}"</span>
                  </div>
                </div>

                {/* Validation Photos */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Submitted Photos:</span>
                  <div className="flex gap-2">
                    {selectedOrder.returnPhotos && selectedOrder.returnPhotos.length > 0 ? (
                      selectedOrder.returnPhotos.map((url, idx) => (
                        <div key={idx} className="h-16 w-16 rounded-lg overflow-hidden border border-border bg-secondary/20 flex-shrink-0 cursor-zoom-in">
                          <img src={url} alt={`Return Validation ${idx}`} className="h-full w-full object-cover" />
                        </div>
                      ))
                    ) : (
                      // Fake placeholder validation photos for demo if empty
                      <>
                        <div className="h-16 w-16 rounded-lg border border-border/40 bg-secondary/10 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-secondary/20">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[8px] mt-0.5">Damaged.jpg</span>
                        </div>
                        <div className="h-16 w-16 rounded-lg border border-border/40 bg-secondary/10 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-secondary/20">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[8px] mt-0.5">Label_Tag.jpg</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* List of items in return */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-muted-foreground">Claim Products</span>
              <div className="border border-border/60 rounded-xl overflow-hidden bg-card">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 text-xs ${index > 0 ? 'border-t border-border/40' : ''}`}>
                    <div className="h-10 w-10 rounded-md bg-secondary/20 border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                      ) : (
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                      <span className="font-bold text-foreground truncate">{item.productName}</span>
                      <span className="text-[10px] text-muted-foreground">SKU: {item.sku} • Qty: {item.quantity}</span>
                    </div>
                    <div className="text-right flex flex-col gap-0.5">
                      <span className="font-extrabold text-foreground">₹{item.price.toLocaleString()}</span>
                      <span className="text-[9px] text-emerald-500 font-bold">Total Refundable</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Actions */}
            {selectedOrder.refundStatus === 'Pending' ? (
              <div className="flex gap-3 mt-4">
                <Button 
                  onClick={() => handleAction(selectedOrder.id, 'reject')}
                  variant="destructive"
                  className="flex-1 cursor-pointer font-bold"
                >
                  Reject Claim Request
                </Button>
                <Button 
                  onClick={() => handleAction(selectedOrder.id, 'approve')}
                  className="flex-1 cursor-pointer font-bold"
                >
                  Approve Refund
                </Button>
              </div>
            ) : (
              <div className="mt-4 p-3 border border-border/40 bg-secondary/20 rounded-xl text-center text-xs font-semibold text-muted-foreground">
                This claim has been finalized as <span className="font-extrabold text-foreground">{selectedOrder.refundStatus}</span>.
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
