import React, { useState, useMemo } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Gift, 
  Plus, 
  Calendar, 
  Tag, 
  Trash2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Smartphone, 
  Sparkles
} from 'lucide-react';
import type { CouponItem } from '../types';

export const CouponsOffers: React.FC = () => {
  const { coupons: contextCoupons, addCoupon, deleteCoupon } = useVendor();
  const [showForm, setShowForm] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<CouponItem['discountType']>('Percentage');
  const [value, setValue] = useState('');
  const [minSubtotal, setMinSubtotal] = useState('');
  const [expiryDate, setExpiryDate] = useState('2026-07-31');

  // Advanced settings states
  const [couponType, setCouponType] = useState<'Standard' | 'Free Delivery' | 'Free Product' | 'Buy 1 Get 1' | 'Cashback' | 'Wallet Credit'>('Standard');
  const [applicableOn, setApplicableOn] = useState('Entire Store');
  const [eligibility, setEligibility] = useState('All Customers');
  const [usageRule, setUsageRule] = useState('Unlimited');
  const [campaignScope, setCampaignScope] = useState<'Vendor' | 'Platform'>('Vendor');
  const [radiusKm, setRadiusKm] = useState('Entire Area');

  const [filterTab, setFilterTab] = useState<'all' | 'Active' | 'Expired'>('all');

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value || !minSubtotal) return;

    let benefitVal = parseFloat(value);
    // Adjust discount value for standard or free delivery
    if (couponType === 'Free Delivery') benefitVal = 0;

    const newCoupon: CouponItem = {
      code: code.toUpperCase().replace(/\s+/g, ''),
      discountType,
      value: benefitVal,
      minSubtotal: parseFloat(minSubtotal),
      expiryDate,
      usageCount: 0,
      status: 'Active'
    };

    const success = await addCoupon(newCoupon);
    if (success) {
      setCode('');
      setValue('');
      setMinSubtotal('');
      setShowForm(false);
    }
  };

  const handleApplyTemplate = (type: string) => {
    setShowForm(true);
    if (type === 'Weekend Sale') {
      setCode('WEEKEND20');
      setDiscountType('Percentage');
      setValue('20');
      setMinSubtotal('500');
      setExpiryDate('2026-07-20');
    } else if (type === 'Clearance') {
      setCode('CLEAR50');
      setDiscountType('Percentage');
      setValue('50');
      setMinSubtotal('1000');
      setExpiryDate('2026-07-31');
    } else if (type === 'First Buy') {
      setCode('WELCOME100');
      setDiscountType('Fixed Amount');
      setValue('100');
      setMinSubtotal('300');
      setExpiryDate('2026-08-31');
      setEligibility('New Customers');
    } else if (type === 'B1G1') {
      setCode('FREEBEE');
      setDiscountType('Percentage');
      setValue('100');
      setMinSubtotal('600');
      setCouponType('Buy 1 Get 1');
    }
  };

  const handleDuplicate = (c: CouponItem) => {
    setCode(`${c.code}DUP`);
    setDiscountType(c.discountType);
    setValue(String(c.value));
    setMinSubtotal(String(c.minSubtotal));
    setExpiryDate(c.expiryDate);
    setShowForm(true);
  };

  // Coupons filter logic
  const filteredCoupons = contextCoupons.filter(c => {
    if (filterTab === 'all') return true;
    return c.status === filterTab;
  });

  // Calculate statistics dashboard cards
  const statsSummary = useMemo(() => {
    const active = contextCoupons.filter(c => c.status === 'Active').length;
    const usage = contextCoupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
    const revenue = usage * 820; // Avg order value estimated
    const topCoupon = [...contextCoupons].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))[0]?.code || 'N/A';
    return { active, usage, revenue, topCoupon };
  }, [contextCoupons]);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Promotions Center</h1>
          <p className="text-xs text-muted-foreground">Configure discount vouchers, design loyalty programs, and audit active coupon conversions.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-primary text-white py-2 rounded-lg font-bold cursor-pointer text-xs self-start sm:self-auto"
        >
          {showForm ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel Campaign' : 'Launch New Campaign'}
        </Button>
      </div>

      {/* AI Promotion Recommendation Alert */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground font-semibold flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>AI Insight: Sales for honey are slowing. Recommend launching a <strong>Flat 5% Coupon</strong> to generate an expected +16 orders.</span>
        </span>
        <Button size="sm" onClick={() => handleApplyTemplate('First Buy')} className="h-7 text-[10px] font-bold">Apply Suggestion</Button>
      </div>

      {/* Dashboard Stats Cards */}
      {/* Dashboard Stats & Conversion Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left side: Stats summary cards */}
        <div className="lg:col-span-8 grid grid-cols-2 gap-4 h-full">
          <Card className="glass flex flex-col justify-center">
            <CardContent className="p-4 flex flex-col text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Coupons</span>
              <span className="text-lg font-extrabold text-foreground mt-1">{statsSummary.active} Vouchers</span>
            </CardContent>
          </Card>
          <Card className="glass flex flex-col justify-center">
            <CardContent className="p-4 flex flex-col text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Today's Usage</span>
              <span className="text-lg font-extrabold text-foreground mt-1">{statsSummary.usage} checkouts</span>
            </CardContent>
          </Card>
          <Card className="glass flex flex-col justify-center">
            <CardContent className="p-4 flex flex-col text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Revenue Generated</span>
              <span className="text-lg font-extrabold text-primary mt-1">₹{statsSummary.revenue.toLocaleString('en-IN')}</span>
            </CardContent>
          </Card>
          <Card className="glass flex flex-col justify-center">
            <CardContent className="p-4 flex flex-col text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Top Performing Coupon</span>
              <span className="text-lg font-extrabold text-indigo-500 mt-1">{statsSummary.topCoupon}</span>
            </CardContent>
          </Card>
        </div>

        {/* Right side: Voucher Conversion Chart */}
        <Card className="lg:col-span-4 glass">
          <CardHeader className="pb-2 text-left">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Voucher Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 flex flex-col justify-end h-28 gap-2">
            <div className="flex items-end justify-around h-full border-b border-border/40 pb-1.5 gap-2">
              {[
                { label: 'WEEKEND20', val: '14.2%', h: '60%' },
                { label: 'WELCOME100', val: '9.8%', h: '40%' },
                { label: 'CLEAR50', val: '18.5%', h: '80%' },
                { label: 'FREEBEE', val: '4.2%', h: '20%' }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-1 w-full group">
                  <span className="text-[7.5px] font-black text-foreground opacity-0 group-hover:opacity-100 transition-opacity">{item.val}</span>
                  <div className="w-4 bg-primary/80 group-hover:bg-primary rounded-t transition-all duration-300" style={{ height: item.h }} />
                  <span className="text-[8px] font-bold truncate max-w-[40px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ready-to-use Templates Row */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-muted-foreground uppercase pl-1">Quick Start Campaign Templates</span>
        <div className="flex flex-wrap gap-2">
          {['Weekend Sale', 'Clearance', 'First Buy', 'B1G1'].map(t => (
            <Button 
              key={t}
              onClick={() => handleApplyTemplate(t)} 
              variant="outline" 
              className="text-[10.5px] font-bold border-border bg-background hover:bg-muted py-1 h-8 shrink-0 cursor-pointer"
            >
              🚀 {t} Template
            </Button>
          ))}
        </div>
      </div>

      {/* Main Builder & Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Promotion Builder Form (Left side) */}
        {showForm && (
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="glass h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-bold">New Coupon Builder</CardTitle>
                <CardDescription>Configure discount settings, eligibility, and scopes</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCoupon} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Promo Code Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. BEEFESTIVE25"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Promo Code Type</label>
                    <select
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value as any)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    >
                      <option value="Standard">Standard Discount</option>
                      <option value="Free Delivery">Free Delivery</option>
                      <option value="Free Product">Free Gift Product</option>
                      <option value="Buy 1 Get 1">Buy 1 Get 1 (B1G1)</option>
                      <option value="Cashback">Cashback</option>
                      <option value="Wallet Credit">Direct Wallet Credit</option>
                    </select>
                  </div>

                  {couponType !== 'Free Delivery' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-muted-foreground">Discount Structure *</label>
                        <select
                          value={discountType}
                          onChange={(e) => setDiscountType(e.target.value as any)}
                          className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                        >
                          <option value="Percentage">Percentage (%)</option>
                          <option value="Fixed Amount">Fixed Amount (₹)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-muted-foreground">Benefit Value *</label>
                        <input
                          required
                          type="number"
                          placeholder={discountType === 'Percentage' ? 'e.g. 15' : 'e.g. 500'}
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Min Order Amount (₹)</label>
                      <input
                        required
                        type="number"
                        placeholder="e.g. 1000"
                        value={minSubtotal}
                        onChange={(e) => setMinSubtotal(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Expiry Date *</label>
                      <input
                        required
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Advanced Settings Accordion */}
                  <div className="border border-border/60 rounded-xl overflow-hidden mt-1">
                    <button
                      type="button"
                      onClick={() => setAdvancedOpen(!advancedOpen)}
                      className="w-full bg-secondary/35 px-4 py-2 text-xs font-bold text-foreground flex items-center justify-between cursor-pointer border-none"
                    >
                      <span>Advanced Campaign Rules</span>
                      {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {advancedOpen && (
                      <div className="p-3 bg-background flex flex-col gap-3 border-t border-border/60">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Applicable Catalog scope</label>
                          <select
                            value={applicableOn}
                            onChange={(e) => setApplicableOn(e.target.value)}
                            className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none"
                          >
                            <option value="Entire Store">Entire Store Products</option>
                            <option value="Category">Specific Product Category</option>
                            <option value="Brand">Specific Brand</option>
                            <option value="Subscription Products">Subscription Orders Only</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Customer Eligibility</label>
                          <select
                            value={eligibility}
                            onChange={(e) => setEligibility(e.target.value)}
                            className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none"
                          >
                            <option value="All Customers">All Customer Segments</option>
                            <option value="New Customers">First-time Buyers Only</option>
                            <option value="VIP Customers">VIP Premium Customers Only</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Usage Frequency</label>
                            <select
                              value={usageRule}
                              onChange={(e) => setUsageRule(e.target.value)}
                              className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none"
                            >
                              <option value="Unlimited">Unlimited Usage</option>
                              <option value="One Per User">One Per Customer</option>
                              <option value="Once Per Month">Once Per Month</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Hyperlocal Radius</label>
                            <select
                              value={radiusKm}
                              onChange={(e) => setRadiusKm(e.target.value)}
                              className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none"
                            >
                              <option value="Entire Area">Global Delivery Area</option>
                              <option value="Within 3 KM">Hyperlocal (Within 3 KM)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Campaign Ownership</label>
                          <select
                            value={campaignScope}
                            onChange={(e) => setCampaignScope(e.target.value as any)}
                            className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none"
                          >
                            <option value="Vendor">Vendor Campaign (My storefront only)</option>
                            <option value="Platform">Platform Campaign (Joint sponsorship)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full mt-2 cursor-pointer bg-primary text-white font-bold h-9">
                    Deploy Promo Offer
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Interactive Customer App Coupon Preview */}
            <Card className="glass border border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold flex items-center gap-1.5"><Smartphone className="h-4 w-4" /> Customer App Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex justify-center bg-secondary/10">
                <div className="w-64 border-2 border-dashed border-primary/40 bg-background rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-md relative overflow-hidden">
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Coupon Code</span>
                    <span className="font-mono text-sm font-extrabold text-primary uppercase mt-0.5">{code || "DISCOUNT20"}</span>
                    <span className="text-[9px] text-muted-foreground mt-1">Min. order ₹{minSubtotal || "0"} • Expiry: {expiryDate}</span>
                  </div>
                  <div className="px-2.5 py-1 bg-primary text-primary-foreground font-black text-xs rounded-md shrink-0">
                    {discountType === 'Percentage' ? `${value || "20"}% OFF` : `₹${value || "50"} OFF`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Coupons Directory table (Right side) */}
        <div className={showForm ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Gift className="h-4.5 w-4.5 text-primary" /> Promotional Campaign Registry
                </CardTitle>
                <CardDescription>Active and expired codes configured for checkout</CardDescription>
              </div>

              {/* Status Tabs */}
              <div className="flex gap-1 border border-border/60 p-0.5 rounded-lg bg-secondary/30 shrink-0">
                {(['all', 'Active', 'Expired'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      filterTab === tab ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'all' ? 'All Codes' : tab}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Benefit / Discount</TableHead>
                    <TableHead>Min. Order</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map(coupon => (
                    <TableRow key={coupon._id || coupon.code} className="align-middle">
                      <TableCell className="font-mono font-bold text-sm text-primary">
                        <span className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                          <Tag className="h-3 w-3" /> {coupon.code}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        {coupon.discountType === 'Percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        ₹{coupon.minSubtotal.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-semibold flex items-center gap-1 h-12">
                        <Calendar className="h-3.5 w-3.5" /> {coupon.expiryDate}
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        {coupon.usageCount} orders
                      </TableCell>
                      <TableCell>
                        <Badge variant={coupon.status === 'Active' ? 'success' : 'secondary'}>
                          {coupon.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleDuplicate(coupon)}
                            className="p-1 rounded bg-secondary hover:bg-secondary/80 border border-border/80 cursor-pointer"
                            title="Duplicate Campaign"
                          >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => coupon._id && deleteCoupon(coupon._id)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer rounded-lg inline-flex items-center justify-center"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCoupons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Gift className="h-10 w-10 text-muted-foreground/35 animate-bounce" />
                          <span className="font-bold text-foreground text-sm">Create your first promotional campaign.</span>
                          <span>Templates can launch promotions in 2 clicks.</span>
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

export default CouponsOffers;
