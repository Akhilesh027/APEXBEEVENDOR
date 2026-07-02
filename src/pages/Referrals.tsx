import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Select } from '../components/ui/Select';
import { Share2, Copy, Check, Users, Award, HeartHandshake, Coins, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Referrals: React.FC = () => {
  const { referrals, profile } = useVendor();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form states to refer new vendor
  const [businessName, setBusinessName] = useState('');
  const [vendorType, setVendorType] = useState<'Manufacturer' | 'Wholesaler' | 'Vendor / Retailer'>('Vendor / Retailer');
  const [email, setEmail] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');

  const referralCode = profile.referralCode || "N/A";
  const referralLink = `http://localhost:5173/register?ref=${referralCode}`;

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleReferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`Invitation successfully sent to ${businessName}!`);
    setBusinessName('');
    setEmail('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Referral Override details simulation
  const referredVendorSales = [
    { name: "Delhi Tech Mart", type: "Wholesaler", totalSales: 245000, overrideComm: 2450, rate: "1.0%" },
    { name: "Bengaluru Organic Farms", type: "Manufacturer", totalSales: 184000, overrideComm: 1840, rate: "1.0%" },
    { name: "Deccan Fabric Depot", type: "Wholesaler", totalSales: 89000, overrideComm: 890, rate: "1.0%" }
  ];

  const totalEarnings = referrals.reduce((sum, r) => sum + r.earnings, 0) + referredVendorSales.reduce((sum, s) => sum + s.overrideComm, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'First Sale Completed': return <Badge variant="success">Completed / Paid</Badge>;
      case 'Approved': return <Badge variant="info">Approved / Awaiting Sale</Badge>;
      default: return <Badge variant="warning">Registered</Badge>;
    }
  };

  // Referral Growth chart data
  const growthChartData = [
    { name: 'Jan', referralsCount: 1, overrideEarnings: 1000 },
    { name: 'Feb', referralsCount: 2, overrideEarnings: 1450 },
    { name: 'Mar', referralsCount: 2, overrideEarnings: 2200 },
    { name: 'Apr', referralsCount: 3, overrideEarnings: 3600 },
    { name: 'May', referralsCount: 4, overrideEarnings: 4200 },
    { name: 'Jun', referralsCount: 5, overrideEarnings: totalEarnings }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Vendor Referral Network
          </h1>
          <p className="text-xs text-muted-foreground">Invite suppliers to sell on Apex Market and earn ₹1,000 bonus cash plus 1.0% sales override commission.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4 text-left">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Referred Vendors</span>
              <span className="text-lg font-extrabold text-foreground">{referrals.length} Businesses</span>
              <span className="text-[9px] text-muted-foreground">Active supply network partners</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4 text-left">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Network Earnings</span>
              <span className="text-lg font-extrabold text-foreground">₹{totalEarnings.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-emerald-500 font-bold">Includes 1% lifetime override</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border border-primary/20">
          <CardContent className="p-4 flex items-center gap-3 text-xs text-primary text-left">
            <HeartHandshake className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <span className="font-bold block text-foreground">Override Commissions Structure</span>
              <p className="text-muted-foreground mt-0.5 text-[10px]">
                Earn a 1.0% lifetime override on all customer sales generated by your referred Wholesalers and Manufacturers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Link Share Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="glass flex flex-col justify-between text-left">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Share2 className="h-5 w-5 text-primary" /> Share Referral Links
              </CardTitle>
              <CardDescription>Share your unique links with Wholesalers/Manufacturers</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Referral Link Copy */}
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-muted-foreground">Invite Link</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    readOnly
                    type="text"
                    value={referralLink}
                    className="w-full bg-secondary/60 text-muted-foreground border border-border rounded-lg px-2.5 py-2 text-[10px] focus:outline-none"
                  />
                  <Button onClick={() => copyToClipboard(referralLink, true)} size="sm" variant="outline" className="flex-shrink-0 cursor-pointer">
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Referral Code Copy */}
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-muted-foreground">Promo Code</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    readOnly
                    type="text"
                    value={referralCode}
                    className="w-full bg-secondary/60 text-muted-foreground border border-border rounded-lg px-2.5 py-2 text-[11px] focus:outline-none font-mono font-bold"
                  />
                  <Button onClick={() => copyToClipboard(referralCode, false)} size="sm" variant="outline" className="flex-shrink-0 cursor-pointer">
                    {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Invite Form */}
          <Card className="glass">
            <CardHeader className="pb-3 text-left">
              <CardTitle className="text-base font-bold">Email Referrals</CardTitle>
              <CardDescription>Send invitations directly via email</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReferSubmit} className="flex flex-col gap-3 text-left">
                {successMsg && (
                  <div className="p-2.5 text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
                    <Check className="h-4 w-4" /> {successMsg}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Supplier Business Name *</label>
                  <input
                    required
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Bangalore Mobiles"
                    className="border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Select
                  label="Supplier Business Type"
                  value={vendorType}
                  onChange={(e) => setVendorType(e.target.value as any)}
                  options={[
                    { value: 'Manufacturer', label: 'Manufacturer' },
                    { value: 'Wholesaler', label: 'Wholesaler' },
                    { value: 'Vendor / Retailer', label: 'Vendor / Retailer' }
                  ]}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Contact Email Address *</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. supply@bangaloremobiles.com"
                    className="border border-border rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Button type="submit" className="w-full mt-2 cursor-pointer font-bold">
                  Send Invitation
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Referred Growth Charts */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="glass text-left">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-primary" /> Referral Network & Earnings Growth
              </CardTitle>
              <CardDescription>Track monthly additions to your network and override commissions growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="referralsCount" name="Referrals Network" stroke="var(--color-primary)" strokeWidth={3} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="overrideEarnings" name="Override Earnings (₹)" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Referred Vendor Sales Override Tracker */}
          <Card className="glass text-left">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Coins className="h-4.5 w-4.5 text-emerald-500" /> Referred Sales & Commission Tracker
              </CardTitle>
              <CardDescription>Lifetime sales overrides generated by your referred supplier network</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referred Business</TableHead>
                    <TableHead>Supplier Type</TableHead>
                    <TableHead>Total Sales Volume</TableHead>
                    <TableHead>Override Commission Rate</TableHead>
                    <TableHead className="text-right">Earnings Generated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referredVendorSales.map((sales, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/10">
                      <td className="py-2.5 px-4 font-bold text-foreground text-xs">{sales.name}</td>
                      <td className="py-2.5 px-4 text-xs">
                        <Badge variant="purple" className="py-0">{sales.type}</Badge>
                      </td>
                      <td className="py-2.5 px-4 text-xs font-semibold text-foreground">₹{sales.totalSales.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-xs font-bold text-primary">{sales.rate}</td>
                      <td className="py-2.5 px-4 text-xs font-black text-emerald-500 text-right">+₹{sales.overrideComm.toLocaleString()}</td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Referred History Table */}
      <Card className="glass text-left">
        <CardHeader>
          <CardTitle className="text-base font-bold">Referrals Registry Ledger</CardTitle>
          <CardDescription>Track registration and reward status of invited shops</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="border-none rounded-none shadow-none">
              <TableHeader className="bg-transparent border-b border-border/40">
                <TableRow>
                  <TableHead>Invite ID</TableHead>
                  <TableHead>Referred Business</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fixed Reward Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">{r.id}</TableCell>
                    <TableCell className="text-xs font-bold text-foreground">{r.referredBusinessName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <Badge variant="purple" className="py-0">{r.referredType}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.referredDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(r.status)}</TableCell>
                    <TableCell className="font-extrabold text-xs text-emerald-500">
                      {r.earnings > 0 ? `+₹${r.earnings.toLocaleString('en-IN')}` : '₹0'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
