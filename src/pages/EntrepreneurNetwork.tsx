import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Users, Coins, Gift, TrendingUp, Award, UserPlus, Search, CheckCircle2, Target } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export interface Entrepreneur {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAcquisitions: number;
  salesGenerated: number;
  totalIncentivesPaid: number;
  totalIncentivesPending: number;
  rank: number;
  joinedDate: string;
  status: 'Active' | 'Inactive';
}

interface AcquisitionLog {
  id: string;
  vendorName: string;
  ownerName: string;
  businessType: string;
  acquiredBy: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const EntrepreneurNetwork: React.FC = () => {
  const { currentPage, entrepreneurs = [], acquisitions = [] } = useVendor();
  const [success, setSuccess] = useState<string | null>(null);

  // Submenu checks
  const isAssociated = currentPage === 'ent-associated' || currentPage === 'ent';
  const isAcquisition = currentPage === 'ent-acquisition';
  const isSales = currentPage === 'ent-sales';
  const isIncentives = currentPage === 'ent-incentives';
  const isPerformance = currentPage === 'ent-performance';
  const isLeaderboard = currentPage === 'ent-leaderboard';

  const [localAcquisitions, setLocalAcquisitions] = useState<AcquisitionLog[]>([]);

  React.useEffect(() => {
    if (acquisitions && acquisitions.length > 0) {
      setLocalAcquisitions(acquisitions);
    }
  }, [acquisitions]);

  // Form states
  const [newVendorName, setNewVendorName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newBizType, setNewBizType] = useState('Retailer');
  const [newAcquirer, setNewAcquirer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    if (entrepreneurs.length > 0 && !newAcquirer) {
      setNewAcquirer(entrepreneurs[0].name);
    }
  }, [entrepreneurs, newAcquirer]);

