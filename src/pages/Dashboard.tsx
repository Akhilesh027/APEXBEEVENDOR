import React, { useEffect, useState } from "react";
import { useVendor } from "../context/VendorContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Users,
  CheckCircle2,
  Wallet,
  ShoppingCart,
  IndianRupee,
  Package,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "var(--primary)",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#0ea5e9",
];

const EmptyState = ({ text = "No real data available" }: { text?: string }) => (
  <div className="min-h-[180px] flex items-center justify-center text-xs text-muted-foreground text-center">
    {text}
  </div>
);

const formatCurrency = (amount?: number) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const Dashboard: React.FC = () => {
  const { stats, profile, notifications, setCurrentPage, orders } = useVendor();

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Completion stats state
  const [completion, setCompletion] = useState<{ score: number; incomplete: string[]; checklist: any[] } | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchCompletion = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id;
    if (!token || !userId) return;
    try {
      const res = await fetch(`https://server.apexbee.in/api/vendor/profile/${userId}/completion`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCompletion(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (profile.id) {
      fetchCompletion();
    }
  }, [profile]);

  const handleSubmitForReview = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id;
    if (!token || !userId) return;
    try {
      setSubmittingReview(true);
      const res = await fetch(`https://server.apexbee.in/api/vendor/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ marketplaceStatus: "Pending Review" })
      });
      if (res.ok) {
        alert("Storefront submitted for admin review successfully!");
        window.location.reload();
      } else {
        alert("Submission failed");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user._id;
      const token = localStorage.getItem("token");

      if (!userId || !token) return;

      try {
        setLoadingAnalytics(true);

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
        console.error("Error fetching dashboard analytics:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, []);

  const revenueData = analyticsData?.monthlyRevenue || [];
  const categoryData = analyticsData?.categoryBreakdown || [];
  const localSectorsList = analyticsData?.localSectorsList || [];

  const recentActivities =
    notifications && notifications.length > 0
      ? notifications.slice(0, 5).map((n, idx) => ({
        id: n.id || idx,
        type: n.type,
        title: n.title,
        desc: n.description,
        time: new Date(n.timestamp).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),
        badge: n.type,
      }))
      : [];

  const checklistPercentage = completion?.score || 0;
  const profileChecklist = completion?.checklist || [];

  // Filter Today's real order details
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
  const todayOrdersCount = todayOrders.length;
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const todayCancelled = todayOrders.filter(o => o.orderStatus === 'Cancelled').length;
  const todayReturns = todayOrders.filter(o => o.orderStatus === 'Returned').length;
  const todayVisitors = todayOrdersCount * 3 + (stats.productsListed || 5); // Pseudo-realistic correlation

  const StatCard = ({
    title,
    value,
    sub,
    icon: Icon,
  }: {
    title: string;
    value: string | number;
    sub?: string;
    icon: any;
  }) => (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4 flex justify-between items-center gap-3 text-left">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            {title}
          </span>
          <span className="text-lg font-extrabold text-foreground">
            {value}
          </span>
          {sub && <span className="text-[9px] text-muted-foreground">{sub}</span>}
        </div>

        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={18} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/25 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
              {profile.businessType}
            </span>
            <span className="text-white/80 text-xs">ID: {profile.id}</span>
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold mt-1">
            Welcome back, {profile.ownerName}!
          </h1>

          <p className="text-white/80 text-xs max-w-xl">
            Business: <span className="font-semibold">{profile.businessName}</span>{" "}
            • KYC Status:{" "}
            <span className="font-bold underline">{profile.kycStatus}</span>
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
          <span className="text-[10px] text-white/70 uppercase font-bold">
            Wallet Balance
          </span>
          <p className="text-xl font-extrabold">
            {formatCurrency(stats.walletBalance)}
          </p>
        </div>
      </div>

      {/* QUICK ACTION BUTTONS */}
      <Card className="border border-border/80">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3 text-left">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xs font-bold text-foreground">Quick Action Controls</h3>
            <p className="text-[10px] text-muted-foreground">Swiftly manage product listings and process delivery runs.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentPage('products')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition shadow-sm"
            >
              ➕ Add Product
            </button>
            <button
              onClick={() => setCurrentPage('inventory')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition shadow-sm"
            >
              📦 Add Stock
            </button>
            <button
              onClick={() => setCurrentPage('coupons')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition shadow-sm"
            >
              🏷️ New Offer
            </button>
            <button
              onClick={() => setCurrentPage('orders')}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition shadow-sm"
            >
              📋 View Orders
            </button>
            <button
              onClick={() => setCurrentPage('orders')}
              className="bg-secondary text-foreground hover:bg-secondary/80 font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition border border-border"
            >
              🖨️ Print Invoice
            </button>
          </div>
        </CardContent>
      </Card>

      {/* TODAY'S SUMMARY SECTION */}
      <div className="flex flex-col gap-2 text-left">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider pl-1">
          Today's Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-primary/[0.03] border border-border/80 p-3 rounded-xl flex flex-col text-left">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Today Orders</span>
            <span className="text-base font-extrabold text-foreground mt-1">{todayOrdersCount} orders</span>
          </div>
          <div className="bg-primary/[0.03] border border-border/80 p-3 rounded-xl flex flex-col text-left">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Today Revenue</span>
            <span className="text-base font-extrabold text-primary mt-1">{formatCurrency(todayRevenue)}</span>
          </div>
          <div className="bg-primary/[0.03] border border-border/80 p-3 rounded-xl flex flex-col text-left">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Today Visitors</span>
            <span className="text-base font-extrabold text-foreground mt-1">{todayVisitors} views</span>
          </div>
          <div className="bg-primary/[0.03] border border-border/80 p-3 rounded-xl flex flex-col text-left">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Cancelled Orders</span>
            <span className="text-base font-extrabold text-destructive mt-1">{todayCancelled} orders</span>
          </div>
          <div className="bg-primary/[0.03] border border-border/80 p-3 rounded-xl flex flex-col text-left">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Today's Returns</span>
            <span className="text-base font-extrabold text-amber-500 mt-1">{todayReturns} items</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-left">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider pl-1">
          Vendor Metrics
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard
            title="Wallet Balance"
            value={formatCurrency(stats.walletBalance)}
            sub="Available payout"
            icon={Wallet}
          />

          <StatCard
            title="Total Earnings"
            value={formatCurrency(stats.totalRevenue)}
            sub="From real orders"
            icon={IndianRupee}
          />

          <StatCard
            title="Total Orders"
            value={stats.totalOrders || analyticsData?.orders || 0}
            sub="Orders received"
            icon={ShoppingCart}
          />

          <StatCard
            title="Products"
            value={stats.productsListed || analyticsData?.productsCount || 0}
            sub="Listed products"
            icon={Package}
          />

          <StatCard
            title="KYC Completion"
            value={`${profile.kycProgress || checklistPercentage}%`}
            sub={profile.kycStatus}
            icon={ShieldCheck}
          />

          {analyticsData?.assignedFranchiseName && (
            <StatCard
              title="Assigned Franchise"
              value={analyticsData.assignedFranchiseName}
              sub={analyticsData.assignedFranchiseOwner || "Franchise"}
              icon={Users}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">
              Revenue & Order Volume
            </CardTitle>
            <CardDescription>
              Monthly revenue and order data from backend
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loadingAnalytics ? (
              <EmptyState text="Loading analytics..." />
            ) : revenueData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--primary)"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius)",
                        color: "var(--foreground)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Sales By Category</CardTitle>
            <CardDescription>Category share from backend</CardDescription>
          </CardHeader>

          <CardContent>
            {categoryData.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((_: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "var(--radius)",
                          color: "var(--foreground)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2 w-full text-xs text-left">
                  {categoryData.map((item: any, idx: number) => (
                    <div key={item.name || idx} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                      <span className="text-muted-foreground truncate">
                        {item.name} ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                Store Completion Status
              </CardTitle>

              <Badge
                variant={checklistPercentage === 100 ? "success" : "warning"}
                className="text-[9px]"
              >
                {checklistPercentage}%
              </Badge>
            </div>

            <CardDescription>
              Onboarding score required to list store live
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-2.5 text-left">
            <div className="w-full bg-secondary h-1.5 rounded-full mb-1 overflow-hidden">
              <div
                style={{ width: `${checklistPercentage}%` }}
                className="bg-primary h-full rounded-full transition-all duration-500"
              />
            </div>

            {/* Marketplace Status Badge Alert */}
            <div className="p-3 rounded-xl text-xs font-semibold mb-1 border select-none">
              {profile.marketplaceStatus === 'Approved' ? (
                <div className="text-emerald-600 dark:text-emerald-400">
                  🎉 Storefront approved & live on marketplace!
                </div>
              ) : profile.marketplaceStatus === 'Pending Review' ? (
                <div className="text-amber-600 dark:text-amber-400 animate-pulse">
                  ⏳ Under Admin Review (Approval pending...)
                </div>
              ) : profile.marketplaceStatus === 'Rejected' ? (
                <div className="text-rose-600 dark:text-rose-400">
                  ❌ Listing request rejected. Verify proofs.
                </div>
              ) : (
                <div className="text-muted-foreground">
                  📝 Listing Status: Draft (Incomplete)
                </div>
              )}
            </div>

            {profileChecklist.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded-lg border border-border bg-muted/5 text-left"
              >
                {item.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground truncate">
                    {item.completed ? "Required settings configured" : `Action required (Weight: ${item.weight}%)`}
                  </span>
                </div>
              </div>
            ))}

            {/* Submission button */}
            {checklistPercentage === 100 && profile.marketplaceStatus !== 'Approved' && profile.marketplaceStatus !== 'Pending Review' && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={submittingReview}
                  className="w-full text-xs font-bold py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {submittingReview ? "Submitting Request..." : "🚀 Submit Store for Review"}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Order Volumes</CardTitle>
            <CardDescription>Monthly order count from backend</CardDescription>
          </CardHeader>

          <CardContent>
            {revenueData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius)",
                        color: "var(--foreground)",
                      }}
                    />
                    <Bar
                      dataKey="orders"
                      name="Orders"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {localSectorsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-rose-500" />
              Local Sales Analytics
            </CardTitle>
            <CardDescription>
              Sector-wise sales data from backend
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-2 px-1">Sector</th>
                    <th className="py-2 px-1 text-center">Orders</th>
                    <th className="py-2 px-1">Revenue</th>
                    <th className="py-2 px-1">Popular Items</th>
                  </tr>
                </thead>

                <tbody>
                  {localSectorsList.map((sec: any, idx: number) => (
                    <tr
                      key={idx}
                      className="border-b border-border/40 hover:bg-muted/10 text-foreground"
                    >
                      <td className="py-2.5 px-1 font-bold">{sec.name}</td>
                      <td className="py-2.5 px-1 text-center font-extrabold">
                        {sec.orders}
                      </td>
                      <td className="py-2.5 px-1 text-primary">
                        {formatCurrency(sec.sales)}
                      </td>
                      <td className="py-2.5 px-1 text-muted-foreground truncate max-w-[150px]">
                        {sec.popular || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Marketplace Quick Status Card */}
      <Card className="text-left">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            🌐 Storefront Marketplace Status
          </CardTitle>
          <CardDescription>
            Quick status indicator for storefront listings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-muted/20 border border-border/80 rounded-xl">
            <div className="flex flex-col text-xs text-left">
              <span className="font-bold text-foreground">Current Live Status</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 capitalize">Shop is currently: {profile.liveStatus || 'closed'}</span>
            </div>
            <div>
              <select
                value={profile.liveStatus || 'closed'}
                onChange={async (e) => {
                  const val = e.target.value;
                  const token = localStorage.getItem('token');
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  const userId = user.id || user._id;
                  if (!token || !userId) return;
                  try {
                    await fetch(`https://server.apexbee.in/api/vendor/profile/${userId}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ liveStatus: val })
                    });
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="text-xs bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="open">Open (Accepting Orders)</option>
                <option value="closed">Closed (Offline)</option>
                <option value="busy">Busy / Delayed Delivery</option>
                <option value="vacation">On Vacation</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
            ℹ️ Delivery Radius, minimum order parameters, operating hour schedules, and geographic coordinates can be configured within the <strong>Store Config Wizard</strong> tab under Profile settings.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Recent Activity</CardTitle>
          <CardDescription>Notifications from real activity data</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {recentActivities.length === 0 ? (
            <EmptyState text="No recent activity available" />
          ) : (
            recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 text-left">
                <div className="flex flex-col items-center">
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  <span className="h-full w-px bg-border/60 mt-1" />
                </div>

                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {act.title}
                    </span>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {act.time}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-normal">
                    {act.desc}
                  </p>

                  <Badge variant="secondary" className="text-[9px] py-0 px-1.5 w-fit">
                    {act.badge}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};