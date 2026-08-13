import React from 'react';

interface InventorySectionProps {
  mode: string;
  stock: number;
  batchNumber?: string;
  expiryDate?: string;
  requiresBatch?: boolean;
  requiresExpiry?: boolean;
  onChange: (field: string, value: any) => void;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
  mode,
  stock,
  batchNumber,
  expiryDate,
  requiresBatch,
  requiresExpiry,
  onChange,
}) => {
  return (
    <div className="p-5 border border-blue-900/60 rounded-2xl bg-slate-950/80 space-y-4 shadow-xl">
      <div className="flex justify-between items-center border-b border-blue-900/40 pb-3">
        <h4 className="font-extrabold font-heading text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
          <span>📦</span> Inventory & Stock Controls
        </h4>
        <span className="px-3 py-1 text-[10px] bg-amber-400 text-blue-950 rounded-full font-black uppercase shadow-sm">
          Policy Mode: {mode}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-extrabold text-white mb-1.5">
            Available Stock <span className="text-amber-400">*</span>
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => onChange('stock', Number(e.target.value))}
            min={0}
            required
            className="w-full p-3 text-sm font-bold rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/40 outline-none"
          />
        </div>

        {requiresBatch && (
          <div>
            <label className="block text-xs font-extrabold text-white mb-1.5">
              Batch Number <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={batchNumber || ''}
              onChange={(e) => onChange('batchNumber', e.target.value)}
              placeholder="e.g. BATCH-2026-08-01"
              required
              className="w-full p-3 text-sm font-mono text-amber-300 rounded-xl border border-blue-900/60 bg-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-400/40 outline-none"
            />
          </div>
        )}

        {requiresExpiry && (
          <div>
            <label className="block text-xs font-extrabold text-white mb-1.5">
              Expiry Date & Time <span className="text-amber-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={expiryDate || ''}
              onChange={(e) => onChange('expiryDate', e.target.value)}
              required
              className="w-full p-3 text-sm rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/40 outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};
