import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Gift, Plus, Calendar, Tag, Trash2, XCircle } from 'lucide-react';
import type { CouponItem } from '../types';

export const CouponsOffers: React.FC = () => {
  const { coupons: contextCoupons, addCoupon, deleteCoupon } = useVendor();
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
  const [value, setValue] = useState('');
  const [minSubtotal, setMinSubtotal] = useState('');
  const [expiryDate, setExpiryDate] = useState('2026-07-31');
  const [filterTab, setFilterTab] = useState<'all' | 'Active' | 'Expired'>('all');

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value || !minSubtotal) return;

    const newCoupon: CouponItem = {
      code: code.toUpperCase().replace(/\s+/g, ''),
      discountType,
      value: parseFloat(value),
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

  const filteredCoupons = contextCoupons.filter(c => {
    if (filterTab === 'all') return true;
    return c.status === filterTab;
  });

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Coupons & Promo Offers</h1>
          <p className="text-xs text-muted-foreground">Configure retail discount vouchers, set minimum order criteria, and track conversion conversions.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-primary text-white py-2 rounded-lg font-bold cursor-pointer text-xs self-start sm:self-auto"
        >
          {showForm ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel Campaign' : 'Launch New Coupon'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Promotion Builder Form */}
        {showForm && (
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="glass h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-bold">New Coupon Builder</CardTitle>
                <CardDescription>Configure discount rules and validity periods</CardDescription>
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
                    <label className="text-xs font-bold text-muted-foreground">Discount Value *</label>
                    <input
                      required
                      type="number"
                      placeholder={discountType === 'Percentage' ? 'e.g. 15' : 'e.g. 500'}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Minimum Cart Subtotal (₹) *</label>
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
                  <Button type="submit" className="w-full mt-2 cursor-pointer bg-primary text-white font-bold h-9">
                    Deploy Promo Offer
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Coupons Directory */}
        <div className={showForm ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Gift className="h-4.5 w-4.5 text-primary" /> Promotional Coupon registry
                </CardTitle>
                <CardDescription>Active and expired codes configured for checkout</CardDescription>
              </div>

              {/* Status Tabs */}
              <div className="flex gap-1 border border-border/60 p-0.5 rounded-lg bg-secondary/30">
                {(['all', 'Active', 'Expired'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      filterTab === tab
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
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
                    <TableHead>Usage Limits</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map(coupon => (
                    <TableRow key={coupon.code} className="align-middle">
                      <TableCell className="font-mono font-bold text-sm text-primary">
                        <span className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                          <Tag className="h-3 w-3" /> {coupon.code}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        {coupon.discountType === 'Percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        Min. Order: ₹{coupon.minSubtotal.toLocaleString()}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => coupon._id && deleteCoupon(coupon._id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer rounded-lg inline-flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCoupons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                        No coupon campaigns found in this filter. Click "Launch New Coupon" to create one.
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
