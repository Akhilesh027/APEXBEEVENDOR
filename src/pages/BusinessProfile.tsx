import React, { useState, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import type { VendorProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Building2, ShieldCheck, CreditCard, FolderOpen, Upload, Check, AlertTriangle, Plus, User, Shield, Store, Eye, Globe, Award, Sparkles, X, CheckCircle2, Phone, Mail, FileText, Image as ImageIcon } from 'lucide-react';

export const BusinessProfile: React.FC = () => {
  const { profile, updateProfile, uploadDocument, currentPage } = useVendor();

  const [activeTab, setActiveTab] = useState('account');

  // Real logged-in user info from localStorage
  const loggedInUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();

  const getInitials = (name: string) => {
    if (!name) return 'V';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string): 'success' | 'warning' | 'secondary' | 'destructive' | 'purple' => {
    if (role.includes('admin')) return 'destructive';
    if (role.includes('vendor') || role.includes('seller')) return 'success';
    return 'secondary';
  };

  // Synchronize sidebar sub-clicks to this page's tab
  useEffect(() => {
    if (['profile', 'kyc', 'bank', 'documents'].includes(currentPage)) {
      setActiveTab(currentPage);
    }
  }, [currentPage]);

  // Form states
  const [businessName, setBusinessName] = useState(profile.businessName || '');
  const [ownerName, setOwnerName] = useState(profile.ownerName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [businessType, setBusinessType] = useState(profile.businessType || 'Vendor');

  // Storefront Customization / Styling states
  const { storeDesign, saveStoreDesign } = useVendor();
  const [logoUrl, setLogoUrl] = useState(storeDesign?.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(storeDesign?.bannerUrl || '');
  const [description, setDescription] = useState(storeDesign?.description || '');
  const [returnPolicy, setReturnPolicy] = useState(storeDesign?.returnPolicy || 'Easy 7-day returns on all unused items.');
  const [deliveryPolicy, setDeliveryPolicy] = useState(storeDesign?.deliveryPolicy || 'Dispatch within 24 hours.');
  const [highlights, setHighlights] = useState<string[]>(storeDesign?.highlights || []);
  const [newHighlight, setNewHighlight] = useState('');
  const [facebook, setFacebook] = useState(storeDesign?.facebook || '');
  const [instagram, setInstagram] = useState(storeDesign?.instagram || '');
  const [twitter, setTwitter] = useState(storeDesign?.twitter || '');
  const [storePhone, setStorePhone] = useState(storeDesign?.phone || '');
  const [storeEmail, setStoreEmail] = useState(storeDesign?.email || '');

  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = target === 'logo' ? setLogoUploading : setBannerUploading;
    const setUrl = target === 'logo' ? setLogoUrl : setBannerUrl;

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://server.apexbee.in/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Top-level storefront policies & gallery
  const [gallery, setGallery] = useState<string[]>(profile.gallery || []);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [refundPolicy, setRefundPolicy] = useState(profile.refundPolicy || '');
  const [replacementPolicy, setReplacementPolicy] = useState(profile.replacementPolicy || '');

  // Synchronize design changes
  useEffect(() => {
    if (storeDesign) {
      setLogoUrl(storeDesign.logoUrl || '');
      setBannerUrl(storeDesign.bannerUrl || '');
      setDescription(storeDesign.description || '');
      setReturnPolicy(storeDesign.returnPolicy || 'Easy 7-day returns on all unused items.');
      setDeliveryPolicy(storeDesign.deliveryPolicy || 'Dispatch within 24 hours.');
      setHighlights(storeDesign.highlights || []);
      setFacebook(storeDesign.facebook || '');
      setInstagram(storeDesign.instagram || '');
      setTwitter(storeDesign.twitter || '');
      setStorePhone(storeDesign.phone || '');
      setStoreEmail(storeDesign.email || '');
    }
  }, [storeDesign]);

  useEffect(() => {
    if (profile) {
      setGallery(profile.gallery || []);
      setRefundPolicy(profile.refundPolicy || '');
      setReplacementPolicy(profile.replacementPolicy || '');
    }
  }, [profile]);
  
  // Extended configuration states
  const [fssaiNumber, setFssaiNumber] = useState(profile.fssaiNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile.whatsappNumber || '');
  const [stateName, setStateName] = useState(profile.state || '');
  const [district, setDistrict] = useState(profile.district || '');
  const [mandal, setMandal] = useState(profile.mandal || '');
  const [village, setVillage] = useState(profile.village || '');
  const [pincode, setPincode] = useState(profile.pincode || '');
  const [latitude, setLatitude] = useState(profile.location?.coordinates?.[1]?.toString() || '');
  const [longitude, setLongitude] = useState(profile.location?.coordinates?.[0]?.toString() || '');
  
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(profile.deliveryRadiusKm || 5);
  const [minOrder, setMinOrder] = useState(profile.minOrder || 100);
  const [deliveryCharge, setDeliveryCharge] = useState(profile.deliveryCharge || 20);
  const [estimatedDeliveryMinutes, setEstimatedDeliveryMinutes] = useState(profile.estimatedDeliveryMinutes || 30);
  
  const [storeTags, setStoreTags] = useState<string[]>(profile.storeTags || []);
  const [storeServices, setStoreServices] = useState<string[]>(profile.storeServices || []);
  const [liveStatus, setLiveStatus] = useState(profile.liveStatus || 'open');
  
  const [businessHours, setBusinessHours] = useState<any>(profile.businessHours || {
    monday: { open: '09:00', close: '21:00', enabled: true },
    tuesday: { open: '09:00', close: '21:00', enabled: true },
    wednesday: { open: '09:00', close: '21:00', enabled: true },
    thursday: { open: '09:00', close: '21:00', enabled: true },
    friday: { open: '09:00', close: '21:00', enabled: true },
    saturday: { open: '09:00', close: '21:00', enabled: true },
    sunday: { open: '09:00', close: '21:00', enabled: false }
  });

  const [gstNumber, setGstNumber] = useState(profile.gstNumber || '');
  const [panNumber, setPanNumber] = useState(profile.panNumber || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(profile.aadhaarNumber || '');

  // Sync from profile when profile updates
  useEffect(() => {
    if (profile.id) {
      setBusinessName(profile.businessName || '');
      setOwnerName(profile.ownerName || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setBusinessType(profile.businessType || 'Vendor');
      setFssaiNumber(profile.fssaiNumber || '');
      setWhatsappNumber(profile.whatsappNumber || '');
      setStateName(profile.state || '');
      setDistrict(profile.district || '');
      setMandal(profile.mandal || '');
      setVillage(profile.village || '');
      setPincode(profile.pincode || '');
      setLatitude(profile.location?.coordinates?.[1]?.toString() || '');
      setLongitude(profile.location?.coordinates?.[0]?.toString() || '');
      setDeliveryRadiusKm(profile.deliveryRadiusKm || 5);
      setMinOrder(profile.minOrder || 100);
      setDeliveryCharge(profile.deliveryCharge || 20);
      setEstimatedDeliveryMinutes(profile.estimatedDeliveryMinutes || 30);
      setStoreTags(profile.storeTags || []);
      setStoreServices(profile.storeServices || []);
      setLiveStatus(profile.liveStatus || 'open');
      setGstNumber(profile.gstNumber || '');
      setPanNumber(profile.panNumber || '');
      setAadhaarNumber(profile.aadhaarNumber || '');
      if (profile.businessHours && Object.keys(profile.businessHours).length > 0) {
        setBusinessHours(profile.businessHours);
      }
    }
  }, [profile]);

  const [locating, setLocating] = useState(false);
  const handleGPSDetect = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
      
      // Attempt Nominatim reverse geocode
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`);
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          setStateName(addr.state || '');
          setDistrict(addr.state_district || addr.county || addr.district || '');
          setMandal(addr.subdistrict || addr.municipality || addr.city || addr.town || '');
          setPincode(addr.postcode || '');
          setAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      } catch (err) {
        console.error("Nominatim reverse geocode error:", err);
      } finally {
        setLocating(false);
      }
    }, (err) => {
      console.error(err);
      alert("Unable to detect coordinates automatically: " + err.message);
      setLocating(false);
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  // Bank Account Add states
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accName, setAccName] = useState('');
  const [accNum, setAccNum] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accType, setAccType] = useState<'Savings' | 'Current'>('Current');

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<VendorProfile> = {
      businessName,
      ownerName,
      email,
      phone,
      address,
      businessType: businessType as any,
      fssaiNumber,
      whatsappNumber,
      state: stateName,
      district,
      mandal,
      village,
      pincode,
      deliveryRadiusKm: Number(deliveryRadiusKm),
      minOrder: Number(minOrder),
      deliveryCharge: Number(deliveryCharge),
      estimatedDeliveryMinutes: Number(estimatedDeliveryMinutes),
      storeTags,
      storeServices,
      liveStatus: liveStatus as any,
      businessHours,
      gstNumber,
      panNumber,
      aadhaarNumber
    };

    if (latitude !== '' && longitude !== '') {
      updates.location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
      };
    }

    updateProfile(updates);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleStylingSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreDesign({
      logoUrl,
      bannerUrl,
      description,
      returnPolicy,
      deliveryPolicy,
      highlights,
      facebook,
      instagram,
      twitter,
      phone: storePhone,
      email: storeEmail
    });
    updateProfile({
      gallery,
      refundPolicy,
      replacementPolicy
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    const newBank = {
      id: `BANK-${Date.now()}`,
      accountName: accName,
      accountNumber: accNum,
      bankName,
      ifscCode: ifsc,
      accountType: accType,
      isDefault: profile.bankAccounts.length === 0
    };

    updateProfile({
      bankAccounts: [...profile.bankAccounts, newBank]
    });

    setIsAddingBank(false);
    setBankName('');
    setAccName('');
    setAccNum('');
    setIfsc('');
  };

  const toggleService = (srv: string) => {
    setStoreServices(prev => 
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  const toggleTag = (tg: string) => {
    setStoreTags(prev =>
      prev.includes(tg) ? prev.filter(t => t !== tg) : [...prev, tg]
    );
  };

  const handleAddHighlight = () => {
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      setHighlights(prev => [...prev, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(prev => prev.filter((_, i) => i !== index));
  };

  const applyPresetLayout = (logo: string, banner: string) => {
    setLogoUrl(logo);
    setBannerUrl(banner);
  };

  const handleAddGalleryUrl = () => {
    if (newGalleryUrl.trim() && !gallery.includes(newGalleryUrl.trim())) {
      setGallery(prev => [...prev, newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  const handleRemoveGalleryUrl = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleHourChange = (day: string, field: 'open' | 'close' | 'enabled', val: any) => {
    setBusinessHours((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: val
      }
    }));
  };

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success">Verified</Badge>;
      case 'Pending': return <Badge variant="warning">Under Review</Badge>;
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">Missing Upload</Badge>;
    }
  };

  const availableServices = ['Home Delivery', 'Pickup', 'Pre Orders', 'Subscription', 'Instant Delivery'];
  const availableTags = ['Fresh', 'Organic', '24x7', 'Home Delivery', 'Pickup', 'Express Delivery'];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Business Account Settings</h1>
          <p className="text-xs text-muted-foreground">Manage profile, bank registries, KYC checks, and corporate document approvals.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={profile.marketplaceStatus === 'Approved' ? 'success' : 'warning'} className="self-start sm:self-auto px-3 py-1 text-xs">
            Marketplace Status: {profile.marketplaceStatus || 'Draft'}
          </Badge>
          <Badge variant={profile.kycStatus === 'Verified' ? 'success' : 'warning'} className="self-start sm:self-auto px-3 py-1 text-xs">
            KYC Status: {profile.kycStatus}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto gap-1 mb-4">
          <TabsTrigger value="account" className="flex items-center gap-1.5 cursor-pointer">
            <User className="h-4 w-4" /> My Account
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-1.5 cursor-pointer">
            <Building2 className="h-4 w-4" /> Store Config Wizard
          </TabsTrigger>
          <TabsTrigger value="styling" className="flex items-center gap-1.5 cursor-pointer">
            <Sparkles className="h-4 w-4" /> Storefront Styling
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-1.5 cursor-pointer">
            <ShieldCheck className="h-4 w-4" /> KYC Verification
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-1.5 cursor-pointer">
            <CreditCard className="h-4 w-4" /> Bank Accounts
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1.5 cursor-pointer">
            <FolderOpen className="h-4 w-4" /> Business Documents
          </TabsTrigger>
        </TabsList>

        {/* Tab 0: My Account - Real Logged-In User Info */}
        <TabsContent value="account">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Avatar Card */}
            <Card className="glass">
              <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-xl ring-4 ring-indigo-500/20">
                  {getInitials(loggedInUser?.name || profile.ownerName)}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">{loggedInUser?.name || profile.ownerName}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{loggedInUser?.email || profile.email}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {(loggedInUser?.roles || ['vendor']).map((role: string) => (
                    <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-[10px]">
                      {role.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
                {loggedInUser?.isVerified && (
                  <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                    <Shield className="h-3.5 w-3.5" />
                    Email Verified
                  </div>
                )}
                <div className="w-full border-t border-border/50 pt-4 text-left space-y-2">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Phone</p>
                    <p className="text-xs font-semibold text-foreground">{loggedInUser?.phone || loggedInUser?.mobile || profile.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Account Status</p>
                    <Badge variant={loggedInUser?.status === 'active' ? 'success' : 'warning'} className="text-[10px]">
                      {(loggedInUser?.status || 'ACTIVE').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">KYC Status</p>
                    <Badge variant={profile.kycStatus === 'Verified' ? 'success' : 'warning'} className="text-[10px]">
                      {profile.kycStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Logged-In Account Details</CardTitle>
                  <CardDescription>Your authentication account information from the system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                      <div className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground cursor-not-allowed opacity-80">
                        {loggedInUser?.name || profile.ownerName || '—'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                      <div className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground cursor-not-allowed opacity-80">
                        {loggedInUser?.email || profile.email || '—'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Mobile Number</label>
                      <div className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground cursor-not-allowed opacity-80">
                        {loggedInUser?.phone || loggedInUser?.mobile || profile.phone || '—'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">User ID</label>
                      <div className="border border-border/50 rounded-lg px-3 py-2 text-xs font-mono bg-secondary/30 text-muted-foreground cursor-not-allowed opacity-80">
                        {loggedInUser?.id || loggedInUser?._id || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs text-muted-foreground">
                    ℹ️ Account credentials are system-managed. Contact admin to update login details or change password.
                  </div>
                </CardContent>
              </Card>

              {loggedInUser?.territory && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Territory Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {loggedInUser.territory.state && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground">State</label>
                          <div className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground">{loggedInUser.territory.state}</div>
                        </div>
                      )}
                      {loggedInUser.territory.district && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground">District</label>
                          <div className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground">{loggedInUser.territory.district}</div>
                        </div>
                      )}
                      {loggedInUser.territory.mandal && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground">Mandal</label>
                          <div className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground">{loggedInUser.territory.mandal}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 1: Store Setup Wizard */}
        <TabsContent value="profile">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold">Store Profile Setup Wizard</CardTitle>
              <CardDescription>Configure your physical storefront parameters, GPS alignment, delivery, and services.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="flex flex-col gap-6 text-left">
                {saveSuccess && (
                  <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
                    <Check className="h-4 w-4" /> Store configuration saved successfully!
                  </div>
                )}

                {/* Section 1: Basic Information */}
                <div className="border-b border-border/50 pb-4 space-y-4">
                  <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wide">1. Basic Storefront Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Shop Name *</label>
                      <input
                        required
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Authorized Owner Name *</label>
                      <input
                        required
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Support Email *</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Contact Phone *</label>
                      <input
                        required
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Business Type *</label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value as any)}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      >
                        <option value="Vendor">Vendor</option>
                        <option value="Vendor / Retailer">Vendor / Retailer</option>
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Manufacturer">Manufacturer</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">FSSAI License Number</label>
                      <input
                        type="text"
                        value={fssaiNumber}
                        onChange={(e) => setFssaiNumber(e.target.value)}
                        placeholder="14-digit FSSAI Number"
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">GSTIN</label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="GST Identification"
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">PAN</label>
                      <input
                        type="text"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        placeholder="Permanent Account Number"
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Aadhaar Card UIDAI</label>
                      <input
                        type="text"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        placeholder="12-digit Aadhaar Number"
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Address & Geolocation */}
                <div className="border-b border-border/50 pb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wide">2. Location Details & GPS</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGPSDetect}
                      disabled={locating}
                      className="cursor-pointer text-xs"
                    >
                      {locating ? "Resolving GPS..." : "📍 Locate Me (GPS)"}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-bold text-muted-foreground">Full Address *</label>
                      <textarea
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">State *</label>
                      <input required type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">District *</label>
                      <input required type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Taluk / Mandal *</label>
                      <input required type="text" value={mandal} onChange={(e) => setMandal(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Village (Optional)</label>
                      <input type="text" value={village} onChange={(e) => setVillage(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Pincode *</label>
                      <input required type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Latitude</label>
                      <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground font-mono" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Longitude</label>
                      <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground font-mono" />
                    </div>
                  </div>
                </div>

                {/* Section 3: Delivery Configuration */}
                <div className="border-b border-border/50 pb-4 space-y-4">
                  <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wide">3. Delivery & Radius parameters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Radius Limit (KM) *</label>
                      <input required type="number" min={1} value={deliveryRadiusKm} onChange={(e) => setDeliveryRadiusKm(Number(e.target.value))} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Min Order Amount (₹) *</label>
                      <input required type="number" min={0} value={minOrder} onChange={(e) => setMinOrder(Number(e.target.value))} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Delivery Charge (₹) *</label>
                      <input required type="number" min={0} value={deliveryCharge} onChange={(e) => setDeliveryCharge(Number(e.target.value))} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">ETA (Minutes) *</label>
                      <input required type="number" min={1} value={estimatedDeliveryMinutes} onChange={(e) => setEstimatedDeliveryMinutes(Number(e.target.value))} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                    </div>
                  </div>
                </div>

                {/* Section 4: Store Contacts */}
                <div className="border-b border-border/50 pb-4 space-y-4">
                  <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wide">4. Social Links & WhatsApp Support</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">WhatsApp support mobile number</label>
                      <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+91 XXXXX XXXXX" className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Shop Live Status</label>
                      <select value={liveStatus} onChange={(e) => setLiveStatus(e.target.value as any)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                        <option value="open">Open / Online</option>
                        <option value="closed">Closed / Offline</option>
                        <option value="busy">Busy / High Load</option>
                        <option value="vacation">On Vacation</option>
                        <option value="temporarily_closed">Temporarily Closed</option>
                        <option value="accepting_preorders">Accepting Preorders Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 5: Services & Tags Checklists */}
                <div className="border-b border-border/50 pb-4 space-y-4">
                  <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wide">5. Services & Discoverability Tags</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground block">Offered Services</label>
                      <div className="flex flex-wrap gap-2">
                        {availableServices.map(srv => (
                          <button
                            key={srv}
                            type="button"
                            onClick={() => toggleService(srv)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                              storeServices.includes(srv)
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-background border-border text-muted-foreground'
                            }`}
                          >
                            {srv}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground block">Discoverability Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map(tg => (
                          <button
                            key={tg}
                            type="button"
                            onClick={() => toggleTag(tg)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                              storeTags.includes(tg)
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-background border-border text-muted-foreground'
                            }`}
                          >
                            #{tg}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 6: Weekly Operating schedule */}
                <div className="space-y-4 pb-2">
                  <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wide">6. Operating Hours Weekly schedule</h3>
                  <div className="border border-border/60 bg-muted/5 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-4 bg-secondary/30 p-2.5 font-bold border-b border-border/60 text-muted-foreground select-none">
                      <span>Day</span>
                      <span>Accept Orders</span>
                      <span>Opening Time</span>
                      <span>Closing Time</span>
                    </div>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const settings = businessHours[day] || { open: '09:00', close: '21:00', enabled: false };
                      return (
                        <div key={day} className="grid grid-cols-4 p-2.5 items-center border-b border-border/40 last:border-none">
                          <span className="font-bold capitalize text-foreground">{day}</span>
                          <div>
                            <input
                              type="checkbox"
                              checked={!!settings.enabled}
                              onChange={(e) => handleHourChange(day, 'enabled', e.target.checked)}
                              className="rounded accent-primary h-4 w-4 cursor-pointer"
                            />
                          </div>
                          <div>
                            <input
                              type="time"
                              disabled={!settings.enabled}
                              value={settings.open || '09:00'}
                              onChange={(e) => handleHourChange(day, 'open', e.target.value)}
                              className="border border-border rounded px-2 py-1 bg-background text-foreground disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <input
                              type="time"
                              disabled={!settings.enabled}
                              value={settings.close || '21:00'}
                              onChange={(e) => handleHourChange(day, 'close', e.target.value)}
                              className="border border-border rounded px-2 py-1 bg-background text-foreground disabled:opacity-50"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 border-t border-border/60 pt-4">
                  <Button type="submit" className="cursor-pointer font-bold px-6">Save Onboarding Configuration</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 1.5: Storefront Styling & Branding */}
        <TabsContent value="styling">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Settings Form */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-left">
                    <Sparkles className="h-4.5 w-4.5 text-primary" /> Storefront Branding & Customization
                  </CardTitle>
                  <CardDescription className="text-left">Upload logo/banner assets and define policies</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStylingSave} className="flex flex-col gap-4 text-left">
                    {saveSuccess && (
                      <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="h-4.5 w-4.5" /> Storefront styling configuration saved successfully!
                      </div>
                    )}

                    {/* Logo & Banner Uploads */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-muted-foreground">Store Logo</label>
                        <div className="flex items-center gap-3">
                          {logoUrl && (
                            <img src={logoUrl} alt="Logo Preview" className="h-10 w-10 object-cover rounded-lg border border-border" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                            className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer"
                          />
                        </div>
                        {logoUploading && <span className="text-[10px] text-primary animate-pulse font-semibold">Uploading logo...</span>}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-muted-foreground">Store Banner</label>
                        <div className="flex items-center gap-3">
                          {bannerUrl && (
                            <img src={bannerUrl} alt="Banner Preview" className="h-10 w-16 object-cover rounded-lg border border-border" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'banner')}
                            className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer"
                          />
                        </div>
                        {bannerUploading && <span className="text-[10px] text-primary animate-pulse font-semibold">Uploading banner...</span>}
                      </div>
                    </div>

                    {/* Preset themes presets */}
                    <div className="flex flex-wrap items-center gap-2 py-1.5 border-b border-border/40">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Preset Themes:</span>
                      <button
                        type="button"
                        onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3")}
                        className="px-2 py-1 text-[10px] bg-secondary hover:bg-secondary/80 rounded border border-border text-foreground font-semibold cursor-pointer"
                      >
                        Fashion & Apparel
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3")}
                        className="px-2 py-1 text-[10px] bg-secondary hover:bg-secondary/80 rounded border border-border text-foreground font-semibold cursor-pointer"
                      >
                        Tech & Gadgets
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3")}
                        className="px-2 py-1 text-[10px] bg-secondary hover:bg-secondary/80 rounded border border-border text-foreground font-semibold cursor-pointer"
                      >
                        Organic & Fresh
                      </button>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Store Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe your business, values, and offerings to customer..."
                        className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground leading-normal"
                      />
                    </div>

                    {/* Policies */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-primary" /> Return & Refund Policy
                        </label>
                        <textarea
                          value={refundPolicy}
                          onChange={(e) => setRefundPolicy(e.target.value)}
                          rows={3}
                          placeholder="e.g. 7 Days easy replacement if product is damaged..."
                          className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground leading-normal"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-primary" /> Replacement Policy
                        </label>
                        <textarea
                          value={replacementPolicy}
                          onChange={(e) => setReplacementPolicy(e.target.value)}
                          rows={3}
                          placeholder="e.g. Replacements processed within 24 hours of return receipt..."
                          className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground leading-normal"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-primary" /> Shipping & Delivery Policy
                        </label>
                        <textarea
                          value={deliveryPolicy}
                          onChange={(e) => setDeliveryPolicy(e.target.value)}
                          rows={3}
                          placeholder="e.g. Free delivery on orders above Rs. 499..."
                          className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground leading-normal"
                        />
                      </div>
                    </div>

                    {/* Brand Highlights */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-primary" /> Store Highlights (Trust Badges)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          placeholder="e.g. 100% Organic, Handcrafted, Local Manufacturer"
                          className="flex-1 border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                        />
                        <Button type="button" onClick={handleAddHighlight} size="sm" className="cursor-pointer">
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {highlights.map((tag, idx) => (
                          <span key={idx} className="flex items-center gap-1 bg-primary/5 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                            {tag}
                            <button type="button" onClick={() => handleRemoveHighlight(idx)} className="hover:text-destructive cursor-pointer bg-transparent border-0 p-0 text-primary">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Photo Gallery Configuration */}
                    <div className="flex flex-col gap-1 border-t border-border/40 pt-4">
                      <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5 text-primary" /> Store Gallery Photos
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          placeholder="https://example.com/store-photo.png"
                          className="flex-1 border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGalleryUrl())}
                        />
                        <Button type="button" onClick={handleAddGalleryUrl} size="sm" className="cursor-pointer">
                          <Plus className="h-4 w-4" /> Add Photo
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {gallery.map((imgUrl, idx) => (
                          <div key={idx} className="h-16 rounded-lg overflow-hidden border border-border/60 bg-muted relative group">
                            <img src={imgUrl} alt={`Store Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryUrl(idx)}
                              className="absolute top-1 right-1 h-5 w-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer border-0 shadow"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Social & Contact info */}
                    <div className="border-t border-border/60 pt-4 flex flex-col gap-3">
                      <span className="text-xs font-bold text-foreground">Social Links & Store Contact Info</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5 text-blue-500" /> Facebook Page URL
                          </label>
                          <input
                            type="text"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            placeholder="https://facebook.com/mybusiness"
                            className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5 text-pink-500" /> Instagram Handle URL
                          </label>
                          <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="https://instagram.com/mybusiness"
                            className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5 text-sky-400" /> Twitter Handle URL
                          </label>
                          <input
                            type="text"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder="https://twitter.com/mybusiness"
                            className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-emerald-500" /> Support Contact Phone
                          </label>
                          <input
                            type="text"
                            value={storePhone}
                            onChange={(e) => setStorePhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                          />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-amber-500" /> Support Contact Email
                          </label>
                          <input
                            type="text"
                            value={storeEmail}
                            onChange={(e) => setStoreEmail(e.target.value)}
                            placeholder="support@mybusiness.com"
                            className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-2 cursor-pointer font-bold py-2">
                      Save Storefront Branding
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Mockup Preview Card */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Card className="glass border border-primary/20 shadow-xl overflow-hidden text-left">
                <CardHeader className="bg-primary/5 border-b border-border/80 flex flex-row items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4.5 w-4.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">Live Customer View Mockup</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                </CardHeader>

                <div className="bg-secondary/20 p-4 flex flex-col gap-4">
                  {/* Store Banner */}
                  <div
                    className="relative h-32 rounded-xl bg-cover bg-center overflow-hidden shadow-inner flex items-end p-3 border border-border/60"
                    style={{
                      backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'linear-gradient(to right, var(--color-primary), #6366f1)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0" />
                    
                    <div className="flex items-center gap-3 z-10 w-full">
                      <div className="h-14 w-14 rounded-lg bg-card border border-white/20 shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <Store className="h-7 w-7 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col text-white">
                        <h2 className="text-sm font-extrabold tracking-tight leading-tight">{businessName || profile.businessName || 'My Shop'}</h2>
                        <span className="text-[10px] text-zinc-300 font-medium">{profile.category || 'Retail Store'} • {businessType}</span>
                      </div>
                    </div>
                  </div>

                  {/* About and Badges */}
                  <div className="bg-card/60 rounded-xl p-3 border border-border/60 backdrop-blur-xs flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">About Our Store</span>
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                      {description || "Welcome to our premium storefront! We offer high quality items with swift delivery."}
                    </p>
                  </div>

                  {/* Highlights Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {highlights.map((tag, idx) => (
                      <span key={idx} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold shadow-sm">
                        <CheckCircle2 className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Policies */}
                  <div className="bg-card/40 rounded-xl p-3 border border-border/40 text-xs flex flex-col gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground block">RETURNS & REFUNDS</span>
                      <span className="text-[11px] font-medium text-foreground">{refundPolicy || "Standard returns policy applies."}</span>
                    </div>
                    <div className="border-t border-border/40 pt-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground block">REPLACEMENT RULES</span>
                      <span className="text-[11px] font-medium text-foreground">{replacementPolicy || "Standard replacement policy applies."}</span>
                    </div>
                    <div className="border-t border-border/40 pt-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground block">SHIPPING & DELIVERY</span>
                      <span className="text-[11px] font-medium text-foreground">{deliveryPolicy || "Dispatched within 24-48 hours."}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: KYC Verification */}
        <TabsContent value="kyc">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold">KYC Verification Stepper</CardTitle>
              <CardDescription>Upload necessary credentials to activate your live seller hub permissions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 text-left">
              {/* Progress Panel */}
              <div className="border border-border/80 bg-muted/20 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold text-foreground">
                  <span>Verification Checklist Completed</span>
                  <span className="text-primary">{profile.kycProgress}% Progress</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div style={{ width: `${profile.kycProgress}%` }} className="bg-primary h-full rounded-full transition-all duration-750" />
                </div>
                <div className="text-[10px] text-muted-foreground leading-normal flex items-start gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>
                    Your business will not be visible to storefront buyers until all required documents are successfully reviewed and approved by administrators.
                  </span>
                </div>
              </div>

              {/* Uploads List */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-foreground">Required Document Checklists</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.documents.map(doc => (
                    <div key={doc.id} className="p-3 border border-border/60 bg-card rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-foreground">{doc.name}</span>
                        {doc.fileName ? (
                          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">{doc.fileName}</span>
                        ) : (
                          <span className="text-[10px] text-destructive">No document uploaded</span>
                        )}
                        <div className="mt-1.5">{getDocStatusBadge(doc.status)}</div>
                      </div>
                        {doc.status !== 'Approved' && (
                          <>
                            <input
                              type="file"
                              id={`file-input-${doc.id}`}
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  uploadDocument(doc.id, file);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={() => document.getElementById(`file-input-${doc.id}`)?.click()}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-[11px] h-8 cursor-pointer"
                            >
                              <Upload className="h-3.5 w-3.5" /> Upload File
                            </Button>
                          </>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Bank Accounts */}
        <TabsContent value="bank">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex flex-col gap-0.5 text-left">
                <CardTitle className="text-base font-bold">Registered Bank Registers</CardTitle>
                <CardDescription>Configure settlement destinations for your payouts</CardDescription>
              </div>
              {!isAddingBank && (
                <Button onClick={() => setIsAddingBank(true)} size="sm" className="flex items-center gap-1 cursor-pointer">
                  <Plus className="h-4 w-4" /> Add Account
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-left">
              {isAddingBank && (
                <form onSubmit={handleAddBank} className="border border-border/80 bg-muted/20 p-4 rounded-xl flex flex-col gap-4 mb-4">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">Configure Bank Account</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-bold text-muted-foreground">Bank Name *</label>
                      <input required type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" className="border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-bold text-muted-foreground">Beneficiary Name *</label>
                      <input required type="text" value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="Name on account" className="border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-bold text-muted-foreground">Account Number *</label>
                      <input required type="text" value={accNum} onChange={(e) => setAccNum(e.target.value)} className="border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-bold text-muted-foreground">IFSC Code *</label>
                      <input required type="text" value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="e.g. HDFC0000060" className="border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                    </div>
                    <Select
                      label="Account Type"
                      value={accType}
                      onChange={(e) => setAccType(e.target.value as any)}
                      options={[
                        { value: 'Current', label: 'Current Account' },
                        { value: 'Savings', label: 'Savings Account' }
                      ]}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingBank(false)} className="cursor-pointer">Cancel</Button>
                    <Button type="submit" size="sm" className="cursor-pointer">Register Bank Account</Button>
                  </div>
                </form>
              )}

              {/* Bank accounts list */}
              <div className="flex flex-col gap-3">
                {profile.bankAccounts.map(b => (
                  <div key={b.id} className="p-4 border border-border/80 bg-card rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col text-xs text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{b.bankName}</span>
                          {b.isDefault && <Badge variant="success" className="py-0 px-2 text-[9px]">Default Payout</Badge>}
                        </div>
                        <span className="text-muted-foreground mt-0.5">IFSC: {b.ifscCode} | Account: {b.accountNumber}</span>
                        <span className="text-[10px] text-muted-foreground">Type: {b.accountType} | Beneficiary: {b.accountName}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      {!b.isDefault && (
                        <Button
                          type="button"
                          onClick={() => {
                            const updated = profile.bankAccounts.map(acc => ({ ...acc, isDefault: acc.id === b.id }));
                            updateProfile({ bankAccounts: updated });
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs cursor-pointer"
                        >
                          Make Default
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Business Documents */}
        <TabsContent value="documents">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold">Uploaded Business Documents Registry</CardTitle>
              <CardDescription>Audit logs and PDFs of uploaded identification licenses</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-2.5">
                {profile.documents.filter(d => d.fileName).map(doc => (
                  <div key={doc.id} className="p-3 border border-border/60 bg-card rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded bg-secondary flex items-center justify-center">
                        <FolderOpen className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-foreground">{doc.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{doc.fileName}</span>
                        <span className="text-[9px] text-muted-foreground">Uploaded on: {doc.uploadDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDocStatusBadge(doc.status)}
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm" className="h-8 text-[11px] cursor-pointer">View File</Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {profile.documents.filter(d => d.fileName).length === 0 && (
                  <div className="py-12 text-center text-muted-foreground text-xs">
                    No files currently uploaded. Please complete document registry in the KYC tab.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
