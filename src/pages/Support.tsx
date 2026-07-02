import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { HelpCircle, Mail, MessageSquare, Phone, CheckCircle2, ChevronDown } from 'lucide-react';

export const Support: React.FC = () => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How long does it take for product approval?", a: "Simple products are reviewed within 4-12 business hours. Variant or category-restricted listings can take up to 24 hours." },
    { q: "What is the payout settlement cycle?", a: "Earnings are credited to your Available Balance immediately after delivery completion and settled to your bank accounts within 24 hours of submitting a withdrawal request." },
    { q: "Who handles package delivery shipping?", a: "Platform shipping utilizes BlueDart & Delhivery dispatch systems. You can also configure your own courier services or self-delivery options in settings." },
    { q: "Can I edit the selling prices of live listings?", a: "Live catalog price changes require category manager approvals to prevent system tampering. Stock quantity updates are approved instantly." }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Support & Help Center</h1>
          <p className="text-xs text-muted-foreground">Submit support queries, read seller documentation, and view contact details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Tickets */}
        <Card className="glass lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <MessageSquare className="h-5 w-5 text-primary" /> Create Support Ticket
            </CardTitle>
            <CardDescription>Get in touch with category manager assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTicketSubmit} className="flex flex-col gap-3 text-left">
              {success && (
                <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Ticket submitted! Support will contact you shortly.
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Ticket Subject *</label>
                <input
                  required
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Price review delay for PROD-004"
                  className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Query message details *</label>
                <textarea
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue with order shipping, wallet transactions, or listing settings..."
                  className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground leading-normal"
                />
              </div>
              <Button type="submit" className="w-full mt-2 cursor-pointer">
                Submit Support Query
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQs list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers for common seller operations</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-left">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-border/80 rounded-xl overflow-hidden bg-muted/10">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 flex justify-between items-center text-xs font-bold text-foreground hover:bg-secondary/40 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-muted-foreground bg-card leading-relaxed border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}

            {/* Helpline Contacts */}
            <div className="border border-border/85 bg-secondary/20 p-4 rounded-xl flex flex-col md:flex-row justify-around gap-4 mt-4 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold text-foreground">Email Support</span>
                <span className="text-[11px] text-muted-foreground">partnersupport@apexmarket.in</span>
              </div>
              <div className="h-px md:h-12 w-full md:w-px bg-border/60" />
              <div className="flex flex-col items-center gap-1.5">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold text-foreground">Helpline Number</span>
                <span className="text-[11px] text-muted-foreground">+91 1800-103-9988 (Toll-free)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
