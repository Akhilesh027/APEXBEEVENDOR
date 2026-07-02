import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Building2, Star, MapPin, BarChart3, TrendingUp } from 'lucide-react';
import { useVendor } from '../context/VendorContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const SupplierNetwork: React.FC = () => {
  const { suppliers } = useVendor();

  const mockAnalyticsData = [
    { name: 'Surat Guild', score: 98, delivery: 99 },
    { name: 'Deccan Mills', score: 92, delivery: 95 },
    { name: 'Kanchipuram', score: 95, delivery: 97 },
    { name: 'Vedic Org', score: 88, delivery: 90 }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Supplier Network</h1>
          <p className="text-xs text-muted-foreground">Browse corporate manufacturers, wholesale distributors, check supplier ratings, and trace performance metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Supplier Analytics Chart */}
        <Card className="lg:col-span-7 text-left">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <BarChart3 className="h-4.5 w-4.5 text-primary" /> Supplier Performance Analytics
            </CardTitle>
            <CardDescription>Comparison of delivery reliability and inspection scores (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAnalyticsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                  <Bar dataKey="score" name="Inspection Score" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delivery" name="On-Time Delivery" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Sourcing Highlights */}
        <Card className="glass lg:col-span-5 h-fit text-left">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-primary" /> Sourcing Insights
            </CardTitle>
            <CardDescription>Key performance benchmarks for our active suppliers</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {[
              { label: 'Active Sourcing Contracts', val: '6 corporate agreements', desc: 'Secure legal frameworks and pricing locks' },
              { label: 'Network Defect Rate', val: '0.45%', desc: 'Kept well below the 1.5% target limit' },
              { label: 'Average Quotation Return', val: '4.2 hours', desc: 'Response latency for incoming wholesaler requests' }
            ].map((stat, idx) => (
              <div key={idx} className="p-3 border border-border/40 bg-card/60 rounded-xl hover:border-primary/45 transition-colors">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">{stat.label}</span>
                <span className="text-sm font-extrabold text-foreground">{stat.val}</span>
                <span className="text-[9px] text-muted-foreground block mt-0.5">{stat.desc}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Supplier Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {suppliers.map((sup, idx) => (
          <Card key={idx} className="hover:shadow-md transition-all">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-sm font-bold text-foreground">{sup.name}</CardTitle>
                    <span className="text-[10px] text-muted-foreground">{sup.type} • {sup.category}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[9px] py-0.5 px-1.5 font-bold">
                  {sup.location.split(',')[0]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="flex flex-col p-2 bg-muted/20 border border-border/40 rounded-lg">
                  <span className="text-[9px] text-muted-foreground">Rating Score</span>
                  <span className="font-extrabold text-foreground flex items-center justify-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {sup.rating}
                  </span>
                </div>
                <div className="flex flex-col p-2 bg-muted/20 border border-border/40 rounded-lg">
                  <span className="text-[9px] text-muted-foreground">Active Contracts</span>
                  <span className="font-extrabold text-foreground mt-0.5">{sup.activeContracts} POs</span>
                </div>
                <div className="flex flex-col p-2 bg-muted/20 border border-border/40 rounded-lg">
                  <span className="text-[9px] text-muted-foreground">On-Time Deliv.</span>
                  <span className="font-extrabold text-foreground mt-0.5">{sup.onTimeDelivery}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                <span>Office: {sup.location}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
