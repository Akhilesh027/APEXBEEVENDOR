import React, { useState, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import type { VendorProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Building2, ShieldCheck, CreditCard, FolderOpen, Upload, Check, AlertTriangle, Plus, User, Shield, Store, Eye, Globe, Award, Sparkles, X, CheckCircle2, Phone, Mail, FileText, Image as ImageIcon, Trash2, Calendar, Database, UserCheck } from 'lucide-react';

export const BusinessProfile: React.FC = () => {
  const { profile, updateProfile, uploadDocument, currentPage, setPrimaryBankAccount, deleteBankAccount, verifyBankAccount } = useVendor();

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

  // Devotional Capability Access State
  const [capabilityAccess, setCapabilityAccess] = useState<any>(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [requestingCaps, setRequestingCaps] = useState(false);
  const [capMsg, setCapMsg] = useState('');

  const fetchCategoryAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://server.apexbee.in/api/devotional/vendor-access/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          const acc = data.data[0];
          setCapabilityAccess(acc);
          setSelectedCapabilities(acc.requestedCapabilities || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch category access:', err);
    }
  };

  useEffect(() => {
    fetchCategoryAccess();
  }, []);

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
  const [storeType, setStoreType] = useState<any>(profile.storeType || 'retail_grocery');
  const [primaryCategory, setPrimaryCategory] = useState(profile.primaryCategory || profile.category || 'Apparel & Fashion');
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

  const [gstExpiry, setGstExpiry] = useState(profile.gstExpiry || '');
  const [fssaiExpiry, setFssaiExpiry] = useState(profile.fssaiExpiry || '');
  const [ownerContact, setOwnerContact] = useState(profile.ownerContact || '');
  const [managerContact, setManagerContact] = useState(profile.managerContact || '');
  const [deliveryManagerContact, setDeliveryManagerContact] = useState(profile.deliveryManagerContact || '');

  // Category-specific operational states (Multi-Select Format States)
  const [foodSubcategories, setFoodSubcategories] = useState<string[]>(['Dine-In Family Restaurant']);
  const [grocerySubcategories, setGrocerySubcategories] = useState<string[]>(['Supermarket & Hypermarket']);
  const [fashionSubcategories, setFashionSubcategories] = useState<string[]>(['Women\'s Ethnic & Designer Saree']);
  const [serviceSubcategories, setServiceSubcategories] = useState<string[]>(['Electrician & Plumbing Services']);
  const [devotionalSubcategories, setDevotionalSubcategories] = useState<string[]>(['Puja Samagri & Havan Kits']);

  const toggleCategoryFormat = (categoryType: 'food' | 'grocery' | 'fashion' | 'service' | 'devotional', id: string) => {
    const setters: Record<string, React.Dispatch<React.SetStateAction<string[]>>> = {
      food: setFoodSubcategories,
      grocery: setGrocerySubcategories,
      fashion: setFashionSubcategories,
      service: setServiceSubcategories,
      devotional: setDevotionalSubcategories,
    };

    const setter = setters[categoryType];
    if (!setter) return;

    setter(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least 1 format selected
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const [foodPrepTime, setFoodPrepTime] = useState('15-20 Mins');
  const [foodType, setFoodType] = useState('Veg & Non-Veg 🟢🔴');
  const [diningTables, setDiningTables] = useState('8 Tables (32 Seater)');
  const [tableReservations, setTableReservations] = useState(true);
  const [cakePreorderHours, setCakePreorderHours] = useState('24 Hours');
  const [biryaniBatchTimes, setBiryaniBatchTimes] = useState('12:30 PM & 7:30 PM');
  const [packagingFee, setPackagingFee] = useState('15');
  const [meatCutType, setMeatCutType] = useState('Curry Cut & Boneless');

  const [expressDeliveryTime, setExpressDeliveryTime] = useState('15 Mins');
  const [morningSlotActive, setMorningSlotActive] = useState(true);
  const [organicCertActive, setOrganicCertActive] = useState(true);
  const [dairyColdStorage, setDairyColdStorage] = useState(true);

  const [trialRoomAvailable, setTrialRoomAvailable] = useState(true);
  const [returnPolicyDays, setReturnPolicyDays] = useState('7 Days');
  const [customStitchingOffered, setCustomStitchingOffered] = useState(true);

  const [serviceRadiusKm, setServiceRadiusKm] = useState('15 Km');
  const [serviceRateType, setServiceRateType] = useState('Fixed Rate per Job');
  const [emergencySupport, setEmergencySupport] = useState(true);
  const [serviceWarrantyDays, setServiceWarrantyDays] = useState('90 Days');

  const [templeDirectDelivery, setTempleDirectDelivery] = useState(true);
  const [panditLanguage, setPanditLanguage] = useState('Telugu & Sanskrit');

  // Sync from profile when profile updates
  useEffect(() => {
    if (profile.id) {
      setBusinessName(profile.businessName || '');
      setOwnerName(profile.ownerName || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setBusinessType(profile.businessType || 'Vendor');
      setStoreType(profile.storeType || 'retail_grocery');
      setPrimaryCategory(profile.primaryCategory || profile.category || 'Apparel & Fashion');
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
      setGstExpiry(profile.gstExpiry || '');
      setFssaiExpiry(profile.fssaiExpiry || '');
      setOwnerContact(profile.ownerContact || '');
      setManagerContact(profile.managerContact || '');
      setDeliveryManagerContact(profile.deliveryManagerContact || '');
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

  const copyTimingsToAllDays = () => {
    const mondayHours = businessHours.monday || { open: '09:00', close: '21:00', enabled: true };
    const updated = { ...businessHours };
    ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
      updated[day] = { ...mondayHours };
    });
    setBusinessHours(updated);
    alert("Monday operating timings copied to all days!");
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
      storeType,
      primaryCategory,
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
      aadhaarNumber,
      gstExpiry,
      fssaiExpiry,
      ownerContact,
      managerContact,
      deliveryManagerContact
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

  const getCategoryDetails = (catName: string) => {
    const name = (catName || '').toLowerCase();
    if (name.includes('food') || name.includes('restaurant')) {
      return {
        icon: '🍽️',
        title: 'Food & Restaurant',
        layoutMode: 'Digital Food Menu & Kitchen Layout',
        badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-300',
        compliance: 'FSSAI Food Safety Compliance Active',
        features: ['Digital Food Menu', 'Veg/Non-Veg (🟢/🔴) Indicators', 'Kitchen Prep Time Tags (15-20 Mins)', 'Dining Table Reservations'],
        bgGradient: 'from-amber-500/10 to-orange-500/10 border-amber-500/30',
      };
    }
    if (name.includes('grocery') || name.includes('daily')) {
      return {
        icon: '🛒',
        title: 'Daily Needs & Grocery',
        layoutMode: 'Supermarket Express Grid Layout',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-300',
        compliance: 'Weights & Measures / Trade Compliance',
        features: ['Supermarket Add-to-Cart Grid', 'Unit Pricing (per Kg / Pack)', 'Daily Morning Slots', 'Minimum Order Limit Setup'],
        bgGradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30',
      };
    }
    if (name.includes('fashion') || name.includes('apparel') || name.includes('boutique')) {
      return {
        icon: '👗',
        title: 'Fashion & Boutique',
        layoutMode: 'Lookbook & Apparel Gallery Layout',
        badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-300',
        compliance: 'Textile Trade & GST Return Compliance',
        features: ['Lookbook Image Gallery', 'Size Chart Selector', 'Trial Room Availability Tag', '7-Day Easy Return Policy'],
        bgGradient: 'from-rose-500/10 to-pink-500/10 border-rose-500/30',
      };
    }
    if (name.includes('service') || name.includes('repair')) {
      return {
        icon: '🛠️',
        title: 'Home Services & Repair',
        layoutMode: 'Appointment & Slot Booking Layout',
        badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-300',
        compliance: 'Technician Verification & Skill License',
        features: ['Slot Booking Calendar', 'Fixed vs Hourly Rates', 'Technician Travel Radius', 'Emergency 24x7 Support Tag'],
        bgGradient: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30',
      };
    }
    if (name.includes('devotional') || name.includes('puja')) {
      return {
        icon: '🏛️',
        title: 'Devotional & Puja',
        layoutMode: 'Sanctified Divinity Storefront',
        badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-300',
        compliance: 'Sanctified Source Certification Active',
        features: ['Puja Samagri Combos', 'Temple Direct Delivery', 'Purohit/Archana Booking', 'Pure Samagri Guarantee'],
        bgGradient: 'from-orange-500/10 to-amber-500/10 border-orange-500/30',
      };
    }
    if (name.includes('electronic') || name.includes('mobile') || name.includes('tech') || name.includes('gadget')) {
      return {
        icon: '📱',
        title: 'Electronics & Mobiles',
        layoutMode: 'Tech Retail Showcase Layout',
        badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-300',
        compliance: 'BIS Certification & Brand Warranty Active',
        features: ['Tech Specifications Grid', 'Brand Warranty Badge', 'Serial / IMEI Tracking', 'Store Pickup & Express Shipping'],
        bgGradient: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30',
      };
    }
    return {
      icon: '🛍️',
      title: 'General Retail & Superstore',
      layoutMode: 'Standard Retail Showcase Layout',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-300',
      compliance: 'Standard Commerce Registration Active',
      features: ['Multi-Category Catalog', 'Variant Selector', 'Home Delivery & Pickup', 'Store Search & Filters'],
      bgGradient: 'from-purple-500/10 to-indigo-500/10 border-purple-500/30',
    };
  };

  const activeCategoryInfo = getCategoryDetails(
    primaryCategory || profile.primaryCategory || profile.category || (loggedInUser as any)?.primaryCategory || (loggedInUser as any)?.category || 'Food & Restaurant'
  );

  const availableServices = ['Home Delivery', 'Pickup', 'Pre Orders', 'Subscription', 'Instant Delivery'];
  const availableTags = ['Fresh', 'Organic', '24x7', 'Home Delivery', 'Pickup', 'Express Delivery'];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      {/* Header Canopy Card with Glassmorphic Background */}
      <div className="bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-indigo-950/90 border border-slate-800/80 p-6 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏬</span>
            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">
              Business Account &amp; Store Config
            </h1>
          </div>
          <p className="text-xs text-blue-200/80 pl-7">
            Manage store profile, bank registries, KYC checks, storefront design, and corporate document approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-2xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Marketplace Status: {profile.marketplaceStatus || 'Approved'}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>KYC Status: {profile.kycStatus || 'Pending Verification'}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-xs flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Document Approvals: {profile.documents?.filter(d => d.status === 'Approved').length || 0}/{(profile.documents?.length || 6)} Verified</span>
          </div>

          <button
            type="button"
            onClick={() => {
              window.open(`https://apexbee.in/store/${profile.id || 'preview'}`, '_blank');
            }}
            className="text-xs flex items-center gap-2 font-black bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-500/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            <span>🌐</span>
            <span>Preview Store</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar with Vibrant Background Triggers */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto gap-2.5 mb-6 p-3 bg-slate-950/95 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-2xl">
          <TabsTrigger
            value="account"
            className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all duration-200 bg-slate-900/60 border border-slate-800/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:border-indigo-500 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 text-slate-300 hover:bg-slate-800/80"
          >
            <User className="h-4 w-4" />
            <span>My Account</span>
          </TabsTrigger>

          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all duration-200 bg-slate-900/60 border border-slate-800/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:border-blue-500 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 text-slate-300 hover:bg-slate-800/80"
          >
            <Building2 className="h-4 w-4" />
            <span>Store Config Wizard</span>
          </TabsTrigger>

          <TabsTrigger
            value="styling"
            className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all duration-200 bg-slate-900/60 border border-slate-800/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-slate-950 data-[state=active]:border-amber-400 data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 text-slate-300 hover:bg-slate-800/80"
          >
            <Sparkles className="h-4 w-4" />
            <span>Storefront Styling</span>
          </TabsTrigger>

          <TabsTrigger
            value="kyc"
            className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all duration-200 bg-slate-900/60 border border-slate-800/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:border-emerald-500 data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 text-slate-300 hover:bg-slate-800/80"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>KYC Verification</span>
          </TabsTrigger>

          <TabsTrigger
            value="bank"
            className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all duration-200 bg-slate-900/60 border border-slate-800/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-violet-500 data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 text-slate-300 hover:bg-slate-800/80"
          >
            <CreditCard className="h-4 w-4" />
            <span>Bank Accounts</span>
          </TabsTrigger>

          <TabsTrigger
            value="documents"
            className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all duration-200 bg-slate-900/60 border border-slate-800/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:border-rose-500 data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/30 text-slate-300 hover:bg-slate-800/80"
          >
            <FolderOpen className="h-4 w-4" />
            <span>Business Documents</span>
          </TabsTrigger>

          <TabsTrigger
            value="capabilities"
            className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all duration-200 bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-orange-500 data-[state=active]:to-yellow-500 data-[state=active]:text-slate-950 data-[state=active]:border-amber-400 data-[state=active]:shadow-xl data-[state=active]:shadow-amber-500/40 font-black ring-1 ring-amber-400/20"
          >
            <Award className="h-4 w-4 text-amber-400" />
            <span>Devotional Capabilities</span>
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
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Verified Business Category</p>
                    <Badge variant="purple" className="text-[10px] font-extrabold">
                      🏷️ {profile.category || profile.primaryCategory || 'Food & Restaurant'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* ApexBee Master Identity Card */}
              <Card className="glass border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-secondary/20 to-primary/10 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-black text-amber-400 flex items-center gap-2">
                      <span>👑 ApexBee Master Business Identity</span>
                    </CardTitle>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-full border border-border/60">
                      1 Person / Store = 1 Master ID
                    </span>
                  </div>
                  <CardDescription>Official ApexBee unified identity credentials across all system modules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/40 text-left">
                      <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider block">Master Customer ID</span>
                      <strong className="text-base font-mono font-black text-amber-400 block mt-0.5">
                        {loggedInUser?.masterCustomerId || (profile as any).masterCustomerId || '583214907'}
                      </strong>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-indigo-500/40 text-left">
                      <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">Merchant Role Ref ID</span>
                      <strong className="text-base font-mono font-black text-indigo-400 block mt-0.5">
                        {(profile as any).referenceId || loggedInUser?.roleReferenceIds?.vendor || 'APX-GRC-7M2Q8A'}
                      </strong>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-emerald-500/40 text-left">
                      <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">Universal Referral Code</span>
                      <strong className="text-base font-mono font-black text-emerald-400 block mt-0.5">
                        {loggedInUser?.referralCode || profile.referralCode || 'AB7K9P2'}
                      </strong>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Logged-In Account Details</CardTitle>
                  <CardDescription>Your authentication account information from the system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                      <div className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground cursor-not-allowed opacity-80 font-bold">
                        {loggedInUser?.name || profile.ownerName || '—'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                      <div className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground cursor-not-allowed opacity-80 font-mono">
                        {loggedInUser?.email || profile.email || '—'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Mobile Number</label>
                      <div className="border border-border/50 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground cursor-not-allowed opacity-80 font-mono">
                        {loggedInUser?.phone || loggedInUser?.mobile || profile.phone || '—'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Internal Database UUID</label>
                      <div className="border border-border/50 rounded-lg px-3 py-2 text-xs font-mono bg-secondary/30 text-primary cursor-not-allowed opacity-80 truncate">
                        {loggedInUser?.id || loggedInUser?._id || profile.id || '—'}
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

              {/* Admin-Assigned Category & Operational Mandate */}
              <Card className={`glass bg-gradient-to-br ${activeCategoryInfo.bgGradient}`}>
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="text-2xl">{activeCategoryInfo.icon}</span> Category Mandate & Features
                  </CardTitle>
                  <CardDescription>
                    Admin-assigned operational business category and unlocked platform features.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-background/80 rounded-xl border border-border/50">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Assigned Category</p>
                      <p className="text-sm font-extrabold text-foreground mt-0.5">{activeCategoryInfo.title}</p>
                    </div>
                    <Badge variant="outline" className={`${activeCategoryInfo.badgeColor} font-bold text-xs px-3 py-1`}>
                      {activeCategoryInfo.compliance}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-2">Category-Driven Storefront Capabilities:</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {activeCategoryInfo.features.map((feat, idx) => (
                        <div key={idx} className="p-2.5 bg-background/60 border border-border/50 rounded-xl text-xs font-semibold flex items-center gap-2 text-foreground">
                          <span className="text-emerald-500 font-bold">✓</span> {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                      <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        Store Operational Type <span className="text-[10px] text-primary font-bold">(Admin Assigned 🔒)</span>
                      </label>
                      <div className="border border-border/60 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground font-extrabold flex items-center justify-between cursor-not-allowed opacity-90">
                        <span>{activeCategoryInfo.title}</span>
                        <Badge variant="purple" className="text-[9px] font-bold">Admin Verified</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        Primary Store Category <span className="text-[10px] text-primary font-bold">(Admin Assigned 🔒)</span>
                      </label>
                      <div className="border border-border/60 rounded-lg px-3 py-2 text-sm bg-secondary/30 text-foreground font-extrabold flex items-center justify-between cursor-not-allowed opacity-90">
                        <span>🏷️ {primaryCategory || profile.primaryCategory || profile.category || 'Food & Restaurant'}</span>
                        <Badge variant="purple" className="text-[9px] font-bold">Locked</Badge>
                      </div>
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

                {/* Section 1.5: Emergency Contacts */}
                <div className="border-b border-border/50 pb-4 space-y-4">
                  <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wide">1.5 Emergency Contacts & Staff Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-bold text-muted-foreground">Authorized Owner Mobile *</label>
                      <input
                        required
                        type="text"
                        value={ownerContact}
                        onChange={(e) => setOwnerContact(e.target.value)}
                        placeholder="e.g. +91 XXXXX XXXXX"
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-bold text-muted-foreground">Store Manager Mobile</label>
                      <input
                        type="text"
                        value={managerContact}
                        onChange={(e) => setManagerContact(e.target.value)}
                        placeholder="e.g. +91 XXXXX XXXXX"
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-bold text-muted-foreground">Delivery Lead Mobile</label>
                      <input
                        type="text"
                        value={deliveryManagerContact}
                        onChange={(e) => setDeliveryManagerContact(e.target.value)}
                        placeholder="e.g. +91 XXXXX XXXXX"
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
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-muted-foreground">Pincode *</label>
                        {pincode && pincode.length === 6 && (
                          <span className="text-[10px] text-emerald-500 font-bold">✓ 6 digits</span>
                        )}
                        {pincode && pincode.length < 6 && (
                          <span className="text-[10px] text-amber-500 font-semibold">{pincode.length}/6 digits</span>
                        )}
                      </div>
                      <input
                        required
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN code"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground font-mono font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Latitude</label>
                      <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground font-mono" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">Longitude</label>
                      <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground font-mono" />
                    </div>
                    {latitude && longitude && (
                      <div className="md:col-span-2 border border-border rounded-xl overflow-hidden h-48 bg-muted/20 relative shadow-inner">
                        <iframe
                          title="Geocoded GPS Alignment Map"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                          allowFullScreen
                        />
                      </div>
                    )}
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

                {/* Section 5: Category-Specific Operational Parameters */}
                <div className="border-b border-border/50 pb-4 space-y-4">
                  <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <span>{activeCategoryInfo.icon}</span> 5. Category Operational Parameters ({activeCategoryInfo.title})
                  </h3>

                  {activeCategoryInfo.title.includes('Food') ? (
                    <div className="space-y-4">
                      {/* Subcategory Format Selection Bar (Multi-Selectable) */}
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-left">
                        <label className="text-xs font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider block flex items-center justify-between">
                          <span>🍴 Select Food & Restaurant Formats (Select Multiple)</span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded font-mono">{foodSubcategories.length} Selected</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          {[
                            { id: 'Dine-In Family Restaurant', label: '🍷 Dine-In Restaurant', desc: 'Table Capacity & Reservations' },
                            { id: 'Fast Food & QSR', label: '🍟 Fast Food & QSR', desc: 'Fast Prep & Self Counter' },
                            { id: 'Café & Bakery', label: '☕ Café & Bakery', desc: 'Custom Cakes & Pastries' },
                            { id: 'Biryani & Cloud Kitchen', label: '🍲 Biryani & Cloud Kitchen', desc: 'Batch Timings & Family Buckets' },
                            { id: 'Ice Cream & Desserts', label: '🍦 Ice Cream & Desserts', desc: 'Thermal Cold Delivery' },
                            { id: 'Meat & Poultry Counter', label: '🥩 Meat & Fish Counter', desc: 'Weight Pricing & Cut Types' }
                          ].map((fmt) => {
                            const isSelected = foodSubcategories.includes(fmt.id);
                            return (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => toggleCategoryFormat('food', fmt.id)}
                                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${isSelected
                                  ? 'bg-amber-500 text-white font-extrabold border-amber-600 shadow-md ring-2 ring-amber-500/30'
                                  : 'bg-background hover:bg-amber-500/10 border-border text-foreground font-semibold'
                                  }`}
                              >
                                <span className="text-xs flex items-center justify-between">
                                  <span>{fmt.label}</span>
                                  {isSelected && <span className="text-[10px] bg-white/30 text-white px-1 rounded">✓</span>}
                                </span>
                                <span className={`text-[9px] mt-1 ${isSelected ? 'text-amber-100' : 'text-muted-foreground'}`}>{fmt.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Format-Specific Dynamic Inputs Panel (Renders all selected formats) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground">Kitchen Prep Time</label>
                          <select value={foodPrepTime} onChange={(e) => setFoodPrepTime(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground font-semibold">
                            <option value="10-15 Mins">⚡ 10-15 Mins (Fast Food)</option>
                            <option value="15-20 Mins">⏱️ 15-20 Mins (Standard Kitchen)</option>
                            <option value="20-30 Mins">🍲 20-30 Mins (Fresh Meal / Biryani)</option>
                            <option value="30-45 Mins">👨‍🍳 30-45 Mins (Gourmet / Catering)</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground">Dietary Offering</label>
                          <select value={foodType} onChange={(e) => setFoodType(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground font-semibold">
                            <option value="Pure Veg 🟢">🟢 Pure Veg Only</option>
                            <option value="Veg & Non-Veg 🟢🔴">🟢🔴 Veg & Non-Veg Kitchen</option>
                            <option value="Non-Veg Special 🔴">🔴 Non-Veg Specialty</option>
                          </select>
                        </div>

                        {/* Dynamic fields based on multi-selected foodSubcategories */}
                        {foodSubcategories.includes('Dine-In Family Restaurant') && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-muted-foreground">Dining Capacity</label>
                              <input type="text" value={diningTables} onChange={(e) => setDiningTables(e.target.value)} placeholder="e.g. 12 Tables (48 Seater)" className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground" />
                            </div>
                            <div className="flex flex-col gap-1 justify-center">
                              <label className="text-xs font-bold text-muted-foreground">Table Reservations</label>
                              <div className="flex items-center gap-2 mt-1">
                                <input type="checkbox" id="tab-res" checked={tableReservations} onChange={(e) => setTableReservations(e.target.checked)} className="rounded accent-amber-500 h-4 w-4 cursor-pointer" />
                                <label htmlFor="tab-res" className="text-xs font-bold text-foreground cursor-pointer">Enable Table Booking</label>
                              </div>
                            </div>
                          </>
                        )}

                        {foodSubcategories.includes('Café & Bakery') && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-muted-foreground">Custom Cake Advance Time</label>
                              <select value={cakePreorderHours} onChange={(e) => setCakePreorderHours(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground font-semibold">
                                <option value="6 Hours">🎂 6 Hours Express Cake</option>
                                <option value="24 Hours">🎂 24 Hours Advance Notice</option>
                                <option value="48 Hours">🎂 48 Hours Designer Cake</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1 justify-center">
                              <label className="text-xs font-bold text-muted-foreground">Beverage Sizes</label>
                              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300">
                                ☕ Small (250ml) / Medium (350ml) / Large (500ml)
                              </div>
                            </div>
                          </>
                        )}

                        {foodSubcategories.includes('Biryani & Cloud Kitchen') && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-muted-foreground">Fresh Dum Batch Timings</label>
                              <input type="text" value={biryaniBatchTimes} onChange={(e) => setBiryaniBatchTimes(e.target.value)} placeholder="e.g. 12:30 PM & 7:30 PM" className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-muted-foreground">Packaging Container Fee (₹)</label>
                              <input type="text" value={packagingFee} onChange={(e) => setPackagingFee(e.target.value)} placeholder="₹15 per bucket" className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground" />
                            </div>
                          </>
                        )}

                        {foodSubcategories.includes('Ice Cream & Desserts') && (
                          <>
                            <div className="flex flex-col gap-1 justify-center col-span-2">
                              <label className="text-xs font-bold text-muted-foreground">Cold Chain Guarantee</label>
                              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300">
                                🍦 Delivered Frozen in Insulated Dry-Ice Thermal Packaging
                              </div>
                            </div>
                          </>
                        )}

                        {foodSubcategories.includes('Meat & Poultry Counter') && (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-muted-foreground">Available Cut Types</label>
                              <input type="text" value={meatCutType} onChange={(e) => setMeatCutType(e.target.value)} placeholder="Curry Cut, Boneless, Biryani Cut" className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground" />
                            </div>
                            <div className="flex flex-col gap-1 justify-center">
                              <label className="text-xs font-bold text-muted-foreground">Slaughter Standards</label>
                              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300">
                                🥩 100% Daily Fresh Cleaned & FSSAI Certified
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : activeCategoryInfo.title.includes('Grocery') ? (
                    <div className="space-y-4">
                      {/* Grocery Format Selection Bar */}
                      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2 text-left">
                        <label className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block flex items-center justify-between">
                          <span>🛒 Select Daily Needs & Grocery Formats (Select Multiple)</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-mono">{grocerySubcategories.length} Selected</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {[
                            { id: 'Supermarket & Hypermarket', label: '🏬 Supermarket Grid', desc: 'Multi-Aisle & Pack Sizes' },
                            { id: 'Organic & Farmers Market', label: '🥬 Organic Farm Fresh', desc: 'Pesticide-Free Harvest' },
                            { id: 'Milk & Dairy Booth', label: '🥛 Dairy & Milk Booth', desc: 'Daily 6 AM Subscription' },
                            { id: 'Fresh Fruits & Veggies', label: '🍎 Fruits & Vegetables', desc: 'Weight Rates (per Kg)' },
                            { id: 'Home & Personal Care', label: '🧼 Personal Care', desc: 'Family Combo Packs' }
                          ].map((fmt) => {
                            const isSelected = grocerySubcategories.includes(fmt.id);
                            return (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => toggleCategoryFormat('grocery', fmt.id)}
                                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${isSelected
                                  ? 'bg-emerald-600 text-white font-extrabold border-emerald-700 shadow-md ring-2 ring-emerald-500/30'
                                  : 'bg-background hover:bg-emerald-500/10 border-border text-foreground font-semibold'
                                  }`}
                              >
                                <span className="text-xs flex items-center justify-between">
                                  <span>{fmt.label}</span>
                                  {isSelected && <span className="text-[10px] bg-white/30 text-white px-1 rounded">✓</span>}
                                </span>
                                <span className={`text-[9px] mt-1 ${isSelected ? 'text-emerald-100' : 'text-muted-foreground'}`}>{fmt.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground">Express Supermarket Speed</label>
                          <select value={expressDeliveryTime} onChange={(e) => setExpressDeliveryTime(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground font-semibold">
                            <option value="10 Mins">⚡ 10-Min Supermarket Express</option>
                            <option value="30 Mins">🚚 30-Min Local Delivery</option>
                            <option value="Same Day">📦 Same Day Scheduled Slot</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground">Min Order Amount (₹)</label>
                          <input type="number" value={minOrder} onChange={(e) => setMinOrder(Number(e.target.value))} className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground font-semibold" />
                        </div>
                        {grocerySubcategories.includes('Milk & Dairy Booth') && (
                          <div className="flex flex-col gap-1 justify-center">
                            <label className="text-xs font-bold text-muted-foreground">Morning Essentials Slot</label>
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              🌅 Morning Milk & Fresh Produce (6 AM - 9 AM) Active
                            </div>
                          </div>
                        )}
                        {grocerySubcategories.includes('Organic & Farmers Market') && (
                          <div className="flex flex-col gap-1 justify-center">
                            <label className="text-xs font-bold text-muted-foreground">Organic Certification</label>
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              🌱 100% Certified Organic & Chemical-Free
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : activeCategoryInfo.title.includes('Fashion') ? (
                    <div className="space-y-4">
                      {/* Fashion Format Selection Bar */}
                      <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2 text-left">
                        <label className="text-xs font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider block flex items-center justify-between">
                          <span>👗 Select Fashion & Apparel Formats (Select Multiple)</span>
                          <span className="text-[10px] bg-rose-500/20 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded font-mono">{fashionSubcategories.length} Selected</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {[
                            { id: 'Women\'s Ethnic & Saree', label: '🥻 Ethnic & Sarees', desc: 'Zari Work & Blouse Pieces' },
                            { id: 'Men\'s Wear & Formal Suits', label: '👔 Men\'s Formal & Suits', desc: 'Slim/Regular Fit & Waist Sizes' },
                            { id: 'Kids & Baby Wear', label: '🧸 Kids & Baby Apparel', desc: 'Bio-Wash Cotton (0-14 Yrs)' },
                            { id: 'Footwear & Accessories', label: '👠 Footwear & Shoes', desc: 'UK/EU Size Chart Selector' },
                            { id: 'Jewelry & Ornaments', label: '💎 Fashion Jewelry', desc: 'Anti-Tarnish Gift Packaging' }
                          ].map((fmt) => {
                            const isSelected = fashionSubcategories.includes(fmt.id);
                            return (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => toggleCategoryFormat('fashion', fmt.id)}
                                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${isSelected
                                  ? 'bg-rose-600 text-white font-extrabold border-rose-700 shadow-md ring-2 ring-rose-500/30'
                                  : 'bg-background hover:bg-rose-500/10 border-border text-foreground font-semibold'
                                  }`}
                              >
                                <span className="text-xs flex items-center justify-between">
                                  <span>{fmt.label}</span>
                                  {isSelected && <span className="text-[10px] bg-white/30 text-white px-1 rounded">✓</span>}
                                </span>
                                <span className={`text-[9px] mt-1 ${isSelected ? 'text-rose-100' : 'text-muted-foreground'}`}>{fmt.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3.5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground">Return & Exchange Policy</label>
                          <select value={returnPolicyDays} onChange={(e) => setReturnPolicyDays(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground font-semibold">
                            <option value="7 Days">🔄 7 Days Easy Return & Exchange</option>
                            <option value="15 Days">🔄 15 Days Return Policy</option>
                            <option value="No Return">⛔ Final Sale / No Return</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 justify-center">
                          <label className="text-xs font-bold text-muted-foreground">Boutique Trial Room</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input type="checkbox" id="trial-rm" checked={trialRoomAvailable} onChange={(e) => setTrialRoomAvailable(e.target.checked)} className="rounded accent-rose-500 h-4 w-4 cursor-pointer" />
                            <label htmlFor="trial-rm" className="text-xs font-bold text-foreground cursor-pointer">In-Store Trial Room Available</label>
                          </div>
                        </div>
                        {fashionSubcategories.includes('Women\'s Ethnic & Saree') && (
                          <div className="flex flex-col gap-1 justify-center">
                            <label className="text-xs font-bold text-muted-foreground">Custom Fitting & Tailoring</label>
                            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400">
                              ✂️ Custom Blouse Stitching & Alteration Offered
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : activeCategoryInfo.title.includes('Service') ? (
                    <div className="space-y-4">
                      {/* Services Format Selection Bar */}
                      <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl space-y-2 text-left">
                        <label className="text-xs font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider block flex items-center justify-between">
                          <span>🛠️ Select Home Services Formats (Select Multiple)</span>
                          <span className="text-[10px] bg-blue-500/20 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-mono">{serviceSubcategories.length} Selected</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {[
                            { id: 'Electrician & Plumbing Services', label: '⚡ Electrician & Plumbing', desc: 'On-Demand 30-Min Visit' },
                            { id: 'AC & Appliance Repair', label: '❄️ AC & Appliance Repair', desc: '90-Day Service Warranty' },
                            { id: 'Deep Home Cleaning', label: '🧹 Deep Home Cleaning', desc: 'Sq.Ft Machine Cleaning' },
                            { id: 'Salon & Beauty at Home', label: '💄 Salon & Beauty at Home', desc: 'Hygienic Disposable Kits' },
                            { id: 'Doorstep Bike & Car Service', label: '🚗 Vehicle Servicing', desc: 'Waterless Wash & Oil Change' }
                          ].map((fmt) => {
                            const isSelected = serviceSubcategories.includes(fmt.id);
                            return (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => toggleCategoryFormat('service', fmt.id)}
                                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${isSelected
                                  ? 'bg-blue-600 text-white font-extrabold border-blue-700 shadow-md ring-2 ring-blue-500/30'
                                  : 'bg-background hover:bg-blue-500/10 border-border text-foreground font-semibold'
                                  }`}
                              >
                                <span className="text-xs flex items-center justify-between">
                                  <span>{fmt.label}</span>
                                  {isSelected && <span className="text-[10px] bg-white/30 text-white px-1 rounded">✓</span>}
                                </span>
                                <span className={`text-[9px] mt-1 ${isSelected ? 'text-blue-100' : 'text-muted-foreground'}`}>{fmt.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground">Technician Travel Radius</label>
                          <input type="text" value={serviceRadiusKm} onChange={(e) => setServiceRadiusKm(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground font-semibold" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-muted-foreground">Pricing Model</label>
                          <select value={serviceRateType} onChange={(e) => setServiceRateType(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground font-semibold">
                            <option value="Fixed Rate per Job">🏷️ Fixed Price per Service</option>
                            <option value="Hourly Rate">⏱️ Hourly Rate (₹/hr)</option>
                            <option value="Inspection First">🔍 Free Inspection Quote</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 justify-center">
                          <label className="text-xs font-bold text-muted-foreground">Emergency Support</label>
                          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400">
                            ⚡ On-Demand Emergency Dispatch Active
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Devotional Format Selection Bar */}
                      <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-2xl space-y-2 text-left">
                        <label className="text-xs font-extrabold text-orange-700 dark:text-orange-300 uppercase tracking-wider block flex items-center justify-between">
                          <span>🏛️ Select Devotional & Puja Formats (Select Multiple)</span>
                          <span className="text-[10px] bg-orange-500/20 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded font-mono">{devotionalSubcategories.length} Selected</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {[
                            { id: 'Puja Samagri & Havan Kits', label: '🕯️ Puja Samagri Kits', desc: 'Complete Ritual Combos' },
                            { id: 'Fresh Flower Garlands & Offerings', label: '🌸 Deity Flowers', desc: 'Daily Morning Temple Delivery' },
                            { id: 'Spiritual Idols & Rudraksha', label: '📿 Brass Idols & Gems', desc: 'Panchdhatu Certified Idols' },
                            { id: 'Purohit & E-Puja Booking', label: '🕉️ Pandit Booking', desc: 'Vedic Archana & Virtual Puja' }
                          ].map((fmt) => {
                            const isSelected = devotionalSubcategories.includes(fmt.id);
                            return (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => toggleCategoryFormat('devotional', fmt.id)}
                                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${isSelected
                                  ? 'bg-orange-600 text-white font-extrabold border-orange-700 shadow-md ring-2 ring-orange-500/30'
                                  : 'bg-background hover:bg-orange-500/10 border-border text-foreground font-semibold'
                                  }`}
                              >
                                <span className="text-xs flex items-center justify-between">
                                  <span>{fmt.label}</span>
                                  {isSelected && <span className="text-[10px] bg-white/30 text-white px-1 rounded">✓</span>}
                                </span>
                                <span className={`text-[9px] mt-1 ${isSelected ? 'text-orange-100' : 'text-muted-foreground'}`}>{fmt.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                        <div className="flex flex-col gap-1 justify-center">
                          <label className="text-xs font-bold text-muted-foreground">Sanctified Source Guarantee</label>
                          <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-xl text-xs font-bold text-orange-600 dark:text-orange-400">
                            🕉️ 100% Pure Sanctified Source Certified
                          </div>
                        </div>
                        {devotionalSubcategories.includes('Fresh Flower Garlands & Offerings') && (
                          <div className="flex flex-col gap-1 justify-center">
                            <label className="text-xs font-bold text-muted-foreground">Temple Subscription</label>
                            <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-xl text-xs font-bold text-orange-600 dark:text-orange-400">
                              🌸 Daily Morning Doorstep Delivery (5:30 AM Slot)
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 6: Social Links & WhatsApp Support */}
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${storeServices.includes(srv)
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${storeTags.includes(tg)
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
                  <div className="flex justify-between items-center pb-1">
                    <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wide">6. Operating Hours Weekly schedule</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyTimingsToAllDays}
                      className="cursor-pointer text-[10px] font-bold h-7 border-border"
                    >
                      📋 Copy Monday to All Days
                    </Button>
                  </div>
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

                    {/* Category-Matched Preset Themes */}
                    <div className="flex flex-col gap-2 py-2 border-b border-border/40 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold text-muted-foreground uppercase flex items-center gap-1">
                          🎨 Category Theme Presets (Category: {activeCategoryInfo.title})
                        </span>
                        <span className="text-[10px] text-primary font-bold">1-Click Apply</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {activeCategoryInfo.title.includes('Food') ? (
                          <>
                            <button
                              type="button"
                              onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=60", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60")}
                              className="px-2.5 py-1 text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-lg font-extrabold hover:bg-amber-500/20 transition-all cursor-pointer"
                            >
                              🍕 Gourmet Woodfire Pizza Preset
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=150&auto=format&fit=crop&q=60", "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60")}
                              className="px-2.5 py-1 text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-lg font-extrabold hover:bg-amber-500/20 transition-all cursor-pointer"
                            >
                              🍲 Royal Biryani Feast Preset
                            </button>
                          </>
                        ) : activeCategoryInfo.title.includes('Grocery') ? (
                          <>
                            <button
                              type="button"
                              onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=60")}
                              className="px-2.5 py-1 text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-lg font-extrabold hover:bg-emerald-500/20 transition-all cursor-pointer"
                            >
                              🥬 Farm Fresh Produce Preset
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=150&auto=format&fit=crop&q=60", "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=60")}
                              className="px-2.5 py-1 text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-lg font-extrabold hover:bg-emerald-500/20 transition-all cursor-pointer"
                            >
                              🛒 Daily Essentials Supermarket Preset
                            </button>
                          </>
                        ) : activeCategoryInfo.title.includes('Fashion') ? (
                          <>
                            <button
                              type="button"
                              onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&auto=format&fit=crop&q=60", "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60")}
                              className="px-2.5 py-1 text-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-lg font-extrabold hover:bg-rose-500/20 transition-all cursor-pointer"
                            >
                              👗 Luxury Lookbook Preset
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=150&auto=format&fit=crop&q=60", "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=60")}
                              className="px-2.5 py-1 text-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-lg font-extrabold hover:bg-rose-500/20 transition-all cursor-pointer"
                            >
                              🥻 Ethnic Festive Wear Preset
                            </button>
                          </>
                        ) : activeCategoryInfo.title.includes('Service') ? (
                          <>
                            <button
                              type="button"
                              onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop&q=60", "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=60")}
                              className="px-2.5 py-1 text-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 rounded-lg font-extrabold hover:bg-blue-500/20 transition-all cursor-pointer"
                            >
                              🛠️ Expert Technician & Repair Preset
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => applyPresetLayout("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=60", "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=60")}
                              className="px-2.5 py-1 text-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 rounded-lg font-extrabold hover:bg-purple-500/20 transition-all cursor-pointer"
                            >
                              🛍️ General Retail Preset
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-muted-foreground">Store Description</label>
                        <button
                          type="button"
                          onClick={() => {
                            const descSuggestions = [
                              `Welcome to ${businessName || 'our store'}! We supply high-quality organic groceries, fresh local produce, and premium household essentials to Nellore mandal residents. Fast 30-min deliveries guaranteed!`,
                              `At ${businessName || 'our hub'}, discover a curated selection of textiles, apparel, and direct-from-manufacturer clothing items. Premium standards, wholesale prices, and verified authenticity since 2012.`,
                              `Premium wholesale supplier ${businessName || 'Center'}. We specialize in direct bulk shipments of verified quality goods, catering to retail vendors and corporate accounts across Andhra Pradesh.`
                            ];
                            const picked = descSuggestions[Math.floor(Math.random() * descSuggestions.length)];
                            setDescription(picked);
                            alert("AI Suggestion generated and inserted!");
                          }}
                          className="text-[10px] font-bold text-primary hover:underline cursor-pointer border-0 bg-transparent"
                        >
                          ✨ Generate AI Draft Description
                        </button>
                      </div>
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
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> KYC Verification Stepper
              </CardTitle>
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

              {/* Admin Category Governance Card */}
              <div className="border border-primary/30 bg-primary/5 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-primary uppercase tracking-wide flex items-center gap-1.5">
                    🏷️ Admin Permitted Business Categories
                  </h4>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 font-extrabold text-[10px] rounded-full border border-emerald-500/20">
                    Active & Permitted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-card p-3 rounded-lg border border-border/60">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block">Primary Category</span>
                    <span className="font-extrabold text-foreground block mt-0.5">{profile.primaryCategory || profile.category || 'Food & Restaurant'}</span>
                  </div>

                  <div className="bg-card p-3 rounded-lg border border-border/60 space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block">Approved Subcategories ({
                      (Array.isArray(profile.approvedSubcategories) && profile.approvedSubcategories.length > 0
                        ? profile.approvedSubcategories
                        : (profile.subCategory ? [profile.subCategory] : ['General Subcategory'])).length
                    })</span>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(profile.approvedSubcategories) && profile.approvedSubcategories.length > 0
                        ? profile.approvedSubcategories
                        : (profile.subCategory ? [profile.subCategory] : ['General Subcategory'])
                      ).map((sub: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded text-[10px]">
                          ✓ {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {['Identity', 'Business & Tax', 'Food & Drug License', 'Bank', 'Others'].map(category => {
                const categoryDocs = profile.documents.filter(d => (d as any).category === category);
                if (categoryDocs.length === 0) return null;
                return (
                  <div key={category} className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        {category === 'Identity' ? <UserCheck className="h-3.5 w-3.5" /> :
                          category === 'Bank' ? <Database className="h-3.5 w-3.5" /> :
                            category.includes('Food') ? <FileText className="h-3.5 w-3.5" /> :
                              <Building2 className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">{category}</span>
                      <Badge variant="secondary" className="text-[9px] font-bold">
                        {categoryDocs.filter(d => d.status === 'Approved').length}/{categoryDocs.length} Verified
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryDocs.map(doc => {
                        const isExpiring = doc.status === 'Approved' && (doc.id.includes('GST') || doc.id.includes('FSSAI') || doc.id.includes('DRUG'));
                        return (
                          <div key={doc.id} className="p-3 border border-border/60 bg-card rounded-xl flex items-center justify-between gap-3 text-xs hover:border-primary/30 transition-colors">
                            <div className="flex flex-col text-left flex-1 min-w-0">
                              <span className="font-extrabold text-foreground">{doc.name}</span>
                              {doc.fileName ? (
                                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">{doc.fileName}</span>
                              ) : (
                                <span className="text-[10px] text-destructive font-bold">No document uploaded</span>
                              )}

                              {/* Expiry countdown badge */}
                              {isExpiring && (
                                <span className="text-amber-500 font-extrabold flex items-center gap-0.5 text-[9px] bg-amber-500/10 px-1.5 py-0.5 rounded w-fit mt-1.5 border border-amber-500/20">
                                  <Calendar className="h-3 w-3" /> Expires in 42 Days ⚠
                                </span>
                              )}

                              {/* Expiry Input Field */}
                              {(doc.name.includes('GST') || doc.name.includes('FSSAI') || doc.name.includes('Tax')) && (
                                <div className="mt-2 flex flex-col gap-1">
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Expiry Date</span>
                                  <input
                                    type="date"
                                    value={doc.name.includes('GST') ? gstExpiry : fssaiExpiry}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (doc.name.includes('GST')) setGstExpiry(val);
                                      else setFssaiExpiry(val);
                                    }}
                                    className="border border-border rounded px-2 py-0.5 bg-background text-foreground text-[10px] focus:outline-none w-28"
                                  />
                                  {((doc.name.includes('GST') ? gstExpiry : fssaiExpiry)) && (
                                    <span className="text-[8px] text-amber-500 font-extrabold">
                                      🔔 Renew alerts active: {doc.name.includes('GST') ? gstExpiry : fssaiExpiry}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Admin rejection note */}
                              {doc.status === 'Rejected' && (
                                <div className="mt-1.5 p-1.5 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] text-rose-500 font-bold flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 flex-shrink-0" /> Blurry scan. Re-upload in high resolution.
                                </div>
                              )}

                              <div className="mt-1.5">{getDocStatusBadge(doc.status)}</div>
                            </div>
                            <div className="flex-shrink-0">
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
                                    variant={doc.status === 'Rejected' ? 'destructive' : 'outline'}
                                    size="sm"
                                    className="flex items-center gap-1 text-[11px] h-8 cursor-pointer"
                                  >
                                    <Upload className="h-3.5 w-3.5" /> {doc.status === 'Rejected' ? 'Re-Upload' : 'Upload'}
                                  </Button>
                                </>
                              )}
                              {doc.status === 'Approved' && (
                                <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" /> Verified
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Bank Accounts */}
        <TabsContent value="bank">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex flex-col gap-0.5 text-left">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Registered Bank Registers
                </CardTitle>
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
                  <div key={b.id} className={`p-4 border bg-card rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${b.isDefault ? 'border-primary/40 bg-primary/5' : 'border-border/80'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${b.isDefault ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col text-xs text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-sm">{b.bankName}</span>
                          {b.isDefault && (
                            <Badge variant="success" className="py-0.5 px-2 text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              ⭐ Primary Account
                            </Badge>
                          )}
                          {(b as any).verified && (
                            <Badge variant="success" className="py-0.5 px-1.5 text-[8px] font-black bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-0.5">
                              <ShieldCheck className="h-3 w-3" /> Bank Verified
                            </Badge>
                          )}
                        </div>
                        <span className="text-muted-foreground mt-0.5">IFSC: {b.ifscCode} | Account: {b.accountNumber}</span>
                        <span className="text-[10px] text-muted-foreground">Type: {b.accountType} | Beneficiary: {b.accountName}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1.5">
                      {!(b as any).verified && (
                        <Button
                          type="button"
                          onClick={() => verifyBankAccount(b.id)}
                          variant="outline"
                          size="sm"
                          className="text-[10px] cursor-pointer h-7 border-blue-500/30 text-blue-600 hover:bg-blue-500/5 flex items-center gap-1 font-bold"
                        >
                          <ShieldCheck className="h-3 w-3" /> Verify
                        </Button>
                      )}
                      {!b.isDefault && (
                        <Button
                          type="button"
                          onClick={() => setPrimaryBankAccount(b.id)}
                          variant="outline"
                          size="sm"
                          className="text-[10px] cursor-pointer h-7 font-bold"
                        >
                          Make Primary
                        </Button>
                      )}
                      {!b.isDefault && (
                        <Button
                          type="button"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this bank account?')) {
                              deleteBankAccount(b.id);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="text-[10px] cursor-pointer h-7 border-rose-500/30 text-rose-500 hover:bg-rose-500/5 flex items-center gap-1 font-bold"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {profile.bankAccounts.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
                    <CreditCard className="h-8 w-8 text-muted-foreground/30" />
                    No bank accounts registered. Add one to receive payouts.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Business Documents */}
        <TabsContent value="documents">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" /> Uploaded Business Documents Registry
              </CardTitle>
              <CardDescription>Audit logs and PDFs of uploaded identification licenses</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-2.5">
                {profile.documents.filter(d => d.fileName).map(doc => (
                  <div key={doc.id} className="p-3 border border-border/60 bg-card rounded-xl flex items-center justify-between gap-3 text-xs hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/50">
                        <FolderOpen className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-foreground">{doc.name}</span>
                          {(doc as any).category && (
                            <Badge variant="secondary" className="text-[8px] py-0 px-1.5 font-bold uppercase tracking-wider">
                              {(doc as any).category}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{doc.fileName}</span>
                        <span className="text-[9px] text-muted-foreground">Uploaded on: {doc.uploadDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDocStatusBadge(doc.status)}
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm" className="h-7 text-[10px] cursor-pointer flex items-center gap-1">
                            <Eye className="h-3 w-3" /> View File
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {profile.documents.filter(d => d.fileName).length === 0 && (
                  <div className="py-12 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
                    <FolderOpen className="h-8 w-8 text-muted-foreground/30" />
                    No files currently uploaded. Please complete document registry in the KYC tab.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Devotional Capabilities */}
        <TabsContent value="capabilities">
          <Card className="bg-gradient-to-br from-slate-900/95 via-amber-950/20 to-slate-900/95 border border-amber-500/40 shadow-2xl p-2 rounded-3xl">
            <CardHeader className="text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-amber-300">
                    🏛️ Devotional Business Types &amp; Capabilities
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-300">
                    Select all business capabilities your store operates. Submitted requests require admin verification and approval.
                  </CardDescription>
                </div>
                {capabilityAccess && (
                  <Badge variant={capabilityAccess.status === 'approved' ? 'success' : capabilityAccess.status === 'partially_approved' ? 'purple' : 'warning'} className="self-start sm:self-auto text-xs px-3 py-1">
                    Vertical Access: {capabilityAccess.status?.toUpperCase()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
              {capabilityAccess?.rejectionReason && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500 font-medium">
                  <strong>Admin Rejection Note:</strong> {capabilityAccess.rejectionReason}
                </div>
              )}
              {capabilityAccess?.suspensionReason && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 font-medium">
                  <strong>Capability Suspension Note:</strong> {capabilityAccess.suspensionReason}
                </div>
              )}

              {capMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {capMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'pooja_store', name: 'Pooja Store', icon: '🪔', description: 'Daily pooja essentials, agarbatti, camphor, ghee, and samagri' },
                  { id: 'flower_shop', name: 'Flower Shop', icon: '🌸', description: 'Fresh flowers, garlands, lotus, tulasi, and decorative strings' },
                  { id: 'coconut_shop', name: 'Coconut Shop', icon: '🥥', description: 'Pooja coconuts, husked coconuts, and decorated mandap coconuts' },
                  { id: 'fruit_shop', name: 'Fruit Shop', icon: '🍎', description: 'Fresh fruits, sacred offerings, and pooja fruit baskets' },
                  { id: 'sweet_shop', name: 'Sweet Shop', icon: '🍬', description: 'Traditional sweets, laddus, modaks, and festival prasadams' },
                  { id: 'prasadam_partner', name: 'Prasadam Partner', icon: '🍲', description: 'Prepared temple prasadams, pulihora, pongal, and payasam' },
                  { id: 'idol_statue_shop', name: 'Idol & Statue Shop', icon: '🗿', description: 'Deity idols in brass, marble, clay, silver, and wood' },
                  { id: 'photo_frame_shop', name: 'Photo Frame Shop', icon: '🖼️', description: 'Framed deity photos, canvas art, and spiritual wall frames' },
                  { id: 'digital_printing_shop', name: 'Digital Printing Shop', icon: '🖨️', description: 'Custom deity printing, acrylic prints, and temple banners' },
                  { id: 'brass_copper_shop', name: 'Brass & Copper Shop', icon: '🔔', description: 'Brass diyas, kalash, bells, aarti plates, and copper vessels' },
                  { id: 'spiritual_book_shop', name: 'Spiritual Book Shop', icon: '📚', description: 'Sacred texts, Bhagavad Gita, stotra books, and panchangam' },
                  { id: 'pooja_items_manufacturer', name: 'Pooja Items Manufacturer', icon: '🏭', description: 'Direct production of wicks, agarbatti, diyas, and accessories' },
                  { id: 'decoration_shop', name: 'Decoration Shop', icon: '🌺', description: 'Temple mandap decorations, floral backdrops, and event decor' },
                  { id: 'temple_service_partner', name: 'Temple Service Partner', icon: '🏛️', description: 'Archana, abhishekam, homam, and ritual service facilitation' },
                  { id: 'priest_pandit', name: 'Priest / Pandit Service', icon: '🧘', description: 'Certified purohits for home poojas, vrathams, and ceremonies' },
                  { id: 'devotional_wholesaler', name: 'Devotional Wholesaler', icon: '📦', description: 'B2B bulk supply of pooja items, raw materials, and brassware' },
                ].map((cap) => {
                  const isApproved = capabilityAccess?.approvedCapabilities?.includes(cap.id);
                  const isRequested = selectedCapabilities.includes(cap.id);
                  const isPending = capabilityAccess?.requestedCapabilities?.includes(cap.id) && !isApproved;

                  let statusLabel = 'Not Requested';
                  let badgeVar: any = 'secondary';

                  if (isApproved) {
                    statusLabel = 'Approved';
                    badgeVar = 'success';
                  } else if (isPending) {
                    statusLabel = 'Pending Review';
                    badgeVar = 'warning';
                  } else if (isRequested) {
                    statusLabel = 'Selected (Unsubmitted)';
                    badgeVar = 'purple';
                  }

                  return (
                    <div
                      key={cap.id}
                      onClick={() => {
                        if (isApproved) return;
                        if (selectedCapabilities.includes(cap.id)) {
                          setSelectedCapabilities(selectedCapabilities.filter(c => c !== cap.id));
                        } else {
                          setSelectedCapabilities([...selectedCapabilities, cap.id]);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${isApproved
                        ? 'border-emerald-500/50 bg-emerald-500/5 shadow-sm'
                        : isRequested
                          ? 'border-indigo-500/50 bg-indigo-500/5 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-border/50 bg-secondary/20 hover:border-border'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{cap.icon}</span>
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{cap.name}</h4>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isRequested || isApproved}
                          disabled={isApproved}
                          onChange={() => { }}
                          className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{cap.description}</p>
                      <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                        <Badge variant={badgeVar} className="text-[10px] px-2 py-0.5">
                          {statusLabel}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end">
                <Button
                  type="button"
                  disabled={requestingCaps}
                  onClick={async () => {
                    try {
                      setRequestingCaps(true);
                      setCapMsg('');
                      const token = localStorage.getItem('token');
                      const res = await fetch('https://server.apexbee.in/api/devotional/vendor-access/request', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          requestedCapabilities: selectedCapabilities
                        })
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setCapMsg('Capabilities requested successfully! Awaiting admin review.');
                        await fetchCategoryAccess();
                      } else {
                        alert(data.message || 'Failed to request capabilities');
                      }
                    } catch (err: any) {
                      alert('Network error requesting capabilities: ' + err.message);
                    } finally {
                      setRequestingCaps(false);
                    }
                  }}
                  className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-6 py-2 rounded-xl"
                >
                  {requestingCaps ? 'Submitting Request...' : 'Submit Capability Request 🚀'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
