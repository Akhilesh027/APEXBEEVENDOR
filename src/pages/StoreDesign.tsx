import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Store, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Phone, 
  Mail, 
  FileText, 
  ShoppingBag, 
  Image as ImageIcon,
  Search,
  QrCode,
  Share2,
  Sparkles,
  CheckCircle2,
  Sliders,
  Package,
  Layers,
  Check,
  ChevronRight,
  Zap,
  ExternalLink,
  Edit3
} from 'lucide-react';

export const StoreDesign: React.FC = () => {
  const { profile, storeDesign, products, updateProfile } = useVendor();
  const [activeTab, setActiveTab] = useState<'products' | 'branding' | 'category_config' | 'hours' | 'policies'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Store Live Status State Toggle
  const [liveStatus, setLiveStatus] = useState<string>(profile?.liveStatus || 'open');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Filter products for storefront display
  const storeProducts = (products || []).filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return p.isStoreProduct !== false && matchesSearch;
  });

  const getInitials = (name: string) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'OPEN NOW & ACCEPTING ORDERS', classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'busy':
        return { label: 'BUSY (DELAYS EXPECTED)', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'vacation':
        return { label: 'ON VACATION', classes: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
      default:
        return { label: 'CLOSED', classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
    }
  };

  const formatPrice = (p: number) => {
    return `₹${Number(p || 0).toLocaleString('en-IN')}`;
  };

  const handleStatusToggle = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      setLiveStatus(newStatus);
      await updateProfile({ liveStatus: newStatus as any });
    } catch (err) {
      console.error('Failed to update store status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const storeUrl = `https://apexbee.in/store/${(profile.businessName || 'vendor').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const copyStoreLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Top Header & Digital Storefront Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border/80 p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3 text-left">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span>My Digital Storefront</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-500 border border-amber-400/30">
                ✨ Live Store Mode
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize your store branding, manage storefront product shelf, and inspect live customer experience.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold border border-border/80 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <QrCode className="h-4 w-4 text-primary" />
            <span>Store QR Code</span>
          </button>

          <button
            onClick={copyStoreLink}
            className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Store'}</span>
          </button>
        </div>
      </div>

      {/* REALISTIC STOREFRONT HERO CANOPY CARD */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-950 text-white group">
        {/* Glowing Ambient Backdrop */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cover Banner */}
        <div className="relative h-48 md:h-56 w-full overflow-hidden bg-slate-900">
          {storeDesign.bannerUrl ? (
            <img src={storeDesign.bannerUrl} alt="Store Cover" className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center opacity-80">
              <div className="text-center opacity-30">
                <Store className="h-16 w-16 mx-auto mb-2" />
                <span className="text-xs uppercase font-extrabold tracking-widest">ApexBee Hyperlocal Storefront</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Store Live Status Indicator Pill */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider shadow-xl backdrop-blur-md ${getStatusDisplay(liveStatus).classes}`}>
              <span className="h-2.5 w-2.5 rounded-full bg-current animate-ping" />
              {getStatusDisplay(liveStatus).label}
            </span>
          </div>
        </div>

        {/* Store Profile Info Bar */}
        <div className="relative z-10 px-6 pb-6 pt-0 md:px-8 md:pb-8 flex flex-col md:flex-row gap-6 md:items-end justify-between -mt-16 text-left">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
            {/* Logo Avatar */}
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-slate-900 border-2 border-amber-400/60 shadow-2xl overflow-hidden flex items-center justify-center shrink-0 relative group/logo">
              {storeDesign.logoUrl ? (
                <img src={storeDesign.logoUrl} alt="Store Logo" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-inner">
                  {getInitials(profile.businessName)}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition flex items-center justify-center text-amber-300">
                <Edit3 className="h-5 w-5" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                  {profile.businessName || 'My ApexBee Store'}
                </h2>
                {profile.verifiedBadge && (
                  <Badge variant="success" className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Store
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-300 font-medium">
                <span className="font-bold text-amber-400">{profile.category || 'Food & Dining / Retail'}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {profile.pincode || 'PIN Pending'} ({(profile as any).city || profile.district || 'Hyperlocal Hub'})</span>
                {profile.fssaiNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-zinc-400">FSSAI: {profile.fssaiNumber}</span>
                  </>
                )}
              </div>

              <p className="mt-2 text-xs text-zinc-400 line-clamp-1 max-w-2xl leading-relaxed">
                📍 {profile.address || 'Store Location: Main Market Road, ApexBee Hyperlocal Zone'}
              </p>
            </div>
          </div>

          {/* Live Status Control Toggle Buttons */}
          <div className="flex flex-col gap-2 shrink-0 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl backdrop-blur-md">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">Store Status Control</span>
            <div className="flex items-center gap-1.5">
              {[
                { key: 'open', label: '🟢 Open', bg: 'hover:bg-emerald-500/20 text-emerald-400' },
                { key: 'busy', label: '🟡 Busy', bg: 'hover:bg-amber-500/20 text-amber-400' },
                { key: 'closed', label: '🔴 Closed', bg: 'hover:bg-rose-500/20 text-rose-400' }
              ].map(st => (
                <button
                  key={st.key}
                  disabled={updatingStatus}
                  onClick={() => handleStatusToggle(st.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    liveStatus === st.key
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                      : `bg-slate-800/80 text-zinc-300 ${st.bg}`
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Store Highlights Footbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-800/80 border-t border-slate-800/80 bg-slate-950/80 text-center text-xs">
          <div className="p-3.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Express Delivery</span>
            <strong className="text-white font-black text-sm">⚡ 15-20 Mins</strong>
          </div>
          <div className="p-3.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Minimum Order</span>
            <strong className="text-white font-black text-sm">₹{profile.minOrder || 100}</strong>
          </div>
          <div className="p-3.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Delivery Fee</span>
            <strong className="text-amber-400 font-black text-sm">{profile.deliveryCharge === 0 ? 'FREE' : `₹${profile.deliveryCharge || 40}`}</strong>
          </div>
          <div className="p-3.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Coverage Radius</span>
            <strong className="text-white font-black text-sm">📍 {profile.deliveryRadiusKm || 5} KM</strong>
          </div>
        </div>
      </div>

      {/* STORE NAVIGATION TABS */}
      <div className="p-2 bg-slate-900/90 rounded-2xl shadow-xl flex flex-wrap gap-2 text-left border border-slate-800">
        {[
          { key: 'products', label: 'Storefront Products Shelf', icon: '🛍️', count: storeProducts.length },
          { key: 'branding', label: 'Store Branding & Cover', icon: '🎨' },
          { key: 'category_config', label: 'Category & License Specs', icon: '⚙️' },
          { key: 'hours', label: 'Weekly Operating Hours', icon: '⏰' },
          { key: 'policies', label: 'Store Policies & Support', icon: '🛡️' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border-none flex items-center gap-2 ${
              activeTab === tab.key 
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105 font-black' 
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold'
            }`}
          >
            <span>{tab.icon} {tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.key ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: PRODUCTS SHELF */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-xs">
            <div className="flex flex-col text-left">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>🛍️ Active Storefront Product Shelf ({storeProducts.length})</span>
              </h2>
              <p className="text-xs text-muted-foreground">Products enabled for local storefront display that nearby customers can discover and order.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search store catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-xl outline-none text-foreground"
              />
            </div>
          </div>

          {storeProducts.length === 0 ? (
            <div className="py-16 bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/35 mb-3 animate-bounce" />
              <p className="font-extrabold text-foreground text-sm">No Active Store Items Found</p>
              <p className="max-w-xs mt-1 leading-relaxed">
                {searchQuery 
                  ? 'No items match your active search query.' 
                  : 'To display products on your store shelf, enable "Show in Local Store" in Product Management.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 text-left">
              {storeProducts.map(p => {
                const subAvailable = p.isSubscriptionAvailable === true;
                const isVeg = p.name?.toLowerCase().includes('veg') && !p.name?.toLowerCase().includes('non-veg');
                const isNonVeg = p.name?.toLowerCase().includes('chicken') || p.name?.toLowerCase().includes('mutton') || p.name?.toLowerCase().includes('non-veg');

                return (
                  <div key={p.id} className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card overflow-hidden hover:shadow-xl transition duration-300 relative">
                    <div>
                      {/* Product Thumbnail */}
                      <div className="h-44 bg-muted overflow-hidden relative border-b border-border/60">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" />
                        ) : (
                          <div className="h-full w-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
                            <Store className="h-10 w-10 opacity-25" />
                          </div>
                        )}

                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                          {isVeg && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wide shadow-md">
                              🟢 Pure Veg
                            </span>
                          )}
                          {isNonVeg && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wide shadow-md">
                              🔴 Non-Veg
                            </span>
                          )}
                          {subAvailable && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-black uppercase tracking-wide shadow-md">
                              🔄 Subscription
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-400/30">
                          ⚡ 15-20 MINS
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-1.5">
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block truncate">
                          {p.brand || p.category || 'General Store Product'}
                        </span>
                        <h4 className="font-black text-xs text-foreground line-clamp-2 leading-snug">{p.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono">SKU: {p.sku}</p>
                      </div>
                    </div>

                    {/* Price & Stock */}
                    <div className="px-4 pb-4 pt-2 border-t border-border/40 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase">Customer Price</span>
                        <span className="font-black text-sm text-foreground">{formatPrice(p.price)}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase">Stock</span>
                        <span className={`font-black text-[11px] ${p.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {p.stock > 0 ? `${p.stock} Ready` : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: BRANDING & COVER CUSTOMIZER */}
      {activeTab === 'branding' && (
        <Card className="border border-border shadow-xs text-left">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>🎨 Store Banner &amp; Logo Visual Branding</span>
            </CardTitle>
            <CardDescription>
              Upload custom store cover headers, store logo, and store tagline to attract local shoppers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-secondary/15 p-4 rounded-2xl border border-border/60">
                <span className="text-xs font-bold text-foreground block">Store Banner Cover</span>
                <div className="h-32 rounded-xl overflow-hidden bg-slate-900 border border-border/80 relative flex items-center justify-center">
                  {storeDesign.bannerUrl ? (
                    <img src={storeDesign.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-muted-foreground text-xs">
                      <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-40" />
                      <span>No custom cover uploaded</span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Enter Cover Image URL (e.g. https://...)"
                  defaultValue={storeDesign.bannerUrl || ''}
                  className="w-full p-2.5 text-xs bg-background border border-border rounded-xl outline-none font-mono"
                />
              </div>

              <div className="space-y-3 bg-secondary/15 p-4 rounded-2xl border border-border/60">
                <span className="text-xs font-bold text-foreground block">Store Avatar Logo</span>
                <div className="h-32 rounded-xl overflow-hidden bg-slate-900 border border-border/80 relative flex items-center justify-center">
                  {storeDesign.logoUrl ? (
                    <img src={storeDesign.logoUrl} alt="Logo" className="h-20 w-20 object-cover rounded-xl border border-amber-400/40" />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
                      {getInitials(profile.businessName)}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Enter Logo Image URL (e.g. https://...)"
                  defaultValue={storeDesign.logoUrl || ''}
                  className="w-full p-2.5 text-xs bg-background border border-border rounded-xl outline-none font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: CATEGORY & LICENSE SPECS */}
      {activeTab === 'category_config' && (
        <Card className="border border-border shadow-xs text-left">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>⚙️ Category Governance &amp; License Compliance</span>
            </CardTitle>
            <CardDescription>
              Backend governance profile, permitted subcategories, and verified license credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-secondary/20 border border-border/60 space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase">Primary Category</span>
                <strong className="text-sm text-foreground block font-bold">{profile.category || 'Retail Store'}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/20 border border-border/60 space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase">GST License Number</span>
                <strong className="text-sm font-mono text-primary block">{profile.gstNumber || '29ABCDE1234F1Z5'}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/20 border border-border/60 space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase">FSSAI License</span>
                <strong className="text-sm font-mono text-emerald-500 block">{profile.fssaiNumber || '10020042000123'}</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: OPERATING HOURS */}
      {activeTab === 'hours' && (
        <Card className="border border-border shadow-xs text-left">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>⏰ Store Weekly Operating Hours</span>
            </CardTitle>
            <CardDescription>
              Set weekly store opening and closing times for automated customer order placement windows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="p-3.5 rounded-xl bg-secondary/20 border border-border/60 flex items-center justify-between">
                <span className="font-extrabold text-foreground">{day}</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-emerald-500 font-bold">08:00 AM - 10:00 PM</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-extrabold text-[10px]">Open</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: POLICIES */}
      {activeTab === 'policies' && (
        <Card className="border border-border shadow-xs text-left">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>🛡️ Store Return &amp; Cancellation Policies</span>
            </CardTitle>
            <CardDescription>
              Configure customer guarantee terms, return windows, and instant refund policies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-secondary/20 border border-border/60 space-y-2">
              <span className="font-extrabold text-foreground block">Freshness Guarantee &amp; Return Window</span>
              <p className="text-muted-foreground leading-relaxed">
                Customers can report damaged or unsatisfied items within 2 hours of delivery for instant replacement or 100% wallet refund.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STORE SHARE QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 text-center text-xs space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-black text-sm text-foreground">Digital Storefront QR Code</h3>
              <button onClick={() => setShowQrModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-amber-400 inline-block shadow-lg mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(storeUrl)}`}
                alt="Store QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <div className="space-y-1">
              <strong className="text-foreground text-sm block font-black">{profile.businessName}</strong>
              <p className="text-[10px] text-muted-foreground font-mono break-all">{storeUrl}</p>
            </div>

            <button
              onClick={copyStoreLink}
              className="w-full py-2.5 bg-primary text-primary-foreground font-black rounded-xl cursor-pointer hover:bg-primary/90 transition shadow-xs"
            >
              {copiedLink ? '✓ Copied to Clipboard!' : 'Copy Direct Store Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
