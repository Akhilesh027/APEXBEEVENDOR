import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

interface ProfitCalculatorProps {
  initialPrice?: number;
  initialCommission?: number;
  initialShipping?: number;
  initialPacking?: number;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  initialPrice = 1000,
  initialCommission = 10,
  initialShipping = 60,
  initialPacking = 20,
}) => {
  const [sellingPrice, setSellingPrice] = useState<number>(initialPrice);
  const [commissionRate, setCommissionRate] = useState<number>(initialCommission);
  const [shipping, setShipping] = useState<number>(initialShipping);
  const [packing, setPacking] = useState<number>(initialPacking);

  // Calculations
  const commissionAmount = Math.round(sellingPrice * (commissionRate / 100));
  const vendorEarnings = Math.max(0, sellingPrice - commissionAmount - shipping - packing);
  const customerPrice = sellingPrice + shipping + packing;

  const earningsPercent = sellingPrice > 0 ? (vendorEarnings / customerPrice) * 100 : 0;
  const commissionPercent = sellingPrice > 0 ? (commissionAmount / customerPrice) * 100 : 0;
  const shippingPercent = sellingPrice > 0 ? (shipping / customerPrice) * 100 : 0;
  const packingPercent = sellingPrice > 0 ? (packing / customerPrice) * 100 : 0;

  return (
    <Card className="glass shadow-xl border-border/80 overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border/40 pb-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Interactive Profit Calculator
        </CardTitle>
        <CardDescription>Visualizing pricing, commission, and vendor payouts</CardDescription>
      </CardHeader>
      <CardContent className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Selling Price (₹)</label>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Commission Rate (%)</label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Shipping (₹)</label>
            <input
              type="number"
              value={shipping}
              onChange={(e) => setShipping(Math.max(0, Number(e.target.value)))}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Packing (₹)</label>
            <input
              type="number"
              value={packing}
              onChange={(e) => setPacking(Math.max(0, Number(e.target.value)))}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
        </div>

        {/* Visual Stacked Progress Bar */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="text-xs font-bold text-foreground flex justify-between">
            <span>Cost Distribution Flow</span>
            <span className="text-primary">Customer Price: ₹{customerPrice}</span>
          </div>
          <div className="h-6 w-full rounded-lg overflow-hidden flex bg-muted shadow-inner">
            {vendorEarnings > 0 && (
              <div
                style={{ width: `${earningsPercent}%` }}
                className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-300"
                title={`Your Earnings: ₹${vendorEarnings}`}
              >
                {earningsPercent > 15 && `₹${vendorEarnings}`}
              </div>
            )}
            {commissionAmount > 0 && (
              <div
                style={{ width: `${commissionPercent}%` }}
                className="bg-indigo-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-300"
                title={`Commission: ₹${commissionAmount}`}
              >
                {commissionPercent > 15 && `₹${commissionAmount}`}
              </div>
            )}
            {shipping > 0 && (
              <div
                style={{ width: `${shippingPercent}%` }}
                className="bg-sky-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-300"
                title={`Shipping: ₹${shipping}`}
              >
                {shippingPercent > 15 && `₹${shipping}`}
              </div>
            )}
            {packing > 0 && (
              <div
                style={{ width: `${packingPercent}%` }}
                className="bg-amber-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-300"
                title={`Packing: ₹${packing}`}
              >
                {packingPercent > 15 && `₹${packing}`}
              </div>
            )}
          </div>
        </div>

        {/* Breakdown details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="border border-border/60 bg-muted/30 p-3 rounded-lg flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Your Earnings
            </span>
            <span className="text-xl font-extrabold text-foreground">₹{vendorEarnings}</span>
            <span className="text-[10px] text-muted-foreground">Payout to your bank</span>
          </div>
          <div className="border border-border/60 bg-muted/30 p-3 rounded-lg flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Platform Fee
            </span>
            <span className="text-xl font-extrabold text-foreground">₹{commissionAmount}</span>
            <span className="text-[10px] text-muted-foreground">Commission ({commissionRate}%)</span>
          </div>
          <div className="border border-border/60 bg-muted/30 p-3 rounded-lg flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Delivery Cost
            </span>
            <span className="text-xl font-extrabold text-foreground">₹{shipping}</span>
            <span className="text-[10px] text-muted-foreground">Shipping fees</span>
          </div>
          <div className="border border-border/60 bg-muted/30 p-3 rounded-lg flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Packaging Cost
            </span>
            <span className="text-xl font-extrabold text-foreground">₹{packing}</span>
            <span className="text-[10px] text-muted-foreground">Packing charges</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
