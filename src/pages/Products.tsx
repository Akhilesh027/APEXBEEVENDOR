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
import { compressImage, compressImages } from '../services/imageCompressor';
import { useVendor } from '../context/VendorContext';

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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === item
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
              </div>

              <form
                onSubmit={handleSaveProduct}
                className="space-y-6 overflow-y-auto pr-2 text-sm"
              >
                {/* 1. BASIC DETAILS */}
                <div className="rounded-2xl border-2 border-border/80 bg-card p-5 space-y-4 shadow-sm hover:border-primary/40 transition-all">
                  <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider text-primary border-b border-border/60 pb-2.5 flex items-center gap-2">
                    <span>📝</span> 1. Basic Product Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs md:text-sm font-bold text-foreground">
                          Product Name *
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateAiDetails}
                          disabled={aiLoading}
                          className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition-colors cursor-pointer"
                        >
                          <Wand2 className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                          {aiLoading ? 'AI Generating...' : '✨ AI Enhance Title'}
                        </button>
                      </div>
                      <input
                        value={form.name}
                        placeholder="e.g. Organic Sunflower Oil 1L"
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value, sku: '' })
                        }
                        className="w-full p-3.5 text-sm md:text-base font-medium rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-xs md:text-sm font-bold text-foreground">
                        Auto SKU Identifier
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={form.sku}
                          readOnly
                          className="w-full p-3.5 text-sm md:text-base rounded-xl border border-border bg-secondary/30 font-mono text-foreground font-semibold"
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
                          className="px-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title="Generate SKU"
                        >
                          <Wand2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-xs md:text-sm font-bold text-foreground">
                        Seller Role / Type
                      </label>
                      <select
                        value={form.sellerType}
                        onChange={(e) =>
                          setForm({ ...form, sellerType: e.target.value })
                        }
                        className="w-full p-3.5 text-sm md:text-base font-semibold rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="vendor">Vendor (Retail Seller)</option>
                        <option value="manufacturer">Manufacturer (Brand Owner)</option>
                        <option value="wholesaler">Wholesaler (Bulk Supplier)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. CATEGORY SELECTION */}
                <div className="rounded-2xl border-2 border-border/80 bg-card p-5 space-y-4 shadow-sm hover:border-primary/40 transition-all">
                  <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider text-primary border-b border-border/60 pb-2.5 flex items-center gap-2">
                    <span>🏷️</span> 2. Category &amp; Brand Selection
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs md:text-sm font-bold text-foreground">
                          Main Category *
                        </label>
                        {profile?.primaryCategory && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold text-amber-600 bg-amber-500/10 border border-amber-500/30 rounded-full">
                            🔒 Assigned Category
                          </span>
                        )}
                      </div>
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
                        className={`w-full p-3.5 text-sm md:text-base font-semibold rounded-xl border ${Boolean(form.categoryId && (profile?.primaryCategory || profile?.category))
                          ? 'bg-muted/50 text-foreground border-border'
                          : 'bg-background text-foreground border-border focus:ring-2 focus:ring-primary'
                          }`}
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

                    <div>
                      <label className="block mb-1.5 text-xs md:text-sm font-bold text-foreground">
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
                        className="w-full p-3.5 text-sm md:text-base font-semibold rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
                        disabled={!subCategories.length}
                      >
                        <option value="">-- Select Sub Category --</option>
                        {subCategories.map((cat: any) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-xs md:text-sm font-bold text-foreground">
                        Child Category
                      </label>
                      <select
                        value={form.childCategoryId}
                        onChange={(e) =>
                          setForm({ ...form, childCategoryId: e.target.value })
                        }
                        className="w-full p-3.5 text-sm md:text-base font-semibold rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
                        disabled={!childCategories.length}
                      >
                        <option value="">-- Select Child Category --</option>
                        {childCategories.map((cat: any) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs md:text-sm font-bold text-foreground">
                      Product Brand
                    </label>
                    <select
                      value={form.brand}
                      onChange={(e) =>
                        setForm({ ...form, brand: e.target.value })
                      }
                      className="w-full p-3.5 text-sm md:text-base font-semibold rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
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

                {/* 3. ATTRIBUTES */}
                {categoryAttributes.length > 0 && (
                  <div className="rounded-2xl border-2 border-border/80 bg-card p-5 space-y-4 shadow-sm hover:border-primary/40 transition-all">
                    <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider text-primary border-b border-border/60 pb-2.5 flex items-center gap-2">
                      <span>⚙️</span> 3. Product Specifications &amp; Attributes
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryAttributes.map((attr: any) => (
                        <div key={attr._id || attr.name} className="space-y-1.5 p-3.5 rounded-xl border border-border/60 bg-secondary/10">
                          <div className="flex items-center justify-between">
                            <label className="text-xs md:text-sm font-bold text-foreground">
                              {attr.name} {attr.unit ? `(${attr.unit})` : ''}
                            </label>
                            {attr.isVariant && (
                              <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                Multi-Select Variant
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
                                className="w-full p-3.5 text-sm font-semibold rounded-xl border border-border bg-background text-foreground outline-none"
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
                              className="w-full p-3.5 text-sm font-medium rounded-xl border border-border bg-background text-foreground outline-none"
                              placeholder={attr.placeholder || `Enter ${attr.name}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SELLER PRICING */}
                <div className="rounded-2xl border-2 border-border/80 bg-card p-5 space-y-4 shadow-sm hover:border-primary/40 transition-all">
                  <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider text-primary border-b border-border/60 pb-2.5 flex items-center gap-2">
                    <span>💰</span> 4. Pricing &amp; Inventory
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block mb-1.5 text-xs md:text-sm font-bold text-foreground">
                        MRP (₹) *
                      </label>
                      <input
                        type="number"
                        value={form.baseMrp}
                        placeholder="e.g. 500"
                        onChange={(e) =>
                          setForm({ ...form, baseMrp: e.target.value })
                        }
                        className="w-full p-3.5 text-sm md:text-base font-bold rounded-xl border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-xs md:text-sm font-bold text-foreground">
                        Discount %
                      </label>
                      <input
                        type="number"
                        value={form.discountPercent}
                        placeholder="e.g. 10"
                        onChange={(e) =>
                          setForm({ ...form, discountPercent: e.target.value })
                        }
                        className="w-full p-3.5 text-sm md:text-base font-bold rounded-xl border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-xs md:text-sm font-bold text-primary">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={form.baseSellingPrice}
                        placeholder="e.g. 450"
                        onChange={(e) =>
                          setForm({ ...form, baseSellingPrice: e.target.value })
                        }
                        className="w-full p-3.5 text-sm md:text-base font-extrabold rounded-xl border-2 border-primary bg-primary/10 text-primary outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-xs md:text-sm font-bold text-foreground">
                        Available Stock *
                      </label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) =>
                          setForm({ ...form, stock: e.target.value })
                        }
                        className="w-full p-3.5 text-sm md:text-base font-bold rounded-xl border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-xs md:text-sm font-bold text-foreground flex items-center justify-between">
                        <span>Min. Order (MOQ)</span>
                        <span className="text-[9px] bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded font-extrabold">BULK</span>
                      </label>
                      <input
                        type="number"
                        value={form.minimumOrderQuantity}
                        min="1"
                        onChange={(e) =>
                          setForm({ ...form, minimumOrderQuantity: e.target.value })
                        }
                        className="w-full p-3.5 text-sm md:text-base font-bold rounded-xl border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                        placeholder="1"
                      />
                      {Number(form.minimumOrderQuantity) > 1 && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1 mt-1 font-semibold">
                          ⚠️ Bulk product — customers must buy at least {form.minimumOrderQuantity} units.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-primary/20 bg-card p-5 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/60 pb-3 gap-2">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <span>🏪</span> 5. Store Operations &amp; Delivery Settings
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Configure store visibility, recurring subscriptions, and customer delivery reach.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-500/20">
                      ✓ Store Visible by Default
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Store Visibility */}
                    <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-2">
                      <span className="text-xs font-bold text-foreground block">
                        🏬 Storefront Visibility
                      </span>
                      <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.isStoreProduct ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-background'
                        }`}>
                        <input
                          type="checkbox"
                          checked={form.isStoreProduct}
                          onChange={(e) =>
                            setForm({ ...form, isStoreProduct: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-foreground block">Show in Vendor Storefront</span>
                          <span className="text-[10px] text-muted-foreground">Product will be listed on your store page for nearby customers</span>
                        </div>
                      </label>
                    </div>

                    {/* Subscription Orders */}
                    <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-2">
                      <span className="text-xs font-bold text-foreground block">
                        🔁 Recurring Order Subscription
                      </span>
                      <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.isSubscriptionAvailable ? 'border-amber-500 bg-amber-500/10' : 'border-border bg-background'
                        }`}>
                        <input
                          type="checkbox"
                          checked={form.isSubscriptionAvailable}
                          onChange={(e) =>
                            setForm({ ...form, isSubscriptionAvailable: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-foreground block">Enable Daily / Weekly Subscriptions</span>
                          <span className="text-[10px] text-muted-foreground">Ideal for milk, groceries, fresh meals, water cans, or daily essentials</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Delivery & Pickup Options */}
                  <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-bold text-foreground block">
                        🚚 Shipping, Delivery &amp; Pickup Options
                      </span>
                      <span className="text-[10px] md:text-xs text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
                        ✨ Select any combination of fulfillment methods
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${form.isLocalDelivery ? 'border-indigo-600 bg-indigo-500/10' : 'border-border bg-background'
                        }`}>
                        <input
                          type="checkbox"
                          checked={form.isLocalDelivery}
                          onChange={(e) => {
                            const nextLocal = e.target.checked;
                            if (!nextLocal && !form.isPanIndia && !form.isSelfPickup) return;
                            const nextScope = nextLocal && form.isPanIndia ? 'both' : nextLocal ? 'local' : 'pan_india';
                            setForm({ ...form, isLocalDelivery: nextLocal, deliveryScope: nextScope });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                        />
                        <div>
                          <span className="text-xs md:text-sm font-bold text-foreground block">📍 Local Quick Delivery</span>
                          <span className="text-[10px] md:text-xs text-muted-foreground block">15-30 Min store rider delivery in mandal/district</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${form.isSelfPickup ? 'border-amber-500 bg-amber-500/10' : 'border-border bg-background'
                        }`}>
                        <input
                          type="checkbox"
                          checked={form.isSelfPickup}
                          onChange={(e) => {
                            const nextPickup = e.target.checked;
                            if (!nextPickup && !form.isLocalDelivery && !form.isPanIndia) return;
                            setForm({ ...form, isSelfPickup: nextPickup });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 mt-0.5"
                        />
                        <div>
                          <span className="text-xs md:text-sm font-bold text-foreground block">🏪 In-Store Self Pickup</span>
                          <span className="text-[10px] md:text-xs text-muted-foreground block">Customer orders online &amp; picks up directly at your store</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${form.isPanIndia ? 'border-blue-600 bg-blue-500/10' : 'border-border bg-background'
                        }`}>
                        <input
                          type="checkbox"
                          checked={form.isPanIndia}
                          onChange={(e) => {
                            const nextPan = e.target.checked;
                            if (!nextPan && !form.isLocalDelivery && !form.isSelfPickup) return;
                            const nextScope = form.isLocalDelivery && nextPan ? 'both' : nextPan ? 'pan_india' : 'local';
                            setForm({ ...form, isPanIndia: nextPan, deliveryScope: nextScope });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <span className="text-xs md:text-sm font-bold text-foreground block">🌐 Pan-India Shipping</span>
                          <span className="text-[10px] md:text-xs text-muted-foreground block">Courier delivery to customers anywhere across India</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4 space-y-3 bg-card shadow-sm">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-border pb-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <span>📦 Product Variants &amp; Stock Matrix</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold">
                          {variants.length} Variant{variants.length !== 1 ? 's' : ''} Configured
                        </span>
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Create size/color/weight variants with custom SKU prices or auto-generate from selected attributes.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={generateVariants}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                      >
                        <Wand2 size={13} /> Auto-Generate
                      </button>

                      <button
                        type="button"
                        onClick={addManualVariant}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                      >
                        <Plus size={13} /> Add Custom Variant
                      </button>
                    </div>
                  </div>

                  {variants.length > 0 ? (
                    <div className="border rounded-xl overflow-hidden bg-background">
                      <table className="w-full text-xs">
                        <thead className="bg-secondary/70 border-b border-border">
                          <tr>
                            <th className="p-2.5 text-left font-bold">SKU</th>
                            <th className="p-2.5 text-left font-bold">Attributes / Specs</th>
                            <th className="p-2.5 text-center font-bold">MRP (₹)</th>
                            <th className="p-2.5 text-center font-bold">Discount %</th>
                            <th className="p-2.5 text-center font-bold">Selling Price (₹)</th>
                            <th className="p-2.5 text-center font-bold">Stock</th>
                            <th className="p-2.5 text-center font-bold">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {variants.map((variant, index) => (
                            <tr key={index} className="border-t border-border hover:bg-secondary/20 transition">
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  value={variant.sku}
                                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                  className="w-full p-1 border rounded text-xs font-mono bg-background"
                                />
                              </td>

                              <td className="p-2.5">
                                <span className="font-semibold text-slate-700 block">
                                  {Object.entries(variant.attributes || {})
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(', ') || 'Standard Variant'}
                                </span>
                              </td>

                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={variant.mrp}
                                  onChange={(e) =>
                                    updateVariant(index, 'mrp', e.target.value)
                                  }
                                  className="w-20 p-1 border rounded text-center bg-background font-bold"
                                />
                              </td>

                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={variant.discountPercent || 0}
                                  onChange={(e) =>
                                    updateVariant(index, 'discountPercent', e.target.value)
                                  }
                                  className="w-16 p-1 border rounded text-center bg-background text-emerald-600 font-bold"
                                />
                              </td>

                              <td className="p-2.5 text-center">
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
                                  className="w-20 p-1 border rounded text-center bg-background font-bold text-indigo-700"
                                />
                              </td>

                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) =>
                                    updateVariant(index, 'stock', e.target.value)
                                  }
                                  className="w-16 p-1 border rounded text-center bg-background font-bold"
                                />
                              </td>

                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeVariant(index)}
                                  className="p-1 rounded text-red-500 hover:bg-red-50 transition"
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
                    <div className="text-center py-6 border-2 border-dashed rounded-xl bg-secondary/10">
                      <Package size={24} className="mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground font-medium">No variants created yet.</p>
                      <p className="text-[10px] text-muted-foreground">Click "Auto-Generate" or "Add Custom Variant" above to add size/weight/color options.</p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase">6. Media &amp; Description</h3>
                    <button
                      type="button"
                      onClick={handleGenerateAiDetails}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200 shadow-sm transition-colors cursor-pointer"
                    >
                      <Wand2 className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                      {aiLoading ? 'Generating AI Details...' : '✨ Auto-Generate with AI'}
                    </button>
                  </div>

                  <textarea
                    placeholder="Product Description (Click 'Auto-Generate with AI' to build a rich SEO description automatically)"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border bg-background"
                    rows={4}
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

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-base md:text-lg disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  {saving && (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {saving
                    ? 'Saving Product...'
                    : editingProduct
                      ? 'Update Product'
                      : 'Submit Product for Review'}
                </button>
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
                        ₹{Number(selectedProduct.adminPricing?.finalSellerAmount || 0).toFixed(2)}
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
                  ₹{Number(selectedProduct.adminPricing?.finalSellerAmount || 0).toFixed(2)}
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
    </div>
  );
};
