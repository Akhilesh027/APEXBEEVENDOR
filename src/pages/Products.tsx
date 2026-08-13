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
} from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { useVendor } from '../context/VendorContext';
import { MediaSection } from '../components/product-form/MediaSection';
import { DeliverySection } from '../components/product-form/DeliverySection';

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
    <div className="flex flex-wrap gap-2.5 pt-1">
      {attr.options?.map((option: string) => {
        const isSelected = values.includes(option);
        return (
          <button
            type="button"
            key={option}
            onClick={() => toggleValue(option)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer shadow-sm ${isSelected
              ? 'bg-primary text-primary-foreground border-primary scale-105 shadow-md ring-2 ring-primary/40'
              : 'bg-card text-foreground border-border hover:border-primary/60 hover:bg-secondary/40'
              }`}
          >
            {isSelected ? '✓ ' : '+ '}{option}
          </button>
        );
      })}
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
  const [formStep, setFormStep] = useState<number>(1);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
    isStoreProduct: true,
    isSubscriptionAvailable: false,
    isSelfPickup: true,
    deliveryScope: 'both',
    isLocalDelivery: true,
    isPanIndia: true,
    minimumOrderQuantity: '1',
  });

  const [attributeValues, setAttributeValues] = useState<any>({});
  const [variants, setVariants] = useState<any[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [negotiationMessage, setNegotiationMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { profile, currentPage, setCurrentPage } = useVendor();

  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (currentPage === 'add-product' || currentPage === 'products-add') {
      setShowForm(true);
    }
  }, [currentPage]);

  const handleGenerateAiDetails = async () => {
    try {
      setAiLoading(true);
      setErrorMsg('');
      const res = await productService.generateAiDetails({
        name: form.name,
        categoryId: form.categoryId,
        categoryName: selectedCategory?.name,
        subCategoryName: selectedSubCategory?.name
      });
      if (res?.success && res.data) {
        const newTitle = res.data.title || form.name;
        const newDesc = res.data.description || form.description;
        const newSku = makeSku(newTitle, selectedCategory?.name);
        setForm(prev => ({
          ...prev,
          name: newTitle,
          description: newDesc,
          sku: newSku
        }));
        setSuccessMsg('✨ AI Product Title & Description generated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      console.error("AI generation failed:", err);
      setErrorMsg('Failed to generate AI content. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-select category based on Vendor's business category
  useEffect(() => {
    if (categories.length > 0 && profile && !form.categoryId && !editingProduct) {
      const vendorCatName = (profile.primaryCategory || profile.category || '').trim().toLowerCase();
      if (vendorCatName) {
        const matched = categories.find((cat) => {
          const cName = cat.name.trim().toLowerCase();
          return cName === vendorCatName || vendorCatName.includes(cName) || cName.includes(vendorCatName);
        });
        if (matched) {
          setForm((prev) => ({ ...prev, categoryId: matched._id }));
        } else if (categories.length > 0) {
          setForm((prev) => ({ ...prev, categoryId: categories[0]._id }));
        }
      } else if (categories.length > 0) {
        setForm((prev) => ({ ...prev, categoryId: categories[0]._id }));
      }
    }
  }, [categories, profile, editingProduct, form.categoryId]);

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat._id === form.categoryId),
    [categories, form.categoryId]
  );

  const vendorApprovedSubs = useMemo(() => {
    if (!profile) return [];
    const rawList = Array.isArray(profile.approvedSubcategories) && profile.approvedSubcategories.length > 0
      ? profile.approvedSubcategories
      : Array.isArray(profile.subCategories) && profile.subCategories.length > 0
        ? profile.subCategories
        : profile.subCategory
          ? [profile.subCategory]
          : [];
    return rawList.map((s: string) => String(s).trim().toLowerCase()).filter(Boolean);
  }, [profile]);

  const rawSubCategories = selectedCategory?.children || [];

  const subCategories = useMemo(() => {
    if (!vendorApprovedSubs.length) return rawSubCategories;
    const filtered = rawSubCategories.filter((sub: any) => {
      const sName = String(sub.name || '').trim().toLowerCase();
      return vendorApprovedSubs.some(approved =>
        approved === sName || sName.includes(approved) || approved.includes(sName)
      );
    });
    return filtered.length > 0 ? filtered : rawSubCategories;
  }, [rawSubCategories, vendorApprovedSubs]);

  // Auto-select subcategory when subCategories list updates
  useEffect(() => {
    if (subCategories.length > 0 && !form.subCategoryId && !editingProduct) {
      if (subCategories.length === 1) {
        setForm((prev) => ({ ...prev, subCategoryId: subCategories[0]._id }));
      } else if (vendorApprovedSubs.length > 0) {
        const matchedSub = subCategories.find((sub: any) => {
          const sName = String(sub.name || '').trim().toLowerCase();
          return vendorApprovedSubs.some(approved => approved === sName || sName.includes(approved) || approved.includes(sName));
        });
        if (matchedSub) {
          setForm((prev) => ({ ...prev, subCategoryId: matchedSub._id }));
        }
      }
    }
  }, [subCategories, form.subCategoryId, editingProduct, vendorApprovedSubs]);

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

  const [loadedAttributes, setLoadedAttributes] = useState<any[]>([]);

  useEffect(() => {
    if (!finalSelectedCategory?._id) {
      setLoadedAttributes([]);
      return;
    }

    if (finalSelectedCategory.attributes && finalSelectedCategory.attributes.length > 0) {
      setLoadedAttributes(finalSelectedCategory.attributes);
      return;
    }

    let isMounted = true;
    categoryService.getMergedAttributes(finalSelectedCategory._id)
      .then((attrs) => {
        if (isMounted && attrs && attrs.length > 0) {
          setLoadedAttributes(attrs);
        }
      })
      .catch((err) => console.warn('Failed to load merged attributes:', err));

    return () => { isMounted = false; };
  }, [finalSelectedCategory?._id]);

  const categoryAttributes = loadedAttributes.length > 0
    ? loadedAttributes
    : (finalSelectedCategory?.attributes || []);

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
      isStoreProduct: true,
      isSubscriptionAvailable: false,
      isSelfPickup: true,
      deliveryScope: 'both',
      isLocalDelivery: true,
      isPanIndia: true,
      minimumOrderQuantity: '1',
    });

    setAttributeValues({});
    setVariants([]);
    setThumbnail(null);
    setThumbnailPreview('');
    setImages([]);
    setEditingProduct(null);
    setShowForm(false);
    setFormStep(1);
    if (currentPage === 'add-product' || currentPage === 'products-add') {
      setCurrentPage('products');
    }
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
      isSelfPickup: product.isSelfPickup !== false,
      deliveryScope: product.deliveryScope || (product.isPanIndia ? (product.isLocalDelivery !== false ? 'both' : 'pan_india') : 'local'),
      isLocalDelivery: product.isLocalDelivery !== undefined ? !!product.isLocalDelivery : (product.deliveryScope === 'local' || product.deliveryScope === 'both' || !product.deliveryScope),
      isPanIndia: product.isPanIndia !== undefined ? !!product.isPanIndia : (product.deliveryScope === 'pan_india' || product.deliveryScope === 'both'),
      minimumOrderQuantity: String(product.minimumOrderQuantity ?? product.moq ?? product.wholesaleRules?.minOrderQty ?? 1),
    });

    setAttributeValues(product.attributes || {});
    setVariants(product.variants || []);
    setThumbnailPreview(getImageUrl(product.thumbnail || product.images?.[0]) || '');
    setShowForm(true);
  };

  const generateVariants = () => {
    const activeKeys = Object.keys(attributeValues).filter(
      k => attributeValues[k] && (Array.isArray(attributeValues[k]) ? attributeValues[k].length > 0 : String(attributeValues[k]).trim() !== '')
    );

    const variantInputs = activeKeys.map((key) => ({
      name: key,
      values: Array.isArray(attributeValues[key])
        ? attributeValues[key]
        : [attributeValues[key]],
    })).filter((item: any) => item.values.length > 0);

    if (variantInputs.length === 0) {
      const baseSku = form.sku || makeSku(form.name, selectedCategory?.name);
      const defaultVariant = {
        sku: `${baseSku}-V1`,
        attributes: { Size: 'Standard' },
        mrp: Number(form.baseMrp || 0),
        discountPercent: Number(form.discountPercent || 0),
        sellingPrice: Number(form.baseSellingPrice || 0),
        stock: Number(form.stock || 0),
        images: [],
        isActive: true,
      };
      setVariants([defaultVariant]);
      return;
    }

    const combos = getCombinations(variantInputs);
    const baseSku = form.sku || makeSku(form.name, selectedCategory?.name);

    const generated = combos.map((combo: any, idx: number) => ({
      sku: `${baseSku}-${Object.values(combo)
        .join('-')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase() || `V${idx + 1}`}`,
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

  const addManualVariant = () => {
    const baseSku = form.sku || makeSku(form.name || 'ITEM', selectedCategory?.name);
    const newVariant = {
      sku: `${baseSku}-V${variants.length + 1}`,
      attributes: { Option: `Variant ${variants.length + 1}` },
      mrp: Number(form.baseMrp || 0),
      discountPercent: Number(form.discountPercent || 0),
      sellingPrice: Number(form.baseSellingPrice || 0),
      stock: Number(form.stock || 0),
      images: [],
      isActive: true,
    };
    setVariants(prev => [...prev, newVariant]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
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

  const handleSaveProduct = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();

    if (!form.name.trim()) {
      setErrorMsg('Please enter a valid Product Name in Step 1.');
      setFormStep(1);
      return;
    }
    if (!form.categoryId) {
      setErrorMsg('Please select a Main Category in Step 1.');
      setFormStep(1);
      return;
    }
    if (!form.baseMrp || Number(form.baseMrp) <= 0) {
      setErrorMsg('Please enter a valid Base MRP (₹) in Step 2.');
      setFormStep(2);
      return;
    }
    if (!form.baseSellingPrice || Number(form.baseSellingPrice) <= 0) {
      setErrorMsg('Please enter a valid Selling Price (₹) in Step 2.');
      setFormStep(2);
      return;
    }

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
      fd.append('isSelfPickup', String(form.isSelfPickup));
      const calculatedScope = form.isLocalDelivery && form.isPanIndia ? 'both' : form.isPanIndia ? 'pan_india' : 'local';
      fd.append('deliveryScope', calculatedScope);
      fd.append('isLocalDelivery', String(form.isLocalDelivery));
      fd.append('isPanIndia', String(form.isPanIndia));
      fd.append('minimumOrderQuantity', String(Number(form.minimumOrderQuantity) || 1));
      fd.append('moq', String(Number(form.minimumOrderQuantity) || 1));
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

  const [subFilter, setSubFilter] = useState('All Pending');

  const filteredProducts = products.filter((product) => {
    const matchSearch =
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.sku?.toLowerCase().includes(search.toLowerCase());

    let matchFilter = false;
    if (filter === 'All') {
      matchFilter = true;
    } else if (filter === 'Live') {
      matchFilter = product.status === 'Live' || product.status === 'Approved';
    } else if (filter === 'Pending Action') {
      if (subFilter === 'All Pending') {
        matchFilter = ['Pending Review', 'Awaiting Seller Approval', 'Negotiation Requested'].includes(product.status);
      } else {
        matchFilter = product.status === subFilter;
      }
    } else if (filter === 'Drafts') {
      matchFilter = product.status === 'Draft' || product.status === 'Rejected';
    } else {
      matchFilter = product.status === filter;
    }

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
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer transform hover:scale-105"
        >
          <Plus size={18} className="stroke-[3]" />
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

      <div className="bg-slate-900/90 shadow-xl rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center border-none text-left">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-blue-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 text-white text-xs outline-none focus:ring-2 focus:ring-amber-400 font-bold border-none shadow-inner"
          />
        </div>

        {/* 4 Core Tabs + Sub-Status Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="p-1.5 bg-slate-950/80 rounded-2xl shadow-inner flex flex-wrap gap-2 text-left w-full md:w-auto">
            {[
              { id: 'All', label: 'All Products' },
              { id: 'Live', label: 'Live' },
              { id: 'Pending Action', label: 'Pending Action ⏳' },
              { id: 'Drafts', label: 'Drafts' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id);
                  if (tab.id === 'Pending Action') setSubFilter('All Pending');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-none ${filter === tab.id
                  ? 'bg-amber-400 text-blue-950 shadow-md scale-[1.02]'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filter === 'Pending Action' && (
            <select
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 text-amber-300 font-black text-xs border-none shadow-md focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="All Pending">All Pending Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Awaiting Seller Approval">Awaiting Seller Approval</option>
              <option value="Negotiation Requested">Negotiation Requested</option>
            </select>
          )}
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

                  <td className="p-3 font-bold">{product.stock}</td>

                  <td className="p-3">
                    <div>MRP: ₹{product.baseMrp}</div>
                    <div>Selling: ₹{product.baseSellingPrice}</div>
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
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${product.status === 'Live'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : product.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-500'
                          : product.status === 'Vendor Edited' || product.status === 'Updated - Pending Approval'
                            ? 'bg-purple-500/10 text-purple-600'
                            : product.status === 'Awaiting Seller Approval'
                              ? 'bg-indigo-500/10 text-indigo-500'
                              : 'bg-amber-500/10 text-amber-500'
                        }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 rounded-lg bg-secondary text-foreground"
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-500"
                      >
                        <Trash2 size={14} />
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
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-3 md:p-6">
          <div className="bg-slate-900 text-slate-100 rounded-3xl border-none w-[96vw] max-w-[1550px] p-6 h-[94vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 gap-4 bg-slate-950/50 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-black text-xl shadow-md">
                  📦
                </div>
                <div>
                  <h2 className="text-lg font-extrabold font-heading text-white flex items-center gap-2">
                    {editingProduct ? 'Edit Store Item' : 'Create & List New Product'}
                  </h2>
                  <p className="text-xs text-blue-300">Complete 3 easy steps to publish your product to local customers.</p>
                </div>
              </div>

              {/* 🚀 Step Wizard Navigation Tabs */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${formStep === 1
                    ? 'bg-amber-400 text-blue-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                >
                  1. Title & Categories
                </button>
                <button
                  type="button"
                  onClick={() => setFormStep(2)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${formStep === 2
                    ? 'bg-amber-400 text-blue-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                >
                  2. Pricing & Attributes
                </button>
                <button
                  type="button"
                  onClick={() => setFormStep(3)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${formStep === 3
                    ? 'bg-amber-400 text-blue-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                >
                  3. Media & Delivery
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-extrabold px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shadow-sm"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-4 rounded-2xl bg-rose-500/15 text-rose-300 text-xs font-extrabold flex items-center gap-2 shadow-md">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-6 flex-1 overflow-hidden">
              {/* Left Column: Live Customer Mobile App Preview */}
              <div className="overflow-y-auto rounded-2xl p-4 bg-slate-950/80 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    📱 Live Customer App Preview
                  </span>
                  <span className="text-[10px] text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded-full font-semibold">
                    Step {formStep} of 3
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-blue-800/40 overflow-hidden shadow-xl">
                  <div className="h-56 bg-slate-950 flex items-center justify-center relative overflow-hidden group">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={form.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-2 text-xs">
                        <ImageIcon size={36} className="text-blue-400" />
                        <span className="font-semibold text-slate-300">Upload Thumbnail Photo</span>
                        <span className="text-[10px] text-slate-500">Preview will appear live here</span>
                      </div>
                    )}
                    {form.discountPercent && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-blue-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow-md">
                        {form.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <span className="text-[10px] uppercase tracking-widest font-black text-amber-400">
                      {form.brand || 'Local Brand'}
                    </span>

                    <h3 className="font-extrabold text-base text-white line-clamp-2">
                      {form.name || 'Sample Product Title'}
                    </h3>

                    <p className="text-xs text-blue-200 line-clamp-2">
                      {form.description || 'Add product description to inform local customers about quality, weight, or usage.'}
                    </p>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-2xl font-black text-white font-heading">
                        ₹{form.baseSellingPrice || 0}
                      </span>
                      {Number(form.baseMrp) > Number(form.baseSellingPrice) && (
                        <span className="text-xs text-slate-400 line-through">
                          MRP ₹{form.baseMrp}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-800">
                      <div className="bg-slate-950/80 rounded-xl p-2.5">
                        <p className="text-[10px] uppercase text-blue-300 font-bold">SKU Code</p>
                        <b className="font-mono text-white text-xs">{form.sku || 'APEX-SKU-PENDING'}</b>
                      </div>

                      <div className="bg-slate-950/80 rounded-xl p-2.5">
                        <p className="text-[10px] uppercase text-blue-300 font-bold">In Stock</p>
                        <b className="text-emerald-400 text-xs">{form.stock || 0} units</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="space-y-6 overflow-y-auto pr-2 text-sm flex flex-col justify-between"
              >
                {/* 📌 STEP 1: TITLE & CATEGORY SELECTION */}
                {formStep === 1 && (
                  <div className="space-y-5">
                    {/* Basic Details */}
                    <div className="rounded-2xl border-none bg-slate-950/80 p-5 space-y-4 shadow-xl">
                      <h3 className="text-sm font-extrabold font-heading uppercase tracking-wider text-amber-400 pb-2.5 flex items-center gap-2">
                        <span>📝</span> Step 1: Product Name & SKU
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-extrabold text-white">
                              Product Name <span className="text-amber-400">*</span>
                            </label>
                            {/* Icon-Only AI Title Enhancer */}
                            <button
                              type="button"
                              onClick={handleGenerateAiDetails}
                              disabled={aiLoading}
                              title="✨ Generate AI Enhanced Product Title"
                              className="h-7 w-7 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black hover:bg-amber-500 transition-all cursor-pointer shadow-md shrink-0"
                            >
                              <Wand2 className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                          <input
                            value={form.name}
                            placeholder="e.g. Fresh Organic Sunflower Oil 1L"
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value, sku: '' })
                            }
                            className="w-full p-3 text-sm font-medium rounded-xl border border-blue-900/60 bg-slate-900 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-400/40 outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-1.5 text-xs font-extrabold text-white">
                            Auto SKU Identifier
                          </label>
                          <div className="flex gap-2">
                            <input
                              value={form.sku}
                              readOnly
                              className="w-full p-3 text-sm rounded-xl border border-blue-900/60 bg-slate-900/60 font-mono text-amber-300 font-bold"
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
                              className="px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-blue-950 font-black transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md"
                              title="Generate SKU"
                            >
                              <Wand2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1.5 text-xs font-extrabold text-white">
                            Seller Role / Type
                          </label>
                          <select
                            value={form.sellerType}
                            onChange={(e) =>
                              setForm({ ...form, sellerType: e.target.value })
                            }
                            className="w-full p-3 text-sm font-semibold rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/40 outline-none"
                          >
                            <option value="vendor">Vendor (Retail Seller)</option>
                            <option value="manufacturer">Manufacturer (Brand Owner)</option>
                            <option value="wholesaler">Wholesaler (Bulk Supplier)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="rounded-2xl border border-blue-900/60 bg-slate-950/80 p-5 space-y-4 shadow-xl">
                      <h3 className="text-sm font-extrabold font-heading uppercase tracking-wider text-amber-400 border-b border-blue-900/40 pb-2.5 flex items-center gap-2">
                        <span>🏷️</span> Category & Sub-Category Selection
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block mb-1.5 text-xs font-extrabold text-white">
                            Main Category <span className="text-amber-400">*</span>
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
                            disabled={Boolean(form.categoryId && (profile?.primaryCategory || profile?.category))}
                            className="w-full p-3 text-sm font-semibold rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/40 outline-none"
                            required
                          >
                            <option value="">-- Select Category --</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 🔘 Clickable Sub-Category Tabs */}
                        {subCategories.length > 0 && (
                          <div>
                            <label className="block mb-2 text-xs font-extrabold text-white">
                              Select Sub-Category (Tap to select)
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {subCategories.map((sub: any) => {
                                const isSelected = form.subCategoryId === sub._id;
                                return (
                                  <button
                                    key={sub._id}
                                    type="button"
                                    onClick={() =>
                                      setForm({
                                        ...form,
                                        subCategoryId: sub._id,
                                        childCategoryId: '',
                                      })
                                    }
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${isSelected
                                      ? 'bg-amber-400 text-blue-950 ring-2 ring-amber-400/50 scale-105'
                                      : 'bg-slate-900 text-slate-200 border border-blue-900/60 hover:bg-slate-800'
                                      }`}
                                  >
                                    {sub.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 🔘 Clickable Child-Category Tabs */}
                        {childCategories.length > 0 && (
                          <div>
                            <label className="block mb-2 text-xs font-extrabold text-white">
                              Select Child-Category (Tap to select)
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {childCategories.map((child: any) => {
                                const isSelected = form.childCategoryId === child._id;
                                return (
                                  <button
                                    key={child._id}
                                    type="button"
                                    onClick={() =>
                                      setForm({ ...form, childCategoryId: child._id })
                                    }
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
                                      ? 'bg-blue-600 text-white font-extrabold ring-2 ring-blue-500/50 scale-105'
                                      : 'bg-slate-900 text-slate-300 border border-blue-900/40 hover:bg-slate-800'
                                      }`}
                                  >
                                    {child.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block mb-1.5 text-xs font-extrabold text-white">
                            Product Brand
                          </label>
                          <select
                            value={form.brand}
                            onChange={(e) =>
                              setForm({ ...form, brand: e.target.value })
                            }
                            className="w-full p-3 text-sm font-semibold rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/40 outline-none"
                          >
                            <option value="">-- Select Brand --</option>
                            {categoryBrands.map((brand: string) => (
                              <option key={brand} value={brand}>
                                {brand}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 💰 STEP 2: PRICING, STOCK & ATTRIBUTES */}
                {formStep === 2 && (
                  <div className="space-y-5">
                    {/* Base Pricing & Inventory */}
                    <div className="rounded-2xl border border-blue-900/60 bg-slate-950/80 p-5 space-y-4 shadow-xl">
                      <h3 className="text-sm font-extrabold font-heading uppercase tracking-wider text-amber-400 border-b border-blue-900/40 pb-2.5 flex items-center gap-2">
                        <span>💰</span> Step 2: Base Pricing & Stock Controls
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block mb-1.5 text-xs font-extrabold text-white">
                            Base MRP (₹) <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="number"
                            value={form.baseMrp}
                            onChange={(e) => {
                              const mrp = Number(e.target.value);
                              const disc = Number(form.discountPercent || 0);
                              const sp = mrp > 0 ? Math.round(mrp - (mrp * disc) / 100) : 0;
                              setForm({ ...form, baseMrp: e.target.value, baseSellingPrice: String(sp) });
                            }}
                            placeholder="e.g. 500"
                            className="w-full p-3 text-sm font-black rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/40 outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-1.5 text-xs font-extrabold text-white">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            value={form.discountPercent}
                            onChange={(e) => {
                              const disc = Number(e.target.value);
                              const mrp = Number(form.baseMrp || 0);
                              const sp = mrp > 0 ? Math.round(mrp - (mrp * disc) / 100) : 0;
                              setForm({ ...form, discountPercent: e.target.value, baseSellingPrice: String(sp) });
                            }}
                            placeholder="e.g. 10"
                            className="w-full p-3 text-sm font-bold rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/40 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block mb-1.5 text-xs font-extrabold text-white">
                            Selling Price (₹) <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="number"
                            value={form.baseSellingPrice}
                            onChange={(e) => setForm({ ...form, baseSellingPrice: e.target.value })}
                            placeholder="e.g. 450"
                            className="w-full p-3 text-sm font-black text-amber-300 rounded-xl border border-blue-900/60 bg-slate-900 focus:ring-2 focus:ring-amber-400/40 outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block mb-1.5 text-xs font-extrabold text-white">
                            Available Stock Units <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="number"
                            value={form.stock}
                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                            placeholder="e.g. 50"
                            className="w-full p-3 text-sm font-bold text-emerald-400 rounded-xl border border-blue-900/60 bg-slate-900 focus:ring-2 focus:ring-amber-400/40 outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-1.5 text-xs font-extrabold text-white">
                            Minimum Order Quantity (MOQ)
                          </label>
                          <input
                            type="number"
                            value={form.minimumOrderQuantity}
                            onChange={(e) => setForm({ ...form, minimumOrderQuantity: e.target.value })}
                            placeholder="1"
                            className="w-full p-3 text-sm font-bold rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/40 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category Specifications & Attributes */}
                    {categoryAttributes.length > 0 && (
                      <div className="rounded-2xl border border-blue-900/60 bg-slate-950/80 p-5 space-y-4 shadow-xl">
                        <h3 className="text-sm font-extrabold font-heading uppercase tracking-wider text-amber-400 border-b border-blue-900/40 pb-2.5 flex items-center gap-2">
                          <span>⚙️</span> Category Specifications & Attributes
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryAttributes.map((attr: any) => (
                            <div key={attr._id || attr.name} className="space-y-1.5 p-3.5 rounded-xl border border-blue-900/40 bg-slate-900">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-extrabold text-white">
                                  {attr.name} {attr.unit ? `(${attr.unit})` : ''}
                                </label>
                                {attr.isVariant && (
                                  <span className="text-[10px] font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                    Variant Attribute
                                  </span>
                                )}
                              </div>

                              {attr.options?.length ? (
                                attr.isVariant || attr.type === 'multiselect' ? (
                                  <MultiSelectOptions
                                    attr={attr}
                                    selectedValues={attributeValues[attr.key || attr.name] || attributeValues[attr.name]}
                                    onChange={(values: string[]) =>
                                      setAttributeValues({
                                        ...attributeValues,
                                        [attr.key || attr.name]: values,
                                        [attr.name]: values,
                                      })
                                    }
                                  />
                                ) : (
                                  <select
                                    value={attributeValues[attr.key || attr.name] || attributeValues[attr.name] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updated = { ...attributeValues };
                                      if (attr.key) updated[attr.key] = val;
                                      if (attr.name) updated[attr.name] = val;
                                      setAttributeValues(updated);
                                    }}
                                    className="w-full p-3 text-xs font-semibold rounded-xl border border-blue-900/60 bg-slate-950 text-white outline-none"
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
                                  value={attributeValues[attr.key || attr.name] || attributeValues[attr.name] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updated = { ...attributeValues };
                                    if (attr.key) updated[attr.key] = val;
                                    if (attr.name) updated[attr.name] = val;
                                    setAttributeValues(updated);
                                  }}
                                  className="w-full p-3 text-xs font-medium rounded-xl border border-blue-900/60 bg-slate-950 text-white outline-none"
                                  placeholder={attr.placeholder || `Enter ${attr.name}`}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product Variants Matrix Builder */}
                    <div className="rounded-2xl border border-blue-900/60 bg-slate-950/80 p-5 space-y-4 shadow-xl">
                      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-blue-900/40 pb-3">
                        <div>
                          <h3 className="text-sm font-extrabold font-heading uppercase tracking-wider text-amber-400 flex items-center gap-2">
                            <span>📦</span> Product Variants & Stock Matrix
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-900/60 text-amber-300 border border-amber-400/30 font-black">
                              {variants.length} Variant{variants.length !== 1 ? 's' : ''}
                            </span>
                          </h3>
                          <p className="text-xs text-blue-300 mt-1">
                            Add size/weight/color variants with individual SKU prices or click Auto-Generate.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={generateVariants}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                          >
                            <Wand2 size={14} /> Auto-Generate
                          </button>

                          <button
                            type="button"
                            onClick={addManualVariant}
                            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                          >
                            <Plus size={14} /> Add Custom Variant
                          </button>
                        </div>
                      </div>

                      {variants.length > 0 ? (
                        <div className="border border-blue-900/40 rounded-2xl overflow-hidden bg-slate-900">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-950 border-b border-blue-900/60 text-blue-300">
                              <tr>
                                <th className="p-3 text-left font-extrabold">SKU Code</th>
                                <th className="p-3 text-left font-extrabold">Variant Specs</th>
                                <th className="p-3 text-center font-extrabold">MRP (₹)</th>
                                <th className="p-3 text-center font-extrabold">Discount %</th>
                                <th className="p-3 text-center font-extrabold">Selling Price (₹)</th>
                                <th className="p-3 text-center font-extrabold">Stock</th>
                                <th className="p-3 text-center font-extrabold">Action</th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-blue-900/40">
                              {variants.map((variant, index) => (
                                <tr key={index} className="hover:bg-slate-850 transition">
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={variant.sku}
                                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                      className="w-full p-2 border border-blue-900/60 rounded-xl text-xs font-mono bg-slate-950 text-amber-300 font-bold"
                                    />
                                  </td>

                                  <td className="p-3">
                                    <span className="font-bold text-white block">
                                      {Object.entries(variant.attributes || {})
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join(', ') || 'Standard Variant'}
                                    </span>
                                  </td>

                                  <td className="p-3 text-center">
                                    <input
                                      type="number"
                                      value={variant.mrp}
                                      onChange={(e) => updateVariant(index, 'mrp', e.target.value)}
                                      className="w-20 p-2 border border-blue-900/60 rounded-xl text-center bg-slate-950 text-white font-bold"
                                    />
                                  </td>

                                  <td className="p-3 text-center">
                                    <input
                                      type="number"
                                      value={variant.discountPercent || 0}
                                      onChange={(e) => updateVariant(index, 'discountPercent', e.target.value)}
                                      className="w-16 p-2 border border-blue-900/60 rounded-xl text-center bg-slate-950 text-emerald-400 font-bold"
                                    />
                                  </td>

                                  <td className="p-3 text-center">
                                    <input
                                      type="number"
                                      value={variant.sellingPrice}
                                      onChange={(e) => updateVariant(index, 'sellingPrice', e.target.value)}
                                      className="w-20 p-2 border border-blue-900/60 rounded-xl text-center bg-slate-950 font-black text-amber-300"
                                    />
                                  </td>

                                  <td className="p-3 text-center">
                                    <input
                                      type="number"
                                      value={variant.stock}
                                      onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                      className="w-16 p-2 border border-blue-900/60 rounded-xl text-center bg-slate-950 font-bold text-emerald-400"
                                    />
                                  </td>

                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => removeVariant(index)}
                                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition cursor-pointer"
                                      title="Delete Variant"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 border border-dashed border-blue-900/60 rounded-2xl bg-slate-900">
                          <Package size={28} className="mx-auto text-blue-400 mb-2" />
                          <p className="text-xs text-white font-bold">No product variants created yet.</p>
                          <p className="text-[10px] text-blue-300 mt-1">Click "Auto-Generate" or "Add Custom Variant" above to add size/weight/color options.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 📸 STEP 3: MEDIA & DELIVERY RULES */}
                {formStep === 3 && (
                  <div className="space-y-5">
                    <MediaSection
                      thumbnailPreview={thumbnailPreview}
                      imagePreviews={images.map(img => typeof img === 'string' ? img : URL.createObjectURL(img))}
                      description={form.description}
                      aiLoading={aiLoading}
                      onThumbnailSelect={(file, preview) => {
                        setThumbnail(file);
                        setThumbnailPreview(preview);
                      }}
                      onImagesSelect={(files) => {
                        setImages(files);
                      }}
                      onDescriptionChange={(desc) => setForm({ ...form, description: desc })}
                      onGenerateAiDetails={handleGenerateAiDetails}
                    />

                    <DeliverySection
                      policy={{
                        homeDelivery: form.isLocalDelivery,
                        storePickup: form.isSelfPickup,
                        sameDay: false,
                        scheduled: form.isSubscriptionAvailable,
                        fragile: false,
                        isSubscriptionAvailable: form.isSubscriptionAvailable
                      }}
                      onChange={(policy) => {
                        setForm({
                          ...form,
                          isLocalDelivery: policy.homeDelivery,
                          isSelfPickup: policy.storePickup,
                          isSubscriptionAvailable: policy.isSubscriptionAvailable ?? policy.scheduled
                        });
                      }}
                    />
                  </div>
                )}

                {/* Bottom Step Navigation Bar */}
                <div className="pt-6 border-t border-blue-900/60 flex items-center justify-between gap-4">
                  {formStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setFormStep(formStep - 1)}
                      className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      ← Back Step
                    </button>
                  ) : <div />}

                  {formStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setFormStep(formStep + 1)}
                      className="px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg transform hover:scale-105"
                    >
                      Next Step ➔
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveProduct}
                      disabled={saving}
                      className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 disabled:opacity-50 text-blue-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer transform hover:scale-105 flex items-center gap-2"
                    >
                      {saving && <span className="w-4 h-4 border-2 border-blue-950 border-t-transparent rounded-full animate-spin" />}
                      {saving ? 'Saving Product...' : 'Submit Product for Approval 🚀'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPricingView && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-blue-900/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-hidden relative text-white">
            {/* Header Bar */}
            <div className="flex justify-between items-center border-b border-blue-900/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black">
                  👑
                </div>
                <div>
                  <h2 className="text-base font-black font-heading tracking-wide text-white">
                    Admin Approval & Pricing Review
                  </h2>
                  <p className="text-xs text-blue-300">
                    Review approved selling prices, platform fee breakdown & net payout.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPricingView(false)}
                className="h-8 w-8 rounded-full bg-slate-900 border border-blue-900/60 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center font-black transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Preview Card */}
              <div className="rounded-2xl border border-blue-900/60 bg-slate-900 p-4 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="relative h-56 rounded-xl border border-blue-900/40 overflow-hidden bg-slate-950 flex items-center justify-center">
                  {getImageUrl(selectedProduct.thumbnail || selectedProduct.images?.[0]) ? (
                    <img
                      src={getImageUrl(selectedProduct.thumbnail || selectedProduct.images?.[0])}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Package size={42} className="text-blue-400/60" />
                  )}
                  <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase shadow-md border border-emerald-400">
                    ✓ Admin Approved
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    {selectedProduct.brand || 'ApexBee Merchant'}
                  </span>

                  <h3 className="font-extrabold text-base text-white line-clamp-2">
                    {selectedProduct.name}
                  </h3>

                  <p className="text-xs font-mono text-blue-300">
                    SKU: {selectedProduct.sku}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-2xl font-black text-amber-300">
                      ₹{selectedProduct.adminPricing?.sellingPrice || selectedProduct.baseSellingPrice || 0}
                    </span>

                    {Number(selectedProduct.baseMrp) > 0 && (
                      <span className="text-sm line-through text-slate-400 font-semibold">
                        MRP ₹{selectedProduct.adminPricing?.mrp || selectedProduct.baseMrp}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Matrix Cards */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 space-y-1 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                      💵 Your Net Seller Payout
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Bank Deposit
                    </span>
                  </div>
                  <p className="text-3xl font-black text-emerald-400">
                    ₹{Number(selectedProduct.adminPricing?.finalSellerAmount || 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-emerald-200/80">Direct credit per unit sold</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const distFrom =
                      selectedProduct.adminPricing?.distributedFrom ||
                      (Number(selectedProduct.adminPricing?.vendorCommissionPercent) > 0 && !Number(selectedProduct.adminPricing?.platformFeeAmount)
                        ? 'apexbee_commission'
                        : 'platform_fee');

                    const isApexBee = distFrom === 'apexbee_commission' || distFrom === 'vendor' || distFrom === 'vendor_commission';
                    const isBoth = distFrom === 'both';

                    if (!isApexBee && !isBoth) {
                      // Platform fee is paid by customer -> don't show to vendor
                      return null;
                    }

                    const commPercent = selectedProduct.adminPricing?.vendorCommissionPercent ?? selectedProduct.adminPricing?.platformFeePercent ?? 0;
                    const commAmount = selectedProduct.adminPricing?.vendorCommissionAmount ?? selectedProduct.adminPricing?.platformFeeAmount ?? 0;

                    return (
                      <div className="p-3.5 rounded-2xl border border-amber-400/30 bg-amber-950/30 space-y-1">
                        <span className="text-[11px] font-extrabold text-amber-300 block">
                          ApexBee Commission ({commPercent}%)
                        </span>
                        <b className="text-base font-black text-white">
                          ₹{commAmount}
                        </b>
                      </div>
                    );
                  })()}

                  <div className="p-3.5 rounded-2xl border border-blue-500/30 bg-blue-950/40 space-y-1">
                    <span className="text-[11px] font-extrabold text-blue-300 block">
                      Customer Price
                    </span>
                    <b className="text-base font-black text-white">
                      ₹{customerSellingAmount}
                    </b>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-blue-900/60 bg-slate-900 space-y-1">
                    <span className="text-[11px] font-bold text-blue-300 block">
                      Shipping Fee
                    </span>
                    <b className="text-sm font-bold text-white">
                      ₹{selectedProduct.adminPricing?.shippingCharge || 0}
                    </b>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-blue-900/60 bg-slate-900 space-y-1">
                    <span className="text-[11px] font-bold text-blue-300 block">
                      Packing Fee
                    </span>
                    <b className="text-sm font-bold text-white">
                      ₹{selectedProduct.adminPricing?.packingCharge || 0}
                    </b>
                  </div>
                </div>

                {selectedProduct.status === 'Awaiting Seller Approval' && (
                  <div className="space-y-3 pt-2">
                    <textarea
                      placeholder="Enter counter-offer or note for Admin if negotiating..."
                      value={negotiationMessage}
                      onChange={(e) => setNegotiationMessage(e.target.value)}
                      className="w-full p-3 rounded-xl border border-blue-900/60 bg-slate-900 text-white text-xs font-medium focus:ring-2 focus:ring-amber-400/40 outline-none"
                      rows={2}
                    />

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleAcceptPricing(selectedProduct._id)}
                        className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs uppercase tracking-wider flex justify-center items-center shadow-lg transition-all cursor-pointer transform hover:scale-105 disabled:opacity-60"
                      >
                        {saving ? (
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Accept & Publish Live'
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleNegotiate}
                        className="flex-1 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-xs uppercase tracking-wider flex justify-center items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-60"
                      >
                        {saving ? (
                          <span className="w-4 h-4 border-2 border-blue-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X size={16} />
                        )}
                        Send Negotiation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
