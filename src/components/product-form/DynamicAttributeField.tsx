import React from 'react';

export interface ISchemaAttribute {
  key: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'textarea';
  unit?: string;
  required: boolean;
  isVariant: boolean;
  options?: string[];
  placeholder?: string;
  isDisabled?: boolean;
}

interface DynamicAttributeFieldProps {
  attribute: ISchemaAttribute;
  value: any;
  onChange: (key: string, value: any) => void;
  error?: string;
}

export const DynamicAttributeField: React.FC<DynamicAttributeFieldProps> = ({
  attribute,
  value,
  onChange,
  error,
}) => {
  if (attribute.isDisabled) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = attribute.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
    onChange(attribute.key, val);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(attribute.key, e.target.checked);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
        {attribute.name} {attribute.unit ? `(${attribute.unit})` : ''}
        {attribute.required && (
          <span className="text-red-500 font-bold text-base ml-1" title="Required Field">*</span>
        )}
        {attribute.isVariant && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full font-semibold">
            Variant Attribute
          </span>
        )}
      </label>

      {attribute.type === 'select' && (
        <select
          value={value ?? ''}
          onChange={handleChange}
          required={attribute.required}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 ${
            error ? 'border-red-500' : ''
          }`}
        >
          <option value="">-- Select {attribute.name} {attribute.required ? '(Required)' : ''} --</option>
          {(attribute.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {attribute.type === 'boolean' && (
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id={`attr_${attribute.key}`}
            checked={Boolean(value)}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
          />
          <label htmlFor={`attr_${attribute.key}`} className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Yes / Enabled
          </label>
        </div>
      )}

      {attribute.type === 'textarea' && (
        <textarea
          value={value ?? ''}
          onChange={handleChange}
          required={attribute.required}
          placeholder={attribute.placeholder || `Enter ${attribute.name} ${attribute.required ? '(Required)' : ''}`}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 ${
            error ? 'border-red-500' : ''
          }`}
        />
      )}

      {(attribute.type === 'text' || attribute.type === 'number') && (
        <input
          type={attribute.type}
          value={value ?? ''}
          onChange={handleChange}
          required={attribute.required}
          placeholder={attribute.placeholder || `Enter ${attribute.name} ${attribute.required ? '(Required)' : ''}`}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 ${
            error ? 'border-red-500' : ''
          }`}
        />
      )}

      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
