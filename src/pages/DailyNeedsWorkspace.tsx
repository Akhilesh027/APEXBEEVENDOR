import { useEffect, useState } from 'react';
import { useBusinessWorkspace } from '../context/BusinessWorkspaceContext';
import { useVendor } from '../context/VendorContext';
import { dailyNeedsSettings } from '../services/dailyNeedsWorkspace';
import { businessDate, workspaceRequest } from '../services/workspaceService';
import { useOperationalAlerts } from '../context/OperationalAlertsContext';

type Product = { id: string; name: string; stock: number; unit: string; expiry: string | null; expiryStatus: string; batchTrackingEnabled: boolean; price: number | null };
type Batch = { _id: string; productId: string; batchCode: string; remaining: number; reserved: number; expiry: string; expiryAt?: string; status: string };
type Activity = { _id: { productId: string; kind: string }; count: number; quantity: number };
type Overview = {
  products: Product[];
  batches: Batch[];
  activity: Activity[];
  orders: { _id: string; count: number }[];
  sold: { _id: string; quantity: number; itemValue: number }[];
  certificates: { _id: string; record: { date: string; reference: string; expiry: string; notes: string } }[];
  preparation?: { id: string; number: string; status: string; due?: string; pickup: boolean; items: { name: string; quantity: number }[] }[];
  from: string; through: string; today: string;
};

const button = 'rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium hover:bg-slate-800';
const panel = 'rounded-xl border border-slate-700 bg-slate-900/60 p-4';
const activityNames: Record<string, string> = {
  stock_in: 'Stock received', wastage: 'Wastage', expired_disposal: 'Expired stock discarded',
  expiry_check: 'Expiry checks', freshness_check: 'Freshness checks',
  cold_storage_check: 'Storage temperature checks', certification: 'Certification records',
};
const stockMovements = new Set(['stock_in', 'wastage', 'expired_disposal']);
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const deadlineFormat = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' });

