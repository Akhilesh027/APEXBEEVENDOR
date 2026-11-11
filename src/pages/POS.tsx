import React, { useState, useMemo, useRef } from 'react';
import { useVendor } from '../context/VendorContext';
import { useBusinessWorkspace } from '../context/BusinessWorkspaceContext';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  User,
  Phone,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  History,
  Store,
  Layers,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';
import type { Product } from '../types';

interface POSCartItem {
  id: string;
  name: string;
  sku: string;
  price: number; // selling price
  mrp?: number;
  quantity: number;
  gstRate: number; // e.g. 0, 3, 5, 12, 18, 28
  gstPricingMode: 'inclusive' | 'exclusive';
  image?: string;
  category?: string;
  isCustom?: boolean;
}

interface CompletedPOSBill {
  billNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  items: POSCartItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'credit';
  cashTendered?: number;
  changeDue?: number;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  gstNumber: string;
}

export const POS: React.FC = () => {
  const { products, profile } = useVendor();
  const { selected } = useBusinessWorkspace();

  // State
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'credit'>('cash');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'terminal' | 'history'>('terminal');

  // Completed Bill for Receipt Modal
  const [completedBill, setCompletedBill] = useState<CompletedPOSBill | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [recentBills, setRecentBills] = useState<CompletedPOSBill[]>(() => {
    try {
      const saved = localStorage.getItem(`pos_recent_bills_${profile.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom Item Modal State
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState<number | ''>('');
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'list'>('grid');
  const [customItemGstRate, setCustomItemGstRate] = useState<number>(() => {
    if (profile.hasGst) return 5;
    return 0;
  });
  const [customItemMode, setCustomItemMode] = useState<'inclusive' | 'exclusive'>(() => {
    return profile.gstPricingMode || 'inclusive';
  });

  const receiptPrintRef = useRef<HTMLDivElement>(null);

  // Available vendor categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add Product from Catalog to POS Cart
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      // Default GST settings: fallback to vendor profile defaults if product rate is not set
      const defaultRate = product.gstRate !== undefined ? Number(product.gstRate) : profile.hasGst ? 5 : 0;
      const defaultMode = product.gstPricingMode || profile.gstPricingMode || 'inclusive';

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          sku: product.sku || `SKU-${product.id.slice(-6)}`,
          price: Number(product.price || 0),
          quantity: 1,
          gstRate: defaultRate,
          gstPricingMode: defaultMode,
          image: product.images?.[0] || '',
          category: product.category,
        },
      ];
    });
  };

  // Add Custom Item on the Fly
  const handleAddCustomItem = () => {
    if (!customItemName.trim() || !customItemPrice || Number(customItemPrice) <= 0) return;
    const newItem: POSCartItem = {
      id: `custom_${Date.now()}`,
      name: customItemName.trim(),
      sku: `MISC-${Date.now().toString().slice(-4)}`,
      price: Number(customItemPrice),
      quantity: 1,
      gstRate: Number(customItemGstRate),
      gstPricingMode: customItemMode,
      isCustom: true,
      category: 'General Walk-in',
    };
    setCart((prev) => [...prev, newItem]);
    setCustomItemName('');
    setCustomItemPrice('');
    setShowCustomItemModal(false);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Clear all items from the current walk-in cart?')) {
      setCart([]);
      setCashTendered('');
      setDiscountPercent(0);
    }
  };

  // Accurate Split GST Math per item
  const billSummary = useMemo(() => {
    let itemsSubtotal = 0;
    let totalInclusiveCgst = 0;
    let totalInclusiveSgst = 0;
    let totalExclusiveCgst = 0;
    let totalExclusiveSgst = 0;

    cart.forEach((item) => {
      const lineTotal = item.price * item.quantity;
      itemsSubtotal += lineTotal;
      const rate = Number(item.gstRate || 0);

      if (rate > 0) {
        if (item.gstPricingMode === 'exclusive') {
          const itemTax = (lineTotal * rate) / 100;
          const half = Math.round((itemTax / 2) * 100) / 100;
          totalExclusiveCgst += half;
          totalExclusiveSgst += half;
        } else {
          // Inclusive pricing
          const base = lineTotal / (1 + rate / 100);
          const itemTax = lineTotal - base;
          const half = Math.round((itemTax / 2) * 100) / 100;
          totalInclusiveCgst += half;
          totalInclusiveSgst += half;
        }
      }
    });

    const exclusiveGst = totalExclusiveCgst + totalExclusiveSgst;
    const inclusiveGst = totalInclusiveCgst + totalInclusiveSgst;
    const totalGst = exclusiveGst + inclusiveGst;
    const cgst = totalExclusiveCgst + totalInclusiveCgst;
    const sgst = totalExclusiveSgst + totalInclusiveSgst;

    // Subtotal with exclusive GST added
    const subtotalWithTax = itemsSubtotal + exclusiveGst;
    const discountAmount = Math.round(((subtotalWithTax * discountPercent) / 100) * 100) / 100;
    const grandTotal = Math.max(0, Math.round((subtotalWithTax - discountAmount) * 100) / 100);

    return {
      itemsSubtotal,
      exclusiveGst,
      inclusiveGst,
      totalGst,
      cgst,
      sgst,
      discountAmount,
      grandTotal,
    };
  }, [cart, discountPercent]);

  // Cash change calculation
  const changeDue = useMemo(() => {
    if (paymentMethod !== 'cash' || !cashTendered) return 0;
    return Math.max(0, Number(cashTendered) - billSummary.grandTotal);
  }, [paymentMethod, cashTendered, billSummary.grandTotal]);

  // Complete Sale & Generate Bill
  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && cashTendered !== '' && Number(cashTendered) < billSummary.grandTotal) {
      alert(`Tendered cash ₹${cashTendered} is less than total payable ₹${billSummary.grandTotal}`);
      return;
    }

    const billNumber = `POS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBill: CompletedPOSBill = {
      billNumber,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || 'N/A',
      items: [...cart],
      subtotal: billSummary.itemsSubtotal,
      cgst: billSummary.cgst,
      sgst: billSummary.sgst,
      totalGst: billSummary.totalGst,
      discount: billSummary.discountAmount,
      grandTotal: billSummary.grandTotal,
      paymentMethod,
      cashTendered: paymentMethod === 'cash' && cashTendered !== '' ? Number(cashTendered) : billSummary.grandTotal,
      changeDue: paymentMethod === 'cash' ? changeDue : 0,
      businessName: profile.businessName || selected?.name || 'ApexBee Store',
      businessAddress: profile.address || 'Local Market, Telangana',
      businessPhone: profile.phone || profile.whatsappNumber || '',
      gstNumber: profile.gstNumber || '',
    };

    const updatedBills = [newBill, ...recentBills].slice(0, 50);
    setRecentBills(updatedBills);
    try {
      localStorage.setItem(`pos_recent_bills_${profile.id}`, JSON.stringify(updatedBills));
    } catch {}

    setCompletedBill(newBill);
    setShowReceiptModal(true);

    // Reset Cart
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCashTendered('');
    setDiscountPercent(0);
  };

  const handlePrint = () => {
    window.print();
  };

  // Metrics for History tab
  const todayMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBills = recentBills.filter((b) => b.createdAt.startsWith(todayStr));
    const totalRev = todayBills.reduce((acc, b) => acc + b.grandTotal, 0);
    const totalGstCollected = todayBills.reduce((acc, b) => acc + b.totalGst, 0);
    const cashTotal = todayBills.filter((b) => b.paymentMethod === 'cash').reduce((acc, b) => acc + b.grandTotal, 0);
    const upiTotal = todayBills.filter((b) => b.paymentMethod === 'upi').reduce((acc, b) => acc + b.grandTotal, 0);

    return {
      count: todayBills.length,
      revenue: totalRev,
      tax: totalGstCollected,
      cash: cashTotal,
      upi: upiTotal,
    };
  }, [recentBills]);

  return (
    <div className="p-3 sm:p-6 max-w-[1600px] mx-auto text-slate-100 min-h-screen">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">Counter POS &amp; Billing Terminal</h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Active Counter
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>🏪 {profile.businessName || 'ApexBee Store'}</span>
              <span>•</span>
              <span className="capitalize">{profile.category || 'All Categories'}</span>
              {profile.hasGst && profile.gstNumber && (
                <>
                  <span>•</span>
                  <span className="text-amber-400 font-mono font-bold">GSTIN: {profile.gstNumber}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Tab Controls & Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Billing Terminal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            Sales History ({recentBills.length})
          </button>
          <button
            type="button"
            onClick={() => setShowCustomItemModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Custom Item
          </button>
        </div>
      </div>

      {activeTab === 'terminal' ? (
        /* Main POS Grid: Left Catalog, Right Active Cart */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 7 COLS: Catalog & Search */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Category Pills */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products by title, SKU, brand, or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Grid / List Toggle for POS */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCatalogViewMode('grid')}
                    title="Grid View"
                    className={`p-1.5 rounded-lg transition cursor-pointer border-none flex items-center gap-1 ${
                      catalogViewMode === 'grid'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogViewMode('list')}
                    title="List View"
                    className={`p-1.5 rounded-lg transition cursor-pointer border-none flex items-center gap-1 ${
                      catalogViewMode === 'list'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All Items ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid or List */}
            {catalogViewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const inCart = cart.find((item) => item.id === p.id);
                const rate = p.gstRate !== undefined ? Number(p.gstRate) : profile.hasGst ? 5 : 0;
                const isExclusive = (p.gstPricingMode || profile.gstPricingMode) === 'exclusive';

                return (
                  <div
                    key={p.id}
                    onClick={() => handleAddToCart(p)}
                    className={`bg-slate-900 border rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer relative group ${
                      inCart
                        ? 'border-amber-400 bg-amber-400/5 ring-1 ring-amber-400/20'
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-[11px] w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                        {inCart.quantity}
                      </span>
                    )}

                    <div>
                      {/* Product Thumbnail */}
                      <div className="w-full h-24 rounded-xl bg-slate-950 overflow-hidden mb-2 relative flex items-center justify-center border border-slate-800">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-slate-700" />
                        )}
                        <span className="absolute bottom-1 right-1 bg-slate-950/80 backdrop-blur-xs text-[9px] font-mono text-slate-300 px-1.5 py-0.5 rounded">
                          Stock: {p.stock ?? 0}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">{p.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {p.sku || `SKU-${p.id.slice(-6)}`}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-end justify-between">
                      <div>
                        <div className="text-sm font-black text-amber-400">₹{Number(p.price || 0).toFixed(2)}</div>
                        {rate > 0 ? (
                          <div className="text-[9.5px] font-bold text-slate-400">
                            {isExclusive ? `+${rate}% GST` : `Incl. ${rate}% GST`}
                          </div>
                        ) : (
                          <div className="text-[9.5px] text-slate-500">0% GST</div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        className="w-7 h-7 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black flex items-center justify-center transition shadow-xs cursor-pointer"
                        title="Add to counter bill"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                  <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">No catalog products match this search.</p>
                  <p className="text-xs text-slate-500 mt-1">Try another keyword or add a walk-in custom item.</p>
                  <button
                    type="button"
                    onClick={() => setShowCustomItemModal(true)}
                    className="mt-3 px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Walk-in Custom Item
                  </button>
                </div>
              )}
            </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const inCart = cart.find((item) => item.id === p.id);
                  const rate = p.gstRate !== undefined ? Number(p.gstRate) : profile.hasGst ? 5 : 0;
                  const isExclusive = (p.gstPricingMode || profile.gstPricingMode) === 'exclusive';

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleAddToCart(p)}
                      className={`bg-slate-900 border rounded-xl p-2.5 flex items-center justify-between gap-3 transition-all cursor-pointer relative group ${
                        inCart
                          ? 'border-amber-400 bg-amber-400/5 ring-1 ring-amber-400/20'
                          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-slate-950 overflow-hidden shrink-0 relative flex items-center justify-center border border-slate-800">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-slate-700" />
                          )}
                          {inCart && (
                            <span className="absolute top-0.5 right-0.5 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                              {inCart.quantity}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold text-white truncate">{p.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">{p.sku || `SKU-${p.id.slice(-6)}`}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Stock: {p.stock ?? 0}</span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {rate > 0 ? (isExclusive ? `+${rate}% GST` : `Incl. ${rate}% GST`) : '0% GST'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-black text-amber-400">₹{Number(p.price || 0).toFixed(2)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p);
                          }}
                          className="w-7 h-7 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black flex items-center justify-center transition shadow-xs cursor-pointer"
                          title="Add to counter bill"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                    <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-300">No catalog products match this search.</p>
                    <p className="text-xs text-slate-500 mt-1">Try another keyword or add a walk-in custom item.</p>
                    <button
                      type="button"
                      onClick={() => setShowCustomItemModal(true)}
                      className="mt-3 px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Walk-in Custom Item
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: Active Walk-in Cart & Payment Station */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>🧾 Active Counter Bill</span>
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {cart.reduce((a, b) => a + b.quantity, 0)} Items
                    </span>
                  </h2>
                </div>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                  </button>
                )}
              </div>

              {/* Customer Info (Optional for walk-in) */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Customer Name (optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Mobile (for SMS/receipt)"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 mb-4">
                {cart.map((item) => {
                  const rate = Number(item.gstRate || 0);
                  const isExclusive = item.gstPricingMode === 'exclusive';
                  const itemTotal = item.price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{item.name}</span>
                          {item.isCustom && (
                            <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1.5 py-0.2 rounded font-bold">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5">
                          <span>₹{item.price.toFixed(2)} each</span>
                          <span>•</span>
                          <span className={isExclusive ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                            {rate > 0 ? `${rate}% GST (${(rate / 2).toFixed(1)}% CGST + ${(rate / 2).toFixed(1)}% SGST)` : '0% GST'}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-amber-400">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right shrink-0 min-w-[60px]">
                        <div className="text-xs font-black text-white">₹{itemTotal.toFixed(2)}</div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}

                {cart.length === 0 && (
                  <div className="py-10 text-center border-2 border-dashed border-slate-800 rounded-xl">
                    <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-400">Cart is empty</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tap any product on the left or enter a custom item to bill.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Calculations & Payment Section */}
            <div className="border-t border-slate-800 pt-3 space-y-3">
              {/* Discount Selector */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Discount / Round-off:</span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10, 15].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscountPercent(d)}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold cursor-pointer transition ${
                        discountPercent === d
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Math breakdown */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-white">₹{billSummary.itemsSubtotal.toFixed(2)}</span>
                </div>

                {/* CGST Split */}
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <span>CGST (Central Tax):</span>
                    {billSummary.inclusiveGst > 0 && (
                      <span className="text-[10px] text-slate-500">(includes embedded)</span>
                    )}
                  </span>
                  <span className="font-semibold text-emerald-400">+₹{billSummary.cgst.toFixed(2)}</span>
                </div>

                {/* SGST Split */}
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <span>SGST (State Tax):</span>
                    {billSummary.inclusiveGst > 0 && (
                      <span className="text-[10px] text-slate-500">(includes embedded)</span>
                    )}
                  </span>
                  <span className="font-semibold text-emerald-400">+₹{billSummary.sgst.toFixed(2)}</span>
                </div>

                {/* Total Tax */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900 pt-1">
                  <span>Total Tax (CGST + SGST):</span>
                  <span className="font-bold text-slate-400">₹{billSummary.totalGst.toFixed(2)}</span>
                </div>

                {billSummary.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Discount ({discountPercent}%):</span>
                    <span>-₹{billSummary.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Grand Total */}
                <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Grand Total Payable:</span>
                  <span className="text-amber-400 text-lg">₹{billSummary.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Mode Pills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Method:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'cash', label: 'Cash', icon: <Banknote className="w-3.5 h-3.5" /> },
                    { id: 'upi', label: 'UPI / QR', icon: <QrCode className="w-3.5 h-3.5" /> },
                    { id: 'card', label: 'Card / POS', icon: <CreditCard className="w-3.5 h-3.5" /> },
                    { id: 'credit', label: 'Khata / Credit', icon: <Store className="w-3.5 h-3.5" /> },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {m.icon}
                      <span className="text-[11px]">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Calculator if Cash Selected */}
              {paymentMethod === 'cash' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">Cash Received:</span>
                    <input
                      type="number"
                      placeholder="₹ Tendered"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value ? Number(e.target.value) : '')}
                      className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-right text-white font-bold outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Fast Tender Chips */}
                  <div className="flex items-center gap-1.5 justify-end">
                    {[
                      { label: 'Exact', val: billSummary.grandTotal },
                      { label: '₹100', val: 100 },
                      { label: '₹200', val: 200 },
                      { label: '₹500', val: 500 },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setCashTendered(chip.val)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10.5px] font-bold text-slate-300 cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {cashTendered !== '' && Number(cashTendered) >= billSummary.grandTotal && (
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
                      <span className="font-bold text-emerald-400">Change Due to Customer:</span>
                      <span className="font-mono text-sm font-black text-emerald-400">
                        ₹{changeDue.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* UPI QR Display if UPI Selected */}
              {paymentMethod === 'upi' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-2">
                  <span className="text-xs text-slate-400">Ask Customer to Scan with PhonePe / GPay / Paytm</span>
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                    {/* Generates standard dynamic UPI QR image */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                        `upi://pay?pa=apexbee@icici&pn=${encodeURIComponent(profile.businessName || 'ApexBee Store')}&am=${billSummary.grandTotal}&cu=INR`
                      )}`}
                      alt="UPI QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] font-bold text-amber-400">
                    Amount: ₹{billSummary.grandTotal.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Complete Sale Action Button */}
              <button
                type="button"
                onClick={handleCompleteSale}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Sale &amp; Print Bill (₹{billSummary.grandTotal.toFixed(2)})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SALES HISTORY TAB */
        <div className="space-y-4">
          {/* Daily Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400">Today&apos;s POS Bills</span>
              <div className="text-xl font-black text-white mt-1">{todayMetrics.count} Bills</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400">Total Counter Revenue</span>
              <div className="text-xl font-black text-amber-400 mt-1">₹{todayMetrics.revenue.toFixed(2)}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400">GST Collected</span>
              <div className="text-xl font-black text-emerald-400 mt-1">₹{todayMetrics.tax.toFixed(2)}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400">Cash Received</span>
              <div className="text-xl font-black text-slate-200 mt-1">₹{todayMetrics.cash.toFixed(2)}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400">UPI Collected</span>
              <div className="text-xl font-black text-sky-400 mt-1">₹{todayMetrics.upi.toFixed(2)}</div>
            </div>
          </div>

          {/* Bills Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white">Recent POS Counter Sales</h3>
              <span className="text-xs text-slate-400">{recentBills.length} records saved</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Bill No</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Tax (CGST + SGST)</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentBills.map((bill) => (
                    <tr key={bill.billNumber} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{bill.billNumber}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">{bill.customerName}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {bill.items.reduce((a, b) => a + b.quantity, 0)} items
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-medium">₹{bill.totalGst.toFixed(2)}</td>
                      <td className="py-3 px-4 font-black text-white">₹{bill.grandTotal.toFixed(2)}</td>
                      <td className="py-3 px-4 uppercase text-[10px] font-bold">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-400">
                          {bill.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setCompletedBill(bill);
                            setShowReceiptModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}

                  {recentBills.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No POS sales recorded today yet. Use the terminal tab to bill customers.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM WALK-IN ITEM MODAL */}
      {showCustomItemModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Walk-in Custom Item</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomItemModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Item / Service Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pooja Flowers, Special Packing, Custom Gift"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    GST Rate
                  </label>
                  <select
                    value={customItemGstRate}
                    onChange={(e) => setCustomItemGstRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={3}>3% (Gold / Gems)</option>
                    <option value={5}>5% (Standard Essentials)</option>
                    <option value={12}>12% (Standard)</option>
                    <option value={18}>18% (General Goods)</option>
                    <option value={28}>28% (Luxury / Specific)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Tax Mode
                  </label>
                  <select
                    value={customItemMode}
                    onChange={(e) => setCustomItemMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value="inclusive">Price Includes Tax</option>
                    <option value="exclusive">Add Tax on Top</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomItemModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomItem}
                disabled={!customItemName.trim() || !customItemPrice || Number(customItemPrice) <= 0}
                className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {showReceiptModal && completedBill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bill Completed Successfully</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Thermal / Paper Receipt View for Printing */}
            <div
              ref={receiptPrintRef}
              className="bg-white text-slate-950 p-6 rounded-xl font-mono text-xs shadow-inner space-y-3 print:p-0 print:shadow-none"
            >
              <div className="text-center border-b border-dashed border-slate-400 pb-3">
                <h2 className="text-base font-black uppercase tracking-tight">{completedBill.businessName}</h2>
                <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{completedBill.businessAddress}</p>
                {completedBill.businessPhone && (
                  <p className="text-[11px] text-slate-600">Tel: {completedBill.businessPhone}</p>
                )}
                {completedBill.gstNumber && (
                  <p className="text-xs font-black text-slate-900 mt-1">
                    GSTIN: {completedBill.gstNumber}
                  </p>
                )}
                <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-slate-700 bg-slate-100 py-0.5 rounded">
                  TAX INVOICE / RETAIL CASH MEMO
                </div>
              </div>

              {/* Bill Details */}
              <div className="text-[11px] border-b border-dashed border-slate-400 pb-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>Bill No: <strong>{completedBill.billNumber}</strong></span>
                  <span>{new Date(completedBill.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cust: {completedBill.customerName}</span>
                  <span>{new Date(completedBill.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {completedBill.customerPhone !== 'N/A' && (
                  <div className="text-slate-600">Phone: {completedBill.customerPhone}</div>
                )}
              </div>

              {/* Items Table */}
              <div className="border-b border-dashed border-slate-400 pb-2">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-700">
                      <th className="py-1">Item</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Rate</th>
                      <th className="py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedBill.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-1">
                          <div className="font-bold text-slate-900 leading-snug">{it.name}</div>
                          <div className="text-[9.5px] text-slate-500">
                            GST {it.gstRate}% ({it.gstPricingMode})
                          </div>
                        </td>
                        <td className="py-1 text-center">{it.quantity}</td>
                        <td className="py-1 text-right">₹{it.price.toFixed(2)}</td>
                        <td className="py-1 text-right font-bold">₹{(it.price * it.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Tax Split */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span>₹{completedBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>CGST (Central Tax):</span>
                  <span>+₹{completedBill.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>SGST (State Tax):</span>
                  <span>+₹{completedBill.sgst.toFixed(2)}</span>
                </div>
                {completedBill.discount > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Discount:</span>
                    <span>-₹{completedBill.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-950 pt-1 border-t border-slate-300">
                  <span>NET TOTAL PAYABLE:</span>
                  <span>₹{completedBill.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="text-[10.5px] space-y-0.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-bold uppercase">{completedBill.paymentMethod}</span>
                </div>
                {completedBill.paymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between">
                      <span>Cash Received:</span>
                      <span>₹{(completedBill.cashTendered || completedBill.grandTotal).toFixed(2)}</span>
                    </div>
                    {completedBill.changeDue !== undefined && completedBill.changeDue > 0 && (
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Change Returned:</span>
                        <span>₹{completedBill.changeDue.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="text-center pt-2 text-[10px] text-slate-500 space-y-1">
                <p>Thank you for your visit!</p>
                <p>Powered by ApexBee Marketplace</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal / A4 Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

