import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Package,
  Wand2,
  ImageIcon,
  Copy,
  Archive,
  Eye,
  BarChart2,
} from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { compressImage, compressImages } from '../services/imageCompressor';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'https://server.apexbee.in';

const getImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) return `${API_ORIGIN}${url}`;
  return url;
};

const makeSku = (name: string, categoryName?: string) => {
  const p = name
    ? name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()
    : 'PROD';

  const c = categoryName
    ? categoryName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()
    : 'CAT';

  return `${c}-${p}-${Date.now().toString().slice(-5)}`;
};

const getCombinations = (items: any[]) => {
  if (!items.length) return [];

  return items.reduce(
    (acc, item) =>
      acc.flatMap((combo: any) =>
        item.values.map((value: string) => ({
          ...combo,
          [item.name]: value,
        }))
      ),
    [{}]
  );
};

const getCustomerSellingAmount = (product: any) => {
  if (!product?.adminPricing) return Number(product?.baseSellingPrice || 0);

  return (
    Number(product.adminPricing.customerSellingAmount || 0) ||
    Number(product.adminPricing.sellingPrice || 0) +
      Number(product.adminPricing.shippingCharge || 0) +
      Number(product.adminPricing.packingCharge || 0)
  );
};

const MultiSelectOptions = ({ attr, selectedValues, onChange }: any) => {
  const values = selectedValues || [];

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v: string) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {attr.options?.map((option: string) => (
        <button
          type="button"
          key={option}
          onClick={() => toggleValue(option)}
          className={`px-3 py-1.5 rounded-lg text-xs border ${
            values.includes(option)
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [showForm, setShowForm] = useState(false);
  const [showPricingView, setShowPricingView] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Inline editing states
  const [inlineStockId, setInlineStockId] = useState<string | null>(null);
  const [inlineStockVal, setInlineStockVal] = useState<number>(0);
  const [inlinePriceId, setInlinePriceId] = useState<string | null>(null);
  const [inlinePriceVal, setInlinePriceVal] = useState<number>(0);

  // AI & action loading states
  const [aiGenerating, setAiGenerating] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleGenerateAiDescription = async () => {
    if (!form.name) {
      alert("Please provide a product name before generating suggestions.");
      return;
    }
    try {
      setAiGenerating(true);
      const token = localStorage.getItem('token');
      const res = await fetch('https://server.apexbee.in/api/products/ai-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          categoryName: finalSelectedCategory?.name || 'General Product'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, description: data.description }));
      } else {
        alert("Failed to generate AI suggestion copy.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    try {
      setDuplicatingId(id);
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/products/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSuccessMsg("Product successfully cloned!");
        fetchData();
      } else {
        alert("Failed to duplicate product.");
      }
    } catch (err: any) {
      alert("Error duplicating: " + err.message);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleToggleArchiveProduct = async (id: string, currentlyArchived: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/products/${id}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isArchived: !currentlyArchived })
      });
      if (res.ok) {
        setSuccessMsg(currentlyArchived ? "Product restored successfully!" : "Product archived!");
        fetchData();
      } else {
        alert("Failed to toggle archive status.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleSaveStockInline = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: inlineStockVal })
      });
      if (res.ok) {
        setInlineStockId(null);
        fetchData();
      } else {
        alert("Failed to update stock.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSavePriceInline = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://server.apexbee.in/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ baseSellingPrice: inlinePriceVal })
      });
      if (res.ok) {
        setInlinePriceId(null);
        fetchData();
      } else {
        alert("Failed to update price.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    childCategoryId: '',
    brand: '',
    sku: '',
    baseMrp: '',
    discountPercent: '',
    baseSellingPrice: '',
    stock: '',
    sellerType: 'vendor',
    isStoreProduct: false,
    isSubscriptionAvailable: false,
  });

  const [attributeValues, setAttributeValues] = useState<any>({});
  const [variants, setVariants] = useState<any[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'pricing' | 'inventory' | 'seo'>('basic');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const [drillDownProduct, setDrillDownProduct] = useState<any | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat._id === form.categoryId),
    [categories, form.categoryId]
  );

  const subCategories = selectedCategory?.children || [];

  const selectedSubCategory = useMemo(
    () => subCategories.find((cat: any) => cat._id === form.subCategoryId),
    [subCategories, form.subCategoryId]
  );

  const childCategories = selectedSubCategory?.children || [];

  const finalSelectedCategory = useMemo(() => {
    if (form.childCategoryId) {
      return childCategories.find((cat: any) => cat._id === form.childCategoryId);
    }

    if (form.subCategoryId) return selectedSubCategory;

    return selectedCategory;
  }, [
    form.childCategoryId,
    form.subCategoryId,
    selectedCategory,
    selectedSubCategory,
    childCategories,
  ]);

  const categoryAttributes = finalSelectedCategory?.attributes || [];

  const categoryBrands =
    finalSelectedCategory?.brands ||
    selectedSubCategory?.brands ||
    selectedCategory?.brands ||
    [];

  const variantAttributes = categoryAttributes.filter(
    (attr: any) => attr.isVariant && attr.options?.length
  );

  const previewImage =
    thumbnailPreview ||
    getImageUrl(editingProduct?.thumbnail || editingProduct?.images?.[0]) ||
    '';

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [productData, categoryData] = await Promise.all([
        productService.getMyProducts(user.id || user._id),
        categoryService.getDropdown(),
      ]);

      setProducts(productData || []);
      setCategories(categoryData || []);
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to load products'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!editingProduct && form.name && finalSelectedCategory && !form.sku) {
      setForm((prev) => ({
        ...prev,
        sku: makeSku(prev.name, finalSelectedCategory.name),
      }));
    }
  }, [form.name, finalSelectedCategory]);

  useEffect(() => {
    const mrp = Number(form.baseMrp || 0);
    const discount = Number(form.discountPercent || 0);

    if (mrp > 0) {
      const selling = mrp - (mrp * discount) / 100;
      setForm((prev) => ({
        ...prev,
        baseSellingPrice: String(Math.round(selling)),
      }));
    }
  }, [form.baseMrp, form.discountPercent]);

  useEffect(() => {
    if (!finalSelectedCategory) return;

    const initialAttrs: any = {};

    categoryAttributes.forEach((attr: any) => {
      initialAttrs[attr.name] = attr.isVariant ? [] : '';
    });

    setAttributeValues(initialAttrs);

    setForm((prev) => ({
      ...prev,
      brand: categoryBrands?.[0] || '',
      sku: prev.name ? makeSku(prev.name, finalSelectedCategory.name) : prev.sku,
    }));

    setVariants([]);
  }, [finalSelectedCategory?._id]);

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      categoryId: '',
      subCategoryId: '',
      childCategoryId: '',
      brand: '',
      sku: '',
      baseMrp: '',
      discountPercent: '',
      baseSellingPrice: '',
      stock: '',
      sellerType: 'vendor',
      isStoreProduct: false,
      isSubscriptionAvailable: false,
    });

    setAttributeValues({});
    setVariants([]);
    setThumbnail(null);
    setThumbnailPreview('');
    setImages([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);

    setForm({
      name: product.name || '',
      description: product.description || '',
      categoryId: product.categoryId?._id || product.categoryId || '',
      subCategoryId: product.subCategoryId?._id || product.subCategoryId || '',
      childCategoryId: product.childCategoryId?._id || product.childCategoryId || '',
      brand: product.brand || '',
      sku: product.sku || '',
      baseMrp: String(product.baseMrp || ''),
      discountPercent: String(product.discountPercent || ''),
      baseSellingPrice: String(product.baseSellingPrice || ''),
      stock: String(product.stock || ''),
      sellerType: product.sellerType || 'vendor',
      isStoreProduct: !!product.isStoreProduct,
      isSubscriptionAvailable: !!product.isSubscriptionAvailable,
    });

    setAttributeValues(product.attributes || {});
    setVariants(product.variants || []);
    setThumbnailPreview(getImageUrl(product.thumbnail || product.images?.[0]) || '');
    setShowForm(true);
  };

  const generateVariants = () => {
    const variantInputs = variantAttributes
      .map((attr: any) => ({
        name: attr.name,
        values: Array.isArray(attributeValues[attr.name])
          ? attributeValues[attr.name]
          : attributeValues[attr.name]
            ? [attributeValues[attr.name]]
            : [],
      }))
      .filter((item: any) => item.values.length > 0);

    const combos = getCombinations(variantInputs);

    const generated = combos.map((combo: any) => ({
      sku: `${form.sku}-${Object.values(combo)
        .join('-')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()}`,
      attributes: combo,
      mrp: Number(form.baseMrp || 0),
      discountPercent: Number(form.discountPercent || 0),
      sellingPrice: Number(form.baseSellingPrice || 0),
      stock: Number(form.stock || 0),
      images: [],
      isActive: true,
    }));

    setVariants(generated);
  };

  const updateVariant = (index: number, key: string, value: any) => {
    const updated = [...variants];

    updated[index] = {
      ...updated[index],
      [key]:
        key === 'stock' || key === 'mrp' || key === 'sellingPrice' || key === 'discountPercent'
          ? Number(value)
          : value,
    };

    if (key === 'discountPercent' || key === 'mrp') {
      const mrp = Number(updated[index].mrp || 0);
      const discount = Number(updated[index].discountPercent || 0);
      updated[index].sellingPrice = Math.round(mrp - (mrp * discount) / 100);
    }

    setVariants(updated);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const fd = new FormData();

      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('categoryId', form.categoryId);
      fd.append('subCategoryId', form.subCategoryId);
      fd.append('childCategoryId', form.childCategoryId);
      fd.append('brand', form.brand);
      fd.append('sku', form.sku);
      fd.append('baseMrp', form.baseMrp);
      fd.append('discountPercent', form.discountPercent);
      fd.append('baseSellingPrice', form.baseSellingPrice);
      fd.append('stock', form.stock);
      fd.append('sellerType', form.sellerType);
      fd.append('sellerId', user.id || user._id);
      fd.append('isStoreProduct', String(form.isStoreProduct));
      fd.append('isSubscriptionAvailable', String(form.isSubscriptionAvailable));
      fd.append('attributes', JSON.stringify(attributeValues));
      fd.append('variants', JSON.stringify(variants));

      if (thumbnail) fd.append('thumbnail', thumbnail);

      images.forEach((img) => fd.append('images', img));

      if (editingProduct) {
        await productService.update(editingProduct._id, fd);
        setSuccessMsg('Product updated successfully and sent for review');
      } else {
        await productService.create(fd);
        setSuccessMsg('Product added successfully and sent for admin review');
      }

      await fetchData();
      resetForm();

      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to save product'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      setErrorMsg('');
      setSuccessMsg('');

      await productService.delete(id);
      setSuccessMsg('Product deleted successfully');
      await fetchData();

      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to delete product'
      );
    }
  };

  const handleAcceptPricing = async (id: string) => {
    try {
      setSaving(true);
      setErrorMsg('');

      await productService.sellerAcceptPricing(id);
      setSuccessMsg('Pricing accepted. Product is now live.');
      await fetchData();

      setShowPricingView(false);
      setSelectedProduct(null);

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to accept pricing'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleNegotiate = async () => {
    if (!selectedProduct || !negotiationMessage.trim()) return;

    try {
      setSaving(true);
      setErrorMsg('');

      await productService.sellerNegotiatePricing(selectedProduct._id, {
        message: negotiationMessage,
      });

      setSuccessMsg('Negotiation request sent to admin');
      await fetchData();

      setNegotiationMessage('');
      setShowPricingView(false);
      setSelectedProduct(null);

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to send negotiation'
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch =
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.sku?.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === 'All' || product.status === filter;

    return matchSearch && matchFilter;
  });

  const customerSellingAmount = selectedProduct?.adminPricing
    ? getCustomerSellingAmount(selectedProduct)
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Product Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Add products with auto SKU, category attributes, brands, variants and pricing preview.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-bold border border-rose-500/20">
          {errorMsg}
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or SKU..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-xs outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            'All',
            'Pending Review',
            'Awaiting Seller Approval',
            'Live',
            'Negotiation Requested',
            'Rejected',
            'Draft',
          ].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filter === item
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/40 text-muted-foreground">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Seller Price</th>
                <th className="p-3">Admin Pricing</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-secondary/20">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {getImageUrl(product.thumbnail || product.images?.[0]) ? (
                        <img
                          src={getImageUrl(product.thumbnail || product.images?.[0])}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Package size={16} />
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-foreground">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {product.brand || 'No Brand'}
                        </p>
                        {/* Storefront & Subscription Badges */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.isStoreProduct && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-extrabold uppercase tracking-wide">
                              🏪 Local Store
                            </span>
                          )}
                          {product.isSubscriptionAvailable && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-600 text-[9px] font-extrabold uppercase tracking-wide">
                              🔁 Subscription
                            </span>
                          )}
                          {product.status === 'Live' && product.isStoreProduct && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wide">
                              ✅ Visible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 font-mono">{product.sku}</td>

                  <td className="p-3 text-muted-foreground">
                    {[
                      product.categoryId?.name,
                      product.subCategoryId?.name,
                      product.childCategoryId?.name,
                    ]
                      .filter(Boolean)
                      .join(' / ') || '-'}
                  </td>

                  <td className="p-3 font-bold">
                    {inlineStockId === product._id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={inlineStockVal}
                          onChange={(e) => setInlineStockVal(Number(e.target.value))}
                          className="w-16 p-1 border rounded text-xs bg-background text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveStockInline(product._id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setInlineStockId(null)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="group flex items-center gap-1.5 cursor-pointer hover:bg-secondary/40 px-1.5 py-0.5 rounded"
                        onClick={() => {
                          setInlineStockId(product._id);
                          setInlineStockVal(product.stock);
                        }}
                        title="Click to quick-edit stock"
                      >
                        <span>{product.stock}</span>
                        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">✏️</span>
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <div>MRP: ₹{product.baseMrp}</div>
                    {inlinePriceId === product._id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={inlinePriceVal}
                          onChange={(e) => setInlinePriceVal(Number(e.target.value))}
                          className="w-16 p-1 border rounded text-xs bg-background text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => handleSavePriceInline(product._id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setInlinePriceId(null)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="group flex items-center gap-1.5 cursor-pointer hover:bg-secondary/40 px-1.5 py-0.5 rounded mt-0.5"
                        onClick={() => {
                          setInlinePriceId(product._id);
                          setInlinePriceVal(product.baseSellingPrice);
                        }}
                        title="Click to quick-edit price"
                      >
                        <span>Selling: ₹{product.baseSellingPrice}</span>
                        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">✏️</span>
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    {product.adminPricing ? (
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowPricingView(true);
                        }}
                        className="text-primary font-bold underline"
                      >
                        View Pricing
                      </button>
                    ) : (
                      <span className="text-muted-foreground">Not configured</span>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        product.status === 'Live'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : product.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-500'
                            : product.status === 'Awaiting Seller Approval'
                              ? 'bg-indigo-500/10 text-indigo-500'
                              : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {product.status}
                    </span>
                    {product.isArchived && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] font-bold rounded uppercase">
                        Archived
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleDuplicateProduct(product._id)}
                        disabled={duplicatingId === product._id}
                        title="Duplicate Product (SKU changes)"
                        className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-60 cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>

                      <button
                        onClick={() => handleToggleArchiveProduct(product._id, product.isArchived || false)}
                        title={product.isArchived ? "Restore product" : "Soft-archive product"}
                        className={`p-2 rounded-lg ${
                          product.isArchived ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-600'
                        } hover:bg-amber-100/80 cursor-pointer`}
                      >
                        <Archive size={13} />
                      </button>

                      <button
                        onClick={() => {
                          setPreviewProduct(product);
                          setShowPreviewModal(true);
                        }}
                        title="Simulate Mobile App Preview"
                        className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 cursor-pointer border-0"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        onClick={() => setDrillDownProduct(product)}
                        title="Product View & Conversion Analytics Ledger"
                        className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 cursor-pointer border-0"
                      >
                        <BarChart2 size={13} />
                      </button>

                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 rounded-lg bg-secondary text-foreground cursor-pointer"
                      >
                        <Edit size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-500 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {loading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <span className="text-xs font-semibold">
                        Loading products...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-muted-foreground font-medium">
                    No products added yet. Start by clicking "Add Product" above!
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-muted-foreground font-medium">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-card border border-border rounded-2xl max-w-7xl w-full p-4 h-[92vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center border-b border-border pb-3 mb-3">
              <h2 className="text-sm font-bold">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>

              <button onClick={resetForm} className="text-xs text-muted-foreground">
                Cancel
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-bold border border-rose-500/20">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-4 flex-1 overflow-hidden">
              <div className="overflow-y-auto border border-border rounded-2xl p-4 bg-secondary/10">
                <div className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="h-56 bg-secondary flex items-center justify-center">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={form.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex flex-col items-center gap-2 text-xs">
                        <ImageIcon size={28} />
                        Product image preview
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {form.brand || 'Brand'}
                    </p>

                    <h3 className="font-bold text-foreground">
                      {form.name || 'Product Name'}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {form.description ||
                        'Product description preview will appear here.'}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        ₹{form.baseSellingPrice || 0}
                      </span>

                      <span className="text-xs text-muted-foreground line-through">
                        ₹{form.baseMrp || 0}
                      </span>

                      {form.discountPercent && (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-lg font-bold">
                          {form.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="bg-secondary/40 rounded-xl p-2">
                        <p className="text-muted-foreground">SKU</p>
                        <b className="font-mono">{form.sku || '-'}</b>
                      </div>

                      <div className="bg-secondary/40 rounded-xl p-2">
                        <p className="text-muted-foreground">Stock</p>
                        <b>{form.stock || 0}</b>
                      </div>

                      <div className="bg-secondary/40 rounded-xl p-2">
                        <p className="text-muted-foreground">Category</p>
                        <b>{finalSelectedCategory?.name || '-'}</b>
                      </div>

                      <div className="bg-secondary/40 rounded-xl p-2">
                        <p className="text-muted-foreground">Variants</p>
                        <b>{variants.length}</b>
                      </div>
                    </div>
                  </div>
                </div>

                {variants.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-card border border-border p-3">
                    <h3 className="text-xs font-bold mb-2">Variant Preview</h3>
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {variants.map((v) => (
                        <div key={v.sku} className="text-xs border-b border-border pb-2">
                          <p className="font-mono font-bold">{v.sku}</p>
                          <p className="text-muted-foreground">
                            {Object.entries(v.attributes || {})
                              .map(([k, value]) => `${k}: ${value}`)
                              .join(', ')}
                          </p>
                          <p>
                            ₹{v.sellingPrice} · Stock {v.stock}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Product Listing Completeness Progress Card */}
                <div className="mt-4 rounded-2xl bg-card border border-border p-3.5 space-y-2 text-left">
                  <div className="flex justify-between items-center text-xs font-bold text-foreground">
                    <span>Listing Completeness Score</span>
                    <span className="text-primary font-bold">
                      {(() => {
                        let score = 0;
                        if (form.name) score += 20;
                        if (form.sku) score += 15;
                        if (form.baseMrp && form.baseSellingPrice) score += 25;
                        if (thumbnail || images.length > 0) score += 20;
                        if (form.description && form.description.length > 10) score += 20;
                        return score;
                      })()}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${(() => {
                          let score = 0;
                          if (form.name) score += 20;
                          if (form.sku) score += 15;
                          if (form.baseMrp && form.baseSellingPrice) score += 25;
                          if (thumbnail || images.length > 0) score += 20;
                          if (form.description && form.description.length > 10) score += 20;
                          return score;
                        })()}%`
                      }}
                      className="bg-primary h-full transition-all"
                    />
                  </div>
                  <div className="space-y-1 mt-1 text-[10px] text-muted-foreground font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span>{form.name ? '✅' : '❌'}</span> Product Name (+20%)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>{form.sku ? '✅' : '❌'}</span> Unique Auto SKU (+15%)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>{(form.baseMrp && form.baseSellingPrice) ? '✅' : '❌'}</span> Target Pricing Mrp & Sale (+25%)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>{(thumbnail || images.length > 0) ? '✅' : '❌'}</span> Image Gallery Uploaded (+20%)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>{(form.description && form.description.length > 10) ? '✅' : '❌'}</span> Quality Copy & Detail Description (+20%)
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSaveProduct}
                className="space-y-4 overflow-y-auto pr-1 text-xs"
              >
                {/* Form Wizards Tabs Row */}
                <div className="flex border-b border-border/60 pb-1 mb-2 gap-2">
                  {(['basic', 'pricing', 'inventory', 'seo'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveFormTab(tab)}
                      className={`pb-2 px-3 text-xs font-bold capitalize border-b-2 transition-all cursor-pointer border-0 bg-transparent ${
                        activeFormTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab === 'seo' ? 'SEO Checker' : tab === 'basic' ? 'Basic Info' : tab === 'pricing' ? 'Pricing & Media' : 'Inventory & Schedule'}
                    </button>
                  ))}
                </div>

                {activeFormTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border p-4 space-y-3">
                      <h3 className="text-xs font-bold uppercase">1. Basic Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block mb-1 font-semibold text-muted-foreground">
                            Product Name
                          </label>
                          <input
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value, sku: '' })
                            }
                            className="w-full p-3 rounded-xl border bg-background"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-semibold text-muted-foreground">
                            Auto SKU
                          </label>
                          <div className="flex gap-2">
                            <input
                              value={form.sku}
                              readOnly
                              className="w-full p-3 rounded-xl border bg-secondary/30 font-mono"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setForm({
                                  ...form,
                                  sku: makeSku(form.name, finalSelectedCategory?.name),
                                })
                              }
                              className="px-3 rounded-xl bg-primary text-white"
                            >
                              <Wand2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1 font-semibold text-muted-foreground">
                            Seller Type
                          </label>
                          <select
                            value={form.sellerType}
                            onChange={(e) =>
                              setForm({ ...form, sellerType: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border bg-background"
                          >
                            <option value="vendor">Vendor</option>
                            <option value="manufacturer">Manufacturer</option>
                            <option value="wholesaler">Wholesaler</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-4 space-y-3">
                      <h3 className="text-xs font-bold uppercase">2. Category Selection</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block mb-1 font-semibold text-muted-foreground">
                            Category
                          </label>
                          <select
                            value={form.categoryId}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                categoryId: e.target.value,
                                subCategoryId: '',
                                childCategoryId: '',
                              })
                            }
                            className="w-full p-3 rounded-xl border bg-background"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-1 font-semibold text-muted-foreground">
                            Sub Category
                          </label>
                          <select
                            value={form.subCategoryId}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                subCategoryId: e.target.value,
                                childCategoryId: '',
                              })
                            }
                            className="w-full p-3 rounded-xl border bg-background"
                            disabled={!subCategories.length}
                          >
                            <option value="">Select Sub Category</option>
                            {subCategories.map((cat: any) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-1 font-semibold text-muted-foreground">
                            Child Category
                          </label>
                          <select
                            value={form.childCategoryId}
                            onChange={(e) =>
                              setForm({ ...form, childCategoryId: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border bg-background"
                            disabled={!childCategories.length}
                          >
                            <option value="">Select Child Category</option>
                            {childCategories.map((cat: any) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 font-semibold text-muted-foreground">
                          Brand
                        </label>
                        <select
                          value={form.brand}
                          onChange={(e) =>
                            setForm({ ...form, brand: e.target.value })
                          }
                          className="w-full p-3 rounded-xl border bg-background"
                        >
                          <option value="">Select Brand</option>
                          {categoryBrands.map((brand: string) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'pricing' && (
                  <div className="space-y-4">
                    {categoryAttributes.length > 0 && (
                      <div className="rounded-2xl border border-border p-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase">3. Attributes</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryAttributes.map((attr: any) => (
                            <div key={attr._id || attr.name} className="space-y-1">
                              <label className="block font-semibold text-muted-foreground">
                                {attr.name}
                                {attr.isVariant && (
                                  <span className="ml-1 text-primary">
                                    Multiple allowed
                                  </span>
                                )}
                              </label>

                              {attr.type === 'select' && attr.options?.length ? (
                                attr.isVariant ? (
                                  <MultiSelectOptions
                                    attr={attr}
                                    selectedValues={attributeValues[attr.name]}
                                    onChange={(values: string[]) =>
                                      setAttributeValues({
                                        ...attributeValues,
                                        [attr.name]: values,
                                      })
                                    }
                                  />
                                ) : (
                                  <select
                                    value={attributeValues[attr.name] || ''}
                                    onChange={(e) =>
                                      setAttributeValues({
                                        ...attributeValues,
                                        [attr.name]: e.target.value,
                                      })
                                    }
                                    className="w-full p-3 rounded-xl border bg-background"
                                  >
                                    <option value="">Select {attr.name}</option>
                                    {attr.options.map((opt: string) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                )
                              ) : (
                                <input
                                  type={attr.type === 'number' ? 'number' : 'text'}
                                  value={attributeValues[attr.name] || ''}
                                  onChange={(e) =>
                                    setAttributeValues({
                                      ...attributeValues,
                                      [attr.name]: e.target.value,
                                    })
                                  }
                                  className="w-full p-3 rounded-xl border bg-background"
                                  placeholder={`Enter ${attr.name}`}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-2xl border border-border p-4 space-y-3">
                      <h3 className="text-xs font-bold uppercase">4. Seller Pricing</h3>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block mb-1 font-semibold text-muted-foreground">
                            MRP
                          </label>
                          <input
                            type="number"
                            value={form.baseMrp}
                            onChange={(e) =>
                              setForm({ ...form, baseMrp: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border bg-background"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-semibold text-muted-foreground">
                            Discount %
                          </label>
                          <input
                            type="number"
                            value={form.discountPercent}
                            onChange={(e) =>
                              setForm({ ...form, discountPercent: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border bg-background"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-semibold text-muted-foreground">
                            Selling Price
                          </label>
                          <input
                            type="number"
                            value={form.baseSellingPrice}
                            onChange={(e) =>
                              setForm({ ...form, baseSellingPrice: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border bg-secondary/30"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-semibold text-muted-foreground">
                            Stock
                          </label>
                          <input
                            type="number"
                            value={form.stock}
                            onChange={(e) =>
                              setForm({ ...form, stock: e.target.value })
                            }
                            className="w-full p-3 rounded-xl border bg-background"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                      <h3 className="text-xs font-bold uppercase text-primary">5. 🏪 Storefront &amp; Subscription Settings</h3>
                      <p className="text-[11px] text-muted-foreground">Control where this product appears and which delivery modes are available to customers.</p>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className={`flex-1 flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition ${
                          form.isStoreProduct ? 'border-primary bg-primary/10' : 'border-border bg-background'
                        }`}>
                          <input
                            type="checkbox"
                            checked={form.isStoreProduct}
                            onChange={(e) =>
                              setForm({ ...form, isStoreProduct: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div>
                            <span className="text-sm font-bold text-slate-800 block">🏪 Show in Local Store</span>
                            <span className="text-[10px] text-muted-foreground">Customers nearby can see and order this product from your local store page</span>
                          </div>
                        </label>

                        <label className={`flex-1 flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition ${
                          form.isSubscriptionAvailable ? 'border-orange-400 bg-orange-50' : 'border-border bg-background'
                        } ${!form.isStoreProduct ? 'opacity-50 pointer-events-none' : ''}`}>
                          <input
                            type="checkbox"
                            checked={form.isSubscriptionAvailable}
                            disabled={!form.isStoreProduct}
                            onChange={(e) =>
                              setForm({ ...form, isSubscriptionAvailable: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                          />
                          <div>
                            <span className="text-sm font-bold text-slate-800 block">🔁 Enable Subscription</span>
                            <span className="text-[10px] text-muted-foreground">Customers can subscribe for daily/weekly recurring delivery (requires Local Store enabled)</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'inventory' && (
                  <div className="space-y-4">
                    {variantAttributes.length > 0 && (
                      <div className="rounded-2xl border border-border p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-bold uppercase">5. Auto Variants</h3>

                          <button
                            type="button"
                            onClick={generateVariants}
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                          >
                            Generate Variants
                          </button>
                        </div>

                        {variants.length > 0 && (
                          <div className="border rounded-xl overflow-hidden">
                            <table className="w-full text-xs">
                              <thead className="bg-secondary">
                                <tr>
                                  <th className="p-2 text-left">SKU</th>
                                  <th className="p-2 text-left">Attributes</th>
                                  <th className="p-2">MRP</th>
                                  <th className="p-2">Discount %</th>
                                  <th className="p-2">Selling</th>
                                  <th className="p-2">Stock</th>
                                </tr>
                              </thead>

                              <tbody>
                                {variants.map((variant, index) => (
                                  <tr key={variant.sku} className="border-t">
                                    <td className="p-2 font-mono">{variant.sku}</td>

                                    <td className="p-2">
                                      {Object.entries(variant.attributes)
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join(', ')}
                                    </td>

                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        value={variant.mrp}
                                        onChange={(e) =>
                                          updateVariant(index, 'mrp', e.target.value)
                                        }
                                        className="w-24 p-1 border rounded text-center bg-background"
                                      />
                                    </td>

                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        value={variant.discountPercent || 0}
                                        onChange={(e) =>
                                          updateVariant(index, 'discountPercent', e.target.value)
                                        }
                                        className="w-20 p-1 border rounded text-center bg-background"
                                      />
                                    </td>

                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        value={variant.sellingPrice}
                                        onChange={(e) =>
                                          updateVariant(
                                            index,
                                            'sellingPrice',
                                            e.target.value
                                          )
                                        }
                                        className="w-24 p-1 border rounded text-center bg-background"
                                      />
                                    </td>

                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        value={variant.stock}
                                        onChange={(e) =>
                                          updateVariant(index, 'stock', e.target.value)
                                        }
                                        className="w-20 p-1 border rounded text-center bg-background"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="rounded-2xl border border-border p-4 space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xs font-bold uppercase">6. Media & Description</h3>
                        <button
                          type="button"
                          disabled={aiGenerating}
                          onClick={handleGenerateAiDescription}
                          className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition"
                        >
                          {aiGenerating ? '🤖 Generating copy...' : '🤖 AI Generate Copy'}
                        </button>
                      </div>

                      <textarea
                        placeholder="Provide details about product features, batch numbers, or manufacturing/expiry specs..."
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border bg-background"
                        rows={3}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block mb-1 text-muted-foreground">
                            Thumbnail
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0] || null;
                              if (file) {
                                try {
                                  const compressed = await compressImage(file, { maxSizeKB: 2048, maxDimension: 1920, quality: 0.82 });
                                  setThumbnail(compressed);
                                  setThumbnailPreview(URL.createObjectURL(compressed));
                                } catch {
                                  setThumbnail(file);
                                  setThumbnailPreview(URL.createObjectURL(file));
                                }
                              } else {
                                setThumbnail(null);
                                setThumbnailPreview('');
                              }
                            }}
                            className="w-full p-3 rounded-xl border bg-background"
                          />
                          <p className="text-[9px] text-muted-foreground mt-1">Large images are auto-compressed for faster upload (max 25MB)</p>
                        </div>

                        <div>
                          <label className="block mb-1 text-muted-foreground">
                            Gallery Images
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                try {
                                  const compressed = await compressImages(files, { maxSizeKB: 2048, maxDimension: 1920, quality: 0.82 });
                                  setImages(compressed);
                                } catch {
                                  setImages(files);
                                }
                              } else {
                                setImages([]);
                              }
                            }}
                            className="w-full p-3 rounded-xl border bg-background"
                          />
                          <p className="text-[9px] text-muted-foreground mt-1">Upload up to 10 images. High-res photos auto-compressed.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'seo' && (
                  <div className="rounded-2xl border border-border p-4 space-y-3 bg-card text-left">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-primary">SEO Best Practices Checklist</h3>
                    <p className="text-[11px] text-muted-foreground">Keep your metadata optimized to ensure high search ranking on the customer web platform.</p>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{form.name && form.name.length < 60 ? '✅' : '⚠️'}</span>
                        <span>Title is less than 60 characters: {form.name ? `(${form.name.length} chars)` : 'Empty'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>{form.description && form.description.length > 50 ? '✅' : '❌'}</span>
                        <span>Description is more than 50 characters: {form.description ? `(${form.description.length} chars)` : 'Empty'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>{form.brand ? '✅' : '❌'}</span>
                        <span>Branding tag defined: {form.brand || 'Missing'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  {activeFormTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeFormTab === 'pricing') setActiveFormTab('basic');
                        else if (activeFormTab === 'inventory') setActiveFormTab('pricing');
                        else if (activeFormTab === 'seo') setActiveFormTab('inventory');
                      }}
                      className="px-4 py-3 rounded-xl bg-secondary text-foreground font-bold border border-border cursor-pointer flex items-center justify-center"
                    >
                      Back
                    </button>
                  )}

                  {activeFormTab !== 'seo' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeFormTab === 'basic') setActiveFormTab('pricing');
                        else if (activeFormTab === 'pricing') setActiveFormTab('inventory');
                        else if (activeFormTab === 'inventory') setActiveFormTab('seo');
                      }}
                      className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Next Step →
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className={`py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-60 flex items-center justify-center gap-2 ${
                      activeFormTab === 'seo' ? 'flex-1' : 'px-6 bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {saving && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {saving
                      ? 'Saving...'
                      : editingProduct
                        ? 'Update Product'
                        : 'Submit for Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPricingView && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-4xl w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-bold">Admin Pricing Review</h2>
              <button
                onClick={() => setShowPricingView(false)}
                className="text-xs text-muted-foreground"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-4">
              <div className="rounded-2xl border border-border overflow-hidden bg-card">
                <div className="h-60 bg-secondary flex items-center justify-center">
                  {getImageUrl(selectedProduct.thumbnail || selectedProduct.images?.[0]) ? (
                    <img
                      src={getImageUrl(selectedProduct.thumbnail || selectedProduct.images?.[0])}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={34} className="text-muted-foreground" />
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {selectedProduct.brand || 'Brand'}
                  </p>

                  <h3 className="font-bold text-sm">{selectedProduct.name}</h3>

                  <p className="text-xs text-muted-foreground">
                    SKU: {selectedProduct.sku}
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xl font-bold text-foreground">
                      ₹
                      {selectedProduct.adminPricing?.sellingPrice ||
                        selectedProduct.baseSellingPrice ||
                        0}
                    </span>

                    <span className="text-xs line-through text-muted-foreground">
                      ₹
                      {selectedProduct.adminPricing?.mrp ||
                        selectedProduct.baseMrp ||
                        0}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="p-2 rounded-xl bg-secondary/40">
                      <p className="text-muted-foreground">Platform Fee</p>
                      <b>
                        ₹{selectedProduct.adminPricing?.platformFeeAmount || 0}
                      </b>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-500/10">
                      <p className="text-muted-foreground">Seller Gets</p>
                      <b className="text-emerald-600">
                        ₹{selectedProduct.adminPricing?.finalSellerAmount || 0}
                      </b>
                    </div>

                    <div className="p-2 rounded-xl bg-secondary/40">
                      <p className="text-muted-foreground">Shipping</p>
                      <b>
                        ₹{selectedProduct.adminPricing?.shippingCharge || 0}
                      </b>
                    </div>

                    <div className="p-2 rounded-xl bg-secondary/40">
                      <p className="text-muted-foreground">Packing</p>
                      <b>₹{selectedProduct.adminPricing?.packingCharge || 0}</b>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <p>MRP</p>
                <b>₹{selectedProduct.adminPricing?.mrp}</b>

                <p>Selling Price Before Platform Fee</p>
                <b>₹{selectedProduct.adminPricing?.sellingPrice}</b>

                <p>Platform Fee</p>
                <b>
                  ₹{selectedProduct.adminPricing?.platformFeeAmount} (
                  {selectedProduct.adminPricing?.platformFeePercent}%)
                </b>

                <p>Seller Amount</p>
                <b className="text-emerald-500">
                  ₹{selectedProduct.adminPricing?.finalSellerAmount}
                </b>

                <p>Customer Selling Amount</p>
                <b>₹{customerSellingAmount}</b>

                <p>Shipping</p>
                <b>₹{selectedProduct.adminPricing?.shippingCharge}</b>

                <p>Packing</p>
                <b>₹{selectedProduct.adminPricing?.packingCharge}</b>
              </div>
            </div>

            {selectedProduct.status === 'Awaiting Seller Approval' && (
              <>
                <textarea
                  placeholder="Negotiation message if you want changes..."
                  value={negotiationMessage}
                  onChange={(e) => setNegotiationMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-background text-xs"
                  rows={3}
                />

                <div className="flex gap-3">
                  <button
                    disabled={saving}
                    onClick={() => handleAcceptPricing(selectedProduct._id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold flex justify-center items-center gap-2 disabled:opacity-60"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check size={15} />
                    )}
                    Accept & Go Live
                  </button>

                  <button
                    disabled={saving}
                    onClick={handleNegotiate}
                    className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold flex justify-center items-center gap-2 disabled:opacity-60"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <X size={15} />
                    )}
                    Negotiate
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showPreviewModal && previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-3xl max-w-sm w-full overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Simulated Mobile Device Header */}
            <div className="bg-secondary/40 px-5 py-3 border-b border-border flex justify-between items-center text-xs">
              <span className="font-extrabold text-muted-foreground select-none">📱 Customer App View</span>
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewProduct(null);
                }}
                className="text-muted-foreground hover:text-foreground font-bold border-0 bg-transparent cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Product Photo Slider */}
            <div className="relative h-64 bg-secondary flex items-center justify-center">
              {getImageUrl(previewProduct.thumbnail || previewProduct.images?.[0]) ? (
                <img
                  src={getImageUrl(previewProduct.thumbnail || previewProduct.images?.[0])}
                  alt={previewProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={48} className="text-muted-foreground" />
              )}
              <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full select-none">
                1 of {previewProduct.images?.length || 1}
              </span>
            </div>

            {/* Details Panel */}
            <div className="p-5 flex-1 flex flex-col gap-3 text-left">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">{previewProduct.brand || 'Apexbee Brand'}</span>
                <h3 className="font-extrabold text-base text-foreground mt-0.5 leading-snug">{previewProduct.name}</h3>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-foreground">₹{previewProduct.baseSellingPrice}</span>
                {previewProduct.baseMrp > previewProduct.baseSellingPrice && (
                  <>
                    <span className="text-xs text-muted-foreground line-through">₹{previewProduct.baseMrp}</span>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                      {previewProduct.discountPercent || Math.round(((previewProduct.baseMrp - previewProduct.baseSellingPrice) / previewProduct.baseMrp) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium line-clamp-3">
                {previewProduct.description || 'No description provided.'}
              </p>

              <div className="border-t border-border/60 pt-3 mt-1 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Delivery:</span>
                  <span className="font-bold text-foreground">Next Day (Within 24 hours)</span>
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs shadow-md shadow-primary/20 opacity-90"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {drillDownProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-background border-l border-border h-full max-w-md w-full p-6 flex flex-col gap-6 shadow-2xl text-left animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                📊 Product Insights Ledger
              </h3>
              <button
                type="button"
                onClick={() => setDrillDownProduct(null)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer font-bold border-0 bg-transparent"
              >
                Close Drawer
              </button>
            </div>

            {/* Product overview card inside drawer */}
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/40 text-xs">
              <div className="h-12 w-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0 flex items-center justify-center">
                {getImageUrl(drillDownProduct.thumbnail || drillDownProduct.images?.[0]) ? (
                  <img src={getImageUrl(drillDownProduct.thumbnail || drillDownProduct.images?.[0])} alt="thumbnail" className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground">{drillDownProduct.name}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">SKU: {drillDownProduct.sku} • Stock: {drillDownProduct.stock}</span>
              </div>
            </div>

            {/* Analytics Stat Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-border/60 p-3 rounded-xl bg-card">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Page Views (30d)</span>
                <div className="text-lg font-black text-foreground mt-1">1,248</div>
                <span className="text-[9px] text-emerald-500 font-bold">📈 +14.2% MoM</span>
              </div>
              <div className="border border-border/60 p-3 rounded-xl bg-card">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Conversion Rate</span>
                <div className="text-lg font-black text-foreground mt-1">3.4%</div>
                <span className="text-[9px] text-muted-foreground font-bold">Industry Avg: 2.5%</span>
              </div>
              <div className="border border-border/60 p-3 rounded-xl bg-card col-span-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase block">Estimated Sales Revenue Contribution</span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-lg font-black text-foreground">₹24,850</span>
                  <span className="text-[10px] text-primary font-bold">14 Payout Settled</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-primary h-full w-[45%]" />
                </div>
              </div>
            </div>

            {/* Sales Ledger timeline mockup */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden text-xs">
              <span className="font-bold text-foreground block">Recent Customer Orders Log</span>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 border border-border/40 bg-muted/10 rounded-xl p-3">
                {[
                  { id: 'ORD-89421', date: 'Today, 11:24 AM', qty: 2, amount: drillDownProduct.baseSellingPrice * 2 },
                  { id: 'ORD-89240', date: 'Yesterday, 04:12 PM', qty: 1, amount: drillDownProduct.baseSellingPrice },
                  { id: 'ORD-88915', date: '11 Jul 2026', qty: 3, amount: drillDownProduct.baseSellingPrice * 3 },
                  { id: 'ORD-88402', date: '08 Jul 2026', qty: 1, amount: drillDownProduct.baseSellingPrice },
                ].map((ord, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] pb-2 border-b border-border/40 last:border-0 last:pb-0">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-foreground">{ord.id}</span>
                      <span className="text-[9px] text-muted-foreground">{ord.date}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-foreground">₹{ord.amount}</span>
                      <span className="text-[9px] text-muted-foreground">Qty: {ord.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
