import React, { useState, useMemo } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Megaphone, 
  Plus, 
  Pause, 
  Play, 
  XCircle,
  Sparkles,
  Copy,
  Smartphone,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import type { AdCampaign } from '../types';

export const Advertisement: React.FC = () => {
  const { ads: contextAds, addAd, toggleAdStatus, deleteAd, products } = useVendor();
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);

  // Wizard States
  const [campaignTitle, setCampaignTitle] = useState('');
  const [objective, setObjective] = useState('Increase Sales');
  const [audience, setAudience] = useState('Within 5 KM');
  const [budget, setBudget] = useState('500');
  const [cpc, setCpc] = useState(5.0);
  const [selectedProductType, setSelectedProductType] = useState<'Single' | 'Multiple' | 'Category'>('Single');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [placement, setPlacement] = useState('Search Results');
  const [adPreviewTab, setAdPreviewTab] = useState<'home' | 'search' | 'product' | 'facebook'>('search');

  // Budget calculations derived dynamically
  const reachEstimation = useMemo(() => {
    const bVal = parseFloat(budget) || 0;
    const reach = Math.round(bVal * 4.8);
    const clicks = Math.round(reach * 0.133);
    const estOrders = Math.round(clicks * 0.0875);
    return { reach, clicks, orders: estOrders };
  }, [budget]);

  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle || !budget) return;

    const newAd: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'startDate'> = {
      title: campaignTitle,
      budget: parseFloat(budget),
      cpc,
      status: 'Active'
    };

    const success = await addAd(newAd);
    if (success) {
      setCampaignTitle('');
      setBudget('500');
      setCpc(5.0);
      setFormStep(1);
      setShowForm(false);
    }
  };

  const handleApplyTemplate = (type: string) => {
    setFormStep(1);
    setShowForm(true);
    if (type === 'Diwali') {
      setCampaignTitle('Diwali Sweet Special Banner');
      setObjective('Promote Offer');
      setAudience('Within 10 KM');
      setBudget('2000');
      setCpc(8.0);
    } else if (type === 'Clearance') {
      setCampaignTitle('Apparel stock clear CPC Run');
      setObjective('Increase Sales');
      setAudience('Entire City');
      setBudget('800');
      setCpc(4.5);
    } else if (type === 'Sankranti') {
      setCampaignTitle('Sankranti harvest grocery campaign');
      setObjective('Increase Store Visits');
      setAudience('Within 5 KM');
      setBudget('1200');
      setCpc(6.0);
    }
  };

  // Perform dashboard KPI aggregations based on database contextAds
  const dashboardStats = useMemo(() => {
    const running = contextAds.filter(a => a.status === 'Active').length;
    const impressions = contextAds.reduce((sum, a) => sum + (a.impressions || 0), 0);
    const clicks = contextAds.reduce((sum, a) => sum + (a.clicks || 0), 0);
    const spend = contextAds.reduce((sum, a) => sum + (a.clicks * a.cpc), 0);
    const revenue = spend * 3.5; // estimated ROI
    const roi = spend > 0 ? Math.round((revenue / spend) * 100) : 0;
    return { running, impressions, clicks, spend, revenue, roi };
  }, [contextAds]);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Promotions &amp; Ads</h1>
          <p className="text-xs text-muted-foreground">Sponsor products, configure geo-targeted campaigns, and audit bidding Cost-Per-Click metrics.</p>
        </div>
        <Button
          onClick={() => { setShowForm(!showForm); setFormStep(1); }}
          className="flex items-center gap-1.5 bg-primary text-white py-2 rounded-lg font-bold cursor-pointer text-xs self-start sm:self-auto"
        >
          {showForm ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel Campaign' : 'Create Ad Campaign'}
        </Button>
      </div>

      {/* AI Campaign Recommendation Alert */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground font-semibold flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>AI suggestion: Honey sales are down 18%. A <strong>₹500 campaign</strong> targeting buyers within 5 km will boost sales.</span>
        </span>
        <Button size="sm" onClick={() => handleApplyTemplate('Diwali')} className="h-7 text-[10px] font-bold">Launch AI Recommendation</Button>
      </div>

      {/* Performance Summary Dashboard cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex flex-col text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Running Ads</span>
            <span className="text-lg font-extrabold text-foreground mt-1">{dashboardStats.running} Active</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Impressions</span>
            <span className="text-lg font-extrabold text-foreground mt-1">{dashboardStats.impressions.toLocaleString()} views</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Ad Clicks</span>
            <span className="text-lg font-extrabold text-foreground mt-1">{dashboardStats.clicks.toLocaleString()} clicks</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Direct Revenue</span>
            <span className="text-lg font-extrabold text-primary mt-1">₹{dashboardStats.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Average ROI</span>
            <span className="text-lg font-extrabold text-indigo-500 mt-1">{dashboardStats.roi}%</span>
          </CardContent>
        </Card>
      </div>

      {/* Templates Row */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-muted-foreground uppercase pl-1">One-Click Festival Ad Templates</span>
        <div className="flex flex-wrap gap-2">
          {['Sankranti', 'Diwali', 'Clearance'].map(t => (
            <Button 
              key={t}
              onClick={() => handleApplyTemplate(t)}
              variant="outline" 
              className="text-[10.5px] font-bold border-border bg-background hover:bg-muted py-1 h-8 shrink-0 cursor-pointer"
            >
              🎉 {t} Template
            </Button>
          ))}
        </div>
      </div>

      {/* Main Form Wizard and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Campaign Builder Wizard Form */}
        {showForm && (
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="glass h-fit">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">Wizard Setup (Step {formStep}/5)</CardTitle>
                  <span className="text-[10px] text-muted-foreground font-bold">cost-per-click bidding</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4 text-left">
                {formStep === 1 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Campaign Title Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Diwali Sweets Clearance"
                        value={campaignTitle}
                        onChange={(e) => setCampaignTitle(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Campaign Objective</label>
                      <select
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                      >
                        <option value="Increase Sales">Increase Sales (Sponsor Catalog)</option>
                        <option value="Increase Store Visits">Increase Store Visits (Footfalls)</option>
                        <option value="Promote Offer">Promote Offer (Target Coupon)</option>
                        <option value="Promote Subscription">Promote Subscription (Sponsor Milk Run)</option>
                      </select>
                    </div>
                  </div>
                )}

                {formStep === 2 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Ad Targeting Radius</label>
                      <select
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                      >
                        <option value="Within 2 KM">Hyperlocal - Within 2 KM</option>
                        <option value="Within 5 KM">Close Area - Within 5 KM</option>
                        <option value="Within 10 KM">Mid-Range - Within 10 KM</option>
                        <option value="Entire City">Entire City</option>
                        <option value="Entire District">Entire District</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Ad Placement Screen</label>
                      <select
                        value={placement}
                        onChange={(e) => setPlacement(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                      >
                        <option value="Search Results">Search Results Banner</option>
                        <option value="Home Banner">Consumer Homepage Header</option>
                        <option value="Category Page">Category Header Feed</option>
                        <option value="Product Recommendation">Recommended Sourced List</option>
                      </select>
                    </div>
                  </div>
                )}

                {formStep === 3 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Daily Ad Budget (₹) *</label>
                      <input
                        required
                        type="number"
                        placeholder="e.g. 500"
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
                    </div>
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-[10.5px] leading-relaxed text-muted-foreground">
                      <div className="font-extrabold text-foreground mb-1">Live Reach Estimator:</div>
                      <div>Estimated Reach: <strong>{reachEstimation.reach} buyers</strong></div>
                      <div>Estimated Clicks: <strong>{reachEstimation.clicks} clicks</strong></div>
                      <div>Estimated Orders: <strong>{reachEstimation.orders} orders</strong></div>
                    </div>
                  </div>
                )}

                {formStep === 4 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Sponsorship Scope</label>
                      <select
                        value={selectedProductType}
                        onChange={(e) => setSelectedProductType(e.target.value as any)}
                        className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                      >
                        <option value="Single">Single Catalog Product</option>
                        <option value="Multiple">Multiple Products</option>
                        <option value="Category">Entire Category Range</option>
                      </select>
                    </div>
                    {selectedProductType === 'Single' && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-muted-foreground">Select Product *</label>
                        <select
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {formStep === 5 && (
                  <div className="flex flex-col gap-3.5 text-xs text-muted-foreground">
                    <div className="font-extrabold text-foreground border-b border-border/40 pb-1.5">Review Campaign Settings</div>
                    <div>Campaign: <strong className="text-foreground">{campaignTitle || "Unspecified"}</strong></div>
                    <div>Objective: <strong className="text-foreground">{objective}</strong></div>
                    <div>Audience: <strong className="text-foreground">{audience}</strong></div>
                    <div>Budget: <strong className="text-foreground">₹{budget}</strong> (CPC: ₹{cpc})</div>
                    <div>Product: <strong className="text-foreground">{selectedProductType === 'Single' ? selectedProduct?.name : "Category Sourcing"}</strong></div>
                    <Button onClick={handleLaunchCampaign} className="w-full mt-2 cursor-pointer bg-primary text-white font-bold h-9">
                      Launch Ad Campaign
                    </Button>
                  </div>
                )}

                {/* Wizard navigation buttons */}
                <div className="flex justify-between items-center border-t border-border/40 pt-3.5 mt-2">
                  <Button
                    disabled={formStep === 1}
                    onClick={() => setFormStep(prev => prev - 1)}
                    variant="outline"
                    className="h-8 text-xs font-bold px-3 flex items-center gap-1 cursor-pointer bg-background hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  {formStep < 5 ? (
                    <Button
                      onClick={() => setFormStep(prev => prev + 1)}
                      className="h-8 text-xs font-bold px-4 flex items-center gap-1 cursor-pointer"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Live Interactive Preview tabs */}
            <Card className="glass border border-border/80">
              <CardHeader className="pb-2 text-left">
                <CardTitle className="text-xs font-bold flex items-center gap-1.5"><Smartphone className="h-4 w-4" /> Ad Display Preview</CardTitle>
                <div className="flex gap-2 border-b border-border/30 pb-2 mt-2">
                  {['search', 'home', 'product', 'facebook'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAdPreviewTab(tab as any)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${adPreviewTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
                    >
                      {tab === 'search' ? 'Search Sponsored' : tab === 'home' ? 'Homepage Banner' : tab === 'product' ? 'Product Inline' : 'Facebook Post Mockup'}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-4 flex justify-center bg-secondary/10">
                {adPreviewTab === 'search' && (
                  <div className="w-64 bg-background border border-border rounded-xl p-3 flex flex-col gap-2 shadow-md">
                    <div className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded w-fit uppercase">Sponsored Product</div>
                    <div className="flex items-center gap-2 border-t border-border/30 pt-1.5">
                      <div className="h-10 w-10 bg-secondary/70 rounded shrink-0 flex items-center justify-center font-bold text-xs">Ad</div>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">{selectedProduct?.name || "Product Name"}</span>
                        <span className="text-[10px] text-primary font-black mt-0.5">₹{selectedProduct?.price || "250"}</span>
                      </div>
                    </div>
                  </div>
                )}
                {adPreviewTab === 'home' && (
                  <div className="w-64 h-24 bg-gradient-to-r from-primary to-purple-600 rounded-xl p-3 flex flex-col justify-between text-white shadow-md text-left">
                    <span className="text-[8px] bg-white/20 px-1.5 py-0.25 rounded font-black w-fit uppercase">Sponsor Promotion</span>
                    <span className="text-xs font-black truncate">{campaignTitle || "Diwali Sweets Clearance"}</span>
                    <span className="text-[9px] text-white/80">Claim flat discounts and fast door-delivery run now!</span>
                  </div>
                )}
                {adPreviewTab === 'product' && (
                  <div className="w-64 border border-primary/20 bg-primary/[0.02] p-2.5 rounded-lg flex justify-between items-center text-left text-[10px]">
                    <span className="text-foreground leading-normal">Get this item delivered free in <strong>Nellore</strong> area!</span>
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none select-none text-[8px] uppercase font-extrabold font-mono shrink-0">Free Delivery</Badge>
                  </div>
                )}
                {adPreviewTab === 'facebook' && (
                  <div className="w-64 bg-background border border-border rounded-xl p-3 flex flex-col gap-2.5 shadow-md text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center font-black text-[9px] text-primary">🐝</div>
                      <div className="flex flex-col">
                        <span className="text-[10.5px] font-black text-foreground leading-none">ApexBee Store Partner</span>
                        <span className="text-[8.5px] text-muted-foreground font-bold mt-0.5">Sponsored • Public</span>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-foreground leading-normal font-semibold">
                      Shop organic farm-harvest items direct from our store. Free delivery slots open in Nellore and Buchi Mandal this week!
                    </p>
                    <div className="h-20 bg-gradient-to-tr from-indigo-900 to-indigo-950 flex flex-col justify-end p-2 rounded-lg text-white font-extrabold text-[10px]">
                      <span>{selectedProduct?.name || "Premium Sourced Grocery"}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-muted-foreground border-t border-border/30 pt-1.5">
                      <span>👍 Like</span>
                      <span>💬 Comment</span>
                      <span>🔄 Share</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Campaigns Registry Table */}
        <div className={showForm ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Megaphone className="h-4.5 w-4.5 text-primary" /> Active Marketing Campaigns
              </CardTitle>
              <CardDescription>Track running ad budget spent, CPC bidding rates, and click details</CardDescription>
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
                    <TableHead className="text-right">Spent (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contextAds.map(ad => {
                    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0.0;
                    const spent = ad.clicks * ad.cpc;
                    return (
                      <TableRow key={ad.id} className="align-middle">
                        <TableCell className="font-bold text-foreground">
                          <div className="max-w-[120px] truncate" title={ad.title}>{ad.title}</div>
                          <div className="text-[9px] text-muted-foreground font-mono truncate max-w-[120px]">ID: {ad.id} • Started: {ad.startDate}</div>
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
                          ₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ad.status === 'Active' ? 'success' : ad.status === 'Paused' ? 'warning' : 'secondary'}>
                            {ad.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleAdStatus(ad.id)}
                              className="h-7 px-1.5 flex items-center justify-center gap-1 cursor-pointer text-[10px]"
                            >
                              {ad.status === 'Active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            </Button>
                            <button
                              onClick={() => handleApplyTemplate('Diwali')}
                              className="p-1 rounded bg-secondary hover:bg-secondary/80 border border-border/80 cursor-pointer"
                              title="Duplicate Campaign"
                            >
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAd(ad.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer rounded-lg inline-flex items-center justify-center animate-none"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {contextAds.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Megaphone className="h-10 w-10 text-muted-foreground/35 animate-bounce" />
                          <span className="font-bold text-foreground text-sm">Deploy your first advertising campaign.</span>
                          <span>Click "Create Ad Campaign" to design sponsored listings.</span>
                        </div>
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
