import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { ArrowDownCircle, AlertTriangle, CheckCircle2, QrCode } from 'lucide-react';

export const Withdrawals: React.FC = () => {
  const { stats, withdrawals, requestWithdrawal, profile, setCurrentPage } = useVendor();
  
  const [amount, setAmount] = useState<number>(5000);
  const [method, setMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  
  // Selected bank details or UPI Id
  const [upiId, setUpiId] = useState('rajeshkumar@okhdfc');
  const [selectedBankId, setSelectedBankId] = useState(profile.bankAccounts[0]?.id || '');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (amount <= 0) {
      setErrorMessage('Withdrawal amount must be greater than zero.');
      return;
    }

    if (amount > stats.walletBalance) {
      setErrorMessage('Insufficient wallet balance.');
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
      setSuccessMessage(`Withdrawal request of ₹${amount} submitted successfully.`);
      setAmount(0);
    } else {
      setErrorMessage('Failed to submit withdrawal request.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge variant="warning">Awaiting Transfer</Badge>;
      case 'Approved': return <Badge variant="info">Approved / Transferring</Badge>;
      case 'Completed': return <Badge variant="success">Completed</Badge>;
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Withdrawal Requests</h1>
          <p className="text-xs text-muted-foreground">Request settlements directly to your bank account or UPI ID instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <Card className="glass lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <ArrowDownCircle className="h-5 w-5 text-primary" /> Request Withdrawal
            </CardTitle>
            <CardDescription>Withdraw funds from your available balance</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              {/* Wallet Info inside form */}
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 flex flex-col mb-1.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Available Wallet Balance</span>
                <span className="text-xl font-extrabold text-foreground">₹{stats.walletBalance.toLocaleString('en-IN')}</span>
              </div>

              {errorMessage && (
                <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" /> {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> {successMessage}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Withdrawal Amount (₹) *</label>
                <input
                  required
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none font-bold"
                />
              </div>

              <Select
                label="Settlement Method"
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                options={[
                  { value: 'UPI', label: 'UPI Transfer' },
                  { value: 'Bank Transfer', label: 'Bank Transfer' }
                ]}
              />

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
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  />
                </div>
              ) : profile.bankAccounts.length > 0 ? (
                <Select
                  label="Select Bank Account"
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  options={profile.bankAccounts.map(b => ({
                    value: b.id,
                    label: `${b.bankName} - ${b.accountNumber} (${b.accountType})`
                  }))}
                />
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

              <Button 
                type="submit" 
                disabled={stats.walletBalance <= 0 || amount > stats.walletBalance || (method === 'Bank Transfer' && profile.bankAccounts.length === 0)} 
                className="w-full mt-2 cursor-pointer"
              >
                Submit Settlement Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Register */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Withdrawals Ledger</CardTitle>
            <CardDescription>Audit register of requested transfers</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="border-none rounded-none shadow-none">
              <TableHeader className="bg-transparent border-b border-border/40">
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Transfer method</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">{w.id}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(w.requestDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="purple" className="py-0">{w.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                      <div>{w.details}</div>
                      {w.rejectionReason && (
                        <div className="text-[10px] text-destructive mt-0.5">Reason: {w.rejectionReason}</div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(w.status)}</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">₹{w.amount.toLocaleString('en-IN')}</TableCell>
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
