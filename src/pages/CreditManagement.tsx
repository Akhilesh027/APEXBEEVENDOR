import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CreditCard, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useVendor } from '../context/VendorContext';

export const CreditManagement: React.FC = () => {
  const { creditAccounts } = useVendor();
  const [success, setSuccess] = useState<string | null>(null);
  const [limitRequested, setLimitRequested] = useState('');
  const [duration, setDuration] = useState('30 days');

  const handleRequestCredit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(`Credit extension request for ₹${parseFloat(limitRequested).toLocaleString()} submitted to finance review!`);
    setLimitRequested('');
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Credit Management</h1>
          <p className="text-xs text-muted-foreground">Monitor client outstanding balances, invoice collections calendars, and submit credit limit extensions.</p>
        </div>
      </div>

      {success && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold text-left">
          <CheckCircle2 className="h-4 w-4" /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Credit Limits & Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-left">
          <Card className="glass h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <CreditCard className="h-4.5 w-4.5 text-primary" /> Active Credit Limit
              </CardTitle>
              <CardDescription>Overall credit line assigned by ApexBee finance</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-foreground">₹10,00,000</span>
                <span className="text-xs text-muted-foreground">₹2,30,000 utilized</span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div style={{ width: '23%' }} className="bg-primary h-full rounded-full" />
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">Available Credit Balance: ₹7,70,000</span>
            </CardContent>
          </Card>

          {/* Credit Request Form */}
          <Card className="glass h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <CreditCard className="h-4.5 w-4.5 text-primary" /> Request Credit Extension
              </CardTitle>
              <CardDescription>Submit applications to extend credit limits</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestCredit} className="flex flex-col gap-3 text-left">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Amount Requested (₹) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 200000"
                    value={limitRequested}
                    onChange={(e) => setLimitRequested(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Repayment Duration *</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  >
                    <option value="30 days">30 Days Cycle</option>
                    <option value="60 days">60 Days Cycle</option>
                    <option value="90 days">90 Days Cycle</option>
                  </select>
                </div>
                <Button type="submit" className="w-full mt-2 cursor-pointer bg-primary text-white font-bold h-9">
                  Request Extension
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Client Ledger table */}
        <Card className="lg:col-span-8 text-left">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-primary" /> Clients Credit Accounts
            </CardTitle>
            <CardDescription>Monitor outstanding collections and invoice delays</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-bold bg-muted/20">
                    <th className="py-2.5 px-4">Partner Client</th>
                    <th className="py-2.5 px-4">Credit Limit</th>
                    <th className="py-2.5 px-4">Outstanding Bal</th>
                    <th className="py-2.5 px-4 text-center">Days Overdue</th>
                    <th className="py-2.5 px-4">Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {creditAccounts.map((acc, idx) => (
                    <tr key={idx} className="border-b border-border/40 hover:bg-muted/10 font-semibold text-foreground/85">
                      <td className="py-3 px-4 flex flex-col gap-0.5">
                        <span className="font-bold text-foreground">{acc.partnerName}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">ID: {acc.partnerId}</span>
                      </td>
                      <td className="py-3 px-4 text-foreground">₹{acc.creditLimit.toLocaleString()}</td>
                      <td className="py-3 px-4 text-primary">₹{acc.outstandingAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        {acc.daysOverdue > 0 ? (
                          <span className="text-red-500 font-extrabold flex items-center justify-center gap-0.5">
                            <AlertTriangle className="h-3.5 w-3.5" /> {acc.daysOverdue} days
                          </span>
                        ) : (
                          <span className="text-emerald-500 font-bold">0 days</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            acc.status === 'Excellent' || acc.status === 'Good'
                              ? 'success'
                              : 'destructive'
                          }
                          className="text-[9px] font-bold"
                        >
                          {acc.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