export function DailyNeedsWorkspace({ reports = false, embedded = false }: { reports?: boolean; embedded?: boolean }) {
  const { selected } = useBusinessWorkspace();
  const { setCurrentPage } = useVendor();
  const { openOrder } = useOperationalAlerts();
  const flowers = selected?.kind === 'flowers';
  const settings = dailyNeedsSettings(selected);
  const today = businessDate();
  const [range, setRange] = useState({ from: flowers && !reports ? today : `${today.slice(0, 7)}-01`, through: today });
  const [filters, setFilters] = useState(range);
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!selected || (!selected.dailyNeedsProfile && !flowers)) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ workspaceId: selected.id, ...filters });
    setData(null);
    setError('');
    workspaceRequest<Overview>(`/daily-needs/overview?${query}`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [selected?.id, selected?.dailyNeedsProfile, flowers, filters, revision]);

  if (!selected || !settings) return <p className="p-6">Choose an approved business with stock and quality tools.</p>;
  const productMap = new Map(data?.products.map(product => [product.id, product]));
  const flagged = data?.batches.filter(batch => ['expired', 'expiring_soon'].includes(batch.status)) ?? [];
  const undated = data?.products.filter(product => product.stock > 0 && !product.expiry && !data.batches.some(batch => batch.productId === product.id)) ?? [];
  const datedStockAlerts = data?.products.filter(product => !product.batchTrackingEnabled && product.stock > 0 && ['expired', 'expiring_soon'].includes(product.expiryStatus)) ?? [];
  const completed = data?.orders.filter(order => ['delivered', 'completed'].includes(String(order._id).toLowerCase())).reduce((sum, row) => sum + row.count, 0) ?? 0;
  const salesValue = data?.sold.reduce((sum, row) => sum + row.itemValue, 0) ?? 0;
  const certificates = new Map(data?.certificates.map(row => [row._id, row.record]));
  const shortcuts = [
    ['products-all', settings.catalog], ['add-product', settings.add], ['orders-all', flowers ? 'Manage Flower Orders' : 'Manage Orders'],
    ['daily-needs-stock', flowers ? 'Receive Flowers & Record Wastage' : settings.stock], ['daily-needs-quality', settings.quality],
    ...(flowers ? [['delivery', 'Deliveries & Pickup'], ['flower-custom-orders', 'Custom Garland Requests']] : []),
    ['procurement-hub', 'Purchasing & Goods Receipts'], ['daily-needs-reports', settings.reports],
  ];

  const Heading = embedded ? 'h2' : 'h1';
  return <section className={embedded ? 'space-y-5' : 'mx-auto max-w-7xl space-y-5 p-4 sm:p-6'}>
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-sm text-amber-300">{selected.categoryName}</p><Heading className="text-2xl font-bold">{reports ? settings.reports : flowers ? 'Flower shop operations' : embedded ? `${settings.title} operations` : settings.title}</Heading><p className="mt-2 text-sm text-slate-400">{settings.description}</p></div>
      <button type="button" className={button} onClick={() => setRevision(value => value + 1)}>Refresh</button>
    </header>
    {!reports && <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{shortcuts.map(([page, label]) => <button key={page} type="button" className={`${button} text-left`} onClick={() => setCurrentPage(page)}>{label}</button>)}</div>}
    {reports && <form className={`${panel} flex flex-wrap items-end gap-3`} onSubmit={event => { event.preventDefault(); setFilters({ ...range }); }}>
      <label>From<input className="ml-2 rounded border border-slate-600 bg-slate-950 p-2" type="date" required max={range.through} value={range.from} onChange={event => setRange({ ...range, from: event.target.value })} /></label>
      <label>Through<input className="ml-2 rounded border border-slate-600 bg-slate-950 p-2" type="date" required min={range.from} max={today} value={range.through} onChange={event => setRange({ ...range, through: event.target.value })} /></label>
      <button className={button}>Apply dates</button>
    </form>}
    {error && <p role="alert" className="text-rose-300">{error}</p>}
    {!data && !error && <p role="status">Loading business activity…</p>}
    {data && <>
      {flowers && !reports && <section className={`${panel} space-y-3`}>
        <h2 className="font-bold">Orders to prepare or hand over</h2>
        <p className="text-sm text-muted-foreground">Open flower and garland orders, including orders carried forward from earlier days.</p>
        {data.preparation?.length ? <ul className="space-y-2">{data.preparation.map(order => <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
          <div><p className="font-bold">{order.number} · {order.pickup ? 'Pickup' : 'Delivery'}</p><p className="text-sm text-muted-foreground">{order.items.map(item => `${item.quantity} × ${item.name}`).join(' · ')}</p>
            <p className="text-xs text-amber-300 capitalize">{order.status.replaceAll('_', ' ')}{order.due && ` · Prep target ${deadlineFormat.format(new Date(order.due))}`}</p></div>
          <button type="button" className="pos-action" aria-label={`Open order ${order.number}`} onClick={() => openOrder(order.id)}>Open order</button>
        </li>)}</ul> : <p className="text-sm text-muted-foreground">No flower orders need preparation or handover.</p>}
      </section>}
      <p className="text-sm text-slate-400">Order and activity period {data.from} to {data.through}</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([['Catalog products', data.products.length], ['Orders fulfilled', completed], ['Fulfilled item value', currency.format(salesValue)], ['Stock expiry alerts', flagged.length + datedStockAlerts.length]] as const).map(([label, value]) => <article className={panel} key={label}><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></article>)}
      </div>
      <p className="text-xs text-slate-400">Order figures use the order placement date and include only items in this workspace. Item value is before order-level fees and discounts.</p>
      <section className={`${panel} space-y-3`}>
        <h2 className="font-bold">{reports ? 'Current batch balances' : 'Expired and soon-to-expire batches'}</h2>
        {(reports ? data.batches : flagged).length ? <div className="overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="text-slate-400"><tr><th className="p-2">Product</th><th>Batch</th><th>Unreserved</th><th>Expiry</th><th>Status</th></tr></thead>
          <tbody>{(reports ? data.batches : flagged).map(batch => <tr className="border-t border-slate-700" key={batch._id}>
            <td className="p-2">{productMap.get(batch.productId)?.name}</td><td>{batch.batchCode}</td><td>{Math.max(0, batch.remaining - batch.reserved)} {productMap.get(batch.productId)?.unit}</td><td>{batch.expiryAt ? deadlineFormat.format(new Date(batch.expiryAt)) : batch.expiry}</td><td>{batch.status.replaceAll('_', ' ')}</td>
          </tr>)}</tbody>
        </table></div> : <p className="text-sm text-slate-400">{reports ? 'No tracked batches in stock.' : 'No tracked batches need attention.'}</p>}
        {datedStockAlerts.map(product => <p key={product.id} className="text-sm text-amber-200">{product.name} · {product.stock} {product.unit} · {product.expiryStatus.replaceAll('_', ' ')} · {product.expiry}</p>)}
        {undated.length > 0 && <p className="text-sm text-amber-200">{undated.length} stocked products have no recorded expiry. Review them in the catalog or record an opening expiry when receiving the first batch.</p>}
      </section>
      {selected.dailyNeedsProfile === 'organic' && <section className={`${panel} space-y-2`}>
        <h2 className="font-bold">Latest certification by product</h2><p className="text-xs text-slate-400">Certification details are supplied by the vendor.</p>
        {data.products.map(product => { const record = certificates.get(product.id); return <p key={product.id} className="border-t border-slate-700 pt-2 text-sm"><strong>{product.name}</strong> · {record ? `${record.reference} · ${record.expiry < data.today ? 'Expired' : 'Recorded'} through ${record.expiry}` : 'No certification recorded'}</p>; })}
      </section>}
      {reports && <>
        <section className={`${panel} space-y-2`}><h2 className="font-bold">Orders by status</h2>{data.orders.length ? data.orders.map(row => <p key={row._id} className="border-t border-slate-700 pt-2 text-sm">{row._id || 'Status unavailable'} · {row.count}</p>) : <p className="text-sm text-slate-400">No orders in this period.</p>}</section>
        <section className={`${panel} space-y-2`}><h2 className="font-bold">Product sales</h2>{data.sold.length ? data.sold.map(row => <p className="border-t border-slate-700 pt-2 text-sm" key={row._id}>{productMap.get(row._id)?.name} · {row.quantity} {productMap.get(row._id)?.unit} · {currency.format(row.itemValue)}</p>) : <p className="text-sm text-slate-400">No fulfilled items in this period.</p>}</section>
        <section className={`${panel} space-y-2`}><h2 className="font-bold">Stock and quality activity</h2>{data.activity.length ? data.activity.map(row => <p className="border-t border-slate-700 pt-2 text-sm" key={`${row._id.productId}-${row._id.kind}`}>
          {productMap.get(row._id.productId)?.name || 'Archived product'} · {activityNames[row._id.kind] || row._id.kind} · {stockMovements.has(row._id.kind) && productMap.has(row._id.productId) ? `${row.quantity} ${productMap.get(row._id.productId)?.unit}` : `${row.count} records`}
        </p>) : <p className="text-sm text-slate-400">No activity in this period.</p>}</section>
      </>}
      {!reports && <section className={`${panel} space-y-2`}><h2 className="font-bold">Catalog stock and prices</h2>{data.products.length ? data.products.map(product => <p key={product.id} className="border-t border-slate-700 pt-2 text-sm">{product.name} · {product.stock} {product.unit}{product.price != null ? ` · ${currency.format(product.price)} per ${product.unit === 'sellable units' ? 'unit' : product.unit}` : ''}</p>) : <p className="text-sm text-slate-400">Add a product to start tracking stock and prices.</p>}</section>}
    </>}
  </section>;
}
