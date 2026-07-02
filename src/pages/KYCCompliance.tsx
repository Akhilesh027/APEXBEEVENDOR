import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ShieldCheck, FileCheck, AlertTriangle, Upload, Info, RefreshCw } from 'lucide-react';

export const KYCCompliance: React.FC = () => {
  const { profile, uploadDocument } = useVendor();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const documents = profile.documents || [];
  const progress = profile.kycProgress || 0;
  const status = profile.kycStatus || 'Not Started';

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

  // Get status badge colors
  const getStatusBadge = (docStatus: string) => {
    switch (docStatus) {
      case 'Approved':
        return <Badge variant="success">Verified</Badge>;
      case 'Pending':
        return <Badge variant="warning">Under Review</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Not Uploaded</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">KYC & Compliance Center</h1>
          <p className="text-xs text-muted-foreground">Verify business credentials, submit required documentation, and track registration status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress & Circular Indicator */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="glass flex flex-col items-center p-6 text-center">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 justify-center">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Verification Status
              </CardTitle>
              <CardDescription>ApexBee merchant verification requirements</CardDescription>
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
                <span className="text-xs font-bold text-muted-foreground">Verification Phase:</span>
                <span className="text-base font-extrabold text-foreground">
                  {status === 'Verified' ? (
                    <span className="text-emerald-500 flex items-center gap-1 justify-center"><FileCheck className="h-4 w-4" /> Fully Verified</span>
                  ) : status === 'Pending Verification' ? (
                    <span className="text-amber-500 flex items-center gap-1 justify-center"><RefreshCw className="h-4 w-4 animate-spin" /> Pending Admin Audit</span>
                  ) : (
                    <span className="text-rose-500 flex items-center gap-1 justify-center"><AlertTriangle className="h-4 w-4" /> Action Required</span>
                  )}
                </span>
              </div>

              <div className="text-[10px] text-muted-foreground leading-normal mt-2 border-t border-border/40 pt-4 w-full">
                {status === 'Verified' 
                  ? 'Your account is in good standing. All features including credit extensions and territory expansion are fully unlocked.'
                  : 'Please upload scanned copy of the documents on the right. Audits are typically completed in 24 business hours.'}
              </div>
            </CardContent>
          </Card>

          {/* Legal guidelines */}
          <Card className="glass bg-muted/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold flex items-center gap-1">
                <Info className="h-4 w-4 text-primary" /> Regulatory Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-muted-foreground leading-relaxed flex flex-col gap-2">
              <p>
                ApexBee complies strictly with GST rules and anti-fraud regulations. 
                Providing counterfeit or modified registrations will result in instant account block.
              </p>
              <p>
                All documents are encrypted and stored in SOC2 Type II secure data repositories.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Document upload grid */}
        <div className="lg:col-span-8">
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Document Checklist</CardTitle>
              <CardDescription>Provide high-resolution scans or PDF files of official records</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Uploaded File</TableHead>
                    <TableHead>Update Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-bold text-foreground">{doc.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {doc.url ? (
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            {doc.fileName || 'View File'}
                          </a>
                        ) : (
                          doc.fileName || <span className="italic text-muted-foreground/50">No file</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {doc.uploadDate || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(doc.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {doc.status === 'Approved' ? (
                          <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1 justify-end">
                            <FileCheck className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : (
                          <>
                            <input
                              type="file"
                              id={`kyc-file-input-${doc.id}`}
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleRealUpload(doc.id, file);
                                }
                              }}
                            />
                            <Button
                              onClick={() => document.getElementById(`kyc-file-input-${doc.id}`)?.click()}
                              disabled={isUploading && selectedDocId === doc.id}
                              size="sm"
                              variant={doc.status === 'Rejected' ? 'destructive' : 'outline'}
                              className="flex items-center gap-1 cursor-pointer h-7 text-xs"
                            >
                              {isUploading && selectedDocId === doc.id ? (
                                <>
                                  <RefreshCw className="h-3 w-3 animate-spin" /> Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-3 w-3" /> {doc.status === 'Not Uploaded' ? 'Upload' : 'Re-upload'}
                                </>
                              )}
                            </Button>
                          </>
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

export default KYCCompliance;
