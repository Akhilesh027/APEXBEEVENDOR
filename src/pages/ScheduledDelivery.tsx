import React, { useState, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Calendar as CalendarIcon, Clock, Truck, CheckCircle, Settings, AlertTriangle, ShieldCheck, User } from 'lucide-react';

export const ScheduledDelivery: React.FC = () => {
  const { scheduledPickups, bookScheduledPickup } = useVendor();

  const [address, setAddress] = useState(' Nellore Warehouse Main Gate, Sector 3');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slot, setSlot] = useState('09:00 AM - 12:00 PM');

  // Slot capacity info from DB
  const [maxOrders, setMaxOrders] = useState<number>(20);
  const [bookedCount, setBookedCount] = useState<number>(0);
  const [success, setSuccess] = useState(false);
  const [msg, setMsg] = useState('');

  // Calendar timeline navigation
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Specs States
  const [selectedAreaGroup, setSelectedAreaGroup] = useState<string | null>(null);
  const [areaGroups, setAreaGroups] = useState([
    { id: 'sec-1', name: 'Nellore North Sector A (Grand Trunk Rd)', orders: 8, driver: 'Ramesh K (Platform)', status: 'Routed' },
    { id: 'sec-2', name: 'Nellore Downtown Sector B (VRC Centre)', orders: 14, driver: 'None (Unassigned)', status: 'Pending Assign' },
    { id: 'sec-3', name: 'Nellore West Sector C (Podalakur Rd)', orders: 5, driver: 'Suresh M (Vendor Partner)', status: 'Routed' }
  ]);

  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [tempDriver, setTempDriver] = useState('Ramesh K (Platform)');

  // Custom 7-day calendar sliding window starting from today
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateString: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString([], { weekday: 'short' }),
      dayNum: d.getDate(),
      monthName: d.toLocaleDateString([], { month: 'short' })
    };
  });

  const fetchSlotCapacity = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/delivery/slots?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const matching = (data.slots || []).find((s: any) => s.timeSlot === slot);
        if (matching) {
          setBookedCount(matching.bookedOrders);
          setMaxOrders(matching.maxOrders);
        } else {
          setBookedCount(0);
          setMaxOrders(20);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlotCapacity();
  }, [date, slot]);

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    // Call slot booking API to validate and book capacity in database
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const sellerId = user.id || user._id;

      const res = await fetch('https://server.apexbee.in/api/delivery/slots/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sellerId,
          date,
          timeSlot: slot
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Slot booking failed due to capacity constraints.');
        return;
      }

      // Proceed with local scheduled pickup record
      const ok = await bookScheduledPickup({
        pickupAddress: address,
        pickupDate: date,
        timeSlot: slot,
        courier: 'Delhivery Express',
        ordersCount: 1
      });

      if (ok) {
        setSuccess(true);
        setMsg('Pickup run booked successfully. Slot capacity updated!');
        fetchSlotCapacity();
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateLimit = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const sellerId = user.id || user._id;

      const res = await fetch('https://server.apexbee.in/api/delivery/slots/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sellerId,
          date,
          timeSlot: slot,
          maxOrders
        })
      });

      if (res.ok) {
        alert(`Slot capacity limits updated to ${maxOrders} dispatches!`);
        fetchSlotCapacity();
      } else {
        alert('Failed to configure slot limits.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter scheduled runs by selected calendar date
  const filteredPickups = scheduledPickups.filter(
    (p: any) => p.pickupDate === selectedCalendarDate
  );

  const capacityPercent = Math.min(100, Math.round((bookedCount / maxOrders) * 100));

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            📅 Scheduled Delivery Center
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">Allocate pickup capacities, design schedule routines, and book express dispatch logistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: Schedule Form & Settings */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="glass text-left">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase flex items-center gap-1">
                <Truck className="h-4.5 w-4.5 text-primary" /> 1. Logistics Dispatch Form
              </CardTitle>
              <CardDescription>Reserve express slot runs for scheduled dispatches</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitSchedule} className="flex flex-col gap-3 text-xs">
                {success && (
                  <div className="p-3 text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-bold border border-emerald-500/20">
                    <CheckCircle className="h-4 w-4 text-emerald-500" /> {msg}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-muted-foreground">Warehouse Point *</label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete pickup address..."
                    className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-muted-foreground">Pickup Date *</label>
                  <input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setSelectedCalendarDate(e.target.value);
                    }}
                    className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-muted-foreground">Logistics Time Slot *</label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none"
                  >
                    <option value="09:00 AM - 12:00 PM">🌅 Morning Run (09:00 AM - 12:00 PM)</option>
                    <option value="12:00 PM - 03:00 PM">☀️ Afternoon Run (12:00 PM - 03:00 PM)</option>
                    <option value="03:00 PM - 06:00 PM">🌇 Evening Run (03:00 PM - 06:00 PM)</option>
                  </select>
                </div>

                <Button type="submit" className="w-full mt-2 cursor-pointer bg-primary hover:bg-primary/90 text-white font-bold h-9">
                  Confirm Express Pickup
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Slot limit configurations */}
          <Card className="border border-border/80 text-left">
            <CardHeader className="py-3">
              <CardTitle className="text-xs font-bold uppercase flex items-center gap-1.5 text-primary">
                <Settings className="h-4.5 w-4.5" /> Slot Capacity Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 text-xs">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-muted-foreground">Configure Max Dispatches for Slot</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={maxOrders}
                      onChange={(e) => setMaxOrders(Number(e.target.value))}
                      className="border border-border rounded-lg px-2.5 py-1.5 w-full bg-background text-foreground text-xs"
                    />
                    <Button onClick={handleUpdateLimit} size="sm" className="bg-secondary text-foreground hover:bg-secondary/80 border border-border text-xs h-8 cursor-pointer">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMN 2: Calendar Timeline */}
        <div className="lg:col-span-4">
          <Card className="glass text-left">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase flex items-center gap-1">
                <CalendarIcon className="h-4.5 w-4.5 text-primary" /> 2. Calendar Timeline
              </CardTitle>
              <CardDescription>Toggle days to filter scheduled pickup pipelines</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((c) => {
                  const hasSchedules = scheduledPickups.some(p => p.pickupDate === c.dateString);
                  const isSelected = selectedCalendarDate === c.dateString;

                  return (
                    <button
                      key={c.dateString}
                      onClick={() => {
                        setSelectedCalendarDate(c.dateString);
                        setDate(c.dateString);
                      }}
                      className={`flex flex-col items-center p-2 rounded-xl border transition cursor-pointer relative ${isSelected
                          ? 'border-primary bg-primary/10 text-primary font-black shadow-sm ring-1 ring-primary'
                          : 'border-border bg-background hover:bg-secondary/50 text-foreground'
                        }`}
                    >
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{c.dayName}</span>
                      <span className="text-base font-extrabold mt-1">{c.dayNum}</span>
                      <span className="text-[8px] text-muted-foreground mt-0.5">{c.monthName}</span>
                      {hasSchedules && (
                        <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 bg-primary/[0.02] border border-border/80 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Selected Date</span>
                <span className="text-xs font-bold text-foreground">
                  {new Date(selectedCalendarDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMN 3: Upcoming list & Live capacity */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="glass text-left">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" /> 3. Slot Load Capacity
              </CardTitle>
              <CardDescription>Live utilization monitoring for selected date</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="text-muted-foreground">Capacity utilization</span>
                <span className="text-foreground">{bookedCount} / {maxOrders} Booked</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-secondary/80 rounded-full h-3.5 overflow-hidden border border-border/30">
                <div
                  className={`h-full transition-all duration-350 ${capacityPercent > 80
                      ? 'bg-rose-500'
                      : capacityPercent > 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>

              {capacityPercent > 80 && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl flex items-start gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span>Selected slot is at near full capacity. Expect logistics dispatch lag.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filtered Upcoming List */}
          <Card className="border border-border/80 text-left">
            <CardHeader className="py-4 border-b border-border/40">
              <CardTitle className="text-xs font-bold uppercase">Schedules for {selectedCalendarDate}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredPickups.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground italic">
                  No logistics dispatches booked for this date.
                </div>
              ) : (
                <div className="divide-y divide-border/40 text-xs">
                  {filteredPickups.map((sch: any, idx: number) => (
                    <div key={sch._id || idx} className="p-3.5 flex flex-col gap-2 bg-secondary/[0.05] hover:bg-secondary/20 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-foreground">Ref: {(sch._id || sch.id || '').substring(0, 10)}...</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 font-semibold">
                            <Clock className="h-3 w-3 text-muted-foreground" /> {sch.timeSlot}
                          </span>
                        </div>
                        <Badge variant="success" className="text-[9px] font-bold py-0.5">
                          {sch.status || 'Active'}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground border-t border-border/30 pt-2">
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {sch.customer || 'Nellore Warehouse'}</span>
                        <span className="text-foreground">{sch.ordersCount} packages</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScheduledDelivery;
