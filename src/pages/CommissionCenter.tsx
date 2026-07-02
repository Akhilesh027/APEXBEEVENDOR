import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Coins, Percent, Award, QrCode, ArrowUpRight, Check, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';

interface CommissionItem {
  id: string;
  source: 'Product' | 'Referral' | 'QR Payment' | 'Settlement';
  details: string;
  amount: number;
  rate: number; // percentage
  commissionCharged: number;
  netEarnings: number;
  status: 'Approved' | 'Pending Review' | 'Awaiting Vendor Approval' | 'Awaiting Reapproval' | 'Rejected';
  notes?: string;
}

export const CommissionCenter: React.FC = () => {
  const { products, respondToApprovalTerms, negotiateCommission, acceptCommission } = useVendor();
  const [activeTab, setActiveTab] = useState<'all' | 'Product' | 'Referral' | 'QR' | 'Settlement'>('all');
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null);
  const [counterRate, setCounterRate] = useState('');
  const [comment, setComment] = useState('');
  const [clarifyingId, setClarifyingId] = useState<string | null>(null);

  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  if (loading && false) console.log(loading);
  const [stats, setStats] = useState({ pending: 0, released: 0, settlements: 0 });

  React.useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user._id;
      const token = localStorage.getItem('token');
      if (!userId || !token) return;

      try {
        const res = await fetch(`https://server.apexbee.in/api/vendor/commissions/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setStats({
              pending: data.data.pending,
              released: data.data.released,
              settlements: data.data.settlements
            });
            const mapped = data.data.ledger.map((item: any) => ({
              id: item.id || item._id,
              source: 'Product' as const,
              details: item.productName || 'Product Lot',
              amount: item.amount,
              rate: 10,
              commissionCharged: Math.round(item.amount * 0.1),
              netEarnings: item.amount,
              status: item.status === 'Credited' ? 'Approved' as const : item.status === 'Cancelled' ? 'Rejected' as const : 'Pending Review' as const,
              notes: `Order: ${item.orderNumber} | SKU: ${item.sku}`
            }));
            setCommissions(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching vendor commissions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const handleAction = (id: string, action: 'Accept' | 'Reject') => {
    setCommissions(prev =>
      prev.map(c => {
        if (c.id === id) {
          if (c.source === 'Product') {
            // Also notify context
            const prod = products.find(p => p.name === c.details);
            if (prod) {
              if (action === 'Accept') acceptCommission(prod.id);
            }
          }
          return { ...c, status: action === 'Accept' ? 'Approved' : 'Rejected' };
        }
        return c;
      })
    );
  };

  const handleNegotiateSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!counterRate) return;

    setCommissions(prev =>
      prev.map(c => {
        if (c.id === id) {
          const rateVal = parseFloat(counterRate);
          const charged = Math.round(c.amount * (rateVal / 100));
          
          if (c.source === 'Product') {
            const prod = products.find(p => p.name === c.details);
            if (prod) {
              negotiateCommission(prod.id, rateVal, comment);
            }
          }

          return {
            ...c,
            rate: rateVal,
            commissionCharged: charged,
            netEarnings: c.amount - charged,
            status: 'Awaiting Reapproval',
            notes: `Negotiated: Proposed ${rateVal}%. Msg: ${comment}`
          };
        }
        return c;
      })
    );

    setNegotiatingId(null);
    setCounterRate('');
    setComment('');
  };

  const handleClarifySubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setCommissions(prev =>
      prev.map(c => {
        if (c.id === id) {
          if (c.source === 'Product') {
            const prod = products.find(p => p.name === c.details);
            if (prod) {
              respondToApprovalTerms(prod.id, 'Clarify', comment);
            }
          }
          return {
            ...c,
            status: 'Awaiting Reapproval',
            notes: `Clarification Request: ${comment}`
          };
        }
        return c;
      })
    );
    setClarifyingId(null);
    setComment('');
  };

  const filteredItems = commissions.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'QR') return c.source === 'QR Payment';
    return c.source === activeTab;
  });

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Commission & Payout Center</h1>
          <p className="text-xs text-muted-foreground">Audit platform commission splits, review passive network overrides, and negotiate contract terms.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4 flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">💰 Available (Released) Balance</span>
            <span className="text-xl font-extrabold text-foreground">₹{(stats.released || 0).toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-emerald-500 font-bold">Ready for withdrawal</span>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4 flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">⏳ Pending Settlements</span>
            <span className="text-xl font-extrabold text-foreground">₹{(stats.pending || 0).toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-amber-500 font-bold">Escrow / processing</span>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4 flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">💸 Total Lifetime Settlements</span>
            <span className="text-xl font-extrabold text-foreground">₹{(stats.settlements || 0).toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-indigo-500 font-bold">Total earnings processed</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: 'all', label: 'All Commissions', icon: <Coins className="h-3.5 w-3.5" /> },
          { id: 'Product', label: 'Products Payouts', icon: <Percent className="h-3.5 w-3.5" /> },
          { id: 'Referral', label: 'Referrals Overrides', icon: <Award className="h-3.5 w-3.5" /> },
          { id: 'QR', label: 'QR Sales Flat Rate', icon: <QrCode className="h-3.5 w-3.5" /> },
          { id: 'Settlement', label: 'Settlement Fees', icon: <ArrowUpRight className="h-3.5 w-3.5" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setNegotiatingId(null);
              setClarifyingId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main List */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Commission Matrix Ledger</CardTitle>
              <CardDescription>Clear visibility of platform rates, flat fees, and net payouts</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference Category</TableHead>
                    <TableHead>Description Details</TableHead>
                    <TableHead className="text-right">Transaction (₹)</TableHead>
                    <TableHead className="text-right">Platform Rate</TableHead>
                    <TableHead className="text-right">Charged (₹)</TableHead>
                    <TableHead className="text-right font-bold text-primary">Vendor Net (₹)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map(item => (
                    <React.Fragment key={item.id}>
                      <TableRow className="align-middle">
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {item.source}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          <div>{item.details}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">ID: {item.id}</div>
                          {item.notes && (
                            <div className="text-[9px] text-amber-500 font-semibold mt-0.5 flex items-center gap-0.5">
                              <AlertCircle className="h-3 w-3 shrink-0" /> {item.notes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{item.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-amber-500 font-bold">
                          {item.rate}%
                        </TableCell>
                        <TableCell className="text-right text-destructive font-semibold">
                          -₹{item.commissionCharged.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-black text-indigo-600 dark:text-indigo-400">
                          ₹{item.netEarnings.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === 'Approved' ? 'success' :
                              item.status === 'Rejected' ? 'destructive' : 'warning'
                            }
                            className="text-[10px]"
                          >
                            {item.status === 'Awaiting Vendor Approval' ? 'Awaiting Payout Sign' : item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>

                      {/* Action buttons if awaiting vendor sign */}
                      {item.status === 'Awaiting Vendor Approval' && (
                        <TableRow className="bg-primary/5 border-b border-border/40">
                          <TableCell colSpan={7}>
                            <div className="flex items-center justify-between p-1.5 pl-6 gap-4">
                              <span className="text-[11px] text-muted-foreground font-semibold">
                                Please review and approve these commission terms.
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(item.id, 'Accept')}
                                  className="h-7 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="h-3 w-3" /> Approve Terms
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setNegotiatingId(item.id);
                                    setClarifyingId(null);
                                  }}
                                  className="h-7 px-3 text-xs border-border font-semibold cursor-pointer"
                                >
                                  Negotiate
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setClarifyingId(item.id);
                                    setNegotiatingId(null);
                                  }}
                                  className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  Ask Clarification
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Action Widgets (Forms) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {negotiatingId && (
            <Card className="glass border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1">
                  <RefreshCw className="h-4.5 w-4.5 text-primary animate-spin" /> Negotiate Commission
                </CardTitle>
                <CardDescription>
                  For: {commissions.find(c => c.id === negotiatingId)?.details}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleNegotiateSubmit(e, negotiatingId)} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Proposed Commission Rate (%) *</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      min="1"
                      max="30"
                      placeholder="e.g. 9.5"
                      value={counterRate}
                      onChange={(e) => setCounterRate(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Message / Rationale to Admin *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain why this product warrants a lower commission (e.g. high volume, low margins)..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Button type="submit" className="flex-1 bg-primary text-white font-bold h-9 text-xs cursor-pointer">
                      Submit Counter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setNegotiatingId(null)}
                      className="h-9 px-3 text-xs border-border font-semibold cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {clarifyingId && (
            <Card className="glass border-indigo-500/20 bg-indigo-500/5">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1">
                  <MessageSquare className="h-4.5 w-4.5 text-indigo-500" /> Request Clarification
                </CardTitle>
                <CardDescription>
                  For: {commissions.find(c => c.id === clarifyingId)?.details}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleClarifySubmit(e, clarifyingId)} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">What details do you need clarified? *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Type your question for the ApexBee admin panel..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-9 text-xs cursor-pointer">
                      Send Inquiry
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setClarifyingId(null)}
                      className="h-9 px-3 text-xs border-border font-semibold cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold">ApexBee Commission Rules</CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-muted-foreground leading-relaxed flex flex-col gap-2">
              <p>
                Platform fee covers logistics tracking, unified payment gateways, cloud hosting, and referral campaign operations.
              </p>
              <p>
                Bidding items are subject to mutual agreements and review checks by the Category Leads.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommissionCenter;
