import React from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Truck, Navigation, Star, Phone, CheckCircle, User, Clock, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const Delivery: React.FC = () => {
  const { deliveryAgents, orders, vendorSubscriptions } = useVendor();

  const activeDeliveries = orders.filter(o => o.deliveryStatus === 'Shipped' || o.deliveryStatus === 'Processing' || o.deliveryStatus === 'Packed');

  const getAgentStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge variant="success">Active / Online</Badge>;
      case 'On Delivery': return <Badge variant="warning">On Job</Badge>;
      default: return <Badge variant="secondary">Offline</Badge>;
    }
  };

  // Delivery performance analytics data
  const deliveredCount = orders.filter(o => o.deliveryStatus === 'Delivered').length;
  const returnedCount = orders.filter(o => o.deliveryStatus === 'Returned').length;
  
  // Simulated historical delivery stats
  const performanceData = [
    { name: 'Successful', value: deliveredCount + 85, color: '#10b981' },
    { name: 'Delayed', value: 5, color: '#f59e0b' },
    { name: 'Returned', value: returnedCount + 3, color: '#ec4899' },
    { name: 'Failed / Lost', value: 1, color: '#ef4444' }
  ];

  const totalDeliveriesValue = performanceData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> Delivery & Logistics Analytics
          </h1>
          <p className="text-xs text-muted-foreground">Monitor delivery dispatch partners, review in-transit package statuses, and analyze delivery success.</p>
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
              <span className="text-lg font-extrabold text-foreground">{deliveryAgents.length} Agents</span>
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
              <span className="text-lg font-extrabold text-foreground">{activeDeliveries.length} Packages</span>
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
              <span className="text-lg font-extrabold text-foreground">{orders.filter(o => o.deliveryStatus === 'Delivered').length} Packages</span>
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
              <span className="text-lg font-extrabold text-foreground">96.8%</span>
              <span className="text-[9px] text-emerald-500 font-bold">Avg Transit: 2.3 Days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Transits Tracker */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="glass h-full text-left">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Live Package Transits</CardTitle>
              <CardDescription>Real-time delivery progress updates</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {activeDeliveries.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs italic">
                  No orders are currently out for delivery.
                </div>
              ) : (
                activeDeliveries.map(o => (
                  <div key={o.id} className="border border-border/60 bg-muted/20 p-3 rounded-lg flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-foreground">{o.id}</span>
                      <Badge variant="info" className="py-0 px-2 text-[10px]">
                        {o.deliveryStatus}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      <div className="font-semibold text-foreground">Customer: {o.customerName}</div>
                      <div className="truncate mt-0.5">Dest: {o.deliveryAddress}</div>
                      {o.assignedDeliveryAgent && (
                        <div className="mt-1 font-semibold text-primary flex items-center gap-1">
                          <User className="h-3 w-3" /> Agent: {o.assignedDeliveryAgent}
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
              <CardTitle className="text-base font-bold flex items-center gap-2">
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
              <div className="flex-1 flex flex-col gap-2 w-full">
                {performanceData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-bold text-muted-foreground border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
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

      {/* Subscription Dispatch Schedule Calendar */}
      <Card className="glass text-left">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-1.5 text-primary">
            <Clock className="h-5 w-5" /> Weekly Subscription Dispatch Calendar
          </CardTitle>
          <CardDescription>Visual weekly timeline indicating schedule run dispatches per active subscriber</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 text-xs">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
              const subsForDay = (vendorSubscriptions || []).filter(sub => {
                if (sub.status !== 'active') return false;
                const freq = sub.frequency?.toLowerCase();
                if (freq === 'daily') return true;
                if (freq === 'custom') {
                  return sub.customDays?.map((d: string) => d.toLowerCase()).includes(day);
                }
                return true;
              });

              return (
                <div key={day} className="border border-border/60 bg-muted/5 rounded-xl p-3 flex flex-col gap-2.5 min-h-[140px]">
                  <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                    <span className="font-extrabold capitalize text-foreground">{day.substring(0, 3)}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      subsForDay.length > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {subsForDay.length} runs
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[180px] no-scrollbar">
                    {subsForDay.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground italic text-center py-4">No runs</span>
                    ) : (
                      subsForDay.map((sub: any) => (
                        <div key={sub._id} className="bg-background border border-border/40 p-2 rounded-lg flex flex-col gap-1 text-[10px]">
                          <div className="font-bold text-foreground truncate">{sub.productName}</div>
                          <div className="text-[9px] text-muted-foreground flex justify-between items-center">
                            <span>Qty: {sub.quantity}</span>
                            <span className="font-mono text-[8px] bg-secondary px-1 rounded">{sub.deliverySlot.split(' ')[0]}</span>
                          </div>
                          <div className="mt-1 pt-1 border-t border-border/30 text-[9px] text-primary font-medium truncate">
                            👤 {sub.deliveryAgentName || 'Unassigned'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Courier Registry */}
      <Card className="glass text-left">
        <CardHeader>
          <CardTitle className="text-base font-bold">Delivery Agents Register</CardTitle>
          <CardDescription>Platform-approved logistics personnel and their current channel assignments</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="border-none rounded-none shadow-none">
              <TableHeader className="bg-transparent border-b border-border/40">
                <TableRow>
                  <TableHead>Agent name</TableHead>
                  <TableHead>Phone number</TableHead>
                  <TableHead>Channel Type</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryAgents.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-bold text-foreground text-xs">{a.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-primary" /> {a.phone}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <Badge variant="purple" className="py-0 px-2 text-[10px] font-bold">{a.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {a.rating}
                      </span>
                    </TableCell>
                    <TableCell>{getAgentStatusBadge(a.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
