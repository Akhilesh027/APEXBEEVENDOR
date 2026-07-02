import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { QrCode, Download, RefreshCw, Smartphone, CheckCircle, ArrowRight, BarChart3, Coins, Users, Share2, TrendingUp, Clock } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

export const QRMerchantCenter: React.FC = () => {
  const { profile, transactions } = useVendor();
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Submenu checks from path/context currentPage state
  const { currentPage } = useVendor();
  const isMyQr = currentPage === 'qr-my';
  const isTxns = currentPage === 'qr-txns';
  const isAnalytics = currentPage === 'qr-analytics';
  const isSettlements = currentPage === 'qr-settlements';
  const isCustomers = currentPage === 'qr-customers';
  const isCashback = currentPage === 'qr-cashback';
  const isReferrals = currentPage === 'qr-referrals';
  const isGrowth = currentPage === 'qr-growth';

  const handleSimulatePayment = () => {
    const payAmount = parseFloat(amount) || 299;
    setSuccessMsg(`Simulating scan payment of ₹${payAmount} completed!`);
    setTimeout(() => {
      setSuccessMsg(null);
      setAmount('');
      setNote('');
      alert(`Demo payment of ₹${payAmount} processed successfully! Earning added to wallet.`);
    }, 2000);
  };

  // Filter QR UPI transactions
  const qrTxns = transactions.filter(t => t.description.toLowerCase().includes('qr') || t.description.toLowerCase().includes('upi') || t.type.toLowerCase().includes('qr'));

  // Mock analytics data
  const qrSalesData = [
    { date: '06-08', sales: 12400 },
    { date: '06-09', sales: 14500 },
    { date: '06-10', sales: 9800 },
    { date: '06-11', sales: 18900 },
    { date: '06-12', sales: 22400 },
    { date: '06-13', sales: 15400 },
    { date: '06-14', sales: 25800 }
  ];

  const getHeaderTitle = () => {
    if (isMyQr) return "My Store QR codes";
    if (isTxns) return "QR Payments Transactions Ledger";
    if (isAnalytics) return "QR Sales Revenue Analytics";
    if (isSettlements) return "UPI Bank Settlement Logs";
    if (isCustomers) return "QR Customer Checkouts Directory";
    if (isCashback) return "QR Cashback Promo Builder";
    if (isReferrals) return "QR Referral Override Commissions";
    if (isGrowth) return "QR Merchant Growth Score";
    return "QR Merchant Operating Center";
  };

  const getHeaderDesc = () => {
    if (isMyQr) return "Download, print, or generate custom payment link QR codes for your retail counter.";
    if (isTxns) return "Audit real-time incoming UPI digital receipts generated from counter checkouts.";
    if (isAnalytics) return "Track daily, weekly, and monthly growth trends of physical scan checkouts.";
    if (isSettlements) return "Monitor bank settlements status for all accumulated QR earnings.";
    if (isCustomers) return "Trace repeat buyer loyalty points generated from digital checkouts.";
    if (isCashback) return "Configure scan-back incentive rewards to attract local foot traffic.";
    if (isReferrals) return "Track earnings generated from counter terminal referrals.";
    if (isGrowth) return "Review your business expansion levels based on local digital acceptance rates.";
    return "Unified digital payment engine accepting instant scan receipts from GPay, PhonePe, and Paytm.";
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">{getHeaderTitle()}</h1>
          <p className="text-xs text-muted-foreground">{getHeaderDesc()}</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Dynamic Tab Renderings */}
      <div className="grid grid-cols-1 gap-6">
        {/* VIEW 1: My QR */}
        {(isMyQr || currentPage === 'qr') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="glass lg:col-span-5 flex flex-col justify-between text-left">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <QrCode className="h-4.5 w-4.5 text-primary" /> Active Counter QR
                </CardTitle>
                <CardDescription>Scan to pay directly via any UPI app (GPay, PhonePe, Paytm)</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 relative">
                  <svg className="w-44 h-44 text-slate-800" viewBox="0 0 100 100">
                    <rect width="25" height="25" fill="currentColor" />
                    <rect x="75" width="25" height="25" fill="currentColor" />
                    <rect y="75" width="25" height="25" fill="currentColor" />
                    <rect x="25" y="25" width="10" height="10" fill="currentColor" />
                    <rect x="55" y="45" width="20" height="20" fill="currentColor" />
                    <rect x="35" y="65" width="15" height="15" fill="currentColor" />
                    <rect x="65" y="75" width="15" height="15" fill="currentColor" />
                    <rect x="6" y="6" width="13" height="13" fill="white" />
                    <rect x="81" y="6" width="13" height="13" fill="white" />
                    <rect x="6" y="81" width="13" height="13" fill="white" />
                    <rect x="8" y="8" width="9" height="9" fill="currentColor" />
                    <rect x="83" y="8" width="9" height="9" fill="currentColor" />
                    <rect x="8" y="83" width="9" height="9" fill="currentColor" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-primary text-white p-1.5 rounded-lg text-[10px] font-black shadow-md border border-white">
                      ApexBee
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-bold text-foreground">{profile.businessName}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">VPA: {profile.ownerName.toLowerCase().replace(/\s+/g, '')}@apexbee</span>
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <Button size="sm" variant="secondary" className="flex-1 text-[10px] cursor-pointer flex items-center justify-center gap-1.5">
                    <Download className="h-3 w-3" /> Download PDF
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1 text-[10px] cursor-pointer flex items-center justify-center gap-1.5">
                    <RefreshCw className="h-3 w-3" /> Regenerate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass lg:col-span-7">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Smartphone className="h-4.5 w-4.5 text-primary" /> Simulate Customer QR Scan
                </CardTitle>
                <CardDescription>Trigger simulated instant UPI credits</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Amount (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 499"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Reference/Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Counter Table 2"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSimulatePayment}
                  className="w-full mt-2 bg-gradient-to-r from-primary to-purple-600 text-white font-bold h-9 shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Trigger QR Scan Simulation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW 2: QR Transactions */}
        {isTxns && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-primary" /> Instant UPI Credit Log
              </CardTitle>
              <CardDescription>Verified counter scan credits on our payment logs</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Reference Note</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Settlement status</TableHead>
                    <TableHead className="text-right">Net Received (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qrTxns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                        No counter payments logged. Simulate a payment scan in "My QR" tab to populate.
                      </TableCell>
                    </TableRow>
                  ) : (
                    qrTxns.map((t, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs font-bold text-foreground">{t.id}</TableCell>
                        <TableCell className="text-xs text-foreground font-semibold">{t.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(t.date).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="success">Settled</Badge></TableCell>
                        <TableCell className="text-right font-black text-emerald-500">₹{t.amount.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 3: QR Analytics */}
        {isAnalytics && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <BarChart3 className="h-4.5 w-4.5 text-primary" /> Daily QR Revenue Volume
              </CardTitle>
              <CardDescription>Daily sales volume collected via counter terminals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={qrSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorQrSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                    <Area type="monotone" dataKey="sales" name="QR Sales (₹)" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorQrSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* VIEW 4: QR Settlements */}
        {isSettlements && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Coins className="h-4.5 w-4.5 text-primary" /> UPI Settlement Accounts Ledger
              </CardTitle>
              <CardDescription>Daily automated settlements cleared to your default bank profile account</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Settlement Batch</TableHead>
                    <TableHead>Date Cleared</TableHead>
                    <TableHead>Default Bank Account</TableHead>
                    <TableHead className="text-right">Volume Settled (₹)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-bold text-foreground">SET-QR-0012</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Today (03:30 AM)</TableCell>
                    <TableCell className="text-xs text-foreground font-semibold">ICICI Bank Current (•••• 9232)</TableCell>
                    <TableCell className="text-right font-black text-emerald-500">₹18,900</TableCell>
                    <TableCell><Badge variant="success">Settled Successfully</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 5: QR Customers */}
        {isCustomers && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-primary" /> Counter Customer Demographics
              </CardTitle>
              <CardDescription>Customers checking out via UPI QR scan payments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer Mobile</TableHead>
                    <TableHead>Checkouts Count</TableHead>
                    <TableHead>Cumulative Spend (₹)</TableHead>
                    <TableHead>Loyalty Points</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-foreground">+91 99000 88210</TableCell>
                    <TableCell className="text-xs text-foreground font-semibold">8 scans</TableCell>
                    <TableCell className="font-bold">₹4,250</TableCell>
                    <TableCell className="font-extrabold text-indigo-500">85 Points</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => alert("Simulating sending custom WhatsApp thank-you coupon!")} className="h-7 text-xs cursor-pointer border-border">Gift Coupon</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 6: QR Cashback */}
        {isCashback && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5 glass h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Launch QR Cashback campaign</CardTitle>
                <CardDescription>Attract local foot traffic with instant UPI payouts scan rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); alert("QR Cashback campaign deployed successfully!"); }} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Cashback Rate (%) *</label>
                    <input required type="number" step="0.5" placeholder="e.g. 2.5" className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Min. Billing Cart Size (₹) *</label>
                    <input required type="number" placeholder="e.g. 500" className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                  </div>
                  <Button type="submit" className="w-full mt-2 bg-primary text-white font-bold h-9">
                    Deploy Cashback Rules
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7 glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Active Cashback Campaigns</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cashback Rate</TableHead>
                      <TableHead className="text-right">Min Cart</TableHead>
                      <TableHead className="text-right">Total Paid Out (₹)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-bold text-foreground">5.0% Scanback Bonus</TableCell>
                      <TableCell className="text-right">₹1,000</TableCell>
                      <TableCell className="text-right text-indigo-500 font-extrabold">₹3,450</TableCell>
                      <TableCell><Badge variant="success">Active</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW 7: QR Referral Earnings */}
        {isReferrals && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Share2 className="h-4.5 w-4.5 text-primary" /> referral Terminal Commission logs
              </CardTitle>
              <CardDescription>Earn passive commission split when merchants you refer process QR checkouts</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referred Store</TableHead>
                    <TableHead>Batch Sales Volume (₹)</TableHead>
                    <TableHead>Referral Commission %</TableHead>
                    <TableHead className="text-right">Earnings Received (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-foreground">Pune Textiles Depot</TableCell>
                    <TableCell>₹1,24,000</TableCell>
                    <TableCell className="font-semibold text-primary">0.2% on UPI volume</TableCell>
                    <TableCell className="text-right font-black text-emerald-500">₹248</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 8: QR Growth */}
        {isGrowth && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-primary animate-bounce" /> Digital Acceptance Rating
              </CardTitle>
              <CardDescription>Check requirements to upgrade your merchant terminal tiers</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 flex justify-between items-center">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="font-bold text-foreground">Current Tier: Silver Merchant</span>
                  <span className="text-[10px] text-muted-foreground">UPI terminal flat rate: 1.5%</span>
                </div>
                <Badge variant="default">Level Up at ₹50,000 Sales</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRMerchantCenter;
