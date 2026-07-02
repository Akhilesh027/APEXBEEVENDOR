import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { 
  Boxes, 
  Search, 
  FileCheck, 
  Clock, 
  Loader2, 
  AlertTriangle,
  Star
} from 'lucide-react';

export const ProcurementHub: React.FC = () => {
  const { 
    products, 
    procurementOrders, 
    activeQuotations, 
    procurementLoading, 
    procurementProduct, 
    requestProcurementQuotes, 
    createProcurementOrder 
  } = useVendor();

  const [searchQuery, setSearchQuery] = useState('');
  const [procureQty, setProcureQty] = useState<number>(50);

  // Products with low stock or all approved products that can be restocked
  const restockableProducts = products.filter(p => p.status === 'Approved');
  
  const filteredProducts = restockableProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProductDetail = restockableProducts.find(p => p.id === procurementProduct);

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'Placed': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'Shipped': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'In Transit': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const handleRequestQuotes = (productId: string) => {
    requestProcurementQuotes(productId);
  };

  const handlePlaceOrder = (quoteId: string, minOrderQty: number) => {
    const qty = Math.max(procureQty, minOrderQty);
    createProcurementOrder(quoteId, qty);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Boxes className="h-6 w-6 text-indigo-500" /> Smart Procurement Hub
          </h1>
          <p className="text-xs text-muted-foreground">Source wholesale quotes, place bulk replenishment orders, and track fulfillment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Restocking Catalog Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="glass">
            <CardHeader className="pb-3 text-left">
              <CardTitle className="text-base font-bold">Low Stock Stocking Catalog</CardTitle>
              <CardDescription>Select low stock items to request quotes from authorized distributors</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-left">
              {/* Search Bar */}
              <div className="relative w-full flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by title or SKU..."
                  className="w-full border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs bg-background text-foreground"
                />
              </div>

              {/* Table list */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => {
                      const isLow = p.stock <= 10 && p.stock > 0;
                      const isOut = p.stock === 0;
                      return (
                        <TableRow key={p.id} className="hover:bg-muted/10">
                          <TableCell className="font-bold text-xs max-w-[200px] truncate text-foreground">{p.name}</TableCell>
                          <TableCell className="text-xs font-semibold">{p.sku}</TableCell>
                          <TableCell className="text-xs font-extrabold text-foreground">
                            {p.stock} units
                          </TableCell>
                          <TableCell>
                            {isOut ? (
                              <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">Out of Stock</Badge>
                            ) : isLow ? (
                              <Badge variant="warning" className="px-1.5 py-0 text-[10px]">Low Stock</Badge>
                            ) : (
                              <Badge variant="success" className="px-1.5 py-0 text-[10px]">Healthy</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRequestQuotes(p.id)}
                              disabled={procurementLoading && procurementProduct === p.id}
                              className="cursor-pointer h-7 text-[10px]"
                            >
                              {procurementLoading && procurementProduct === p.id ? (
                                <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Quoting...</span>
                              ) : (
                                "Request Quotes"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Wholesaler Quotation comparator sheet */}
          {selectedProductDetail && (
            <Card className="glass border border-indigo-500/20">
              <CardHeader className="pb-3 text-left">
                <CardTitle className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  Quotation Comparator: {selectedProductDetail.name}
                </CardTitle>
                <CardDescription>Compare wholesale pricing, minimum order quantities, and shipping speed</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-left">
                {activeQuotations.length > 0 ? (
                  <>
                    <div className="flex items-center gap-3 bg-secondary/20 p-3 rounded-xl border border-border/60">
                      <div className="flex-1 flex flex-col gap-0.5 text-xs">
                        <span className="text-muted-foreground font-bold uppercase text-[9px]">Target Restock Quantity</span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={procureQty}
                            onChange={(e) => setProcureQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 border border-border rounded-lg px-2.5 py-1 text-xs bg-background text-foreground font-extrabold"
                          />
                          <span className="text-muted-foreground font-bold">units</span>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Wholesaler Distributor</TableHead>
                            <TableHead>Price/Unit</TableHead>
                            <TableHead>Min Order (MOQ)</TableHead>
                            <TableHead>Fulfillment</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeQuotations.map((quote) => {
                            const unitPrice = quote.pricePerUnit;
                            const qty = Math.max(procureQty, quote.moq);
                            const totalVal = unitPrice * qty;
                            return (
                              <TableRow key={quote.id} className="hover:bg-muted/10">
                                <TableCell className="font-extrabold text-xs text-foreground">{quote.wholesalerName}</TableCell>
                                <TableCell className="text-xs font-black text-indigo-600 dark:text-indigo-400">₹{unitPrice}</TableCell>
                                <TableCell className="text-xs font-bold text-foreground">{quote.moq} units</TableCell>
                                <TableCell className="text-xs font-semibold text-muted-foreground">{quote.deliveryDays} Days delivery</TableCell>
                                <TableCell>
                                  <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                                    <Star className="h-3 w-3 fill-amber-500" /> {quote.rating}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    size="sm"
                                    onClick={() => handlePlaceOrder(quote.id, quote.moq)}
                                    className="cursor-pointer h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1"
                                  >
                                    Procure (₹{totalVal.toLocaleString()})
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-xs text-muted-foreground italic flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                    Select "Request Quotes" from the stocking catalog above to generate distributor bids.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active PO Tracker Timeline Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="glass h-full">
            <CardHeader className="text-left">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-500" /> Active Purchase Orders
              </CardTitle>
              <CardDescription>Track wholesale bulk order delivery pipelines</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-left">
              {procurementOrders.length > 0 ? (
                procurementOrders.map((order) => (
                  <div key={order.id} className="p-3 bg-secondary/15 hover:bg-secondary/25 border border-border/60 rounded-xl flex flex-col gap-2.5 transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground">{order.productName}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">PO ID: {order.id} • {order.wholesalerName}</span>
                      </div>
                      <Badge className={`text-[9px] px-1.5 py-0 border ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground py-1 border-y border-border/30">
                      <span>Qty: <span className="text-foreground font-black">{order.quantity}</span></span>
                      <span>Total Value: <span className="text-foreground font-black">₹{order.totalAmount.toLocaleString()}</span></span>
                    </div>

                    {/* Timeline Flow */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">PO Logistics Tracking:</span>
                      <div className="flex flex-col gap-2 pl-3 border-l-2 border-primary/20">
                        {order.timeline.map((step, idx) => (
                          <div key={idx} className="flex gap-2 relative">
                            <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                            <div className="flex flex-col gap-0.5 text-[10px]">
                              <span className="font-extrabold text-foreground">{step.status}</span>
                              <span className="text-muted-foreground font-medium leading-relaxed">{step.description}</span>
                              <span className="text-[8px] text-muted-foreground/60">{step.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-muted-foreground italic flex flex-col items-center justify-center gap-2">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                  No active purchase orders placed yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
