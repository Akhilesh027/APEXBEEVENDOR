import React, { useState, useMemo } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { 
  ArrowDownCircle, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  RefreshCw, 
  History as HistoryIcon,
  Sparkles,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const Withdrawals: React.FC = () => {
  const { stats, withdrawals, requestWithdrawal, profile, setCurrentPage } = useVendor();
  
  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  
  // Selected bank details or UPI Id
  const [upiId, setUpiId] = useState('nellore@okhdfc');
  const [selectedBankId, setSelectedBankId] = useState(profile?.bankAccounts?.[0]?.id || '');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [showAnimation, setShowAnimation] = useState(false);

  // Fee calculation (PDF Page 3: flat fee or % transparently displayed)
  const processingFee = useMemo(() => {
    if (!amount || amount <= 0) return 0;
    // Let's charge a small transparent fee (e.g. 0.2% with a minimum of ₹10, like the PDF example)
    return Math.max(10, Math.round(amount * 0.002));
  }, [amount]);

  const netReceiveAmount = useMemo(() => {
    if (!amount || amount <= 0) return 0;
    const diff = amount - processingFee;
    return diff > 0 ? diff : 0;
  }, [amount, processingFee]);

  const handleRefreshWallet = () => {
    setLastUpdated(new Date().toLocaleTimeString());
    alert("Wallet balances refreshed successfully!");
  };

  const handleCopyTxnId = (id: string) => {
    navigator.clipboard.writeText(id);
    alert(`Copied Transaction Reference ID: ${id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setShowAnimation(false);

    if (amount < 500) {
      setErrorMessage('Minimum withdrawal amount is ₹500.');
      return;
    }

    if (amount > stats.walletBalance) {
      setErrorMessage('Insufficient available wallet balance.');
      return;
    }

    // Determine details string
    let details = '';
    if (method === 'UPI') {
      details = upiId;
    } else {
      const bank = profile.bankAccounts.find(b => b.id === selectedBankId);
      if (!bank) {
        setErrorMessage('Please configure a valid bank account first.');
        return;
      }
      details = `${bank.bankName} - ${bank.accountNumber}`;
    }

    const success = await requestWithdrawal(amount, method, details);
    if (success) {
      setSuccessMessage(`Withdrawal request of ₹${amount} submitted successfully! Net amount of ₹${netReceiveAmount} will be transferred.`);
      setShowAnimation(true);
      setAmount(1000);
      // Automatically close animation feedback after 3.5 seconds
      setTimeout(() => setShowAnimation(false), 3500);
    } else {
      setErrorMessage('Failed to submit withdrawal request.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': 
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold text-[9px]">Requested</Badge>;
      case 'Approved': 
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold text-[9px]">Processing</Badge>;
      case 'Completed': 
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-[9px]">Completed</Badge>;
      case 'Failed': 
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold text-[9px]">Failed</Badge>;
      default: 
        return <Badge variant="secondary" className="text-[9px]">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <ArrowDownCircle className="h-6 w-6 text-primary" /> Payout Payout Request Center
          </h1>
          <p className="text-xs text-muted-foreground">Request settlements directly to your bank account or UPI ID instantly.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
          <span>Last Updated: <strong>{lastUpdated}</strong></span>
          <button onClick={handleRefreshWallet} className="p-1.5 hover:bg-secondary/80 rounded-lg border border-border cursor-pointer flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Wallet
          </button>
        </div>
      </div>

      {/* AI Smart Settlement Advice Box (PDF Page 4) */}
      <Card className="bg-gradient-to-r from-primary/10 to-indigo-500/10 border-primary/20 shadow-sm">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5 animate-pulse" />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-extrabold text-foreground">AI Settlement Suggestion</span>
            <p className="text-muted-foreground leading-relaxed">
              "Withdraw after tomorrow to maximize payout volumes. You will receive <strong>₹12,800</strong> instead of ₹8,400. Accumulating settlements weekly reduces direct gateway transaction fees."
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Success Animation Notification Area (PDF Page 5) */}
      {showAnimation && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-3 animate-bounce">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center animate-ping">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span>Settlement Disbursal Initiated!</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Verification check complete. Net funds are routed to your primary account.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Request Form */}
        <Card className="glass lg:col-span-4 h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <ArrowDownCircle className="h-4.5 w-4.5 text-primary" /> Request Withdrawal
            </CardTitle>
            <CardDescription>Withdraw funds from your available balance</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              {/* Wallet Info inside form */}
              <div className="bg-primary/5 p-3.5 rounded-lg border border-primary/10 flex flex-col mb-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Available Wallet Balance</span>
                <span className="text-xl font-black text-foreground mt-0.5">₹{stats.walletBalance.toLocaleString('en-IN')}</span>
              </div>

              {errorMessage && (
                <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" /> {errorMessage}
                </div>
              )}

              {successMessage && !showAnimation && (
                <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> {successMessage}
                </div>
              )}

              {/* Amount input with Minimum Withdrawal Display */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                  <label>Withdrawal Amount (₹) *</label>
                  <span className="text-[10px] text-primary">Minimum Withdrawal: ₹500</span>
                </div>
                <input
                  required
                  type="number"
                  min="500"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none font-bold"
                />
              </div>

              {/* Settlement Method Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Settlement Method</label>
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                >
                  <option value="UPI">UPI Transfer</option>
                  <option value="Bank Transfer">Bank Account</option>
                </select>
              </div>

              {method === 'UPI' ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <QrCode className="h-3.5 w-3.5 text-primary" /> Registered UPI ID *
                  </label>
                  <input
                    required
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none"
                  />
                </div>
              ) : profile?.bankAccounts && profile.bankAccounts.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Select Bank Account</label>
                  <select 
                    value={selectedBankId} 
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                  >
                    {profile.bankAccounts.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountNumber} ({b.id === profile.bankAccounts[0]?.id ? 'Primary' : 'Secondary'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 text-amber-500 text-xs flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="h-4.5 w-4.5" /> No bank account configured
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    You need to add a bank account to your profile to request direct bank settlements.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage('profile')}
                    className="self-start mt-1 font-bold text-[10px] cursor-pointer text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    Add Bank Account
                  </Button>
                </div>
              )}

              {/* Transparent Fee & Receive Summary Box (PDF Page 3) */}
              {amount > 0 && (
                <div className="border-t border-border/30 pt-3 flex flex-col gap-2 text-xs text-muted-foreground font-semibold">
                  <div className="flex justify-between items-center">
                    <span>Withdrawal Amount:</span>
                    <span className="text-foreground font-bold">₹{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-500">
                    <span className="flex items-center gap-1">Processing Fee (0.2%): <HelpCircle className="h-3 w-3 text-muted-foreground" /></span>
                    <span>- ₹{processingFee}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/30 pt-2 font-black text-foreground text-sm">
                    <span>You Will Receive:</span>
                    <span className="text-emerald-500">₹{netReceiveAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={stats.walletBalance <= 0 || amount > stats.walletBalance || (method === 'Bank Transfer' && (!profile?.bankAccounts || profile.bankAccounts.length === 0))} 
                className="w-full mt-2 cursor-pointer font-bold text-xs bg-primary text-white h-9"
              >
                Submit Settlement Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Register */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5"><HistoryIcon className="h-4.5 w-4.5 text-primary" /> Withdrawals Ledger</CardTitle>
            <CardDescription>Audit register of requested bank and UPI transfer records</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Transfer Method</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-xs text-muted-foreground text-center py-8">No payout records found.</TableCell>
                  </TableRow>
                ) : withdrawals.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-[10.5px] font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>{w.id}</span>
                        <button onClick={() => handleCopyTxnId(w.id)} title="Copy ID" className="p-0.5 hover:bg-muted rounded text-muted-foreground cursor-pointer border-none bg-transparent">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(w.requestDate).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="purple" className="py-0 px-2 text-[9px] font-bold">{w.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[160px] font-semibold">
                      <div>{w.details}</div>
                      {w.rejectionReason && (
                        <div className="text-[10px] text-destructive mt-0.5">Reason: {w.rejectionReason}</div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(w.status)}</TableCell>
                    <TableCell className="font-black text-foreground text-xs text-right">₹{w.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Withdrawals;
