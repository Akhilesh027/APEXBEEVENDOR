import React, { useState, useMemo } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { 
  Users, 
  Phone, 
  Search, 
  Share2, 
  MessageSquare, 
  X, 
  Send,
  Clipboard
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { profile, orders = [], vendorSubscriptions = [], getCustomerNote, updateCustomerNote } = useVendor();
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Profile modal states
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [profileTab, setProfileTab] = useState<'profile' | 'orders' | 'subscriptions' | 'timeline' | 'notes'>('profile');
  const [customerNoteText, setCustomerNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Group orders by customer to calculate LTV metrics
  const customerMap = useMemo(() => {
    const map: Record<string, any> = {};
    
    orders.forEach((order: any, index) => {
      const key = (order.customerPhone || order.customerName || 'Customer').trim();
      if (!map[key]) {
        map[key] = {
          id: order._id || `CUST-${index + 101}`,
          userId: order.customerId?._id || order.customerId || `USER-${index + 500}`,
          name: order.customerName || 'Local Customer',
          email: order.customerEmail || `${order.customerName?.toLowerCase().replace(/[^a-z]/g, '') || 'customer'}@gmail.com`,
          phone: order.customerPhone || '+91 XXXXX XXXXX',
          ordersCount: 0,
          spend: 0,
          rating: 4.8 + (index % 3) * 0.1,
          tier: 'Silver',
          points: 0,
          address: order.deliveryAddress || 'No Address Logged',
          recentOrdersList: []
        };
      }

      const record = map[key];
      record.ordersCount += 1;
      record.spend += order.totalAmount;
      record.recentOrdersList.push({
        id: order.id || order._id,
        amount: order.totalAmount,
        status: order.deliveryStatus || 'Processing',
        date: order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : 'Today'
      });
    });

    return map;
  }, [orders]);

  const customersList = useMemo(() => {
    const list = Object.values(customerMap).map(c => {
      c.points = Math.round(c.spend * 0.1);
      if (c.spend > 15000) c.tier = 'VIP';
      else if (c.spend > 5000) c.tier = 'Gold';
      else c.tier = 'Silver';
      return c;
    });

    return list;
  }, [customerMap]);

  const filtered = useMemo(() => {
    return customersList.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  }, [customersList, searchTerm]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = customersList.length;
    const totalSpend = customersList.reduce((sum, c) => sum + c.spend, 0);
    const avgLtv = total > 0 ? Math.round(totalSpend / total) : 0;
    const vipCount = customersList.filter(c => c.tier === 'VIP').length;
    const vipShare = total > 0 ? ((vipCount / total) * 100).toFixed(0) : '0';
    return { total, avgLtv, vipCount, vipShare };
  }, [customersList]);

  // Handle customer row click (Load Notes from Database)
  const handleOpenProfile = async (customer: any) => {
    setSelectedCustomer(customer);
    setProfileTab('profile');
    setCustomerNoteText('');
    try {
      // Call backend api to fetch notes for this user relation
      const notes = await getCustomerNote(customer.userId);
      setCustomerNoteText(notes || '');
    } catch (err) {
      console.error("Error loading note from DB:", err);
    }
  };

  // Handle Note update
  const handleSaveNote = async () => {
    if (!selectedCustomer) return;
    setSavingNote(true);
    try {
      const success = await updateCustomerNote(selectedCustomer.userId, customerNoteText);
      if (success) {
        alert("Customer internal note updated successfully in database.");
      } else {
        alert("Failed to update customer note.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://apexbee.in/register?referredBy=" + (profile?.referralCode || "MERCHANT"));
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Profile's matching subscription
  const customerSubscription = useMemo(() => {
    if (!selectedCustomer) return null;
    return vendorSubscriptions.find(s => s.userId === selectedCustomer.userId);
  }, [selectedCustomer, vendorSubscriptions]);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Customer Directory & CRM
          </h1>
          <p className="text-xs text-muted-foreground">Monitor client profiles, trace checkouts history, loyalty points, and direct messaging portals.</p>
        </div>
        <Button 
          onClick={() => setShowInviteModal(true)}
          className="self-start sm:self-auto cursor-pointer flex items-center gap-1.5 bg-primary text-white font-bold h-9 text-xs"
        >
          <Share2 className="h-4 w-4" /> Invite Customers
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass text-left">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Customers</span>
            <span className="text-lg font-black text-foreground mt-1">{stats.total} Buyers</span>
          </CardContent>
        </Card>
        <Card className="glass text-left">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Loyal Segment</span>
            <span className="text-lg font-black text-foreground mt-1">
              {customersList.filter(c => c.ordersCount > 1).length} Users
            </span>
          </CardContent>
        </Card>
        <Card className="glass text-left">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Average LTV</span>
            <span className="text-lg font-black text-primary mt-1">₹{stats.avgLtv.toLocaleString()}</span>
          </CardContent>
        </Card>
        <Card className="glass text-left">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">VIP Share</span>
            <span className="text-lg font-black text-indigo-500 mt-1">{stats.vipShare}% VIP</span>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="glass">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/40 flex items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-secondary/40 border border-border/80 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead className="text-right">Orders Placed</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Loyalty Tier</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(cust => (
                <TableRow key={cust.id}>
                  <TableCell className="font-bold text-foreground">{cust.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div>{cust.phone}</div>
                    <div>{cust.email}</div>
                  </TableCell>
                  <TableCell className="text-right font-extrabold text-foreground">{cust.ordersCount} checkouts</TableCell>
                  <TableCell className="text-right text-primary font-bold">₹{cust.spend.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={cust.tier === 'VIP' ? 'success' : cust.tier === 'Gold' ? 'warning' : 'secondary'}>
                      {cust.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-extrabold text-foreground">{cust.points} pts</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => handleOpenProfile(cust)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs font-bold border-border bg-background hover:bg-muted cursor-pointer"
                    >
                      360° Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Customer Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full relative bg-background border border-border">
            <CardHeader className="pb-2 border-b border-border/40 text-left">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Share2 className="h-4.5 w-4.5 text-primary" /> Invite Customers</CardTitle>
                <X className="h-4.5 w-4.5 cursor-pointer text-muted-foreground" onClick={() => setShowInviteModal(false)} />
              </div>
              <CardDescription>Share your unique merchant link. Customer accounts auto-register on checkout.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4 text-left">
              <div className="p-3 bg-secondary/35 border border-border/60 rounded-xl flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono select-all truncate text-muted-foreground w-full">
                  https://apexbee.in/register?referredBy={profile?.referralCode || "MERCHANT"}
                </span>
                <Button size="sm" variant="outline" onClick={handleCopyLink} className="h-7 text-[10px] font-bold border-border flex items-center gap-1 shrink-0">
                  <Clipboard className="h-3 w-3" /> {copiedLink ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a 
                  href={`https://wa.me/?text=Shop%20at%20our%20store%20online%20using%20https://apexbee.in/register?referredBy=${profile?.referralCode || "MERCHANT"}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg text-center"
                >
                  <MessageSquare className="h-4 w-4" /> Share WhatsApp
                </a>
                <a 
                  href={`sms:?&body=Shop%20at%20our%20store%20online%20using%20https://apexbee.in/register?referredBy=${profile?.referralCode || "MERCHANT"}`}
                  className="flex items-center justify-center gap-2 p-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg text-center"
                >
                  <Send className="h-4 w-4" /> Share SMS Link
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 360° Customer Profile View Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full relative bg-background border border-border flex flex-col overflow-hidden max-h-[85vh] text-left">
            <CardHeader className="pb-3 border-b border-border/40 shrink-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-sm">
                    {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-foreground leading-tight">{selectedCustomer.name}</h3>
                      <Badge variant="success" className="text-[9px] px-1.5 py-0">{selectedCustomer.tier} Tier</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">ID: {selectedCustomer.id} • LTV: ₹{selectedCustomer.spend.toLocaleString()}</span>
                  </div>
                </div>
                <X className="h-4.5 w-4.5 cursor-pointer text-muted-foreground mt-1" onClick={() => setSelectedCustomer(null)} />
              </div>
              
              {/* Profile Subtabs */}
              <div className="flex gap-2 border-b border-border/30 pb-2 mt-4">
                {[
                  { id: 'profile', label: '360° Profile' },
                  { id: 'orders', label: 'Order History' },
                  { id: 'subscriptions', label: 'Recurring Sub' },
                  { id: 'timeline', label: 'Customer Timeline' },
                  { id: 'notes', label: 'Merchant Notes' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setProfileTab(tab.id as any)}
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${profileTab === tab.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-4 overflow-y-auto no-scrollbar flex-1">
              
              {/* Tab 1: Profile Details */}
              {profileTab === 'profile' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/30 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">Contact Email</span>
                      <span className="text-xs font-bold text-foreground truncate">{selectedCustomer.email}</span>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">Mobile Phone</span>
                      <span className="text-xs font-bold text-foreground">{selectedCustomer.phone}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl flex flex-col gap-0.5">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">Primary Delivery Address</span>
                    <span className="text-xs font-semibold text-foreground">{selectedCustomer.address}</span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2.5 mt-2">
                    <a href={`tel:${selectedCustomer.phone}`} className="flex-1 p-2 bg-secondary border border-border/80 hover:bg-secondary/80 text-foreground text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1.5">
                      <Phone className="h-4 w-4 text-primary" /> Call Customer
                    </a>
                    <a href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 p-2 bg-secondary border border-border/80 hover:bg-secondary/80 text-foreground text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-[#25D366]" /> Chat WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {/* Tab 2: Orders History */}
              {profileTab === 'orders' && (
                <div className="flex flex-col gap-3">
                  {selectedCustomer.recentOrdersList.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No order records found.</p>
                  ) : selectedCustomer.recentOrdersList.map((ord: any) => (
                    <div key={ord.id} className="p-3 bg-secondary/20 rounded-xl border border-border flex justify-between items-center text-xs">
                      <div className="flex flex-col text-left gap-0.5">
                        <span className="font-extrabold text-foreground">{ord.id}</span>
                        <span className="text-[9.5px] text-muted-foreground">{ord.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-foreground">₹{ord.amount.toLocaleString()}</span>
                        <Badge variant={ord.status === 'Delivered' ? 'success' : 'secondary'}>{ord.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Subscriptions */}
              {profileTab === 'subscriptions' && (
                <div className="flex flex-col gap-3">
                  {!customerSubscription ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No active subscriptions registered.</p>
                  ) : (
                    <div className="p-3 bg-secondary/35 border border-border rounded-xl flex items-center justify-between text-xs text-left">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">{customerSubscription.productName}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">Frequency: {customerSubscription.frequency} • Qty: {customerSubscription.quantity} units</span>
                      </div>
                      <Badge variant={customerSubscription.status === 'active' ? 'success' : 'secondary'}>{customerSubscription.status}</Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Customer Timeline */}
              {profileTab === 'timeline' && (
                <div className="flex flex-col pl-4 border-l-2 border-primary/20 relative gap-6 text-xs text-left mt-2">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="font-bold text-foreground">Account Registered</div>
                    <span className="text-[9.5px] text-muted-foreground block mt-0.5">Mobile login verified. Joined CRM registry list.</span>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="font-bold text-foreground">Placed First Order</div>
                    <span className="text-[9.5px] text-muted-foreground block mt-0.5">Checkout completed for ₹820. Loyalty program initialized.</span>
                  </div>
                  {customerSubscription && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                      <div className="font-bold text-foreground">Recurring Subscription Started</div>
                      <span className="text-[9.5px] text-muted-foreground block mt-0.5">Setup daily run program for {customerSubscription.productName}.</span>
                    </div>
                  )}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <div className="font-bold text-foreground">Last Purchase Checkout</div>
                    <span className="text-[9.5px] text-muted-foreground block mt-0.5">Delivered successfully. Overall CSI index: 5⭐.</span>
                  </div>
                </div>
              )}

              {/* Tab 5: Merchant Notes */}
              {profileTab === 'notes' && (
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Merchant Internal Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Enter private delivery preferences or support details (e.g. Always pays online)..."
                    value={customerNoteText}
                    onChange={(e) => setCustomerNoteText(e.target.value)}
                    className="w-full border border-border rounded-lg p-2.5 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <Button 
                    disabled={savingNote}
                    onClick={handleSaveNote}
                    className="self-end cursor-pointer bg-primary text-white font-bold h-9 px-4 text-xs flex items-center gap-1.5"
                  >
                    {savingNote ? "Saving Note..." : "Save Notes"}
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};



export default CustomerManagement;
