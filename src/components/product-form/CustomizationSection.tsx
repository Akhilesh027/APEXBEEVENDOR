import React from 'react';

interface CustomizationSectionProps {
  enabled: boolean;
  requiresCustomerUpload: boolean;
  requiresPreview: boolean;
  cuttingPreferences?: string[];
  depositAmount?: number;
  customWeightAllowed?: boolean;
  onChange: (field: string, value: any) => void;
}

export const CustomizationSection: React.FC<CustomizationSectionProps> = ({
  enabled,
  requiresCustomerUpload,
  requiresPreview,
  cuttingPreferences = [],
  depositAmount = 0,
  customWeightAllowed = false,
  onChange,
}) => {
  return (
    <div className="p-4 border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg space-y-4">
      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 text-sm">
        Customization, Cutting & Asset Deposit Configuration
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange('enabled', e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-indigo-900 dark:text-indigo-200">Customer Customization Enabled</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={requiresCustomerUpload}
            onChange={(e) => onChange('requiresCustomerUpload', e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-indigo-900 dark:text-indigo-200">Requires Customer Upload / Instructions</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={customWeightAllowed}
            onChange={(e) => onChange('customWeightAllowed', e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-indigo-900 dark:text-indigo-200">Allow Custom Weight Selection</span>
        </label>
      </div>

      {depositAmount !== undefined && (
        <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-indigo-900 dark:text-indigo-200 font-medium mb-1">
              Returnable Asset Deposit per Unit (₹)
            </label>
            <input
              type="number"
              min={0}
              value={depositAmount}
              onChange={(e) => onChange('depositAmount', Number(e.target.value))}
              placeholder="e.g. 150 for Water Can"
              className="w-full px-3 py-1.5 border rounded dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};
