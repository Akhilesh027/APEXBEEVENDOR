import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Search, ShoppingCart, FileCheck, Coins, Building2, Network, Loader2, FileSpreadsheet, ArrowLeftRight } from 'lucide-react';

export const B2BMarketplace: React.FC = () => {
  const { currentPage, products } = useVendor();
  const [searchQuery, setSearchQuery] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqQty, setRfqQty] = useState('');
  const [rfqPrice, setRfqPrice] = useState('');

  const triggerMockAction = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    triggerMockAction(`RFQ for ${rfqQty} units of "${rfqTitle}" submitted to B2B marketplace review!`);
    setRfqTitle('');
    setRfqQty('');
    setRfqPrice('');
  };

  // Submenu checks
  const isBuy = currentPage === 'b2b-buy';
  const isSell = currentPage === 'b2b-sell';
  const isRfq = currentPage === 'b2b-rfq';
  const isDeals = currentPage === 'b2b-deals';
  const isWholesalers = currentPage === 'b2b-wholesalers';
  const isManufacturers = currentPage === 'b2b-manufacturers';
  const isProcurements = currentPage === 'b2b-procurements';
  const isQuotations = currentPage === 'b2b-quotations';
  const isPos = currentPage === 'b2b-pos';
  const isTrading = currentPage === 'b2b-trading';

  // Render headers
  const getHeaderTitle = () => {
    if (isBuy) return "Buy Products & Sourcing";
    if (isSell) return "Sell Bulk Catalog Listings";
    if (isRfq) return "RFQ Marketplace & Bidding";
    if (isDeals) return "Exclusive Bulk Procurement Deals";
    if (isWholesalers) return "Nearby Wholesale Distributors";
    if (isManufacturers) return "Nearby Direct Manufacturers";
    if (isProcurements) return "Procurement Requests Hub";
    if (isQuotations) return "Received Quotations Registry";
    if (isPos) return "B2B Purchase Orders";
    if (isTrading) return "Vendor-to-Vendor Trading Exchange";
    return "B2B Marketplace & Sourcing Operating System";
  };

  const getHeaderDesc = () => {
    if (isBuy) return "Browse and source wholesale inventory items from certified state suppliers.";
    if (isSell) return "Publish and manage your bulk quantity listings for secondary merchant sales.";
    if (isRfq) return "Bid on open Request for Quotation (RFQ) lots published by local retail networks.";
    if (isDeals) return "Claim clearance and excess inventory lots with high profit margins.";
    if (isWholesalers) return "Discover nearby wholesale warehouses categorized by territory radius.";
    if (isManufacturers) return "Source factory-direct items to cut secondary distribution middleman costs.";
    if (isProcurements) return "Audit outstanding stock procurement schedules and consignments.";
    if (isQuotations) return "Track counter-quotations, margins, and accept supplier logistics terms.";
    if (isPos) return "Dispatch, verify, and approve binding B2B buyer-seller purchase invoices.";
    if (isTrading) return "Exchange excess stock balances with nearby retail shop merchants.";
    return "Consolidated sourcing and distribution engine mapping regional supply networks.";
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      {/* Global Filter Bar */}
      <Card className="glass">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search manufacturers, products, RFQ lots, purchase orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-border/60 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <select className="bg-secondary/50 border border-border/60 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none">
              <option value="all">All Categories</option>
              <option value="apparel">Apparel & Textiles</option>
              <option value="groceries">Groceries & Foods</option>
              <option value="electronics">Electronics & Mobiles</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Tab Renderings */}
      <div className="grid grid-cols-1 gap-6">
        {/* VIEW 1: Buy Products */}
        {(isBuy || currentPage === 'b2b') && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <ShoppingCart className="h-4.5 w-4.5 text-primary" /> Available Bulk Sourcing Catalog
              </CardTitle>
              <CardDescription>Direct bulk catalog items with Minimum Order Quantity (MOQ) rates</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product details</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead className="text-right">Bulk Price (₹)</TableHead>
                    <TableHead className="text-right">MOQ Limit</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold text-foreground">
                        <div>{p.name}</div>
                        <div className="text-[10px] text-muted-foreground">{p.category}</div>
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-semibold">Surat Textiles Guild</TableCell>
                      <TableCell className="text-right font-bold text-primary">₹{Math.round(p.price * 0.5)} / unit</TableCell>
                      <TableCell className="text-right text-foreground font-extrabold">100 units</TableCell>
                      <TableCell className="text-xs text-muted-foreground">5 business days</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => triggerMockAction(`Added 100 units of ${p.name} to bulk procurement checkout!`)}
                          className="h-7 px-3 text-xs cursor-pointer font-bold"
                        >
                          Source Bulk
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 2: Sell Products */}
        {isSell && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5 glass h-fit">
              <CardHeader>
                <CardTitle className="text-base font-bold">List Bulk Product Lot</CardTitle>
                <CardDescription>Offer secondary inventories to other portal buyers</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); triggerMockAction("Bulk product lot listed successfully on the portal!"); }} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Select Product *</label>
                    <select className="border border-border/80 rounded-lg p-2.5 bg-background text-foreground text-xs focus:outline-none">
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Lot Price (₹ / unit) *</label>
                      <input required type="number" placeholder="e.g. 350" className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Lot MOQ *</label>
                      <input required type="number" placeholder="e.g. 50" className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-2 bg-primary text-white font-bold h-9">
                    Deploy Lot Listing
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7 glass">
              <CardHeader>
                <CardTitle className="text-base font-bold">Your Bulk Listing Lots</CardTitle>
                <CardDescription>Active inventory packages available for secondary purchasing</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Listed Lot</TableHead>
                      <TableHead className="text-right">Price / unit</TableHead>
                      <TableHead className="text-right">MOQ</TableHead>
                      <TableHead>Lot Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-bold text-foreground">Classic Silk Nehru Jacket lot</TableCell>
                      <TableCell className="text-right text-primary font-bold">₹750</TableCell>
                      <TableCell className="text-right font-extrabold text-foreground">50 units</TableCell>
                      <TableCell><Badge variant="success">Active</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold text-foreground">Cotton Daily Wear Kurti lot</TableCell>
                      <TableCell className="text-right text-primary font-bold">₹280</TableCell>
                      <TableCell className="text-right font-extrabold text-foreground">100 units</TableCell>
                      <TableCell><Badge variant="success">Active</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW 3: RFQ Marketplace */}
        {isRfq && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-4 glass h-fit">
              <CardHeader>
                <CardTitle className="text-base font-bold">Post New RFQ Lot</CardTitle>
                <CardDescription>Ask manufacturers to submit quotes for bulk volumes</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRFQ} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Product/Material Needed *</label>
                    <input required type="text" placeholder="e.g. Printed Cotton Kurti rolls" value={rfqTitle} onChange={(e) => setRfqTitle(e.target.value)} className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Quantity *</label>
                      <input required type="number" placeholder="e.g. 500" value={rfqQty} onChange={(e) => setRfqQty(e.target.value)} className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Target Price (₹) *</label>
                      <input required type="number" placeholder="e.g. 250" value={rfqPrice} onChange={(e) => setRfqPrice(e.target.value)} className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-2 bg-primary text-white font-bold h-9">
                    Publish RFQ lot
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-8 glass">
              <CardHeader>
                <CardTitle className="text-base font-bold">Active RFQs Marketplace</CardTitle>
                <CardDescription>Review and bid on open sourcing requests</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RFQ Reference</TableHead>
                      <TableHead>Product Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Target (₹)</TableHead>
                      <TableHead className="text-right">Best Bid (₹)</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-xs font-bold text-foreground">RFQ-9921</TableCell>
                      <TableCell className="font-bold text-foreground">Pure Linen Shirting Material</TableCell>
                      <TableCell className="text-right">1,200 meters</TableCell>
                      <TableCell className="text-right">₹180/m</TableCell>
                      <TableCell className="text-right text-primary font-bold">₹195/m</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => triggerMockAction("Bid of ₹185/m submitted to buyer!")} className="h-7 text-xs cursor-pointer border-border">Submit Bid</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs font-bold text-foreground">RFQ-9922</TableCell>
                      <TableCell className="font-bold text-foreground">Premium Silk Nehru Jackets (Finished)</TableCell>
                      <TableCell className="text-right">250 units</TableCell>
                      <TableCell className="text-right">₹800/u</TableCell>
                      <TableCell className="text-right text-primary font-bold">-</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => triggerMockAction("Bid of ₹790/u submitted to buyer!")} className="h-7 text-xs cursor-pointer border-border">Submit Bid</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW 4: Bulk Deals */}
        {isDeals && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Coins className="h-4.5 w-4.5 text-primary" /> Clearance & Excess Stock Deals
              </CardTitle>
              <CardDescription>Claim high-margin stock liquidations from top partners</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Reference</TableHead>
                    <TableHead>Stock Item</TableHead>
                    <TableHead className="text-right">Retail Value (₹)</TableHead>
                    <TableHead className="text-right">Deal Clearance Price (₹)</TableHead>
                    <TableHead className="text-right">Total Quantity</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-bold text-foreground">DEAL-802</TableCell>
                    <TableCell className="font-bold text-foreground">
                      <div>Summer Kurtis Excess Stock</div>
                      <span className="text-[10px] text-muted-foreground">Brand: Bengaluru Organic Kurta</span>
                    </TableCell>
                    <TableCell className="text-right line-through text-muted-foreground">₹2,50,000</TableCell>
                    <TableCell className="text-right text-emerald-500 font-extrabold">₹95,000</TableCell>
                    <TableCell className="text-right font-extrabold text-foreground">500 units</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => triggerMockAction("Claimed lot DEAL-802 clearance pricing of ₹95,000!")} className="h-7 px-3 text-xs cursor-pointer font-bold bg-emerald-500 hover:bg-emerald-600 text-white">Claim Lot</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 5: Nearby Wholesalers */}
        {isWholesalers && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Building2 className="h-4.5 w-4.5 text-amber-500" /> Sourcing Distributors Directory
              </CardTitle>
              <CardDescription>Wholesalers offering catalog dropshipping within your district</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distributor Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Region Territory</TableHead>
                    <TableHead className="text-right">Reputation Rating</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-foreground">Delhi Tech Mart Warehouse</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Electronics & Cables</TableCell>
                    <TableCell className="text-xs text-foreground font-semibold">Okhla Phase 3, Delhi</TableCell>
                    <TableCell className="text-right text-amber-500 font-bold">★ 4.8</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => triggerMockAction("Contacted Vikram Singh at Delhi Tech Mart!")} className="h-7 text-xs cursor-pointer border-border">Contact Hub</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 6: Nearby Manufacturers */}
        {isManufacturers && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Network className="h-4.5 w-4.5 text-pink-500" /> Factory-Direct Production Hubs
              </CardTitle>
              <CardDescription>Direct weaving and fabrication mills to minimize markup fees</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mill/Factory Name</TableHead>
                    <TableHead>Material focus</TableHead>
                    <TableHead>Production Capacity</TableHead>
                    <TableHead>Reputation Rating</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-foreground">Surat Silk Weavers Mill</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Polyester, Jacquard, Pure Georgette Silk</TableCell>
                    <TableCell className="text-xs text-foreground font-semibold">10,000 meters / week</TableCell>
                    <TableCell className="text-amber-500 font-bold">★ 4.9</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => triggerMockAction("Sent catalog inquiry to Surat Silk Weavers Mill!")} className="h-7 text-xs cursor-pointer border-border">Inquire Mill</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 7: Procurement Requests */}
        {isProcurements && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Loader2 className="h-4.5 w-4.5 text-primary animate-spin" /> Active Procurements Logs
              </CardTitle>
              <CardDescription>Consignment delivery milestones and shipping invoices</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procurement ID</TableHead>
                    <TableHead>Material / Items</TableHead>
                    <TableHead className="text-right">Total Quantity</TableHead>
                    <TableHead className="text-right">Value Amount (₹)</TableHead>
                    <TableHead>Shipping status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-bold text-foreground">PO-10821</TableCell>
                    <TableCell className="font-bold text-foreground">Cotton Kurta Fabric rolls</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">200 meters</TableCell>
                    <TableCell className="text-right text-indigo-500 font-bold">₹36,000</TableCell>
                    <TableCell><Badge variant="warning">In Transit</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 8: Quotations */}
        {isQuotations && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <FileSpreadsheet className="h-4.5 w-4.5 text-primary" /> Active Bids & Counter-Offers
              </CardTitle>
              <CardDescription>Bids received on your published RFQs</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote Ref</TableHead>
                    <TableHead>RFQ ID</TableHead>
                    <TableHead>Supplier Bidder</TableHead>
                    <TableHead className="text-right">Proposed Price (₹ / unit)</TableHead>
                    <TableHead className="text-right">Delivery Days</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-bold text-foreground">QT-992-1</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">RFQ-9921</TableCell>
                    <TableCell className="font-bold text-foreground">Gujarat Textiles Warehouse</TableCell>
                    <TableCell className="text-right text-emerald-500 font-extrabold">₹175</TableCell>
                    <TableCell className="text-right text-foreground font-semibold">4 business days</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => triggerMockAction("Accepted quotation QT-992-1 and generated B2B Purchase Order!")} className="h-7 px-3 text-xs cursor-pointer font-bold">Accept Quote</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 9: Purchase Orders */}
        {isPos && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <ShoppingCart className="h-4.5 w-4.5 text-primary" /> Purchase Invoices Register
              </CardTitle>
              <CardDescription>Binding invoices cleared through accounting networks</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice PO Ref</TableHead>
                    <TableHead>Merchant Buyer</TableHead>
                    <TableHead>Material Description</TableHead>
                    <TableHead className="text-right">Total Net (₹)</TableHead>
                    <TableHead>Billing status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-bold text-foreground">INV-PO-7782</TableCell>
                    <TableCell className="font-bold text-foreground">Mumbai Garment Depot</TableCell>
                    <TableCell className="text-xs text-muted-foreground">250 units Nehru Jackets</TableCell>
                    <TableCell className="text-right font-black text-indigo-500">₹1,97,500</TableCell>
                    <TableCell><Badge variant="success">Paid & Settled</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* VIEW 10: Vendor-to-Vendor Trading */}
        {isTrading && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <ArrowLeftRight className="h-4.5 w-4.5 text-primary" /> Excess Stock Trading Exchange
              </CardTitle>
              <CardDescription>Swap excess inventory counts with nearby shop owners to manage storage space</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Swap ID</TableHead>
                    <TableHead>Offering Stock</TableHead>
                    <TableHead>Swap Proposal Demand</TableHead>
                    <TableHead>Proposing Store</TableHead>
                    <TableHead className="text-right">Distance</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-bold text-foreground">SWAP-4412</TableCell>
                    <TableCell className="font-bold text-foreground">50 units Cotton Kurtis (M/White)</TableCell>
                    <TableCell className="font-bold text-indigo-500">50 units Casual Linen Shirts (L/Blue)</TableCell>
                    <TableCell className="text-xs text-foreground font-semibold">Bengaluru Organic Farms</TableCell>
                    <TableCell className="text-right text-muted-foreground">3.2 km away</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => triggerMockAction("Accepted trade swap SWAP-4412! Courier dispatch code generated.")} className="h-7 px-3 text-xs cursor-pointer font-bold">Approve Trade</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default B2BMarketplace;
