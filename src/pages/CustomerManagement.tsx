import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Users, Mail, Phone, ShoppingBag, Star, Search, Plus, Package } from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { orders = [] } = useVendor();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Group orders by customer to calculate metrics and products ordered
  const customerMap: Record<string, {
    id: string;
    name: string;
    email: string;
    phone: string;
    ordersCount: number;
    spend: number;
    rating: number;
    tier: string;
    points: number;
    productsOrdered: string[];
  }> = {};

  orders.forEach((order, index) => {
    const key = (order.customerPhone || order.customerName || 'Customer').trim();
    if (!customerMap[key]) {
      customerMap[key] = {
        id: `CUST-${index + 101}`,
        name: order.customerName,
        email: `${order.customerName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
        phone: order.customerPhone || '+91 XXXXX XXXXX',
        ordersCount: 0,
        spend: 0,
        rating: 4.8 + (index % 3) * 0.1,
        tier: 'Silver',
        points: 0,
        productsOrdered: []
      };
    }

    const record = customerMap[key];
    record.ordersCount += 1;
    record.spend += order.totalAmount;
    
    order.items.forEach(it => {
      if (!record.productsOrdered.includes(it.productName)) {
        record.productsOrdered.push(it.productName);
      }
    });
  });

  const parsedCustomers = Object.values(customerMap).map(c => {
    c.points = Math.round(c.spend * 0.1);
    if (c.spend > 15000) c.tier = 'VIP';
    else if (c.spend > 5000) c.tier = 'Gold';
    else c.tier = 'Silver';
    return c;
  });

  // Fallbacks if database is brand new
  const defaults = [
    { id: "CUST-001", name: "Ananya Sharma", email: "ananya@gmail.com", phone: "+91 98765 00112", ordersCount: 12, spend: 18500, rating: 5.0, tier: "VIP", points: 1850, productsOrdered: ["Monsoon Seed Discount Banner Ads Lot", "boAt Earbuds Sponsored Push Ad Placement"] },
    { id: "CUST-002", name: "Amit Patel", email: "amit.patel@yahoo.com", phone: "+91 99112 23344", ordersCount: 5, spend: 7200, rating: 4.8, tier: "Gold", points: 720, productsOrdered: ["Oversized Blue Tees", "Formal Cotton Shirts"] },
    { id: "CUST-003", name: "Pooja Hegde", email: "pooja.h@rediffmail.com", phone: "+91 88776 65544", ordersCount: 2, spend: 2400, rating: 4.5, tier: "Silver", points: 240, productsOrdered: ["Fast moving summer collection"] }
  ];

  const customersList = parsedCustomers.length > 0 ? parsedCustomers : defaults;

  const filtered = customersList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.productsOrdered.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 2. Computed KPI aggregates
  const totalCustomers = customersList.length;
  const totalSpend = customersList.reduce((sum, c) => sum + c.spend, 0);
  const avgLtv = totalCustomers > 0 ? Math.round(totalSpend / totalCustomers) : 0;
  const vipCount = customersList.filter(c => c.tier === 'VIP').length;
  const vipShare = totalCustomers > 0 ? ((vipCount / totalCustomers) * 100).toFixed(1) : '0';

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Customer Directory & Buyers</h1>
          <p className="text-xs text-muted-foreground">Monitor real-time customer details, checkouts frequency, loyalty logs, and items ordered.</p>
        </div>
        <Button size="sm" className="self-start sm:self-auto cursor-pointer flex items-center gap-1.5 bg-primary text-white font-bold h-9">
          <Plus className="h-4 w-4" /> Add New Customer
        </Button>
      </div>

      {/* Summary KPI widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass text-left">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0"><Users className="h-5 w-5" /></div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Customers</span>
              <span className="text-base font-extrabold text-foreground">{totalCustomers} Clients</span>
              <span className="text-[9px] text-emerald-500 font-bold">Active Buying Accounts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass text-left">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0"><ShoppingBag className="h-5 w-5" /></div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Repeat Purchases</span>
              <span className="text-base font-extrabold text-foreground">
                {customersList.filter(c => c.ordersCount > 1).length} Accounts
              </span>
              <span className="text-[9px] text-emerald-500 font-bold">Loyal Segment Retention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass text-left">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center flex-shrink-0"><Star className="h-5 w-5" /></div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Average LTV</span>
              <span className="text-base font-extrabold text-foreground">₹{avgLtv.toLocaleString()}</span>
              <span className="text-[9px] text-muted-foreground">Lifetime transaction value</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass text-left">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0"><Users className="h-5 w-5 text-amber-500" /></div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">VIP Tier Share</span>
              <span className="text-base font-extrabold text-foreground">{vipShare}%</span>
              <span className="text-[9px] text-amber-500 font-bold">{vipCount} Premium VIP Buyers</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Customers directory */}
      <Card className="text-left">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-base font-bold">Customers Directory Register</CardTitle>
              <CardDescription>View, search, and audit ordered products and profiles of active buyers</CardDescription>
            </div>
            {/* Search filter input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, email or ordered product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-xs focus:ring-1 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground font-bold bg-muted/20">
                  <th className="py-2.5 px-4">Customer Name</th>
                  <th className="py-2.5 px-4">Contact Info</th>
                  <th className="py-2.5 px-4 text-center">Orders Placed</th>
                  <th className="py-2.5 px-4">Total Spend</th>
                  <th className="py-2.5 px-4">Ordered Products</th>
                  <th className="py-2.5 px-4 text-center">CSAT Rating</th>
                  <th className="py-2.5 px-4 text-center">Loyalty Points</th>
                  <th className="py-2.5 px-4">Tier Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cust, idx) => (
                  <tr key={idx} className="border-b border-border/40 hover:bg-muted/10 font-semibold text-foreground/80">
                    <td className="py-3 px-4 flex flex-col gap-0.5">
                      <span className="font-bold text-foreground">{cust.name}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">ID: {cust.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5 text-[10px]">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /> {cust.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /> {cust.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-foreground">{cust.ordersCount}</td>
                    <td className="py-3 px-4 text-primary">₹{cust.spend.toLocaleString()}</td>
                    <td className="py-3 px-4 max-w-[240px]">
                      <div className="flex flex-wrap gap-1">
                        {cust.productsOrdered.map((prod, pIdx) => (
                          <span key={pIdx} className="bg-secondary/40 text-foreground text-[9px] px-1.5 py-0.5 rounded-md font-semibold truncate border border-border/40 flex items-center gap-1 max-w-[180px]">
                            <Package className="h-2.5 w-2.5 text-primary shrink-0" />
                            <span className="truncate">{prod}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span>{cust.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-indigo-500 font-bold">{cust.points} pts</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          cust.tier === 'VIP'
                            ? 'success'
                            : cust.tier === 'Gold'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-[9px] py-0.5 px-1.5 font-bold"
                      >
                        {cust.tier}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs text-muted-foreground">
                      No matching customer transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
