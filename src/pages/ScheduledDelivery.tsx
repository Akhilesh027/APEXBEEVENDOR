import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Calendar, Clock, Truck, CheckCircle } from 'lucide-react';

export const ScheduledDelivery: React.FC = () => {
  const { scheduledPickups, bookScheduledPickup } = useVendor();
  const [success, setSuccess] = useState(false);
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('09:00 AM - 12:00 PM');

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await bookScheduledPickup({
      pickupAddress: address,
      pickupDate: date,
      timeSlot: slot,
      courier: 'Delhivery Express',
      ordersCount: Math.floor(Math.random() * 5) + 1
    });
    if (ok) {
      setSuccess(true);
      setAddress('');
      setDate('');
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Scheduled Deliveries</h1>
          <p className="text-xs text-muted-foreground">Book ahead recurring bulk dispatches, pick slot schedules, and monitor active courier runs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schedule Creator */}
        <Card className="glass lg:col-span-5 h-fit text-left">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-primary" /> Book Pickup Schedule
            </CardTitle>
            <CardDescription>Reserve a dedicated courier dispatch run for scheduled deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitSchedule} className="flex flex-col gap-3 text-left">
              {success && (
                <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
                  <CheckCircle className="h-4 w-4" /> Logistics slot reserved successfully!
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Warehouse Pickup Address *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete pickup point address..."
                  className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Pickup Date *</label>
                  <input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Preferred Time Slot *</label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  >
                    <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2 cursor-pointer bg-primary text-white font-bold h-9">
                Confirm Pickup Schedule
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Schedules Table */}
        <Card className="lg:col-span-7 text-left">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Truck className="h-4.5 w-4.5 text-primary" /> Active Logistics Schedules
            </CardTitle>
            <CardDescription>Track recurring pickup runs and courier slot assignments</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-bold bg-muted/20">
                    <th className="py-2.5 px-4">Schedule ID</th>
                    <th className="py-2.5 px-4">Recipient Client</th>
                    <th className="py-2.5 px-4">Quantity</th>
                    <th className="py-2.5 px-4">Date & Slot</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledPickups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs italic">
                        No scheduled dispatches found. Book one on the left!
                      </td>
                    </tr>
                  ) : (
                    scheduledPickups.map((sch, idx) => (
                      <tr key={sch._id || idx} className="border-b border-border/40 hover:bg-muted/10 font-semibold text-foreground/85">
                        <td className="py-3 px-4 font-mono font-bold text-foreground">{(sch._id || sch.id).substring(0, 10)}...</td>
                        <td className="py-3 px-4 flex flex-col gap-0.5">
                          <span>{sch.customer}</span>
                          <span className="text-[10px] text-muted-foreground">Carrier: {sch.courier}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-foreground">{sch.ordersCount} pkgs</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-foreground font-bold"><Calendar className="h-3 w-3 text-primary" /> {sch.pickupDate}</span>
                            <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><Clock className="h-3 w-3 text-muted-foreground" /> {sch.timeSlot}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              sch.status === 'Delivered'
                                ? 'success'
                                : sch.status === 'Scheduled'
                                ? 'secondary'
                                : 'warning'
                            }
                            className="text-[9px] font-bold"
                          >
                            {sch.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
