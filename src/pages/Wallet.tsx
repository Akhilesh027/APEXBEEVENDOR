import React from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  Sparkles, 
  QrCode, 
  Clock, 
  FileCheck,
  TrendingUp
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { transactions, stats, withdrawals } = useVendor();

  // Cumulative lifetime earnings (base baseline + credit transactions)
  const lifetimeEarnings = 192620;

  const getTxnTypeBadge = (type: string) => {
    switch (type) {
      case 'Order Earning':
        return (
          <Badge variant="success" className="flex items-center gap-1 py-0 px-2 text-[10px]">
            <ArrowUpCircle className="h-3 w-3" /> Credit
          </Badge>
        );
      case 'Referral Bonus':
        return (
          <Badge variant="purple" className="flex items-center gap-1 py-0 px-2 text-[10px]">
            <Sparkles className="h-3 w-3" /> Bonus
          </Badge>
        );
      case 'Refund Deduction':
        return (
          <Badge variant="destructive" className="flex items-center gap-1 py-0 px-2 text-[10px]">
            <ArrowDownCircle className="h-3 w-3" /> Refund
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1 py-0 px-2 text-[10px]">
            <ArrowDownCircle className="h-3 w-3" /> Debit
          </Badge>
        );
    }
  };

  // Status mapping helper for timeline
  const getTimelineStepIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 2;
      case 'Approved': return 3;
      case 'Completed': return 4;
      default: return 1;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary animate-pulse" /> Wallet splits & Payout settlements
          </h1>
          <p className="text-xs text-muted-foreground">Track pending earnings, inspect order payout commission, and view transaction history.</p>
        </div>
      </div>

      {/* Lifetime Earnings Split Dashboard */}
      <div className="flex flex-col gap-2 text-left">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Earnings Splits & Wallet Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Available Wallet */}
          <Card className="bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg lg:col-span-1">
            <CardContent className="p-4 flex flex-col gap-1 text-left relative overflow-hidden h-full justify-between">
              <div className="absolute right-1 -bottom-2 opacity-15">
                <Wallet className="h-20 w-20" />
              </div>
              <span className="text-[10px] text-white/90 uppercase font-bold tracking-wider">Available Balance</span>
              <span className="text-xl font-black mt-1">₹{stats.walletBalance.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-white/85 font-semibold pt-1 border-t border-white/20 mt-1">Ready for Bank Transfer</span>
            </CardContent>
          </Card>

          {/* 2. Pending Escrow */}
          <Card className="glass">
            <CardContent className="p-4 flex flex-col gap-1 text-left justify-between h-full">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-500" /> Pending Escrow
              </span>
              <span className="text-xl font-extrabold mt-1 text-foreground">₹{stats.pendingEarnings.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-muted-foreground pt-1 border-t border-border/40 mt-1">Settles upon Delivery</span>
            </CardContent>
          </Card>

          {/* 3. Referral Bonus */}
          <Card className="glass">
            <CardContent className="p-4 flex flex-col gap-1 text-left justify-between h-full">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-500" /> Referral Earnings
              </span>
              <span className="text-xl font-extrabold mt-1 text-foreground">₹4,000</span>
              <span className="text-[9px] text-muted-foreground pt-1 border-t border-border/40 mt-1">Supplier Network bonus</span>
            </CardContent>
          </Card>

          {/* 4. QR UPI Sales */}
          <Card className="glass">
            <CardContent className="p-4 flex flex-col gap-1 text-left justify-between h-full">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                <QrCode className="h-3 w-3 text-sky-500" /> QR UPI Sales
              </span>
              <span className="text-xl font-extrabold mt-1 text-foreground">₹18,450</span>
              <span className="text-[9px] text-muted-foreground pt-1 border-t border-border/40 mt-1">Direct store sales</span>
            </CardContent>
          </Card>

          {/* 5. Lifetime Earnings */}
          <Card className="glass bg-primary/5 border border-primary/20">
            <CardContent className="p-4 flex flex-col gap-1 text-left justify-between h-full">
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-primary" /> Lifetime Cumulative
              </span>
              <span className="text-xl font-black mt-1 text-primary">₹{lifetimeEarnings.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-primary/80 font-bold pt-1 border-t border-primary/20 mt-1">Total revenue override</span>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Settlements Timeline Ledger */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="glass h-full text-left">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <FileCheck className="h-5 w-5 text-primary" /> Settlements Timeline
              </CardTitle>
              <CardDescription>Visual progress of payout transfers into your bank account</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 pt-2">
              {withdrawals.length > 0 ? (
                withdrawals.slice(0, 2).map((wth) => {
                  const step = getTimelineStepIndex(wth.status);
                  return (
                    <div key={wth.id} className="p-3.5 bg-secondary/15 border border-border/60 rounded-xl flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-foreground">Settlement ID: {wth.id}</span>
                        <span className="text-primary">₹{wth.amount.toLocaleString()}</span>
                      </div>

                      {/* Visual Stepper Timeline */}
                      <div className="flex justify-between items-center relative py-1">
                        <div className="absolute left-0 right-0 h-1 bg-muted top-[13px] z-0" />
                        <div 
                          className="absolute left-0 h-1 bg-emerald-500 top-[13px] z-0 transition-all duration-500" 
                          style={{ width: `${((step - 1) / 3) * 100}%` }}
                        />

                        {/* Node 1: Initiated */}
                        <div className="flex flex-col items-center z-10 gap-1 text-[9px] font-bold text-muted-foreground">
                          <span className={`h-6 w-6 rounded-full flex items-center justify-center font-black ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>1</span>
                          <span>Initiated</span>
                        </div>
                        {/* Node 2: Reviewed */}
                        <div className="flex flex-col items-center z-10 gap-1 text-[9px] font-bold text-muted-foreground">
                          <span className={`h-6 w-6 rounded-full flex items-center justify-center font-black ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>2</span>
                          <span>In Review</span>
                        </div>
                        {/* Node 3: Approved */}
                        <div className="flex flex-col items-center z-10 gap-1 text-[9px] font-bold text-muted-foreground">
                          <span className={`h-6 w-6 rounded-full flex items-center justify-center font-black ${step >= 3 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>3</span>
                          <span>Approved</span>
                        </div>
                        {/* Node 4: Paid */}
                        <div className="flex flex-col items-center z-10 gap-1 text-[9px] font-bold text-muted-foreground">
                          <span className={`h-6 w-6 rounded-full flex items-center justify-center font-black ${step >= 4 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>4</span>
                          <span>Settled</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-bold text-muted-foreground text-center border-t border-border/30 pt-2 mt-1">
                        Status: <span className="text-foreground">{wth.status === 'Completed' ? 'Successfully transferred to bank' : wth.status === 'Pending' ? 'Awaiting bank clearance (2-4 hours)' : wth.status}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-muted-foreground text-xs italic">
                  No payout settlements initiated yet. Use "Withdrawal Requests" to process payouts.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction Ledger List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="glass">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2 text-left">
                <History className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base font-bold">Transaction History Ledger</CardTitle>
                  <CardDescription>Ledger logs of product earnings, commissions, and withdrawals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="border-none rounded-none shadow-none">
                  <TableHeader className="bg-transparent border-b border-border/40">
                    <TableRow>
                      <TableHead>Reference ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Activity Details</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Net Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs font-bold text-foreground">{t.referenceId}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs leading-normal font-medium text-left">
                          {t.description}
                        </TableCell>
                        <TableCell>{getTxnTypeBadge(t.type)}</TableCell>
                        <TableCell>
                          <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Pending' ? 'warning' : 'destructive'} className="py-0">
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-extrabold text-xs text-right ${t.amount < 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                          {t.amount > 0 ? '+' : ''}₹{t.amount.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
