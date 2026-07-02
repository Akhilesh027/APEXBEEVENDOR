import React, { useState, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RefreshCw, Layers, List, CheckCircle, Info, Clock } from 'lucide-react';

export const SubscriptionManagement: React.FC = () => {
  const { profile } = useVendor();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Delivery tasks modal
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [selectedSubTasks, setSelectedSubTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchSubscriptions();
    }
  }, [profile?.id]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vendorToken');
      // Fallback to localShopRoutes vendor fetch URL
      const vendorId = profile.id;
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

  const fetchTasks = async (sub: any) => {
    try {
      setSelectedSub(sub);
      setLoadingTasks(true);
      setShowTasksModal(true);
      const token = localStorage.getItem('vendorToken');
      const res = await fetch(`https://server.apexbee.in/api/local-shop/subscriptions/${sub._id}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const dataTasks = await res.json().catch(() => null);
        setSelectedSubTasks(data.tasks || dataTasks?.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  
  // Estimate monthly gross delivery amount
  const estimatedRevenue = subscriptions.reduce((total, sub) => {
    if (sub.status !== 'active') return total;
    let deliveries = 30;
    if (sub.frequency === 'weekly') deliveries = 4;
    else if (sub.frequency === 'alternate') deliveries = 15;
    else if (sub.frequency === 'custom') deliveries = 12;
    else if (sub.frequency === 'monthly') deliveries = 1;
    return total + (deliveries * sub.unitPrice * sub.quantity);
  }, 0);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Subscription Management</h1>
          <p className="text-xs text-muted-foreground">Monitor customer subscriptions, track daily delivery logs, and view projected earnings.</p>
        </div>
        <Button
          onClick={fetchSubscriptions}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-1.5 cursor-pointer h-9 px-4 text-xs font-bold text-foreground border border-border"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sync Subscriptions
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" /> Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">{activeCount}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total recurring subscription agreements</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-500" /> Projected Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              {subscriptions.reduce((acc, sub) => {
                let runs = 30;
                if (sub.frequency === 'weekly') runs = 4;
                else if (sub.frequency === 'alternate') runs = 15;
                else if (sub.frequency === 'custom') runs = 12;
                else if (sub.frequency === 'monthly') runs = 1;
                return acc + (sub.status === 'active' ? runs * sub.quantity : 0);
              }, 0)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Projected dispatch runs per billing cycle</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Projected Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">₹{estimatedRevenue.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Estimated gross vendor statement splits</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-3 text-xs text-foreground select-none">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Subscription Settlements Information:</span>
          <p className="text-muted-foreground leading-normal">
            Unlike standard orders, customer subscriptions are settled in cycles. Payouts are computed using verified delivery runs (marked by riders with OTP check) and released to your wallet once statements are settled by administration. Only Platform Fee splits (5%) are deducted; franchise splits are disabled for subscriptions.
          </p>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <Card className="text-left">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <List className="h-4.5 w-4.5 text-primary" /> Active Customer Subscriptions
          </CardTitle>
          <CardDescription>View, filter and audit daily dispatch runs for subscribed users</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground font-semibold">
              <RefreshCw className="animate-spin inline mr-2" size={16} />
              Loading subscriptions...
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground italic bg-muted/5 rounded-b-xl border-t border-border/40">
              No active customer subscriptions found for your store.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-bold bg-muted/20">
                    <th className="py-2.5 px-4">Customer Details</th>
                    <th className="py-2.5 px-4">Subscribed Product</th>
                    <th className="py-2.5 px-4">Frequency</th>
                    <th className="py-2.5 px-4">Daily Qty</th>
                    <th className="py-2.5 px-4">Unit Cost</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub, idx) => (
                    <tr key={sub._id || idx} className="border-b border-border/40 hover:bg-muted/10 font-semibold text-foreground/85">
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-foreground">{sub.customerName || 'Customer'}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{sub.customerPhone || 'N/A'}</span>
                          <span className="text-[9px] text-muted-foreground/70 truncate max-w-xs">{sub.customerAddress}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {sub.productImage && (
                            <img src={sub.productImage} className="w-8 h-8 rounded-lg object-cover border border-border/50" alt="" />
                          )}
                          <span className="font-bold text-foreground">{sub.productName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize">{sub.frequency}</td>
                      <td className="py-3 px-4 text-center font-bold text-foreground">{sub.quantity} units</td>
                      <td className="py-3 px-4 font-bold text-foreground">₹{sub.unitPrice}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={sub.status === 'active' ? 'success' : 'secondary'}
                          className="text-[9px] font-bold"
                        >
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => fetchTasks(sub)}
                          variant="outline"
                          className="px-2 py-1 text-[10px] font-bold border border-border text-foreground hover:bg-secondary/15 h-7 cursor-pointer"
                        >
                          Delivery History
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Delivery History Tasks */}
      {showTasksModal && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl flex flex-col text-left">
            <div className="flex justify-between items-center pb-4 border-b border-border/60 mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Delivery History Details</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Product: {selectedSub.productName} (Qty: {selectedSub.quantity})</p>
              </div>
              <button
                onClick={() => setShowTasksModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold px-3 py-1.5 border border-border rounded-xl cursor-pointer hover:bg-secondary/10"
              >
                Close
              </button>
            </div>

            {loadingTasks ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <RefreshCw className="animate-spin inline mr-2" size={16} />
                Loading logs...
              </div>
            ) : selectedSubTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground bg-secondary/5 rounded-xl border border-border/40 italic">
                No delivery task runs logged for this subscription yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-border/70 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-5 p-2.5 bg-muted font-bold text-muted-foreground text-[9px] uppercase tracking-wider text-left">
                    <span>Date</span>
                    <span>Status</span>
                    <span>OTP Verified</span>
                    <span>Rider ID</span>
                    <span>Notes</span>
                  </div>
                  <div className="divide-y divide-border text-foreground bg-card text-left">
                    {selectedSubTasks.map((task) => (
                      <div key={task._id} className="grid grid-cols-5 p-2.5 items-center hover:bg-secondary/5">
                        <span className="font-mono text-[10px]">{task.date}</span>
                        <span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            task.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600' :
                            task.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                            'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {task.status}
                          </span>
                        </span>
                        <span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${task.otpVerified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary/15 text-muted-foreground'}`}>
                            {task.otpVerified ? 'Yes' : 'No'}
                          </span>
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground truncate">{task.riderId || 'Unassigned'}</span>
                        <span className="text-[10px] text-muted-foreground truncate" title={task.notes}>{task.notes || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
