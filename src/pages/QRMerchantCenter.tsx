import React, { useState, useMemo } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { 
  QrCode, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  Share2, 
  Activity, 
  DollarSign
} from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

export const QRMerchantCenter: React.FC = () => {
  const { profile, transactions = [], requestWithdrawal, stats } = useVendor();
  const [success, setSuccess] = useState<string | null>(null);

  // Tabs
  const [qrTab, setQrTab] = useState<'store' | 'wallet-qr' | 'upi-qr' | 'dynamic-qr' | 'analytics'>('store');

  // Input states
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  
  // Wallet simulation modal states
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simAmount, setSimAmount] = useState('250');
  const [simMethod, setSimMethod] = useState<'wallet' | 'upi'>('wallet');

  // Withdrawal/Settlement states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const triggerAlert = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Simulate counter scanning payment
  const handleSimulatePayment = () => {
    const amt = parseFloat(simAmount) || 100;
    triggerAlert(`Simulating checkout! ₹${amt} successfully processed via ${simMethod === 'wallet' ? 'Apex Wallet' : 'UPI QR'}. Earnings credited to ledger.`);
    setShowSimulateModal(false);
  };

  // Trigger Settlement Request (Create withdrawal request in backend)
  const handleTriggerSettlement = async () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid settlement amount.");
      return;
    }

    try {
      const ok = await requestWithdrawal(amt, 'Bank Transfer', 'Settling counter QR collections to bank accounts');
      if (ok) {
        triggerAlert(`Instant settlement of ₹${amt} requested! Funds will credit within 15 minutes.`);
        setWithdrawAmount('');
        setShowWithdrawModal(false);
      } else {
        alert("Failed to submit settlement request.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Wallet collections calculated from transactions
  const walletCollections = useMemo(() => {
    const list = transactions.filter(t => t.description.toLowerCase().includes('qr') || t.description.toLowerCase().includes('upi') || t.description.toLowerCase().includes('wallet'));
    const total = list.reduce((sum, t) => sum + t.amount, 0);
    const balance = stats?.walletBalance || 38420;
    return { list, total, balance };
  }, [transactions, stats]);

  // Dynamically group wallet collections by date for analytics charts
  const salesChartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.amount > 0) {
        const d = new Date(t.date).toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit' }).replace('/', '-');
        dailyMap[d] = (dailyMap[d] || 0) + t.amount;
      }
    });

    const entries = Object.entries(dailyMap).map(([date, sales]) => ({ date, sales }));
    if (entries.length === 0) {
      return [
        { date: new Date().toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit' }).replace('/', '-'), sales: 0 }
      ];
    }
    return entries.sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" /> QR Merchant Payments &amp; Wallet Center
          </h1>
          <p className="text-xs text-muted-foreground">Manage physical counter QR codes, review wallet settlements, and trace scan checkouts.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSimulateModal(true)} className="h-9 text-xs font-bold bg-primary text-white cursor-pointer">Simulate Checkout Scan</Button>
          <Button onClick={() => setShowWithdrawModal(true)} className="h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">Request Settlement</Button>
        </div>
      </div>

      {success && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> {success}
        </div>
      )}

      {/* Wallet Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Today's collections</span>
            <span className="text-lg font-black text-foreground mt-1">₹12,400</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Escrow Wallet Balance</span>
            <span className="text-lg font-black text-primary mt-1">₹{walletCollections.balance.toLocaleString()}</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending Settlement</span>
            <span className="text-lg font-black text-foreground mt-1">₹8,490</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Wallet Transacts</span>
            <span className="text-lg font-black text-indigo-500 mt-1">{walletCollections.list.length} scans</span>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs Selection */}
      <div className="flex gap-2 border-b border-border/30 pb-2 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'store', label: 'Store Front QR' },
          { id: 'wallet-qr', label: 'Apex Wallet QR' },
          { id: 'upi-qr', label: 'UPI Standee QR' },
          { id: 'dynamic-qr', label: 'Generate Dynamic QR' },
          { id: 'analytics', label: 'QR Analytics' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setQrTab(tab.id as any)}
            className={`text-[10.5px] font-bold px-3 py-1 rounded cursor-pointer transition-colors whitespace-nowrap ${qrTab === tab.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Main Tabs view */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Store front QR tab */}
          {qrTab === 'store' && (
            <Card className="glass flex flex-col items-center justify-between text-center p-6 gap-4">
              <div className="flex flex-col gap-1 items-center">
                <span className="text-sm font-black text-foreground">{profile?.businessName || "My Store"}</span>
                <span className="text-[10px] text-muted-foreground">Retail counter standee QR terminal code</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-border/60 shadow-lg flex items-center justify-center">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://apexbee.in/store/default-id" 
                  alt="Store QR Code" 
                  className="h-44 w-44" 
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => triggerAlert("Downloading Store standee QR PDF...")} className="h-8 text-xs font-bold border-border flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Download QR</Button>
                <Button size="sm" onClick={() => triggerAlert("Printing counter QR...")} className="h-8 text-xs font-bold border-border flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Print QR</Button>
              </div>
            </Card>
          )}

          {/* Apex Wallet QR tab */}
          {qrTab === 'wallet-qr' && (
            <Card className="glass flex flex-col items-center justify-between text-center p-6 gap-4">
              <div className="flex flex-col gap-1 items-center">
                <span className="text-sm font-black text-primary">Apex Wallet VIP QR Code</span>
                <span className="text-[10px] text-muted-foreground">Scan with Apex Wallet app to receive cashback incentives</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border-4 border-primary shadow-lg flex items-center justify-center relative">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://apexbee.in/pay/wallet/default" 
                  alt="Apex Wallet QR" 
                  className="h-44 w-44" 
                />
                <div className="absolute inset-0 m-auto h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xs shadow">🐝</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => triggerAlert("Downloading Apex Wallet QR image...")} className="h-8 text-xs font-bold border-border flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Download QR</Button>
                <Button size="sm" onClick={() => triggerAlert("Sharing QR link...")} className="h-8 text-xs font-bold border-border flex items-center gap-1.5"><Share2 className="h-3.5 w-3.5" /> Share QR</Button>
              </div>
            </Card>
          )}

          {/* UPI Standee QR tab */}
          {qrTab === 'upi-qr' && (
            <Card className="glass flex flex-col items-center justify-between text-center p-6 gap-4">
              <div className="flex flex-col gap-1 items-center">
                <span className="text-sm font-black text-foreground">Standard UPI Payments standee QR</span>
                <span className="text-[10px] text-muted-foreground">Accept receipts from GPay, PhonePe, Paytm, and BHIM</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-border shadow-lg flex items-center justify-center">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=apexbee@sbi" 
                  alt="UPI QR Code" 
                  className="h-44 w-44" 
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => triggerAlert("Downloading UPI QR standee...")} className="h-8 text-xs font-bold border-border flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Download QR</Button>
              </div>
            </Card>
          )}

          {/* Dynamic QR tab */}
          {qrTab === 'dynamic-qr' && (
            <Card className="glass p-4 text-left flex flex-col gap-4">
              <span className="text-xs font-bold text-foreground">Generate Payment-Specific Counter QR</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="e.g. 450" 
                    className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Payment Description</label>
                  <input 
                    type="text" 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    placeholder="e.g. 5kg Basmati Rice" 
                    className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" 
                  />
                </div>
              </div>

              {amount && (
                <div className="flex flex-col items-center justify-center gap-3 bg-secondary/20 p-4 border border-border/60 rounded-xl mt-2 text-center">
                  <span className="text-[11px] font-bold text-foreground">Dynamic Payment QR for ₹{amount}</span>
                  <div className="p-2 bg-white rounded-xl shadow border border-border flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=apexbee@sbi%26am=${amount}%26tn=${encodeURIComponent(note)}`} 
                      alt="Dynamic UPI QR" 
                      className="h-32 w-32" 
                    />
                  </div>
                  <Button size="sm" onClick={() => triggerAlert("Dynamic QR printed for retail billing counter...")} className="h-8 text-xs font-bold border-border">Print Ticket QR</Button>
                </div>
              )}
            </Card>
          )}

          {/* Analytics tab */}
          {qrTab === 'analytics' && (
            <Card className="glass p-4 text-left">
              <span className="text-xs font-bold text-foreground">QR checkout revenue trends</span>
              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="qrColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false}/>
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false}/>
                    <Tooltip contentStyle={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                    <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#qrColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>

        {/* Transactions list */}
        <Card className="lg:col-span-5 glass h-fit">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Activity className="h-4.5 w-4.5 text-primary" /> Recent Wallet Receipts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {walletCollections.list.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No dynamic wallet receipts logged.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletCollections.list.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs font-semibold text-foreground">
                        <div>{t.id}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(t.date).toLocaleDateString('en-IN')}</div>
                      </TableCell>
                      <TableCell className={`text-right font-black ${t.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {t.amount < 0 ? "-" : "+"}₹{Math.abs(t.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.description.toLowerCase().includes('refund') ? 'outline' : 'success'}>
                          {t.description.toLowerCase().includes('withdrawal') ? "Settlement" : t.description.toLowerCase().includes('refund') ? "Refund" : "Scan Payment"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Simulator Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-sm w-full relative bg-background border border-border text-left">
            <button onClick={() => setShowSimulateModal(false)} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-secondary text-foreground cursor-pointer border-none">
              <RefreshCw className="h-4 w-4" />
            </button>
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Activity className="h-4.5 w-4.5 text-primary" /> Simulate scan payment</CardTitle>
              <CardDescription>Test dynamic database checkout receipts flow</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Checkout Amount (₹)</label>
                <input 
                  type="number" 
                  value={simAmount} 
                  onChange={(e) => setSimAmount(e.target.value)} 
                  className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" 
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Choose Payment Channel</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSimMethod('wallet')} 
                    className={`flex-1 p-2 border rounded-lg text-xs font-bold cursor-pointer ${simMethod === 'wallet' ? 'bg-primary/20 text-primary border-primary' : 'bg-background text-foreground border-border'}`}
                  >
                    Apex Wallet
                  </button>
                  <button 
                    onClick={() => setSimMethod('upi')} 
                    className={`flex-1 p-2 border rounded-lg text-xs font-bold cursor-pointer ${simMethod === 'upi' ? 'bg-primary/20 text-primary border-primary' : 'bg-background text-foreground border-border'}`}
                  >
                    UPI QR
                  </button>
                </div>
              </div>
              
              <Button onClick={handleSimulatePayment} className="w-full font-bold h-9 mt-2 text-xs bg-primary text-white cursor-pointer">Simulate Checkout Scan</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdrawal Settlement Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-sm w-full relative bg-background border border-border text-left">
            <button onClick={() => setShowWithdrawModal(false)} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-secondary text-foreground cursor-pointer border-none">
              <RefreshCw className="h-4 w-4" />
            </button>
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><DollarSign className="h-4.5 w-4.5 text-primary" /> Request Instant Payout Settlement</CardTitle>
              <CardDescription>Withdraw counter QR collections directly to bank account</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Amount to Settle (₹)</label>
                <input 
                  type="number" 
                  value={withdrawAmount} 
                  onChange={(e) => setWithdrawAmount(e.target.value)} 
                  placeholder="e.g. 5000"
                  className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" 
                />
              </div>
              <Button onClick={handleTriggerSettlement} className="w-full font-bold h-9 mt-2 text-xs bg-primary text-white cursor-pointer">Confirm Settlement Payout</Button>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default QRMerchantCenter;
