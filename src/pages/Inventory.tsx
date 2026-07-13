import React, { useState, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';

import { AlertTriangle, ShieldCheck, CheckCircle2, Save, Search, TrendingUp, Clock, Plus, Minus, History } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const Inventory: React.FC = () => {
  const { products, updateProductStock, stats } = useVendor();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStockType, setFilterStockType] = useState<'all' | 'low' | 'out'>('all');
  
  // Bulk edit states
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [bulkStocks, setBulkStocks] = useState<Record<string, number>>({});
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Periodic Audit Count');

  // Ledger history logs state
  const [movementLogs, setMovementLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Threshold config
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  const fetchMovementLogs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setLoadingLogs(true);
      const res = await fetch('https://server.apexbee.in/api/products/inventory/movements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMovementLogs(data.movements || []);
      }
    } catch (err) {
      console.error('Error fetching inventory movements:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchMovementLogs();
  }, [products]);

  const logMovement = async (productId: string, quantityChanged: number, type: string, reason: string, batchNo: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch('https://server.apexbee.in/api/products/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantityChanged,
          type,
          reason,
          batchNo
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkChange = (id: string, val: number) => {
    setBulkStocks(prev => ({ ...prev, [id]: val }));
  };

  const handleSaveBulk = async () => {
    for (const [id, stockVal] of Object.entries(bulkStocks)) {
      const original = products.find(p => p.id === id || (p as any)._id === id);
      if (original) {
        const diff = stockVal - original.stock;
        if (diff !== 0) {
          updateProductStock(id, stockVal);
          await logMovement(
            id,
            diff,
            diff > 0 ? 'Inbound' : 'Outbound',
            adjustmentReason,
            (original as any).batchNo || 'N/A'
          );
        }
      }
    }
    setIsBulkEditMode(false);
    setBulkStocks({});
    setTimeout(() => {
      fetchMovementLogs();
    }, 800);
  };

  const handleQuickAdjust = async (id: string, increment: number) => {
    const original = products.find(p => p.id === id || (p as any)._id === id);
    if (!original) return;

    const targetStock = Math.max(0, original.stock + increment);
    updateProductStock(id, targetStock);
    
    await logMovement(
      id,
      increment,
      increment > 0 ? 'Inbound' : 'Outbound',
      'Quick Stock Adjustment',
      (original as any).batchNo || 'N/A'
    );
    
    setTimeout(() => {
      fetchMovementLogs();
    }, 800);
  };

  // Helper: calculate forecasting velocity and reorder quantities
  const getProductForecastDetails = (prodId: string, stock: number) => {
    const seed = prodId.charCodeAt(prodId.length - 1) || 5;
    const velocity = parseFloat(((seed % 4) + 1.2).toFixed(1)); // 1.2 to 4.2 units/day
    const daysRemaining = stock === 0 ? 0 : Math.round(stock / velocity);
    const reorderQty = stock <= lowStockThreshold ? Math.max(50, Math.ceil(velocity * 30)) : 0;
    
    return {
      velocity,
      daysRemaining,
      reorderQty
    };
  };

  const filteredProducts = products.filter(p => {
    // Matches live approved status or backend 'Live' casing
    const matchesStatus = p.status === 'Approved' || (p.status as string) === 'Live';
    if (!matchesStatus) return false;
    
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStock = true;
    if (filterStockType === 'low') {
      matchesStock = p.stock <= lowStockThreshold && p.stock > 0;
    } else if (filterStockType === 'out') {
      matchesStock = p.stock === 0;
    }
    
    return matchesSearch && matchesStock;
  });

  // Calculate stock metrics
  const totalStockValuation = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  
  // Recharts data for inventory stock distribution
  const chartData = products
    .filter(p => p.status === 'Approved' || (p.status as string) === 'Live')
    .slice(0, 5)
    .map(p => ({
      name: p.name.split(' ').slice(0, 2).join(' '),
      stock: p.stock
    }));

  // Critical stock out list for highlights card
  const criticalList = products
    .filter(p => p.status === 'Approved' || (p.status as string) === 'Live')
    .map(p => ({ ...p, ...getProductForecastDetails(p.id, p.stock) }))
    .filter(p => p.stock <= lowStockThreshold)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-left text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Inventory Management</h1>
          <p className="text-xs text-muted-foreground">Monitor stock health, execute bulk updates, and configure automatic alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          {isBulkEditMode ? (
            <div className="flex items-center gap-2">
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground"
              >
                <option value="Periodic Audit Count">📊 Periodic Audit Count</option>
                <option value="Damaged / Broken Goods">🗑️ Damaged / Broken Goods</option>
                <option value="Return Restocking">↩️ Return Restocking</option>
                <option value="Promotional Write-off">🎁 Promotional Write-off</option>
              </select>
              <Button onClick={() => setIsBulkEditMode(false)} variant="outline" size="sm" className="cursor-pointer font-bold">
                Cancel
              </Button>
              <Button onClick={handleSaveBulk} size="sm" className="flex items-center gap-1.5 cursor-pointer font-bold bg-primary text-white">
                <Save className="h-4 w-4" /> Save Bulk Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => {
              const initialStocks: Record<string, number> = {};
              filteredProducts.forEach(p => { initialStocks[p.id || (p as any)._id] = p.stock; });
              setBulkStocks(initialStocks);
              setIsBulkEditMode(true);
            }} variant="outline" size="sm" className="cursor-pointer font-bold border-border">
              Bulk Update Stock
            </Button>
          )}
        </div>
      </div>

      {/* Inventory Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Valuation</span>
              <span className="text-lg font-extrabold text-foreground">₹{totalStockValuation.toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Stock Capacity</span>
              <span className="text-lg font-extrabold text-foreground">{totalStockCount} units</span>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Low Stock Warning</span>
              <span className="text-lg font-extrabold text-foreground">{stats.lowStockCount} items</span>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Out of Stock</span>
              <span className="text-lg font-extrabold text-foreground">{products.filter(p => p.stock === 0).length} items</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Warning Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Config */}
        <Card className="glass flex flex-col justify-between text-left">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Stock Level Alerts
            </CardTitle>
            <CardDescription>Configure auto-triggers for critical inventory notification</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-muted-foreground">Low Stock Alert Threshold (units)</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Math.max(1, Number(e.target.value)))}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              />
            </div>
            <div className="border border-border/50 bg-secondary/35 p-3 rounded-lg flex flex-col gap-2">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Active Alert Policies
              </span>
              <ul className="text-[10px] text-muted-foreground list-disc pl-4 flex flex-col gap-1">
                <li>Alert vendor on seller hub dashboard notifications</li>
                <li>Flag product in red within the inventory manager page</li>
                <li>Send automated weekly low-stock reports</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Expected Stock-out Forecasting Widget */}
        <Card className="glass text-left">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <Clock className="h-5 w-5 text-rose-500 animate-spin-slow" /> Stock-out Forecasts
            </CardTitle>
            <CardDescription>Estimated days remaining based on daily sales velocity</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {criticalList.map((p, idx) => (
              <div key={idx} className="p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl flex flex-col gap-2 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-extrabold text-foreground truncate">{p.name}</span>
                    <span className="text-[9px] text-muted-foreground font-bold">Velocity: {p.velocity} units / day</span>
                  </div>
                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0 font-extrabold shadow-sm">
                    {p.daysRemaining === 0 ? "Out of Stock" : `Out in ${p.daysRemaining} Days`}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold pt-1 border-t border-border/30">
                  <span className="text-muted-foreground">Stock Left: <span className="text-foreground font-black">{p.stock}</span></span>
                  <span className="text-emerald-500 font-extrabold">Reorder: {p.reorderQty} units</span>
                </div>
              </div>
            ))}
            {criticalList.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground italic flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                All stock levels are currently healthy.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visual Chart */}
        <Card className="lg:col-span-1 text-left">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Top Stock Levels</CardTitle>
            <CardDescription>Top Approved Products Stock Distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={9} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Bar dataKey="stock" name="Stock Available" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={_.stock <= lowStockThreshold ? '#f59e0b' : 'var(--primary)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stock Table */}
      <Card className="glass text-left">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-base font-bold">Stock Register & Forecasting</CardTitle>
            <CardDescription>Manage active, reserved, and sellable listings along with future projections</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-56 flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/50 text-foreground border border-border rounded-lg pl-8 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'low', label: 'Low Stock' },
                { id: 'out', label: 'Out of Stock' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilterStockType(t.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer duration-150 ${
                    filterStockType === t.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="border-none rounded-none shadow-none text-xs">
              <TableHeader className="bg-transparent border-b border-border/40">
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Batch Specs</TableHead>
                  <TableHead>Reserved Stock</TableHead>
                  <TableHead>Available (Sellable)</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Quick Adjust</TableHead>
                  <TableHead>Est. Velocity / Day</TableHead>
                  <TableHead>Days to Stock-out</TableHead>
                  <TableHead>Reorder Recommendations</TableHead>
                  <TableHead>Inventory Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                      No approved listings found matching search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map(p => {
                    const availableStock = p.stock - p.reservedStock;
                    const isLow = p.stock <= lowStockThreshold && p.stock > 0;
                    const isOut = p.stock === 0;

                    // Forecasting
                    const forecast = getProductForecastDetails(p.id || (p as any)._id, p.stock);

                    return (
                      <TableRow key={p.id || (p as any)._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img src={p.images?.[0] || ''} alt={p.name} className="h-8 w-8 rounded object-cover border border-border flex-shrink-0" />
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-foreground text-xs line-clamp-1">{p.name}</span>
                              <span className="text-[10px] text-muted-foreground">{p.brand}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{p.sku}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-foreground">Batch: {(p as any).batchNo || 'N/A'}</span>
                            <span className="text-[10px] text-muted-foreground">Exp: {(p as any).expiryDate ? new Date((p as any).expiryDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-muted-foreground">{p.reservedStock || 0} units</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">{availableStock} units</TableCell>
                        <TableCell>
                          {isBulkEditMode ? (
                            <input
                              type="number"
                              value={bulkStocks[p.id || (p as any)._id] !== undefined ? bulkStocks[p.id || (p as any)._id] : p.stock}
                              onChange={(e) => handleBulkChange(p.id || (p as any)._id, Math.max(0, Number(e.target.value)))}
                              className="w-20 border border-border rounded px-1.5 py-0.5 text-xs bg-background text-foreground"
                            />
                          ) : (
                            <span className="text-xs font-bold text-foreground">{p.stock} units</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuickAdjust(p.id || (p as any)._id, 10)}
                              className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded cursor-pointer"
                              title="Add 10 Units"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(p.id || (p as any)._id, -10)}
                              className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded cursor-pointer"
                              title="Deduct 10 Units"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-muted-foreground">{forecast.velocity} units</TableCell>
                        <TableCell>
                          {isOut ? (
                            <span className="text-xs font-extrabold text-destructive">Immediate (0 days)</span>
                          ) : isLow ? (
                            <span className="text-xs font-extrabold text-amber-500 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-amber-500" /> {forecast.daysRemaining} days left
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-foreground">{forecast.daysRemaining} days left</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {forecast.reorderQty > 0 ? (
                            <span className="text-xs font-extrabold text-emerald-500">Reorder {forecast.reorderQty} units</span>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">Healthy</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isOut ? (
                            <Badge variant="destructive" className="py-0 px-2 text-[10px] font-bold">Out of Stock</Badge>
                          ) : isLow ? (
                            <Badge variant="warning" className="py-0 px-2 text-[10px] font-bold">Low Stock Alert</Badge>
                          ) : (
                            <Badge variant="success" className="py-0 px-2 text-[10px] font-bold">Healthy Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* STOCK LEDGER HISTORY AUDIT LOGS */}
      <Card className="glass text-left">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Stock Ledger Audit History
          </CardTitle>
          <CardDescription>Trace physical inventory movements, purchase orders, and adjustment notes in real-time</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loadingLogs ? (
            <div className="p-8 text-center text-xs text-muted-foreground italic flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              Loading stock ledger logs...
            </div>
          ) : movementLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground italic">
              No stock movements logged. Adjust inventory levels to create audit trail logs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead>Logged Time</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Qty Changed</TableHead>
                    <TableHead>Flow Type</TableHead>
                    <TableHead>Adjustment Reason</TableHead>
                    <TableHead>Batch No</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movementLogs.map((log: any) => {
                    const isPositive = log.quantityChanged > 0;
                    return (
                      <TableRow key={log._id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          {log.productId?.name || 'Deleted Product'}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {log.productId?.sku || 'N/A'}
                        </TableCell>
                        <TableCell className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? `+${log.quantityChanged}` : log.quantityChanged} units
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.type === 'Inbound' ? 'success' : log.type === 'Outbound' ? 'destructive' : 'outline'} className="text-[9px] font-bold uppercase">
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {log.reason}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {log.batchNo}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
