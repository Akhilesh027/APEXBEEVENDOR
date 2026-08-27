/**
 * EarningsCommissions Page Component
 * Handles vendor platform fees, commission breakdowns, settlements, and payout reports.
 */
import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Coins, BarChart3, Clock, CheckCircle, Download, FileSpreadsheet, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

export const EarningsCommissions: React.FC = () => {
  const { products, orders, withdrawals, profile, stats, currentPage } = useVendor();
  const [activeTab, setActiveTab] = useState<'breakdown' | 'products' | 'settlements' | 'upcoming' | 'reports'>(() => {
    if (currentPage === 'settlements' || currentPage === 'earnings-settlements') return 'settlements';
    if (currentPage === 'earnings-products') return 'products';
    if (currentPage === 'earnings-upcoming') return 'upcoming';
    if (currentPage === 'earnings-reports') return 'reports';
    return 'breakdown';
  });

  React.useEffect(() => {
    if (currentPage === 'settlements' || currentPage === 'earnings-settlements') setActiveTab('settlements');
    else if (currentPage === 'earnings-products') setActiveTab('products');
    else if (currentPage === 'earnings-upcoming') setActiveTab('upcoming');
    else if (currentPage === 'earnings-reports') setActiveTab('reports');
    else if (currentPage === 'earnings' || currentPage === 'earnings-breakdown') setActiveTab('breakdown');
  }, [currentPage]);
  
  const totalLifetimeEarnings = React.useMemo(() => {
    const fromOrders = orders
      .filter(o => o.deliveryStatus === 'Delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const fromWithdrawals = withdrawals
      .filter(w => w.status === 'Completed')
      .reduce((sum, w) => sum + (w.amount || 0), 0);
    return Math.max(fromOrders, fromWithdrawals, stats?.totalRevenue || 0);
  }, [orders, withdrawals, stats]);

  const avgPlatformFee = React.useMemo(() => {
    if (products.length === 0) return '0.0% (Platform Model)';
    const totalRates = products.reduce((acc, p) => {
      const r = Number(
        p.adminPricing?.distributedFrom === 'apexbee_commission'
          ? (p.adminPricing?.vendorCommissionPercent ?? p.vendorCommissionPercent ?? 0)
          : (p.adminPricing?.distributedFrom === 'both')
          ? ((p.adminPricing?.platformFeePercent ?? 25) + (p.adminPricing?.vendorCommissionPercent ?? 0))
          : (p.adminPricing?.distributedFrom === 'none')
          ? 0
          : (p.adminPricing?.platformFeePercent ?? p.platformCommissionPercent ?? p.platformFeePercent ?? p.commissionRate ?? 25)
      );
      return acc + r;
    }, 0);
    const avg = totalRates / products.length;
    return avg === 0 ? '0.0% (Platform Model)' : `${avg.toFixed(1)}%`;
  }, [products]);

  const monthlyData = React.useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      const name = monthNames[idx];
      const monthOrders = orders.filter(o => {
        const d = o.orderDate ? new Date(o.orderDate) : (o.createdAt ? new Date(o.createdAt) : null);
        return d && d.getMonth() === idx;
      });
      const gross = monthOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
      const commission = monthOrders.reduce((sum, o) => {
        const commAmt = (o as any).commissionAmount || (o as any).vendorCommissionAmount || 0;
        if (commAmt > 0) return sum + commAmt;
        const oItems = o.items || [];
        const itemComm = oItems.reduce((iSum: number, item: any) => {
          const prod = products.find(p => p.id === item.productId || (p as any)._id === item.productId);
          const r = prod?.commissionRate ?? 25;
          return iSum + Math.round((item.price || 0) * (item.quantity || 1) * (r / 100));
        }, 0);
        return sum + (itemComm > 0 ? itemComm : Math.round((o.totalAmount || 0) * 0.25));
      }, 0);
      result.push({ name, earnings: Math.max(0, gross - commission), commission });
    }
    return result;
  }, [orders, products]);

  // Helper: calculate live payout splits per product
  const getProductSplits = (p: any) => {
    const price = Number(p.price || 0);
    const rate = Number(
      p.adminPricing?.distributedFrom === 'apexbee_commission'
        ? (p.adminPricing?.vendorCommissionPercent ?? p.vendorCommissionPercent ?? 0)
        : (p.adminPricing?.distributedFrom === 'both')
        ? ((p.adminPricing?.platformFeePercent ?? 25) + (p.adminPricing?.vendorCommissionPercent ?? 0))
        : (p.adminPricing?.distributedFrom === 'none')
        ? 0
        : (p.adminPricing?.platformFeePercent ?? p.platformCommissionPercent ?? p.platformFeePercent ?? p.commissionRate ?? 25)
    );
    const shipping = Number(p.shippingCharges || 0);
    const packing = Number(p.packingCharges || 0);
    const commission = Math.round(price * (rate / 100));
    const vendorReceives = price - commission;
    return {
      price,
      commission,
      shipping,
      packing,
      vendorReceives,
      rate
    };
  };

  const handleExportCSV = () => {
    const headers = ["Product Name", "Category", "Selling Price (INR)", "Platform Comm (%)", "Comm Amount (INR)", "Net Payout (INR)", "Status"];
    const rows = products.map(p => {
      const splits = getProductSplits(p);
      return [
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${p.category || 'General'}"`,
        splits.price,
        `${splits.rate}%`,
        splits.commission,
        splits.vendorReceives,
        p.status
      ].join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Commission_Statement_${(profile.businessName || 'Vendor').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-slate-100 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">Earnings & Commissions</h1>
          <p className="text-xs text-blue-300">Monitor platform commissions, analyze itemized payout breakdowns, and track settlements.</p>
        </div>
      </div>
      {/* 0% Platform Model Active Banner */}
      {avgPlatformFee.includes('0.0%') && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-400 font-bold">
          <div className="flex items-center gap-2">
            <span className="text-base">🎉</span>
            <span>Platform Model Active: 0% Platform Commission — Vendors Receive 100% Net Sales Payouts!</span>
          </div>
          <Badge variant="success" className="px-2.5 py-0.5 text-[10px]">0% Commission</Badge>
        </div>
      )}

      {/* High-Contrast Colored Tabs Container */}
      <div className="p-2 bg-slate-900/90 rounded-2xl shadow-xl flex flex-wrap gap-2 text-left">
        {[
          { id: 'breakdown', label: 'Commission Breakdown', icon: <Coins className="h-4 w-4" /> },
          { id: 'products', label: 'Product Earnings', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'settlements', label: 'Settlement History', icon: <CheckCircle className="h-4 w-4" /> },
          { id: 'upcoming', label: 'Upcoming Settlements', icon: <Clock className="h-4 w-4 animate-pulse" /> },
          { id: 'reports', label: 'Commission Reports', icon: <FileSpreadsheet className="h-4 w-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-400 text-blue-950 shadow-md scale-[1.02]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Charts */}
      {activeTab !== 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-primary" /> Monthly Payout & Commission Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  <Area type="monotone" dataKey="earnings" name="Vendor Net Earnings (₹)" stroke="var(--primary)" strokeWidth={2.5} fill="url(#earningsGrad)" />
                  <Area type="monotone" dataKey="commission" name="Platform Commission (₹)" stroke="#f59e0b" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Total Lifetime Earnings</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalLifetimeEarnings.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-muted-foreground mt-1">Processed across {orders.length} orders settled successfully.</span>
              </CardContent>
            </Card>
            <Card className="bg-indigo-500/5 border-indigo-500/20">
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Average Commission Rate</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{avgPlatformFee}</span>
                <span className="text-[9px] text-muted-foreground mt-1">Live vendor commission rate across catalog listings.</span>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Contents */}
      <div className="flex flex-col gap-4">
        {activeTab === 'breakdown' && (
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Itemized Commission Matrix</CardTitle>
              <CardDescription>Live commission rate breakdown and payout splits per product listed.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Selling Price (₹)</TableHead>
                    <TableHead className="text-right">Platform / Vendor Comm. (%)</TableHead>
                    <TableHead className="text-right">Comm. Amount (₹)</TableHead>
                    <TableHead className="text-right">Logistics/Packing (₹)</TableHead>
                    <TableHead className="text-right font-bold text-primary">Vendor Net Payout (₹)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => {
                    const splits = getProductSplits(p);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.category || 'General'}</TableCell>
                        <TableCell className="text-right font-semibold">₹{splits.price.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-bold">
                          <span className={splits.rate === 0 ? "text-emerald-500 font-extrabold" : "text-amber-500"}>
                            {splits.rate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {splits.commission > 0 ? (
                            <span className="text-destructive">-₹{splits.commission.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-emerald-500 font-bold">₹0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{(splits.shipping + splits.packing).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-black text-indigo-600 dark:text-indigo-400">₹{splits.vendorReceives.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'Approved' || p.status === 'Live' ? 'success' : p.status === 'Pending Review' ? 'warning' : 'secondary'}>{p.status}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                        No products listed yet. Add products to view itemized commission rates.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'products' && (
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Catalog Performance & Cumulative Revenue</CardTitle>
              <CardDescription>Track sales counts and net earnings generated per product.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Gross Sales (₹)</TableHead>
                    <TableHead className="text-right">Total Commission (₹)</TableHead>
                    <TableHead className="text-right">Total Shipping/Packing (₹)</TableHead>
                    <TableHead className="text-right font-bold text-emerald-500">Net Vendor Earnings (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const matchedOrders = orders.filter(o => o.items?.some((it: any) => it.productId === p.id || it.id === p.id));
                    const qtySold = matchedOrders.reduce((acc, o) => {
                      const item = o.items?.find((it: any) => it.productId === p.id || it.id === p.id);
                      return acc + (item?.quantity || 1);
                    }, 0);
                    const grossSales = qtySold * p.price;
                    const splits = getProductSplits(p);
                    const totalComm = qtySold * splits.commission;
                    const totalFees = qtySold * (splits.shipping + splits.packing);
                    const netEarnings = grossSales - totalComm - totalFees;
                    
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                        <TableCell className="text-right font-semibold">{qtySold} units</TableCell>
                        <TableCell className="text-right font-semibold">₹{grossSales.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-medium">
                          {totalComm > 0 ? (
                            <span className="text-destructive">-₹{totalComm.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-emerald-500 font-bold">₹0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{totalFees.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400">₹{netEarnings.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    );
                  })}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                        No catalog items available for performance analysis.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settlements' && (
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Past Settlements Logs</CardTitle>
              <CardDescription>Ledger records of payouts transferred to your registered bank account.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Settlement ID</TableHead>
                    <TableHead>Processed Date</TableHead>
                    <TableHead>Transfer Channel</TableHead>
                    <TableHead className="text-right">Transferred Amount (₹)</TableHead>
                    <TableHead>Transaction Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.filter(w => w.status === 'Completed').map(w => (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{w.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{w.processedDate || w.requestDate?.split('T')[0] || 'Today'}</TableCell>
                      <TableCell className="text-xs text-foreground">
                        <div className="font-semibold">{w.paymentMethod}</div>
                        <div className="text-[10px] text-muted-foreground">{w.details}</div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-500">₹{w.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Badge variant="success">Settled Successfully</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {withdrawals.filter(w => w.status === 'Completed').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                        No past completed settlements recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'upcoming' && (
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Upcoming Settlement Clearance Ledger</CardTitle>
              <CardDescription>Escrow funds from delivered customer orders awaiting automatic T+2 settlement clearance cycles.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Ref ID</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead className="text-right">Customer Paid (₹)</TableHead>
                    <TableHead className="text-right">Commission Deduct (₹)</TableHead>
                    <TableHead className="text-right font-bold text-primary">Expected Payout (₹)</TableHead>
                    <TableHead>Settlement Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.filter(o => o.orderStatus === 'Delivered' || o.deliveryStatus === 'Delivered' || o.orderStatus === 'Completed').map(o => {
                    const oItems = o.items || [];
                    const commDeduct = (o as any).commissionAmount || (o as any).vendorCommissionAmount || oItems.reduce((sum: number, it: any) => {
                      const prod = products.find(p => p.id === it.productId || (p as any)._id === it.productId);
                      const splits = prod ? getProductSplits(prod) : { rate: 0, commission: 0 };
                      return sum + Math.round((it.price || 0) * (it.quantity || 1) * (splits.rate / 100));
                    }, 0);
                    const netPayout = Math.max(0, (o.totalAmount || 0) - commDeduct);
                    return (
                      <TableRow key={o._id || o.id}>
                        <TableCell className="font-mono text-xs font-bold text-foreground">{o.orderNumber || o.id}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString('en-IN') : (o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : 'Today')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-medium">
                          {commDeduct > 0 ? (
                            <span className="text-destructive">-₹{commDeduct.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">₹0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-black text-indigo-600 dark:text-indigo-400">₹{netPayout.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                            <Clock className="h-3.5 w-3.5 animate-spin" />
                            <span>Clearing (T+1 days)</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {orders.filter(o => o.orderStatus === 'Delivered' || o.deliveryStatus === 'Delivered' || o.orderStatus === 'Completed').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                        No delivered orders pending clearance currently.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Generate Commission Statement</CardTitle>
                <CardDescription>Select report timeframes to generate legal invoice ledger files.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-muted-foreground">Start Date</label>
                    <input type="date" defaultValue="2026-06-01" className="border border-border rounded-lg p-2.5 bg-background text-foreground" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-muted-foreground">End Date</label>
                    <input type="date" defaultValue="2026-06-30" className="border border-border rounded-lg p-2.5 bg-background text-foreground" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={handleExportCSV} className="flex items-center justify-center gap-1.5 bg-primary text-white py-2.5 rounded-lg font-bold cursor-pointer">
                    <Download className="h-4 w-4" /> Download PDF Statement
                  </Button>
                  <Button onClick={handleExportCSV} variant="outline" className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold border-border cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export Excel / CSV Sheet
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/10">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Info className="h-4.5 w-4.5 text-primary" /> Tax Invoicing & GST Details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground flex flex-col gap-3 leading-relaxed">
                <p>
                  As per Section 52 of the Indian CGST Act 2017, the platform deducts Tax Collected at Source (TCS) at 1% on all net taxable sales values.
                </p>
                <div className="bg-background border border-border/40 p-3 rounded-lg flex flex-col gap-1 text-[11px]">
                  <span className="flex justify-between"><span>Active GSTIN:</span> <strong className="text-foreground">{profile.gstNumber || 'Not Registered'}</strong></span>
                  <span className="flex justify-between"><span>E-Commerce Operator GSTR-8 Ref:</span> <strong className="text-foreground">APEX-ECO-GSTR8</strong></span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
export default EarningsCommissions;
