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
  Power,
  Eye,
  Tag,
  Truck,
  ShieldCheck,
  Layers,
  Store,
  Percent,
  Calendar,
  DollarSign,
  Info,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Droplets,
} from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { useVendor } from '../context/VendorContext';
import { useBusinessWorkspace } from '../context/BusinessWorkspaceContext';
import { ProductEditor } from '../components/product-form/ProductEditor';
import { MediaSection } from '../components/product-form/MediaSection';
import { DeliverySection } from '../components/product-form/DeliverySection';
import { DairyProductFields, emptyDairyProduct, readDairyProduct, dairyProductError } from '../components/product-form/DairyProductFields';

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
  const [viewModalImage, setViewModalImage] = useState<string>('');
  const [viewModalTab, setViewModalTab] = useState<'all' | 'pricing' | 'variants' | 'logistics'>('all');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formStep, setFormStep] = useState<number>(1);

  const openViewModal = (product: any) => {
    setSelectedProduct(product);
    const mainImg = getImageUrl(product.thumbnail || product.images?.[0]);
    setViewModalImage(mainImg);
    setViewModalTab('all');
    setShowPricingView(true);
  };

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
    isPreOrder: false,
    preOrderType: 'ADVANCE_NOTICE',
    preOrderLeadTimeDays: 2,
    preOrderLeadTimeHours: 24,
    preOrderDailyCutoffTime: '18:00',
    preOrderAllowTimeSlot: true,
    preOrderAllowCustomMessage: true,
    preOrderCustomMessageLabel: 'Message on Cake / Custom Instructions',
    preOrderReleaseDate: '',
    preOrderMessage: '',
    preOrderLimit: '',
    isSelfPickup: true,
    deliveryScope: 'local',
    isLocalDelivery: true,
    isPanIndia: false,
    minimumOrderQuantity: '1',
    gstRate: '0',
    gstPricingMode: 'inclusive',
  });

  const [attributeValues, setAttributeValues] = useState<any>({});
  const [dairyDetails, setDairyDetails] = useState({ ...emptyDairyProduct });
  const [variants, setVariants] = useState<any[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [negotiationMessage, setNegotiationMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { profile, currentPage, setCurrentPage } = useVendor();
  const { selected: selectedBusiness, productIds, workspaces } = useBusinessWorkspace();

  useEffect(() => {
    if (showForm && !editingProduct && selectedBusiness) {
      setForm(previous => ({ ...previous, categoryId: selectedBusiness.categoryId, subCategoryId: selectedBusiness.id, childCategoryId: '' }));
    }
  }, [showForm, editingProduct, selectedBusiness?.id]);

  // Inherit default GST settings from vendor business profile
  useEffect(() => {
    if (showForm && !editingProduct && profile) {
      const defaultGstRate = profile.hasGst ? String(profile.categoryParameters?.gstRate ?? 5) : '0';
      const defaultGstMode = profile.gstPricingMode || 'inclusive';
      setForm(prev => ({
        ...prev,
        gstRate: prev.gstRate === '0' || !prev.gstRate ? defaultGstRate : prev.gstRate,
        gstPricingMode: prev.gstPricingMode || defaultGstMode
      }));
    }
  }, [showForm, editingProduct, profile?.hasGst, profile?.gstPricingMode, profile?.categoryParameters?.gstRate]);

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

  const vendorCategoryFilters = useMemo(() => {
    const names = new Set<string>();
    const ids = new Set<string>();

    const GENERIC_EXCLUDE = new Set([
      'general',
      'general retail',
      'general store',
      'vendor',
      'vendor (retail seller)',
      'retail seller',
      'retail',
      'retail store',
      'wholesaler',
      'manufacturer',
      'all',
      'none',
      'n/a',
      'undefined',
      'null'
    ]);

    const addName = (val: any) => {
      if (!val) return;
      if (typeof val === 'string') {
        val.split(',').forEach(part => {
          const trimmed = part.trim().toLowerCase();
          if (trimmed && !GENERIC_EXCLUDE.has(trimmed)) {
            names.add(trimmed);
            const clean = trimmed.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
            if (clean && !GENERIC_EXCLUDE.has(clean)) {
              names.add(clean);
            }
          }
        });
      } else if (typeof val === 'object') {
        if (val._id) ids.add(String(val._id));
        if (val.id) ids.add(String(val.id));
        if (val.name) addName(val.name);
        if (val.slug) addName(val.slug);
      }
    };

    const addId = (val: any) => {
      if (!val) return;
      if (typeof val === 'string' && val.length > 10) {
        ids.add(val.trim());
      } else if (typeof val === 'object' && (val._id || val.id)) {
        ids.add(String(val._id || val.id));
      }
    };

    if (profile) {
      if (Array.isArray(profile.categories)) {
        profile.categories.forEach(addName);
        profile.categories.forEach(addId);
      }
      if (Array.isArray(profile.allowedCategories)) {
        profile.allowedCategories.forEach(addId);
        profile.allowedCategories.forEach(addName);
      }
      if (profile.primaryCategory) addName(profile.primaryCategory);
      if (profile.category) addName(profile.category);
    }

    if (user) {
      if (Array.isArray(user.categories)) {
        user.categories.forEach(addName);
        user.categories.forEach(addId);
      }
      if (Array.isArray(user.allowedCategories)) {
        user.allowedCategories.forEach(addId);
      }
      if (user.primaryCategory) addName(user.primaryCategory);
      if (user.category) addName(user.category);

      if (user.sellerProfile) {
        if (Array.isArray(user.sellerProfile.categories)) {
          user.sellerProfile.categories.forEach(addName);
          user.sellerProfile.categories.forEach(addId);
        }
        if (Array.isArray(user.sellerProfile.allowedCategories)) {
          user.sellerProfile.allowedCategories.forEach(addId);
        }
        if (user.sellerProfile.primaryCategory) addName(user.sellerProfile.primaryCategory);
        if (user.sellerProfile.category) addName(user.sellerProfile.category);
      }
    }

    return {
      names: Array.from(names),
      ids: Array.from(ids),
      hasRestrictions: names.size > 0 || ids.size > 0
    };
  }, [profile, user]);

  const vendorApprovedSubs = useMemo(() => {
    const rawList: any[] = [];
    if (profile) {
      if (Array.isArray(profile.approvedSubcategories) && profile.approvedSubcategories.length > 0) {
        rawList.push(...profile.approvedSubcategories);
      } else if (Array.isArray(profile.subCategories) && profile.subCategories.length > 0) {
        rawList.push(...profile.subCategories);
      } else if (profile.subCategory) {
        rawList.push(profile.subCategory);
      }
    }
    if (user) {
      if (Array.isArray(user.approvedSubcategories)) rawList.push(...user.approvedSubcategories);
      if (Array.isArray(user.sellerProfile?.approvedSubcategories)) rawList.push(...user.sellerProfile.approvedSubcategories);
      if (user.sellerProfile?.subCategory) rawList.push(user.sellerProfile.subCategory);
    }

    const flatList = rawList.flatMap(s => typeof s === 'string' && s.includes(',') ? s.split(',').map(x => x.trim()) : s).filter(Boolean);
    return Array.from(new Set(flatList.map((s: string) => String(s).trim().toLowerCase())));
  }, [profile, user]);

  const availableCategories = useMemo(() => {
    if (!categories.length) return [];
    if (selectedBusiness?.kind === 'flowers') return categories.filter(category => category._id === selectedBusiness.categoryId);
    if (!vendorCategoryFilters.hasRestrictions && vendorApprovedSubs.length === 0) {
      return categories;
    }

    const { names, ids } = vendorCategoryFilters;

    const filtered = categories.filter((cat) => {
      // Direct ID match
      const cId = String(cat._id || cat.id || '');
      if (cId && ids.includes(cId)) return true;

      // Name & Slug match
      const cName = String(cat.name || '').trim().toLowerCase();
      const cSlug = String(cat.slug || '').trim().toLowerCase();
      const cleanName = cName.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
      const cleanSlug = cSlug.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

      const matchesMain = names.some(vCat => {
        const vClean = vCat.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
        return (
          vCat === cName ||
          vCat === cSlug ||
          (vClean && cleanName && (vClean === cleanName || cleanName.includes(vClean) || vClean.includes(cleanName))) ||
          (vClean && cleanSlug && (vClean === cleanSlug || cleanSlug.includes(vClean) || vClean.includes(cleanSlug)))
        );
      });
      if (matchesMain) return true;

      // Check subcategories of this category
      if (Array.isArray(cat.children) && cat.children.length > 0) {
        const matchesChild = cat.children.some((child: any) => {
          const childId = String(child._id || child.id || '');
          if (childId && ids.includes(childId)) return true;
          const chName = String(child.name || '').trim().toLowerCase();
          const chClean = chName.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

          const matchesChildName = names.some(vCat => {
            const vClean = vCat.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
            return vCat === chName || (vClean && chClean && (vClean === chClean || chClean.includes(vClean) || vClean.includes(chClean)));
          });
          if (matchesChildName) return true;

          const matchesApprovedSub = vendorApprovedSubs.some(approved => {
            const aClean = approved.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
            return approved === chName || (aClean && chClean && (aClean === chClean || chClean.includes(aClean) || aClean.includes(chClean)));
          });
          return matchesApprovedSub;
        });
        if (matchesChild) return true;
      }

      return false;
    });

    if (filtered.length > 0) {
      return filtered;
    }

    // Fallback only if no categories matched directly but vendor has approved subcategories
    if (vendorApprovedSubs.length > 0) {
      const subMatched = categories.filter(cat => {
        if (!Array.isArray(cat.children)) return false;
        return cat.children.some((ch: any) => {
          const sName = String(ch.name || '').trim().toLowerCase();
          const sClean = sName.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
          return vendorApprovedSubs.some(approved => {
            const aClean = approved.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
            return approved === sName || (aClean && sClean && (aClean === sClean || sClean.includes(aClean) || aClean.includes(sClean)));
          });
        });
      });
      if (subMatched.length > 0) return subMatched;
    }

    return vendorCategoryFilters.hasRestrictions ? filtered : categories;
  }, [categories, vendorCategoryFilters, vendorApprovedSubs, selectedBusiness?.kind, selectedBusiness?.categoryId]);

  // Auto-select category based on Vendor's business categories
  useEffect(() => {
    if (availableCategories.length > 0 && !editingProduct) {
      if (!form.categoryId || !availableCategories.some(c => c._id === form.categoryId)) {
        setForm((prev) => ({
          ...prev,
          categoryId: availableCategories[0]._id,
          subCategoryId: '',
          childCategoryId: ''
        }));
      }
    }
  }, [availableCategories, editingProduct, form.categoryId]);

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat._id === form.categoryId),
    [categories, form.categoryId]
  );

  const rawSubCategories = selectedCategory?.children || [];

  const subCategories = useMemo(() => {
    if (selectedBusiness?.kind === 'flowers') return rawSubCategories.filter((subcategory: any) => subcategory._id === selectedBusiness.id);
    if (!vendorApprovedSubs.length) return rawSubCategories;
    const filtered = rawSubCategories.filter((sub: any) => {
      const sName = String(sub.name || '').trim().toLowerCase();
      const sSlug = String(sub.slug || '').trim().toLowerCase();
      const sClean = sName.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
      return vendorApprovedSubs.some(approved => {
        const aClean = approved.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
        return (
          approved === sName ||
          approved === sSlug ||
          (aClean && sClean && (aClean === sClean || sClean.includes(aClean) || aClean.includes(sClean)))
        );
      });
    });
    return filtered.length > 0 ? filtered : rawSubCategories;
  }, [rawSubCategories, vendorApprovedSubs, selectedBusiness?.kind, selectedBusiness?.id]);

  // Auto-select subcategory when subCategories list updates
  useEffect(() => {
    if (subCategories.length > 0 && !form.subCategoryId && !editingProduct) {
      if (subCategories.length === 1) {
        setForm((prev) => ({ ...prev, subCategoryId: subCategories[0]._id }));
      } else if (vendorApprovedSubs.length > 0) {
        const matchedSub = subCategories.find((sub: any) => {
          const sName = String(sub.name || '').trim().toLowerCase();
          const sClean = sName.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
          return vendorApprovedSubs.some(approved => {
            const aClean = approved.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
            return approved === sName || (aClean && sClean && (aClean === sClean || sClean.includes(aClean) || aClean.includes(sClean)));
          });
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

  const dailyNeedsProfile = workspaces.find(workspace => workspace.id === form.subCategoryId)?.dailyNeedsProfile;
  const isFlowerProduct = workspaces.some(workspace => workspace.id === form.subCategoryId && workspace.kind === 'flowers');
  const flowerFractionalStock = isFlowerProduct && ['Kg', 'Grams', 'Garland Length (Meters)'].includes(attributeValues.selling_unit);
  const childCategories = selectedSubCategory?.children;
  const isDairyProduct = ['daily-needs', 'daily needs'].includes(String(selectedCategory?.slug || selectedCategory?.name || '').toLowerCase()) &&
    ['milk', 'milk-and-dairy', 'milk-dairy', 'milk and dairy', 'milk & dairy'].includes(String(selectedSubCategory?.slug || selectedSubCategory?.name || '').toLowerCase());

  const finalSelectedCategory = useMemo(() => {
    const child = childCategories?.find((cat: any) => cat._id === form.childCategoryId);
    return child || selectedSubCategory || selectedCategory;
  }, [
    form.childCategoryId,
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

  const rawCategoryAttributes = loadedAttributes.length > 0
    ? loadedAttributes
    : (finalSelectedCategory?.attributes || []);
  const dedicatedFields = isDairyProduct ? ['milk_type', 'fat_percentage', 'volume', 'expiry_date']
    : dailyNeedsProfile ? ['unit', 'stock_unit', 'pack_size', 'stock_source'] : [];
  const categoryAttributes = rawCategoryAttributes.filter((attribute: any) => !dedicatedFields.includes(attribute.key));

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
    const savedCategoryId = editingProduct?.categoryId?._id || editingProduct?.categoryId;
    if (editingProduct && String(savedCategoryId) === String(finalSelectedCategory._id)) return;

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
    setErrorMsg('');
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
      isPreOrder: false,
      preOrderType: 'ADVANCE_NOTICE',
      preOrderLeadTimeDays: 2,
      preOrderLeadTimeHours: 24,
      preOrderDailyCutoffTime: '18:00',
      preOrderAllowTimeSlot: true,
      preOrderAllowCustomMessage: true,
      preOrderCustomMessageLabel: 'Message on Cake / Custom Instructions',
      preOrderReleaseDate: '',
      preOrderMessage: '',
      preOrderLimit: '',
      isSelfPickup: true,
      deliveryScope: 'local',
      isLocalDelivery: true,
      isPanIndia: false,
      minimumOrderQuantity: '1',
    });

    setAttributeValues({});
    setDairyDetails({ ...emptyDairyProduct });
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
      isPreOrder: !!product.isPreOrder,
      preOrderType: product.preOrderType || product.attributes?.preOrderType || 'ADVANCE_NOTICE',
      preOrderLeadTimeDays: Number(product.preOrderLeadTimeDays || product.attributes?.preOrderLeadTimeDays || 2),
      preOrderLeadTimeHours: Number(product.preOrderLeadTimeHours || product.attributes?.preOrderLeadTimeHours || 24),
      preOrderDailyCutoffTime: product.preOrderDailyCutoffTime || product.attributes?.preOrderDailyCutoffTime || '18:00',
      preOrderAllowTimeSlot: product.preOrderAllowTimeSlot !== false,
      preOrderAllowCustomMessage: Boolean(product.preOrderAllowCustomMessage || product.attributes?.preOrderAllowCustomMessage),
      preOrderCustomMessageLabel: product.preOrderCustomMessageLabel || product.attributes?.preOrderCustomMessageLabel || 'Message on Cake / Custom Instructions',
      preOrderReleaseDate: product.preOrderReleaseDate ? String(product.preOrderReleaseDate).split('T')[0] : '',
      preOrderMessage: product.preOrderMessage || product.attributes?.preOrderMessage || '',
      preOrderLimit: product.preOrderLimit ? String(product.preOrderLimit) : '',
      isSelfPickup: product.isSelfPickup !== false,
      deliveryScope: product.deliveryScope || (product.isPanIndia ? (product.isLocalDelivery !== false ? 'both' : 'pan_india') : 'local'),
      isLocalDelivery: product.isLocalDelivery !== undefined ? !!product.isLocalDelivery : (product.deliveryScope === 'local' || product.deliveryScope === 'both' || !product.deliveryScope),
      isPanIndia: product.isPanIndia !== undefined ? !!product.isPanIndia : (product.deliveryScope === 'pan_india' || product.deliveryScope === 'both'),
      minimumOrderQuantity: String(product.minimumOrderQuantity ?? product.moq ?? product.wholesaleRules?.minOrderQty ?? 1),
      gstRate: product.gstRate !== undefined ? String(product.gstRate) : '0',
      gstPricingMode: product.gstPricingMode || 'inclusive',
    });

    setAttributeValues(product.attributes || {});
    setDairyDetails(readDairyProduct(product));
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
    if (isDairyProduct) {
      const message = dairyProductError(dairyDetails);
      if (message || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0 || form.stock === '' || Number(form.baseSellingPrice) > Number(form.baseMrp)) {
        setErrorMsg(message || 'Enter available packs as a whole number of zero or more, and keep selling price at or below MRP.');
        setFormStep(2); return;
      }
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
      fd.append('isPreOrder', String(form.isPreOrder));
      fd.append('preOrderType', form.preOrderType || 'ADVANCE_NOTICE');
      fd.append('preOrderLeadTimeDays', String(Number(form.preOrderLeadTimeDays) || 1));
      fd.append('preOrderLeadTimeHours', String(Number(form.preOrderLeadTimeHours) || 24));
      fd.append('preOrderDailyCutoffTime', form.preOrderDailyCutoffTime || '18:00');
      fd.append('preOrderAllowTimeSlot', String(form.preOrderAllowTimeSlot !== false));
      fd.append('preOrderAllowCustomMessage', String(!!form.preOrderAllowCustomMessage));
      fd.append('preOrderCustomMessageLabel', form.preOrderCustomMessageLabel || 'Message on Cake / Custom Instructions');
      fd.append('preOrderReleaseDate', form.preOrderReleaseDate || '');
      fd.append('preOrderMessage', form.preOrderMessage || '');
      fd.append('preOrderLimit', String(Number(form.preOrderLimit) || 0));
      fd.append('isSelfPickup', String(form.isSelfPickup));
      const calculatedScope = form.isLocalDelivery && form.isPanIndia ? 'both' : form.isPanIndia ? 'pan_india' : 'local';
      fd.append('deliveryScope', calculatedScope);
      fd.append('isLocalDelivery', String(form.isLocalDelivery));
      fd.append('isPanIndia', String(form.isPanIndia));
      fd.append('minimumOrderQuantity', String(Number(form.minimumOrderQuantity) || 1));
      fd.append('moq', String(Number(form.minimumOrderQuantity) || 1));
      fd.append('gstRate', String(Number(form.gstRate) || 0));
      fd.append('gstPricingMode', form.gstPricingMode || 'inclusive');
      fd.append('attributes', JSON.stringify(attributeValues));
      if (isDairyProduct) fd.append('dairyDetails', JSON.stringify(dairyDetails));
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

  const handleToggleProductStatus = async (product: any) => {
    // Verify product has completed both Admin approval and Vendor approval
    const isApprovedByBoth =
      (product.sellerPricingAccepted === true || product.status === 'Live' || product.status === 'Inactive' || (product.adminPricingApproved && product.status === 'Approved')) &&
      product.status !== 'Awaiting Seller Approval' &&
      product.status !== 'Pending Review' &&
      product.status !== 'Draft' &&
      product.status !== 'Rejected' &&
      product.status !== 'Negotiation Requested' &&
      product.status !== 'Vendor Edited' &&
      product.status !== 'Updated - Pending Approval';

    if (!isApprovedByBoth) {
      if (product.status === 'Awaiting Seller Approval') {
        setErrorMsg('Please review and accept pricing (Vendor approval) before enabling Store Status.');
      } else if (product.status === 'Rejected') {
        setErrorMsg('Cannot activate a rejected product.');
      } else {
        setErrorMsg('Store Status (ON/OFF) is only available after Admin approval and Vendor approval.');
      }
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    const isCurrentlyOn = product.isActive !== false && (product.status === 'Live' || product.status === 'Approved');
    const newActiveState = !isCurrentlyOn;

    try {
      setTogglingId(product._id);
      setErrorMsg('');

      // Optimistic update for instant UI feedback
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? {
              ...p,
              isActive: newActiveState,
              status: newActiveState ? 'Live' : 'Inactive',
            }
            : p
        )
      );

      const res = await productService.toggleStatus(product._id, newActiveState);

      if (res?.success) {
        setSuccessMsg(
          newActiveState
            ? `🟢 "${product.name}" is now ON and Live on ApexBee website!`
            : `⚪ "${product.name}" is now OFF and hidden from customers.`
        );
        setTimeout(() => setSuccessMsg(''), 4500);

        if (res.product) {
          setProducts((prev) =>
            prev.map((p) => (p._id === product._id ? { ...p, ...res.product } : p))
          );
        }
      }
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? product : p))
      );
      setErrorMsg(
        err?.response?.data?.message || 'Failed to change product status. Please try again.'
      );
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setTogglingId(null);
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
    if (productIds && !productIds.includes(String(product._id || product.id))) return false;
    const matchSearch =
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.sku?.toLowerCase().includes(search.toLowerCase());

    let matchFilter = false;
    if (filter === 'All') {
      matchFilter = true;
    } else if (filter === 'Live') {
      matchFilter = (product.status === 'Live' || product.status === 'Approved') && product.isActive !== false;
    } else if (filter === 'Off') {
      matchFilter = product.isActive === false || product.status === 'Inactive';
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
    <div className="pos-page space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <p className="pos-eyebrow mb-1">Catalog</p>
          <h1 className="pos-page-title">
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

      {errorMsg && !showForm && (
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

        {/* 5 Core Tabs + Sub-Status Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="p-1.5 bg-slate-950/80 rounded-2xl shadow-inner flex flex-wrap gap-2 text-left w-full md:w-auto">
            {[
              { id: 'All', label: 'All Products' },
              { id: 'Live', label: 'Live (Online)' },
              { id: 'Off', label: 'Off (Hidden)' },
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
                <th className="p-3 text-center">Store Status (ON/OFF)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => openViewModal(product)}
                        className="cursor-pointer group relative shrink-0"
                        title="Click to view all product details"
                      >
                        {getImageUrl(product.thumbnail || product.images?.[0]) ? (
                          <img
                            src={getImageUrl(product.thumbnail || product.images?.[0])}
                            alt={product.name}
                            className="w-11 h-11 rounded-xl object-cover border border-border group-hover:border-primary transition-all shadow-xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center border border-border">
                            <Package size={18} className="text-muted-foreground" />
                          </div>
                        )}
                        <span className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye size={14} className="text-white" />
                        </span>
                      </div>

                      <div>
                        <p
                          onClick={() => openViewModal(product)}
                          className="font-extrabold text-foreground cursor-pointer hover:text-primary transition-colors text-sm line-clamp-1"
                          title="Click to view all product details"
                        >
                          {product.name}
                        </p>
                        {product.dairyDetails?.dairyType && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {product.dairyDetails.dairyType} · {product.dairyDetails.packSize} {product.dairyDetails.packUnit}
                            {product.dairyDetails.fatPercentage !== undefined ? ` · ${product.dairyDetails.fatPercentage}% fat` : ''}
                            <span className="block text-[10px]">Expiry: {product.dairyDetails.expiryDate}</span>
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {product.brand || 'No Brand'}
                        </p>
                        {/* Storefront & Visibility Badges */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.isStoreProduct && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-extrabold uppercase tracking-wide">
                              🏪 Local Store
                            </span>
                          )}
                          {product.isSubscriptionAvailable && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 text-[9px] font-extrabold uppercase tracking-wide">
                              🔁 Subscription
                            </span>
                          )}
                          {product.isPreOrder && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-[9px] font-extrabold uppercase tracking-wide">
                              📅 Pre-Order {product.preOrderType === 'ADVANCE_NOTICE' ? `(${product.preOrderLeadTimeDays || 2}d Notice)` : product.preOrderReleaseDate ? `(${new Date(product.preOrderReleaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})` : ''}
                            </span>
                          )}
                          {product.isActive !== false && (product.status === 'Live' || product.status === 'Approved') ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[9px] font-extrabold uppercase tracking-wide">
                              ✅ Visible in Store
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[9px] font-extrabold uppercase tracking-wide">
                              🚫 Hidden from Store
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
                    <div className="font-semibold text-amber-500">Selling: ₹{product.baseSellingPrice}</div>
                    {product.gstRate !== undefined && Number(product.gstRate) > 0 && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        <span className="font-bold text-emerald-400">{product.gstRate}% GST</span>
                        <span className="text-[9px] text-slate-400 ml-1">
                          (CGST {(Number(product.gstRate) / 2).toFixed(1)}% + SGST {(Number(product.gstRate) / 2).toFixed(1)}%)
                        </span>
                        <span className="ml-1 text-[9px] font-semibold text-amber-400">
                          [{product.gstPricingMode === 'exclusive' ? 'Excl.' : 'Incl.'}]
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => openViewModal(product)}
                      className="text-primary font-bold underline hover:text-primary/80 transition-colors text-xs inline-flex items-center gap-1 cursor-pointer"
                      title="Click to inspect all product specifications, pricing, and fulfillment"
                    >
                      <Eye size={12} />
                      <span>{product.adminPricing ? 'View Pricing & Specs' : 'View Full Details'}</span>
                    </button>
                  </td>

                  {/* Store Status ON/OFF Button - Only show after Admin approved and Vendor approved */}
                  <td className="p-3 text-center">
                    {(() => {
                      const isApprovedByBoth =
                        (product.sellerPricingAccepted === true || product.status === 'Live' || product.status === 'Inactive' || (product.adminPricingApproved && product.status === 'Approved')) &&
                        product.status !== 'Awaiting Seller Approval' &&
                        product.status !== 'Pending Review' &&
                        product.status !== 'Draft' &&
                        product.status !== 'Rejected' &&
                        product.status !== 'Negotiation Requested' &&
                        product.status !== 'Vendor Edited' &&
                        product.status !== 'Updated - Pending Approval';

                      // 1. Both Admin and Vendor Approved: Show the ON/OFF toggle switch
                      if (isApprovedByBoth) {
                        const isProductOn = product.isActive !== false && (product.status === 'Live' || product.status === 'Approved');
                        return (
                          <div className="inline-flex flex-col items-center gap-1">
                            <button
                              type="button"
                              disabled={togglingId === product._id}
                              onClick={() => handleToggleProductStatus(product)}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs border ${isProductOn
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white'
                                } ${togglingId === product._id ? 'opacity-60 cursor-wait' : ''}`}
                              title={
                                isProductOn
                                  ? 'Click to turn OFF (Hide from ApexBee website)'
                                  : 'Click to turn ON (Show in ApexBee website)'
                              }
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${isProductOn ? 'bg-slate-950 animate-pulse' : 'bg-rose-400'
                                  }`}
                              />
                              <span>{isProductOn ? 'ON' : 'OFF'}</span>
                              {togglingId === product._id && (
                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-0.5" />
                              )}
                            </button>
                            <span className="text-[9px] font-semibold text-muted-foreground">
                              {isProductOn ? 'Live on Store' : 'Hidden from Store'}
                            </span>
                          </div>
                        );
                      }

                      // 2. Admin approved pricing, but waiting for Vendor (Seller) approval
                      if (
                        product.status === 'Awaiting Seller Approval' ||
                        (product.adminPricingApproved && !product.sellerPricingAccepted && product.status !== 'Rejected' && product.status !== 'Negotiation Requested')
                      ) {
                        return (
                          <div className="inline-flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openViewModal(product)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/40 hover:border-indigo-400 transition-all cursor-pointer shadow-xs active:scale-95"
                              title="Admin approved! Review and accept pricing to enable Store Status (ON/OFF)"
                            >
                              <span>👉 Accept Pricing</span>
                            </button>
                            <span className="text-[9px] font-semibold text-indigo-400">
                              Vendor Approval Needed
                            </span>
                          </div>
                        );
                      }

                      // 3. Negotiation Requested
                      if (product.status === 'Negotiation Requested') {
                        return (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              💬 In Negotiation
                            </span>
                            <span className="text-[9px] font-semibold text-muted-foreground">
                              Admin Reviewing
                            </span>
                          </div>
                        );
                      }

                      // 4. Rejected by Admin
                      if (product.status === 'Rejected' || product.moderationStatus === 'rejected') {
                        return (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              ❌ Rejected
                            </span>
                            <span className="text-[9px] font-semibold text-rose-400/80">
                              Admin Declined
                            </span>
                          </div>
                        );
                      }

                      // 5. Default / Draft / Pending Review: Awaiting Admin Approval
                      return (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            ⏳ Pending Admin
                          </span>
                          <span className="text-[9px] font-semibold text-muted-foreground">
                            Awaiting Admin Approval
                          </span>
                        </div>
                      );
                    })()}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${product.isActive === false || product.status === 'Inactive'
                        ? 'bg-slate-700/60 text-slate-300 border border-slate-600/40'
                        : product.status === 'Live'
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
                      {product.isActive === false && product.status === 'Live'
                        ? 'Inactive (Turned Off)'
                        : product.status}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      <button
                        onClick={() => openViewModal(product)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition cursor-pointer"
                        title="View Complete Product Details & Specs"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {loading ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center">
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
                  <td colSpan={9} className="p-10 text-center text-muted-foreground font-medium">
                    No products added yet. Start by clicking "Add Product" above!
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-muted-foreground font-medium">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ProductEditor
          step={formStep}
          editing={Boolean(editingProduct)}
          saving={saving}
          error={errorMsg}
          workspace={selectedBusiness?.name}
          onStep={setFormStep}
          onClose={resetForm}
          onSave={handleSaveProduct}
          preview={
            <div className="space-y-3">
              <p className="pos-eyebrow">Customer preview</p>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-background sm:h-44">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={form.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                      <ImageIcon size={28} aria-hidden="true" />
                      <span>No cover photo yet</span>
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
                    {form.name || 'Product name'}
                  </h3>

                  <p className="text-xs text-blue-200 line-clamp-2">
                    {form.description || 'Your product description will appear here.'}
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
                      <b className="break-all font-mono text-white text-xs">{form.sku || 'Pending'}</b>
                    </div>

                    <div className="bg-slate-950/80 rounded-xl p-2.5">
                      <p className="text-[10px] uppercase text-blue-300 font-bold">In Stock</p>
                      <b className="text-emerald-400 text-xs">{form.stock || 0} units</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          {formStep === 1 && (
            <div className="space-y-5">
              {/* Basic Details */}
              <div className="product-editor-card space-y-4">
                <h3>Product name &amp; SKU</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="product-name" className="text-xs font-extrabold text-white">
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
                      id="product-name"
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
                    <label htmlFor="product-sku" className="block mb-1.5 text-xs font-extrabold text-white">
                      Auto SKU Identifier
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="product-sku"
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
                    <label htmlFor="product-seller-type" className="block mb-1.5 text-xs font-extrabold text-white">
                      Seller Role / Type
                    </label>
                    <select
                      id="product-seller-type"
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
              <div className="product-editor-card space-y-4">
                <h3>Category &amp; subcategory</h3>

                <div className="space-y-4">
                  {/* 🔘 Clickable Main Category Tabs for Approved Categories */}
                  {availableCategories.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-extrabold text-white flex items-center gap-1.5">
                          Main Category <span className="text-amber-400">*</span>
                          {availableCategories.length > 1 ? (
                            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                              {availableCategories.length} Categories Permitted
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                              1 Category Permitted
                            </span>
                          )}
                        </label>
                        {availableCategories.length > 1 && (
                          <span className="text-[10px] text-blue-300">Tap chip to switch</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map((cat) => {
                          const isSelected = form.categoryId === cat._id;
                          return (
                            <button
                              key={cat._id}
                              type="button"
                              onClick={() =>
                                setForm({
                                  ...form,
                                  categoryId: cat._id,
                                  subCategoryId: '',
                                  childCategoryId: '',
                                })
                              }
                              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${isSelected
                                ? 'bg-amber-400 text-blue-950 ring-2 ring-amber-400/50 scale-105'
                                : 'bg-slate-900 text-slate-200 border border-blue-900/60 hover:bg-slate-800'
                                }`}
                            >
                              <span>{isSelected ? "✓" : "📁"}</span>
                              <span>{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block mb-1.5 text-xs font-extrabold text-white">
                      Category Selection {availableCategories.length > 1 ? "(or select from dropdown)" : ""}
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
                      disabled={availableCategories.length <= 1}
                      className="w-full p-3 text-sm font-semibold rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/40 outline-none disabled:opacity-75"
                      required
                    >
                      {availableCategories.length > 1 && (
                        <option value="">-- Select Category --</option>
                      )}
                      {availableCategories.map((cat) => (
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
                              aria-pressed={isSelected}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  subCategoryId: sub._id,
                                  childCategoryId: isSelected ? form.childCategoryId : '',
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
                  {childCategories?.length > 0 && (
                    <fieldset className="min-w-0">
                      <legend className="mb-2 text-xs font-bold text-white">Child category <span className="font-medium text-muted-foreground">(optional)</span></legend>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" aria-pressed={!form.childCategoryId}
                          className="pos-action"
                          onClick={() => setForm(previous => ({ ...previous, childCategoryId: '' }))}>
                          No child category
                        </button>
                        {childCategories.map((child: any) => {
                          const isSelected = form.childCategoryId === child._id;
                          return (
                            <button
                              key={child._id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() =>
                                setForm({ ...form, childCategoryId: child._id })
                              }
                              className="pos-action"
                            >
                              {child.name}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
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
              <div className="product-editor-card space-y-4">
                <h3>Base pricing &amp; inventory</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="product-mrp" className="block mb-1.5 text-xs font-extrabold text-white">
                      Base MRP (₹) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="product-mrp"
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
                    <label htmlFor="product-discount" className="block mb-1.5 text-xs font-extrabold text-white">
                      Discount (%)
                    </label>
                    <input
                      id="product-discount"
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
                    <label htmlFor="product-selling-price" className="block mb-1.5 text-xs font-extrabold text-white">
                      Selling Price (₹) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="product-selling-price"
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
                    <label htmlFor="product-stock" className="block mb-1.5 text-xs font-extrabold text-white">
                      Available Stock Units <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="product-stock"
                      type="number"
                      readOnly={!!editingProduct?.batchTrackingEnabled}
                      step={flowerFractionalStock || ['kg', 'g'].includes(attributeValues.stock_unit || attributeValues.unit) ? 0.001 : 1}
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

                {/* 🏛️ GST Settings per Product (Req 02) */}
                <div className="mt-4 pt-4 border-t border-blue-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      🏛️ Product GST Settings (CGST &amp; SGST)
                    </h4>
                    <span className="text-[10px] text-slate-400">Enter custom GST % (auto-split 50/50)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="product-gst-rate" className="block mb-1.5 text-xs font-extrabold text-white flex items-center justify-between">
                        <span>Enter GST Rate (%) <span className="text-amber-400">*</span></span>
                        {Number(form.gstRate || 0) > 0 && (
                          <span className="text-[10.5px] font-bold text-amber-300">
                            CGST {(Number(form.gstRate) / 2).toFixed(1)}% + SGST {(Number(form.gstRate) / 2).toFixed(1)}%
                          </span>
                        )}
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            id="product-gst-rate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={form.gstRate}
                            onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
                            placeholder="e.g. 18 or 5"
                            className="w-full p-3 text-sm font-black rounded-xl border border-blue-900/60 bg-slate-900 text-amber-300 focus:ring-2 focus:ring-amber-400/40 outline-none pr-10"
                            required
                          />
                          <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">%</span>
                        </div>

                        {/* Quick preset chips for vendor convenience */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Slabs:</span>
                          {['0', '3', '5', '12', '18', '28'].map((slab) => (
                            <button
                              type="button"
                              key={slab}
                              onClick={() => setForm({ ...form, gstRate: slab })}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border ${String(form.gstRate) === slab
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs scale-105'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                }`}
                            >
                              {slab}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="product-gst-mode" className="block mb-1.5 text-xs font-extrabold text-white">
                        GST Pricing Mode
                      </label>
                      <select
                        id="product-gst-mode"
                        value={form.gstPricingMode}
                        onChange={(e) => setForm({ ...form, gstPricingMode: e.target.value as any })}
                        className="w-full p-3 text-sm font-bold rounded-xl border border-blue-900/60 bg-slate-900 text-white focus:ring-2 focus:ring-amber-400/40 outline-none"
                      >
                        <option value="inclusive">Inclusive (GST included in Selling Price)</option>
                        <option value="exclusive">Exclusive (GST added on top of Selling Price)</option>
                      </select>
                    </div>
                  </div>

                  {/* CGST & SGST calculation preview */}
                  {Number(form.baseSellingPrice || 0) > 0 && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-900/95 border border-blue-800/40 text-xs space-y-2">
                      {(() => {
                        const sp = Number(form.baseSellingPrice || 0);
                        const rate = Number(form.gstRate || 0);
                        const halfRate = rate / 2;

                        if (form.gstPricingMode === 'exclusive') {
                          const totalGstAmt = (sp * rate) / 100;
                          const cgstAmt = totalGstAmt / 2;
                          const sgstAmt = totalGstAmt / 2;
                          const total = sp + totalGstAmt;
                          return (
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-800 text-slate-300">
                                <span>Base Price: <strong className="text-white">₹{sp.toFixed(2)}</strong></span>
                                <span>Total GST ({rate}%): <strong className="text-amber-400">₹{totalGstAmt.toFixed(2)}</strong></span>
                                <span>Customer Pays: <strong className="text-emerald-400 font-extrabold text-sm">₹{total.toFixed(2)}</strong></span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 pt-1.5 text-[11px] text-amber-300">
                                <span className="bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                                  🏛️ <strong>CGST ({halfRate.toFixed(1)}%):</strong> ₹{cgstAmt.toFixed(2)}
                                </span>
                                <span className="bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                                  🏛️ <strong>SGST ({halfRate.toFixed(1)}%):</strong> ₹{sgstAmt.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        } else {
                          const base = rate > 0 ? sp / (1 + rate / 100) : sp;
                          const totalGstAmt = sp - base;
                          const cgstAmt = totalGstAmt / 2;
                          const sgstAmt = totalGstAmt / 2;
                          return (
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-800 text-slate-300">
                                <span>Customer Pays: <strong className="text-emerald-400 font-extrabold text-sm">₹{sp.toFixed(2)}</strong> (Tax Inclusive)</span>
                                <span>Net Base Price: <strong className="text-white">₹{base.toFixed(2)}</strong></span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 pt-1.5 text-[11px] text-emerald-300">
                                <span className="bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md">
                                  🏛️ <strong>CGST ({halfRate.toFixed(1)}%):</strong> ₹{cgstAmt.toFixed(2)}
                                </span>
                                <span className="bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md">
                                  🏛️ <strong>SGST ({halfRate.toFixed(1)}%):</strong> ₹{sgstAmt.toFixed(2)}
                                </span>
                                <span className="text-slate-400">
                                  (Total Tax Included: ₹{totalGstAmt.toFixed(2)})
                                </span>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {isDairyProduct && <DairyProductFields value={dairyDetails} onChange={setDairyDetails} />}
              {isFlowerProduct && <p className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">Choose a selling unit in Category Specifications. Use Flower Stock &amp; Wastage to receive fresh batches and record their use-by dates.</p>}
              {dailyNeedsProfile && <section className="space-y-3 rounded-xl border border-blue-900/60 bg-slate-950 p-4">
                <h3 className="font-bold text-amber-300">{dailyNeedsProfile === 'produce' ? 'Produce details' : dailyNeedsProfile === 'grocery' ? 'Grocery pack details' : 'Organic product details'}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">Sellable unit<select className="mt-1 block w-full rounded-lg border border-blue-900 bg-slate-900 p-2" disabled={Number(editingProduct?.stock) > 0} value={attributeValues.stock_unit || attributeValues.unit || ''} onChange={e => setAttributeValues({ ...attributeValues, stock_unit: e.target.value })}>
                    <option value="">Default sellable units</option><option value="pack">Pack</option><option value="piece">Piece</option>
                    {dailyNeedsProfile === 'produce' && <><option value="kg">Kilogram</option><option value="g">Gram</option></>}
                    {!!(attributeValues.stock_unit || attributeValues.unit) && !['pack', 'piece', 'kg', 'g'].includes(attributeValues.stock_unit || attributeValues.unit) && <option value={attributeValues.stock_unit || attributeValues.unit}>{attributeValues.stock_unit || attributeValues.unit}</option>}
                  </select></label>
                  <label className="text-sm">Pack weight or size<input className="mt-1 block w-full rounded-lg border border-blue-900 bg-slate-900 p-2" maxLength={80} placeholder="For example, 500 g" value={attributeValues.pack_size || ''} onChange={e => setAttributeValues({ ...attributeValues, pack_size: e.target.value })} /></label>
                  <label className="text-sm">{dailyNeedsProfile === 'produce' ? 'Farm or source' : 'Supplier or source'}<input className="mt-1 block w-full rounded-lg border border-blue-900 bg-slate-900 p-2" maxLength={120} value={attributeValues.stock_source || ''} onChange={e => setAttributeValues({ ...attributeValues, stock_source: e.target.value })} /></label>
                </div>
                <p className="text-xs text-slate-400">Stock and the listed selling price use the selected unit. {editingProduct?.batchTrackingEnabled && 'Use batch receipts and wastage to adjust this product’s stock.'}</p>
              </section>}
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
                  isPanIndia: form.isPanIndia,
                  isLocalDelivery: form.isLocalDelivery,
                  isSubscriptionAvailable: form.isSubscriptionAvailable,
                  isPreOrder: form.isPreOrder,
                  preOrderType: form.preOrderType,
                  preOrderLeadTimeDays: form.preOrderLeadTimeDays,
                  preOrderLeadTimeHours: form.preOrderLeadTimeHours,
                  preOrderDailyCutoffTime: form.preOrderDailyCutoffTime,
                  preOrderAllowTimeSlot: form.preOrderAllowTimeSlot,
                  preOrderAllowCustomMessage: form.preOrderAllowCustomMessage,
                  preOrderCustomMessageLabel: form.preOrderCustomMessageLabel,
                  preOrderReleaseDate: form.preOrderReleaseDate,
                  preOrderMessage: form.preOrderMessage,
                  preOrderLimit: form.preOrderLimit,
                }}
                onChange={(policy) => {
                  const isLocal = policy.homeDelivery ?? policy.isLocalDelivery ?? true;
                  const isPan = policy.isPanIndia ?? false;
                  const calcScope = isLocal && isPan ? 'both' : isPan ? 'pan_india' : 'local';

                  setForm({
                    ...form,
                    isLocalDelivery: isLocal,
                    isPanIndia: isPan,
                    deliveryScope: calcScope,
                    isSelfPickup: policy.storePickup,
                    isSubscriptionAvailable: policy.isSubscriptionAvailable ?? policy.scheduled,
                    isPreOrder: !!policy.isPreOrder,
                    preOrderType: policy.preOrderType !== undefined ? policy.preOrderType : form.preOrderType,
                    preOrderLeadTimeDays: policy.preOrderLeadTimeDays !== undefined ? policy.preOrderLeadTimeDays : form.preOrderLeadTimeDays,
                    preOrderLeadTimeHours: policy.preOrderLeadTimeHours !== undefined ? policy.preOrderLeadTimeHours : form.preOrderLeadTimeHours,
                    preOrderDailyCutoffTime: policy.preOrderDailyCutoffTime !== undefined ? policy.preOrderDailyCutoffTime : form.preOrderDailyCutoffTime,
                    preOrderAllowTimeSlot: policy.preOrderAllowTimeSlot !== undefined ? policy.preOrderAllowTimeSlot : form.preOrderAllowTimeSlot,
                    preOrderAllowCustomMessage: policy.preOrderAllowCustomMessage !== undefined ? policy.preOrderAllowCustomMessage : form.preOrderAllowCustomMessage,
                    preOrderCustomMessageLabel: policy.preOrderCustomMessageLabel !== undefined ? policy.preOrderCustomMessageLabel : form.preOrderCustomMessageLabel,
                    preOrderReleaseDate: policy.preOrderReleaseDate !== undefined ? policy.preOrderReleaseDate : form.preOrderReleaseDate,
                    preOrderMessage: policy.preOrderMessage !== undefined ? policy.preOrderMessage : form.preOrderMessage,
                    preOrderLimit: policy.preOrderLimit !== undefined ? policy.preOrderLimit : form.preOrderLimit,
                  });
                }}
              />
            </div>
          )}

        </ProductEditor>
      )}

      {showPricingView && selectedProduct && (() => {
        const allImages = Array.from(
          new Set(
            [
              selectedProduct.thumbnail,
              ...(Array.isArray(selectedProduct.images) ? selectedProduct.images : []),
            ].filter(Boolean)
          )
        );

        const activeImg = viewModalImage || getImageUrl(allImages[0]) || '';
        const distFrom =
          selectedProduct.adminPricing?.distributedFrom ||
          (Number(selectedProduct.adminPricing?.vendorCommissionPercent) > 0 && !Number(selectedProduct.adminPricing?.platformFeeAmount)
            ? 'apexbee_commission'
            : 'platform_fee');

        const commPercent = selectedProduct.adminPricing?.vendorCommissionPercent ?? selectedProduct.adminPricing?.platformFeePercent ?? 0;
        const commAmount = selectedProduct.adminPricing?.vendorCommissionAmount ?? selectedProduct.adminPricing?.platformFeeAmount ?? 0;
        const customerPrice = getCustomerSellingAmount(selectedProduct);
        const sellerPayout = Number(selectedProduct.adminPricing?.finalSellerAmount || selectedProduct.baseSellingPrice || 0);
        const gstRateVal = Number(selectedProduct.gstRate || 0);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-slate-950 border border-blue-900/60 rounded-3xl max-w-5xl w-full my-auto shadow-2xl overflow-hidden relative text-white flex flex-col max-h-[92vh]">
              {/* Header Bar */}
              <div className="px-6 py-4 border-b border-blue-900/60 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black text-xl shrink-0">
                    📦
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-black font-heading tracking-wide text-white truncate max-w-md">
                        {selectedProduct.name}
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/60">
                        SKU: {selectedProduct.sku}
                      </span>
                    </div>
                    <p className="text-xs text-blue-300 flex items-center gap-1.5 mt-0.5">
                      <span>{selectedProduct.brand || 'No Brand'}</span>
                      <span>•</span>
                      <span className="text-slate-400 truncate">
                        {[
                          selectedProduct.categoryId?.name,
                          selectedProduct.subCategoryId?.name,
                          selectedProduct.childCategoryId?.name,
                        ]
                          .filter(Boolean)
                          .join(' > ') || 'General Catalog'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Status Badges & Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide border shadow-xs ${selectedProduct.status === 'Live'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : selectedProduct.status === 'Awaiting Seller Approval'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                          : selectedProduct.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                  >
                    {selectedProduct.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPricingView(false);
                      openEdit(selectedProduct);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="Open in Product Editor"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPricingView(false)}
                    className="h-8 w-8 rounded-full bg-slate-900 border border-blue-900/60 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center font-black transition cursor-pointer"
                    title="Close Modal"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="px-6 py-2 bg-slate-900/50 border-b border-blue-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 text-xs font-extrabold">
                {[
                  { id: 'all', label: '🌐 All Specifications & Pricing' },
                  { id: 'pricing', label: '💰 Pricing & Taxes' },
                  { id: 'variants', label: `📦 Variants (${selectedProduct.variants?.length || 0}) & Stock` },
                  { id: 'logistics', label: '🚚 Delivery & Pre-Order Rules' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewModalTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${viewModalTab === tab.id
                        ? 'bg-primary text-primary-foreground font-black shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body - Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
                {/* 1. Overview & Media Section */}
                {(viewModalTab === 'all' || viewModalTab === 'pricing') && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Visual Gallery - 5 cols */}
                    <div className="md:col-span-5 space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-blue-900/60">
                      <div className="relative h-60 rounded-xl border border-blue-900/40 overflow-hidden bg-slate-950 flex items-center justify-center">
                        {activeImg ? (
                          <img
                            src={activeImg}
                            alt={selectedProduct.name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <Package size={48} className="text-blue-400/60" />
                        )}
                        <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-amber-300 font-black text-[9px] px-2.5 py-0.5 rounded-full border border-amber-400/40 uppercase">
                          {selectedProduct.brand || 'Merchant Product'}
                        </span>
                      </div>

                      {/* Thumbnails Carousel */}
                      {allImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                          {allImages.map((imgUrl: string, idx: number) => {
                            const fullUrl = getImageUrl(imgUrl);
                            const isCurrent = activeImg === fullUrl;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setViewModalImage(fullUrl)}
                                className={`h-12 w-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all cursor-pointer p-0.5 bg-slate-950 ${isCurrent ? 'border-amber-400 scale-105 shadow-md ring-2 ring-amber-400/40' : 'border-blue-900/60 hover:border-blue-500 opacity-70 hover:opacity-100'
                                  }`}
                              >
                                <img src={fullUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Storefront Visibility Status */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-blue-900/40 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Storefront Status:</span>
                        {selectedProduct.isActive !== false && (selectedProduct.status === 'Live' || selectedProduct.status === 'Approved') ? (
                          <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live on Storefront
                          </span>
                        ) : (
                          <span className="text-slate-400 font-extrabold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            Hidden / Turned Off
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Identity & Highlights - 7 cols */}
                    <div className="md:col-span-7 space-y-4">
                      {/* Net Seller Payout Banner */}
                      <div className="p-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 to-slate-900 space-y-1 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                            <span>💵</span> Net Seller Payout (Direct Bank Deposit)
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            Per Unit Sold
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-black text-emerald-400">
                            ₹{sellerPayout.toFixed(2)}
                          </p>
                          <span className="text-xs text-emerald-200/80">
                            (Net amount deposited directly to your bank account)
                          </span>
                        </div>
                      </div>

                      {/* Financial Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl border border-blue-900/60 bg-slate-900/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retail MRP</span>
                          <span className="text-sm font-black text-slate-200">
                            ₹{Number(selectedProduct.adminPricing?.mrp || selectedProduct.baseMrp || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl border border-blue-900/60 bg-slate-900/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Discount</span>
                          <span className="text-sm font-black text-emerald-400">
                            {selectedProduct.discountPercent || (Number(selectedProduct.baseMrp) > Number(selectedProduct.baseSellingPrice) ? Math.round(((Number(selectedProduct.baseMrp) - Number(selectedProduct.baseSellingPrice)) / Number(selectedProduct.baseMrp)) * 100) : 0)}% OFF
                          </span>
                        </div>

                        <div className="p-3 rounded-xl border border-blue-900/60 bg-slate-900/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Selling Price</span>
                          <span className="text-sm font-black text-amber-300">
                            ₹{Number(selectedProduct.baseSellingPrice || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-950/40 space-y-1">
                          <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">Customer Price</span>
                          <span className="text-sm font-black text-white">
                            ₹{Number(customerPrice || selectedProduct.baseSellingPrice || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* GST Tax & Platform Fee Matrix */}
                      <div className="p-4 rounded-2xl border border-blue-900/60 bg-slate-900/50 space-y-2.5 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Taxes & Platform Fees Breakdown
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-950 border border-blue-900/40 space-y-1">
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">🏛️ GST Specification</span>
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-white">{gstRateVal}% GST</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-bold">
                                {selectedProduct.gstPricingMode === 'exclusive' ? 'Price Exclusive' : 'Price Inclusive'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Split: CGST {(gstRateVal / 2).toFixed(1)}% + SGST {(gstRateVal / 2).toFixed(1)}%
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950 border border-blue-900/40 space-y-1">
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">💼 ApexBee Platform Fee</span>
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-amber-300">₹{commAmount}</span>
                              <span className="text-[10px] text-slate-400 font-bold">{commPercent}% Fee</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Handling: Shipping ₹{selectedProduct.adminPricing?.shippingCharge || 0} • Packing ₹{selectedProduct.adminPricing?.packingCharge || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description Box */}
                      {selectedProduct.description && (
                        <div className="p-4 rounded-2xl border border-blue-900/40 bg-slate-900/40 space-y-1.5 text-xs">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            📝 Product Description &amp; Highlights
                          </span>
                          <p className="text-slate-300 leading-relaxed max-h-28 overflow-y-auto whitespace-pre-wrap font-medium">
                            {selectedProduct.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Variants & Inventory Specifications */}
                {(viewModalTab === 'all' || viewModalTab === 'variants') && (
                  <div className="space-y-4 pt-2 border-t border-blue-900/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <div>
                          <h3 className="font-black text-sm text-white uppercase tracking-wider">
                            Inventory &amp; Product Variants
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Available stock levels, SKUs, and variant configurations.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="bg-slate-900 px-3 py-1 rounded-xl border border-blue-900/60 font-bold">
                          Total Stock: <strong className="text-emerald-400">{selectedProduct.stock || 0}</strong> units
                        </span>
                        <span className="bg-slate-900 px-3 py-1 rounded-xl border border-blue-900/60 font-bold">
                          MOQ: <strong className="text-white">{selectedProduct.minimumOrderQuantity || 1}</strong>
                        </span>
                      </div>
                    </div>

                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      <div className="border border-blue-900/60 rounded-2xl overflow-hidden bg-slate-900 shadow-sm">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-950 text-slate-300 font-extrabold uppercase text-[10px] border-b border-blue-900/60">
                            <tr>
                              <th className="p-3">Variant / SKU</th>
                              <th className="p-3">Attributes</th>
                              <th className="p-3 text-right">MRP</th>
                              <th className="p-3 text-right">Discount</th>
                              <th className="p-3 text-right">Selling Price</th>
                              <th className="p-3 text-center">Stock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-900/40">
                            {selectedProduct.variants.map((v: any, vIdx: number) => {
                              const attrEntries = v.attributes && typeof v.attributes === 'object' ? Object.entries(v.attributes) : [];
                              return (
                                <tr key={vIdx} className="hover:bg-slate-800/50">
                                  <td className="p-3">
                                    <span className="font-bold text-white block">{v.name || v.title || `Variant #${vIdx + 1}`}</span>
                                    <span className="font-mono text-[10px] text-blue-300">{v.sku || selectedProduct.sku}</span>
                                  </td>

                                  <td className="p-3">
                                    {attrEntries.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {attrEntries.map(([k, val]: any) => (
                                          <span key={k} className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-semibold border border-blue-800/40">
                                            {k}: {String(val)}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 text-[10px]">Standard Variant</span>
                                    )}
                                  </td>

                                  <td className="p-3 text-right font-mono text-slate-400 line-through">
                                    ₹{Number(v.mrp || selectedProduct.baseMrp || 0).toFixed(2)}
                                  </td>

                                  <td className="p-3 text-right font-bold text-emerald-400">
                                    {v.discountPercent || selectedProduct.discountPercent || 0}%
                                  </td>

                                  <td className="p-3 text-right font-mono font-black text-amber-300">
                                    ₹{Number(v.sellingPrice || selectedProduct.baseSellingPrice || 0).toFixed(2)}
                                  </td>

                                  <td className="p-3 text-center font-bold">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${Number(v.stock) > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                      }`}>
                                      {v.stock || 0} in stock
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-blue-900/40 bg-slate-900/40 text-center text-xs text-slate-400">
                        This product does not have variants. Selling as a single SKU package with <strong>{selectedProduct.stock || 0}</strong> units in inventory.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Delivery, Fulfillment & Pre-Order Rules */}
                {(viewModalTab === 'all' || viewModalTab === 'logistics') && (
                  <div className="space-y-4 pt-2 border-t border-blue-900/40">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚚</span>
                      <div>
                        <h3 className="font-black text-sm text-white uppercase tracking-wider">
                          Delivery Logistics &amp; Fulfillment Policies
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Configured distribution channels, local store pickup, subscriptions, and advance orders.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Local Store Delivery */}
                      <div className={`p-3.5 rounded-2xl border ${selectedProduct.isLocalDelivery ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-slate-800 bg-slate-900/50'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[11px]">🛵 Local Store Delivery</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${selectedProduct.isLocalDelivery ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {selectedProduct.isLocalDelivery ? 'ACTIVE' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">
                          Hyperlocal delivery fulfilled directly to nearby customers within delivery radius.
                        </p>
                      </div>

                      {/* Pan India Delivery */}
                      <div className={`p-3.5 rounded-2xl border ${selectedProduct.isPanIndia ? 'border-blue-500/40 bg-blue-950/30' : 'border-slate-800 bg-slate-900/50'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[11px]">🚚 Pan-India Shipping</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${selectedProduct.isPanIndia ? 'bg-blue-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {selectedProduct.isPanIndia ? 'ACTIVE' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">
                          Nationwide courier shipping fulfilled via Delhivery / Shadowfax integration.
                        </p>
                      </div>

                      {/* In-Store Pickup */}
                      <div className={`p-3.5 rounded-2xl border ${selectedProduct.isSelfPickup ? 'border-amber-400/40 bg-amber-950/30' : 'border-slate-800 bg-slate-900/50'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[11px]">🏪 In-Store Self Pickup</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${selectedProduct.isSelfPickup ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {selectedProduct.isSelfPickup ? 'ACTIVE' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">
                          Customers visit your storefront directly to collect package with OTP verification.
                        </p>
                      </div>

                      {/* Recurring Subscription */}
                      <div className={`p-3.5 rounded-2xl border ${selectedProduct.isSubscriptionAvailable ? 'border-purple-500/40 bg-purple-950/30' : 'border-slate-800 bg-slate-900/50'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[11px]">🔁 Daily Subscriptions</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${selectedProduct.isSubscriptionAvailable ? 'bg-purple-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {selectedProduct.isSubscriptionAvailable ? 'ACTIVE' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">
                          Daily/weekly repeated automated doorstep deliveries on schedule.
                        </p>
                      </div>
                    </div>

                    {/* Pre-Order Configuration Panel */}
                    {selectedProduct.isPreOrder && (
                      <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                            <span>📅</span> Advance Pre-Order Configuration
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                            {selectedProduct.preOrderType === 'ADVANCE_NOTICE' ? 'Advance Notice Required' : 'Fixed Calendar Release Date'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-slate-300">
                          <div className="p-2.5 bg-slate-950 rounded-xl border border-purple-900/40">
                            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Preparation Lead Time</span>
                            <span className="font-extrabold text-white">
                              {selectedProduct.preOrderLeadTimeDays || 2} Days ({selectedProduct.preOrderLeadTimeHours || 24} Hours)
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-950 rounded-xl border border-purple-900/40">
                            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Daily Booking Cutoff</span>
                            <span className="font-extrabold text-white">
                              {selectedProduct.preOrderDailyCutoffTime || '18:00 (6:00 PM)'}
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-950 rounded-xl border border-purple-900/40">
                            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Time Slot Selection</span>
                            <span className="font-extrabold text-white">
                              {selectedProduct.preOrderAllowTimeSlot ? 'Customer Selects Slot' : 'Standard Delivery Slot'}
                            </span>
                          </div>
                        </div>

                        {selectedProduct.preOrderAllowCustomMessage && (
                          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-purple-900/30 text-[11px]">
                            <span className="text-purple-300 font-bold">Customer Custom Note Prompt: </span>
                            <span className="italic text-slate-300">"{selectedProduct.preOrderCustomMessageLabel || 'Message / Special Instructions'}"</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Specialty Dairy / Food Specs */}
                    {selectedProduct.dairyDetails && (selectedProduct.dairyDetails.dairyType || selectedProduct.dairyDetails.packSize) && (
                      <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-950/20 space-y-2 text-xs">
                        <span className="font-extrabold text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>🥛</span> Dairy &amp; Perishable Product Specifications
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-slate-300">
                          <div className="p-2.5 bg-slate-950 rounded-xl border border-blue-900/40">
                            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Dairy Classification</span>
                            <span className="font-extrabold text-white">{selectedProduct.dairyDetails.dairyType}</span>
                          </div>

                          <div className="p-2.5 bg-slate-950 rounded-xl border border-blue-900/40">
                            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Pack Size</span>
                            <span className="font-extrabold text-white">
                              {selectedProduct.dairyDetails.packSize} {selectedProduct.dairyDetails.packUnit}
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-950 rounded-xl border border-blue-900/40">
                            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Fat / Nutrition</span>
                            <span className="font-extrabold text-white">
                              {selectedProduct.dairyDetails.fatPercentage !== undefined ? `${selectedProduct.dairyDetails.fatPercentage}% Fat` : 'Standard'}
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-950 rounded-xl border border-blue-900/40">
                            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Expiry Date / Shelf</span>
                            <span className="font-extrabold text-amber-300">
                              {selectedProduct.dairyDetails.expiryDate || 'Fresh Daily'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Negotiation & Action Bar (When Awaiting Seller Approval) */}
                {selectedProduct.status === 'Awaiting Seller Approval' && (
                  <div className="p-4 rounded-2xl border border-amber-400/40 bg-amber-950/20 space-y-3 pt-3">
                    <div className="flex items-center gap-2 text-amber-300">
                      <span className="text-base">⚠️</span>
                      <span className="font-extrabold text-xs uppercase tracking-wide">
                        Admin has submitted approved pricing. Please accept to publish live or submit a counter-offer.
                      </span>
                    </div>

                    <textarea
                      placeholder="Enter counter-offer or note for Admin if negotiating pricing..."
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

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-blue-900/60 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <span>Product ID: <strong className="text-slate-300 font-mono">{selectedProduct._id}</strong></span>
                <button
                  type="button"
                  onClick={() => setShowPricingView(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
