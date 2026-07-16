import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { ShieldCheck, KeyRound, Monitor, Smartphone, Globe, CheckCircle2 } from 'lucide-react';

interface LoginSession {
  id: string;
  device: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export const SecuritySettings: React.FC = () => {
  const { profile } = useVendor();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorQR, setShowTwoFactorQR] = useState(false);

  // New States for Security Completion Gaps
  const [alertChannels, setAlertChannels] = useState({ email: true, sms: false, whatsapp: true });
  const [backupEmail, setBackupEmail] = useState('contact@apexbee.in');
  const [backupPhone, setBackupPhone] = useState('+91 99999 88888');
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; val: string; created: string }>>([
    { id: 'API-771', val: 'ap_live_38d82f7c00e12a', created: '2026-07-02' }
  ]);

  const [rolesMatrix, setRolesMatrix] = useState<Record<string, Record<string, boolean>>>({
    Owner: { Billing: true, Products: true, Reports: true, Settings: true },
    Manager: { Billing: true, Products: true, Reports: true, Settings: false },
    Cashier: { Billing: true, Products: false, Reports: false, Settings: false },
    Inventory: { Billing: false, Products: true, Reports: false, Settings: false },
    Delivery: { Billing: false, Products: false, Reports: false, Settings: false }
  });

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'Empty', color: 'bg-zinc-200', score: 0 };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-rose-500', score: 1 };
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNum = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    const count = [hasLetter, hasNum, hasSpecial].filter(Boolean).length;
    if (pass.length >= 8 && count === 3) return { label: 'Strong', color: 'bg-emerald-500', score: 3 };
    return { label: 'Medium', color: 'bg-amber-500', score: 2 };
  };

  const strength = getPasswordStrength(newPassword);

  const [sessions, setSessions] = useState<LoginSession[]>([
    { id: 'SESS-991', device: 'Windows Desktop', os: 'Chrome v125', ip: '103.45.120.10', location: 'Mumbai, Maharashtra', lastActive: 'Active Now', current: true },
    { id: 'SESS-992', device: 'OnePlus 11 5G', os: 'Apexbee App v3.2', ip: '103.45.120.25', location: 'Mumbai, Maharashtra', lastActive: '2 hours ago', current: false },
    { id: 'SESS-993', device: 'MacBook Air M2', os: 'Safari v17.4', ip: '157.20.95.8', location: 'Pune, Maharashtra', lastActive: '2 days ago', current: false }
  ]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    
    setSuccessMsg("System Password updated successfully! Your sessions remain active.");
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleToggleTwoFactor = () => {
    if (!twoFactorEnabled) {
      setShowTwoFactorQR(true);
    } else {
      setTwoFactorEnabled(false);
      setSuccessMsg("Two-Factor Authentication (2FA) disabled successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleConfirmQRSetup = () => {
    setShowTwoFactorQR(false);
    setTwoFactorEnabled(true);
    setSuccessMsg("2FA verified and activated successfully! Backup codes generated.");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setSuccessMsg("Remote session terminated successfully.");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handlePanicLogout = () => {
    setSessions(prev => prev.filter(s => s.current));
    setSuccessMsg("🚨 Panic Mode Activated: Terminated all remote devices instantly!");
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleGenerateApiKey = () => {
    const keyVal = `ap_live_${Math.random().toString(36).substring(2, 16)}`;
    const newKey = { id: `API-${Math.floor(100 + Math.random() * 900)}`, val: keyVal, created: new Date().toISOString().split('T')[0] };
    setApiKeys(prev => [...prev, newKey]);
    setSuccessMsg("Developer Live API Key generated successfully.");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleRevokeApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
    setSuccessMsg("Developer API Key revoked successfully.");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleRoleToggle = (roleKey: string, permKey: string) => {
    setRolesMatrix(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [permKey]: !prev[roleKey][permKey]
      }
    }));
  };

  const handleGdprExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, sessions, twoFactorEnabled, alertChannels }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "apexbee_vendor_security_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMsg("GDPR Profile & Access Logs downloaded successfully.");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Security Settings</h1>
          <p className="text-xs text-muted-foreground">Manage merchant passwords, configure two-factor authentication, and monitor login activity devices.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1.5 font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Password & 2FA */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Password update card */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <KeyRound className="h-4.5 w-4.5 text-primary" /> Update Password
              </CardTitle>
              <CardDescription>Ensure a complex password to protect client ledgers</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Current Password</label>
                  <input
                    required
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">New Password</label>
                  <input
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                  />
                  {newPassword && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                        <span>Strength Rating:</span>
                        <span className={strength.label === 'Strong' ? 'text-emerald-500' : strength.label === 'Medium' ? 'text-amber-500' : 'text-rose-500'}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${(strength.score / 3) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Confirm New Password</label>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                  />
                </div>
                <Button type="submit" className="w-full mt-2 cursor-pointer bg-primary text-white font-bold h-9">
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 2FA Card */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Two-Factor Authentication (2FA)
              </CardTitle>
              <CardDescription>Secure withdrawals and banking configuration edits</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-left gap-0.5">
                  <span className="text-xs font-bold text-foreground">TOTP Authenticator Apps</span>
                  <span className="text-[10px] text-muted-foreground">Use Google Authenticator or Microsoft Auth</span>
                </div>
                <button
                  onClick={handleToggleTwoFactor}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    twoFactorEnabled ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {showTwoFactorQR && (
                <div className="bg-secondary/30 p-3 rounded-lg border border-border/60 flex flex-col items-center gap-3 text-center">
                  <span className="text-xs font-bold text-foreground">Configure Authenticator QR</span>
                  {/* Mock QR box */}
                  <div className="h-28 w-28 bg-white p-2 rounded-lg flex items-center justify-center border border-border">
                    <div className="grid grid-cols-6 gap-0.5 h-full w-full opacity-80">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xs ${
                            (i + 3) % 4 === 0 || (i * 7) % 3 === 0 ? 'bg-black' : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground">Or secret code: <strong className="text-foreground">APEX BEE 2FA TOTP KEY 9091</strong></span>
                  <Button
                    size="sm"
                    className="h-8 font-bold cursor-pointer"
                    onClick={handleConfirmQRSetup}
                  >
                    Verify & Activate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Sessions Audit */}
        <div className="lg:col-span-7">
          <Card className="glass h-full">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Monitor className="h-4.5 w-4.5 text-primary" /> Active Login Sessions
              </CardTitle>
              <CardDescription>Monitor active devices logged into your credentials</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device / Browser</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map(s => (
                    <TableRow key={s.id} className="align-middle">
                      <TableCell className="font-bold text-foreground">
                        <div className="flex items-center gap-1.5">
                          {s.device.includes('Desktop') || s.device.includes('MacBook') ? (
                            <Monitor className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <Smartphone className="h-4 w-4 text-indigo-500 shrink-0" />
                          )}
                          <div>
                            <div>{s.device}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{s.os}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {s.ip}
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-semibold flex items-center gap-1 h-12">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" /> {s.location}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.current ? (
                          <span className="text-emerald-500 font-bold">This Device</span>
                        ) : (
                          s.lastActive
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.current ? (
                          <span className="text-[10px] text-muted-foreground italic font-semibold">Active</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-rose-500/20 text-rose-500 hover:bg-rose-500/5 cursor-pointer"
                            onClick={() => handleTerminateSession(s.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        {/* Left Col: Security Alerts & Risk Score & API Rotation */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-xs text-left">
          {/* Security Risk Score Card */}
          <Card className="glass border border-primary/20 bg-primary/[0.01]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase text-primary tracking-wider">Business Security Risk Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 font-semibold">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-muted-foreground">Security Rating</span>
                <span className={`text-base font-black ${twoFactorEnabled ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {twoFactorEnabled ? '96/100 (Excellent)' : '72/100 (Fair)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground leading-normal font-medium">
                <span>* Enable 2FA and use a complex password to reach 100/100.</span>
              </div>
            </CardContent>
          </Card>

          {/* Alert Channels Checklist Toggles */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Notification Alert Channels</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 font-semibold text-muted-foreground">
              <p className="text-[10px]">Select channels to receive security access and payout alerts:</p>
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-foreground">
                  <input 
                    type="checkbox" 
                    checked={alertChannels.email} 
                    onChange={(e) => setAlertChannels(prev => ({ ...prev, email: e.target.checked }))} 
                    className="accent-primary"
                  />
                  <span>Email Alerts ({backupEmail})</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-foreground">
                  <input 
                    type="checkbox" 
                    checked={alertChannels.sms} 
                    onChange={(e) => setAlertChannels(prev => ({ ...prev, sms: e.target.checked }))} 
                    className="accent-primary"
                  />
                  <span>SMS Alerts ({backupPhone})</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-foreground">
                  <input 
                    type="checkbox" 
                    checked={alertChannels.whatsapp} 
                    onChange={(e) => setAlertChannels(prev => ({ ...prev, whatsapp: e.target.checked }))} 
                    className="accent-primary"
                  />
                  <span>WhatsApp Chat Alerts</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Backup Recovery Configs */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Backup Account Recovery</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Recovery Email</label>
                <input 
                  type="email" 
                  value={backupEmail} 
                  onChange={(e) => setBackupEmail(e.target.value)}
                  className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none" 
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Recovery Phone</label>
                <input 
                  type="text" 
                  value={backupPhone} 
                  onChange={(e) => setBackupPhone(e.target.value)}
                  className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: API rotation & Roles matrix & Panic logout */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-xs text-left">
          {/* API Keys Rotation Console */}
          <Card className="glass">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
              <div>
                <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">API Credentials Console</CardTitle>
                <CardDescription className="text-[9.5px]">Generate Cost-Per-Click developer keys for custom store integrations</CardDescription>
              </div>
              <Button 
                onClick={handleGenerateApiKey} 
                className="h-7 text-[10px] font-bold px-2.5 cursor-pointer bg-primary text-white"
              >
                + New Key
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key ID</TableHead>
                    <TableHead>Key Secret</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map(k => (
                    <TableRow key={k.id}>
                      <TableCell className="font-bold text-foreground text-xs">{k.id}</TableCell>
                      <TableCell className="font-mono text-[10.5px] text-primary font-bold">{k.val}</TableCell>
                      <TableCell className="text-muted-foreground font-semibold text-xs">{k.created}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 text-[9px] border-rose-500/20 text-rose-500 hover:bg-rose-500/5 cursor-pointer"
                          onClick={() => handleRevokeApiKey(k.id)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {apiKeys.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">
                        No active developer API credentials.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Permissions Matrix */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Store Access Permission Matrix</CardTitle>
              <CardDescription className="text-[9.5px]">Configure granular features checklist for sub-accounts roles</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Title</TableHead>
                    {['Billing', 'Products', 'Reports', 'Settings'].map(key => (
                      <TableHead key={key} className="text-center">{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(rolesMatrix).map((roleKey) => (
                    <TableRow key={roleKey}>
                      <TableCell className="font-bold text-foreground text-xs">{roleKey}</TableCell>
                      {['Billing', 'Products', 'Reports', 'Settings'].map(permKey => (
                        <TableCell key={permKey} className="text-center">
                          <input 
                            type="checkbox" 
                            checked={rolesMatrix[roleKey][permKey]}
                            onChange={() => handleRoleToggle(roleKey, permKey)}
                            className="accent-primary cursor-pointer"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* GDPR & Panic Triggers */}
          <Card className="glass bg-rose-500/[0.01] border border-rose-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase text-rose-500 tracking-wider">Advanced Privacy &amp; Access Controls</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleGdprExport} 
                variant="outline" 
                className="flex-1 text-xs font-bold border-border cursor-pointer bg-background hover:bg-muted"
              >
                📥 GDPR Export Security Data
              </Button>
              
              <Button 
                onClick={handlePanicLogout} 
                className="flex-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                🚨 Panic Logout All Other Devices
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default SecuritySettings;
