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
  const [showQrModal, setShowQrModal] = useState(false);
  const [connectionsFilter, setConnectionsFilter] = useState<'All' | 'CA' | 'Distributor' | 'Farmer' | 'Manufacturer'>('All');

  // Form states to refer new vendor
  const [businessName, setBusinessName] = useState('');
  const [vendorType, setVendorType] = useState<'Manufacturer' | 'Wholesaler' | 'Vendor / Retailer'>('Vendor / Retailer');
  const [email, setEmail] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');

  // Connections Mock Directory Data
  const connectionsDirectory = [
    { name: "Prakash CA & Partners", type: "CA", phone: "+91 94402 12345", location: "Nellore Center" },
    { name: "Srinivasa Seeds & Agri", type: "Farmer", phone: "+91 98480 54321", location: "Buchireddypalem Mandal" },
    { name: "Balaji Rice Distributors", type: "Distributor", phone: "+91 99663 88812", location: "Kovur Road Area" },
    { name: "Nellore Plastics Mfg Ltd", type: "Manufacturer", phone: "+91 80081 23456", location: "Nellore District" }
  ];

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

              {/* QR Standee Download trigger */}
              <Button 
                onClick={() => setShowQrModal(true)} 
                className="w-full text-xs font-bold bg-primary text-white py-2 rounded-lg cursor-pointer"
              >
                Download QR Standee Banner
              </Button>
            </CardContent>
          </Card>

          {/* QR Standee Modal Overlay */}
          {showQrModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <Card className="max-w-xs w-full bg-background border border-border relative text-center">
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="absolute top-2 right-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent"
                >
                  ✕ Close
                </button>
                <CardHeader>
                  <CardTitle className="text-sm font-extrabold text-primary">ApexBee Partner Standee</CardTitle>
                  <CardDescription className="text-[10px]">Display at checkout to refer other local merchants</CardDescription>
                </CardHeader>
                <CardContent className="p-4 flex flex-col items-center gap-3">
                  <div className="border-4 border-primary p-3 rounded-2xl bg-white">
                    {/* Simulated Standee QR Code Graphic */}
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      <rect x="10" y="10" width="80" height="80" fill="white" />
                      {/* Quiet Zone Grid */}
                      <rect x="20" y="20" width="20" height="20" fill="var(--primary)" />
                      <rect x="23" y="23" width="14" height="14" fill="white" />
                      <rect x="26" y="26" width="8" height="8" fill="var(--primary)" />
                      
                      <rect x="60" y="20" width="20" height="20" fill="var(--primary)" />
                      <rect x="63" y="23" width="14" height="14" fill="white" />
                      <rect x="66" y="26" width="8" height="8" fill="var(--primary)" />
                      
                      <rect x="20" y="60" width="20" height="20" fill="var(--primary)" />
                      <rect x="23" y="63" width="14" height="14" fill="white" />
                      <rect x="26" y="66" width="8" height="8" fill="var(--primary)" />
                      
                      {/* Random QR pixels */}
                      <rect x="45" y="25" width="8" height="12" fill="var(--primary)" />
                      <rect x="48" y="45" width="12" height="8" fill="var(--primary)" />
                      <rect x="65" y="50" width="8" height="15" fill="var(--primary)" />
                      <rect x="25" y="45" width="12" height="6" fill="var(--primary)" />
                    </svg>
                  </div>
                  <span className="font-mono text-xs font-black uppercase text-foreground">Code: {referralCode}</span>
                  <p className="text-[9px] text-muted-foreground">"Join ApexBee &amp; earn 1% Sales Commission!"</p>
                  <Button 
                    size="sm" 
                    className="w-full text-[10px] font-bold"
                    onClick={() => {
                      alert("Downloading partner standee PDF for print...");
                      setShowQrModal(false);
                    }}
                  >
                    Print Standee (PDF)
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

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
                  <TableHead className="text-right">Action</TableHead>
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
                    <TableCell className="text-right">
                      {r.status !== 'First Sale Completed' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-[9px] font-bold cursor-pointer"
                          onClick={() => alert(`Follow-up alert reminder sent successfully to ${r.referredBusinessName} via WhatsApp and SMS!`)}
                        >
                          Send Reminder
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold">Active Node</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Referral Leaderboard (District & Mandal Rankings) */}
        <Card className="lg:col-span-5 glass text-left h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-primary animate-pulse" /> Referral District Leaderboard
            </CardTitle>
            <CardDescription>Top referring merchants within Buchireddypalem &amp; Nellore Mandal limits.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Store Owner Name</TableHead>
                  <TableHead className="text-right">Referred Nodes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { rank: 1, name: "Nellore Provisions", count: 18, rating: "🥇 Gold Club" },
                  { rank: 2, name: "Buchi Grocery Store", count: 12, rating: "🥈 Silver Club" },
                  { rank: 3, name: "Kovur Sweet Plaza", count: 9, rating: "🥉 Bronze Club" },
                  { rank: 4, name: "Kavali Supermarket", count: 6, rating: "Active Partner" }
                ].map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-extrabold text-xs text-primary">{item.rank}</TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      <div>{item.name}</div>
                      <div className="text-[9px] text-muted-foreground">{item.rating}</div>
                    </TableCell>
                    <TableCell className="text-right font-black text-foreground text-xs">{item.count} Stores</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Business Connections Directory Filters */}
        <Card className="lg:col-span-7 glass text-left">
          <CardHeader className="pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-primary" /> Business Connections Directory
              </CardTitle>
              <CardDescription>Search and connect with local accountants, logistics partners, and suppliers.</CardDescription>
            </div>
            
            <div className="flex gap-1 border border-border/60 p-0.5 rounded-lg bg-secondary/30 shrink-0">
              {(['All', 'CA', 'Distributor', 'Farmer', 'Manufacturer'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setConnectionsFilter(tab)}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                    connectionsFilter === tab ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3">
            {connectionsDirectory
              .filter(c => connectionsFilter === 'All' || c.type === connectionsFilter)
              .map((conn, idx) => (
                <div key={idx} className="p-3 bg-secondary/25 border border-border/40 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground">{conn.name}</span>
                    <span className="text-[9.5px] text-muted-foreground mt-0.5">{conn.location} • {conn.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="purple" className="text-[8px] uppercase">{conn.type}</Badge>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-[10px] cursor-pointer"
                      onClick={() => alert(`Dialing connection partner: ${conn.phone}`)}
                    >
                      Call Partner
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
