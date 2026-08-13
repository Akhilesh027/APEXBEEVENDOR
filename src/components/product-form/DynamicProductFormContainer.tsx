import React, { useState, useEffect } from 'react';
import { DynamicAttributeField, type ISchemaAttribute } from './DynamicAttributeField';
import { VariantBuilder, type IVariantItem } from './VariantBuilder';
import { InventorySection } from './InventorySection';
import { MediaSection } from './MediaSection';
import { DeliverySection } from './DeliverySection';
import { ComplianceSection } from './ComplianceSection';
import { CustomizationSection } from './CustomizationSection';

export interface CategorySchemaData {
  categoryId: string;
  subcategoryId?: string;
  schemaVersion: number;
  productMode: string;
  attributes: ISchemaAttribute[];
  variantAttributes: string[];
  inventoryPolicy: {
    mode: string;
    requiresBatch: boolean;
    requiresExpiry: boolean;
    supportsReservedStock: boolean;
    supportsDamagedStock: boolean;
  };
  customizationPolicy: {
    enabled: boolean;
    requiresCustomerUpload: boolean;
    requiresPreview: boolean;
  };
  deliveryPolicy: {
    homeDelivery: boolean;
    storePickup: boolean;
    sameDay: boolean;
    scheduled: boolean;
    fragile: boolean;
  };
  compliancePolicy: {
    requiredDocuments: string[];
  };
}

interface DynamicProductFormContainerProps {
  schema: CategorySchemaData | null;
  initialValues?: any;
  onSubmit: (formData: any) => Promise<void>;
  isLoading?: boolean;
}

