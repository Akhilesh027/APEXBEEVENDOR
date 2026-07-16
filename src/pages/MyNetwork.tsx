import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { GitBranch, Share2, MapPin } from 'lucide-react';
import { useVendor } from '../context/VendorContext';

export const MyNetwork: React.FC = () => {
  const { profile, setCurrentPage } = useVendor();
  const role = profile.businessType || 'Vendor';

  // Determine network hierarchy based on role
  const isVendor = role === 'Vendor' || role === 'Vendor / Retailer';
  const isWholesaler = role === 'Wholesaler';

  const renderNetworkGraph = () => {
    if (isVendor) {
      return (
        <svg className="w-full max-w-[600px] h-[300px]" viewBox="0 0 200 100">
          {/* Connecting Lines */}
          <line x1="100" y1="20" x2="50" y2="70" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 3" className="animate-pulse" />
          <line x1="100" y1="20" x2="150" y2="70" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 3" className="animate-pulse" />

          {/* Node 1: Vendor (Root) */}
          <g onClick={() => setCurrentPage('profile')} className="cursor-pointer hover:opacity-80 transition-opacity">
            <circle cx="100" cy="20" r="10" fill="var(--primary)" />
            <text x="100" y="23" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">V</text>
            <text x="100" y="35" fontSize="5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">{profile.businessName}</text>
            <text x="100" y="40" fontSize="4" fill="var(--muted-foreground)" textAnchor="middle">(Vendor / You)</text>
          </g>

          {/* Node 2: Customers */}
          <g onClick={() => setCurrentPage('customer-management')} className="cursor-pointer hover:opacity-80 transition-opacity">
            <circle cx="50" cy="70" r="8" fill="#a855f7" />
            <text x="50" y="72" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">C</text>
            <text x="50" y="83" fontSize="5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">1,240 Customers</text>
            <text x="50" y="88" fontSize="4" fill="var(--muted-foreground)" textAnchor="middle">(Direct Buyers)</text>
          </g>

          {/* Node 3: Referrals */}
          <g onClick={() => setCurrentPage('referrals')} className="cursor-pointer hover:opacity-80 transition-opacity">
            <circle cx="150" cy="70" r="8" fill="#eab308" />
            <text x="150" y="72" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">R</text>
            <text x="150" y="83" fontSize="5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">3 Referrals</text>
            <text x="150" y="88" fontSize="4" fill="var(--muted-foreground)" textAnchor="middle">(Partner Network)</text>
          </g>
        </svg>
      );
    }

    if (isWholesaler) {
      return (
        <svg className="w-full max-w-[600px] h-[300px]" viewBox="0 0 200 100">
          {/* Connecting Lines */}
          <line x1="100" y1="50" x2="50" y2="20" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="100" y1="50" x2="150" y2="80" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Node 1: Manufacturer (Upstream) */}
          <g onClick={() => setCurrentPage('b2b')} className="cursor-pointer hover:opacity-80 transition-opacity">
            <circle cx="50" cy="20" r="8" fill="#ef4444" />
            <text x="50" y="22" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">M</text>
            <text x="50" y="32" fontSize="5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">Surat Silk Guild</text>
            <text x="50" y="37" fontSize="4" fill="var(--muted-foreground)" textAnchor="middle">(Upstream Sourcing)</text>
          </g>

          {/* Node 2: Wholesaler (You) */}
          <g onClick={() => setCurrentPage('profile')} className="cursor-pointer hover:opacity-80 transition-opacity">
            <circle cx="100" cy="50" r="10" fill="var(--primary)" />
            <text x="100" y="53" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">W</text>
            <text x="100" y="65" fontSize="5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">{profile.businessName}</text>
            <text x="100" y="70" fontSize="4" fill="var(--muted-foreground)" textAnchor="middle">(Wholesaler / You)</text>
          </g>

          {/* Node 3: Retail Vendors (Downstream) */}
          <g onClick={() => setCurrentPage('customer-management')} className="cursor-pointer hover:opacity-80 transition-opacity">
            <circle cx="150" cy="80" r="8" fill="#a855f7" />
            <text x="150" y="82" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">V</text>
            <text x="150" y="90" fontSize="5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">45 Retail Stores</text>
            <text x="150" y="95" fontSize="4" fill="var(--muted-foreground)" textAnchor="middle">(Downstream Buyers)</text>
          </g>
        </svg>
      );
    }

    // Manufacturer View
    return (
      <svg className="w-full max-w-[600px] h-[300px]" viewBox="0 0 240 100">
        {/* Connecting Lines */}
        <line x1="30" y1="50" x2="90" y2="50" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="90" y1="50" x2="150" y2="50" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="150" y1="50" x2="210" y2="50" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Node 1: Manufacturer (You) */}
        <g onClick={() => setCurrentPage('profile')} className="cursor-pointer hover:opacity-80 transition-opacity">
          <circle cx="30" cy="50" r="10" fill="var(--primary)" />
          <text x="30" y="53" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">M</text>
          <text x="30" y="65" fontSize="5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">{profile.businessName}</text>
          <text x="30" y="70" fontSize="4" fill="var(--muted-foreground)" textAnchor="middle">(Mfg / You)</text>
        </g>

        {/* Node 2: Wholesaler */}
        <g onClick={() => setCurrentPage('b2b')} className="cursor-pointer hover:opacity-80 transition-opacity">
          <circle cx="90" cy="50" r="8" fill="#3b82f6" />
          <text x="90" y="52" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">W</text>
          <text x="90" y="62" fontSize="5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">Wholesalers</text>
          <text x="90" y="67" fontSize="4" fill="var(--muted-foreground)" textAnchor="middle">(Distributors Network)</text>
        </g>

        {/* Node 3: Retail Vendor */}
        <g onClick={() => setCurrentPage('b2b')} className="cursor-pointer hover:opacity-80 transition-opacity">
          <circle cx="150" cy="50" r="8" fill="#a855f7" />
          <text x="150" y="52" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">V</text>
          <text x="150" y="62" fontSize="5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">Retail Vendors</text>
          <text x="150" y="67" fontSize="4" fill="var(--muted-foreground)" textAnchor="middle">(Retailers Network)</text>
        </g>

        {/* Node 4: End Customer */}
        <g onClick={() => setCurrentPage('customer-management')} className="cursor-pointer hover:opacity-80 transition-opacity">
          <circle cx="210" cy="50" r="8" fill="#eab308" />
          <text x="210" y="52" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">C</text>
          <text x="210" y="62" fontSize="5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">End Customers</text>
          <text x="210" y="67" fontSize="4" fill="var(--muted-foreground)" textAnchor="middle">(Hyperlocal Consumers)</text>
        </g>
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">My Network Visualization</h1>
          <p className="text-xs text-muted-foreground">View interactive node relations and transaction flows between manufacturers, wholesalers, and vendors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Network Diagram Graphic and Nearby Map */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="text-left flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <GitBranch className="h-4.5 w-4.5 text-primary" /> Channel Network Graph
              </CardTitle>
              <CardDescription>Interactive SVG rendering of connected supply nodes. Click nodes to navigate.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6 bg-card/45 rounded-xl border border-border/40">
              {renderNetworkGraph()}
            </CardContent>
          </Card>

          {/* Interactive Geographic Map Mockup */}
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <MapPin className="h-4.5 w-4.5 text-primary animate-bounce" /> Hyperlocal Connections Map
              </CardTitle>
              <CardDescription>Visual map tracking referral coordinates in Buchireddypalem and Nellore district regions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 bg-card/40 border border-border/40 rounded-xl">
              <svg className="w-full max-w-[500px] h-[220px]" viewBox="0 0 200 100">
                {/* Background Grid Map Gridlines */}
                <rect x="5" y="5" width="190" height="90" rx="6" fill="var(--secondary)/10" stroke="var(--border)" strokeWidth="0.5" />
                <path d="M 0,25 Q 70,10 130,55 T 200,90" fill="none" stroke="var(--muted-foreground)" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
                <path d="M 50,0 Q 80,45 100,75 T 150,100" fill="none" stroke="var(--muted-foreground)" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
                
                {/* Pins */}
                {/* Pin 1: Buchi Center */}
                <g className="cursor-pointer hover:opacity-85">
                  <circle cx="65" cy="35" r="4.5" fill="var(--primary)" />
                  <circle cx="65" cy="35" r="7.5" fill="none" stroke="var(--primary)" strokeWidth="0.75" className="animate-ping" style={{ animationDuration: '3s' }} />
                  <text x="65" y="48" fontSize="4.5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">Buchi Store (Active)</text>
                </g>
                
                {/* Pin 2: Nellore Hub */}
                <g className="cursor-pointer hover:opacity-85">
                  <circle cx="135" cy="65" r="4.5" fill="#a855f7" />
                  <circle cx="135" cy="65" r="7.5" fill="none" stroke="#a855f7" strokeWidth="0.75" className="animate-ping" style={{ animationDuration: '3.5s' }} />
                  <text x="135" y="78" fontSize="4.5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">Nellore Hub (Pending)</text>
                </g>

                {/* Pin 3: Kovur Branch */}
                <g className="cursor-pointer hover:opacity-85">
                  <circle cx="105" cy="15" r="4" fill="#eab308" />
                  <text x="105" y="26" fontSize="4.5" fontWeight="bold" fill="var(--foreground)" textAnchor="middle">Kovur Center</text>
                </g>
              </svg>
            </CardContent>
          </Card>
        </div>

        {/* Sourcing/Network Highlights */}
        <Card className="glass lg:col-span-4 h-fit text-left">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Share2 className="h-4.5 w-4.5 text-primary" /> Network Growth Hub
            </CardTitle>
            <CardDescription>Metrics describing your connected channel nodes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {[
              { label: 'Connected Stores', val: '45 retail centers', desc: 'Stores procuring materials under contract' },
              { label: 'Business Volume', val: '₹14.2 Lakhs', desc: 'Total contract transaction volume' },
              { label: 'Referral Signups', val: '3 new registrations', desc: 'Business partners signed up via your VPA link' }
            ].map((stat, idx) => (
              <div key={idx} className="p-3 border border-border bg-muted/20 rounded-xl hover:border-primary/45 transition-colors">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">{stat.label}</span>
                <span className="text-sm font-extrabold text-foreground">{stat.val}</span>
                <span className="text-[9px] text-muted-foreground block mt-0.5">{stat.desc}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyNetwork;
