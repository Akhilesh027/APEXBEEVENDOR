import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const DemandForecasting: React.FC = () => {
  const forecastData = [
    { name: 'Week 1', demand: 120, baseline: 100 },
    { name: 'Week 2', demand: 150, baseline: 110 },
    { name: 'Week 3', demand: 180, baseline: 115 },
    { name: 'Week 4', demand: 240, baseline: 120 },
    { name: 'Week 5', demand: 290, baseline: 125 },
    { name: 'Week 6', demand: 350, baseline: 130 }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Demand Forecasting</h1>
          <p className="text-xs text-muted-foreground">Predict inventory replenishment speeds, browse fast/slow product categories, and check seasonal trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Demand prediction line chart */}
        <Card className="lg:col-span-8 text-left">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-primary" /> Predictive Sales Velocity (Next 6 Weeks)
            </CardTitle>
            <CardDescription>Estimated demand curve vs. historical baseline sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Area type="monotone" dataKey="demand" name="Predicted Demand" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDemand)" />
                  <Area type="monotone" dataKey="baseline" name="Historical Baseline" stroke="var(--muted-foreground)" strokeWidth={1.5} fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Replenishment alerts */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-left">
          <Card className="glass h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Stock Replenishment Guidelines
              </CardTitle>
              <CardDescription>Critical reorder warnings to avoid store stock-outs</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[
                { name: 'Classic Silk Nehru Jacket', daysLeft: '8 days left', action: 'Reorder 100 units' },
                { name: 'Cotton Premium Printed Kurta', daysLeft: '4 days left', action: 'Reorder 250 units' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 border border-amber-500/20 bg-amber-500/5 rounded-xl flex items-center justify-between gap-3 font-semibold text-xs">
                  <div className="flex flex-col">
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-[10px] text-amber-500 font-bold">{item.daysLeft}</span>
                  </div>
                  <Badge variant="warning" className="text-[9px] py-0.5 px-1.5 font-bold whitespace-nowrap">
                    {item.action}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <HelpCircle className="h-4.5 w-4.5 text-primary" /> Fast vs. Slow Moving Items
              </CardTitle>
              <CardDescription>Catalog sales frequency highlights</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-xs text-foreground/80 leading-normal">
              <div className="flex justify-between items-center border-b border-border/40 pb-1.5 font-bold">
                <span>Fast Moving (AOV High)</span>
                <span className="text-emerald-500">Oversized Tees, Sarees</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Slow Moving (AOV Low)</span>
                <span className="text-amber-500">Formal Shirts, Accessories</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
