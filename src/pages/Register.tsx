import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Mail, Lock, User, Phone, Building, Briefcase, MapPin, Check, Loader2, ArrowRight, ArrowLeft, CheckCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Register: React.FC = () => {
  const { register, setAuthPage } = useVendor();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1: Account Credentials
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Company Details
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<'Manufacturer' | 'Wholesaler' | 'Vendor'>('Vendor');
  const [gstNumber, setGstNumber] = useState('');
  const [category, setCategory] = useState('Apparel & Fashion');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!ownerName.trim()) newErrors.ownerName = 'Owner Name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid Email is required';
    if (!phone.trim() || phone.length < 10) newErrors.phone = 'Valid Phone Number (10+ digits) is required';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!businessName.trim()) newErrors.businessName = 'Business Name is required';
    if (!gstNumber.trim() || !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gstNumber.toUpperCase())) {
      newErrors.gstNumber = 'Valid Indian GSTIN format is required (e.g. 27AAAAA1111A1Z1)';
    }
    if (!address.trim()) newErrors.address = 'Business Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrev = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Register via context
      await register({
        businessName,
        ownerName,
        email,
        phone,
        businessType,
        address,
        gstNumber: gstNumber.toUpperCase(),
        category
      });
      // Trigger success animation screen
      setShowSuccess(true);
    } catch (err) {
      setErrors({ submit: 'Registration failed. Please check details.' });
    } finally {
      setLoading(false);
    }
  };

  // Stepper UI progress indicators
  const stepProgress = step === 1 ? 'w-1/2' : 'w-full';

  return (
    <div className="min-h-screen w-screen flex bg-background overflow-x-hidden text-foreground">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-screen flex flex-col justify-center items-center p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-6 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle className="h-12 w-12" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black tracking-tight"
            >
              Onboarding Complete!
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-indigo-200 text-sm max-w-md mt-2"
            >
              Your seller account for <strong className="text-white font-bold">{businessName}</strong> has been created. Redirecting to your dashboard workspace...
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-slate-400 text-xs flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>KYC status set to "Not Started" — please upload your GST certificate.</span>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
            {/* Left Column - Enterprise Info Showcase (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-r border-border/20">
              {/* Decorative Background Glows */}
              <div className="absolute top-[-20%] left-[-20%] w-[85%] h-[85%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

              {/* Top Logo */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/35">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    APEX MARKET
                  </span>
                  <span className="block text-[10px] text-indigo-300 font-bold tracking-widest leading-none">
                    VENDOR CENTER
                  </span>
                </div>
              </div>

              {/* Showcase Banner */}
              <div className="my-auto space-y-6 max-w-md">
                <div className="space-y-2">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">Join 4,500+ Suppliers</span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                    Start Selling in Minutes.
                  </h2>
                  <p className="text-sm text-slate-300">
                    Create a free seller account and access automated variant builders, instant UPI withdraw modules, and franchise networks.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  {[
                    "Zero onboarding fees or listing charges",
                    "Tailored commission structures as low as 8%",
                    "Direct access to Mandal, District, and State franchise order networks",
                    "KYC verification checks completed within 24 hours"
                  ].map((tip, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                      <div className="h-5 w-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom statistics info */}
              <div className="pt-6 border-t border-white/10 flex justify-between text-[11px] text-slate-400 font-mono">
                <span>ONBOARDING: FREE</span>
                <span>SECURE PAYMENTS</span>
                <span>PAN & GST REQ</span>
              </div>
            </div>

            {/* Right Column - Onboarding stepper */}
            <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-12 bg-background relative">
              <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[90px] pointer-events-none" />
              <div className="absolute bottom-[10%] left-[10%] w-[250px] h-[250px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />

              {/* Mobile Logo View (Hidden on Desktop) */}
              <div className="lg:hidden flex items-center gap-2 mb-8 self-start">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Building className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-md font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    APEX MARKET
                  </span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
              >
                <Card className="border border-border bg-card/40 backdrop-blur-xl shadow-2xl rounded-2xl p-2">
                  <CardHeader className="space-y-1 pb-4">
                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-2">
                      <span className={step === 1 ? 'text-primary font-black' : ''}>1. Credentials</span>
                      <span className={step === 2 ? 'text-primary font-black' : ''}>2. Company Details</span>
                    </div>

                    {/* Step progress bar */}
                    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full bg-primary transition-all duration-300 ${stepProgress}`} />
                    </div>

                    <CardTitle className="text-2xl font-black tracking-tight mt-4">
                      {step === 1 ? 'Seller Credentials' : 'Business Profile Onboarding'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {step === 1
                        ? 'Set up your master administrator email and contact phone number.'
                        : 'Register company details, tax registration number, and category.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {errors.submit && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                        {errors.submit}
                      </div>
                    )}

                    {step === 1 ? (
                      /* STEP 1 FORM */
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Owner Name</label>
                          <div className="relative flex items-center">
                            <User className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="e.g. Rajesh Kumar"
                              value={ownerName}
                              onChange={(e) => setOwnerName(e.target.value)}
                              className={`w-full bg-secondary/40 text-foreground border ${errors.ownerName ? 'border-destructive' : 'border-border'} hover:border-muted-foreground/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                            />
                          </div>
                          {errors.ownerName && <span className="text-[10px] text-destructive font-semibold">{errors.ownerName}</span>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                          <div className="relative flex items-center">
                            <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <input
                              type="email"
                              placeholder="name@company.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={`w-full bg-secondary/40 text-foreground border ${errors.email ? 'border-destructive' : 'border-border'} hover:border-muted-foreground/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                            />
                          </div>
                          {errors.email && <span className="text-[10px] text-destructive font-semibold">{errors.email}</span>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Contact Phone Number</label>
                          <div className="relative flex items-center">
                            <Phone className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <input
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className={`w-full bg-secondary/40 text-foreground border ${errors.phone ? 'border-destructive' : 'border-border'} hover:border-muted-foreground/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                            />
                          </div>
                          {errors.phone && <span className="text-[10px] text-destructive font-semibold">{errors.phone}</span>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Password (6+ characters)</label>
                          <div className="relative flex items-center">
                            <Lock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className={`w-full bg-secondary/40 text-foreground border ${errors.password ? 'border-destructive' : 'border-border'} hover:border-muted-foreground/50 rounded-lg pl-9 pr-10 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {errors.password && <span className="text-[10px] text-destructive font-semibold">{errors.password}</span>}
                        </div>

                        <Button
                          onClick={handleNext}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold h-10 shadow-lg shadow-indigo-600/25 rounded-lg flex justify-center items-center gap-2 mt-4 cursor-pointer"
                        >
                          <span>Proceed to Business Info</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      /* STEP 2 FORM */
                      <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Business Name</label>
                          <div className="relative flex items-center">
                            <Building className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="e.g. Mumbai Weaving Hub"
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              className={`w-full bg-secondary/40 text-foreground border ${errors.businessName ? 'border-destructive' : 'border-border'} hover:border-muted-foreground/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                              disabled={loading}
                            />
                          </div>
                          {errors.businessName && <span className="text-[10px] text-destructive font-semibold">{errors.businessName}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">Business Type</label>
                            <div className="relative flex items-center">
                              <Briefcase className="absolute left-3 h-4 w-4 text-muted-foreground z-10" />
                              <select
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value as any)}
                                className="w-full bg-secondary/40 text-foreground border border-border hover:border-muted-foreground/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                disabled={loading}
                              >
                                <option value="Vendor" className="bg-background">Vendor</option>
                                <option value="Wholesaler" className="bg-background">Wholesaler</option>
                                <option value="Manufacturer" className="bg-background">Manufacturer</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">Primary Category</label>
                            <select
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="w-full bg-secondary/40 text-foreground border border-border hover:border-muted-foreground/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              disabled={loading}
                            >
                              <option value="Apparel & Fashion" className="bg-background">Apparel & Fashion</option>
                              <option value="Electronics & Mobiles" className="bg-background">Electronics & Mobiles</option>
                              <option value="Groceries & Foods" className="bg-background">Groceries & Foods</option>
                              <option value="Home & Living" className="bg-background">Home & Living</option>
                              <option value="General Merchandise" className="bg-background">General Merchandise</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">GSTIN Number (Indian Tax ID)</label>
                          <input
                            type="text"
                            placeholder="e.g. 27AAAAA1111A1Z1"
                            value={gstNumber}
                            onChange={(e) => setGstNumber(e.target.value)}
                            className={`w-full bg-secondary/40 text-foreground border ${errors.gstNumber ? 'border-destructive' : 'border-border'} hover:border-muted-foreground/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all uppercase`}
                            disabled={loading}
                          />
                          {errors.gstNumber ? (
                            <span className="text-[10px] text-destructive font-semibold">{errors.gstNumber}</span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground">15-digit Alpha-Numeric identifier matching Indian business records.</span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Company Address</label>
                          <div className="relative flex items-start">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <textarea
                              placeholder="Complete registered business premises address..."
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              rows={3}
                              className={`w-full bg-secondary/40 text-foreground border ${errors.address ? 'border-destructive' : 'border-border'} hover:border-muted-foreground/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none`}
                              disabled={loading}
                            />
                          </div>
                          {errors.address && <span className="text-[10px] text-destructive font-semibold">{errors.address}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrev}
                            className="w-full text-foreground border-border hover:bg-secondary flex justify-center items-center gap-2 h-10 rounded-lg cursor-pointer"
                            disabled={loading}
                          >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Go Back</span>
                          </Button>

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold h-10 shadow-lg shadow-indigo-600/25 rounded-lg flex justify-center items-center gap-2 cursor-pointer"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Creating Account...</span>
                              </>
                            ) : (
                              <>
                                <span>Complete Sign Up</span>
                                <Check className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Switch back to Login */}
                    <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
                      Already registered?{' '}
                      <button
                        onClick={() => setAuthPage('login')}
                        className="text-primary hover:underline font-bold cursor-pointer"
                      >
                        Sign in to your account
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
