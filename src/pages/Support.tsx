import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  Phone, 
  ChevronDown, 
  Search, 
  Calendar, 
  Paperclip, 
  Check, 
  Send, 
  RefreshCw,
  Activity
} from 'lucide-react';

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  date: string;
  status: 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  attachment?: string;
}

export const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Orders');
  const [ticketPriority, setTicketPriority] = useState('Low');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Tickets Tracking List
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: 'TCK-881', subject: 'Settlement delay for Wednesday sales', category: 'Wallet', priority: 'High', date: '2026-07-15', status: 'In Progress' },
    { id: 'TCK-880', subject: 'Drug License upload Blur reject', category: 'Profile', priority: 'Medium', date: '2026-07-12', status: 'Resolved', attachment: 'license_blurry.jpg' }
  ]);

  // Live Chat Simulator States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    { sender: 'agent', text: 'Hello! Welcome to ApexBee Help Desk. How can I assist you today?', time: '11:00 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Callback Scheduler States
  const [callbackDate, setCallbackDate] = useState('2026-07-17');
  const [callbackTime, setCallbackTime] = useState('14:00');
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  // System Diagnostics Scanner
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  const faqs = [
    { q: "How long does it take for product approval?", a: "Simple products are reviewed within 4-12 business hours. Variant or category-restricted listings can take up to 24 hours." },
    { q: "What is the payout settlement cycle?", a: "Earnings are credited to your Available Balance immediately after delivery completion and settled to your bank accounts within 24 hours of submitting a withdrawal request." },
    { q: "Who handles package delivery shipping?", a: "Platform shipping utilizes BlueDart & Delhivery dispatch systems. You can also configure your own courier services or self-delivery options in settings." },
    { q: "Can I edit the selling prices of live listings?", a: "Live catalog price changes require category manager approvals to prevent system tampering. Stock quantity updates are approved instantly." }
  ];

  // Filter FAQs based on AI search input
  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return faqs;
    return faqs.filter(faq => 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      subject: ticketSubject,
      category: ticketCategory,
      priority: ticketPriority,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      attachment: attachmentName || undefined
    };

    setTickets(prev => [newTicket, ...prev]);
    setSuccess(true);
    setTicketSubject('');
    setTicketMessage('');
    setAttachmentName(null);
    setTimeout(() => setSuccess(false), 5000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user' as const, text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulated reply
    setTimeout(() => {
      let replyText = "I have logged your request. A partner support agent will join shortly.";
      if (userMsg.text.toLowerCase().includes('sync') || userMsg.text.toLowerCase().includes('diagnose')) {
        replyText = "It looks like your catalog is fully synced. If you see delays, try clicking the Refresh icon in the Products dashboard.";
      } else if (userMsg.text.toLowerCase().includes('settle') || userMsg.text.toLowerCase().includes('payout')) {
        replyText = "Manual payout transfers are processed within 24 hours. Daily auto-settlements execute at 8:00 PM.";
      }
      setChatMessages(prev => [...prev, { sender: 'agent', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500);
  };

  const runSystemDiagnostics = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        network: "Connected (Excellent)",
        sync: "Fully Sync (0 SKU backlog)",
        wallet: "Active Balance Verified",
        qr: "UPI standees online",
        api: "Gateway latency: 42ms"
      });
    }, 2000);
  };

  const handleScheduleCallback = (e: React.FormEvent) => {
    e.preventDefault();
    setCallbackSuccess(true);
    setTimeout(() => setCallbackSuccess(false), 5000);
  };

  const getStatusBadgeColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'In Progress': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default: return 'bg-zinc-200 text-muted-foreground border-zinc-300';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary animate-pulse" /> Support &amp; Help Center
          </h1>
          <p className="text-xs text-muted-foreground">Submit support queries, read seller FAQs, and run smart system diagnostics checks.</p>
        </div>
      </div>

      {/* AI search pre-resolver FAQs */}
      <div className="relative flex items-center bg-card p-3.5 border border-primary/15 bg-primary/[0.01] rounded-xl gap-2">
        <Search className="h-5 w-5 text-primary shrink-0" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ask AI Support FAQ... e.g. price change, payout cycle, delivery delay"
          className="w-full text-xs font-semibold bg-transparent focus:outline-none placeholder-muted-foreground/80"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent">✕ Clear</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: FAQs and System Diagnostics */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* FAQs list */}
          <Card className="glass shadow-lg">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Frequently Asked Questions</CardTitle>
              <CardDescription>Instant answers matching your search criteria</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="border border-border/80 rounded-xl overflow-hidden bg-muted/10">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-3 flex justify-between items-center text-xs font-bold text-foreground hover:bg-secondary/40 transition-colors text-left cursor-pointer border-none"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-3.5 pt-0 text-xs text-muted-foreground bg-card leading-relaxed border-t border-border/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-6">
                  No FAQs match your search query. Try typing another issue, starting Live Chat, or running Diagnostics below.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Smart Diagnostics scanner */}
          <Card className="glass shadow-md">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/40">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Activity className="h-4.5 w-4.5 text-primary" /> Smart System Diagnostics</CardTitle>
                <CardDescription>Scan API sync statuses, network latencies, and transaction registers</CardDescription>
              </div>
              <Button 
                onClick={runSystemDiagnostics} 
                disabled={isScanning}
                className="h-8 text-xs font-bold px-3 cursor-pointer"
              >
                {isScanning ? <><RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> Scanning...</> : "Run Diagnostics Check"}
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {isScanning && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Running diagnostic protocols...
                </div>
              )}
              
              {scanResult && !isScanning && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-[10px] font-semibold text-muted-foreground">
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/40">
                    <span className="block text-[8px] uppercase tracking-wider font-bold">Network Connection</span>
                    <span className="text-emerald-500 font-extrabold mt-1 block">{scanResult.network}</span>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/40">
                    <span className="block text-[8px] uppercase tracking-wider font-bold">Inventory Sync</span>
                    <span className="text-emerald-500 font-extrabold mt-1 block">{scanResult.sync}</span>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/40">
                    <span className="block text-[8px] uppercase tracking-wider font-bold">Available Wallet</span>
                    <span className="text-emerald-500 font-extrabold mt-1 block">{scanResult.wallet}</span>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/40">
                    <span className="block text-[8px] uppercase tracking-wider font-bold">Store QR standees</span>
                    <span className="text-emerald-500 font-extrabold mt-1 block">{scanResult.qr}</span>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/40">
                    <span className="block text-[8px] uppercase tracking-wider font-bold">API Gateways Latency</span>
                    <span className="text-emerald-500 font-extrabold mt-1 block">{scanResult.api}</span>
                  </div>
                </div>
              )}
              
              {!scanResult && !isScanning && (
                <p className="text-xs text-muted-foreground italic text-center py-2">Click "Run Diagnostics Check" to analyze portal components.</p>
              )}
            </CardContent>
          </Card>

          {/* Support Tickets Timeline Stepper & Registry */}
          <Card className="glass shadow-lg">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Your Support Tickets &amp; Tracking Timeline</CardTitle>
              <CardDescription>Track resolution progress details and history</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {tickets.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6">No support tickets created yet.</p>
              ) : (
                <div className="flex flex-col divide-y divide-border/40">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-foreground">{ticket.subject}</span>
                          <span className="text-[9.5px] text-muted-foreground mt-0.5">ID: {ticket.id} • Category: {ticket.category} • Date: {ticket.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={ticket.priority === 'Critical' || ticket.priority === 'High' ? 'destructive' : 'secondary'} className="text-[8px] py-0">{ticket.priority} Priority</Badge>
                          <Badge className={`border text-[9px] font-black uppercase ${getStatusBadgeColor(ticket.status)}`}>{ticket.status}</Badge>
                        </div>
                      </div>

                      {/* Ticket Progress timeline stepper */}
                      <div className="flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase bg-secondary/15 p-2 rounded-lg border border-border/40 mt-1 max-w-lg">
                        <span className={ticket.status === 'Submitted' ? 'text-primary' : 'text-emerald-500'}>Submitted ✔</span>
                        <span>→</span>
                        <span className={ticket.status === 'Assigned' ? 'text-primary' : ticket.status === 'In Progress' || ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'text-emerald-500' : ''}>Assigned</span>
                        <span>→</span>
                        <span className={ticket.status === 'In Progress' ? 'text-primary animate-pulse' : ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'text-emerald-500' : ''}>In Progress</span>
                        <span>→</span>
                        <span className={ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'text-emerald-500 font-bold' : ''}>Resolved</span>
                      </div>

                      {ticket.attachment && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Paperclip className="h-3.5 w-3.5" /> Attachment: <span className="font-bold text-foreground">{ticket.attachment}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Ticket Builder, Callback Schedule, Live Chat */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-xs text-left">
          {/* Ticket Builder Card */}
          <Card className="glass shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <MessageSquare className="h-5 w-5 text-primary" /> Create Support Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTicketSubmit} className="flex flex-col gap-3">
                {success && (
                  <div className="p-2.5 text-[10.5px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
                    <Check className="h-4 w-4 text-emerald-500" /> Ticket logged! Support will contact you shortly.
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Ticket Subject *</label>
                  <input
                    required
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Price review delay for PROD-004"
                    className="border border-border/80 rounded-lg px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="border border-border/80 rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none"
                    >
                      <option value="Orders">Orders</option>
                      <option value="Wallet">Wallet / Payout</option>
                      <option value="Inventory">Inventory / Catalog</option>
                      <option value="Profile">Profile / KYC</option>
                      <option value="Other">Other Issues</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Priority</label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="border border-border/80 rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Message details *</label>
                  <textarea
                    required
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue..."
                    className="border border-border/80 rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Media file Attachment Upload Mock selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Attach Screenshots</label>
                  <div 
                    onClick={() => {
                      const mockFile = prompt("Enter mock screenshot name to upload (e.g. error.jpg):");
                      if (mockFile) setAttachmentName(mockFile);
                    }}
                    className="border border-dashed border-border hover:border-primary/50 p-2.5 rounded-lg text-center cursor-pointer bg-secondary/15 flex items-center justify-center gap-1.5 text-[10.5px] text-muted-foreground font-semibold"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>{attachmentName ? attachmentName : "Drag & drop files or click"}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-1 cursor-pointer font-bold h-9">
                  Submit Support ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Callback scheduler */}
          <Card className="glass shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Calendar className="h-4.5 w-4.5 text-primary" /> Request Call Center Callback</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleCallback} className="flex flex-col gap-2.5">
                {callbackSuccess && (
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] rounded-lg font-bold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Call request confirmed! We will ring you back.
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Schedule Date</label>
                  <input 
                    type="date" 
                    value={callbackDate} 
                    onChange={(e) => setCallbackDate(e.target.value)}
                    className="border border-border/80 rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Schedule Time slot</label>
                  <input 
                    type="time" 
                    value={callbackTime} 
                    onChange={(e) => setCallbackTime(e.target.value)}
                    className="border border-border/80 rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none" 
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full text-xs font-bold border-border cursor-pointer bg-background hover:bg-muted mt-1">
                  Book Callback Slot
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Live Chat messenger simulation widget */}
          <Card className="glass shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><MessageSquare className="h-4.5 w-4.5 text-primary" /> Live Chat Assistant</CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 flex flex-col gap-2.5">
              <div className="h-40 overflow-y-auto no-scrollbar border border-border/60 bg-secondary/15 rounded-lg p-2.5 flex flex-col gap-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col max-w-[80%] text-[10.5px] rounded-lg p-2 ${
                    msg.sender === 'user' ? 'bg-primary text-white self-end text-right' : 'bg-card text-foreground border border-border/80 self-start text-left'
                  }`}>
                    <span className="font-semibold block leading-relaxed">{msg.text}</span>
                    <span className="text-[8px] opacity-75 mt-0.5 block">{msg.time}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message..." 
                  className="w-full border border-border/80 rounded-lg px-2.5 text-xs bg-background text-foreground focus:outline-none"
                />
                <button type="submit" className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/95 text-white flex items-center justify-center cursor-pointer border-none shrink-0"><Send className="h-3.5 w-3.5" /></button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Toll free details */}
      <div className="border border-border/80 bg-secondary/10 p-4 rounded-xl flex flex-col md:flex-row justify-around gap-4 mt-2 text-center text-xs">
        <div className="flex flex-col items-center gap-1">
          <Mail className="h-4.5 w-4.5 text-primary" />
          <span className="font-bold text-foreground">Email Support</span>
          <span className="text-[11px] text-muted-foreground">partnersupport@apexmarket.in</span>
        </div>
        <div className="h-px md:h-10 w-full md:w-px bg-border/60" />
        <div className="flex flex-col items-center gap-1">
          <Phone className="h-4.5 w-4.5 text-primary" />
          <span className="font-bold text-foreground">Helpline Number</span>
          <span className="text-[11px] text-muted-foreground">+91 1800-103-9988 (Toll-free)</span>
        </div>
      </div>

    </div>
  );
};

export default Support;
