import React, { useState, useMemo } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { 
  Boxes, 
  Search, 
  FileCheck, 
  FileText, 
  Calendar, 
  Download, 
  CheckCircle, 
  Truck, 
  X
} from 'lucide-react';

export const ProcurementHub: React.FC = () => {
  const { products = [], b2bPos = [], updateB2bPo, profile } = useVendor();
  const [searchQuery, setSearchQuery] = useState('');
  
  // GRN states
  const [selectedGrnPo, setSelectedGrnPo] = useState<any | null>(null);
  const [acceptedUnits, setAcceptedUnits] = useState('');
  const [damagedUnits, setDamagedUnits] = useState('0');
  const [grnNotes, setGrnNotes] = useState('');
  const [savingGrn, setSavingGrn] = useState(false);

  // Command Center Stats
  const stats = useMemo(() => {
    const totalPos = b2bPos.length;
    const inTransit = b2bPos.filter(po => po.status === 'Dispatched').length;
    const pendingPurchases = b2bPos.filter(po => po.status === 'Draft').length;
    
    // Low stock count
    const lowStockAlerts = products.filter(p => p.status === 'Approved' && p.stock <= 10).length;
    
    // Outstanding payments
    const outstandingPayments = b2bPos
      .filter(po => po.status !== 'Delivered')
      .reduce((sum, po) => sum + po.totalAmount, 0);

    // Savings calculated as 30% margin off retail
    const totalSpend = b2bPos.reduce((sum, po) => sum + po.totalAmount, 0);
    const savings = Math.round(totalSpend * 0.3);

    return { totalPos, inTransit, pendingPurchases, lowStockAlerts, outstandingPayments, savings };
  }, [b2bPos, products]);

  const isWholesaler = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user?.roles?.includes('wholesaler') || user?.roles?.includes('manufacturer') || profile?.businessType === 'Wholesaler' || profile?.businessType === 'Manufacturer';
    } catch (e) {
      return false;
    }
  }, [profile]);

  const filteredPos = useMemo(() => {
    return b2bPos.filter(po => {
      const buyerName = po.vendorId?.sellerProfile?.businessName || po.vendorId?.name || "";
      const supplierName = po.supplierName || "";
      return po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [b2bPos, searchQuery]);

  const handleDispatchOrder = async (poId: string) => {
    try {
      const ok = await updateB2bPo(poId, { status: 'Dispatched' });
      if (ok) {
        alert("B2B Purchase Order status updated to Dispatched! Vendor has been notified of transit dispatch.");
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenGrn = (po: any) => {
    setSelectedGrnPo(po);
    // Suggest accepted units equal to total requested units by default
    const totalQty = po.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setAcceptedUnits(String(totalQty));
    setDamagedUnits('0');
    setGrnNotes('');
  };

  const handleSubmitGrn = async () => {
    if (!selectedGrnPo) return;
    setSavingGrn(true);
    try {
      const accepted = Number(acceptedUnits) || 0;
      const damaged = Number(damagedUnits) || 0;
      const status = damaged > 0 ? 'Partial Received' : 'Delivered';

      const ok = await updateB2bPo(selectedGrnPo._id, {
        status,
        goodsReceived: {
          acceptedUnits: accepted,
          damagedUnits: damaged,
          notes: grnNotes
        }
      });

      if (ok) {
        alert(`Goods Receiving Note logged successfully! PO status changed to ${status}. Inventory quantities restocked.`);
        setSelectedGrnPo(null);
      } else {
        alert("Failed to submit GRN.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGrn(false);
    }
  };

  const triggerMockDownload = (poNumber: string) => {
    alert(`Downloading B2B Supplier Invoice for ${poNumber} in PDF format...`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" /> {isWholesaler ? "Wholesaler Order Fulfillment Desk" : "Procurement Hub & GRN Center"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isWholesaler 
              ? "Manage incoming vendor purchase orders, update shipping dispatches, and review quality feedback."
              : "Manage purchase orders, confirm incoming dispatches, audit quality control, and download invoices."}
          </p>
        </div>
      </div>

      {/* Command Center Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending POs</span>
            <span className="text-lg font-black text-foreground mt-1">{stats.pendingPurchases} Drafts</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">In Transit</span>
            <span className="text-lg font-black text-foreground mt-1">{stats.inTransit} Ships</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Today's Receipts</span>
            <span className="text-lg font-black text-foreground mt-1">
              {b2bPos.filter(po => po.status === 'Delivered').length} Received
            </span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{isWholesaler ? "My Catalog Items" : "Low Stock Alerts"}</span>
            <span className="text-lg font-black text-amber-500 mt-1">
              {isWholesaler ? `${products.length} Items` : `${stats.lowStockAlerts} items`}
            </span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{isWholesaler ? "Fulfillment Revenue" : "Outstanding"}</span>
            <span className="text-lg font-black text-primary mt-1">₹{stats.outstandingPayments.toLocaleString()}</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{isWholesaler ? "Sales Volume" : "Saved Profit"}</span>
            <span className="text-lg font-black text-emerald-500 mt-1">₹{stats.savings.toLocaleString()}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* POs list */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="glass">
            <CardHeader className="pb-3 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Truck className="h-4.5 w-4.5 text-primary" /> Purchase Order Ledger</CardTitle>
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by PO Number or Supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-secondary/40 border border-border/80 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredPos.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No purchase orders found in the database.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Details</TableHead>
                      <TableHead>{isWholesaler ? "Buyer (Vendor)" : "Supplier"}</TableHead>
                      <TableHead className="text-right">Total Price</TableHead>
                      <TableHead>Expected Date</TableHead>
                      <TableHead>Fulfillment Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPos.map(po => {
                      const buyerName = po.vendorId?.sellerProfile?.businessName || po.vendorId?.name || "Retail Buyer Store";
                      return (
                        <TableRow key={po._id}>
                          <TableCell className="font-extrabold text-foreground">{po.poNumber}</TableCell>
                          <TableCell className="text-xs font-semibold text-foreground">
                            {isWholesaler ? buyerName : po.supplierName}
                          </TableCell>
                          <TableCell className="text-right font-black text-primary">₹{po.totalAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(po.expectedDelivery).toLocaleDateString('en-IN')}</TableCell>
                          <TableCell>
                            <Badge variant={po.status === 'Delivered' ? 'success' : po.status === 'Partial Received' ? 'warning' : 'secondary'}>
                              {po.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {isWholesaler ? (
                              po.status === 'Draft' ? (
                                <Button 
                                  onClick={() => handleDispatchOrder(po._id)}
                                  size="sm" 
                                  className="h-7 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                                >
                                  Dispatch Order
                                </Button>
                              ) : po.status === 'Dispatched' ? (
                                <span className="text-[10px] text-indigo-500 font-bold flex items-center justify-end gap-1"><Truck className="h-3.5 w-3.5" /> Dispatched</span>
                              ) : (
                                <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1"><CheckCircle className="h-3.5 w-3.5" /> Fulfilled</span>
                              )
                            ) : (
                              po.status === 'Dispatched' ? (
                                <Button 
                                  onClick={() => handleOpenGrn(po)}
                                  size="sm" 
                                  className="h-7 text-[10px] font-bold bg-primary text-white cursor-pointer"
                                >
                                  Verify GRN
                                </Button>
                              ) : po.status === 'Delivered' || po.status === 'Partial Received' ? (
                                <div className="flex gap-1.5 justify-end items-center">
                                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Checked</span>
                                  <Button 
                                    onClick={() => alert(`Reordering items for ${po.poNumber} again...`)}
                                    size="sm" 
                                    className="h-6 text-[9px] font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                                  >
                                    Buy Again
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Awaiting Dispatch</span>
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar widgets */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Invoice center */}
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><FileText className="h-4.5 w-4.5 text-primary" /> Invoice Center</CardTitle>
              <CardDescription>Export binding digital invoices for store auditing</CardDescription>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-2.5">
              {b2bPos.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No dispatches to generate invoices.</p>
              ) : b2bPos.map(po => (
                <div key={po._id} className="p-2.5 bg-secondary/30 rounded-xl border border-border/50 flex justify-between items-center text-xs">
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="font-bold text-foreground">{po.poNumber}</span>
                    <span className="text-[10px] text-muted-foreground">₹{po.totalAmount.toLocaleString()} • {po.supplierName}</span>
                  </div>
                  <Button 
                    onClick={() => triggerMockDownload(po.poNumber)}
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 border-border flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Calendar Grid */}
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Calendar className="h-4.5 w-4.5 text-primary" /> Procurement Calendar Grid</CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-2">
              <span className="text-[10px] text-muted-foreground font-semibold">Weekly scheduled wholesale dispatches &amp; deliveries:</span>
              <div className="grid grid-cols-5 gap-1.5 text-center text-[9px] font-black uppercase mt-1 border-b border-border/45 pb-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                  <div key={day} className="text-muted-foreground">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-left mt-1 text-[9px] font-semibold text-muted-foreground">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => {
                  // Filter POs scheduled on this day of the week
                  const dayPos = b2bPos.filter((po) => {
                    const poDay = new Date(po.expectedDelivery).getDay(); // Sunday=0, Monday=1, ... Saturday=6
                    // Map Sunday/Saturday to Monday/Friday for grid fit
                    const mappedDay = poDay === 0 ? 1 : poDay === 6 ? 5 : poDay;
                    return mappedDay === (idx + 1);
                  });
                  return (
                    <div key={day} className="p-1 bg-secondary/15 rounded-lg border border-border/40 flex flex-col gap-1 min-h-[70px]">
                      {dayPos.length === 0 ? (
                        <span className="text-[8px] text-muted-foreground/40 italic mt-0.5 text-center">Idle</span>
                      ) : (
                        dayPos.map(po => (
                          <div key={po._id} className="bg-primary/10 p-1 rounded border border-primary/20 text-foreground flex flex-col leading-none">
                            <span className="font-extrabold text-primary text-[8px]">{po.poNumber}</span>
                            <span className="text-[7.5px] truncate mt-0.5 text-foreground/80">{po.supplierName}</span>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* GRN Verification Form Modal */}
      {selectedGrnPo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full relative bg-background border border-border text-left">
            <button onClick={() => setSelectedGrnPo(null)} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-secondary text-foreground cursor-pointer border-none">
              <X className="h-4 w-4" />
            </button>
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1"><FileCheck className="h-4.5 w-4.5 text-primary" /> Goods Receiving Note (GRN)</CardTitle>
              <CardDescription>Log physical inspection details to restock inventory parameters.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-foreground">{selectedGrnPo.poNumber}</span>
                <span className="text-muted-foreground font-semibold">{selectedGrnPo.supplierName}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Accepted Units *</label>
                  <input 
                    type="number" 
                    value={acceptedUnits} 
                    onChange={(e) => setAcceptedUnits(e.target.value)} 
                    className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Damaged/Rejected Units *</label>
                  <input 
                    type="number" 
                    value={damagedUnits} 
                    onChange={(e) => setDamagedUnits(e.target.value)} 
                    className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Inspection Notes / Comments</label>
                <textarea 
                  rows={3} 
                  placeholder="e.g. 2 cartons of milk had leakages and were rejected..."
                  value={grnNotes} 
                  onChange={(e) => setGrnNotes(e.target.value)} 
                  className="border border-border/85 rounded-lg p-2 text-xs bg-background text-foreground focus:outline-none" 
                />
              </div>

              <Button 
                disabled={savingGrn}
                onClick={handleSubmitGrn} 
                className="w-full font-bold h-9 mt-2 text-xs bg-primary text-white cursor-pointer"
              >
                {savingGrn ? "Logging GRN..." : "Confirm Goods Receipt"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default ProcurementHub;
