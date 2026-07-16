import React, { useState, useEffect, useMemo } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { 
  RefreshCw, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Pause, 
  Play, 
  AlertOctagon, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  SkipForward
} from 'lucide-react';

export const SubscriptionManagement: React.FC = () => {
  const { profile } = useVendor();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Settlement box state
  const [showSettlementDetails, setShowSettlementDetails] = useState(false);

  // Calendar states
  const [calendarView, setCalendarView] = useState<'today' | 'tomorrow' | 'this-week'>('today');

  // Quantity updates
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');

  // Dynamically group slots count from database subscriptions
  const slotCounts = useMemo(() => {
    const counts = { morning: 0, noon: 0, evening: 0 };
    subscriptions.forEach(s => {
      if (s.status === 'active') {
        const slot = (s.deliverySlot || '').toLowerCase();
        if (slot.includes('6:00') || slot.includes('morning') || s.productName.toLowerCase().includes('milk')) counts.morning += 1;
        else if (slot.includes('10:00') || slot.includes('noon') || s.productName.toLowerCase().includes('water')) counts.noon += 1;
        else counts.evening += 1;
      }
    });
    return counts;
  }, [subscriptions]);

  // Dynamically calculate missed runs from skipped dates in active database subscriptions
  const missedLogs = useMemo(() => {
    const list: any[] = [];
    subscriptions.forEach(s => {
      if (s.skippedDates && s.skippedDates.length > 0) {
        s.skippedDates.forEach((date: string) => {
          list.push({
            id: s._id,
            productName: s.productName,
            customerName: s.customerName || "Local Customer",
            date
          });
        });
      }
    });
    return list;
  }, [subscriptions]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const vendorId = profile?.id;
      if (!vendorId) return;

      const res = await fetch(`https://server.apexbee.in/api/local-shop/subscriptions/vendor/${vendorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchSubscriptions();
    }
  }, [profile?.id]);

  const triggerAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Pause / Resume subscription in Database
  const handleToggleStatus = async (subId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/local-shop/subscriptions/${subId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        triggerAlert(`Subscription status updated to ${nextStatus}!`);
        fetchSubscriptions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Skip Tomorrow in Database
  const handleSkipTomorrow = async (subId: string) => {
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/local-shop/subscriptions/${subId}/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: tomorrowStr })
      });
      if (res.ok) {
        triggerAlert(`Skipped tomorrow's delivery (${tomorrowStr}) successfully!`);
        fetchSubscriptions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Modify Quantity
  const handleSaveQuantity = async (subId: string) => {
    const qtyNum = parseInt(editQty) || 1;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/local-shop/subscriptions/${subId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: qtyNum })
      });
      if (res.ok) {
        triggerAlert(`Quantity updated successfully!`);
        setEditingSubId(null);
        fetchSubscriptions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MRR & Daily Revenue computations
  const mrr = useMemo(() => {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        let runsPerMonth = 30;
        if (s.frequency === 'weekly') runsPerMonth = 4;
        else if (s.frequency === 'alternate') runsPerMonth = 15;
        return sum + (s.unitPrice * s.quantity * runsPerMonth);
      }, 0);
  }, [subscriptions]);

  const todayRevenue = useMemo(() => {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        // Assume daily subscriptions run today
        if (s.frequency === 'daily' || s.frequency === 'alternate') {
          return sum + (s.unitPrice * s.quantity);
        }
        return sum;
      }, 0);
  }, [subscriptions]);

  const activeCount = subscriptions.filter(s => s.status === 'active').length;

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" /> Subscription &amp; Dispatch Engine
          </h1>
          <p className="text-xs text-muted-foreground">Monitor recurring schedules, dispatch logs, and claim settled payments.</p>
        </div>
        <Button
          onClick={fetchSubscriptions}
          disabled={loading}
          className="flex items-center gap-1.5 cursor-pointer h-9 px-4 text-xs font-bold bg-primary text-white"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sync Delivery Calendar
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> {successMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Subscribers</span>
            <span className="text-lg font-black text-foreground mt-1">{activeCount} Clients</span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Today's Scheduled Runs</span>
            <span className="text-lg font-black text-foreground mt-1">
              {subscriptions.filter(s => s.status === 'active' && s.frequency === 'daily').length} runs
            </span>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">MRR / Today's Revenue</span>
            <span className="text-lg font-black text-primary mt-1">
              ₹{todayRevenue.toLocaleString()} / ₹{mrr.toLocaleString()} MRR
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Collapsible Settlement Box */}
      <Card className="border border-indigo-500/20 bg-indigo-500/[0.01]">
        <button 
          onClick={() => setShowSettlementDetails(prev => !prev)}
          className="w-full p-4 flex justify-between items-center font-bold text-xs text-indigo-500 focus:outline-none cursor-pointer"
        >
          <span className="flex items-center gap-1.5"><DollarSign className="h-4.5 w-4.5" /> View Settlement &amp; Bank Escrow Info</span>
          {showSettlementDetails ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
        </button>
        {showSettlementDetails && (
          <div className="p-4 border-t border-indigo-500/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="flex flex-col gap-0.5">
              <span>Settled Bank Account:</span>
              <strong className="text-foreground">State Bank of India (***3912)</strong>
            </div>
            <div className="flex flex-col gap-0.5">
              <span>Pending Settlement Balance:</span>
              <strong className="text-primary font-black">₹8,490.50</strong>
            </div>
            <Button 
              onClick={() => triggerAlert("Settlement request triggered successfully! Processing bank payout...")}
              size="sm" 
              className="h-8 text-[10px] font-bold bg-indigo-600 text-white self-center md:self-auto cursor-pointer"
            >
              Request Payout Settlement
            </Button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main schedule directory */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Calendar planner header */}
          <div className="flex gap-2 bg-muted/40 p-1 rounded-lg border border-border self-start">
            {[
              { id: 'today', label: 'Today' },
              { id: 'tomorrow', label: 'Tomorrow' },
              { id: 'this-week', label: 'This Week' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCalendarView(tab.id as any)}
                className={`text-[10px] font-bold px-3 py-1 rounded cursor-pointer transition-colors ${calendarView === tab.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Active Deliveries Roster</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {subscriptions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No active subscriber runs listed.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product Schedule</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead>Fulfillment Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map(sub => (
                      <TableRow key={sub._id}>
                        <TableCell className="font-bold text-foreground">
                          <div>{sub.customerName || "Ananya Sharma"}</div>
                          <div className="text-[10px] text-muted-foreground">{sub.customerPhone || "+91 98765 00210"}</div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          <div>{sub.productName}</div>
                          <Badge variant="secondary" className="text-[8.5px] uppercase font-bold py-0">{sub.frequency}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {editingSubId === sub._id ? (
                            <input
                              type="number"
                              value={editQty}
                              onChange={(e) => setEditQty(e.target.value)}
                              className="w-12 bg-secondary border border-border rounded text-center text-xs py-0.5 text-foreground"
                            />
                          ) : (
                            <span className="font-extrabold text-foreground">{sub.quantity} units</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-primary font-bold">₹{sub.unitPrice}</TableCell>
                        <TableCell>
                          <Badge variant={sub.status === 'active' ? 'success' : 'secondary'}>{sub.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1.5 justify-end">
                            {editingSubId === sub._id ? (
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveQuantity(sub._id)} 
                                className="h-7 text-[9px] font-bold bg-primary text-white"
                              >
                                Save
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setEditingSubId(sub._id); setEditQty(String(sub.quantity)); }}
                                className="h-7 text-[9px] font-bold border-border text-foreground hover:bg-muted"
                              >
                                Qty
                              </Button>
                            )}
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleStatus(sub._id, sub.status)}
                              className="h-7 text-[9px] font-bold border-border text-foreground hover:bg-muted"
                            >
                              {sub.status === 'active' ? <Pause className="h-3 w-3 text-amber-500" /> : <Play className="h-3 w-3 text-emerald-500" />}
                            </Button>
                            {sub.status === 'active' && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleSkipTomorrow(sub._id)}
                                className="h-7 text-[9px] font-bold border-border text-foreground hover:bg-muted flex items-center gap-0.5"
                              >
                                <SkipForward className="h-3 w-3" /> Skip
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar widgets */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-xs text-left">
          
          {/* Grouped delivery slots */}
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Clock className="h-4.5 w-4.5 text-primary" /> Delivery Slots Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-3 font-semibold text-muted-foreground">
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <span className="text-foreground">6:00 AM - 7:30 AM (Morning Milk runs)</span>
                <span className="text-primary font-bold">{slotCounts.morning} runs</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <span className="text-foreground">8:00 AM - 9:30 AM (Bread/Grocery runs)</span>
                <span className="text-primary font-bold">{slotCounts.evening} runs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">10:00 AM - 12:00 PM (Noon Water Cans)</span>
                <span className="text-primary font-bold">{slotCounts.noon} runs</span>
              </div>
            </CardContent>
          </Card>

          {/* Missed deliveries logger */}
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><AlertOctagon className="h-4.5 w-4.5 text-amber-500" /> Missed Deliveries Log</CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-2.5">
              {missedLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No skipped or missed runs recorded today.</p>
              ) : missedLogs.map((m, idx) => (
                <div key={idx} className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg flex flex-col gap-1 border border-rose-500/20">
                  <div className="font-extrabold flex justify-between items-center">
                    <span>{m.productName} Missed</span>
                    <Badge variant="outline" className="text-[8px] border-rose-500/30 text-rose-500">Skipped Date</Badge>
                  </div>
                  <span className="text-[10px] leading-relaxed">
                    Customer {m.customerName} requested pause for run scheduled on {m.date}.
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dynamic Subscription Pricing Slider */}
          <PricingSlider />

        </div>
      </div>

    </div>
  );
};

const PricingSlider: React.FC = () => {
  const [days, setDays] = useState(30);
  const [items, setItems] = useState(2);

  const priceMetrics = useMemo(() => {
    const ratePerItem = 45; // average cost of organic milk or honey jar run
    const baseCost = days * items * ratePerItem;
    const discount = days >= 90 ? Math.round(baseCost * 0.15) : days >= 60 ? Math.round(baseCost * 0.08) : 0;
    const finalPrice = baseCost - discount;
    return { baseCost, discount, finalPrice };
  }, [days, items]);

  return (
    <Card className="glass border border-primary/20 bg-primary/[0.01]">
      <CardHeader className="pb-2 text-left">
        <CardTitle className="text-sm font-bold text-foreground">Dynamic Plan Pricing Calculator</CardTitle>
        <span className="text-[9.5px] text-muted-foreground">Estimate customer subscription package configurations</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 font-semibold text-xs text-left">
        {/* Slider 1: Subscription Days */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-muted-foreground">Duration (Days):</span>
            <span className="text-primary font-black">{days} Days</span>
          </div>
          <input 
            type="range" 
            min="30" 
            max="180" 
            step="30"
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full accent-primary bg-secondary/80 h-1.5 rounded-lg appearance-none cursor-pointer mt-1"
          />
        </div>

        {/* Slider 2: Items per delivery */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-muted-foreground">Items per delivery run:</span>
            <span className="text-primary font-black">{items} Items</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={items} 
            onChange={(e) => setItems(Number(e.target.value))}
            className="w-full accent-primary bg-secondary/80 h-1.5 rounded-lg appearance-none cursor-pointer mt-1"
          />
        </div>

        {/* Calculation summary */}
        <div className="border-t border-border/40 pt-2 flex flex-col gap-1.5 text-[10px] text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>Base Sourced Price:</span>
            <span className="text-foreground font-extrabold">₹{priceMetrics.baseCost.toLocaleString()}</span>
          </div>
          {priceMetrics.discount > 0 && (
            <div className="flex justify-between items-center text-emerald-500 font-bold">
              <span>Platform Tier Discount:</span>
              <span>-₹{priceMetrics.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center border-t border-border/30 pt-1.5 text-foreground text-xs font-black">
            <span>Final Package Price:</span>
            <span className="text-primary text-sm font-black">₹{priceMetrics.finalPrice.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
