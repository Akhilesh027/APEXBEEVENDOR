import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Download, TrendingUp, Calendar } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const Reports: React.FC = () => {
  const { stats } = useVendor();

  const [reportType, setReportType] = useState('sales');
  const [timeframe, setTimeframe] = useState('monthly');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  React.useEffect(() => {
    const fetchAnalytics = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user._id;
      const token = localStorage.getItem("token");

      if (!userId || !token) return;

      try {
        const res = await fetch(
          `https://server.apexbee.in/api/vendor/dashboard/analytics/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const resJson = await res.json();
        if (res.ok && resJson.success) {
          setAnalyticsData(resJson.data);
        }
      } catch (err) {
        console.error("Error fetching analytics in reports:", err);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExport = async (format: string) => {
    setIsExporting(format);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user._id;
      const token = localStorage.getItem('token');
      if (!userId || !token) return;

      const url = `https://server.apexbee.in/api/vendor/reports/export/${userId}?format=${format.toLowerCase()}&reportType=${reportType}&timeframe=${timeframe}`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to generate report file.');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      let ext = format.toLowerCase();
      if (ext === 'excel') ext = 'xlsx';
      link.setAttribute('download', `Report_${reportType}_${timeframe}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      alert(err.message || 'Error downloading report');
    } finally {
      setIsExporting(null);
    }
  };

  // Mock report table data for all 8 categories
  const getReportData = () => {
    switch (reportType) {
      case 'sales':
        return [
          { id: 'RPT-101', date: '2026-06-11', orders: 12, sales: 24988, commission: 2998, profit: 21990 },
          { id: 'RPT-102', date: '2026-06-10', orders: 9, sales: 18450, commission: 2214, profit: 16236 },
          { id: 'RPT-103', date: '2026-06-09', orders: 15, sales: 31200, commission: 3744, profit: 27456 },
          { id: 'RPT-104', date: '2026-06-08', orders: 8, sales: 14890, commission: 1786, profit: 13104 },
          { id: 'RPT-105', date: '2026-06-07', orders: 19, sales: 42350, commission: 5082, profit: 37268 }
        ];
      case 'products':
        return [
          { id: 'PROD-001', name: 'Classic Silk Nehru Jacket', category: 'Apparel', sold: 48, revenue: 101952, stockValuation: 212415 },
          { id: 'PROD-002', name: 'Cotton Premium Printed Kurta', category: 'Apparel', sold: 34, revenue: 32606, stockValuation: 143880 },
          { id: 'PROD-003', name: 'Pure Georgette Designer Saree', category: 'Apparel', sold: 18, revenue: 67482, stockValuation: 89982 }
        ];
      case 'procurement':
        return [
          { id: 'PO-9002', date: '2026-06-12', name: 'Classic Silk Nehru Jacket', supplier: 'Surat Textiles Wholesalers', qty: 100, rate: 450, total: 45000, status: 'Shipped' },
          { id: 'PO-8812', date: '2026-06-05', name: 'Pure Georgette Designer Saree', supplier: 'Kanchipuram Silk Co', qty: 50, rate: 1200, total: 60000, status: 'Delivered' }
        ];
      case 'quotation':
        return [
          { id: 'RFQ-501', date: '2026-06-10', name: 'Classic Silk Nehru Jacket', qty: 500, target: 1100, counter: 1250, status: 'Counter Offered' },
          { id: 'RFQ-502', date: '2026-06-12', name: 'Cotton Premium Printed Kurta', qty: 1000, target: 600, counter: 600, status: 'Accepted' },
          { id: 'RFQ-503', date: '2026-06-13', name: 'Banarasi Zari Border Silk Saree', qty: 200, target: 3500, counter: 0, status: 'Pending' }
        ];
      case 'territory':
        return [
          { id: 'TER-001', state: 'Maharashtra', district: 'Mumbai City', mandal: 'Kanjurmarg West', partners: 15, volume: 845000, status: 'Active' },
          { id: 'TER-002', state: 'Karnataka', district: 'Bengaluru Urban', mandal: 'HSR Layout', partners: 28, volume: 1245000, status: 'Active' },
          { id: 'TER-004', state: 'Tamil Nadu', district: 'Chennai', mandal: 'Adyar', partners: 0, volume: 0, status: 'Under Expansion' }
        ];
      case 'referral':
        return [
          { id: 'REF-01', name: 'Delhi Tech Mart', category: 'Wholesaler', joined: '2026-01-15', sales: 1450000, commission: 7250 },
          { id: 'REF-02', name: 'Bengaluru Organic Farms', category: 'Vendor', joined: '2026-05-20', sales: 120000, commission: 600 }
        ];
      case 'franchise':
        return [
          { id: 'FR-101', level: 'State Partner', name: 'Rohan Deshmukh', region: 'Maharashtra East', rate: '2.5% share', rating: 4.9 },
          { id: 'FR-205', level: 'District Partner', name: 'Priya Sharma', region: 'Pune Central', rate: '1.5% share', rating: 4.7 }
        ];
      case 'commission':
        return [
          { id: 'COMM-001', source: 'Product Sales', desc: 'Classic Silk Nehru Jacket', gross: 2499, rate: '10%', charged: 250, net: 2249 },
          { id: 'COMM-003', source: 'Referral Passive', desc: 'Override Commission - Pune Tech', gross: 45000, rate: '0.5%', charged: 225, net: 44775 },
          { id: 'COMM-004', source: 'QR Flat Rate', desc: 'UPI Payment Store Terminal', gross: 1200, rate: '1.5%', charged: 18, net: 1182 }
        ];
      case 'kyc':
        return [
          { id: 'DOC-AD-F', name: 'Aadhaar Card Front', type: 'Identification', file: 'aadhaar_front.jpg', uploaded: '2026-06-01', status: 'Approved' },
          { id: 'DOC-PAN', name: 'PAN Tax ID Card', type: 'Tax Record', file: 'pan_card.pdf', uploaded: '2026-06-01', status: 'Approved' },
          { id: 'DOC-GST', name: 'GSTIN Registration', type: 'Tax Registration', file: 'gst.pdf', uploaded: '2026-06-13', status: 'Pending Review' }
        ];
      case 'b2b':
        return [
          { id: 'B2B-101', date: '2026-06-12', dealName: 'Premium sherwani lots', quantity: 200, value: 340000, status: 'RFQ Matched' },
          { id: 'B2B-102', date: '2026-06-10', dealName: 'Cotton thread reels', quantity: 500, value: 45000, status: 'PO Issued' }
        ];
      case 'qr':
        return [
          { id: 'QR-001', date: '2026-06-13', txnVal: 1250, cashback: 12.5, status: 'Settled', utr: 'UTR882910' },
          { id: 'QR-002', date: '2026-06-13', txnVal: 4500, cashback: 45, status: 'Settled', utr: 'UTR882912' }
        ];
      case 'lead':
        return [
          { id: 'CRM-201', leadName: 'Pune Retail Hub', source: 'Google Ads', stage: 'Converted', conversionRate: '100%' },
          { id: 'CRM-202', leadName: 'Kalyan Fabrics', source: 'Direct Website', stage: 'Negotiation', conversionRate: '40%' }
        ];
      case 'entrepreneur':
        return [
          { id: 'ENTR-301', agent: 'Priya Patel', acquisitions: 22, incentiveReleased: 71000, pending: 14200 },
          { id: 'ENTR-302', agent: 'Amit Sharma', acquisitions: 14, incentiveReleased: 42500, pending: 8500 }
        ];
      case 'growth':
        return [
          { id: 'GRW-401', location: 'Gachibowli, Hyderabad', penetration: '82%', growthMoM: '+15%', status: 'High Saturation' },
          { id: 'GRW-402', location: 'Indiranagar, Bengaluru', penetration: '30%', growthMoM: '+8%', status: 'Underpenetrated' }
        ];
      case 'ai':
        return [
          { id: 'AI-901', forecastPeriod: 'July 2026', category: 'Ethnic Sarees', predictedGrowth: '+24%', confidence: '94%' },
          { id: 'AI-902', forecastPeriod: 'July 2026', category: 'Oversized Tees', predictedGrowth: '+18%', confidence: '89%' }
        ];
      default:
        return [];
    }
  };

  const reportData = getReportData();

  // Graph data representing monthly sales trend inside report
  const chartData = analyticsData?.monthlyRevenue?.map((m: any) => ({
    name: m.name,
    sales: m.revenue
  })) || [
    { name: 'Wk 1', sales: 34000 },
    { name: 'Wk 2', sales: 48000 },
    { name: 'Wk 3', sales: 29000 },
    { name: 'Wk 4', sales: 43200 }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Analytics Reports</h1>
          <p className="text-xs text-muted-foreground">Analyze business volumes, export accounting sheets, and audit inventory charts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['PDF', 'Excel', 'CSV'].map(format => (
            <Button
              key={format}
              onClick={() => handleExport(format)}
              variant="outline"
              size="sm"
              loading={isExporting === format}
              className="flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export {format}
            </Button>
          ))}
        </div>
      </div>

      {/* Filter Parameters */}
      <Card className="glass">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select
            label="Report Category"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'sales', label: 'Sales & Order Volumes' },
              { value: 'products', label: 'Product Performance Report' },
              { value: 'procurement', label: 'Sourcing & Procurement Log' },
              { value: 'quotation', label: 'Quotations & RFQ Bids' },
              { value: 'territory', label: 'Territory Coverage Map' },
              { value: 'referral', label: 'Referral Network Growth' },
              { value: 'franchise', label: 'Franchise Partner Splits' },
              { value: 'commission', label: 'Commission Breakdown Matrix' },
              { value: 'kyc', label: 'KYC Verification Checklist' },
              { value: 'b2b', label: 'B2B Marketplace Reports' },
              { value: 'qr', label: 'QR Merchant Reports' },
              { value: 'lead', label: 'CRM Lead Reports' },
              { value: 'entrepreneur', label: 'Entrepreneur Network Reports' },
              { value: 'growth', label: 'Hyperlocal Growth Reports' },
              { value: 'ai', label: 'AI Insights Reports' }
            ]}
          />
          <Select
            label="Reporting Timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            options={[
              { value: 'daily', label: 'Daily Reports' },
              { value: 'weekly', label: 'Weekly Summary' },
              { value: 'monthly', label: 'Monthly Statement' },
              { value: 'yearly', label: 'Yearly Performance' }
            ]}
          />
          <div className="flex items-center gap-2 pb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Reporting Period: June 2026
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Visual Chart representation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Report Analytics Visualizer</CardTitle>
            <CardDescription>Visual trend of the compiled {reportType} report ({timeframe})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Area type="monotone" dataKey="sales" name="Volume (₹)" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReport)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Summaries card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-primary" /> Report Highlights
            </CardTitle>
            <CardDescription>Compiled insights from active timeframe</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-left text-xs">
            <div className="flex flex-col gap-1 border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground uppercase font-bold text-[10px]">Net Sales Volume</span>
              <span className="text-lg font-extrabold text-foreground">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground uppercase font-bold text-[10px]">Settled Balances</span>
              <span className="text-lg font-extrabold text-foreground">₹{(stats.totalRevenue * 0.88).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground uppercase font-bold text-[10px]">Active Order Fulfillments</span>
              <span className="text-lg font-extrabold text-foreground">{stats.totalOrders} Orders</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Data Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base font-bold">Compiled Statements Register</CardTitle>
          <CardDescription>Detail rows for the generated sheet</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="border-none rounded-none shadow-none">
            {reportType === 'sales' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Orders Fulfillments</TableHead>
                    <TableHead className="text-right">Gross Sales (₹)</TableHead>
                    <TableHead className="text-right">Platform Commission (₹)</TableHead>
                    <TableHead className="text-right">Net Vendor Profit (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.date}</TableCell>
                      <TableCell className="text-xs text-foreground font-bold">{row.orders} orders</TableCell>
                      <TableCell className="text-xs text-foreground font-bold text-right">₹{row.sales.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-destructive text-right">-₹{row.commission.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-emerald-500 font-extrabold text-right">₹{row.profit.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'products' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity Sold</TableHead>
                    <TableHead className="text-right">Revenue Generated (₹)</TableHead>
                    <TableHead className="text-right">Current Stock Valuation (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.category}</TableCell>
                      <TableCell className="text-xs text-foreground font-bold text-right">{row.sold} units</TableCell>
                      <TableCell className="text-xs text-emerald-500 font-extrabold text-right">₹{row.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground text-right">₹{row.stockValuation.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'procurement' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>PO ID</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Consignment Product</TableHead>
                    <TableHead>Wholesaler Supplier</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Rate (₹)</TableHead>
                    <TableHead className="text-right">Total Amount (₹)</TableHead>
                    <TableHead>Ship Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.date}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.name}</TableCell>
                      <TableCell className="text-xs text-foreground font-semibold">{row.supplier}</TableCell>
                      <TableCell className="text-xs text-foreground font-bold text-right">{row.qty} units</TableCell>
                      <TableCell className="text-xs text-muted-foreground text-right">₹{row.rate}</TableCell>
                      <TableCell className="text-xs text-indigo-500 font-extrabold text-right">₹{row.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === 'Delivered' ? 'success' : 'warning'}>{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'quotation' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>RFQ Ref</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>RFQ Product</TableHead>
                    <TableHead className="text-right">Qty Requested</TableHead>
                    <TableHead className="text-right">Target Price (₹)</TableHead>
                    <TableHead className="text-right">Best Bid Offer (₹)</TableHead>
                    <TableHead>RFQ Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.date}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.name}</TableCell>
                      <TableCell className="text-xs text-foreground font-bold text-right">{row.qty.toLocaleString()} units</TableCell>
                      <TableCell className="text-xs text-muted-foreground text-right">₹{row.target}</TableCell>
                      <TableCell className="text-xs text-primary font-black text-right">
                        {row.counter > 0 ? `₹${row.counter}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.status === 'Accepted' ? 'success' : row.status === 'Pending' ? 'secondary' : 'warning'}>
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'territory' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Territory ID</TableHead>
                    <TableHead>State/District</TableHead>
                    <TableHead>Mandal Hub</TableHead>
                    <TableHead className="text-right">Active Partners</TableHead>
                    <TableHead className="text-right">Sales Volume (₹)</TableHead>
                    <TableHead>Hub Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.state} • {row.district}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.mandal}</TableCell>
                      <TableCell className="text-xs text-foreground font-semibold text-right">{row.partners} members</TableCell>
                      <TableCell className="text-xs text-indigo-500 font-extrabold text-right">₹{row.volume.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'referral' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Referral ID</TableHead>
                    <TableHead>Partner Name</TableHead>
                    <TableHead>Partner Type</TableHead>
                    <TableHead>Onboarded Date</TableHead>
                    <TableHead className="text-right">Total Sales Generated (₹)</TableHead>
                    <TableHead className="text-right font-bold text-primary">Override Commission Earned (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.category}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.joined}</TableCell>
                      <TableCell className="text-xs text-foreground font-semibold text-right">₹{row.sales.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-emerald-500 font-black text-right">₹{row.commission.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'franchise' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Officer ID</TableHead>
                    <TableHead>Franchise Level</TableHead>
                    <TableHead>Officer Name</TableHead>
                    <TableHead>Region Assigned</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Reputation Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell>
                        <Badge variant={row.level.includes('State') ? 'default' : 'warning'}>{row.level}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.name}</TableCell>
                      <TableCell className="text-xs text-foreground font-semibold">{row.region}</TableCell>
                      <TableCell className="text-xs text-indigo-500 font-extrabold">{row.rate}</TableCell>
                      <TableCell className="text-xs text-amber-500 font-black">★ {row.rating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'commission' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Ref ID</TableHead>
                    <TableHead>Revenue Source</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Transaction amount (₹)</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Commission Charged (₹)</TableHead>
                    <TableHead className="text-right font-bold text-primary">Vendor Net (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.source}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.desc}</TableCell>
                      <TableCell className="text-xs text-foreground font-semibold text-right">₹{row.gross.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-amber-500 font-bold text-right">{row.rate}</TableCell>
                      <TableCell className="text-xs text-destructive text-right">-₹{row.charged.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-emerald-500 font-black text-right">₹{row.net.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'kyc' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Doc ID</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.type}</TableCell>
                      <TableCell className="text-xs font-mono text-foreground">{row.file}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.uploaded}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === 'Approved' ? 'success' : 'warning'}>{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'b2b' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Deal Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Deal Value (₹)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.date}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.dealName}</TableCell>
                      <TableCell className="text-xs text-foreground text-right">{row.quantity} units</TableCell>
                      <TableCell className="text-xs text-emerald-500 font-extrabold text-right">₹{row.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={row.status.includes('Matched') ? 'default' : 'warning'}>{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'qr' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Txn Value (₹)</TableHead>
                    <TableHead className="text-right">Cashback Paid (₹)</TableHead>
                    <TableHead>Settlement UTR</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.date}</TableCell>
                      <TableCell className="text-xs text-foreground font-bold text-right">₹{row.txnVal.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-destructive text-right">-₹{row.cashback.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{row.utr}</TableCell>
                      <TableCell>
                        <Badge variant="default">{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'lead' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Lead ID</TableHead>
                    <TableHead>Lead Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Funnel Stage</TableHead>
                    <TableHead className="text-right">Conversion Probability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.leadName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.source}</TableCell>
                      <TableCell>
                        <Badge variant={row.stage === 'Converted' ? 'default' : 'warning'}>{row.stage}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-bold text-right">{row.conversionRate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'entrepreneur' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Agent ID</TableHead>
                    <TableHead>Agent Name</TableHead>
                    <TableHead className="text-right">Total Store Acquisitions</TableHead>
                    <TableHead className="text-right">Incentives Released (₹)</TableHead>
                    <TableHead className="text-right">Incentives Pending (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.agent}</TableCell>
                      <TableCell className="text-xs text-foreground font-semibold text-right">{row.acquisitions} hubs</TableCell>
                      <TableCell className="text-xs text-emerald-500 font-extrabold text-right">₹{row.incentiveReleased.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-amber-500 font-extrabold text-right">₹{row.pending.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'growth' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Geographic Hub</TableHead>
                    <TableHead>Market Penetration</TableHead>
                    <TableHead>Growth Rate (MoM)</TableHead>
                    <TableHead>Saturation Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.location}</TableCell>
                      <TableCell className="text-xs text-foreground font-bold">{row.penetration}</TableCell>
                      <TableCell className="text-xs text-sky-400 font-bold">{row.growthMoM}</TableCell>
                      <TableCell>
                        <Badge variant={row.status.includes('High') ? 'default' : 'warning'}>{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'ai' && (
              <>
                <TableHeader className="bg-transparent border-b border-border/40">
                  <TableRow>
                    <TableHead>Log ID</TableHead>
                    <TableHead>Forecast Period</TableHead>
                    <TableHead>Target Category</TableHead>
                    <TableHead>Predicted Growth</TableHead>
                    <TableHead className="text-right">Confidence Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">{row.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.forecastPeriod}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">{row.category}</TableCell>
                      <TableCell className="text-xs text-emerald-500 font-bold">{row.predictedGrowth}</TableCell>
                      <TableCell className="text-xs text-foreground font-bold text-right">{row.confidence}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
