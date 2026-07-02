import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Building2, Phone, HelpCircle, Megaphone, PlusCircle, Search, CheckCircle2, AlertCircle, XCircle, FileText } from 'lucide-react';

interface FranchiseManager {
  id: string;
  name: string;
  level: 'State' | 'District' | 'Mandal';
  territory: string;
  phone: string;
  email: string;
  status: 'Online' | 'Offline';
}

interface SupportRequest {
  id: string;
  subject: string;
  category: string;
  assignedTo: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Resolved' | 'Under Investigation';
  date: string;
}

interface MarketingMaterial {
  id: string;
  title: string;
  type: 'Banner' | 'Pamphlet' | 'Standee' | 'Video Guide';
  downloadSize: string;
  status: 'Available' | 'Request Print';
}

export const FranchiseConnect: React.FC = () => {
  const { currentPage } = useVendor();
  const [success, setSuccess] = useState<string | null>(null);

  // Submenu checks
  const isState = currentPage === 'fc-state' || currentPage === 'fc';
  const isDistrict = currentPage === 'fc-district';
  const isMandal = currentPage === 'fc-mandal';
  const isSupport = currentPage === 'fc-support';
  const isMarketing = currentPage === 'fc-marketing';
  const isExpansion = currentPage === 'fc-expansion';
  const isContacts = currentPage === 'fc-contacts';

  // State mock data
  const [managers] = useState<FranchiseManager[]>([
    { id: 'MGR-301', name: 'Narendra Dev', level: 'State', territory: 'Maharashtra', phone: '+91 91234 56780', email: 'narendra.dev@apexfranchise.com', status: 'Online' },
    { id: 'MGR-302', name: 'Kalyani Shinde', level: 'District', territory: 'Pune District', phone: '+91 92345 67891', email: 'kalyani.s@apexfranchise.com', status: 'Online' },
    { id: 'MGR-303', name: 'Satish Gokhale', level: 'Mandal', territory: 'Hadapsar Mandal', phone: '+91 93456 78902', email: 'satish.g@apexfranchise.com', status: 'Offline' },
    { id: 'MGR-304', name: 'Venkatesh Rao', level: 'State', territory: 'Telangana', phone: '+91 94567 89013', email: 'venkatesh.r@apexfranchise.com', status: 'Online' },
    { id: 'MGR-305', name: 'Srinivas Murthy', level: 'District', territory: 'Hyderabad District', phone: '+91 95678 90124', email: 'srinivas.m@apexfranchise.com', status: 'Online' },
    { id: 'MGR-306', name: 'Kiran Kumar', level: 'Mandal', territory: 'Madhapur Mandal', phone: '+91 96789 01235', email: 'kiran.k@apexfranchise.com', status: 'Online' }
  ]);

  const [tickets, setTickets] = useState<SupportRequest[]>([
    { id: 'TKT-701', subject: 'Delay in wholesale packaging kit supply', category: 'Logistics SLA', assignedTo: 'Kalyani Shinde', priority: 'High', status: 'Open', date: '2026-06-13' },
    { id: 'TKT-702', subject: 'Tax invoice mismatch in B2B RFQlot #11', category: 'Billing / GST', assignedTo: 'Narendra Dev', priority: 'Medium', status: 'Resolved', date: '2026-06-10' }
  ]);

  const [materials] = useState<MarketingMaterial[]>([
    { id: 'MKT-01', title: 'ApexBee Counter QR Standee Template', type: 'Standee', downloadSize: '14.2 MB (PDF)', status: 'Available' },
    { id: 'MKT-02', title: 'Wholesale Buyer Registration Pamphlet', type: 'Pamphlet', downloadSize: '8.5 MB (PDF)', status: 'Available' },
    { id: 'MKT-03', title: 'District Center Launch Flex Banner', type: 'Banner', downloadSize: '45.1 MB (TIFF)', status: 'Available' },
    { id: 'MKT-04', title: 'How to bind counter payments tutorial', type: 'Video Guide', downloadSize: '120.4 MB (MP4)', status: 'Available' }
  ]);

  const [expansions, setExpansions] = useState<any[]>([
    { id: 'FEXP-01', location: 'Katraj, Pune', level: 'Mandal Franchise', proposedRevenue: 500000, status: 'Under Review' }
  ]);

  // Form states
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Logistics SLA');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newLocation, setNewLocation] = useState('');
  const [newRevenue, setNewRevenue] = useState('');
  const [activeCall, setActiveCall] = useState<FranchiseManager | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const triggerToast = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject) return;
    const ticket: SupportRequest = {
      id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
      subject: newSubject,
      category: newCategory,
      assignedTo: 'Kalyani Shinde',
      priority: newPriority,
      status: 'Open',
      date: new Date().toISOString().split('T')[0]
    };
    setTickets(prev => [ticket, ...prev]);
    setNewSubject('');
    triggerToast(`Support ticket "${ticket.id}" created successfully. Franchise manager notified!`);
  };

  const handleCreateExpansion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation || !newRevenue) return;
    const exp = {
      id: `FEXP-${Math.floor(10 + Math.random() * 90)}`,
      location: newLocation,
      level: 'Mandal Franchise',
      proposedRevenue: Number(newRevenue),
      status: 'Under Review'
    };
    setExpansions(prev => [exp, ...prev]);
    setNewLocation('');
    setNewRevenue('');
    triggerToast(`Franchise expansion application for "${exp.location}" submitted!`);
  };

  const filteredManagers = managers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.territory.toLowerCase().includes(searchTerm.toLowerCase());
    if (isState) return matchesSearch && m.level === 'State';
    if (isDistrict) return matchesSearch && m.level === 'District';
    if (isMandal) return matchesSearch && m.level === 'Mandal';
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Toast Notification */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-xs font-bold">{success}</span>
        </div>
      )}

      {/* Dialer Modal */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl text-center flex flex-col gap-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse">
              <Phone className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-foreground text-base">Calling {activeCall.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{activeCall.level} Manager ({activeCall.territory})</p>
              <p className="text-sm font-bold text-primary mt-2">{activeCall.phone}</p>
            </div>
            <div className="text-[10px] text-muted-foreground leading-normal bg-secondary/30 p-2 rounded-lg italic">
              "Connecting securely using local VoIP telecom gateways. Ensure your headset is active."
            </div>
            <Button variant="outline" className="w-full text-xs font-semibold hover:bg-destructive/10 hover:text-destructive cursor-pointer" onClick={() => setActiveCall(null)}>
              <XCircle className="h-4 w-4 mr-1.5" /> End Call / Close Dialer
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Franchise Connect Dashboard</h1>
          <p className="text-xs text-muted-foreground">Collaborate with State/District franchise managers, request advertising collaterals, and submit tickets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2.5 py-1 text-xs bg-secondary/30">
            Assigned Managers: {managers.length}
          </Badge>
        </div>
      </div>

      {/* Submenu Tabs UI */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button size="sm" variant={isState ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#fc-state'}>
          <Building2 className="h-3.5 w-3.5 mr-1" /> State Franchise
        </Button>
        <Button size="sm" variant={isDistrict ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#fc-district'}>
          <Building2 className="h-3.5 w-3.5 mr-1" /> District Franchise
        </Button>
        <Button size="sm" variant={isMandal ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#fc-mandal'}>
          <Building2 className="h-3.5 w-3.5 mr-1" /> Mandal Franchise
        </Button>
        <Button size="sm" variant={isSupport ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#fc-support'}>
          <HelpCircle className="h-3.5 w-3.5 mr-1" /> Support Requests
        </Button>
        <Button size="sm" variant={isMarketing ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#fc-marketing'}>
          <Megaphone className="h-3.5 w-3.5 mr-1" /> Marketing Requests
        </Button>
        <Button size="sm" variant={isExpansion ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#fc-expansion'}>
          <PlusCircle className="h-3.5 w-3.5 mr-1" /> Expansion Requests
        </Button>
        <Button size="sm" variant={isContacts ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#fc-contacts'}>
          <Phone className="h-3.5 w-3.5 mr-1" /> Territory Contacts
        </Button>
      </div>

      {/* SEARCH BAR FOR CONTACT LISTS */}
      {(isState || isDistrict || isMandal || isContacts) && (
        <div className="flex items-center gap-2 bg-secondary/20 border border-border/60 px-3 py-2 rounded-lg max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Manager or Territory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-full"
          />
        </div>
      )}

      {/* CORE CONTENT SWITCHER */}
      {(isState || isDistrict || isMandal || isContacts) && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Building2 className="h-4.5 w-4.5 text-primary" />
              {isState ? 'State Managers Directory' : isDistrict ? 'District Managers Directory' : isMandal ? 'Mandal Managers Directory' : 'Territory Contacts Directory'}
            </CardTitle>
            <CardDescription>Initiate instant VoIP dialer outreach to geographic operational heads</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager Name</TableHead>
                  <TableHead>Designation Level</TableHead>
                  <TableHead>Territory Jurisdiction</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Live Status</TableHead>
                  <TableHead>Quick Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredManagers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-extrabold text-foreground">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs border-border/80">{item.level} Manager</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{item.territory}</TableCell>
                    <TableCell className="text-xs">{item.email}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Online' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" className="h-8 gap-1 font-bold cursor-pointer text-xs" onClick={() => setActiveCall(item)}>
                        <Phone className="h-3.5 w-3.5" /> Call Manager
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isSupport && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submission form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <HelpCircle className="h-4.5 w-4.5 text-primary" /> Open New Support Request
                </CardTitle>
                <CardDescription>Escalate regional billing or logistical bottlenecks to managers</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTicket} className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Detailed Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Courier boy refusing weight slabs check"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-semibold">Category Type</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50 cursor-pointer"
                      >
                        <option value="Logistics SLA">Logistics SLA</option>
                        <option value="Billing / GST">Billing / GST</option>
                        <option value="Catalog Errors">Catalog Errors</option>
                        <option value="App Bugs">App Bugs</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-semibold">Escalation Priority</label>
                      <select
                        value={newPriority}
                        onChange={(e: any) => setNewPriority(e.target.value)}
                        className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50 cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full font-bold cursor-pointer">
                    File Support Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Tickets list */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-4.5 w-4.5 text-primary" /> Logged Support Tickets
                </CardTitle>
                <CardDescription>Track resolution progress and escalation logs</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID & Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned Manager</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs">
                          <div className="font-extrabold text-foreground">{item.id}</div>
                          <div className="text-[10px] text-muted-foreground">{item.subject}</div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{item.category}</TableCell>
                        <TableCell>
                          <Badge variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'warning' : 'default'}>
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.assignedTo}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'Resolved' ? 'default' : item.status === 'Open' ? 'warning' : 'secondary'}>
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

      {isMarketing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(mat => (
            <Card key={mat.id} className="glass flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-xs border-border/80">{mat.type}</Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold">{mat.downloadSize}</span>
                </div>
                <CardTitle className="text-sm font-extrabold text-foreground mt-2">{mat.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col gap-3">
                <p className="text-[11px] text-muted-foreground">Download print-ready material containing pre-configured QR targets for local branding.</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 font-bold text-xs h-8 cursor-pointer" onClick={() => triggerToast(`Downloading file: ${mat.title}`)}>
                    Download File
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs cursor-pointer" onClick={() => triggerToast(`Print order request submitted for ${mat.title}. Standee delivery will be dispatched via franchise route.`)}>
                    Order Prints
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isExpansion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Apply Form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <PlusCircle className="h-4.5 w-4.5 text-primary" /> Apply for Franchise Expansion
                </CardTitle>
                <CardDescription>Register requests to manage bigger hubs and expand regional territories</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateExpansion} className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Target Expansion Location (Mandal/City) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Katraj East, Pune"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Proposed Monthly Revenue Commitments (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500000"
                      value={newRevenue}
                      onChange={(e) => setNewRevenue(e.target.value)}
                      className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Covering Assets & Warehousing Space</label>
                    <textarea
                      placeholder="Specify if you have storage spacing or delivery riders already active..."
                      rows={3}
                      className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary/50 resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full font-bold cursor-pointer">
                    Submit Franchise Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Past logs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5 text-primary" /> Submitted Applications
                </CardTitle>
                <CardDescription>Track evaluation milestones for regional expansion centers</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location Location</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Revenue Commitment</TableHead>
                      <TableHead>Evaluation Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expansions.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-extrabold text-foreground text-xs">{item.location}</TableCell>
                        <TableCell className="text-xs">{item.level}</TableCell>
                        <TableCell className="font-bold text-emerald-500 text-xs">₹{item.proposedRevenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="warning">
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

export default FranchiseConnect;
