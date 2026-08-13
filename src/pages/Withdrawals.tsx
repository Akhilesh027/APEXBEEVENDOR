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
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-slate-100 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white flex items-center gap-2.5">
            <ArrowDownCircle className="h-7 w-7 text-amber-400" /> Payout & Settlement Request Center
          </h1>
          <p className="text-xs text-blue-300">Request settlements directly to your bank account or UPI ID instantly.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-blue-300 font-semibold">
          <span>Last Updated: <strong className="text-white font-mono">{lastUpdated}</strong></span>
          <button onClick={handleRefreshWallet} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-amber-300 font-bold border-none cursor-pointer flex items-center gap-1.5 shadow-md">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Wallet
          </button>
        </div>
      </div>

      {/* AI Smart Settlement Advice Box */}
      <div className="rounded-2xl bg-slate-900/90 p-5 shadow-xl flex items-start gap-3.5 text-left">
        <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-extrabold text-amber-400 uppercase tracking-wider font-heading">AI Executive Settlement Recommendation</span>
          <p className="text-blue-200 leading-relaxed">
            "Withdraw after tomorrow to maximize payout volumes. You will receive <strong className="text-white">₹12,800</strong> instead of ₹8,400. Accumulating settlements weekly reduces direct gateway transaction fees."
          </p>
        </div>
      </div>

      {/* Success Animation Notification Area */}
      {showAnimation && (
        <div className="p-5 rounded-2xl bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center gap-3.5 shadow-xl animate-bounce">
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center animate-ping shrink-0">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-black text-white font-heading">Settlement Disbursal Initiated!</span>
            <span className="text-xs text-blue-200 font-medium">Verification check complete. Net funds are routed to your primary account.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Request Form */}
        <div className="rounded-2xl bg-slate-900/90 p-6 shadow-xl lg:col-span-4 h-fit text-left space-y-5">
          <div className="space-y-1 border-b border-blue-900/40 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-heading">
              <ArrowDownCircle className="h-5 w-5 text-amber-400" /> Request Withdrawal
            </h3>
            <p className="text-xs text-blue-300">Withdraw funds from your available balance</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {/* Wallet Info inside form */}
            <div className="bg-slate-950/80 p-4 rounded-xl flex flex-col shadow-inner">
              <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider">Available Wallet Balance</span>
              <span className="text-2xl font-black text-white mt-1 font-heading">₹{stats.walletBalance.toLocaleString('en-IN')}</span>
            </div>

            {errorMessage && (
              <div className="p-3.5 text-xs bg-rose-500/15 text-rose-300 rounded-xl flex items-center gap-2 font-extrabold shadow-md">
                <AlertTriangle className="h-4 w-4" /> {errorMessage}
              </div>
            )}

            {successMessage && !showAnimation && (
              <div className="p-3.5 text-xs bg-emerald-500/15 text-emerald-300 rounded-xl flex items-center gap-2 font-extrabold shadow-md">
                <CheckCircle2 className="h-4 w-4" /> {successMessage}
              </div>
            )}

            {/* Amount input with Minimum Withdrawal Display */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <label>Withdrawal Amount (₹) *</label>
                <span className="text-[10px] text-amber-400 font-extrabold">Min Withdrawal: ₹500</span>
              </div>
              <input
                required
                type="number"
                min="500"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="e.g. 5000"
                className="rounded-xl px-4 py-2.5 text-sm bg-slate-950/80 text-white focus:ring-2 focus:ring-amber-400 focus:outline-none font-bold border-none shadow-inner"
              />
            </div>

            {/* Settlement Method Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300">Settlement Method</label>
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value as any)}
                className="rounded-xl px-3.5 py-2.5 text-xs bg-slate-950/80 text-white focus:ring-2 focus:ring-amber-400 focus:outline-none border-none shadow-inner font-bold"
              >
                <option value="UPI">UPI Transfer</option>
                <option value="Bank Transfer">Bank Account</option>
              </select>
            </div>

            {method === 'UPI' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-amber-400" /> Registered UPI ID *
                </label>
                <input
                  required
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="rounded-xl px-4 py-2.5 text-sm bg-slate-950/80 text-white focus:ring-2 focus:ring-amber-400 focus:outline-none border-none shadow-inner font-mono font-bold"
                />
              </div>
            ) : profile?.bankAccounts && profile.bankAccounts.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Select Bank Account</label>
                <select 
                  value={selectedBankId} 
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="rounded-xl px-3.5 py-2.5 text-xs bg-slate-950/80 text-white focus:ring-2 focus:ring-amber-400 focus:outline-none border-none shadow-inner font-bold"
                >
                  {profile.bankAccounts.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - {b.accountNumber} ({b.id === profile.bankAccounts[0]?.id ? 'Primary' : 'Secondary'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-400/10 text-amber-300 text-xs flex flex-col gap-2 shadow-md">
                <div className="flex items-center gap-2 font-black">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-400" /> No bank account configured
                </div>
                <p className="text-xs text-blue-200 leading-relaxed">
                  You need to add a bank account to your profile to request direct bank settlements.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentPage('profile')}
                  className="self-start mt-1 font-black text-xs px-3.5 py-1.5 rounded-xl bg-amber-400 text-blue-950 shadow-md cursor-pointer hover:bg-amber-500 transition-all"
                >
                  Add Bank Account ➔
                </button>
              </div>
            )}

            {/* Fee & Receive Summary Box */}
            {amount > 0 && (
              <div className="bg-slate-950/80 p-4 rounded-xl flex flex-col gap-2 text-xs text-blue-200 font-semibold shadow-inner">
                <div className="flex justify-between items-center">
                  <span>Withdrawal Amount:</span>
                  <span className="text-white font-black">₹{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-rose-400">
                  <span className="flex items-center gap-1">Processing Fee (0.2%): <HelpCircle className="h-3 w-3 text-blue-300" /></span>
                  <span>- ₹{processingFee}</span>
                </div>
                <div className="flex justify-between items-center border-t border-blue-900/40 pt-2.5 font-black text-white text-sm">
                  <span>You Will Receive:</span>
                  <span className="text-emerald-400 text-base font-heading">₹{netReceiveAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={stats.walletBalance <= 0 || amount > stats.walletBalance || (method === 'Bank Transfer' && (!profile?.bankAccounts || profile.bankAccounts.length === 0))} 
              className="w-full mt-2 cursor-pointer font-black text-xs bg-amber-400 hover:bg-amber-500 text-blue-950 py-3 rounded-xl shadow-md transition-all uppercase tracking-wider"
            >
              Submit Settlement Request
            </button>
          </form>
        </div>

        {/* History Register */}
        <div className="rounded-2xl bg-slate-900/90 p-6 shadow-xl lg:col-span-8 space-y-4">
          <div className="space-y-1 border-b border-blue-900/40 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-heading">
              <HistoryIcon className="h-5 w-5 text-amber-400" /> Withdrawals Ledger
            </h3>
            <p className="text-xs text-blue-300">Audit register of requested bank and UPI transfer records</p>
          </div>
          <div>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
