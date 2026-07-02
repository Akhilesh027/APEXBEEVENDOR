import React, { useState } from 'react';
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorQR, setShowTwoFactorQR] = useState(false);

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
    </div>
  );
};

export default SecuritySettings;
