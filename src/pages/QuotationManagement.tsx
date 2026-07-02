import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FileSpreadsheet, CheckCircle2, ArrowRight, MessageSquare } from 'lucide-react';
import { useVendor } from '../context/VendorContext';

export const QuotationManagement: React.FC = () => {
  const { rfqs, respondToRFQ } = useVendor();
  const [selectedRfq, setSelectedRfq] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState<string>('');
  const [success, setSuccess] = useState<string | null>(null);

  const handleAction = (rfqId: string, action: 'Accept' | 'Reject' | 'Counter') => {
    if (action === 'Counter' && !counterPrice.trim()) {
      alert("Please specify a counter offer price.");
      return;
    }
    const numPrice = action === 'Counter' ? parseFloat(counterPrice) : undefined;
    respondToRFQ(rfqId, action, numPrice);
    setSuccess(`Successfully responded to ${rfqId} with ${action.toUpperCase()}`);
    setCounterPrice('');
    setSelectedRfq(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const getRfqStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted': return <Badge variant="success">Approved</Badge>;
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'Counter Offered': return <Badge variant="warning">Counter Offered</Badge>;
      default: return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Quotation Management</h1>
          <p className="text-xs text-muted-foreground">Manage Requests for Quotes (RFQs), submit counter offers, and track approved wholesaling orders.</p>
        </div>
      </div>

      {success && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold text-left">
          <CheckCircle2 className="h-4 w-4" /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RFQ Database Table */}
        <Card className="lg:col-span-8 text-left">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <FileSpreadsheet className="h-4.5 w-4.5 text-primary" /> Active RFQ Sheet
            </CardTitle>
            <CardDescription>Review quotation demands submitted by downstream vendors</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-bold bg-muted/20">
                    <th className="py-2.5 px-4">RFQ ID</th>
                    <th className="py-2.5 px-4">Product Requested</th>
                    <th className="py-2.5 px-4 text-center">Quantity</th>
                    <th className="py-2.5 px-4">Target Unit Price</th>
                    <th className="py-2.5 px-4">Offered Price</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq, idx) => (
                    <tr key={idx} className="border-b border-border/40 hover:bg-muted/10 font-semibold text-foreground/80">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">{rfq.id}</td>
                      <td className="py-3 px-4 flex flex-col">
                        <span>{rfq.productName}</span>
                        <span className="text-[9px] text-muted-foreground">SKU: {rfq.sku}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-foreground">{rfq.qtyRequested} units</td>
                      <td className="py-3 px-4 text-primary">₹{rfq.targetPrice}</td>
                      <td className="py-3 px-4 text-emerald-500">
                        {rfq.wholesalerOffer ? `₹${rfq.wholesalerOffer}` : '—'}
                      </td>
                      <td className="py-3 px-4">{getRfqStatusBadge(rfq.status)}</td>
                      <td className="py-3 px-4 text-center">
                        {rfq.status === 'Pending' || rfq.status === 'Counter Offered' ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleAction(rfq.id, 'Accept')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 h-7 text-[10px] cursor-pointer"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedRfq(rfq.id)}
                              className="p-1 h-7 text-[10px] cursor-pointer"
                            >
                              Counter
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAction(rfq.id, 'Reject')}
                              className="p-1 h-7 text-[10px] cursor-pointer"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Counter Offer Drawer/Card */}
        <Card className="glass lg:col-span-4 h-fit text-left">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <MessageSquare className="h-4.5 w-4.5 text-primary" /> Propose Counter Quotation
            </CardTitle>
            <CardDescription>Negotiate pricing and MOQ requirements for pending RFQs</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {selectedRfq ? (
              <div className="flex flex-col gap-3.5">
                <div className="p-2 border border-border bg-muted/20 rounded-lg text-xs leading-normal">
                  <span className="font-bold block text-foreground">Negotiating: {selectedRfq}</span>
                  <span className="text-[10px] text-muted-foreground">Target price submitted: ₹{rfqs.find(r => r.id === selectedRfq)?.targetPrice}/unit</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Counter Offer Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 1250"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAction(selectedRfq, 'Counter')}
                    className="flex-1 cursor-pointer bg-primary text-white font-bold h-9 flex items-center justify-center gap-1"
                  >
                    <span>Submit Counter</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => { setSelectedRfq(null); setCounterPrice(''); }}
                    className="cursor-pointer h-9"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground leading-normal">
                Select a pending RFQ from the table to propose a counter quotation.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
