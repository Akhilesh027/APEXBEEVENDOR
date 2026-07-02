import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Compass, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ManufacturerConnect: React.FC = () => {
  const [contractSuccess, setContractSuccess] = useState<string | null>(null);

  const handleCreateContract = (name: string) => {
    setContractSuccess(`Contract proposal sent to ${name}! Sourcing managers will review.`);
    setTimeout(() => setContractSuccess(null), 4000);
  };

  const manufacturerCatalogs = [
    { name: "Surat Silk Guild", catalog: "Ethnic Wear & Silk Blends", minOrder: "₹50,000", discount: "Up to 30%", capacity: "5,000 meters/month" },
    { name: "Deccan Cotton Mills", catalog: "Pure Linens & Cottons", minOrder: "₹25,000", discount: "Up to 25%", capacity: "10,000 meters/month" },
    { name: "Kanchipuram Silk Co", catalog: "Premium Zari Sarees", minOrder: "₹1,00,000", discount: "Up to 35%", capacity: "1,200 pieces/month" }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Manufacturer Connect</h1>
          <p className="text-xs text-muted-foreground">Source directly from raw materials manufacturers, request pricing catalogs, and sign direct supply contracts.</p>
        </div>
      </div>

      {contractSuccess && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold text-left">
          <CheckCircle2 className="h-4 w-4" /> {contractSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sourcing guidelines */}
        <Card className="glass text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-primary" /> Direct Procurement
            </CardTitle>
            <CardDescription>Cut out intermediate agents and buy directly</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs leading-normal">
            <p className="text-muted-foreground">ApexBee Business Partners can request direct fabric, yarn, and accessories shipments from factories.</p>
            <div className="bg-muted/30 p-2 rounded-lg border border-border/40 text-[10px] text-muted-foreground font-mono">
              BENEFITS: Zero agent commissions, verified raw fabric certification, secure logistics pipelines.
            </div>
          </CardContent>
        </Card>

        {/* Pricing comparison */}
        <Card className="glass text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-primary" /> Price Comparison Chart
            </CardTitle>
            <CardDescription>Compare wholesale and direct factory prices</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs text-foreground/80 leading-normal">
            <div className="flex justify-between items-center py-1.5 border-b border-border/40 font-bold">
              <span>Silk Blend Nehru Jacket</span>
              <span className="text-muted-foreground line-through">₹1,250 Wholesaler</span>
              <span className="text-primary">₹850 Direct</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/40 font-bold">
              <span>Printed Kurta Fabrics</span>
              <span className="text-muted-foreground line-through">₹450/m Wholesaler</span>
              <span className="text-primary">₹290/m Direct</span>
            </div>
          </CardContent>
        </Card>

        {/* Capacity planning */}
        <Card className="glass text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Star className="h-4.5 w-4.5 text-primary" /> Supply Contracts Tracker
            </CardTitle>
            <CardDescription>Manage legally locked price agreements</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs leading-normal">
            <p className="text-muted-foreground">Sign 3, 6, or 12 month bulk procurement contracts with manufacturers to shield from material price fluctuations.</p>
          </CardContent>
        </Card>
      </div>

      {/* Manufacturer directory list */}
      <div className="flex flex-col gap-4 text-left">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider pl-1">Manufacturer Directory Catalog</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {manufacturerCatalogs.map((m, idx) => (
            <Card key={idx} className="hover:shadow-md transition-all flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-base font-bold">{m.name}</CardTitle>
                <CardDescription>Catalog: {m.catalog}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col p-1.5 bg-muted/20 border border-border/40 rounded-lg">
                    <span className="text-[9px] text-muted-foreground">Minimum Order</span>
                    <span className="font-extrabold text-foreground mt-0.5">{m.minOrder}</span>
                  </div>
                  <div className="flex flex-col p-1.5 bg-muted/20 border border-border/40 rounded-lg">
                    <span className="text-[9px] text-muted-foreground">Contract Discount</span>
                    <span className="font-extrabold text-primary mt-0.5">{m.discount}</span>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  <strong>Production Capacity:</strong> {m.capacity}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCreateContract(m.name)}
                  className="w-full mt-2 cursor-pointer bg-primary text-white font-bold h-8 flex items-center justify-center gap-1"
                >
                  <span>Request Supply Contract</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
