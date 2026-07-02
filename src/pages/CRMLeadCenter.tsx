import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Users, Phone, MessageSquare, Plus, CheckSquare, BarChart3, Send, CheckCircle2, XCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface Lead {
  id: string;
  name: string;
  type: 'Vendor' | 'Wholesaler' | 'Manufacturer' | 'Service' | 'Franchise';
  source: string;
  stage: 'New' | 'Contacted' | 'Interested' | 'Negotiation' | 'Converted' | 'Rejected';
  phone: string;
  notes: string;
}

interface TaskItem {
  id: string;
  title: string;
  leadName: string;
  dueDate: string;
  done: boolean;
}

export const CRMLeadCenter: React.FC = () => {
  const { currentPage } = useVendor();
  const [success, setSuccess] = useState<string | null>(null);

  // Submenu checks
  const isVendorL = currentPage === 'crm-vendor';
  const isWholesalerL = currentPage === 'crm-wholesaler';
  const isManufacturerL = currentPage === 'crm-manufacturer';
  const isServiceL = currentPage === 'crm-service';
  const isFranchiseL = currentPage === 'crm-franchise';
  const isFollowups = currentPage === 'crm-followups';
  const isTasks = currentPage === 'crm-tasks';
  const isConversions = currentPage === 'crm-conversions';
  const isSources = currentPage === 'crm-sources';

  const [leads, setLeads] = useState<Lead[]>([
    { id: 'LD-801', name: 'Pune Ethnic Retailers', type: 'Vendor', source: 'Direct Website Registration', stage: 'New', phone: '+91 99123 45678', notes: 'Interested in buying bulk sherwani sets' },
    { id: 'LD-802', name: 'Deccan Fabric Distributors', type: 'Wholesaler', source: 'Franchise Referral', stage: 'Interested', phone: '+91 98234 56789', notes: 'Wants to sign supply contract for cotton material' },
    { id: 'LD-803', name: 'Vedic Organic Mills', type: 'Manufacturer', source: 'Cold Outreach', stage: 'Negotiation', phone: '+91 97345 67890', notes: 'Negotiating price per kg of organic threads' },
    { id: 'LD-804', name: 'Kalyan Apparels Hub', type: 'Vendor', source: 'Google Ads Campaign', stage: 'Converted', phone: '+91 96456 78901', notes: 'First PO placed successfully (INV-PO-7782)' },
    { id: 'LD-805', name: 'Nashik Mandal Hub Operator', type: 'Franchise', source: 'Website Inquiry', stage: 'Negotiation', phone: '+91 95567 89012', notes: 'Applying to operate mandal territory' }
  ]);

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 'TSK-01', title: 'Call Pune Ethnic Retailers to explain MOQ terms', leadName: 'Pune Ethnic Retailers', dueDate: 'Today', done: false },
    { id: 'TSK-02', title: 'WhatsApp quotation sheet to Deccan Fabric', leadName: 'Deccan Fabric Distributors', dueDate: 'Tomorrow', done: false }
  ]);

  const [activeCall, setActiveCall] = useState<Lead | null>(null);
  const [activeChat, setActiveChat] = useState<Lead | null>(null);
  const [chatMsg, setChatMsg] = useState('');

  // Form states
  const [leadName, setLeadName] = useState('');
  const [leadType, setLeadType] = useState<'Vendor' | 'Wholesaler' | 'Manufacturer' | 'Service' | 'Franchise'>('Vendor');
  const [leadSource, setLeadSource] = useState('Google Search');
  const [leadPhone, setLeadPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const triggerMockAction = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const newL: Lead = {
      id: `LD-${Math.floor(100 + Math.random() * 900)}`,
      name: leadName,
      type: leadType,
      source: leadSource,
      stage: 'New',
      phone: leadPhone,
      notes: 'New registration'
    };
    setLeads(prev => [newL, ...prev]);
    setLeadName('');
    setLeadPhone('');
    setShowAddForm(false);
    triggerMockAction(`New lead "${newL.name}" successfully registered into CRM pipeline!`);
  };

  const handleUpdateStage = (id: string, stage: Lead['stage']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    triggerMockAction(`Updated lead status to: ${stage}`);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  const handleDial = (lead: Lead) => {
    setActiveCall(lead);
    setActiveChat(null);
  };

  const handleStartChat = (lead: Lead) => {
    setActiveChat(lead);
    setActiveCall(null);
    setChatMsg(`Hello ${lead.name}! I am reviewing your inquiry regarding ${lead.notes}. Let me know your available slot for a brief call.`);
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !activeChat) return;
    triggerMockAction(`WhatsApp message dispatched to ${activeChat.phone}!`);
    setActiveChat(null);
    setChatMsg('');
  };

  // Filter leads based on submenu
  const getFilteredLeads = () => {
    if (isVendorL) return leads.filter(l => l.type === 'Vendor');
    if (isWholesalerL) return leads.filter(l => l.type === 'Wholesaler');
    if (isManufacturerL) return leads.filter(l => l.type === 'Manufacturer');
    if (isServiceL) return leads.filter(l => l.type === 'Service');
    if (isFranchiseL) return leads.filter(l => l.type === 'Franchise');
    return leads;
  };

  const currentFilteredLeads = getFilteredLeads();

  // Funnel data
  const funnelData = [
    { stage: 'New', count: leads.filter(l => l.stage === 'New').length },
    { stage: 'Contacted', count: leads.filter(l => l.stage === 'Contacted').length },
    { stage: 'Interested', count: leads.filter(l => l.stage === 'Interested').length },
    { stage: 'Negotiation', count: leads.filter(l => l.stage === 'Negotiation').length },
    { stage: 'Converted', count: leads.filter(l => l.stage === 'Converted').length },
    { stage: 'Rejected', count: leads.filter(l => l.stage === 'Rejected').length }
  ];

  const getHeaderTitle = () => {
    if (isVendorL) return "Vendor Leads Directory";
    if (isWholesalerL) return "Wholesaler Leads Pipeline";
    if (isManufacturerL) return "Manufacturer Sourcing Leads";
    if (isServiceL) return "Service Providers leads";
    if (isFranchiseL) return "Franchise Operators Leads";
    if (isFollowups) return "Leads Follow-Up Schedule";
    if (isTasks) return "CRM Task Board";
    if (isConversions) return "CRM Sales Funnel Dashboard";
    if (isSources) return "Acquisition Source Analytics";
    return "CRM & Sales Lead Hub";
  };

  const getHeaderDesc = () => {
    if (isVendorL) return "Acquire and manage relationships with local retail shops.";
    if (isWholesalerL) return "Manage logistics partners and wholesale supply networks.";
    if (isManufacturerL) return "Coordinate yarn and weaving factory partners.";
    if (isServiceL) return "Track secondary delivery agents and payment gateway accounts.";
    if (isFranchiseL) return "Audit candidates requesting to operate district/mandal territories.";
    if (isFollowups) return "Schedule calls and follow-ups with interested contacts.";
    if (isTasks) return "Assign actions to your operators to close business deals.";
    if (isConversions) return "Analyze conversion ratios across CRM stages.";
    if (isSources) return "Audit which channels generate high-value registrations.";
    return "Complete business pipeline tracking contacts from cold registration to closed contracts.";
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">{getHeaderTitle()}</h1>
          <p className="text-xs text-muted-foreground">{getHeaderDesc()}</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-primary text-white py-2 rounded-lg font-bold cursor-pointer text-xs self-start sm:self-auto"
        >
          {showAddForm ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? 'Close Form' : 'Register New Lead'}
        </Button>
      </div>

      {success && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Forms & Simulators Panel */}
        {(showAddForm || activeCall || activeChat) && (
          <div className="lg:col-span-4 flex flex-col gap-6">
            {showAddForm && (
              <Card className="glass h-fit">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Register Candidate Lead</CardTitle>
                  <CardDescription>Configure contact credentials</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateLead} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Full Name / Entity *</label>
                      <input required type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="e.g. Pune Ethnic Stores" className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Lead Type *</label>
                      <select value={leadType} onChange={(e) => setLeadType(e.target.value as any)} className="border border-border/80 rounded-lg p-2 bg-background text-foreground text-xs focus:outline-none">
                        <option value="Vendor">Vendor</option>
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Manufacturer">Manufacturer</option>
                        <option value="Franchise">Franchise</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Source *</label>
                      <input required type="text" value={leadSource} onChange={(e) => setLeadSource(e.target.value)} placeholder="e.g. Google Ads" className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Phone *</label>
                      <input required type="text" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} placeholder="e.g. +91 99123 45678" className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none" />
                    </div>
                    <Button type="submit" className="w-full mt-2 bg-primary text-white font-bold h-9">Create Lead Profile</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeCall && (
              <Card className="glass border-rose-500/20 bg-rose-500/5 text-center p-6 flex flex-col items-center gap-4">
                <CardHeader className="p-0">
                  <Badge variant="destructive" className="animate-pulse">Active Dialer Session</Badge>
                  <CardTitle className="text-base font-extrabold text-foreground mt-2">{activeCall.name}</CardTitle>
                  <CardDescription>{activeCall.type} Lead • {activeCall.phone}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3 w-full p-0">
                  <div className="h-14 w-14 bg-rose-500 text-white rounded-full flex items-center justify-center animate-bounce shadow-md">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="text-[10px] text-muted-foreground italic">"Simulating secure outbound VoIP link..."</div>
                  <Button variant="destructive" className="w-full mt-1 font-bold cursor-pointer h-8 text-xs" onClick={() => setActiveCall(null)}>Hang Up</Button>
                </CardContent>
              </Card>
            )}

            {activeChat && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-1"><MessageSquare className="h-4.5 w-4.5 text-primary" /> WhatsApp Integration</CardTitle>
                  <CardDescription>To: {activeChat.name} ({activeChat.phone})</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendWhatsApp} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Message Body</label>
                      <textarea rows={4} value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-primary text-white font-bold h-8 text-xs flex items-center justify-center gap-1.5"><Send className="h-3.5 w-3.5" /> Send WhatsApp</Button>
                      <Button variant="outline" className="h-8 text-xs border-border" onClick={() => setActiveChat(null)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Lead Table or Specific Subview */}
        <div className={showAddForm || activeCall || activeChat ? 'lg:col-span-8 flex flex-col gap-6' : 'lg:col-span-12 flex flex-col gap-6'}>
          {/* Main Funnel Chart (isConversions) */}
          {(isConversions || currentPage === 'crm') && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <BarChart3 className="h-4.5 w-4.5 text-primary" /> CRM Funnel Stage Analytics
                </CardTitle>
                <CardDescription>Distribution of registered leads across pipelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                      <XAxis dataKey="stage" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                      <Bar dataKey="count" name="Leads" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CRM Tasks View */}
          {isTasks && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><CheckSquare className="h-4.5 w-4.5 text-primary" /> Outstanding CRM Tasks</CardTitle>
                <CardDescription>Action checklists to guide negotiations</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {tasks.map(t => (
                    <div key={t.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={t.done} onChange={() => handleToggleTask(t.id)} className="h-4 w-4 accent-primary cursor-pointer mt-0.5" />
                        <div className="flex flex-col text-left">
                          <span className={`text-xs font-bold ${t.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.title}</span>
                          <span className="text-[10px] text-muted-foreground">Lead: {t.leadName} • Due: {t.dueDate}</span>
                        </div>
                      </div>
                      <Badge variant={t.done ? 'success' : 'secondary'}>{t.done ? 'Done' : 'Pending'}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lead List Table */}
          {!isTasks && !isConversions && (
            <Card className="glass">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Users className="h-4.5 w-4.5 text-primary" /> Active Sourcing Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate Details</TableHead>
                      <TableHead>Lead Type</TableHead>
                      <TableHead>Lead Source</TableHead>
                      <TableHead>Funnel Stage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentFilteredLeads.map(l => (
                      <TableRow key={l.id} className="align-middle">
                        <TableCell className="font-bold text-foreground">
                          <div>{l.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{l.phone}</div>
                          <div className="text-[10px] text-amber-500 mt-0.5">{l.notes}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{l.type}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-semibold">{l.source}</TableCell>
                        <TableCell>
                          <select
                            value={l.stage}
                            onChange={(e) => handleUpdateStage(l.id, e.target.value as any)}
                            className="border border-border/60 rounded-md p-1 bg-secondary text-foreground text-xs focus:outline-none font-bold"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Interested">Interested</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Converted">Converted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => handleDial(l)} className="h-7 w-7 p-0 flex items-center justify-center cursor-pointer border-border"><Phone className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleStartChat(l)} className="h-7 w-7 p-0 flex items-center justify-center cursor-pointer border-border bg-primary/5 text-primary border-primary/20"><MessageSquare className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMLeadCenter;