export const DynamicProductFormContainer: React.FC<DynamicProductFormContainerProps> = ({
  schema,
  initialValues,
  onSubmit,
  isLoading = false,
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [sku, setSku] = useState(initialValues?.sku || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [baseMrp, setBaseMrp] = useState<number>(initialValues?.baseMrp || 0);
  const [baseSellingPrice, setBaseSellingPrice] = useState<number>(initialValues?.baseSellingPrice || 0);
  const [stock, setStock] = useState<number>(initialValues?.stock || 10);
  const [batchNumber, setBatchNumber] = useState(initialValues?.batchNumber || '');
  const [expiryDate, setExpiryDate] = useState(initialValues?.expiryDate || '');

  const [attributes, setAttributes] = useState<Record<string, any>>(initialValues?.attributes || {});
  const [variants, setVariants] = useState<IVariantItem[]>(initialValues?.variants || []);
  const [images, setImages] = useState<string[]>(initialValues?.images || []);
  const [thumbnail, setThumbnail] = useState<string>(initialValues?.thumbnail || '');
  const [fssaiNumber, setFssaiNumber] = useState(initialValues?.fssaiNumber || '');
  const [gstNumber, setGstNumber] = useState(initialValues?.gstNumber || '');

  const [deliveryPolicy, setDeliveryPolicy] = useState(
    initialValues?.deliveryPolicy || schema?.deliveryPolicy || { homeDelivery: true, storePickup: true, sameDay: false, scheduled: false, fragile: false }
  );

  const [customizationPolicy, setCustomizationPolicy] = useState(
    initialValues?.customizationPolicy || schema?.customizationPolicy || { enabled: false, requiresCustomerUpload: false, requiresPreview: false }
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (schema) {
      setDeliveryPolicy(schema.deliveryPolicy);
      setCustomizationPolicy(schema.customizationPolicy);
    }
  }, [schema]);

  const handleAttributeChange = (key: string, value: any) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Product name is required';
    if (!sku.trim()) errors.sku = 'SKU is required';
    if (baseMrp <= 0) errors.baseMrp = 'Base MRP must be greater than 0';

    if (schema) {
      schema.attributes.forEach((attr) => {
        if (attr.required && !attr.isDisabled) {
          const val = attributes[attr.key];
          if (val === undefined || val === null || val === '') {
            errors[attr.key] = `${attr.name} is required for this category.`;
          }
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const payload = {
      name,
      sku,
      description,
      baseMrp,
      baseSellingPrice: baseSellingPrice || baseMrp,
      stock,
      batchNumber,
      expiryDate,
      attributes,
      variants,
      images,
      thumbnail,
      fssaiNumber,
      gstNumber,
      deliveryPolicy,
      customizationPolicy,
      productMode: schema?.productMode || 'standard',
    };

    await onSubmit(payload);
  };

  const attributeOptionsMap: Record<string, string[]> = {};
  if (schema) {
    schema.attributes.forEach((attr) => {
      if (attr.options) {
        attributeOptionsMap[attr.key] = attr.options;
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border dark:border-gray-800">
      <div className="flex justify-between items-center border-b pb-4 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Dynamic Add Product Form</h2>
          <p className="text-xs text-gray-500">
            Mode: <span className="font-semibold text-amber-600 uppercase">{schema?.productMode || 'Standard'}</span> | Schema Version: v{schema?.schemaVersion || 1}
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Organic Mysore Sandal Agarbatti"
            required
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          />
          {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            placeholder="e.g. AGAR-SAN-100"
            required
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white uppercase font-mono"
          />
          {fieldErrors.sku && <p className="text-xs text-red-500 mt-1">{fieldErrors.sku}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Product details and ritual significance..."
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Pricing & Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Base MRP (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={baseMrp}
            onChange={(e) => setBaseMrp(Number(e.target.value))}
            min={1}
            required
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          />
          {fieldErrors.baseMrp && <p className="text-xs text-red-500 mt-1">{fieldErrors.baseMrp}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Base Selling Price (₹)</label>
          <input
            type="number"
            value={baseSellingPrice}
            onChange={(e) => setBaseSellingPrice(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Category Dynamic Attributes */}
      {schema && schema.attributes && schema.attributes.length > 0 && (
        <div className="p-4 border dark:border-gray-800 rounded-lg bg-amber-50/40 dark:bg-amber-950/10 space-y-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm border-b pb-2 border-amber-200 dark:border-amber-900">
            Category Specifications ({schema.attributes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schema.attributes.map((attr) => (
              <DynamicAttributeField
                key={attr.key}
                attribute={attr}
                value={attributes[attr.key]}
                onChange={handleAttributeChange}
                error={fieldErrors[attr.key]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Variant Builder */}
      <VariantBuilder
        variantAttributes={schema?.variantAttributes || []}
        attributeOptions={attributeOptionsMap}
        variants={variants}
        onChange={setVariants}
      />

      {/* Inventory & Batch Expiry */}
      <InventorySection
        mode={schema?.inventoryPolicy.mode || 'standard'}
        stock={stock}
        batchNumber={batchNumber}
        expiryDate={expiryDate}
        requiresBatch={schema?.inventoryPolicy.requiresBatch}
        requiresExpiry={schema?.inventoryPolicy.requiresExpiry}
        onChange={(field, val) => {
          if (field === 'stock') setStock(val);
          if (field === 'batchNumber') setBatchNumber(val);
          if (field === 'expiryDate') setExpiryDate(val);
        }}
      />

      {/* Media Section */}
      <MediaSection
        thumbnailPreview={thumbnail}
        imagePreviews={images}
        onThumbnailSelect={(_, preview) => setThumbnail(preview)}
        onImagesSelect={(_, previews) => setImages(previews)}
        onDescriptionChange={() => {}}
        onGenerateAiDetails={() => {}}
      />

      {/* Delivery Rules */}
      <DeliverySection policy={deliveryPolicy} onChange={setDeliveryPolicy} />

      {/* Compliance */}
      <ComplianceSection
        requiredDocuments={schema?.compliancePolicy.requiredDocuments || []}
        fssaiNumber={fssaiNumber}
        gstNumber={gstNumber}
        onChange={(field, val) => {
          if (field === 'fssaiNumber') setFssaiNumber(val);
          if (field === 'gstNumber') setGstNumber(val);
        }}
      />

      {/* Customization Policies */}
      <CustomizationSection
        enabled={customizationPolicy.enabled}
        requiresCustomerUpload={customizationPolicy.requiresCustomerUpload}
        requiresPreview={customizationPolicy.requiresPreview}
        onChange={(field, val) =>
          setCustomizationPolicy((prev: any) => ({ ...prev, [field]: val }))
        }
      />

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 disabled:opacity-50 text-blue-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer transform hover:scale-105"
        >
          {isLoading ? 'Saving Product...' : 'Submit Product for Approval 🚀'}
        </button>
      </div>
    </form>
  );
};
