import React, { useState, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Building,
  ShoppingBag,
  TrendingUp,
  Wallet,
  AlertCircle,
  CheckCircle,
  KeyRound,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const { login, sendLoginOtp, loginWithOtp } = useVendor();

  // Login Mode: 'otp' | 'password'
  const [loginMode, setLoginMode] = useState<'otp' | 'password'>('otp');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Status & Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await sendLoginOtp(email);
      setOtpSent(true);
      setCountdown(60);
      setSuccessMsg(res.message || `A verification OTP has been sent to ${email}`);
    } catch (err: any) {
      setError(err.message || 'You are not registered. Please register or apply for a seller account first.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await loginWithOtp(email, otp);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Login (Fallback)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex bg-background overflow-x-hidden text-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        {/* Left Column - Enterprise Info Showcase (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-r border-border/20">
          {/* Decorative Background Glows */}
          <div className="absolute top-[-20%] left-[-20%] w-[85%] h-[85%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

          {/* Top Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
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
          </motion.div>

          {/* Core Feature Value Props */}
          <div className="my-auto space-y-8 max-w-md">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                India's Premium Multi-Vendor Marketplace Engine.
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                A highly optimized, digital-first vendor portal engineered for manufacturers, wholesalers, and retail suppliers.
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  icon: <ShoppingBag className="h-5 w-5 text-indigo-400" />,
                  title: "Dynamic Variant Builders",
                  desc: "Generate variant combinations instantly with automated SKU generation and direct pricing margin calculators."
                },
                {
                  icon: <Wallet className="h-5 w-5 text-purple-400" />,
                  title: "UPI & Bank Settlements",
                  desc: "Request instant payouts from your secure escrow wallet directly via UPI or IMPS. Automated approval cycles."
                },
                {
                  icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
                  title: "Franchise & Referral Networks",
                  desc: "Unlock localized orders routed via State, District, and Mandal franchises. Commission rates are tailored by tier."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Statistics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono"
          >
            <span>PLATFORM VOL: ₹1.2Cr+</span>
            <span>SETTLEMENT: 99.9%</span>
            <span>Uptime: 99.99%</span>
          </motion.div>
        </div>

        {/* Right Column - Authentication Card */}
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
            className="w-full max-w-md"
          >
            <Card className="border border-border bg-card/40 backdrop-blur-xl shadow-2xl rounded-2xl p-2">
              <CardHeader className="space-y-1 pb-3">
                <CardTitle className="text-2xl font-black tracking-tight text-foreground">
                  Sign in to Vendor Hub
                </CardTitle>
                <CardDescription className="text-xs">
                  {loginMode === 'otp'
                    ? (otpSent ? 'Enter the 6-digit code sent to your email.' : 'Enter your registered email to receive a secure login OTP.')
                    : 'Enter your credentials to access your vendor dashboard.'}
                </CardDescription>

                {/* Login Mode Toggle Pill */}
                <div className="flex bg-secondary/60 p-1 rounded-xl gap-1 mt-3">
                  <button
                    type="button"
                    onClick={() => { setLoginMode('otp'); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${loginMode === 'otp'
                      ? 'bg-primary text-primary-foreground shadow-xs font-black'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMode('password'); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${loginMode === 'password'
                      ? 'bg-primary text-primary-foreground shadow-xs font-black'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Password</span>
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-1">
                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2 animate-in fade-in">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{successMsg}</span>
                  </div>
                )}

                {/* ── EMAIL OTP LOGIN FLOW ── */}
                {loginMode === 'otp' && (
                  <>
                    {!otpSent ? (
                      /* STEP 1: Enter Email */
                      <form onSubmit={handleSendOtp} className="space-y-3.5">
                        <div className="space-y-1.5 text-left">
                          <label className="text-xs font-bold text-muted-foreground">Registered Vendor Email</label>
                          <div className="relative flex items-center">
                            <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <input
                              type="email"
                              placeholder="vendor@company.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-secondary/40 text-foreground border border-border hover:border-muted-foreground/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                              disabled={loading}
                              required
                              autoFocus
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold h-10 shadow-lg shadow-indigo-600/25 rounded-xl flex justify-center items-center gap-2 mt-4 cursor-pointer"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Sending OTP...</span>
                            </>
                          ) : (
                            <>
                              <span>Send Verification OTP</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    ) : (
                      /* STEP 2: Enter 6-digit OTP */
                      <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                        <div className="space-y-1.5 text-left">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-muted-foreground">Enter 6-Digit OTP</label>
                            <button
                              type="button"
                              onClick={() => { setOtpSent(false); setOtp(''); setError(''); setSuccessMsg(''); }}
                              className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
                            >
                              Change Email
                            </button>
                          </div>
                          <div className="relative flex items-center">
                            <KeyRound className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="••••••"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              className="w-full bg-secondary/40 text-foreground border border-border hover:border-muted-foreground/50 rounded-xl pl-9 pr-4 py-2.5 text-base font-mono tracking-widest font-black focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-center"
                              disabled={loading}
                              required
                              autoFocus
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold h-10 shadow-lg shadow-emerald-600/25 rounded-xl flex justify-center items-center gap-2 mt-4 cursor-pointer"
                          disabled={loading || otp.length < 4}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Verifying & Logging In...</span>
                            </>
                          ) : (
                            <>
                              <span>Verify & Enter Portal</span>
                              <CheckCircle className="h-4 w-4" />
                            </>
                          )}
                        </Button>

                        <div className="flex items-center justify-between text-xs pt-2">
                          <span className="text-muted-foreground">Didn't receive code?</span>
                          {countdown > 0 ? (
                            <span className="text-muted-foreground font-mono font-bold">Resend in {countdown}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSendOtp()}
                              disabled={loading}
                              className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Resend OTP</span>
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </>
                )}

                {/* ── PASSWORD LOGIN FLOW ── */}
                {loginMode === 'password' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-secondary/40 text-foreground border border-border hover:border-muted-foreground/50 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-muted-foreground">Password</label>
                      </div>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-secondary/40 text-foreground border border-border hover:border-muted-foreground/50 rounded-xl pl-9 pr-10 py-2 text-sm focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                          disabled={loading}
                          required
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
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold h-10 shadow-lg shadow-indigo-600/25 rounded-xl flex justify-center items-center gap-2 mt-4 cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In with Password</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
