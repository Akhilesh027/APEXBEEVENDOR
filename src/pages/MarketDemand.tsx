import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { 
  Compass, 
  Search, 
  TrendingUp, 
  MapPin, 
  Lightbulb, 
  PlusCircle 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useVendor } from '../context/VendorContext';

export const MarketDemand: React.FC = () => {
  const { setCurrentPage } = useVendor();
  const [activeRadius, setActiveRadius] = useState<'5km' | '10km' | '20km'>('10km');

  // Hyperlocal trending items based on radius
  const hyperlocalDemandData = {
    '5km': [
      { name: 'Indiranagar', sales: 120, items: 'Cotton Saree, Crop Tops' },
      { name: 'Koramangala', sales: 250, items: 'Oversized Tees, Denim Jackets' },
      { name: 'HSR Layout', sales: 180, items: 'Ethnic Wear, Casual Shirts' }
    ],
    '10km': [
      { name: 'Indiranagar', sales: 340, items: 'Cotton Saree, Crop Tops, Cargo Pants' },
      { name: 'Koramangala', sales: 480, items: 'Oversized Tees, Denim, Sneakers' },
      { name: 'HSR Layout', sales: 390, items: 'Ethnic Wear, Shirts, Kurta Sets' },
      { name: 'Whitefield', sales: 520, items: 'Formal Shirts, Office Trousers, Blouses' },
      { name: 'Jayanagar', sales: 290, items: 'Silk Saree, Gold Jewelry, Salwar' }
    ],
    '20km': [
      { name: 'Indiranagar', sales: 840, items: 'Apparel, Footwear' },
      { name: 'Koramangala', sales: 1120, items: 'Apparel, Accessories, Tech' },
      { name: 'HSR Layout', sales: 940, items: 'Fashion, Home & Kitchen' },
      { name: 'Whitefield', sales: 1250, items: 'Formalwear, Electronics' },
      { name: 'Jayanagar', sales: 730, items: 'Traditional Wear, Handloom' },
      { name: 'Malleshwaram', sales: 610, items: 'Traditional Saree, Puja Items' },
      { name: 'Electronic City', sales: 520, items: 'Backpacks, T-Shirts, Gadgets' }
    ]
  };

  // Monthly demand trend charts
  const trendChartData = [
    { month: 'Jan', searches: 2400, listings: 400 },
    { month: 'Feb', searches: 2900, listings: 450 },
    { month: 'Mar', searches: 3800, listings: 520 },
    { month: 'Apr', searches: 3500, listings: 550 },
    { month: 'May', searches: 4900, listings: 610 },
    { month: 'Jun', searches: 5600, listings: 680 }
  ];

  // Top Searched Keywords
  const trendingSearches = [
    { term: "Oversized cotton t-shirt", searches: "8,450", growth: "+42%", category: "Men's Fashion" },
    { term: "Floral summer dress", searches: "6,920", growth: "+28%", category: "Women's Fashion" },
    { term: "Linen formal shirt", searches: "5,310", growth: "+15%", category: "Men's Fashion" },
    { term: "Anarkali kurta set with dupatta", searches: "4,820", growth: "+54%", category: "Ethnic Wear" },
    { term: "High-waist mom jeans", searches: "3,940", growth: "+19%", category: "Women's Fashion" },
    { term: "Waterproof sports backpack", searches: "3,110", growth: "+8%", category: "Accessories" }
  ];

  // High-Opportunity Catalog Gaps (High Search volume but low seller coverage)
  const catalogGaps = [
    {
      productName: "Men's Corduroy Jackets",
      searchVolume: "4,500/mo",
      competition: "Low",
      avgSellingPrice: "₹1,899",
      targetCategory: "Men's Outwear"
    },
    {
      productName: "Chikankari Handcrafted Saree",
      searchVolume: "6,200/mo",
      competition: "Medium",
      avgSellingPrice: "₹3,499",
      targetCategory: "Traditional Wear"
    },
    {
      productName: "Recycled Fabric Tote Bag",
      searchVolume: "2,850/mo",
      competition: "Low",
      avgSellingPrice: "₹599",
      targetCategory: "Accessories"
    },
    {
      productName: "Linen Wide-Leg Trousers",
      searchVolume: "3,100/mo",
      competition: "Low",
      avgSellingPrice: "₹1,299",
      targetCategory: "Women's Pants"
    }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Compass className="h-6 w-6 text-cyan-500 animate-pulse" /> Market Demand Center
          </h1>
          <p className="text-xs text-muted-foreground">Discover customer shopping trends, search queries, and hyperlocal sales opportunities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Market Demand Trend Chart */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="glass">
            <CardHeader className="pb-3 text-left">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-primary" /> Overall Demand & Listing Trends
              </CardTitle>
              <CardDescription>Compares search interest (clicks) against total available seller listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData}>
                    <defs>
                      <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" name="Searches / Clicks" dataKey="searches" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSearches)" />
                    <Area type="monotone" name="Available Listings" dataKey="listings" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorListings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Hyperlocal Analytics */}
          <Card className="glass">
            <CardHeader className="pb-3 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex flex-col">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-primary" /> Hyperlocal Nearby Demand
                  </CardTitle>
                  <CardDescription>View area order volumes and popular category products nearby</CardDescription>
                </div>
                {/* Radius Buttons */}
                <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/40">
                  {(['5km', '10km', '20km'] as const).map(rad => (
                    <button
                      key={rad}
                      onClick={() => setActiveRadius(rad)}
                      className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-colors ${activeRadius === rad ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {rad} Radius
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location Area</TableHead>
                      <TableHead>Order Density / mo</TableHead>
                      <TableHead>Trending Customer Search Items</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hyperlocalDemandData[activeRadius].map((loc, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/10">
                        <TableCell className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {loc.name}
                        </TableCell>
                        <TableCell className="text-xs font-extrabold text-foreground">{loc.sales} Orders</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">{loc.items}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setCurrentPage('add-product')}
                            className="cursor-pointer h-7 text-[10px]"
                          >
                            Sell Here
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Searched Keywords and Opportunities list */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Catalog Gaps Opportunities */}
          <Card className="glass border border-amber-500/20">
            <CardHeader className="text-left">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Lightbulb className="h-5 w-5 text-amber-500 animate-bounce" /> Opportunities (Catalog Gaps)
              </CardTitle>
              <CardDescription>High search queries with very low active seller listings</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3.5 text-left">
              {catalogGaps.map((gap, index) => (
                <div key={index} className="p-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 rounded-xl flex flex-col gap-2 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-extrabold text-foreground truncate">{gap.productName}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">{gap.targetCategory}</span>
                    </div>
                    <Badge variant="warning" className="text-[9px] px-1.5 py-0">Gap Opportunity</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground pt-1 border-t border-border/30">
                    <span>Searches: <span className="text-foreground font-black">{gap.searchVolume}</span></span>
                    <span>Price Est: <span className="text-foreground font-black">{gap.avgSellingPrice}</span></span>
                  </div>

                  <Button 
                    onClick={() => setCurrentPage('add-product')}
                    size="sm" 
                    className="w-full h-7 text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer mt-1 flex items-center gap-1 justify-center"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Create Product Listing
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Searches list */}
          <Card className="glass">
            <CardHeader className="text-left">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Search className="h-4.5 w-4.5 text-primary" /> Top Searched Keywords
              </CardTitle>
              <CardDescription>Most searched terms in your categories</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-left">
              {trendingSearches.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:bg-muted/10 transition-colors">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">{item.term}</span>
                    <span className="text-[9px] text-muted-foreground">{item.category}</span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-0.5">
                    <span className="text-xs font-extrabold text-foreground">{item.searches}</span>
                    <span className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" /> {item.growth}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
