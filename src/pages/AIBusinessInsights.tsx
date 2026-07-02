import React from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

export const AIBusinessInsights: React.FC = () => {
  const { currentPage, stats } = useVendor();

  const isBestsellers = currentPage === 'ai-bestsellers';
  const isDeadinventory = currentPage === 'ai-deadinventory';
  const isReorders = currentPage === 'ai-reorders';
  const isForecast = currentPage === 'ai-forecast';
  const isCustomertrends = currentPage === 'ai-customertrends';
  const isSeasonal = currentPage === 'ai-seasonal';
  const isPredictions = currentPage === 'ai-predictions';

  // Mock forecasting charts data
  const forecastData = [
    { name: 'Jan', revenue: 95000, predicted: 95000 },
    { name: 'Feb', revenue: 110000, predicted: 110000 },
    { name: 'Mar', revenue: 135000, predicted: 135000 },
    { name: 'Apr', revenue: 125000, predicted: 125000 },
    { name: 'May', revenue: 148000, predicted: 148000 },
    { name: 'Jun', revenue: stats.totalRevenue, predicted: stats.totalRevenue },
    { name: 'Jul (AI)', revenue: null, predicted: stats.totalRevenue * 1.15 },
    { name: 'Aug (AI)', revenue: null, predicted: stats.totalRevenue * 1.28 },
    { name: 'Sep (AI)', revenue: null, predicted: stats.totalRevenue * 1.22 }
  ];

  const getHeaderTitle = () => {
    if (isBestsellers) return "AI Catalog Best Sellers";
    if (isDeadinventory) return "AI Dead Inventory auditor";
    if (isReorders) return "AI Smart Reorder Suggestion Engine";
    if (isForecast) return "AI Predictive Sales Trends";
    if (isCustomertrends) return "AI Customer Purchasing Tones";
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
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">{getHeaderTitle()}</h1>
          <p className="text-xs text-muted-foreground">{getHeaderDesc()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Recommendation Engine Cards */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main Visual Forecast Chart (isForecast / isPredictions) */}
          {(isForecast || isPredictions || currentPage === 'ai') && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-primary" /> Predictive Revenue Timeline (T+90 Days)
                </CardTitle>
                <CardDescription>Sales curves computed with seasonal waves and B2B order backlog values</CardDescription>
              </CardHeader>
              <CardContent>
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
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                      <Area type="monotone" dataKey="revenue" name="Actual Revenue (₹)" stroke="var(--primary)" strokeWidth={2.5} fill="url(#colorActual)" />
                      <Area type="monotone" dataKey="predicted" name="AI Predicted Revenue (₹)" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" fill="url(#colorPredicted)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Best Sellers view */}
          {(isBestsellers || currentPage === 'ai') && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Sparkles className="h-4.5 w-4.5 text-primary" /> Top Conversion Performers</CardTitle>
                <CardDescription>Products generating top customer review ratings and checkouts</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 flex items-center justify-between gap-4">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground">Classic Silk Nehru Jacket</span>
                    <span className="text-[10px] text-muted-foreground">Apparel • 48 units sold</span>
                  </div>
                  <Badge variant="success">98% Conversion</Badge>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 flex items-center justify-between gap-4">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground">Cotton Premium Printed Kurta</span>
                    <span className="text-[10px] text-muted-foreground">Apparel • 34 units sold</span>
                  </div>
                  <Badge variant="success">92% Conversion</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Dead Inventory view */}
          {isDeadinventory && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Slow Moving Dead Stock</CardTitle>
                <CardDescription>Products sitting in storage warehouses with zero checkout counts in 30 days</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 flex items-center justify-between gap-4">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground">Classic Silk Bandhgala Suit</span>
                    <span className="text-[10px] text-muted-foreground">Apparel • 0 units sold • 90 days sitting</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-border" onClick={() => alert("Simulating excess stock clearance coupon creation!")}>Clear Lot</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Reorder suggestions */}
          {isReorders && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Sparkles className="h-4.5 w-4.5 text-primary" /> Replenishment Orders suggestions</CardTitle>
                <CardDescription>Stock warnings calculated from demand velocities</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 flex items-center justify-between gap-4">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground">Classic Silk Nehru Jacket</span>
                    <span className="text-[10px] text-muted-foreground">Stock: 5 units remaining • Velocity: 12 units / week</span>
                  </div>
                  <Button size="sm" onClick={() => alert("Reorder invoice PO generated successfully for 50 units!")} className="h-7 text-xs font-bold">Auto-Reorder</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: AI Widget & Insights Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-left">
          <Card className="glass bg-primary/[0.03] border-primary/20">
            <CardHeader>
              <CardTitle className="text-xs font-bold flex items-center gap-1 text-primary">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" /> AI Business Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs leading-relaxed">
              <div className="p-2.5 rounded-lg bg-card/80 border border-border/60">
                <span className="font-bold text-foreground">💡 Inventory Alert:</span>
                <p className="text-muted-foreground mt-0.5">"Nehru Jackets are selling 3x faster in Pune. Consider moving 20 units from Mumbai warehouse to optimize transit times."</p>
              </div>
              <div className="p-2.5 rounded-lg bg-card/80 border border-border/60">
                <span className="font-bold text-foreground">📈 Pricing Strategy:</span>
                <p className="text-muted-foreground mt-0.5">"Competitor price on Linen Shirts dropped by 5%. Drop lot rate to ₹1499 to maintain top placement."</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIBusinessInsights;
