import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MapPin, CheckCircle2, Plus } from 'lucide-react';
import { useVendor } from '../context/VendorContext';

export const TerritoryCoverage: React.FC = () => {
  const { territories } = useVendor();
  const [success, setSuccess] = useState<string | null>(null);
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [mandal, setMandal] = useState('');

  const handleRequestExpansion = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(`Territory expansion request submitted for ${mandal}, ${district}, ${stateName}!`);
    setStateName('');
    setDistrict('');
    setMandal('');
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Territory Coverage</h1>
          <p className="text-xs text-muted-foreground">Manage active states, districts, mandals, trace regional order density, and request franchise expansions.</p>
        </div>
      </div>

      {success && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold text-left">
          <CheckCircle2 className="h-4 w-4" /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Territory Map Mockup */}
        <Card className="lg:col-span-7 text-left flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-primary" /> Region Coverage Map
            </CardTitle>
            <CardDescription>Regional density map of active Business Partners and Mandals</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {/* SVG mockup of a coverage map */}
            <div className="w-full bg-secondary/30 rounded-xl p-4 border border-border/40 flex items-center justify-center relative">
              <svg className="w-full max-w-[400px] h-[220px] text-muted-foreground/30" viewBox="0 0 200 120">
                <path d="M 20 40 Q 50 10 90 30 T 170 20 T 190 70 T 130 110 T 60 100 Z" fill="currentColor" />
                {/* Active Pins */}
                <circle cx="50" cy="35" r="4" fill="var(--primary)" className="animate-ping" />
                <circle cx="50" cy="35" r="3.5" fill="var(--primary)" />
                
                <circle cx="110" cy="65" r="4" fill="var(--primary)" className="animate-ping" />
                <circle cx="110" cy="65" r="3.5" fill="var(--primary)" />

                <circle cx="140" cy="85" r="4" fill="var(--primary)" className="animate-ping" />
                <circle cx="140" cy="85" r="3.5" fill="var(--primary)" />
                
                <circle cx="85" cy="95" r="4" fill="#a855f7" />
                <circle cx="160" cy="40" r="4" fill="#a855f7" />
              </svg>
              <div className="absolute bottom-4 left-4 flex gap-3 text-[9px] bg-card p-1.5 rounded border border-border">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Active Mandals</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#a855f7]" /> Planned / Pipeline</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Territory Expansion Form */}
        <Card className="glass lg:col-span-5 h-fit text-left">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-primary" /> Request Territory Expansion
            </CardTitle>
            <CardDescription>File requests to lock mandals/districts for franchise allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestExpansion} className="flex flex-col gap-3 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">State Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">District *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Pune"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Mandal Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Pune Central"
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-2 cursor-pointer bg-primary text-white font-bold h-9">
                Submit Expansion Query
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Active Territory table */}
      <Card className="text-left">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Active Coverage Registry</CardTitle>
          <CardDescription>Assigned territories showing regional partner volumes and sales</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground font-bold bg-muted/20">
                  <th className="py-2.5 px-4">Territory ID</th>
                  <th className="py-2.5 px-4">State</th>
                  <th className="py-2.5 px-4">District</th>
                  <th className="py-2.5 px-4">Mandal Pinpoint</th>
                  <th className="py-2.5 px-4 text-center">Active Retailers</th>
                  <th className="py-2.5 px-4">Sales Volume</th>
                  <th className="py-2.5 px-4">Franchise Status</th>
                </tr>
              </thead>
              <tbody>
                {territories.map((ter, idx) => (
                  <tr key={idx} className="border-b border-border/40 hover:bg-muted/10 font-semibold text-foreground/80">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">{ter.id}</td>
                    <td className="py-3 px-4 text-foreground">{ter.state}</td>
                    <td className="py-3 px-4 text-foreground">{ter.district}</td>
                    <td className="py-3 px-4 text-muted-foreground">{ter.mandal}</td>
                    <td className="py-3 px-4 text-center text-foreground font-bold">{ter.activePartners} stores</td>
                    <td className="py-3 px-4 text-primary">₹{ter.salesVolume.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={ter.status === 'Active' ? 'success' : 'warning'} className="text-[9px] font-bold">
                        {ter.status}
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
