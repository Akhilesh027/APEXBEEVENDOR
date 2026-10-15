import React, { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  Store,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  Tag
} from "lucide-react";
import { openRazorpayModal } from "../../../utils/razorpay";

interface PricingItem {
  _id: string;
  serviceKey: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  billingCycle: string;
  features: string[];
  taxPercentage: number;
}

interface FeeInvoice {
  _id: string;
  invoiceNumber: string;
  title: string;
  description?: string;
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: "pending" | "paid" | "failed";
  paymentLinkToken: string;
  paidAt?: string;
  commissionSettled: boolean;
  notes?: string;
  createdAt: string;
}

export const AdminFeeInvoices: React.FC = () => {
  const [catalog, setCatalog] = useState<PricingItem[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const API_BASE = "https://server.apexbee.in/api";
  const getAuthHeader = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch vendor pricing models
      const catRes = await fetch(`${API_BASE}/fee-pricing/catalog?category=vendor`);
      const catData = await catRes.json();
      if (catData.success) {
        setCatalog(catData.data);
      }

      // Fetch user's invoices
      const invRes = await fetch(`${API_BASE}/fee-pricing/my-invoices`, {
        headers: getAuthHeader(),
      });
      const invData = await invRes.json();
      if (invData.success) {
        setInvoices(invData.data);
      }
    } catch (err) {
      console.error("Error fetching vendor fee pricing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayInvoice = async (invoice: FeeInvoice) => {
    try {
      setPayingId(invoice._id);

      // 1. Create Razorpay Order on Backend
      const orderRes = await fetch(`${API_BASE}/fee-pricing/create-razorpay-order`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
          invoiceId: invoice._id,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to initialize Razorpay checkout");
      }

      // 2. Open Razorpay Checkout Modal
      const rzpResponse = await openRazorpayModal({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        order_id: orderData.orderId,
        name: "ApexBee Market",
        description: invoice.title || "License & Enrollment Fee",
        prefill: {
          name: invoice.recipientName || "Vendor Partner",
          email: invoice.recipientEmail || "",
          contact: invoice.recipientPhone || "",
        },
        theme: {
          color: "#F5B800",
        },
      });

      // 3. Complete and verify payment
      const res = await fetch(`${API_BASE}/fee-pricing/pay`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
          invoiceId: invoice._id,
          paymentMethod: "Razorpay Online",
          paymentGatewayOrderId: rzpResponse.razorpay_order_id,
          paymentId: rzpResponse.razorpay_payment_id,
          signature: rzpResponse.razorpay_signature,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Payment Successful via Razorpay! Invoice settled and license activated.");
        fetchData();
      } else {
        showToast(data.message || "Payment verification failed", "error");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      showToast(err.message || "Error processing payment", "error");
    } finally {
      setPayingId(null);
    }
  };

  const pendingInvoices = invoices.filter((inv) => inv.status === "pending");

  return (
    <div className="space-y-8 text-left">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md border ${toastMessage.type === "success"
            ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
            : "bg-rose-950/90 border-rose-500/40 text-rose-200"
            }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Pending Invoices Action Banner */}
      {pendingInvoices.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border border-amber-500/30 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400 border border-amber-500/30">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Action Required: {pendingInvoices.length} Pending Service Invoice(s)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete fee payment for your merchant software, license, or marketing packages.
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePayInvoice(pendingInvoices[0])}
              disabled={payingId === pendingInvoices[0]._id}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              {payingId === pendingInvoices[0]._id ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Pay Now (₹{pendingInvoices[0].totalAmount})
            </button>
          </div>
        </div>
      )}

      {/* Official Merchant Services & Software Pricing */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-400" />
            Official Merchant Services & Software Packages
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Prices are centrally managed and verified by Apexbee Platform Administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {catalog.map((pkg) => (
            <div
              key={pkg._id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {pkg.billingCycle.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">+ {pkg.taxPercentage}% GST</span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{pkg.title}</h3>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{pkg.description}</p>

                <div className="mb-4">
                  <span className="text-2xl font-black text-white">₹{pkg.amount}</span>
                  <span className="text-xs text-muted-foreground ml-1">/ {pkg.billingCycle}</span>
                </div>

                <ul className="space-y-1.5 border-t border-white/5 pt-4">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-400" />
          Issued Fee Invoices & Payment History
        </h3>

        <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-4 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No fee invoices issued to your merchant account yet.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {invoices.map((inv) => (
                <div key={inv._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 font-bold">{inv.invoiceNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${inv.status === "paid"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-1">{inv.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      Issued on {new Date(inv.createdAt).toLocaleDateString()} • Total: ₹{inv.totalAmount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handlePayInvoice(inv)}
                          disabled={payingId === inv._id}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          {payingId === inv._id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                          {payingId === inv._id ? "Processing..." : `Pay Now (₹${inv.totalAmount})`}
                        </button>
                        {inv.paymentLinkToken && (
                          <a
                            href={`https://apexbee.in/pay/${inv.paymentLinkToken}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                        <Check className="w-3.5 h-3.5" /> Paid & Commission Settled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
