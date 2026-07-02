import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { QrCode, Download, RefreshCw, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import { useVendor } from '../context/VendorContext';

export const QRManagement: React.FC = () => {
  const { profile, transactions } = useVendor();
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter QR UPI transactions
  const qrTxns = transactions.filter(t => t.description.toLowerCase().includes('qr') || t.description.toLowerCase().includes('upi'));

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

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">QR Code & UPI Payments</h1>
          <p className="text-xs text-muted-foreground">Manage your physical counter QR codes, generate custom payment links, and track scanned receipts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* UPI QR Code Display Card */}
        <Card className="glass lg:col-span-5 flex flex-col justify-between text-left">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <QrCode className="h-4.5 w-4.5 text-primary" /> Active Counter QR
            </CardTitle>
            <CardDescription>Scan to pay directly via any UPI app (GPay, PhonePe, Paytm)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 relative">
              {/* Dummy QR Code using an SVG mock representation */}
              <svg className="w-44 h-44 text-slate-800" viewBox="0 0 100 100">
                <rect width="25" height="25" fill="currentColor" />
                <rect x="75" width="25" height="25" fill="currentColor" />
                <rect y="75" width="25" height="25" fill="currentColor" />
                <rect x="25" y="25" width="10" height="10" fill="currentColor" />
                <rect x="55" y="45" width="20" height="20" fill="currentColor" />
                <rect x="35" y="65" width="15" height="15" fill="currentColor" />
                <rect x="65" y="75" width="15" height="15" fill="currentColor" />
                {/* Outer bounds */}
                <rect x="6" y="6" width="13" height="13" fill="white" />
                <rect x="81" y="6" width="13" height="13" fill="white" />
                <rect x="6" y="81" width="13" height="13" fill="white" />
                {/* Inner markers */}
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
              <span className="text-[10px] text-muted-foreground font-mono">UPI VPA: {profile.ownerName.toLowerCase().replace(/\s+/g, '')}@apexbee</span>
            </div>

            <div className="flex gap-2 w-full mt-2">
              <Button size="sm" variant="secondary" className="flex-1 text-[10px] cursor-pointer flex items-center justify-center gap-1.5">
                <Download className="h-3 w-3" /> Download PDF
              </Button>
              <Button size="sm" variant="secondary" className="flex-1 text-[10px] cursor-pointer flex items-center justify-center gap-1.5">
                <RefreshCw className="h-3 w-3" /> Regenerate VPA
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Payment Link Generator & Simulator */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="glass text-left">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Smartphone className="h-4.5 w-4.5 text-primary" /> Simulate Customer QR Scan
              </CardTitle>
              <CardDescription>Create dynamic payouts and trigger simulated instant UPI credits</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {successMsg && (
                <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
                  <CheckCircle className="h-4 w-4 animate-bounce" /> {successMsg}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 499"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Reference/Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Counter Checkout Table 3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  />
                </div>
              </div>

              <Button
                onClick={handleSimulatePayment}
                className="w-full mt-2 cursor-pointer bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white font-bold h-9 shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Trigger QR Scan Simulation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Scanned Payout Transactions Log */}
          <Card>
            <CardHeader className="pb-3 text-left">
              <CardTitle className="text-sm font-bold">Recent QR Scans Ledger</CardTitle>
              <CardDescription>Instant UPI credit entries verified on network</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border/80 text-muted-foreground font-bold bg-muted/20">
                      <th className="py-2 px-4">Transaction ID</th>
                      <th className="py-2 px-4">Timestamp</th>
                      <th className="py-2 px-4">Status</th>
                      <th className="py-2 px-4 text-right">Amount Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrTxns.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-muted-foreground">
                          No recent scanned payments found. Use the scanner simulator above to add.
                        </td>
                      </tr>
                    ) : (
                      qrTxns.map((t, idx) => (
                        <tr key={idx} className="border-b border-border/40 hover:bg-muted/10 font-medium text-foreground/80">
                          <td className="py-2.5 px-4 font-mono font-bold text-foreground">{t.id}</td>
                          <td className="py-2.5 px-4 text-[10px] text-muted-foreground">{new Date(t.date).toLocaleString()}</td>
                          <td className="py-2.5 px-4">
                            <Badge variant={t.status === 'Completed' ? 'success' : 'warning'} className="text-[9px] py-0 px-1.5 font-bold">
                              {t.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-right text-emerald-500 font-bold">₹{t.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
