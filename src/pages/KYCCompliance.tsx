import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle, 
  Upload, 
  RefreshCw, 
  Eye, 
  Download, 
  Clock, 
  Lock, 
  Award, 
  FileText, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  Database,
  Building,
  Sparkles,
  Calendar,
  X
} from 'lucide-react';

export const KYCCompliance: React.FC = () => {
  const { profile, uploadDocument, simulateDigitalVerification } = useVendor();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Nellore Primary Branch');
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  
  // State for simulated verify progress
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  // State for document preview modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const documents = profile.documents || [];
  const progress = profile.kycProgress || 0;
  const status = profile.kycStatus || 'Not Started';

  // Calculate status counts
  const totalDocs = documents.length;
  const completedDocs = documents.filter(d => d.status === 'Approved').length;
  const pendingDocs = documents.filter(d => d.status === 'Pending').length;
  const missingDocs = documents.filter(d => d.status === 'Not Uploaded' || d.status === 'Rejected').length;
  
  // Calculate mock expiring soon docs (e.g. documents that have expiry dates entered or GST/FSSAI types)
  const expiringSoonCount = documents.filter(d => 
    d.status === 'Approved' && 
    (d.name.includes('FSSAI') || d.name.includes('GST') || d.name.includes('License'))
  ).length > 0 ? 1 : 0; 

  const handleRealUpload = async (docId: string, file: File) => {
    setSelectedDocId(docId);
    setIsUploading(true);
    try {
      await uploadDocument(docId, file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      setSelectedDocId(null);
    }
  };

  const runSimulatedDigitalVerification = async (docId: string) => {
    setVerifyingDocId(docId);
    try {
      await simulateDigitalVerification(docId);
      if (previewDoc && previewDoc.id === docId) {
        setPreviewDoc((prev: any) => ({
          ...prev,
          status: 'Approved',
          fileName: `${prev.name.replace(/\s+/g, "_")}_verified.pdf`,
          url: "https://server.apexbee.in/uploads/digital-verification-mock.pdf",
          uploadDate: new Date().toISOString().split('T')[0],
          adminNote: "Verified instantly via Digital API Gateway."
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingDocId(null);
    }
  };

  const getStatusBadge = (docStatus: string) => {
    switch (docStatus) {
      case 'Approved':
        return <Badge variant="success" className="font-bold flex items-center gap-1 w-fit"><FileCheck className="h-3 w-3" /> Verified</Badge>;
      case 'Pending':
        return <Badge variant="warning" className="font-bold flex items-center gap-1 w-fit"><RefreshCw className="h-3 w-3 animate-spin" /> Under Review</Badge>;
      case 'Rejected':
        return <Badge variant="destructive" className="font-bold flex items-center gap-1 w-fit"><AlertTriangle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="font-bold text-muted-foreground bg-muted/30 border border-border w-fit">Not Uploaded</Badge>;
    }
  };

  const getDocIcon = (docId: string) => {
    if (docId.includes('PAN') || docId.includes('AD')) return <UserCheck className="h-4.5 w-4.5 text-blue-500" />;
    if (docId.includes('BANK')) return <Database className="h-4.5 w-4.5 text-teal-500" />;
    if (docId.includes('GST') || docId.includes('LIC')) return <Building className="h-4.5 w-4.5 text-indigo-500" />;
    return <FileText className="h-4.5 w-4.5 text-amber-500" />;
  };

  // Helper for timeline indicator styling
  const getTimelineStepStyle = (step: string, currentStatus: string) => {
    const statusPriorityMap: Record<string, number> = {
      'Not Uploaded': 0,
      'Rejected': 0,
      'Pending': 1,
      'Approved': 2
    };

    const currentPriority = statusPriorityMap[currentStatus] || 0;

    if (step === 'Uploaded' && currentPriority >= 1) return 'bg-primary border-primary text-primary-foreground';
    if (step === 'Under Review' && currentPriority >= 1) {
      return currentStatus === 'Pending' 
        ? 'bg-amber-500 border-amber-500 text-white animate-pulse'
        : 'bg-primary border-primary text-primary-foreground';
    }
    if (step === 'Verified' && currentPriority === 2) return 'bg-emerald-500 border-emerald-500 text-white';
    if (step === 'Renewal Due' && currentStatus === 'Approved') return 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 text-muted-foreground';
    
    return 'bg-secondary border-border text-muted-foreground';
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Business Compliance Center</h1>
            <Badge variant={status === 'Verified' ? 'success' : 'warning'} className="px-2 py-0.5 text-[10px] font-extrabold uppercase animate-pulse">
              {status === 'Verified' ? 'Fully Verified' : 'Action Required'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Verify business credentials, submit required documentation, and track registration status.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-muted-foreground font-semibold">Verified since: <span className="text-foreground font-bold">{status === 'Verified' ? '05 Jul 2026' : '—'}</span></span>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Required Checklist</span>
              <span className="text-2xl font-black mt-1">{totalDocs}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileCode className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Verified Documents</span>
              <span className="text-2xl font-black text-emerald-500 mt-1">{completedDocs} <span className="text-xs text-muted-foreground font-normal">/ {totalDocs}</span></span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Under Review</span>
              <span className="text-2xl font-black text-amber-500 mt-1">{pendingDocs}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass relative overflow-hidden group group-hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Expiring / Action Required</span>
              <span className="text-2xl font-black text-rose-500 mt-1">{missingDocs}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Progress & Ecosystem Unlocks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Circular Progress & Info */}
          <Card className="glass flex flex-col items-center p-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 text-[9px] font-black rounded-bl-xl uppercase tracking-wider">
              {profile.businessType || 'Vendor'} Hub
            </div>
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 justify-center">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Compliance Status
              </CardTitle>
              <CardDescription>ApexBee verification checklist progress</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 w-full">
              {/* SVG Radial Progress Circle */}
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="var(--border)"
                    strokeWidth="8"
                    fill="transparent"
                    className="opacity-20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="var(--primary)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground">{progress}%</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Completed</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <span className="text-xs font-bold text-muted-foreground">Compliance Rating:</span>
                <span className="text-base font-extrabold text-foreground">
                  {status === 'Verified' ? (
                    <span className="text-emerald-500 flex items-center gap-1 justify-center"><FileCheck className="h-4 w-4" /> 100% Fully Verified</span>
                  ) : status === 'Pending Verification' ? (
                    <span className="text-amber-500 flex items-center gap-1 justify-center"><RefreshCw className="h-4 w-4 animate-spin" /> Pending Admin Review</span>
                  ) : (
                    <span className="text-rose-500 flex items-center gap-1 justify-center"><AlertTriangle className="h-4 w-4 animate-bounce" /> Compliance Incomplete</span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Health Center */}
          <Card className="glass shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" /> Compliance Health Center
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground font-medium">Business Verification</span>
                <span className="font-bold text-foreground">{progress}% Verified</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground font-medium">Documents Verified</span>
                <span className="font-bold text-foreground">{completedDocs} / {totalDocs}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground font-medium">Expiring Soon</span>
                <span className={`font-bold ${expiringSoonCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{expiringSoonCount} Document</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground font-medium">Renewal Required</span>
                <span className="font-bold text-rose-500">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Business Categories Enabled</span>
                <span className="font-bold text-primary">5 Categories</span>
              </div>
            </CardContent>
          </Card>

          {/* Ecosystem Integration / Locks */}
          <Card className="glass bg-primary/5 border border-primary/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-primary">
                <Award className="h-4.5 w-4.5" /> ApexBee Ecosystem Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 py-1">
              <span className="text-[10px] text-muted-foreground leading-normal font-medium">
                Completing your document verification unlocks powerful capabilities across the entire ApexBee local commerce ecosystem:
              </span>
              
              <div className="space-y-2 mt-1">
                <div className="flex items-center justify-between text-xs bg-card/60 p-2 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-foreground">Activate Storefront Live</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-black">UNLOCKED</span>
                </div>
                
                <div className="flex items-center justify-between text-xs bg-card/60 p-2 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-foreground">QR Merchant Payments</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-black">UNLOCKED</span>
                </div>

                <div className="flex items-center justify-between text-xs bg-card/60 p-2 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    {progress >= 80 ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground/60" />
                    )}
                    <span className="font-bold text-foreground">B2B Wholesale Purchases</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                    progress >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'
                  }`}>{progress >= 80 ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>

                <div className="flex items-center justify-between text-xs bg-card/60 p-2 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    {status === 'Verified' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground/60" />
                    )}
                    <span className="font-bold text-foreground">Promotional Ads & Campaigns</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                    status === 'Verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'
                  }`}>{status === 'Verified' ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>

                <div className="flex items-center justify-between text-xs bg-card/60 p-2 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    {status === 'Verified' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground/60" />
                    )}
                    <span className="font-bold text-foreground">Referral Program Bonuses</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                    status === 'Verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'
                  }`}>{status === 'Verified' ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Grouped Document Checklist and Tab Panels */}
        <div className="lg:col-span-8">
          <Card className="glass shadow-lg">
            <CardHeader className="pb-3 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40">
              <div>
                <CardTitle className="text-base font-extrabold">Required Credentials Checklist</CardTitle>
                <CardDescription>Upload high-resolution scans or PDF files of official records to establish compliance trust.</CardDescription>
              </div>
              <div className="flex flex-col gap-1 self-start sm:self-auto min-w-[150px]">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">Select branch scope</label>
                <select 
                  value={selectedBranch} 
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="border border-border/80 rounded-lg px-2.5 py-1 text-xs bg-background text-foreground focus:outline-none"
                >
                  <option value="Nellore Primary Branch">Nellore Primary Store</option>
                  <option value="Buchireddypalem Mandal Branch">Buchi Mandal Store</option>
                  <option value="Kovur Branch">Kovur Store</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-6 border-b border-border/40 flex justify-between items-center">
                  <TabsList className="justify-start gap-1 p-0 bg-transparent border-0">
                    <TabsTrigger value="all" className="text-xs py-2.5 cursor-pointer font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent">All Docs</TabsTrigger>
                    <TabsTrigger value="identity" className="text-xs py-2.5 cursor-pointer font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent">Identity</TabsTrigger>
                    <TabsTrigger value="business" className="text-xs py-2.5 cursor-pointer font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent">Business & Tax</TabsTrigger>
                    <TabsTrigger value="license" className="text-xs py-2.5 cursor-pointer font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent">Special License</TabsTrigger>
                    <TabsTrigger value="bank" className="text-xs py-2.5 cursor-pointer font-bold border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent">Bank</TabsTrigger>
                  </TabsList>
                </div>

                {['all', 'identity', 'business', 'license', 'bank'].map((tabKey) => {
                  const filtered = documents.filter(doc => {
                    if (tabKey === 'all') return true;
                    if (tabKey === 'identity') return doc.category === 'Identity';
                    if (tabKey === 'business') return doc.category === 'Business & Tax';
                    if (tabKey === 'license') return doc.category === 'Food & Drug License';
                    if (tabKey === 'bank') return doc.category === 'Bank';
                    return true;
                  });

                  return (
                    <TabsContent key={tabKey} value={tabKey} className="m-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary/10 border-b border-border/40 select-none">
                            <TableHead className="w-[30%]">Document Type</TableHead>
                            <TableHead className="w-[25%]">Status</TableHead>
                            <TableHead className="w-[20%]">Details</TableHead>
                            <TableHead className="w-[25%] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10 text-xs text-muted-foreground italic">
                                No required documents listed under this category.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filtered.map(doc => {
                              const isExpiring = doc.status === 'Approved' && (doc.id.includes('GST') || doc.id.includes('FSSAI') || doc.id.includes('DRUG'));
                              const isExpanded = !!expandedLogs[doc.id];
                              return (
                                <React.Fragment key={doc.id}>
                                  <TableRow className="hover:bg-muted/5 transition-colors border-b border-border/30">
                                    <TableCell className="align-middle">
                                      <div className="flex items-center gap-2.5">
                                        <div className="h-9 w-9 rounded-lg bg-secondary/40 flex items-center justify-center border border-border/60">
                                          {getDocIcon(doc.id)}
                                        </div>
                                        <div className="flex flex-col text-left">
                                          <span className="font-extrabold text-foreground text-xs leading-none">{doc.name}</span>
                                          <span className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">{doc.category}</span>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="align-middle">
                                      <div className="flex flex-col gap-1">
                                        {getStatusBadge(doc.status)}
                                        
                                        {/* Admin warning alert snippet inside row */}
                                        {doc.status === 'Rejected' && (
                                          <span className="text-[9px] text-rose-500 font-extrabold flex items-center gap-1 mt-0.5">
                                            <AlertCircle className="h-3 w-3" /> Blurry copy. Upload high-res scan.
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="align-middle text-xs">
                                      <div className="flex flex-col text-left text-muted-foreground gap-0.5">
                                        {doc.uploadDate && (
                                          <span>Uploaded: <span className="font-bold text-foreground/80">{doc.uploadDate}</span></span>
                                        )}
                                        {isExpiring && (
                                          <span className="text-amber-500 font-extrabold flex items-center gap-0.5 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded w-fit mt-1 border border-amber-500/20">
                                            <Calendar className="h-3 w-3" /> Expires in 42 Days ⚠
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="align-middle text-right">
                                       <div className="flex items-center justify-end gap-1.5">
                                         {doc.status !== 'Not Uploaded' && (
                                           <>
                                             <Button
                                               onClick={() => setPreviewDoc(doc)}
                                               variant="outline"
                                               size="sm"
                                               className="h-7 text-xs border-border flex items-center gap-1 px-2 font-semibold bg-secondary/30"
                                             >
                                               <Eye className="h-3.5 w-3.5" /> View
                                             </Button>
                                             <Button
                                               onClick={() => setExpandedLogs(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                                               variant="outline"
                                               size="sm"
                                               className="h-7 text-[10px] border-border flex items-center gap-1 px-1.5 font-bold cursor-pointer bg-secondary/20"
                                             >
                                               <Clock className="h-3 w-3" /> Logs {isExpanded ? '▲' : '▼'}
                                             </Button>
                                           </>
                                         )}
                                         
                                         {/* Digital Verify Button (simulated) */}
                                         {doc.status !== 'Approved' && doc.status !== 'Pending' && (doc.id.includes('GST') || doc.id.includes('PAN') || doc.id.includes('AD')) && (
                                           <Button
                                             disabled={verifyingDocId === doc.id}
                                             onClick={() => runSimulatedDigitalVerification(doc.id)}
                                             variant="outline"
                                             size="sm"
                                             className="h-7 text-[10px] border-primary/30 text-primary hover:bg-primary/5 flex items-center gap-1 px-2 font-bold"
                                           >
                                             {verifyingDocId === doc.id ? (
                                               <>
                                                 <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
                                               </>
                                             ) : (
                                               <>
                                                 <ShieldCheck className="h-3.5 w-3.5" /> Instantly Verify
                                               </>
                                             )}
                                           </Button>
                                         )}

                                         {doc.status !== 'Approved' ? (
                                           <>
                                             <input
                                               type="file"
                                               id={`kyc-file-row-${doc.id}`}
                                               style={{ display: 'none' }}
                                               onChange={(e) => {
                                                 const file = e.target.files?.[0];
                                                 if (file) {
                                                   handleRealUpload(doc.id, file);
                                                 }
                                               }}
                                             />
                                             <Button
                                               onClick={() => document.getElementById(`kyc-file-row-${doc.id}`)?.click()}
                                               disabled={isUploading && selectedDocId === doc.id}
                                               size="sm"
                                               variant={doc.status === 'Rejected' ? 'destructive' : 'primary'}
                                               className="h-7 text-xs flex items-center gap-1 px-2.5 font-bold cursor-pointer"
                                             >
                                               {isUploading && selectedDocId === doc.id ? (
                                                 <RefreshCw className="h-3 w-3 animate-spin" />
                                               ) : (
                                                 <>
                                                   <Upload className="h-3.5 w-3.5" /> Upload
                                                 </>
                                               )}
                                             </Button>
                                           </>
                                         ) : (
                                           <span className="text-[10.5px] text-emerald-500 font-extrabold flex items-center gap-1 justify-end px-2.5">
                                             <FileCheck className="h-4.5 w-4.5" /> Approved
                                           </span>
                                         )}
                                       </div>
                                     </TableCell>
                                   </TableRow>

                                   {/* Collapsible Audit History log trail */}
                                   {isExpanded && (
                                     <TableRow className="bg-secondary/10">
                                       <TableCell colSpan={4} className="py-3 px-6 text-left">
                                         <div className="flex flex-col gap-2 border-l-2 border-primary/50 pl-4 text-[10.5px] text-muted-foreground font-semibold">
                                           <div className="flex items-center gap-1.5 text-foreground font-black uppercase text-[9px] tracking-wider mb-0.5">
                                             <Clock className="h-3.5 w-3.5 text-primary" /> Document Audit Trail History
                                           </div>
                                           <div>
                                             • Submit Event: Scan uploaded and mapped by merchant on <span className="text-foreground font-bold">{doc.uploadDate || 'Today'}</span>
                                           </div>
                                           {(doc.id.includes('GST') || doc.id.includes('PAN') || doc.id.includes('AD')) && (
                                             <div>
                                               • API Check Event: Digital verification credentials synced with Central Registry Gateways on <span className="text-foreground font-bold">{doc.uploadDate || 'Today'}</span>
                                             </div>
                                           )}
                                           <div>
                                             • Audit Status: {doc.status === 'Approved' ? (
                                               <span className="text-emerald-500 font-black">Verified &amp; Approved by Admin.</span>
                                             ) : doc.status === 'Pending' ? (
                                               <span className="text-amber-500 font-black">Pending Admin manual review.</span>
                                             ) : doc.status === 'Rejected' ? (
                                               <span className="text-rose-500 font-black">Rejected. Re-upload scan copy.</span>
                                             ) : (
                                               <span>Idle waiting for uploads.</span>
                                             )}
                                           </div>
                                         </div>
                                       </TableCell>
                                     </TableRow>
                                   )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Preview Overlay Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border/50 flex justify-between items-center bg-secondary/15">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex flex-col text-left">
                  <h3 className="font-extrabold text-foreground text-sm leading-tight">Document Credentials Preview</h3>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{previewDoc.category}</span>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)} 
                className="h-8 w-8 hover:bg-secondary rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer border-0 bg-transparent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
              {/* Vertical verification stepper (timeline) */}
              <div className="md:col-span-4 flex flex-col gap-4 border-r border-border/40 pr-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">Verification Path</span>
                <div className="flex flex-col gap-5 relative pl-5">
                  <div className="absolute left-[7.5px] top-1.5 bottom-1.5 w-0.5 bg-border" />
                  
                  {/* Step 1: Uploaded */}
                  <div className="flex items-start gap-3 relative">
                    <div className={`absolute -left-[20px] top-0.5 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center z-10 text-[9px] font-black ${
                      getTimelineStepStyle('Uploaded', previewDoc.status)
                    }`}>
                      1
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-foreground leading-none">Record Submitted</span>
                      <span className="text-[9.5px] text-muted-foreground mt-0.5">
                        {previewDoc.uploadDate ? `Uploaded on ${previewDoc.uploadDate}` : 'Pending upload'}
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="flex items-start gap-3 relative">
                    <div className={`absolute -left-[20px] top-0.5 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center z-10 text-[9px] font-black ${
                      getTimelineStepStyle('Under Review', previewDoc.status)
                    }`}>
                      2
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-foreground leading-none">Security Audit Review</span>
                      <span className="text-[9.5px] text-muted-foreground mt-0.5">
                        {previewDoc.status === 'Pending' ? 'Active manual audit review in progress' : 
                         previewDoc.status === 'Approved' ? 'Audit analysis complete' : 'Waiting for document'}
                      </span>
                    </div>
                  </div>

                  {/* Step 3: Verified */}
                  <div className="flex items-start gap-3 relative">
                    <div className={`absolute -left-[20px] top-0.5 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center z-10 text-[9px] font-black ${
                      getTimelineStepStyle('Verified', previewDoc.status)
                    }`}>
                      3
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-foreground leading-none">Verified & Approved</span>
                      <span className="text-[9.5px] text-muted-foreground mt-0.5">
                        {previewDoc.status === 'Approved' ? 'Verified in good standing' : 'Pending final approval'}
                      </span>
                    </div>
                  </div>

                  {/* Step 4: Expiry */}
                  <div className="flex items-start gap-3 relative">
                    <div className={`absolute -left-[20px] top-0.5 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center z-10 text-[9px] font-black ${
                      getTimelineStepStyle('Renewal Due', previewDoc.status)
                    }`}>
                      4
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-foreground leading-none">Annual Renewal</span>
                      <span className="text-[9.5px] text-muted-foreground mt-0.5">
                        Alert active 30 days before expiration.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Info and Simulated Document Frame */}
              <div className="md:col-span-8 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Document Details</span>
                  <div className="grid grid-cols-2 gap-3 text-xs border border-border/60 bg-muted/10 p-3 rounded-xl mt-1">
                    <div>
                      <span className="text-muted-foreground font-medium block">Document Type</span>
                      <span className="font-extrabold text-foreground/90 mt-0.5 block">{previewDoc.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium block">Approval State</span>
                      <span className="font-extrabold mt-0.5 block">{getStatusBadge(previewDoc.status)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground font-medium block">Uploaded File Name</span>
                      <span className="font-mono text-[10.5px] text-foreground font-bold mt-1 block truncate max-w-full">{previewDoc.fileName || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Document Iframe Visual Mockup */}
                <div className="border border-border/80 rounded-xl overflow-hidden flex flex-col items-center justify-center h-48 bg-secondary/20 relative shadow-inner p-4 text-center">
                  {previewDoc.url ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileCheck className="h-10 w-10 text-emerald-500 animate-pulse" />
                      <span className="text-xs font-extrabold text-foreground">Secure PDF/Image Asset Mapped</span>
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">{previewDoc.fileName}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <AlertTriangle className="h-8 w-8 text-rose-500 animate-bounce" />
                      <span className="text-xs font-bold text-foreground">No file attached</span>
                      <span className="text-[10px] text-muted-foreground">Upload document scan to preview.</span>
                    </div>
                  )}
                  {previewDoc.status === 'Approved' && (
                    <div className="absolute bottom-2 right-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                      Instant API Checked
                    </div>
                  )}
                </div>

                {/* Admin notes alerts */}
                {previewDoc.status === 'Rejected' && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-extrabold text-rose-500">Admin Rejection Feedback Note</span>
                      <p className="text-[10.5px] text-muted-foreground mt-0.5 font-medium">
                        "{previewDoc.adminNote || 'The document photo was blurry. Please upload a high-resolution scan of the original record.'}"
                      </p>
                    </div>
                  </div>
                )}

                {previewDoc.status === 'Approved' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10.5px] text-muted-foreground flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                    <span>Verified and secured in SOC2 Type II encrypted data repository.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-border/50 bg-secondary/15 flex items-center justify-between">
              <div>
                {/* Instant Verification Trigger inside modal */}
                {previewDoc.status !== 'Approved' && (previewDoc.id.includes('GST') || previewDoc.id.includes('PAN') || previewDoc.id.includes('AD')) && (
                  <Button
                    disabled={verifyingDocId === previewDoc.id}
                    onClick={() => runSimulatedDigitalVerification(previewDoc.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-black border-primary/30 text-primary hover:bg-primary/5 flex items-center gap-1.5 px-3"
                  >
                    {verifyingDocId === previewDoc.id ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Run Simulated Verification Check
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setPreviewDoc(null)} 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs font-semibold cursor-pointer border-border"
                >
                  Cancel
                </Button>
                {previewDoc.url && (
                  <a
                    href={previewDoc.url}
                    download={previewDoc.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer decoration-none"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Copy
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCCompliance;
