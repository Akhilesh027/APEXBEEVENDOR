import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { MapPin, TrendingUp, BarChart3, Compass, PlusCircle, Search, Target, CheckCircle2, ShieldAlert, AlertCircle, Building2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface Territory {
  id: string;
  mandal: string;
  district: string;
  state: string;
  vendorsCount: number;
  wholesalersCount: number;
  monthlyRevenue: number;
  penetrationRate: number; // percentage
  status: 'Active' | 'Under Review' | 'High Potential';
}

interface Competitor {
  id: string;
  name: string;
  marketShare: number; // percentage
  primaryCategory: string;
  pricingStrategy: 'Aggressive' | 'Standard' | 'Premium';
  threatLevel: 'Low' | 'Medium' | 'High';
}

interface ExpansionRequest {
  id: string;
  mandal: string;
  district: string;
  state: string;
  reason: string;
  proposedBudget: number;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const HyperlocalGrowth: React.FC = () => {
  const { currentPage } = useVendor();
  const [success, setSuccess] = useState<string | null>(null);

  // Submenu checks
  const isCoverage = currentPage === 'hl-coverage' || currentPage === 'hl';
  const isDistrict = currentPage === 'hl-district';
  const isMandal = currentPage === 'hl-mandal';
  const isPenetration = currentPage === 'hl-penetration';
  const isCompetitors = currentPage === 'hl-competitors';
  const isExpansion = currentPage === 'hl-expansion';

  // State mock data
  const [territories] = useState<Territory[]>([
    { id: 'TER-01', mandal: 'Hadapsar', district: 'Pune', state: 'Maharashtra', vendorsCount: 24, wholesalersCount: 4, monthlyRevenue: 1240000, penetrationRate: 68, status: 'Active' },
    { id: 'TER-02', mandal: 'Kothrud', district: 'Pune', state: 'Maharashtra', vendorsCount: 18, wholesalersCount: 3, monthlyRevenue: 980000, penetrationRate: 54, status: 'Active' },
    { id: 'TER-03', mandal: 'Gachibowli', district: 'Hyderabad', state: 'Telangana', vendorsCount: 35, wholesalersCount: 7, monthlyRevenue: 2450000, penetrationRate: 82, status: 'Active' },
    { id: 'TER-04', mandal: 'Madhapur', district: 'Hyderabad', state: 'Telangana', vendorsCount: 42, wholesalersCount: 9, monthlyRevenue: 3100000, penetrationRate: 89, status: 'Active' },
    { id: 'TER-05', mandal: 'Begumpet', district: 'Hyderabad', state: 'Telangana', vendorsCount: 15, wholesalersCount: 2, monthlyRevenue: 750000, penetrationRate: 40, status: 'Under Review' },
    { id: 'TER-06', mandal: 'Whitefield', district: 'Bengaluru', state: 'Karnataka', vendorsCount: 29, wholesalersCount: 6, monthlyRevenue: 1890000, penetrationRate: 75, status: 'Active' },
    { id: 'TER-07', mandal: 'Indiranagar', district: 'Bengaluru', state: 'Karnataka', vendorsCount: 12, wholesalersCount: 1, monthlyRevenue: 520000, penetrationRate: 30, status: 'High Potential' }
  ]);

  const [competitors] = useState<Competitor[]>([
    { id: 'COMP-01', name: 'ZizzyBazaar Networks', marketShare: 35, primaryCategory: 'Apparels & Footwear', pricingStrategy: 'Aggressive', threatLevel: 'High' },
    { id: 'COMP-02', name: 'RetailMart Logistics', marketShare: 20, primaryCategory: 'FMCG Groceries', pricingStrategy: 'Standard', threatLevel: 'Medium' },
    { id: 'COMP-03', name: 'SuperSaver Wholesales', marketShare: 15, primaryCategory: 'Electronics & Mobiles', pricingStrategy: 'Aggressive', threatLevel: 'High' },
    { id: 'COMP-04', name: 'LocalHaat Direct', marketShare: 10, primaryCategory: 'Handicrafts & Decor', pricingStrategy: 'Premium', threatLevel: 'Low' }
  ]);

  const [expansions, setExpansions] = useState<ExpansionRequest[]>([
    { id: 'EXP-101', mandal: 'Secunderabad', district: 'Hyderabad', state: 'Telangana', reason: 'High wholesale demand for organic threads', proposedBudget: 150000, submittedAt: '2026-06-10', status: 'Pending' },
    { id: 'EXP-102', mandal: 'Kalyan West', district: 'Thane', state: 'Maharashtra', reason: 'Unserved cluster of retail apparel vendors', proposedBudget: 250000, submittedAt: '2026-06-08', status: 'Approved' }
  ]);

  // Form states
  const [newMandal, setNewMandal] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newState, setNewState] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const triggerToast = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleCreateExpansion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMandal || !newDistrict || !newBudget) return;
    const req: ExpansionRequest = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      mandal: newMandal,
      district: newDistrict,
      state: newState || 'Maharashtra',
      reason: newReason,
      proposedBudget: Number(newBudget),
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setExpansions(prev => [req, ...prev]);
    setNewMandal('');
    setNewDistrict('');
    setNewState('');
    setNewReason('');
    setNewBudget('');
    triggerToast(`Expansion request for ${req.mandal} submitted successfully!`);
  };

  // Recharts calculations
  const districtPerformanceData = [
    { name: 'Hyderabad', Revenue: 6300000, Partners: 93 },
    { name: 'Pune', Revenue: 2220000, Partners: 42 },
    { name: 'Bengaluru', Revenue: 2410000, Partners: 48 }
  ];

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

  const competitorPieData = competitors.map(c => ({
    name: c.name,
    value: c.marketShare
  })).concat([{ name: 'ApexBee (Us)', value: 20 }]);

  const filteredTerritories = territories.filter(t =>
    t.mandal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.state.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Hyperlocal Growth & Territory Coverage</h1>
          <p className="text-xs text-muted-foreground">Monitor district performance, mandal levels penetration, competitor market shares, and submit expansion requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2.5 py-1 text-xs bg-secondary/30">
            Active Coverages: {territories.filter(t => t.status === 'Active').length} Mandals
          </Badge>
        </div>
      </div>

      {/* Submenu Tabs UI */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button size="sm" variant={isCoverage ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#hl-coverage'}>
          <MapPin className="h-3.5 w-3.5 mr-1" /> Territory Coverage
        </Button>
        <Button size="sm" variant={isDistrict ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#hl-district'}>
          <TrendingUp className="h-3.5 w-3.5 mr-1" /> District Performance
        </Button>
        <Button size="sm" variant={isMandal ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#hl-mandal'}>
          <BarChart3 className="h-3.5 w-3.5 mr-1" /> Mandal Leaderboard
        </Button>
        <Button size="sm" variant={isPenetration ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#hl-penetration'}>
          <Compass className="h-3.5 w-3.5 mr-1" /> Market Penetration
        </Button>
        <Button size="sm" variant={isCompetitors ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#hl-competitors'}>
          <Target className="h-3.5 w-3.5 mr-1" /> Competitor Tracking
        </Button>
        <Button size="sm" variant={isExpansion ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#hl-expansion'}>
          <PlusCircle className="h-3.5 w-3.5 mr-1" /> Expansion Requests
        </Button>
      </div>

      {/* SEARCH BAR */}
      {(isCoverage || isMandal || isPenetration) && (
        <div className="flex items-center gap-2 bg-secondary/20 border border-border/60 px-3 py-2 rounded-lg max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Mandal, District or State..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-full"
          />
        </div>
      )}

      {/* CORE CONTENTS BASED ON SELECTED VIEW */}
      {isCoverage && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" /> Active Mandal & District Coverages
            </CardTitle>
            <CardDescription>Comprehensive directory of geographic coverages linked to your partner account</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mandal</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Active Vendors</TableHead>
                  <TableHead>Active Wholesalers</TableHead>
                  <TableHead>Monthly Revenue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTerritories.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-extrabold text-foreground">{item.mandal}</TableCell>
                    <TableCell>{item.district}</TableCell>
                    <TableCell>{item.state}</TableCell>
                    <TableCell className="font-semibold">{item.vendorsCount}</TableCell>
                    <TableCell className="font-semibold">{item.wholesalersCount}</TableCell>
                    <TableCell className="font-bold text-emerald-500">₹{item.monthlyRevenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Active' ? 'default' : item.status === 'Under Review' ? 'warning' : 'info'}>
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

      {isDistrict && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-primary" /> District Revenue Performance
                </CardTitle>
                <CardDescription>Visual summary of total transaction values generated across major districts</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} />
                    <YAxis stroke="#a3a3a3" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f1f2e', borderColor: '#2e2e42', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#0ea5e9" name="Monthly Gross Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Building2 className="h-4.5 w-4.5 text-primary" /> Partner Penetration Density
                </CardTitle>
                <CardDescription>Total active registration hubs per district</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} />
                    <YAxis stroke="#a3a3a3" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f1f2e', borderColor: '#2e2e42', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="Partners" fill="#10b981" name="Associated Partners Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isMandal && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <BarChart3 className="h-4.5 w-4.5 text-primary" /> Mandal Performance Leaderboard
            </CardTitle>
            <CardDescription>Mandals ranked based on monthly transaction values and partner density</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Mandal</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Monthly Revenue</TableHead>
                  <TableHead>Growth (MoM)</TableHead>
                  <TableHead>Target Met</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTerritories.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-extrabold text-center text-primary text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-extrabold text-foreground">{item.mandal}</TableCell>
                    <TableCell>{item.district}</TableCell>
                    <TableCell className="font-bold text-emerald-500">₹{item.monthlyRevenue.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-sky-400">+{Math.floor(10 + (idx * 4))}%</TableCell>
                    <TableCell>
                      <Badge variant={idx < 4 ? 'default' : 'warning'}>
                        {idx < 4 ? '100% Exceeded' : '85% Target'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isPenetration && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-primary" /> Market Share & Penetration Rate
            </CardTitle>
            <CardDescription>Estimated percentage of local retailers registered under ApexBee ecosystem</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mandal</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Penetration Rate</TableHead>
                  <TableHead>Retailer Density Status</TableHead>
                  <TableHead>Action Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTerritories.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-extrabold text-foreground">{item.mandal}</TableCell>
                    <TableCell>{item.district}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground text-xs">{item.penetrationRate}%</span>
                        <div className="w-24 bg-secondary h-1.5 rounded-full overflow-hidden flex">
                          <div style={{ width: `${item.penetrationRate}%` }} className={`h-full ${item.penetrationRate > 70 ? 'bg-emerald-500' : 'bg-primary'}`} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.penetrationRate > 80 ? (
                        <Badge variant="default">High Saturation</Badge>
                      ) : item.penetrationRate > 50 ? (
                        <Badge variant="info">Moderate Growth</Badge>
                      ) : (
                        <Badge variant="warning">Underpenetrated</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.penetrationRate > 80 ? 'Optimize logistics & supply lines' : item.penetrationRate > 50 ? 'Launch referral incentives campaign' : 'Run local entrepreneur acquisition drive'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isCompetitors && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Target className="h-4.5 w-4.5 text-primary" /> Regional Competitor Directory
                </CardTitle>
                <CardDescription>Track pricing models and market share threats from external networks</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competitor Name</TableHead>
                      <TableHead>Market Share</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Pricing Model</TableHead>
                      <TableHead>Threat Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitors.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-extrabold text-foreground">{item.name}</TableCell>
                        <TableCell className="font-semibold text-foreground">{item.marketShare}%</TableCell>
                        <TableCell>{item.primaryCategory}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-border/80">{item.pricingStrategy}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.threatLevel === 'High' ? 'destructive' : item.threatLevel === 'Medium' ? 'warning' : 'default'}>
                            {item.threatLevel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-primary" /> Market Share Distribution
                </CardTitle>
                <CardDescription>Competitive landscape share including ApexBee</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={competitorPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {competitorPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f1f2e', borderColor: '#2e2e42', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              <div className="flex flex-wrap gap-3 p-4 justify-center text-xs border-t border-border/40">
                {competitorPieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-muted-foreground">{entry.name} ({entry.value}%)</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {isExpansion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submission Form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <PlusCircle className="h-4.5 w-4.5 text-primary" /> Submit Expansion Request
                </CardTitle>
                <CardDescription>Request regional support funds to establish coverages in new Mandals</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateExpansion} className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Mandal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Yerawada"
                      value={newMandal}
                      onChange={(e) => setNewMandal(e.target.value)}
                      className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-semibold">District *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pune"
                        value={newDistrict}
                        onChange={(e) => setNewDistrict(e.target.value)}
                        className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-semibold">State</label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Proposed Launch Budget (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150000"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Business Case & Feasibility Reason</label>
                    <textarea
                      placeholder="Brief details about retail densities and projected monthly sales volume..."
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      rows={3}
                      className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50 resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full font-bold cursor-pointer">
                    Submit Proposal
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Past Proposals logs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-4.5 w-4.5 text-primary" /> Active Proposals & Statuses
                </CardTitle>
                <CardDescription>Review evaluations status for requested expansion regions</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mandal / District</TableHead>
                      <TableHead>Proposed Budget</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expansions.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs">
                          <div className="font-extrabold text-foreground">{item.mandal}</div>
                          <div className="text-[10px] text-muted-foreground">{item.district}, {item.state}</div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground text-xs">₹{item.proposedBudget.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.submittedAt}</TableCell>
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
    </div>
  );
};

export default HyperlocalGrowth;