  const triggerToast = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleRegisterAcquisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName || !newOwnerName) return;
    const log: AcquisitionLog = {
      id: `ACQ-${Math.floor(100 + Math.random() * 900)}`,
      vendorName: newVendorName,
      ownerName: newOwnerName,
      businessType: newBizType,
      acquiredBy: newAcquirer,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setLocalAcquisitions(prev => [log, ...prev]);
    setNewVendorName('');
    setNewOwnerName('');
    triggerToast(`Vendor "${log.vendorName}" successfully registered under acquisition pipeline!`);
  };

  // Recharts Data
  const monthlyAcquisitionsData = [
    { name: 'Jan', Sales: 310000, Acquisitions: 8 },
    { name: 'Feb', Sales: 680000, Acquisitions: 15 },
    { name: 'Mar', Sales: 1240000, Acquisitions: 26 },
    { name: 'Apr', Sales: 1890000, Acquisitions: 34 },
    { name: 'May', Sales: 2850000, Acquisitions: 49 },
    { name: 'Jun', Sales: 3560000, Acquisitions: 62 }
  ];

  const filteredEntrepreneurs = entrepreneurs.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.phone.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Toast Notification */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-xs font-bold">{success}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Entrepreneur Network & Acquisitions</h1>
          <p className="text-xs text-muted-foreground">Manage associated acquisition agents, track registered vendors, manage incentive releases, and view agent leaderboards.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2.5 py-1 text-xs bg-secondary/30">
            Total Agents: {entrepreneurs.length}
          </Badge>
        </div>
      </div>

      {/* Submenu Tabs UI */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button size="sm" variant={isAssociated ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#ent-associated'}>
          <Users className="h-3.5 w-3.5 mr-1" /> Associated Entrepreneurs
        </Button>
        <Button size="sm" variant={isAcquisition ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#ent-acquisition'}>
          <UserPlus className="h-3.5 w-3.5 mr-1" /> Vendor Acquisition
        </Button>
        <Button size="sm" variant={isSales ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#ent-sales'}>
          <Coins className="h-3.5 w-3.5 mr-1" /> Sales Generated
        </Button>
        <Button size="sm" variant={isIncentives ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#ent-incentives'}>
          <Gift className="h-3.5 w-3.5 mr-1" /> Payout Incentives
        </Button>
        <Button size="sm" variant={isPerformance ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#ent-performance'}>
          <TrendingUp className="h-3.5 w-3.5 mr-1" /> Performance Analytics
        </Button>
        <Button size="sm" variant={isLeaderboard ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#ent-leaderboard'}>
          <Award className="h-3.5 w-3.5 mr-1" /> Leaderboard
        </Button>
      </div>

      {/* SEARCH BAR */}
      {(isAssociated || isAcquisition) && (
        <div className="flex items-center gap-2 bg-secondary/20 border border-border/60 px-3 py-2 rounded-lg max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Entrepreneur/Agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-full"
          />
        </div>
      )}

      {/* CORE CONTENT SWITCHER */}
      {isAssociated && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-primary" /> Active Entrepreneur Directory
            </CardTitle>
            <CardDescription>Review contact details, registered acquisitions, and total earnings of agents</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Email / Phone</TableHead>
                  <TableHead>Total Acquisitions</TableHead>
                  <TableHead>Total Sales Generated</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntrepreneurs.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-extrabold text-foreground">{item.name}</TableCell>
                    <TableCell className="text-xs">
                      <div>{item.email}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{item.phone}</div>
                    </TableCell>
                    <TableCell className="font-semibold text-center">{item.totalAcquisitions}</TableCell>
                    <TableCell className="font-bold text-emerald-500">₹{item.salesGenerated.toLocaleString()}</TableCell>
                    <TableCell>{item.joinedDate}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isAcquisition && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submission Form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <UserPlus className="h-4.5 w-4.5 text-primary" /> Register Acquired Vendor
                </CardTitle>
                <CardDescription>Input onboarding vendor details to request activation commission tags</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterAcquisition} className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Vendor Shop Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahavir Textiles Pune"
                      value={newVendorName}
                      onChange={(e) => setNewVendorName(e.target.value)}
                      className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Owner Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahavir Shah"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-semibold">Business Type</label>
                      <select
                        value={newBizType}
                        onChange={(e) => setNewBizType(e.target.value)}
                        className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50 cursor-pointer"
                      >
                        <option value="Retailer">Retailer / Vendor</option>
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Manufacturer">Manufacturer</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-semibold">Acquired By Agent</label>
                      <select
                        value={newAcquirer}
                        onChange={(e) => setNewAcquirer(e.target.value)}
                        className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50 cursor-pointer"
                      >
                        {entrepreneurs.map(e => (
                          <option key={e.id} value={e.name}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full font-bold cursor-pointer">
                    Submit Onboarding Log
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Table Logs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary" /> Acquisition Onboarding Logs
                </CardTitle>
                <CardDescription>Onboarding status evaluation for verified retail stores</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shop & Owner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Acquired By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localAcquisitions.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs">
                          <div className="font-extrabold text-foreground">{item.vendorName}</div>
                          <div className="text-[10px] text-muted-foreground">Owner: {item.ownerName}</div>
                        </TableCell>
                        <TableCell className="text-xs">{item.businessType}</TableCell>
                        <TableCell className="text-xs font-semibold">{item.acquiredBy}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'Approved' ? 'default' : item.status === 'Rejected' ? 'destructive' : 'warning'}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isSales && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Coins className="h-4.5 w-4.5 text-primary" /> Monthly Gross Sales Generated by Agents
                </CardTitle>
                <CardDescription>Revenue growth driven strictly by entrepreneur-partner acquisitions</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyAcquisitionsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} />
                    <YAxis stroke="#a3a3a3" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f1f2e', borderColor: '#2e2e42', color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={3} name="Total Sales Value (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Target className="h-4.5 w-4.5 text-primary" /> Revenue Contribution Share
                </CardTitle>
                <CardDescription>Top agents by sales generated</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {entrepreneurs.sort((a, b) => b.salesGenerated - a.salesGenerated).map((e, idx) => (
                  <div key={e.id} className="flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-foreground">{idx + 1}. {e.name}</span>
                      <span className="text-[10px] text-muted-foreground">{e.totalAcquisitions} active stores</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-500">₹{e.salesGenerated.toLocaleString()}</span>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Contribution: {Math.round((e.salesGenerated / 3560000) * 100)}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isIncentives && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="glass bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Gift className="h-4.5 w-4.5 text-primary" /> Payout Summary
                </CardTitle>
                <CardDescription>Released vs Pending agent commissions</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-semibold">Total Paid Incentives</span>
                  <span className="font-bold text-emerald-500">₹178,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground font-semibold">Total Pending Release</span>
                  <span className="font-bold text-amber-500">₹35,600</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground font-semibold">Next Release Date</span>
                  <span className="font-bold text-foreground">2026-06-25</span>
                </div>
                <Button className="w-full font-bold cursor-pointer mt-2" onClick={() => triggerToast('Commissions ledger compiled! Triggering bank ACH transfers for next release cycle.')}>
                  Release Verified Commissions
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Coins className="h-4.5 w-4.5 text-primary" /> Payout Payout Ledger
                </CardTitle>
                <CardDescription>Individual agent payout logs and current bank holdings</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent Name</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Pending Release</TableHead>
                      <TableHead>Verification Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entrepreneurs.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-extrabold text-foreground">{item.name}</TableCell>
                        <TableCell className="font-bold text-emerald-500">₹{item.totalIncentivesPaid.toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-amber-500">₹{item.totalIncentivesPending.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="default">Verified</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="h-7 cursor-pointer text-xs" onClick={() => triggerToast(`Payout sheet generated for ${item.name}`)}>
                            Audit Sheet
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isPerformance && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-primary" /> Agent Performance Metrics
                </CardTitle>
                <CardDescription>Correlation of monthly acquisitions against total active sales</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyAcquisitionsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} />
                    <YAxis stroke="#a3a3a3" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f1f2e', borderColor: '#2e2e42', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="Acquisitions" fill="#0ea5e9" name="Monthly Partner Onboardings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isLeaderboard && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-primary" /> Regional Agent Leaderboard
            </CardTitle>
            <CardDescription>Entrepreneurs ranked by total acquisitions count and sales value</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Acquisitions Count</TableHead>
                  <TableHead>Total Sales Generated</TableHead>
                  <TableHead>Performance Score</TableHead>
                  <TableHead>Level Award</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entrepreneurs.sort((a, b) => b.totalAcquisitions - a.totalAcquisitions).map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-extrabold text-center text-primary text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-extrabold text-foreground">{item.name}</TableCell>
                    <TableCell className="font-semibold text-center">{item.totalAcquisitions}</TableCell>
                    <TableCell className="font-bold text-emerald-500">₹{item.salesGenerated.toLocaleString()}</TableCell>
                    <TableCell className="font-bold text-sky-400">{Math.round((item.salesGenerated / 15000) + (item.totalAcquisitions * 50))}</TableCell>
                    <TableCell>
                      <Badge variant={idx === 0 ? 'default' : idx === 1 ? 'info' : 'warning'}>
                        {idx === 0 ? 'Diamond Elite' : idx === 1 ? 'Gold Champion' : 'Silver Partner'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EntrepreneurNetwork;
