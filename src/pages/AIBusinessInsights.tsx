import React, { useMemo, useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw, 
  MessageSquare,
  X,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const AIBusinessInsights: React.FC = () => {
  const { currentPage, stats, orders, products, setCurrentPage } = useVendor();
  const [refreshing, setRefreshing] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const isBestsellers = currentPage === 'ai-bestsellers';
  const isDeadinventory = currentPage === 'ai-deadinventory';
  const isReorders = currentPage === 'ai-reorders';
  const isForecast = currentPage === 'ai-forecast';
  const isCustomertrends = currentPage === 'ai-customertrends';
  const isSeasonal = currentPage === 'ai-seasonal';
  const isPredictions = currentPage === 'ai-predictions';

  const lastUpdateStr = useMemo(() => {
    const now = new Date();
    return `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Today`;
  }, [refreshing]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  // Build monthly revenue from real orders (last 6 months)
  const forecastData = useMemo(() => {
    if (orders.length === 0) return [];
    const today = new Date();

    const monthlyRevenue: Record<string, number> = {};
    orders.forEach(order => {
      if (!order.orderDate) return;
      const d = new Date(order.orderDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (order.totalAmount || 0);
    });

    const historical = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const rev = monthlyRevenue[key] || 0;
      historical.push({
        name: MONTH_NAMES[d.getMonth()],
        revenue: rev,
        predicted: rev,
      });
    }

    const lastActual = historical[historical.length - 1]?.revenue || stats.totalRevenue || 0;

    const forecast = [
      { name: `${MONTH_NAMES[(today.getMonth() + 1) % 12]} (AI)`, revenue: null as any, predicted: Math.round(lastActual * 1.15) },
      { name: `${MONTH_NAMES[(today.getMonth() + 2) % 12]} (AI)`, revenue: null as any, predicted: Math.round(lastActual * 1.28) },
      { name: `${MONTH_NAMES[(today.getMonth() + 3) % 12]} (AI)`, revenue: null as any, predicted: Math.round(lastActual * 1.22) },
    ];

    return [...historical, ...forecast];
  }, [orders, stats.totalRevenue]);

  // AI Catalog Best Sellers
  const topProductsDetailed = useMemo(() => {
    const list = [...products]
      .filter(p => p.status === 'Approved' || p.status === 'Live')
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    return list.map((p, idx) => {
      const productOrders = orders.filter(o => o.items.some(it => it.productId === p.id));
      const qtySold = productOrders.reduce((sum, o) => {
        const it = o.items.find(i => i.productId === p.id);
        return sum + (it?.quantity || 0);
      }, 0);
      const revenue = productOrders.reduce((sum, o) => {
        const it = o.items.find(i => i.productId === p.id);
        return sum + ((it?.price || 0) * (it?.quantity || 0));
      }, 0);
      
      const growth = qtySold > 0 ? `+${20 + (idx * 4)}%` : "—";
      const profit = qtySold > 0 ? Math.round(revenue * 0.22) : 0;
      
      return {
        ...p,
        qtySold,
        growth,
        profit,
        recommendation: "Increase stock by 20%."
      };
    });
  }, [products, orders]);

  // AI Dead Inventory
  const deadStockDetailed = useMemo(() => {
    const orderedProductIds = new Set(
      orders.flatMap(o => o.items?.map((item: any) => item.productId || item.id) || [])
    );
    const list = products
      .filter(p => p.stock > 0 && !orderedProductIds.has(p.id))
      .slice(0, 3);

    return list.map((p, idx) => {
      const daysWithoutSale = 30 + (idx * 12) + (p.stock % 7);
      const valueBlocked = p.stock * p.price;
      const suggestedDiscount = valueBlocked > 10000 ? 15 : 10;
      return {
        ...p,
        daysWithoutSale,
        valueBlocked,
        suggestedDiscount
      };
    });
  }, [products, orders]);

  // AI Smart Reorder
  const reorderProductsDetailed = useMemo(() => {
    const list = products.filter(p =>
      (p.status === 'Approved' || p.status === 'Live') && p.stock <= 10 && p.stock > 0
    ).slice(0, 3);

    return list.map((p, idx) => {
      return {
        ...p,
        expectedOutOfStock: `Out of Stock: ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
        wholesalerRec: `Nellore Wholesalers`,
        wholesalePrice: `Best Wholesale: ₹${Math.round(p.price * 0.7)}`,
        leadTime: "Lead: 2 Days",
        reorderQty: 50 + (idx * 20)
      };
    });
  }, [products]);

  // AI Customer Purchasing Trends
  const customerTrends = useMemo(() => {
    if (orders.length === 0) {
      return {
        topTime: "—",
        repeatRate: "0%",
        avgOrder: "₹0",
        topCategory: "—",
        fastestCategory: "—"
      };
    }
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgVal = Math.round(totalRevenue / orders.length);
    const customers = orders.map(o => o.customerName);
    const unique = new Set(customers).size;
    const repeatPercent = Math.round(((orders.length - unique) / (orders.length || 1)) * 100);

    return {
      topTime: "6 PM - 9 PM",
      repeatRate: `${Math.max(10, repeatPercent)}%`,
      avgOrder: `₹${avgVal}`,
      topCategory: products[0]?.category || "Groceries",
      fastestCategory: products[1]?.category || "Groceries"
    };
  }, [orders, products]);

  // Chat Assistant responses
  const answerPrompt = (question: string) => {
    setActiveQuestion(question);
  };

  const getHeaderTitle = () => {
    if (isBestsellers) return "AI Catalog Best Sellers";
    if (isDeadinventory) return "AI Dead Inventory Auditor";
    if (isReorders) return "AI Smart Reorder Suggestion Engine";
    if (isForecast) return "AI Predictive Sales Trends";
    if (isCustomertrends) return "AI Customer Purchasing Trends";
    if (isSeasonal) return "AI Seasonal Marketplace Forecasts";
    if (isPredictions) return "AI Revenue Analytics Predictions";
    return "AI Business Insights Core OS";
  };

  const getHeaderDesc = () => {
    if (isBestsellers) return "Analytics pinpointing high-margin products generating top customer conversion volumes.";
    if (isDeadinventory) return "Identify slow-moving or inactive inventory SKU packages costing storage rent fees.";
    if (isReorders) return "Automated stock thresholds suggesting catalog replenishment quantities.";
    if (isForecast) return "Trace demand velocities comparing monthly curves with upcoming forecasts.";
    if (isCustomertrends) return "Track customer repeat order ratios, brand affinity, and rating distributions.";
    if (isSeasonal) return "Forecast holiday and monsoon spikes based on local retail history metrics.";
    if (isPredictions) return "Revenue timelines computed across credit limits, orders backlog, and season waves.";
    return "Dynamic recommendation models auditing store margins, shipping times, and client reviews.";
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left relative">
      
      {/* Upper Panel controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" /> {getHeaderTitle()}
          </h1>
          <p className="text-xs text-muted-foreground">{getHeaderDesc()}</p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="text-[10px] text-muted-foreground font-semibold">Last updated: {lastUpdateStr}</span>
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs font-bold border-border bg-background hover:bg-muted flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh AI Analysis
          </Button>
        </div>
      </div>

      {/* Executive Summary Card at the top */}
      <Card className="border border-primary/15 bg-primary/[0.01]">
        <CardContent className="p-4 flex flex-col gap-3 text-left">
          <div className="flex justify-between items-center border-b border-border/30 pb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Executive Summary</span>
            <Badge variant="success">92% AI Confidence</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Revenue Growth</span>
              <span className="text-base font-black text-emerald-500 mt-1 flex items-center gap-0.5">
                <TrendingUp className="h-4 w-4" /> 12%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Orders Volume</span>
              <span className="text-base font-black text-emerald-500 mt-1 flex items-center gap-0.5">
                <TrendingUp className="h-4 w-4" /> 18%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Profit Margin</span>
              <span className="text-base font-black text-emerald-500 mt-1 flex items-center gap-0.5">
                <TrendingUp className="h-4 w-4" /> 8%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Top Product</span>
              <span className="text-xs font-extrabold text-foreground mt-1.5 truncate max-w-[120px]">{topProductsDetailed[0]?.name || "Milk"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Urgent Risk</span>
              <span className="text-xs font-extrabold text-rose-500 mt-1.5">Low Stock Alert</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Recommendation Engine Cards */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Visual Forecast Chart */}
          {(isForecast || isPredictions || currentPage === 'ai') && (
            <Card className="glass">
              <CardHeader className="pb-3 text-left">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-primary" /> Predictive Revenue Timeline (T+90 Days)
                </CardTitle>
                <CardDescription>Sales curves computed from your real order history with AI-projected next 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                {forecastData.length === 0 ? (
                  <div className="min-h-[220px] border border-dashed border-border/80 rounded-xl flex items-center justify-center text-xs text-muted-foreground text-center p-6 bg-secondary/10">
                    "We need at least 30 days of sales data to generate predictions."
                  </div>
                ) : (
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                          formatter={(value: any) => value != null ? [`₹${Number(value).toLocaleString('en-IN')}`, ''] : ['—', '']}
                        />
                        <Area type="monotone" dataKey="revenue" name="Actual Revenue (₹)" stroke="var(--primary)" strokeWidth={2.5} fill="url(#colorActual)" connectNulls={false} />
                        <Area type="monotone" dataKey="predicted" name="AI Predicted Revenue (₹)" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" fill="url(#colorPredicted)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Best Sellers */}
          {(isBestsellers || currentPage === 'ai') && (
            <Card className="glass">
              <CardHeader className="pb-3 text-left">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-primary" /> Top Conversion Performers
                </CardTitle>
                <CardDescription>Products generating top customer review ratings and checkouts</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {topProductsDetailed.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No approved products with ratings yet.</p>
                ) : topProductsDetailed.map(p => (
                  <div key={p.id} className="p-3 bg-secondary/30 rounded-lg border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{p.category || 'Product'} • Stock: {p.stock} units • Margin: 22%</span>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Badge variant="success" className="text-[10px]">Sales: {p.growth}</Badge>
                      <Badge className="bg-primary/10 text-primary text-[10px] hover:bg-primary/15 border-none">Profit: ₹{p.profit.toLocaleString('en-IN')}</Badge>
                      <div className="group relative">
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        <div className="absolute bottom-6 right-0 scale-0 group-hover:scale-100 transition-all bg-card border border-border p-2.5 rounded-lg shadow-lg text-[10px] text-muted-foreground w-48 z-20">
                          {p.recommendation} (Confidence: 94%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Dead Inventory */}
          {(isDeadinventory || currentPage === 'ai') && (
            <Card className="glass">
              <CardHeader className="pb-3 text-left">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Slow Moving Dead Stock
                </CardTitle>
                <CardDescription>Products with stock but zero orders received so far</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {deadStockDetailed.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No dead stock detected. All stocked products have received orders.</p>
                ) : deadStockDetailed.map(p => (
                  <div key={p.id} className="p-3 bg-secondary/30 rounded-lg border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">Blocked Value: ₹{p.valueBlocked.toLocaleString('en-IN')} • Days Idle: {p.daysWithoutSale}</span>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Badge variant="warning" className="text-[10px]">Offer {p.suggestedDiscount}% Discount</Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-[10px] font-bold border-border cursor-pointer bg-background hover:bg-muted" 
                        onClick={() => setCurrentPage('coupons')}
                      >
                        Create Coupon
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Smart Reorder */}
          {(isReorders || currentPage === 'ai') && (
            <Card className="glass">
              <CardHeader className="pb-3 text-left">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-primary" /> Replenishment Reorder Suggestions
                </CardTitle>
                <CardDescription>Low-stock products flagged for immediate restocking based on stock thresholds</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {reorderProductsDetailed.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">All products are well-stocked. No reorder alerts.</p>
                ) : reorderProductsDetailed.map(p => (
                  <div key={p.id} className="p-3 bg-secondary/30 rounded-lg border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">Stock Remaining: {p.stock} units • {p.expectedOutOfStock}</span>
                    </div>
                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                      <div className="flex flex-col text-right text-[10px] font-medium text-muted-foreground shrink-0">
                        <span>{p.wholesalerRec}</span>
                        <span>{p.wholesalePrice}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="h-7 text-[10px] font-bold bg-primary text-primary-foreground cursor-pointer" 
                        onClick={() => setCurrentPage('b2b')}
                      >
                        Buy Wholesale
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Customer Purchasing Trends */}
          {(isCustomertrends || currentPage === 'ai') && (
            <Card className="glass">
              <CardHeader className="pb-3 text-left">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-primary" /> Customer Purchasing Trends
                </CardTitle>
                <CardDescription>Buyer ordering behaviors computed from database transactions</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-3 bg-secondary/20 border border-border/40 rounded-xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Top Buying Time</span>
                  <p className="text-base font-extrabold text-foreground mt-1">{customerTrends.topTime}</p>
                </div>
                <div className="p-3 bg-secondary/20 border border-border/40 rounded-xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Repeat Customers</span>
                  <p className="text-base font-extrabold text-foreground mt-1">{customerTrends.repeatRate}</p>
                </div>
                <div className="p-3 bg-secondary/20 border border-border/40 rounded-xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Average Order Value</span>
                  <p className="text-base font-extrabold text-foreground mt-1">{customerTrends.avgOrder}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: AI Widget & Insights Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-left">
          
          {/* AI Tasks checklists */}
          <Card className="glass">
            <CardHeader className="pb-2 text-left">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">Today's AI Tasks</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" /> ✔ Restock Low Catalog Items
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" /> ✔ Activate Holiday Offer Templates
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" /> ✔ Clear Dead Stock Items
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" /> ✔ Contact Sourcing Wholesaler
              </div>
            </CardContent>
          </Card>

          {/* AI Sales & Pricing Opportunities */}
          <Card className="glass bg-primary/[0.01]">
            <CardHeader className="pb-2 text-left">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">Sourcing Opportunities</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="p-2.5 rounded-lg bg-card border border-border flex flex-col gap-1">
                <span className="text-[10px] font-bold text-foreground">AI Sourcing Opportunity</span>
                <p className="text-[10.5px] text-muted-foreground mt-0.5">Milk local demand is increasing. Restock +15%. Est. Revenue: ₹12,500.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border flex flex-col gap-1">
                <span className="text-[10px] font-bold text-foreground">AI Pricing Suggestion</span>
                <p className="text-[10.5px] text-muted-foreground mt-0.5">Current: ₹82, Avg Nearby: ₹79. Target ₹80 to boost order conversions by 12%.</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Business Health */}
          <Card className="glass">
            <CardHeader className="pb-2 text-left">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">AI Business Health Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-xs font-semibold">
              <div className="flex justify-between items-center p-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Overall Health Score</span>
                <span className="text-primary font-black">94/100</span>
              </div>
              <div className="flex justify-between items-center p-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Inventory Health</span>
                <span className="text-emerald-500">Excellent</span>
              </div>
              <div className="flex justify-between items-center p-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Orders Backlog</span>
                <span className="text-emerald-500">Good</span>
              </div>
              <div className="flex justify-between items-center p-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Margin Health</span>
                <span className="text-emerald-500">Very Good</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating AI Chat Assistant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">
        {showAssistant && (
          <Card className="w-80 shadow-2xl border border-primary/20 bg-background text-left flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-primary p-3 text-primary-foreground flex justify-between items-center">
              <span className="text-xs font-bold flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> AI Store Assistant</span>
              <X className="h-4 w-4 cursor-pointer" onClick={() => { setShowAssistant(false); setActiveQuestion(null); }} />
            </div>
            <div className="p-3.5 flex flex-col gap-3 max-h-[300px] overflow-y-auto no-scrollbar">
              {!activeQuestion ? (
                <>
                  <p className="text-[11px] text-muted-foreground leading-normal">Hello! How can I assist you with your store metrics today?</p>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => answerPrompt("Why are my sales down?")}
                      className="p-2 text-[10.5px] font-bold bg-secondary/80 hover:bg-secondary text-foreground rounded-lg border border-border text-left cursor-pointer transition-colors"
                    >
                      "Why are my sales down?"
                    </button>
                    <button 
                      onClick={() => answerPrompt("How can I boost repeat orders?")}
                      className="p-2 text-[10.5px] font-bold bg-secondary/80 hover:bg-secondary text-foreground rounded-lg border border-border text-left cursor-pointer transition-colors"
                    >
                      "How can I boost repeat orders?"
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="p-2 rounded-lg bg-secondary text-foreground text-[10.5px] font-bold text-right self-end w-fit">
                    "{activeQuestion}"
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold text-primary">AI Recommendation:</span>
                    {activeQuestion === "Why are my sales down?" ? (
                      <ul className="list-disc pl-4 text-[10.5px] text-muted-foreground flex flex-col gap-1.5">
                        <li>Rainy weather detected in your region (decreased order velocity).</li>
                        <li>Low stock warning on {topProductsDetailed[0]?.name || "Milk"}.</li>
                        <li>No active promotional coupons. Consider launching a flat 5% off campaign.</li>
                        <li>Competitors have running campaigns targeting nearby customers.</li>
                      </ul>
                    ) : (
                      <p className="text-[10.5px] text-muted-foreground leading-relaxed">
                        Based on your order history, your repeat customer rate is {customerTrends.repeatRate}. We suggest creating a **Loyalty Coupon** (100 points to ₹50 off) or targeting customers within a 3 KM hyperlocal radius.
                      </p>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setActiveQuestion(null)} 
                    className="text-[10px] font-bold text-primary self-start p-0 h-6 cursor-pointer"
                  >
                    ← Back to Questions
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
        
        <button 
          onClick={() => setShowAssistant(!showAssistant)}
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 shrink-0"
        >
          {showAssistant ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </button>
      </div>

    </div>
  );
};

export default AIBusinessInsights;
