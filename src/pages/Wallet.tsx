import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { 
  Wallet, 
  ArrowDownCircle, 
  History as HistoryIcon, 
  Clock, 
  TrendingUp,
  Download,
  Calendar,
  Settings,
  ShieldAlert,
  ArrowRight,
  Coins
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { transactions = [], stats, withdrawals = [], profile } = useVendor();
  const [activeTab, setActiveTab] = useState<'overview' | 'settlements' | 'accounts' | 'statements'>('overview');
  const [autoSettlement, setAutoSettlement] = useState<'daily' | 'weekly' | 'monthly' | 'manual'>('daily');
  const [orderAmount, setOrderAmount] = useState('1000');

  // Auto-derived figures from database available wallet
  const bal = stats?.walletBalance || 0;
  const pendingBal = stats?.pendingEarnings || 0;

  // 1. Wallet Breakdown split based on PDF Page 2
  const orderRev = Math.round(bal * 0.8);
  const subRev = Math.round(bal * 0.1);
  const qrRev = Math.round(bal * 0.05);
  const cashbackAdjustment = Math.round(bal * 0.05);

  // Derive today's expected settlement
  const todayEarnings = Math.round(pendingBal * 0.4);
  const processingWithdrawal = withdrawals
    .filter(w => w.status === 'Pending' || w.status === 'Approved')
    .reduce((sum, w) => sum + w.amount, 0);
  const completedWithdrawalsTotal = withdrawals
    .filter(w => w.status === 'Completed')
    .reduce((sum, w) => sum + w.amount, 0);

  // Settlement calendar grid based on PDF Page 3
  const settlementCalendar = [
    { day: "Monday", amount: 12450, status: "Settled" },
    { day: "Tuesday", amount: 8200, status: "Settled" },
    { day: "Wednesday", amount: 15400, status: "Settled" },
    { day: "Thursday", amount: Math.round(bal * 0.2), status: "Processing" },
    { day: "Friday", amount: Math.round(bal * 0.15), status: "Scheduled" }
  ];

  const triggerDownload = (type: string) => {
    alert(`Generating and downloading your complete ${type} statement in spreadsheet format...`);
  };

  const handleToggleAutoSettlement = (type: 'daily' | 'weekly' | 'monthly' | 'manual') => {
    setAutoSettlement(type);
    alert(`Auto-Settlement preferences successfully updated to: ${type.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary animate-pulse" /> Merchant Financial Hub
          </h1>
          <p className="text-xs text-muted-foreground">Manage multi-channel earnings, config settlements schedules, audit processing fees, and download statements.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => triggerDownload('monthly')} className="h-9 text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/30 pb-1 text-xs font-bold text-muted-foreground">
        <button onClick={() => setActiveTab('overview')} className={`pb-2 px-1 border-b-2 cursor-pointer transition-all ${activeTab === 'overview' ? 'border-primary text-primary font-black' : 'border-transparent hover:text-foreground'}`}>Overview &amp; Wallet</button>
        <button onClick={() => setActiveTab('settlements')} className={`pb-2 px-1 border-b-2 cursor-pointer transition-all ${activeTab === 'settlements' ? 'border-primary text-primary font-black' : 'border-transparent hover:text-foreground'}`}>Settlements Calendar</button>
        <button onClick={() => setActiveTab('accounts')} className={`pb-2 px-1 border-b-2 cursor-pointer transition-all ${activeTab === 'accounts' ? 'border-primary text-primary font-black' : 'border-transparent hover:text-foreground'}`}>Bank Accounts</button>
        <button onClick={() => setActiveTab('statements')} className={`pb-2 px-1 border-b-2 cursor-pointer transition-all ${activeTab === 'statements' ? 'border-primary text-primary font-black' : 'border-transparent hover:text-foreground'}`}>Statements Download</button>
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          
          {/* Main Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Available Balance */}
            <Card className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg">
              <CardContent className="p-4 flex flex-col justify-between h-full relative overflow-hidden">
                <span className="text-[10px] text-white/95 uppercase font-bold tracking-wider">Available Balance</span>
                <span className="text-2xl font-black mt-1">₹{bal.toLocaleString('en-IN')}</span>
                <div className="text-[9px] text-white/80 font-medium mt-2 pt-1 border-t border-white/20">
                  Ready to withdraw: ₹{bal.toLocaleString('en-IN')}
                </div>
              </CardContent>
            </Card>

            {/* Pending Settlement */}
            <Card className="glass">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" /> Pending Settlement
                </span>
                <span className="text-2xl font-extrabold mt-1 text-foreground">₹{pendingBal.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-muted-foreground pt-1 border-t border-border/40 mt-2">Cycle verification in progress</span>
              </CardContent>
            </Card>

            {/* Total Earnings */}
            <Card className="glass">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-indigo-500" /> Total Earnings
                </span>
                <span className="text-2xl font-extrabold mt-1 text-foreground">₹{(bal + completedWithdrawalsTotal).toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-muted-foreground pt-1 border-t border-border/40 mt-2">Cumulative merchant income</span>
              </CardContent>
            </Card>

            {/* Total Withdrawals */}
            <Card className="glass">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <ArrowDownCircle className="h-3 w-3 text-rose-500" /> Total Withdrawals
                </span>
                <span className="text-2xl font-extrabold mt-1 text-foreground">₹{completedWithdrawalsTotal.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-muted-foreground pt-1 border-t border-border/40 mt-2">Settled to bank accounts</span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Wallet Breakdown & Ecosystem Integration */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Wallet Breakdown Splitting (PDF Page 2) */}
              <Card className="glass">
                <CardHeader className="pb-2 border-b border-border/30">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Wallet className="h-4 w-4 text-primary" /> Wallet Breakdown Split</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col gap-3 font-semibold text-xs text-muted-foreground">
                  <div className="flex justify-between items-center pb-2 border-b border-border/20">
                    <span className="text-foreground">Order Revenue</span>
                    <span className="text-foreground font-extrabold">₹{orderRev.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/20">
                    <span className="text-foreground">Subscription Revenue</span>
                    <span className="text-foreground font-extrabold">₹{subRev.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/20">
                    <span className="text-foreground">QR Merchant Payments</span>
                    <span className="text-foreground font-extrabold">₹{qrRev.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Cashback Adjustments</span>
                    <span className="text-foreground font-extrabold">₹{cashbackAdjustment.toLocaleString()}</span>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 flex justify-between items-center mt-2 text-foreground font-black text-sm">
                    <span>Total Wallet Balance</span>
                    <span className="text-primary">₹{bal.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Instant Withdraw Eligibility Card (PDF Page 3) */}
              <Card className="glass border-primary/20 bg-primary/[0.01]">
                <CardContent className="p-4 flex flex-col gap-2 text-xs">
                  <span className="font-extrabold text-foreground text-sm">Instant Withdraw Eligibility</span>
                  <div className="flex justify-between items-center font-bold mt-1 text-muted-foreground">
                    <span>Available Today</span>
                    <span className="text-emerald-500 font-black text-sm">₹{(bal - 500 > 0 ? bal - 500 : 0).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    * Eligible amount factors in daily rolling reserves and bank settlement timings. Minimum required balance is ₹500.
                  </p>
                </CardContent>
              </Card>

              {/* Financial Health Score (PDF Page 7) */}
              <Card className="glass">
                <CardHeader className="pb-2 border-b border-border/30">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><ShieldAlert className="h-4.5 w-4.5 text-primary" /> Financial Health Score</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col gap-3 font-semibold text-xs text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-extrabold text-sm">Overall Status</span>
                    <div className="text-amber-500 font-black">★★★★★ Excellent</div>
                  </div>
                  <div className="flex justify-between items-center mt-1 border-b border-border/20 pb-2">
                    <span>Wallet Health</span>
                    <span className="text-emerald-500 font-bold">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <span>Settlement Timing</span>
                    <span className="text-emerald-500 font-bold">On Time (100%)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <span>Withdrawals History</span>
                    <span className="text-emerald-500 font-bold">Excellent</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <span>Refund Rates</span>
                    <span className="text-emerald-500 font-bold">Low (&lt;1.5%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Chargeback Disputations</span>
                    <span className="text-foreground font-bold">0 Active</span>
                  </div>
                </CardContent>
              </Card>

              {/* Ecosystem Integration (PDF Page 5) */}
              <Card className="glass">
                <CardHeader className="pb-2 border-b border-border/30">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><ArrowRight className="h-4.5 w-4.5 text-primary" /> ApexBee Wallet Integrations</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col gap-3 font-semibold text-xs text-muted-foreground">
                  <p className="text-[10px] leading-relaxed mb-1">
                    Your available wallet balance runs the entire ecosystem. Zero-fee direct deductions apply for internal transactions:
                  </p>
                  <div className="flex justify-between items-center border-b border-border/20 pb-1.5">
                    <span className="text-foreground">B2B Sourcing Purchase</span>
                    <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500 font-bold bg-emerald-500/5">Direct Deduct ✓</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/20 pb-1.5">
                    <span className="text-foreground">Advertisement Campaigns</span>
                    <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500 font-bold bg-emerald-500/5">Direct Deduct ✓</Badge>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/20 pb-1.5">
                    <span className="text-foreground">Store Coupon Budgets</span>
                    <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500 font-bold bg-emerald-500/5">Direct Deduct ✓</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">QR Customer Refunds</span>
                    <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500 font-bold bg-emerald-500/5">Direct Deduct ✓</Badge>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right: Pending Money & Ledger */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Pending Money Breakdown (PDF Page 2) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass">
                  <CardContent className="p-3.5 flex flex-col text-left">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">Today's Earnings</span>
                    <span className="text-base font-black text-foreground mt-1">₹{todayEarnings.toLocaleString()}</span>
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardContent className="p-3.5 flex flex-col text-left">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">In Processing</span>
                    <span className="text-base font-black text-foreground mt-1">₹{processingWithdrawal.toLocaleString()}</span>
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardContent className="p-3.5 flex flex-col text-left">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">Completed Settlements</span>
                    <span className="text-base font-black text-emerald-500 mt-1">₹{completedWithdrawalsTotal.toLocaleString()}</span>
                  </CardContent>
                </Card>
              </div>

              {/* Transactions Ledger */}
              <Card className="glass">
                <CardHeader className="border-b border-border/30 pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><HistoryIcon className="h-4.5 w-4.5 text-primary" /> Wallet Transactions Ledger</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Activity Details</TableHead>
                        <TableHead className="text-right">Net Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-xs text-muted-foreground text-center py-6">No transactions logged in the ledger.</TableCell>
                        </TableRow>
                      ) : transactions.map(t => (
                        <TableRow key={t.id}>
                          <TableCell className="font-mono text-[10.5px] font-bold text-foreground">{t.referenceId}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString('en-IN')}</TableCell>
                          <TableCell className="text-xs text-muted-foreground text-left max-w-xs font-semibold">{t.description}</TableCell>
                          <TableCell className={`text-right font-black text-xs ${t.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {t.amount > 0 ? '+' : ''}₹{t.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>

          </div>

        </div>
      )}

      {activeTab === 'settlements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Settlement Calendar Grid */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Calendar className="h-4.5 w-4.5 text-primary" /> Settlement Calendar Grid</CardTitle>
                <CardDescription>Daily settlements calendar view computed from retail checkouts.</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                  {settlementCalendar.map((item, idx) => (
                    <div key={idx} className={`p-4 border rounded-xl flex flex-col gap-2 transition-all text-center ${
                      item.status === 'Settled' ? 'bg-emerald-500/5 border-emerald-500/20' :
                      item.status === 'Processing' ? 'bg-amber-500/5 border-amber-500/20' :
                      'bg-secondary/25 border-border/60'
                    }`}>
                      <span className="text-[10px] text-muted-foreground uppercase font-extrabold">{item.day}</span>
                      <span className="text-base font-black text-primary">₹{item.amount.toLocaleString()}</span>
                      <Badge variant={item.status === 'Settled' ? 'success' : item.status === 'Processing' ? 'warning' : 'secondary'} className="mx-auto text-[8px] py-0 px-1.5">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Fee Breakdown Settle Calculator */}
            <Card className="glass">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Coins className="h-4.5 w-4.5 text-primary animate-pulse" /> Platform Fee Breakdown &amp; Settle Calculator
                </CardTitle>
                <CardDescription>Audit platform commission rates and checkouts taxation returns transparently.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Input Order Amount (₹)</label>
                    <input 
                      type="number" 
                      value={orderAmount} 
                      onChange={(e) => setOrderAmount(e.target.value)} 
                      placeholder="e.g. 1000" 
                      className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    * Standard platform fee is 5.0% of customer checkouts. GST is 18.0% of the platform commission fee itself.
                  </p>
                </div>
                
                <div className="flex-1 bg-secondary/20 p-4 border border-border/60 rounded-xl flex flex-col gap-2.5 font-semibold text-xs text-muted-foreground">
                  <div className="flex justify-between items-center pb-1.5 border-b border-border/20">
                    <span>Order Total:</span>
                    <span className="text-foreground font-black">₹{parseFloat(orderAmount || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-border/20">
                    <span>Platform Commission (5%):</span>
                    <span className="text-rose-500 font-extrabold">-₹{(Math.round(parseFloat(orderAmount || '0') * 0.05)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-border/20">
                    <span>GST Commission Tax (18% on fee):</span>
                    <span className="text-rose-500 font-extrabold">-₹{(Math.round(parseFloat(orderAmount || '0') * 0.05 * 0.18)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-foreground font-black text-sm pt-1">
                    <span>Net Settle Payout:</span>
                    <span className="text-emerald-500">
                      ₹{(Math.max(0, Math.round(parseFloat(orderAmount || '0') * 0.941))).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right: Auto Settlement Settings */}
          <div className="lg:col-span-4 flex flex-col gap-6 text-xs text-left">
            <Card className="glass">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Settings className="h-4.5 w-4.5 text-primary" /> Settlement Frequencies</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4 font-semibold text-muted-foreground">
                <p className="text-[10px] leading-relaxed">Select how frequently the system flushes available wallet balances into your primary verified bank account:</p>
                
                <div className="flex flex-col gap-2.5">
                  {[
                    { type: 'daily', label: 'Daily Settlement', desc: 'Transfer balance every evening at 8:00 PM' },
                    { type: 'weekly', label: 'Weekly Settlement', desc: 'Settle balance every Friday morning' },
                    { type: 'monthly', label: 'Monthly Settlement', desc: 'Settle balance on the 1st of every month' },
                    { type: 'manual', label: 'Manual Withdrawals Only', desc: 'Request bank transfers manually via form' }
                  ].map((opt) => (
                    <label key={opt.type} className="flex gap-2.5 items-start p-3 bg-secondary/25 border border-border/40 hover:bg-secondary/40 rounded-xl cursor-pointer">
                      <input 
                        type="radio" 
                        name="auto-settle" 
                        checked={autoSettlement === opt.type} 
                        onChange={() => handleToggleAutoSettlement(opt.type as any)} 
                        className="mt-1 accent-primary" 
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground text-xs font-extrabold">{opt.label}</span>
                        <span className="text-[9.5px] leading-normal">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left text-xs">
          {profile?.bankAccounts?.map((bank: any) => (
            <Card key={bank.id} className="glass relative overflow-hidden">
              <CardContent className="p-4 flex flex-col gap-3 justify-between h-full font-semibold text-muted-foreground">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-foreground font-black text-sm">{bank.bankName}</span>
                    <span className="text-[9.5px]">A/C: {bank.accountNumber}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {bank.id === profile.bankAccounts[0]?.id && (
                      <Badge className="bg-primary/20 text-primary border-none font-bold text-[8px] px-1 py-0 leading-none">Primary Account</Badge>
                    )}
                    <Badge variant="success" className="text-[8px] font-bold px-1 py-0 leading-none">Verified ✓</Badge>
                  </div>
                </div>
                <div className="border-t border-border/30 pt-2 flex flex-col gap-0.5 text-[10px]">
                  <span>Holder Name: {bank.accountHolderName || profile.ownerName}</span>
                  <span>IFSC Code: {bank.ifscCode || "IFSC000213"}</span>
                  <span className="text-emerald-500 font-bold mt-1">✓ Connected &amp; active</span>
                </div>
                <div className="flex gap-2 justify-end mt-1 border-t border-border/20 pt-2">
                  <Button size="sm" className="h-6 text-[9px] bg-secondary text-foreground hover:bg-secondary/80 border border-border">Edit</Button>
                  <Button size="sm" className="h-6 text-[9px] bg-secondary hover:bg-rose-500/10 text-rose-500 border border-rose-500/20">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'statements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-xs">
          {[
            { title: "Monthly Payout Statement", desc: "Consolidated breakdown of monthly withdrawals, processing fees, and bank transfers.", format: "PDF / Excel" },
            { title: "GST Commission Statement", desc: "Detailed tax ledger reporting inputs and commission GST tax returns.", format: "PDF" },
            { title: "QR Checkout Collections", desc: "Comprehensive registry of client scans, checkouts, and wallet-to-wallet items.", format: "Excel" },
            { title: "B2B Procurement Outlays", desc: "Consolidated ledger of PO orders, damaged units claims, and supplier receipts.", format: "Excel" }
          ].map((item, idx) => (
            <Card key={idx} className="glass">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground font-extrabold text-sm">{item.title}</span>
                  <span className="text-muted-foreground text-[10px] leading-relaxed">{item.desc}</span>
                  <span className="text-[9px] text-primary font-bold mt-1">Formats: {item.format}</span>
                </div>
                <Button onClick={() => triggerDownload(item.title)} className="h-8 text-xs font-bold bg-primary text-white ml-4 shrink-0">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default WalletPage;
