import React from 'react';

export interface IVariantItem {
  sku: string;
  attributes: Record<string, string>;
  mrp: number;
  sellingPrice: number;
  stock: number;
}

interface VariantBuilderProps {
  variantAttributes: string[];
  attributeOptions: Record<string, string[]>;
  variants: IVariantItem[];
  onChange: (variants: IVariantItem[]) => void;
}

export const VariantBuilder: React.FC<VariantBuilderProps> = ({
  variantAttributes,
  attributeOptions,
  variants,
  onChange,
}) => {
  if (!variantAttributes || variantAttributes.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500">
        No variant attributes defined for this category. Standard single item pricing applies.
      </div>
    );
  }

  const handleAddVariant = () => {
    const defaultAttrs: Record<string, string> = {};
    variantAttributes.forEach((key) => {
      const opts = attributeOptions[key] || [];
      defaultAttrs[key] = opts[0] || '';
    });

    const newVar: IVariantItem = {
      sku: `VAR-${Date.now().toString().slice(-4)}`,
      attributes: defaultAttrs,
      mrp: 100,
      sellingPrice: 90,
      stock: 10,
    };
    onChange([...variants, newVar]);
  };

  const handleRemoveVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const handleVariantFieldChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    if (field.startsWith('attr_')) {
      const attrKey = field.replace('attr_', '');
      updated[index] = {
        ...updated[index],
        attributes: {
          ...updated[index].attributes,
          [attrKey]: value,
        },
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
          Product Variants ({variants.length})
        </h4>
        <button
          type="button"
          onClick={handleAddVariant}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow"
        >
          + Add Variant Combination
        </button>
      </div>

      {variants.map((v, idx) => (
        <div key={idx} className="p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 space-y-3">
          <div className="flex justify-between items-center border-b pb-2 dark:border-gray-700">
            <span className="text-xs font-bold text-gray-500 uppercase">Variant #{idx + 1}</span>
            <button
              type="button"
              onClick={() => handleRemoveVariant(idx)}
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {variantAttributes.map((attrKey) => {
              const opts = attributeOptions[attrKey] || [];
              return (
                <div key={attrKey}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 capitalize mb-1">
                    {attrKey}
                  </label>
                  <select
                    value={v.attributes[attrKey] || ''}
                    onChange={(e) => handleVariantFieldChange(idx, `attr_${attrKey}`, e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border rounded dark:bg-gray-900 dark:text-white"
                  >
                    {opts.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">SKU</label>
              <input
                type="text"
                value={v.sku}
                onChange={(e) => handleVariantFieldChange(idx, 'sku', e.target.value)}
                className="w-full text-xs px-2 py-1.5 border rounded dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">MRP (₹)</label>
              <input
                type="number"
                value={v.mrp}
                onChange={(e) => handleVariantFieldChange(idx, 'mrp', Number(e.target.value))}
                className="w-full text-xs px-2 py-1.5 border rounded dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                value={v.sellingPrice}
                onChange={(e) => handleVariantFieldChange(idx, 'sellingPrice', Number(e.target.value))}
                className="w-full text-xs px-2 py-1.5 border rounded dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stock</label>
              <input
                type="number"
                value={v.stock}
                onChange={(e) => handleVariantFieldChange(idx, 'stock', Number(e.target.value))}
                className="w-full text-xs px-2 py-1.5 border rounded dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
