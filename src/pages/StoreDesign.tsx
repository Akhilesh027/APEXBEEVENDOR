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
  Search
} from 'lucide-react';

export const StoreDesign: React.FC = () => {
  const { profile, storeDesign, products } = useVendor();
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'gallery' | 'policies' | 'hours'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products that are designated as store products
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
        return { label: 'Open & Accepting Orders', classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'busy':
        return { label: 'Busy (Delays Expected)', classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'vacation':
        return { label: 'On Vacation', classes: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
      default:
        return { label: 'Closed', classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
    }
  };

  const formatPrice = (p: number) => {
    return `₹${Number(p || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col text-left">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" /> Storefront Preview
        </h1>
        <p className="text-xs text-muted-foreground">View your active store layout and listed items exactly as they appear to customers.</p>
      </div>

      {/* Main Banner Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-border/60 min-h-[220px] flex items-end bg-slate-900 text-white">
        {/* Banner Cover */}
        {storeDesign.bannerUrl ? (
          <div className="absolute inset-0 z-0">
            <img src={storeDesign.bannerUrl} alt="Store Cover" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-80" />
        )}

        {/* Content Overlay */}
        <div className="relative z-10 p-6 sm:p-8 w-full flex flex-col md:flex-row gap-6 md:items-center justify-between text-left">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
            {/* Logo */}
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-card border border-white/10 overflow-hidden flex items-center justify-center shrink-0 shadow-xl">
              {storeDesign.logoUrl ? (
                <img src={storeDesign.logoUrl} alt="Store Logo" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(profile.businessName)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight truncate">
                  {profile.businessName}
                </h1>
                {profile.verifiedBadge && (
                  <Badge variant="success" className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold shadow-sm ${getStatusDisplay(profile.liveStatus || 'open').classes}`}>
                  ● {getStatusDisplay(profile.liveStatus || 'open').label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-300">
                <span className="font-bold text-white">{profile.category || 'Retail Store'} • {profile.businessType || 'Vendor'}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Pincode: {profile.pincode || 'N/A'}</span>
                {profile.fssaiNumber && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px]">FSSAI: {profile.fssaiNumber}</span>
                  </>
                )}
              </div>
              <p className="mt-2.5 text-xs text-zinc-400 line-clamp-2 max-w-xl leading-relaxed">{profile.address || 'Address not set'}</p>
            </div>
          </div>

          {/* Delivery & Min Order Quick Insights */}
          <div className="flex flex-wrap gap-2 md:self-center">
            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-center shrink-0">
              <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Delivery Fee</p>
              <p className="text-xs font-extrabold text-white">{profile.deliveryCharge === 0 ? 'FREE' : `₹${profile.deliveryCharge}`}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-center shrink-0">
              <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Min Order</p>
              <p className="text-xs font-extrabold text-white">₹{profile.minOrder || 100}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-center shrink-0">
              <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Radius</p>
              <p className="text-xs font-extrabold text-white">{profile.deliveryRadiusKm || 5} KM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list navigation bar */}
      <div className="flex gap-1 border-b border-border/80 overflow-x-auto pb-1 select-none">
        {[
          { key: 'products', label: 'Products Catalog', icon: '🛍️' },
          { key: 'about', label: 'About Store', icon: 'ℹ️' },
          { key: 'gallery', label: 'Store Gallery', icon: '🖼️' },
          { key: 'policies', label: 'Return Policies', icon: '🛡️' },
          { key: 'hours', label: 'Operating Hours', icon: '⏰' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition whitespace-nowrap bg-transparent border-0 cursor-pointer ${
              activeTab === tab.key 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex flex-col text-left">
              <h2 className="text-base font-bold text-foreground">Products listed on Hyperlocal</h2>
              <p className="text-xs text-muted-foreground">Products with local store listing enabled that nearby buyers can discover.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search store products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg outline-none text-foreground"
              />
            </div>
          </div>

          {storeProducts.length === 0 ? (
            <div className="py-16 bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/35 mb-2" />
              <p className="font-semibold text-foreground">No Local Products Found</p>
              <p className="max-w-xs mt-1 leading-normal">
                {searchQuery 
                  ? 'No items match your active search filter query.' 
                  : 'To see items here, enable "Show in Local Store" when creating or editing a product.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
              {storeProducts.map(p => {
                const subAvailable = p.isSubscriptionAvailable === true && p.isStoreProduct !== false;
                return (
                  <div key={p.id} className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card overflow-hidden hover:shadow-lg transition duration-300 relative">
                    <div>
                      {/* Thumbnail Image */}
                      <div className="h-44 bg-muted overflow-hidden relative border-b border-border/60">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
                            <Store className="h-8 w-8 opacity-25" />
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          {subAvailable && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-wide">
                              🔁 Subscribe
                            </span>
                          )}
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-wide">
                            🏪 Storefront
                          </span>
                        </div>
                      </div>

                      {/* Product Metadata */}
                      <div className="p-4 space-y-1">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{p.brand || 'No Brand'}</span>
                        <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">{p.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono">SKU: {p.sku}</p>
                      </div>
                    </div>

                    {/* Pricing and Stock Footer */}
                    <div className="px-4 pb-4 pt-1 border-t border-border/30 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground font-semibold">SELLING PRICE</span>
                        <span className="font-extrabold text-sm text-foreground">{formatPrice(p.price)}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-muted-foreground font-semibold">STOCK STATUS</span>
                        <span className={`font-bold text-[11px] ${p.stock > 10 ? 'text-emerald-500' : 'text-amber-500'}`}>{p.stock} Available</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ABOUT */}
      {activeTab === 'about' && (
        <Card className="glass text-left">
          <CardHeader>
            <CardTitle className="text-base font-bold">Merchant Information</CardTitle>
            <CardDescription>Biography, licenses, and discoverability keywords</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">About Our Business</span>
              <p className="text-xs text-foreground leading-relaxed">{storeDesign.description || 'No store description configured in branding tab.'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-5 text-xs text-foreground">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Representative Name</span>
                <p className="font-bold">{profile.ownerName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Store Premises Address</span>
                <p className="font-bold leading-normal">{profile.address || 'Address not set'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Compliance Status</span>
                <div className="flex items-center gap-1 mt-0.5 text-emerald-500">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-bold">Verified Hyperlocal Merchant</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Primary Location</span>
                <p className="font-bold">
                  {profile.village ? `${profile.village}, ` : ''}
                  {profile.mandal ? `${profile.mandal}, ` : ''}
                  {profile.district ? `${profile.district}, ` : ''}
                  {profile.state || 'N/A'}
                </p>
              </div>
            </div>

            {/* Tags & Services */}
            {((profile as any).storeServices?.length > 0 || (profile as any).storeTags?.length > 0) && (
              <div className="border-t border-border/40 pt-5 space-y-4">
                {(profile as any).storeServices?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Available Delivery Services</span>
                    <div className="flex flex-wrap gap-2">
                      {(profile as any).storeServices.map((s: string) => (
                        <span key={s} className="px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(profile as any).storeTags?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Discoverability Badges</span>
                    <div className="flex flex-wrap gap-2">
                      {(profile as any).storeTags.map((t: string) => (
                        <span key={t} className="px-3 py-1 rounded-xl bg-secondary border text-muted-foreground text-xs font-semibold">#{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: GALLERY */}
      {activeTab === 'gallery' && (
        <Card className="glass text-center">
          <CardContent className="py-12">
            <div className="py-4 space-y-2 text-muted-foreground text-xs select-none">
              <ImageIcon className="h-10 w-10 text-muted-foreground/35 mx-auto" />
              <p className="font-semibold text-foreground">Premises Photo Gallery</p>
              <p>Add store images inside the Store Config Wizard tab in Business Profile.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: POLICIES */}
      {activeTab === 'policies' && (
        <Card className="glass text-left">
          <CardHeader>
            <CardTitle className="text-base font-bold">Merchant Returns & Shipment Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-foreground flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-primary" /> Return & Refund Policy
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                {storeDesign.returnPolicy || 'Standard marketplace policy: Returns accepted within 7 days of delivery.'}
              </p>
            </div>
            <div className="space-y-2 border-t border-border/40 pt-5">
              <h3 className="font-bold text-foreground flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-primary" /> Shipping & Delivery Policy
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                {storeDesign.deliveryPolicy || 'Dispatched and delivered within 24 hours via local delivery team.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: HOURS */}
      {activeTab === 'hours' && (
        <Card className="glass text-left">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-primary" /> Business Hours Schedule
            </CardTitle>
            <CardDescription>Listed weekdays operating schedules</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.businessHours && Object.keys(profile.businessHours).length > 0 ? (
              <div className="border border-border/60 bg-muted/5 rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-secondary/30 p-3 font-bold border-b border-border/60 text-muted-foreground select-none">
                  <span>Day</span>
                  <span>Accepting Orders</span>
                  <span>Hours Timetable</span>
                </div>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                  const settings = profile.businessHours[day] || { open: '09:00', close: '21:00', enabled: false };
                  return (
                    <div key={day} className="grid grid-cols-3 p-3 items-center border-b border-border/40 last:border-none text-foreground">
                      <span className="font-bold capitalize">{day}</span>
                      <div>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          settings.enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {settings.enabled ? 'Active' : 'Offline'}
                        </span>
                      </div>
                      <span className="font-mono text-muted-foreground">
                        {settings.enabled ? `${settings.open} - ${settings.close}` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-xs">
                <Clock className="h-10 w-10 text-muted-foreground/35 mx-auto" />
                <p className="font-semibold text-foreground">Hours schedule not set</p>
                <p>Configured schedule timings inside Business Profile.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Social Links and contacts widget footer preview */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-left">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Social Channels:</span>
          <div className="flex gap-2">
            {storeDesign.facebook && <a href={storeDesign.facebook} target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline">Facebook</a>}
            {storeDesign.instagram && <a href={storeDesign.instagram} target="_blank" rel="noreferrer" className="text-pink-500 font-bold hover:underline">Instagram</a>}
            {storeDesign.twitter && <a href={storeDesign.twitter} target="_blank" rel="noreferrer" className="text-sky-400 font-bold hover:underline">Twitter</a>}
            {!storeDesign.facebook && !storeDesign.instagram && !storeDesign.twitter && <span className="text-muted-foreground italic">None linked</span>}
          </div>
        </div>
        <div className="flex flex-col md:items-end gap-0.5 text-left md:text-right">
          <span className="font-bold flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-emerald-500" /> Support: {storeDesign.phone || profile.phone || 'N/A'}</span>
          <span className="font-medium text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-amber-500" /> Email: {storeDesign.email || profile.email || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};
