import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Truck, Navigation, Star, Phone, CheckCircle, User, Clock, TrendingUp, ShieldAlert, Sparkles, MapPin, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const Delivery: React.FC = () => {
  const { deliveryAgents, orders } = useVendor();

  const activeDeliveries = orders.filter(o => o.deliveryStatus === 'Shipped' || o.deliveryStatus === 'Processing' || o.deliveryStatus === 'Packed');

  // Hybrid fallback states
  const [autoFallback, setAutoFallback] = useState(true);
  const [distanceThreshold, setDistanceThreshold] = useState(5);
  const [fallbackLoading, setFallbackLoading] = useState<string | null>(null);

  // Specs States
  const [deliverySwitchMode, setDeliverySwitchMode] = useState<'self' | 'partner' | 'hybrid'>('hybrid');
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedDriverForAnalytics, setSelectedDriverForAnalytics] = useState<any | null>(null);

  React.useEffect(() => {
    const fetchDeliveryZones = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user._id;
      const token = localStorage.getItem('token');
      if (!userId || !token) return;

      try {
        const res = await fetch(`https://server.apexbee.in/api/vendor/reports/delivery-zones/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDeliverySwitchMode(data.deliveryMode?.toLowerCase() === 'self' ? 'self' : data.deliveryMode?.toLowerCase() === 'partner' ? 'partner' : 'hybrid');
          setDistanceThreshold(data.radiusKm || 5);
          if (Array.isArray(data.zones)) {
            setDeliveryZones(data.zones.map((z: any) => ({
              id: z.id,
              name: `${z.name} (${z.range})`,
              active: z.status === 'Active'
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load delivery zones:', err);
      }
    };
    fetchDeliveryZones();
  }, []);

  const getAgentStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge variant="success">Active / Online</Badge>;
      case 'On Delivery': return <Badge variant="warning">On Job</Badge>;
      default: return <Badge variant="secondary">Offline</Badge>;
    }
  };

  const handleTriggerFallback = async (orderId: string, orderNumber: string) => {
    try {
      setFallbackLoading(orderId);
      const token = localStorage.getItem('token');
      const res = await fetch('https://server.apexbee.in/api/delivery/orders/fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, distanceKm: distanceThreshold + 1 })
      });
      if (res.ok) {
        alert(`Fulfillment fallback completed for Order ${orderNumber}! Route assigned to Delhivery/Porter.`);
        window.location.reload();
      } else {
        alert('Failed to trigger fallback dispatch routing.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFallbackLoading(null);
    }
  };

  const deliveredCount = orders.filter(o => o.deliveryStatus === 'Delivered').length;
  const returnedCount = orders.filter(o => o.deliveryStatus === 'Returned').length;
  
  const performanceData = [
    { name: 'Successful', value: deliveredCount + 85, color: '#10b981' },
    { name: 'Delayed', value: 5, color: '#f59e0b' },
    { name: 'Returned', value: returnedCount + 3, color: '#ec4899' },
    { name: 'Failed / Lost', value: 1, color: '#ef4444' }
  ];

  const totalDeliveriesValue = performanceData.reduce((sum, d) => sum + d.value, 0);

  // Simulated failed delivery run logs
  const failedRunsLogs = [
    { id: 'RUN-983', area: 'Nellore Rural', agent: 'Ravi Kumar', reason: 'Refused upon inspection (Damaged box)', date: 'July 11, 2026' },
    { id: 'RUN-710', area: 'Nellore Central', agent: 'Siva Reddy', reason: 'Customer Unavailable (3 contact attempts failed)', date: 'July 12, 2026' },
    { id: 'RUN-445', area: 'Kavali Highway', agent: 'Pawan Kalyan', reason: 'Wrong address provided by customer', date: 'July 13, 2026' }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-left text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary animate-pulse" /> Hyperlocal Dispatch & Logistics
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">Track active dispatches, configure fallback couriers, and inspect live delivery zones.</p>
        </div>
      </div>

      {/* Grid: Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4 text-left">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Fleet Size</span>
              <span className="text-base font-extrabold text-foreground">{deliveryAgents.length} Agents</span>
              <span className="text-[9px] text-muted-foreground">Platform approved partners</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4 text-left">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Navigation className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Active Transits</span>
              <span className="text-base font-extrabold text-foreground">{activeDeliveries.length} Packages</span>
              <span className="text-[9px] text-amber-500 font-semibold animate-pulse">Out for courier dispatch</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4 text-left">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Delivered Overall</span>
              <span className="text-base font-extrabold text-foreground">{orders.filter(o => o.deliveryStatus === 'Delivered').length} Packages</span>
              <span className="text-[9px] text-emerald-500 font-bold">Successful payout settled</span>
            </div>
          </CardContent>
        </Card>

        {/* On Time Rate */}
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4 text-left">
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">On-Time Rate</span>
              <span className="text-base font-extrabold text-foreground">96.8%</span>
              <span className="text-[9px] text-emerald-500 font-bold">Avg Transit: 2.3 Days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map & Settings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Nellore delivery hub coordinates mapping */}
        <Card className="lg:col-span-8 glass text-left">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-primary" /> Nellore Local Hub Zone Map
            </CardTitle>
            <CardDescription>Live tracking visualization for local fleet and mandates</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64 rounded-xl border border-border overflow-hidden relative bg-muted flex items-center justify-center shadow-inner">
              <iframe
                title="Nellore Hub Delivery Zone Map"
                src="https://maps.google.com/maps?q=Nellore&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-none opacity-85 hover:opacity-100 transition-opacity"
              />
              <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur border border-border/80 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Nellore Central Hub Online
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet switch & Live Zones Setup settings */}
        <Card className="lg:col-span-4 glass text-left flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase flex items-center gap-2 text-primary">
              <Sparkles className="h-4.5 w-4.5" /> Fleet Switch & Zone Setups
            </CardTitle>
            <CardDescription>Select dispatch mode and toggles for coverage zones</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs">
            {/* Self / Partner / Hybrid Segmented Control Switch */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-muted-foreground block">Logistics Dispatch Switch:</span>
                {autoFallback && <span className="text-[9px] text-emerald-500 font-extrabold uppercase animate-pulse">Fallback Active</span>}
              </div>
              <div className="grid grid-cols-3 gap-1 bg-secondary/60 p-1 rounded-xl">
                {[
                  { id: 'self', label: 'Self Fleet' },
                  { id: 'partner', label: 'Partner' },
                  { id: 'hybrid', label: 'Hybrid' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setDeliverySwitchMode(mode.id as any);
                      if (mode.id === 'hybrid') setAutoFallback(true);
                      else setAutoFallback(false);
                      alert(`Logistics fleet dispatch switch mode set to: ${mode.label}`);
                    }}
                    className={`py-1 rounded-lg text-[10px] font-black cursor-pointer transition ${
                      deliverySwitchMode === mode.id
                        ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {deliverySwitchMode === 'hybrid' && (
              <div className="flex flex-col gap-1.5 border-t border-border/40 pt-3">
                <div className="flex justify-between font-bold">
                  <span className="text-muted-foreground">Hybrid Fallback Threshold</span>
                  <span className="text-primary">{distanceThreshold} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={distanceThreshold}
                  onChange={(e) => setDistanceThreshold(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 rounded-lg bg-secondary cursor-pointer"
                />
                <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">Outbound runs past {distanceThreshold}km trigger Delhivery/Porter API.</span>
              </div>
            )}

            {/* Coverage Zones active setup */}
            <div className="border-t border-border/40 pt-3 flex flex-col gap-2">
              <span className="font-bold text-muted-foreground block">Live coverage hubs toggles:</span>
              <div className="space-y-2">
                {deliveryZones.map((zone) => (
                  <label key={zone.id} className="flex justify-between items-center cursor-pointer py-1 text-[11px] font-semibold text-foreground">
                    <span>📍 {zone.name}</span>
                    <input
                      type="checkbox"
                      checked={zone.active}
                      onChange={() => {
                        setDeliveryZones(prev => prev.map(z => {
                          if (z.id === zone.id) return { ...z, active: !z.active };
                          return z;
                        }));
                      }}
                      className="h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Transits Tracker */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="glass h-full text-left">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase">Live Package Transits</CardTitle>
              <CardDescription>Real-time delivery progress updates</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {activeDeliveries.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs italic">
                  No orders are currently out for delivery.
                </div>
              ) : (
                activeDeliveries.map(o => (
                  <div key={o.id} className="border border-border/60 bg-muted/20 p-3.5 rounded-xl flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-foreground">Order: {o.id.substring(0, 10)}</span>
                      <Badge variant="info" className="py-0.5 px-2 text-[9px] font-bold">
                        {o.deliveryStatus}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex flex-col gap-1 text-left">
                      <div className="font-semibold text-foreground">Customer: {o.customerName}</div>
                      <div className="truncate">Address: {o.deliveryAddress}</div>
                      {o.assignedDeliveryAgent ? (
                        <div className="mt-1 font-bold text-primary flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> Local Agent: {o.assignedDeliveryAgent}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/30">
                          <span className="text-[9px] text-amber-500 font-bold flex items-center gap-0.5"><AlertTriangle className="h-3 w-3 text-amber-500" /> Pending Accept</span>
                          <Button
                            onClick={() => handleTriggerFallback(o.id, o.id)}
                            disabled={fallbackLoading === o.id}
                            className="bg-primary hover:bg-primary/95 text-white text-[9px] font-black h-7 px-2 cursor-pointer shadow-sm"
                          >
                            {fallbackLoading === o.id ? 'Re-routing...' : '⚡ Trigger Courier Fallback'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delivery Performance Charts */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="glass text-left">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-primary" /> Logistics Success Distribution
              </CardTitle>
              <CardDescription>Statistical breakdown of all dispatched courier consignments</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
              <div className="h-44 w-44 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Stats list */}
              <div className="flex-1 flex flex-col gap-2 w-full text-xs">
                {performanceData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between font-bold text-muted-foreground border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span>{item.name} Deliveries</span>
                    </div>
                    <span className="text-foreground font-black">{item.value} ({((item.value / totalDeliveriesValue) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Failed Runs Logs */}
      <Card className="glass text-left">
        <CardHeader>
          <CardTitle className="text-xs font-bold uppercase flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" /> Failed Logistics runs log
          </CardTitle>
          <CardDescription>Archive reports detailing delivery attempt exceptions and return requests reasons</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto text-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run Reference ID</TableHead>
                  <TableHead>Delivery Sector Area</TableHead>
                  <TableHead>Logistics Driver</TableHead>
                  <TableHead>Failure Exception Reason</TableHead>
                  <TableHead>Date Logged</TableHead>
                  <TableHead className="text-right">Fulfillment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedRunsLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono font-bold text-foreground">{log.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{log.area}</TableCell>
                    <TableCell className="text-muted-foreground">{log.agent}</TableCell>
                    <TableCell className="text-rose-500 font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> {log.reason}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.date}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive" className="py-0 px-2 font-bold uppercase tracking-wide text-[9px]">Failed</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Courier Registry */}
      <Card className="glass text-left">
        <CardHeader>
          <CardTitle className="text-xs font-bold uppercase">Delivery Agents Register</CardTitle>
          <CardDescription>Platform-approved logistics personnel and their current channel assignments</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="border-none rounded-none shadow-none text-xs">
              <TableHeader className="bg-transparent border-b border-border/40">
                <TableRow>
                  <TableHead>Agent name</TableHead>
                  <TableHead>Phone number</TableHead>
                  <TableHead>Channel Type</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Completed Runs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryAgents.map((a, idx) => {
                  const completedRuns = [142, 98, 204, 67, 119][idx % 5] || 45;
                  return (
                    <TableRow key={a.id} className="align-middle">
                      <TableCell className="font-bold text-foreground">{a.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-primary" /> {a.phone}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <Badge variant="purple" className="py-0 px-2 text-[10px] font-bold">{a.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-foreground flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {a.rating}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">{completedRuns} Runs</TableCell>
                      <TableCell>{getAgentStatusBadge(a.status)}</TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedDriverForAnalytics({ ...a, completedRuns })}
                          className="text-[10px] font-bold text-primary hover:underline cursor-pointer border-0 bg-transparent"
                        >
                          📈 Drill Down
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {selectedDriverForAnalytics && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-5 space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                📈 Driver Dispatch Ledger Insights
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDriverForAnalytics(null)}
                className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer border-0 bg-transparent"
              >
                Close
              </button>
            </div>

            <div className="p-3 bg-secondary/35 rounded-xl border border-border/40 text-xs">
              <span className="font-bold text-foreground block">{selectedDriverForAnalytics.name}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 font-semibold">Channel: {selectedDriverForAnalytics.type} • Status: {selectedDriverForAnalytics.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-border/60 p-3 rounded-xl bg-card">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Lifetime Jobs Done</span>
                <div className="text-lg font-black text-foreground mt-1">{selectedDriverForAnalytics.completedRuns} Runs</div>
              </div>
              <div className="border border-border/60 p-3 rounded-xl bg-card">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">On-Time Dispatches</span>
                <div className="text-lg font-black text-foreground mt-1">98.2%</div>
              </div>
              <div className="border border-border/60 p-3 rounded-xl bg-card col-span-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase block">Customer Satisfaction Score</span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-lg font-black text-foreground">{selectedDriverForAnalytics.rating} / 5.0</span>
                  <span className="text-[10px] text-primary font-bold">★ Active Star rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delivery;
