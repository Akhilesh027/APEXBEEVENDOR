import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ArrowLeftRight, Compass, Star, TrendingUp } from 'lucide-react';

export const SupplyChainHub: React.FC = () => {
  const activeSupplyChannels = [
    { id: "CHN-101", partner: "Surat Silk Guild", type: "Upstream (Manufacturer)", status: "Active", leadTime: "5 days", qualityScore: "98%", category: "Silk Blend Yarn" },
    { id: "CHN-105", partner: "Bengaluru Logistics Hub", type: "Courier & Freight Partner", status: "Active", leadTime: "2 days", qualityScore: "95%", category: "Logistics" },
    { id: "CHN-110", partner: "Mumbai Garment Retailers", type: "Downstream (Retailers Channel)", status: "Active", leadTime: "1 day", qualityScore: "99%", category: "Finished Apparel" }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Supply Chain Hub</h1>
          <p className="text-xs text-muted-foreground">Manage upstream manufacturers, freight distribution channels, lead times, and quality scores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Score card */}
        <Card className="glass text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-primary" /> Logistics Efficiency
            </CardTitle>
            <CardDescription>On-time shipments and dispatch pipelines</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-foreground">96.8%</span>
              <span className="text-xs text-emerald-500 font-bold">Excellent Courier Speed</span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div style={{ width: '96.8%' }} className="bg-primary h-full rounded-full" />
            </div>
            <span className="text-[10px] text-muted-foreground">Calculated across BlueDart, Delhivery, and self-freight runs over the past 30 days.</span>
          </CardContent>
        </Card>

        {/* Lead times card */}
        <Card className="glass text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Star className="h-4.5 w-4.5 text-primary" /> Downstream Retention
            </CardTitle>
            <CardDescription>Average retailer contract repeat rate</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-foreground">92.4%</span>
              <span className="text-xs text-emerald-500 font-bold">Stable Demand</span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div style={{ width: '92.4%' }} className="bg-emerald-500 h-full rounded-full" />
            </div>
            <span className="text-[10px] text-muted-foreground">Reflects active wholesaler-to-vendor procurement channels on the platform.</span>
          </CardContent>
        </Card>

        {/* Quality rate card */}
        <Card className="glass text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-primary" /> Supply Chain Security
            </CardTitle>
            <CardDescription>Quality checks inspection success rates</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-foreground">99.1%</span>
              <span className="text-xs text-emerald-500 font-bold">Approved Batch Rate</span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div style={{ width: '99.1%' }} className="bg-indigo-500 h-full rounded-full" />
            </div>
            <span className="text-[10px] text-muted-foreground">Product defects and shipping claims return rate are kept below standard thresholds.</span>
          </CardContent>
        </Card>
      </div>

      {/* Supply Channels Table */}
      <Card className="text-left">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <ArrowLeftRight className="h-4.5 w-4.5 text-primary" /> Active Supply Chain Channels
          </CardTitle>
          <CardDescription>Monitor upstream and downstream contracts and distribution pipelines</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground font-bold bg-muted/20">
                  <th className="py-2.5 px-4">Channel ID</th>
                  <th className="py-2.5 px-4">Supply Partner</th>
                  <th className="py-2.5 px-4">Partner Tier / Role</th>
                  <th className="py-2.5 px-4 text-center">Avg Lead Time</th>
                  <th className="py-2.5 px-4 text-center">Batch Quality</th>
                  <th className="py-2.5 px-4">Category Sourced</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeSupplyChannels.map((chn, idx) => (
                  <tr key={idx} className="border-b border-border/40 hover:bg-muted/10 font-semibold text-foreground/80">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">{chn.id}</td>
                    <td className="py-3 px-4 text-foreground">{chn.partner}</td>
                    <td className="py-3 px-4 text-muted-foreground">{chn.type}</td>
                    <td className="py-3 px-4 text-center text-foreground">{chn.leadTime}</td>
                    <td className="py-3 px-4 text-center text-primary">{chn.qualityScore}</td>
                    <td className="py-3 px-4 text-muted-foreground">{chn.category}</td>
                    <td className="py-3 px-4">
                      <Badge variant="success" className="text-[9px] py-0.5 px-1.5">
                        {chn.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
