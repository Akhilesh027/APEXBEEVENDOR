import { useEffect, useState } from 'react';
import { useBusinessWorkspace } from '../context/BusinessWorkspaceContext';
import { useVendor } from '../context/VendorContext';
import { workspaceRequest } from '../services/workspaceService';
import { Package, Zap, Plus, Boxes, Flame, Sparkles, RefreshCw } from 'lucide-react';

export function BusinessWorkspaceHome({ embedded = false }: { embedded?: boolean }) {
  const { selected, workspaces, select } = useBusinessWorkspace();
  const { setCurrentPage } = useVendor();
  const [products, setProducts] = useState<{ id: string; name: string; stock: number; status: string }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setProducts([]);
    setError('');
    setSeedNotice('');
    setLoading(false);
    if (!selected || selected.kind === 'food') return () => controller.abort();
    setLoading(true);
    workspaceRequest<{ products: typeof products }>(`/catalog?workspaceId=${encodeURIComponent(selected.id)}`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setProducts(data.products); })
      .catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Unable to load products.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [selected?.id, selected?.kind, revision]);

  const handleQuickSeed = async () => {
    if (!selected) return;
    setSeeding(true);
    setError('');
    setSeedNotice('');
    try {
      const res = await workspaceRequest<{ success: boolean; message: string; count: number }>(
        '/specialist/quick-seed-catalog',
        {
          method: 'POST',
          body: JSON.stringify({ workspaceId: selected.id })
        }
      );
      setSeedNotice(res.message || 'Starter devotional products linked successfully!');
      setRevision(v => v + 1);
    } catch (err: any) {
      setError(err.message || 'Unable to populate starter catalog.');
    } finally {
      setSeeding(false);
    }
  };

  const Heading = embedded ? 'h2' : 'h1';

  if (selected?.kind === 'food') {
    return (
      <section className={embedded ? 'space-y-4' : 'p-6 space-y-4'}>
        <Heading className="text-2xl font-bold">{embedded ? 'Food Partner Portal' : selected.name}</Heading>
        <p className="text-slate-300">Food & Dining operates through the separate Food Partner Portal. Food operations will be updated in a later stage.</p>
        <a href="https://food.apexbee.in/" className="inline-block rounded-lg bg-amber-400 px-4 py-2 text-slate-950 font-semibold">Open Food Partner Portal</a>
        <p className="text-sm text-slate-400">Sign in with your approved food partner account.</p>
      </section>
    );
  }

  const isDevotional = selected?.categoryName?.toLowerCase().includes('devotional') ||
    selected?.slug?.toLowerCase().includes('devotional') ||
    (selected?.name && /pooja|puja|festival|flower|garland|idol|prasadam|brass/.test(selected.name.toLowerCase()));

  return (
    <section className={embedded ? 'space-y-5 text-left' : 'p-4 md:p-6 space-y-5 max-w-7xl mx-auto text-left'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading className="text-2xl font-bold text-white">
            {embedded ? 'Catalog overview' : selected?.name || 'Your approved businesses'}
          </Heading>
          <p className="text-slate-400 text-sm mt-1">
            {selected ? `${selected.categoryName} · Product snapshot for this business.` : 'Choose a business to view its operations and catalog.'}
          </p>
        </div>

        {selected && (
          <div className="flex flex-wrap items-center gap-2">
            {!isDevotional && <button
              type="button"
              onClick={handleQuickSeed}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-2 text-xs transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <Zap size={14} className={seeding ? 'animate-bounce' : ''} />
              {seeding ? 'Populating...' : 'Quick-Populate Catalog'}
            </button>}
            <button
              type="button"
              onClick={() => setCurrentPage('add-product')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3.5 py-2 text-xs border border-slate-700 transition cursor-pointer"
            >
              <Plus size={14} /> Add Product
            </button>
            {isDevotional && (
              <button
                type="button"
                onClick={() => setCurrentPage('business-bundles')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-3.5 py-2 text-xs border border-slate-700 transition cursor-pointer"
              >
                <Boxes size={14} /> Kits &amp; Combos
              </button>
            )}
            <button
              type="button"
              onClick={() => setCurrentPage('business-operations')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3.5 py-2 text-xs border border-slate-700 transition cursor-pointer"
            >
              <Flame size={14} /> Specialist Tools
            </button>
          </div>
        )}
      </div>

      {seedNotice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-semibold">
          ✓ {seedNotice}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
          <button onClick={() => setRevision(v => v + 1)} className="underline ml-2 font-bold cursor-pointer">Try again</button>
        </div>
      )}

      {!selected ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map(workspace => (
            <button
              key={workspace.id}
              onClick={() => select(workspace.id)}
              className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 text-left hover:border-amber-400 transition cursor-pointer"
            >
              <h2 className="font-semibold text-lg text-white">{workspace.name}</h2>
              <p className="text-sm text-slate-400 mt-2">{workspace.categoryName}</p>
              <p className="text-amber-300 text-sm mt-4 font-bold">Open business →</p>
            </button>
          ))}
        </div>
      ) : loading ? (
        <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin text-amber-400" />
          <span>Loading catalog products…</span>
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>{products.length} linked products in this approved channel</span>
            <button onClick={() => setCurrentPage('products-all')} className="text-amber-300 hover:underline">
              View full catalog manager →
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map(product => (
              <article key={product.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2 hover:border-slate-700 transition">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-sm">{product.name}</h3>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${product.status === 'Active' || product.status === 'Approved' || product.status === 'Live'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-700 text-slate-300'
                    }`}>
                    {product.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  <strong className={product.stock <= 5 ? 'text-amber-400' : 'text-slate-200'}>
                    {product.stock} units
                  </strong> in stock
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No products are linked to this approved business yet.</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
              Your vendor account is approved for <strong>{selected.name}</strong>, but you haven't uploaded or linked any products to this channel yet.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!isDevotional && <button
              type="button"
              onClick={handleQuickSeed}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 text-xs transition cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Zap size={14} className={seeding ? 'animate-bounce' : ''} />
              {seeding ? 'Populating...' : 'Quick-Populate Recommended Devotional Products'}
            </button>}
            <button
              type="button"
              onClick={() => setCurrentPage('add-product')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 text-xs border border-slate-600 transition cursor-pointer"
            >
              <Plus size={14} /> Add Custom Product
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
