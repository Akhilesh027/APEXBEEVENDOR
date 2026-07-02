import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Megaphone, Plus, Sliders, TrendingUp, MousePointerClick, Eye, Landmark, Pause, Play, XCircle } from 'lucide-react';
import type { AdCampaign } from '../types';

export const Advertisement: React.FC = () => {
  const { ads: contextAds, addAd } = useVendor();
  const [ads, setAds] = useState<AdCampaign[]>(contextAds);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [cpc, setCpc] = useState(5.0);

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !budget) return;

    const newAd: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'startDate'> = {
      title,
      budget: parseFloat(budget),
      cpc,
      status: 'Active'
    };

    addAd(newAd);
    // Add locally to state
    const localNewAd: AdCampaign = {
      ...newAd,
      id: `AD-${Math.floor(100 + Math.random() * 900)}`,
      impressions: 0,
      clicks: 0,
      startDate: new Date().toISOString().split('T')[0]
    };
    setAds(prev => [localNewAd, ...prev]);

    setTitle('');
    setBudget('');
    setCpc(5.0);
    setShowForm(false);
  };

  const toggleAdStatus = (adId: string) => {
    setAds(prev =>
      prev.map(ad => {
        if (ad.id === adId) {
          const nextStatus = ad.status === 'Active' ? 'Paused' as const : 'Active' as const;
          return { ...ad, status: nextStatus };
        }
        return ad;
      })
    );
  };

  const deleteAd = (adId: string) => {
    setAds(prev => prev.filter(a => a.id !== adId));
  };

  // Calculations for stats summary
  const totalSpend = ads.reduce((acc, ad) => acc + (ad.clicks * ad.cpc), 0);
  const totalImpressions = ads.reduce((acc, ad) => acc + ad.impressions, 0);
  const totalClicks = ads.reduce((acc, ad) => acc + ad.clicks, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Marketing Ads & PPC Banners</h1>
          <p className="text-xs text-muted-foreground">Sponsor catalog products, configure bidding cost-per-click, and analyze impression conversion metrics.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-primary text-white py-2 rounded-lg font-bold cursor-pointer text-xs self-start sm:self-auto"
        >
          {showForm ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel Campaign' : 'Create Ad Campaign'}
        </Button>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1"><Landmark className="h-3.5 w-3.5 text-primary" /> Dynamic Budget Spent</span>
            <span className="text-xl font-extrabold text-foreground">₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">Across all launched banner runs</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-indigo-500" /> Impressions Served</span>
            <span className="text-xl font-extrabold text-foreground">{totalImpressions.toLocaleString()}</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">Customer screens rendered</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1"><MousePointerClick className="h-3.5 w-3.5 text-emerald-500" /> Clicks Captured</span>
            <span className="text-xl font-extrabold text-foreground">{totalClicks.toLocaleString()}</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">Redirected buyers to product page</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-amber-500" /> Average CTR</span>
            <span className="text-xl font-extrabold text-foreground">{avgCtr.toFixed(2)}%</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">Click-Through-Rate efficiency score</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campaign Launcher Form */}
        {showForm && (
          <div className="lg:col-span-4">
            <Card className="glass h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-bold">New Ad Creator</CardTitle>
                <CardDescription>Target products with budget sliders</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAd} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Campaign Title Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Kurti Clearance Banner"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Campaign Total Budget (₹) *</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 5000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                      <label>Cost-Per-Click Bid (CPC)</label>
                      <span className="text-primary font-mono font-bold">₹{cpc.toFixed(1)} / click</span>
                    </div>
                    <input
                      type="range"
                      min="2.0"
                      max="25.0"
                      step="0.5"
                      value={cpc}
                      onChange={(e) => setCpc(parseFloat(e.target.value))}
                      className="w-full accent-primary bg-secondary/80 h-1.5 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 leading-normal">
                      Higher bids improve product placement rank on the customer marketplace feed.
                    </span>
                  </div>
                  <Button type="submit" className="w-full mt-2 cursor-pointer bg-primary text-white font-bold h-9">
                    Launch Ad Campaign
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ads Registry Table */}
        <div className={showForm ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Megaphone className="h-4.5 w-4.5 text-primary" /> Active Marketing Campaigns
              </CardTitle>
              <CardDescription>Track running banner click stats and CPC spending rates</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Details</TableHead>
                    <TableHead className="text-right">Max Budget (₹)</TableHead>
                    <TableHead className="text-right">CPC Bid (₹)</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Total Spent (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ads.map(ad => {
                    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0.0;
                    const spent = ad.clicks * ad.cpc;
                    return (
                      <TableRow key={ad.id} className="align-middle">
                        <TableCell className="font-bold text-foreground">
                          <div>{ad.title}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">ID: {ad.id} • Started: {ad.startDate}</div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{ad.budget.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-primary font-bold">
                          ₹{ad.cpc.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground font-semibold">
                          {ad.impressions.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-foreground font-bold">
                          {ad.clicks.toLocaleString()}
                          <div className="text-[9px] text-emerald-500 font-bold">CTR: {ctr.toFixed(2)}%</div>
                        </TableCell>
                        <TableCell className="text-right text-indigo-500 font-extrabold">
                          ₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ad.status === 'Active' ? 'success' : ad.status === 'Paused' ? 'warning' : 'secondary'}>
                            {ad.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleAdStatus(ad.id)}
                              className="h-7 px-2 flex items-center justify-center gap-1 cursor-pointer text-xs"
                            >
                              {ad.status === 'Active' ? (
                                <>
                                  <Pause className="h-3 w-3" /> Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-3 w-3" /> Resume
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAd(ad.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer rounded-lg inline-flex items-center justify-center"
                            >
                              <Sliders className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {ads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-xs text-muted-foreground">
                        No advertising campaigns running. Click "Create Ad Campaign" to target buyers.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Advertisement;
