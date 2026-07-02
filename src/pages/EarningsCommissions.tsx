import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Coins, BarChart3, Clock, CheckCircle, Download, FileSpreadsheet, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

export const EarningsCommissions: React.FC = () => {
  const { products, orders, withdrawals } = useVendor();
  const [activeTab, setActiveTab] = useState<'breakdown' | 'products' | 'settlements' | 'upcoming' | 'reports'>('breakdown');
  
  // Commission trend data
  const monthlyData = [
    { name: 'Jan', earnings: 74200, commission: 8500 },
    { name: 'Feb', earnings: 85600, commission: 9800 },
    { name: 'Mar', earnings: 105200, commission: 12400 },
    { name: 'Apr', earnings: 98100, commission: 11000 },
    { name: 'May', earnings: 115000, commission: 13800 },
    { name: 'Jun', earnings: 122400, commission: 15400 }
  ];

  // Helper: calculate payout splits
  const getProductSplits = (price: number, commRate: number, shipping: number, packing: number) => {
    const commission = Math.round(price * (commRate / 100));
    const vendorReceives = price - commission;
    return {
      price,
      commission,
      shipping,
      packing,
      vendorReceives
    };
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Earnings & Commissions</h1>
          <p className="text-xs text-muted-foreground">Monitor platform commissions, analyze itemized payout breakdowns, and track settlements.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: 'breakdown', label: 'Commission Breakdown', icon: <Coins className="h-3.5 w-3.5" /> },
          { id: 'products', label: 'Product Earnings', icon: <BarChart3 className="h-3.5 w-3.5" /> },
          { id: 'settlements', label: 'Settlement History', icon: <CheckCircle className="h-3.5 w-3.5" /> },
          { id: 'upcoming', label: 'Upcoming Settlements', icon: <Clock className="h-3.5 w-3.5 animate-pulse" /> },
          { id: 'reports', label: 'Commission Reports', icon: <FileSpreadsheet className="h-3.5 w-3.5" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
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
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹4,25,800</span>
                <span className="text-[9px] text-muted-foreground mt-1">Processed across 182 orders settled successfully.</span>
              </CardContent>
            </Card>
            <Card className="bg-indigo-500/5 border-indigo-500/20">
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Average Platform Fee</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">11.4%</span>
                <span className="text-[9px] text-muted-foreground mt-1">Calculated across apparel, catalog weight, and shipping categories.</span>
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
                    <TableHead className="text-right">Platform Comm. (%)</TableHead>
                    <TableHead className="text-right">Comm. Amount (₹)</TableHead>
                    <TableHead className="text-right">Logistics/Packing (₹)</TableHead>
                    <TableHead className="text-right font-bold text-primary">Vendor Net Payout (₹)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => {
                    const splits = getProductSplits(p.price, p.commissionRate, p.shippingCharges, p.packingCharges);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.category}</TableCell>
                        <TableCell className="text-right font-semibold">₹{splits.price}</TableCell>
                        <TableCell className="text-right text-amber-500 font-bold">{p.commissionRate}%</TableCell>
                        <TableCell className="text-right text-destructive font-medium">-₹{splits.commission}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{splits.shipping + splits.packing}</TableCell>
                        <TableCell className="text-right font-black text-indigo-600 dark:text-indigo-400">₹{splits.vendorReceives}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'Approved' ? 'success' : 'secondary'}>{p.status}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                    <TableHead className="text-right">Total Platform Fee (₹)</TableHead>
                    <TableHead className="text-right">Total Shipping/Packing (₹)</TableHead>
                    <TableHead className="text-right font-bold text-emerald-500">Net Vendor Earnings (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p, idx) => {
                    // simulate sold counts for demo realism
                    const qtySold = idx === 0 ? 34 : idx === 1 ? 18 : idx === 2 ? 8 : 0;
                    const grossSales = qtySold * p.price;
                    const splits = getProductSplits(p.price, p.commissionRate, p.shippingCharges, p.packingCharges);
                    const totalComm = qtySold * splits.commission;
                    const totalFees = qtySold * (splits.shipping + splits.packing);
                    const netEarnings = grossSales - totalComm - totalFees;
                    
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                        <TableCell className="text-right font-semibold">{qtySold} units</TableCell>
                        <TableCell className="text-right font-semibold">₹{grossSales.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-destructive font-medium">-₹{totalComm.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{totalFees.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400">₹{netEarnings.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    );
                  })}
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
                      <TableCell className="text-xs text-muted-foreground">{w.processedDate || w.requestDate.split('T')[0]}</TableCell>
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
                  {/* Baseline Settlements */}
                  <TableRow>
                    <TableCell className="font-mono text-xs font-bold text-foreground">SET-2026-8819</TableCell>
                    <TableCell className="text-xs text-muted-foreground">2026-06-05</TableCell>
                    <TableCell className="text-xs text-foreground">
                      <div className="font-semibold">Bank Transfer</div>
                      <div className="text-[10px] text-muted-foreground">HDFC Current A/C •••• 92233</div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-500">₹25,840</TableCell>
                    <TableCell>
                      <Badge variant="success">Settled Successfully</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-bold text-foreground">SET-2026-8790</TableCell>
                    <TableCell className="text-xs text-muted-foreground">2026-05-28</TableCell>
                    <TableCell className="text-xs text-foreground">
                      <div className="font-semibold">UPI Payout</div>
                      <div className="text-[10px] text-muted-foreground">mumbaifashion@okhdfc</div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-500">₹14,920</TableCell>
                    <TableCell>
                      <Badge variant="success">Settled Successfully</Badge>
                    </TableCell>
                  </TableRow>
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
                    <TableHead className="text-right">Platform Fee Deduct (₹)</TableHead>
                    <TableHead className="text-right font-bold text-primary">Expected Payout (₹)</TableHead>
                    <TableHead>Settlement Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.filter(o => o.deliveryStatus === 'Delivered').map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{o.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(o.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">₹{o.totalAmount}</TableCell>
                      <TableCell className="text-right text-destructive font-medium">-₹{Math.round(o.subtotal * 0.1)}</TableCell>
                      <TableCell className="text-right font-black text-indigo-600 dark:text-indigo-400">₹{Math.round(o.totalAmount - (o.subtotal * 0.1))}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                          <Clock className="h-3.5 w-3.5 animate-spin" />
                          <span>Clearing (T+1 days)</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  <Button className="flex items-center justify-center gap-1.5 bg-primary text-white py-2.5 rounded-lg font-bold cursor-pointer">
                    <Download className="h-4 w-4" /> Download PDF Statement
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold border-border cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export Excel Sheet
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
                  <span className="flex justify-between"><span>Active GSTIN:</span> <strong className="text-foreground">27AAAAA1111A1Z1</strong></span>
                  <span className="flex justify-between"><span>E-Commerce Operator GSTR-8 Ref:</span> <strong className="text-foreground">APEX-ECO-GSTR8</strong></span>
                  <span className="flex justify-between"><span>TCS Accrued (This Month):</span> <strong className="text-foreground">₹1,540</strong></span>
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
