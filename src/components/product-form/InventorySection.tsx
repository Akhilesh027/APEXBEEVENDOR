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
    <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Inventory & Stock Controls</h4>
        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded font-mono font-bold uppercase">
          Mode: {mode}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Available Stock <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => onChange('stock', Number(e.target.value))}
            min={0}
            required
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:text-white"
          />
        </div>

        {requiresBatch && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Batch Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={batchNumber || ''}
              onChange={(e) => onChange('batchNumber', e.target.value)}
              placeholder="e.g. BATCH-2026-08-01"
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:text-white"
            />
          </div>
        )}

        {requiresExpiry && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Expiry Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={expiryDate || ''}
              onChange={(e) => onChange('expiryDate', e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
