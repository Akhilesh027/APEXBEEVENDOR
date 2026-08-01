import React from 'react';

interface ComplianceSectionProps {
  requiredDocuments: string[];
  fssaiNumber?: string;
  gstNumber?: string;
  onChange: (field: string, value: string) => void;
}

export const ComplianceSection: React.FC<ComplianceSectionProps> = ({
  requiredDocuments,
  fssaiNumber,
  gstNumber,
  onChange,
}) => {
  if (!requiredDocuments || requiredDocuments.length === 0) return null;

  return (
    <div className="p-4 border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg space-y-3">
      <h4 className="font-semibold text-amber-900 dark:text-amber-300 text-sm">
        Regulatory & Compliance Requirements
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {requiredDocuments.includes('FSSAI License') && (
          <div>
            <label className="block text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
              FSSAI License Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fssaiNumber || ''}
              onChange={(e) => onChange('fssaiNumber', e.target.value)}
              placeholder="14-digit FSSAI Number"
              required
              className="w-full px-3 py-1.5 text-xs border rounded dark:bg-gray-900 dark:text-white"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
            GST Number (Optional)
          </label>
          <input
            type="text"
            value={gstNumber || ''}
            onChange={(e) => onChange('gstNumber', e.target.value)}
            placeholder="15-digit GSTIN"
            className="w-full px-3 py-1.5 text-xs border rounded dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};
