import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Building2, Phone, MessageSquare, Send, ShieldAlert, Award, Star } from 'lucide-react';

interface FranchiseContact {
  id: string;
  level: 'State' | 'District' | 'Mandal';
  name: string;
  region: string;
  phone: string;
  email: string;
  rating: number;
  commShare: string;
  joinedDate: string;
}

export const FranchiseRelationship: React.FC = () => {
  const [contacts] = useState<FranchiseContact[]>([
    { id: 'FR-101', level: 'State', name: 'Rohan Deshmukh', region: 'Maharashtra East', phone: '+91 91234 56780', email: 'rohan.state@apexbee.com', rating: 4.9, commShare: '2.5% of Sales', joinedDate: '2025-04-12' },
    { id: 'FR-205', level: 'District', name: 'Priya Sharma', region: 'Pune Central', phone: '+91 92345 67890', email: 'priya.pune@apexbee.com', rating: 4.7, commShare: '1.5% of Sales', joinedDate: '2025-08-18' },
    { id: 'FR-309', level: 'Mandal', name: 'Amit Kulkarni', region: 'Haveli Mandal', phone: '+91 93456 78901', email: 'amit.haveli@apexbee.com', rating: 4.5, commShare: '1.0% of Sales', joinedDate: '2026-02-05' },
    { id: 'FR-310', level: 'Mandal', name: 'Savita Patil', region: 'Mulshi Mandal', phone: '+91 94567 89012', email: 'savita.mulshi@apexbee.com', rating: 4.8, commShare: '1.0% of Sales', joinedDate: '2026-03-20' }
  ]);

  const [activeCall, setActiveCall] = useState<FranchiseContact | null>(null);
  const [activeChat, setActiveChat] = useState<FranchiseContact | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'me' | 'franchise'; text: string; time: string }[]>([]);

  const handleDial = (contact: FranchiseContact) => {
    setActiveCall(contact);
    setActiveChat(null);
  };

  const handleStartChat = (contact: FranchiseContact) => {
    setActiveChat(contact);
    setActiveCall(null);
    setChatMessage('');
    setChatLog([
      { sender: 'franchise', text: `Hello! I am your ${contact.level} Franchise Partner for ${contact.region}. How can I assist you today?`, time: '10:00 AM' }
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeChat) return;

    const newMsg = { sender: 'me' as const, text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatLog(prev => [...prev, newMsg]);
    setChatMessage('');

    // Simulate reply after 1.5 seconds
    setTimeout(() => {
      const responses = [
        "I will look into your delivery dispatch dispatch cycle right away.",
        "Yes, we are coordinating with the local warehouse to sort out this inventory allocation.",
        "Your territory payout adjustments will clear in the coming settlement schedule.",
        "I have escalated your query to the state coordinator. I will update you by evening."
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      setChatLog(prev => [...prev, {
        sender: 'franchise',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Franchise Relationship Management</h1>
          <p className="text-xs text-muted-foreground">Coordinate with State, District, and Mandal-level franchise partners to streamline operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contact Directory */}
        <div className={activeCall || activeChat ? 'lg:col-span-7 flex flex-col gap-6' : 'lg:col-span-12 flex flex-col gap-6'}>
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Building2 className="h-4.5 w-4.5 text-primary" /> Active Franchise Officers
              </CardTitle>
              <CardDescription>Direct helpline mapping for your dispatch regions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner Level</TableHead>
                    <TableHead>Officer Name</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead>Fee / Commission Split</TableHead>
                    <TableHead>Reputation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Badge
                          variant={c.level === 'State' ? 'default' : c.level === 'District' ? 'warning' : 'secondary'}
                          className="px-2"
                        >
                          {c.level} Partner
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        <div>{c.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{c.id}</div>
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-semibold">{c.region}</TableCell>
                      <TableCell className="text-xs text-indigo-500 font-bold">{c.commShare}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-current" /> {c.rating}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDial(c)}
                            className="h-7 w-7 p-0 flex items-center justify-center cursor-pointer"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartChat(c)}
                            className="h-7 w-7 p-0 flex items-center justify-center cursor-pointer bg-primary/5 border-primary/20 text-primary"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Franchise Program Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass border-emerald-500/10 bg-emerald-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <Award className="h-8 w-8 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-bold text-foreground">Franchise Referral Program</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Refer new partners to expand coverage in Maharashtra West and secure a 0.5% lifetime passive override commission on their sales.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-amber-500/10 bg-amber-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <ShieldAlert className="h-8 w-8 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-bold text-foreground">Escalation Protocol</span>
                  <p className="text-muted-foreground leading-relaxed">
                    If Mandal queries remain unresolved for more than 48 hours, they are automatically escalated to District Coordinator Priya Sharma.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialer and Chat Panels */}
        {(activeCall || activeChat) && (
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Call Simulator */}
            {activeCall && (
              <Card className="glass border-rose-500/20 bg-rose-500/5 text-center p-6 flex flex-col items-center gap-4">
                <CardHeader className="p-0">
                  <Badge variant="destructive" className="animate-pulse">Active Dialer Call</Badge>
                  <CardTitle className="text-lg font-extrabold text-foreground mt-2">{activeCall.name}</CardTitle>
                  <CardDescription>{activeCall.level} Officer • {activeCall.region}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 w-full p-0">
                  <div className="h-16 w-16 bg-rose-500 text-white rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-rose-500/25">
                    <Phone className="h-7 w-7" />
                  </div>
                  <div className="text-xs text-foreground font-mono">Dialing: <span className="font-bold">{activeCall.phone}</span></div>
                  <div className="text-[11px] text-muted-foreground italic">"Connecting secure SIP trunk link..."</div>
                  <Button
                    variant="destructive"
                    className="w-full mt-2 font-bold cursor-pointer"
                    onClick={() => setActiveCall(null)}
                  >
                    Disconnect Call
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Chat Simulator */}
            {activeChat && (
              <Card className="glass flex flex-col h-[480px]">
                <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                  <div className="flex flex-col text-left">
                    <CardTitle className="text-sm font-extrabold flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-primary" /> Chat with {activeChat.name}
                    </CardTitle>
                    <CardDescription>{activeChat.level} Partner • {activeChat.region}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-border h-7 px-2.5 cursor-pointer"
                    onClick={() => setActiveChat(null)}
                  >
                    Close
                  </Button>
                </CardHeader>
                
                {/* Chat Message Window */}
                <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar bg-black/10 dark:bg-black/20 text-xs">
                  {chatLog.map((log, index) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[80%] rounded-lg p-2.5 ${
                        log.sender === 'me'
                          ? 'self-end bg-primary text-primary-foreground rounded-tr-none text-right'
                          : 'self-start bg-secondary text-foreground rounded-tl-none text-left'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{log.text}</p>
                      <span className="text-[9px] text-muted-foreground/80 mt-1 block font-mono">{log.time}</span>
                    </div>
                  ))}
                </CardContent>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-border/40 flex gap-2">
                  <input
                    required
                    type="text"
                    placeholder="Type message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                  <Button type="submit" size="sm" className="h-9 px-3 flex items-center justify-center cursor-pointer">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FranchiseRelationship;
