import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';

import { AlertTriangle, ShieldCheck, CheckCircle2, Save, Search, TrendingUp, Clock } from 'lucide-react';
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

  // Threshold config
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  const handleBulkChange = (id: string, val: number) => {
    setBulkStocks(prev => ({ ...prev, [id]: val }));
  };

  const handleSaveBulk = () => {
    Object.entries(bulkStocks).forEach(([id, stockVal]) => {
      updateProductStock(id, stockVal);
    });
    setIsBulkEditMode(false);
    setBulkStocks({});
  };

  // Helper: calculate forecasting velocity and reorder quantities
  const getProductForecastDetails = (prodId: string, stock: number) => {
    // Generate a pseudo-random sales velocity (daily rate) based on product ID char code
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
    if (p.status !== 'Approved') return false; // Only manage live inventory
    
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
    .filter(p => p.status === 'Approved')
    .slice(0, 5)
    .map(p => ({
      name: p.name.split(' ').slice(0, 2).join(' '),
      stock: p.stock
    }));

  // Critical stock out list for highlights card
  const criticalList = products
    .filter(p => p.status === 'Approved')
    .map(p => ({ ...p, ...getProductForecastDetails(p.id, p.stock) }))
    .filter(p => p.stock <= lowStockThreshold)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Inventory Management</h1>
          <p className="text-xs text-muted-foreground">Monitor stock health, execute bulk updates, and configure automatic alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          {isBulkEditMode ? (
            <>
              <Button onClick={() => setIsBulkEditMode(false)} variant="outline" size="sm" className="cursor-pointer font-bold">
                Cancel
              </Button>
              <Button onClick={handleSaveBulk} size="sm" className="flex items-center gap-1.5 cursor-pointer font-bold">
                <Save className="h-4 w-4" /> Save Bulk Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => {
              const initialStocks: Record<string, number> = {};
              filteredProducts.forEach(p => { initialStocks[p.id] = p.stock; });
              setBulkStocks(initialStocks);
              setIsBulkEditMode(true);
            }} variant="outline" size="sm" className="cursor-pointer font-bold">
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
            <Table className="border-none rounded-none shadow-none">
              <TableHeader className="bg-transparent border-b border-border/40">
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Reserved Stock</TableHead>
                  <TableHead>Available (Sellable)</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Est. Velocity / Day</TableHead>
                  <TableHead>Days to Stock-out</TableHead>
                  <TableHead>Recommended Reorder</TableHead>
                  <TableHead>Inventory Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      No approved listings found matching search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map(p => {
                    const availableStock = p.stock - p.reservedStock;
                    const isLow = p.stock <= lowStockThreshold && p.stock > 0;
                    const isOut = p.stock === 0;

                    // Forecasting
                    const forecast = getProductForecastDetails(p.id, p.stock);

                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img src={p.images[0]} alt={p.name} className="h-8 w-8 rounded object-cover border border-border flex-shrink-0" />
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-foreground text-xs line-clamp-1">{p.name}</span>
                              <span className="text-[10px] text-muted-foreground">{p.brand}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                        <TableCell className="text-xs font-semibold text-muted-foreground">{p.reservedStock} units</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">{availableStock} units</TableCell>
                        <TableCell>
                          {isBulkEditMode ? (
                            <input
                              type="number"
                              value={bulkStocks[p.id] !== undefined ? bulkStocks[p.id] : p.stock}
                              onChange={(e) => handleBulkChange(p.id, Math.max(0, Number(e.target.value)))}
                              className="w-20 border border-border rounded px-1.5 py-0.5 text-xs bg-background text-foreground"
                            />
                          ) : (
                            <span className="text-xs font-bold text-foreground">{p.stock} units</span>
                          )}
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
    </div>
  );
};
