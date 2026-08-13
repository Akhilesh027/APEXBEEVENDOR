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

  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 8;

  const filteredItems = commissions.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'QR') return c.source === 'QR Payment';
    return c.source === activeTab;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = React.useMemo(() => {
    const start = (currentPageNum - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPageNum, itemsPerPage]);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-slate-100 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">
            Commission & Payout Center
          </h1>
          <p className="text-xs text-blue-300">
            Audit platform commission splits, review passive network overrides, and negotiate contract terms.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 p-5 rounded-2xl shadow-xl flex flex-col gap-1.5 text-left border-none">
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 font-heading">
            💰 Available (Released) Balance
          </span>
          <span className="text-2xl font-black text-white font-heading">₹{(stats.released || 0).toLocaleString('en-IN')}</span>
          <span className="text-xs text-emerald-300 font-extrabold">Ready for withdrawal</span>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl shadow-xl flex flex-col gap-1.5 text-left border-none">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 font-heading">
            ⏳ Pending Settlements
          </span>
          <span className="text-2xl font-black text-white font-heading">₹{(stats.pending || 0).toLocaleString('en-IN')}</span>
          <span className="text-xs text-amber-300 font-extrabold">Escrow / processing</span>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl shadow-xl flex flex-col gap-1.5 text-left border-none">
          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5 font-heading">
            💸 Total Lifetime Settlements
          </span>
          <span className="text-2xl font-black text-white font-heading">₹{(stats.settlements || 0).toLocaleString('en-IN')}</span>
          <span className="text-xs text-blue-300 font-extrabold">Total earnings processed</span>
        </div>
      </div>

      {/* High-Contrast Colored Tabs Container */}
      <div className="p-2 bg-slate-900/90 rounded-2xl shadow-xl flex flex-wrap gap-2 text-left">
        {[
          { id: 'all', label: 'All Commissions', icon: <Coins className="h-4 w-4" /> },
          { id: 'Product', label: 'Products Payouts', icon: <Percent className="h-4 w-4" /> },
          { id: 'Referral', label: 'Referrals Overrides', icon: <Award className="h-4 w-4" /> },
          { id: 'QR', label: 'QR Sales Flat Rate', icon: <QrCode className="h-4 w-4" /> },
          { id: 'Settlement', label: 'Settlement Fees', icon: <ArrowUpRight className="h-4 w-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setNegotiatingId(null);
              setClarifyingId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === tab.id
              ? 'bg-amber-400 text-blue-950 shadow-md scale-[1.02]'
              : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold'
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Full Width Commission Matrix Ledger */}
      <div className="w-full space-y-6">
        <div className="rounded-2xl bg-slate-900/90 p-6 shadow-xl space-y-4 text-left border-none">
          <div className="space-y-1 border-b border-blue-900/40 pb-3">
            <h3 className="text-lg font-extrabold text-white font-heading flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-400" /> Commission Matrix Ledger
            </h3>
            <p className="text-xs text-blue-300">Clear visibility of platform rates, flat fees, and net payouts</p>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-blue-900/40 text-blue-300">
                  <TableHead className="text-blue-300 font-extrabold">Reference Category</TableHead>
                  <TableHead className="text-blue-300 font-extrabold">Description Details</TableHead>
                  <TableHead className="text-right text-blue-300 font-extrabold">Transaction (₹)</TableHead>
                  <TableHead className="text-right text-blue-300 font-extrabold">Platform Rate</TableHead>
                  <TableHead className="text-right text-blue-300 font-extrabold">Charged (₹)</TableHead>
                  <TableHead className="text-right font-black text-amber-400">Vendor Net (₹)</TableHead>
                  <TableHead className="text-blue-300 font-extrabold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-blue-300">
                      No commission records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map(item => (
                    <React.Fragment key={item.id}>
                      <TableRow className="align-middle border-b border-slate-850 hover:bg-slate-850/50">
                        <TableCell>
                          <span className="px-2.5 py-1 rounded-full bg-slate-950 text-amber-300 font-black text-[10px]">
                            {item.source}
                          </span>
                        </TableCell>
                        <TableCell className="font-extrabold text-white">
                          <div>{item.details}</div>
                          <div className="text-[10px] text-blue-300 font-mono">ID: {item.id}</div>
                          {item.notes && (
                            <div className="text-[10px] text-amber-400 font-bold mt-0.5 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 shrink-0" /> {item.notes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-black text-white">
                          ₹{item.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-amber-400 font-black">
                          {item.rate}%
                        </TableCell>
                        <TableCell className="text-right text-rose-400 font-black">
                          -₹{item.commissionCharged.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-black text-emerald-400 font-heading text-base">
                          ₹{item.netEarnings.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                            item.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                            {item.status === 'Awaiting Vendor Approval' ? 'Awaiting Payout Sign' : item.status}
                          </span>
                        </TableCell>
                      </TableRow>

                      {/* Action buttons if awaiting vendor sign */}
                      {item.status === 'Awaiting Vendor Approval' && (
                        <TableRow className="bg-slate-950/80 border-b border-blue-900/40">
                          <TableCell colSpan={7}>
                            <div className="flex items-center justify-between p-2 pl-6 gap-4">
                              <span className="text-xs text-blue-300 font-semibold">
                                Please review and approve these commission terms.
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(item.id, 'Accept')}
                                  className="h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1 shadow-md rounded-xl"
                                >
                                  <Check className="h-3.5 w-3.5" /> Approve Terms
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setNegotiatingId(item.id);
                                    setClarifyingId(null);
                                  }}
                                  className="h-8 px-4 text-xs font-black cursor-pointer bg-amber-400 text-blue-950 hover:bg-amber-500 rounded-xl shadow-md"
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
                                  className="h-8 px-4 text-xs text-blue-300 hover:text-white cursor-pointer"
                                >
                                  Ask Clarification
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {filteredItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-blue-900/40 text-xs">
              <div className="text-blue-300 font-semibold">
                Showing <b className="text-white font-mono">{Math.min((currentPageNum - 1) * itemsPerPage + 1, filteredItems.length)}</b> to <b className="text-white font-mono">{Math.min(currentPageNum * itemsPerPage, filteredItems.length)}</b> of <b className="text-amber-400 font-mono">{filteredItems.length}</b> records
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  disabled={currentPageNum === 1}
                  onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-white font-black hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md transition-all"
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPageNum(page)}
                    className={`h-8 w-8 rounded-xl font-black transition-all cursor-pointer ${currentPageNum === page
                      ? 'bg-amber-400 text-blue-950 shadow-md scale-105'
                      : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPageNum === totalPages}
                  onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-white font-black hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Negotiate / Clarify Modals */}
        {negotiatingId && (
          <div className="rounded-2xl bg-slate-900/90 p-6 shadow-xl text-left space-y-4">
            <div className="space-y-1 border-b border-blue-900/40 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-heading">
                <RefreshCw className="h-4.5 w-4.5 text-amber-400 animate-spin" /> Negotiate Commission
              </h3>
              <p className="text-xs text-blue-300">
                For: {commissions.find(c => c.id === negotiatingId)?.details}
              </p>
            </div>
            <form onSubmit={(e) => handleNegotiateSubmit(e, negotiatingId)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-white">Proposed Commission Rate (%) *</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  min="1"
                  max="30"
                  placeholder="e.g. 9.5"
                  value={counterRate}
                  onChange={(e) => setCounterRate(e.target.value)}
                  className="rounded-xl px-4 py-2.5 text-xs bg-slate-950/80 text-white focus:ring-2 focus:ring-amber-400 focus:outline-none border-none font-bold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-white">Message / Rationale to Admin *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why this product warrants a lower commission..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="rounded-xl p-3 text-xs bg-slate-950/80 text-white focus:ring-2 focus:ring-amber-400 focus:outline-none border-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-xs rounded-xl cursor-pointer shadow-md">
                  Submit Counter
                </button>
                <button
                  type="button"
                  onClick={() => setNegotiatingId(null)}
                  className="px-4 py-2.5 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {clarifyingId && (
          <div className="rounded-2xl bg-slate-900/90 p-6 shadow-xl text-left space-y-4">
            <div className="space-y-1 border-b border-blue-900/40 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-heading">
                <MessageSquare className="h-4.5 w-4.5 text-blue-400" /> Request Clarification
              </h3>
              <p className="text-xs text-blue-300">
                For: {commissions.find(c => c.id === clarifyingId)?.details}
              </p>
            </div>
            <form onSubmit={(e) => handleClarifySubmit(e, clarifyingId)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-white">What details do you need clarified? *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your question for the ApexBee admin panel..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="rounded-xl p-3 text-xs bg-slate-950/80 text-white focus:ring-2 focus:ring-amber-400 focus:outline-none border-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs rounded-xl cursor-pointer shadow-md">
                  Send Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => setClarifyingId(null)}
                  className="px-4 py-2.5 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionCenter;
