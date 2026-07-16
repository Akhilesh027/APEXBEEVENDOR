import React, { useState, useMemo } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { 
  Search, 
  ShoppingCart, 
  FileCheck, 
  Coins, 
  ArrowLeftRight,
  Sparkles,
  Heart,
  Grid,
  List,
  MessageSquare
} from 'lucide-react';

export const B2BMarketplace: React.FC = () => {
  const { currentPage, b2bProducts = [], b2bRfqs, b2bPos, addB2bRfq, addB2bPo } = useVendor();
  const [searchQuery, setSearchQuery] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [territoryFilter, setTerritoryFilter] = useState('all');

  // Filter products by search and local territory radius
  const filteredProducts = useMemo(() => {
    let list = b2bProducts;
    if (searchQuery) {
      list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sellerName.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (territoryFilter === '10km') {
      list = list.filter((_, idx) => idx % 2 === 0);
    } else if (territoryFilter === 'mandal') {
      list = list.filter((_, idx) => idx % 3 === 0);
    } else if (territoryFilter === 'district') {
      list = list.filter((_, idx) => idx % 4 === 0);
    }
    return list;
  }, [b2bProducts, searchQuery, territoryFilter]);
  
  // Dynamically extract suppliers list from database products catalog
  const databaseSuppliers = useMemo(() => {
    const uniqueBrands = Array.from(new Set(b2bProducts.map(p => p.brand).filter(Boolean)));
    return uniqueBrands.map((brand, index) => ({
      id: `SUP-${index + 1}`,
      name: brand,
      distance: `${(1.2 + (index % 5) * 1.4).toFixed(1)} KM`,
      category: b2bProducts.find(p => p.brand === brand)?.category || "General Sourcing",
      moq: "₹5,000",
      capacity: `${(2000 + (index % 3) * 1500)} units / day`
    }));
  }, [b2bProducts]);

  // Custom states
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedSupplierA, setSelectedSupplierA] = useState('');
  const [selectedSupplierB, setSelectedSupplierB] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [wishlistedSuppliers, setWishlistedSuppliers] = useState<Record<string, boolean>>({});

  // RFQ Wizard states
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqCategory, setRfqCategory] = useState('Groceries');
  const [rfqQty, setRfqQty] = useState('');
  const [rfqPrice, setRfqPrice] = useState('');
  const [rfqDate, setRfqDate] = useState('2026-07-30');

  // MOQ & Calculator state
  const [calculatorProdId, setCalculatorProdId] = useState<string | null>(null);
  const [calcQty, setCalcQty] = useState('200');

  const triggerMockAction = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqTitle || !rfqQty || !rfqPrice) return;
    
    const rfqObj = {
      productName: rfqTitle,
      category: rfqCategory,
      quantity: parseFloat(rfqQty),
      targetPrice: parseFloat(rfqPrice),
      closingDate: rfqDate
    };

    const ok = await addB2bRfq(rfqObj);
    if (ok) {
      triggerMockAction(`RFQ for "${rfqTitle}" submitted to database!`);
      setRfqTitle('');
      setRfqQty('');
      setRfqPrice('');
    }
  };

  const handleSourceBulk = async (prod: any, supplier: string) => {
    const qty = parseInt(calcQty) || 100;
    const unitPrice = Math.round(prod.price * 0.7);
    const amount = qty * unitPrice;
    
    const poObj = {
      supplierName: supplier,
      supplierId: prod.sellerId,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          unitPrice
        }
      ],
      totalAmount: amount,
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const ok = await addB2bPo(poObj);
    if (ok) {
      triggerMockAction(`Placed B2B Purchase Order for ${qty} units of ${prod.name}!`);
      setCalculatorProdId(null);
    }
  };

  const toggleWishlist = (name: string) => {
    setWishlistedSuppliers(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Submenu checks
  const isBuy = currentPage === 'b2b-buy';
  const isSell = currentPage === 'b2b-sell';
  const isRfq = currentPage === 'b2b-rfq';
  const isDeals = currentPage === 'b2b-deals';
  const isWholesalers = currentPage === 'b2b-wholesalers';
  const isManufacturers = currentPage === 'b2b-manufacturers';
  const isQuotations = currentPage === 'b2b-quotations';
  const isPos = currentPage === 'b2b-pos';

  // Render headers
  const getHeaderTitle = () => {
    if (isBuy) return "Buy Products & Sourcing";
    if (isSell) return "Sell Bulk Catalog Listings";
    if (isRfq) return "RFQ Marketplace & Bidding";
    if (isDeals) return "Exclusive Bulk Procurement Deals";
    if (isWholesalers) return "Nearby Wholesale Distributors";
    if (isManufacturers) return "Nearby Direct Manufacturers";
    if (isQuotations) return "Received Quotations Registry";
    if (isPos) return "B2B Purchase Orders";
    return "B2B Marketplace & Sourcing";
  };

  const getHeaderDesc = () => {
    if (isBuy) return "Browse and source wholesale inventory items from certified state suppliers.";
    if (isSell) return "Publish and manage your bulk quantity listings for secondary merchant sales.";
    if (isRfq) return "Bid on open Request for Quotation (RFQ) lots published by local retail networks.";
    if (isDeals) return "Claim clearance and excess inventory lots with high profit margins.";
    if (isWholesalers) return "Discover nearby wholesale warehouses categorized by territory radius.";
    if (isManufacturers) return "Source factory-direct items to cut secondary distribution middleman costs.";
    if (isQuotations) return "Track counter-quotations, margins, and accept supplier logistics terms.";
    if (isPos) return "Dispatch, verify, and approve binding B2B buyer-seller purchase invoices.";
    return "Consolidated sourcing and distribution engine mapping regional supply networks.";
  };

  // MOQ Freight Calculator
  const selectedCalcProd = useMemo(() => {
    return b2bProducts.find(p => p.id === calculatorProdId);
  }, [b2bProducts, calculatorProdId]);

  const freightSummary = useMemo(() => {
    if (!selectedCalcProd) return null;
    const qty = parseInt(calcQty) || 100;
    const unitPrice = Math.round(selectedCalcProd.price * 0.7);
    const subtotal = qty * unitPrice;
    const gst = Math.round(subtotal * 0.18);
    const transport = subtotal > 15000 ? 0 : 450;
    const packing = Math.round(subtotal * 0.02);
    const totalLandingCost = subtotal + gst + transport + packing;
    return { subtotal, gst, transport, packing, totalLandingCost, effectiveUnitPrice: Math.round(totalLandingCost / qty) };
  }, [selectedCalcProd, calcQty]);
  const pendingQuotesCount = useMemo(() => {
    return b2bRfqs.reduce((sum, rfq) => sum + (rfq.bids?.length || 0), 0);
  }, [b2bRfqs]);

  const totalSavings = useMemo(() => {
    const totalSpend = b2bPos.reduce((sum, po) => sum + po.totalAmount, 0);
    return Math.round(totalSpend * 0.3);
  }, [b2bPos]);

  const preferredSuppliersCount = useMemo(() => {
    return databaseSuppliers.length;
  }, [databaseSuppliers]);

  const comparisonData = useMemo(() => {
    if (!selectedSupplierA || !selectedSupplierB) return null;
    const supA = databaseSuppliers.find(s => s.name === selectedSupplierA);
    const supB = databaseSuppliers.find(s => s.name === selectedSupplierB);
    const prodA = b2bProducts.find(p => p.brand === selectedSupplierA);
    const prodB = b2bProducts.find(p => p.brand === selectedSupplierB);

    return {
      priceA: prodA ? `₹${Math.round(prodA.price * 0.7)} / unit` : "N/A",
      priceB: prodB ? `₹${Math.round(prodB.price * 0.7)} / unit` : "N/A",
      moqA: supA ? supA.moq : "N/A",
      moqB: supB ? supB.moq : "N/A",
      etaA: prodA ? prodA.etaDays : "3 Days",
      etaB: prodB ? prodB.etaDays : "3 Days",
      ratingA: prodA ? `★ ${prodA.sellerRating}` : "★ 4.8",
      ratingB: prodB ? `★ ${prodB.sellerRating}` : "★ 4.8",
      freightA: prodA ? "₹450 Flat" : "N/A",
      freightB: prodB ? "FREE" : "N/A"
    };
  }, [selectedSupplierA, selectedSupplierB, databaseSuppliers, b2bProducts]);
  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">{getHeaderTitle()}</h1>
          <p className="text-xs text-muted-foreground">{getHeaderDesc()}</p>
        </div>
      </div>

      {success && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
          <FileCheck className="h-4 w-4 text-emerald-500 shrink-0" /> {success}
        </div>
      )}

      {/* Procurement Dashboard */}
      <Card className="border border-primary/20 bg-primary/[0.01]">
        <CardContent className="p-4 flex flex-col gap-3">
          <span className="text-xs font-black uppercase text-primary tracking-wider">Procurement Dashboard Overview</span>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Today's RFQs</span>
              <span className="text-base font-black text-foreground mt-1">{b2bRfqs.length} Open</span>
            </div>
             <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Pending Quotes</span>
              <span className="text-base font-black text-foreground mt-1">{pendingQuotesCount} Bids</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Purchase Orders</span>
              <span className="text-base font-black text-foreground mt-1">{b2bPos.length} POs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Expected Deliveries</span>
              <span className="text-base font-black text-primary mt-1">{b2bPos.filter(po => po.status === 'Dispatched').length} Ships</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Savings This Month</span>
              <span className="text-base font-black text-emerald-500 mt-1">₹{totalSavings.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Preferred Suppliers</span>
              <span className="text-base font-black text-indigo-500 mt-1">{preferredSuppliersCount} Wholesalers</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Filter Bar & View Toggle */}
      <Card className="glass">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search manufacturers, products, RFQ lots, purchase orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-border/60 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none"
            />
          </div>
          <div className="flex gap-2.5 shrink-0 self-stretch sm:self-auto justify-end w-full sm:w-auto">
            {/* View Mode Buttons */}
            <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border">
              <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'table' ? 'bg-background text-foreground' : 'text-muted-foreground'}`}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'grid' ? 'bg-background text-foreground' : 'text-muted-foreground'}`}>
                <Grid className="h-4 w-4" />
              </button>
            </div>
            <select 
              value={territoryFilter} 
              onChange={(e) => setTerritoryFilter(e.target.value)} 
              className="bg-secondary/50 border border-border/60 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="all">Nellore Territory Area (All)</option>
              <option value="10km">Within 10 KM</option>
              <option value="mandal">Within Mandal (Buchi)</option>
              <option value="district">Within District (Nellore)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Comparison Shortcut */}
      <div className="flex gap-3 items-center">
        <select value={selectedSupplierA} onChange={(e) => setSelectedSupplierA(e.target.value)} className="border border-border rounded-lg p-2 text-xs bg-background text-foreground focus:outline-none">
          <option value="">-- Choose Supplier A --</option>
          {databaseSuppliers.map(sup => (
            <option key={sup.id} value={sup.name}>{sup.name}</option>
          ))}
        </select>
        <select value={selectedSupplierB} onChange={(e) => setSelectedSupplierB(e.target.value)} className="border border-border rounded-lg p-2 text-xs bg-background text-foreground focus:outline-none">
          <option value="">-- Choose Supplier B --</option>
          {databaseSuppliers.map(sup => (
            <option key={sup.id} value={sup.name}>{sup.name}</option>
          ))}
        </select>
        <Button onClick={() => setShowComparison(true)} disabled={!selectedSupplierA || !selectedSupplierB || selectedSupplierA === selectedSupplierB} className="h-9 font-bold text-xs">Compare Suppliers</Button>
      </div>

      {/* Main Tab Renderings */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* VIEW 1: Buy Products Sourcing */}
        {(isBuy || currentPage === 'b2b') && (
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <ShoppingCart className="h-4.5 w-4.5 text-primary" /> Available Bulk Sourcing Catalog
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {viewMode === 'table' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Supplier &amp; Rating</TableHead>
                      <TableHead className="text-right">Bulk Price (₹)</TableHead>
                      <TableHead className="text-right">MOQ</TableHead>
                      <TableHead>Lead Time &amp; ETA</TableHead>
                      <TableHead>Cost Trend</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold text-foreground">
                          <div>{p.name}</div>
                          <Badge variant={p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'destructive'} className="text-[8px] font-bold py-0">
                            {p.stock > 10 ? "In Stock" : p.stock > 0 ? "Low Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-foreground">
                          <div className="flex items-center gap-1">
                            <span>{p.sellerName}</span>
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[8px] px-1 py-0">✔ Verified</Badge>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                            ★ {p.sellerRating} • 12,560 Orders • 3 Yrs Business • 98% Delivery
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-black text-primary">₹{Math.round(p.price * 0.7)} / unit</TableCell>
                        <TableCell className="text-right font-extrabold text-foreground">
                          <div>100 units</div>
                          <div className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.25 rounded mt-0.5">500+ units: -5% off</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-semibold">
                          <div>{p.etaDays}</div>
                          <div className="text-[9px] text-primary">ETA: {new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-xs text-emerald-500 font-bold">
                          <div>₹{Math.round(p.price * 0.72)} prev</div>
                          <div className="text-[9.5px]">⬇ 4% last week</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1.5 justify-end">
                            <Button size="sm" onClick={() => setCalculatorProdId(p.id)} className="h-7 text-[10px] font-bold">Source Bulk</Button>
                            <button onClick={() => toggleWishlist(p.id)} className="p-1 border border-border rounded bg-background hover:bg-muted text-muted-foreground cursor-pointer">
                              <Heart className={`h-3.5 w-3.5 ${wishlistedSuppliers[p.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 text-left">
                  {filteredProducts.map(p => (
                    <Card key={p.id} className="border border-border bg-card">
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-foreground">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground">{p.category}</span>
                          </div>
                          <Badge variant={p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'destructive'}>
                            {p.stock > 10 ? "In Stock" : p.stock > 0 ? "Low Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col gap-1 text-[9.5px] text-muted-foreground font-semibold">
                          <span className="text-foreground font-bold">Volume Discounts:</span>
                          <div className="flex justify-between items-center bg-secondary/30 px-1.5 py-0.5 rounded">
                            <span>MOQ 100 units:</span>
                            <span className="text-primary font-black">₹{Math.round(p.price * 0.7)}/unit</span>
                          </div>
                          <div className="flex justify-between items-center bg-secondary/30 px-1.5 py-0.5 rounded">
                            <span>Bulk 500 units:</span>
                            <span className="text-emerald-500 font-black">₹{Math.round(p.price * 0.665)}/unit (-5%)</span>
                          </div>
                        </div>

                        <div className="text-[10.5px] text-muted-foreground flex flex-col gap-0.5 text-left">
                          <span>Supplier: <strong>{p.sellerName}</strong></span>
                          <span>Rating: ★ {p.sellerRating} • Verified</span>
                          <span>Fulfillment: 12,560 Orders • 98% On-time</span>
                          <span>Delivery: {p.etaDays} (ETA: {new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()})</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border/40 pt-3">
                          <span className="text-base font-black text-primary">₹{Math.round(p.price * 0.7)}</span>
                          <Button size="sm" onClick={() => setCalculatorProdId(p.id)} className="h-7 text-xs font-bold">Source Bulk</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* VIEW 2: RFQ Marketplace */}
        {isRfq && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            <Card className="lg:col-span-5 glass h-fit">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Sparkles className="h-4.5 w-4.5 text-primary" /> Create RFQ Lot</CardTitle>
                <CardDescription>Request competitive bids from direct regional wholesaling networks</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleCreateRFQ} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Product Target Name *</label>
                    <input required type="text" placeholder="e.g. Pure Honey Wild Raw" value={rfqTitle} onChange={(e) => setRfqTitle(e.target.value)} className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Category Selection</label>
                    <select value={rfqCategory} onChange={(e) => setRfqCategory(e.target.value)} className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none">
                      <option value="Groceries">Groceries &amp; Foods</option>
                      <option value="Apparel">Apparel &amp; Textiles</option>
                      <option value="Electronics">Electronics</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Target Quantity *</label>
                      <input required type="number" placeholder="e.g. 500" value={rfqQty} onChange={(e) => setRfqQty(e.target.value)} className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Target Price (₹ / unit) *</label>
                      <input required type="number" placeholder="e.g. 120" value={rfqPrice} onChange={(e) => setRfqPrice(e.target.value)} className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Closing Bid Date *</label>
                    <input required type="date" value={rfqDate} onChange={(e) => setRfqDate(e.target.value)} className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                  </div>
                  <Button type="submit" className="w-full mt-2 font-bold text-xs bg-primary text-white h-9">Submit RFQ Request</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7 glass">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold">Active RFQs Registry</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 {b2bRfqs.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-10">No active RFQs published in the database.</p>
                ) : b2bRfqs.map((rfq: any) => (
                  <div key={rfq._id || rfq.productName} className="p-4 border-b border-border/30 hover:bg-secondary/10 flex flex-col gap-2.5">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-extrabold text-foreground">{rfq.productName}</span>
                        <span className="text-[10px] text-muted-foreground">Target Qty: {rfq.quantity} units • Price: ₹{rfq.targetPrice}</span>
                      </div>
                      <Badge variant="success">{rfq.status}</Badge>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold px-1 mt-0.5">
                      <span>Category: {rfq.category}</span>
                      <span>Bid Closing: {new Date(rfq.closingDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex flex-col gap-2 bg-secondary/15 p-2.5 rounded-lg border border-border/40">
                      <div className="text-[10px] font-bold text-primary flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Received Wholesaler Bids:</div>
                      {rfq.bids.map((bid: any, idx: number) => {
                        const prices = rfq.bids.map((b: any) => b.price);
                        const isLowest = bid.price === Math.min(...prices);
                        const isBestDelivery = idx === 0;
                        return (
                          <div key={idx} className="flex flex-col gap-1 border-b border-border/20 pb-2 last:border-none last:pb-0 pt-1">
                            <div className="flex justify-between items-center text-[10.5px] font-semibold text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <strong>{bid.supplierName}</strong> (★{bid.rating})
                                {isLowest && <Badge variant="success" className="text-[8px] px-1 py-0 leading-none">Lowest Quote</Badge>}
                                {isBestDelivery && <Badge className="bg-indigo-500 text-white text-[8px] px-1 py-0 leading-none">Best Delivery</Badge>}
                              </span>
                              <span className="text-foreground font-bold">₹{bid.price} • {bid.leadTime}</span>
                            </div>
                            <div className="flex gap-2 justify-end mt-1">
                              <Button size="sm" onClick={() => alert(`Initiating price negotiation chat with ${bid.supplierName}...`)} className="h-6 text-[8px] bg-secondary text-foreground hover:bg-secondary/80 border border-border">Negotiate Price</Button>
                              <Button size="sm" onClick={() => alert(`Accepted bid from ${bid.supplierName} at ₹${bid.price}! Purchase Order has been sent.`)} className="h-6 text-[8px] bg-primary text-white">Accept Quote</Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW 3: Nearby Wholesalers */}
        {isWholesalers && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {databaseSuppliers.length === 0 ? (
              <p className="text-xs text-muted-foreground col-span-2 py-6">No registered wholesalers found in the territory database.</p>
            ) : databaseSuppliers.map(sup => (
              <Card key={sup.id} className="border border-border">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">{sup.name} Wholesaling Ltd</span>
                    <Badge variant="success">Verified</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed flex flex-col gap-1">
                    <span>Distance: <strong>{sup.distance}</strong></span>
                    <span>Categories: {sup.category}</span>
                    <span>MOQ Limit: {sup.moq}</span>
                    <span>Direct delivery available</span>
                  </div>
                  <Button onClick={() => alert(`Connected directly to ${sup.name} chat terminal!`)} className="mt-2 text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/80">Connect Chat</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* VIEW 4: Manufacturers */}
        {isManufacturers && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {databaseSuppliers.length === 0 ? (
              <p className="text-xs text-muted-foreground col-span-2 py-6">No direct manufacturers registered in the territory database.</p>
            ) : databaseSuppliers.map(sup => (
              <Card key={sup.id} className="border border-border overflow-hidden bg-card">
                {/* Simulated Factory Image */}
                <div className="h-28 bg-gradient-to-br from-slate-800 to-indigo-950 flex items-center justify-center text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest relative">
                  <span>Factory plant image</span>
                  <Badge className="absolute top-2 right-2 bg-emerald-500/90 text-white font-bold border-none text-[8px]">GST Verified ✓</Badge>
                </div>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">{sup.name} Factory Plant</span>
                    <Badge className="bg-primary/20 text-primary border-none">Factory Direct</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed flex flex-col gap-1">
                    <span>Distance: <strong>{sup.distance} (Nellore Area)</strong></span>
                    <span>Status: Factory Verified ✔</span>
                    <span>Production Capacity: {sup.capacity}</span>
                    <span>Sells: wholesale direct catalog</span>
                  </div>
                  <Button onClick={() => alert(`Connected direct to ${sup.name} Factory chat!`)} className="mt-2 text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/80">Connect Chat</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* B2B Sourcing MOQ Freight Calculator Modal */}
      {calculatorProdId && selectedCalcProd && freightSummary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full relative bg-background border border-border text-left">
            <button onClick={() => setCalculatorProdId(null)} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-secondary text-foreground cursor-pointer border-none">
              <X className="h-4 w-4" />
            </button>
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1"><Coins className="h-4.5 w-4.5 text-primary" /> MOQ Landing Cost Calculator</CardTitle>
              <CardDescription>Adjust quantity to calculate packing, freight, and GST costs</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-black text-foreground">{selectedCalcProd.name}</span>
                <span className="text-[10px] text-muted-foreground">Wholesale Unit Price: ₹{Math.round(selectedCalcProd.price * 0.7)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Order Quantity (Units)</label>
                <input type="number" min="100" value={calcQty} onChange={(e) => setCalcQty(e.target.value)} className="border border-border/85 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
              </div>
              
              <div className="border-t border-border/30 pt-3 flex flex-col gap-2 text-xs text-muted-foreground font-semibold">
                <div className="flex justify-between items-center">
                  <span>Subtotal Price:</span>
                  <span className="text-foreground font-bold">₹{freightSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>GST (18%):</span>
                  <span className="text-foreground font-bold">₹{freightSummary.gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transport Freight:</span>
                  <span className="text-foreground font-bold">{freightSummary.transport === 0 ? "FREE" : `₹${freightSummary.transport}`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Packing Charges:</span>
                  <span className="text-foreground font-bold">₹{freightSummary.packing.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/30 pt-2 font-black text-foreground text-sm">
                  <span>Total Landing Cost:</span>
                  <span className="text-primary">₹{freightSummary.totalLandingCost.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1 text-right">
                  Effective Wholesale Price: ₹{freightSummary.effectiveUnitPrice} / unit
                </div>
              </div>
              
              <Button onClick={() => handleSourceBulk(selectedCalcProd, selectedCalcProd.sellerName)} className="w-full font-bold h-9 mt-2 text-xs bg-primary text-white cursor-pointer">Place Purchase Order</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Supplier Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-lg w-full relative bg-background border border-border text-left">
            <button onClick={() => setShowComparison(false)} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-secondary text-foreground cursor-pointer border-none">
              <X className="h-4 w-4" />
            </button>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><ArrowLeftRight className="h-4.5 w-4.5 text-primary" /> Supplier Cost Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>{selectedSupplierA || "Supplier A"}</TableHead>
                    <TableHead>{selectedSupplierB || "Supplier B"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-xs text-muted-foreground">Wholesale Price</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{comparisonData?.priceA}</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{comparisonData?.priceB}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-xs text-muted-foreground">MOQ Limit</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{comparisonData?.moqA}</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{comparisonData?.moqB}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-xs text-muted-foreground">Delivery ETA</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{comparisonData?.etaA}</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{comparisonData?.etaB}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-xs text-muted-foreground">Rating Score</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{comparisonData?.ratingA}</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{comparisonData?.ratingB}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-xs text-muted-foreground">Freight Charges</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{comparisonData?.freightA}</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{comparisonData?.freightB}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

const X = ({ className }: { className: string }) => <XCircle className={className} />; // Fallback helper
import { XCircle } from 'lucide-react';

export default B2BMarketplace;
