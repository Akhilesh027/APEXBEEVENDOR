import { useEffect, useRef, useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { useBusinessWorkspace } from '../context/BusinessWorkspaceContext';
import { businessDate, workspaceRequest } from '../services/workspaceService';
import type { DairyOperations, DairySubscription } from '../services/workspaceService';
import type { DairyRider } from '../services/workspaceService';
import { DairyDeliveryActions } from '../components/DairyDeliveryActions';
import { DairyOperationsPanel } from '../components/DairyOperationsPanel';
import { DairyReviewsPanel } from '../components/DairyReviewsPanel';
import { isWaterBusiness } from '../services/businessPortal';
import { CalendarDays, Milk, Droplets, RefreshCw } from 'lucide-react';

type View = 'overview' | 'subscriptions' | 'deliveries' | 'demand' | 'stock' | 'routes' | 'ledger' | 'billing' | 'reports' | 'reviews';
const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
const inputClass = 'rounded-lg border border-slate-700 bg-slate-900 text-white px-3 py-2 text-sm max-w-full';
const buttonClass = 'rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-50';

export function DairyWorkspace({ initialView = 'overview' }: { initialView?: View }) {
  const { selected } = useBusinessWorkspace();
  const { setCurrentPage } = useVendor();
  const water = isWaterBusiness(selected), supported = selected?.kind === 'dairy' || water;
  const api = water ? '/water/recurring' : '/dairy';
  const [view, setView] = useState<View>(initialView);
  const [date, setDate] = useState(businessDate);
  const [data, setData] = useState<DairyOperations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const viewStatus = view !== 'subscriptions' && ['expired', 'cancelled'].includes(status) ? 'all' : status;
  const [paymentFilter, setPaymentFilter] = useState(false);
  const [slot, setSlot] = useState('all');
  const [frequency, setFrequency] = useState('all');
  const [period, setPeriod] = useState('all');
  const [riders, setRiders] = useState<DairyRider[]>([]);
  const [riderNotice, setRiderNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [skipSubscription, setSkipSubscription] = useState<DairySubscription | null>(null);
  const skipForm = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!skipSubscription) return;
    skipForm.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    skipForm.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  }, [skipSubscription]);
  const next = new Date(`${businessDate()}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
  const earliestSkip = next.toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(earliestSkip);
  const [toDate, setToDate] = useState(earliestSkip);
  useEffect(() => { setView(initialView); }, [initialView]);
  useEffect(() => {
    const controller = new AbortController(); setRiders([]); setRiderNotice('');
    if (view !== 'deliveries' || !selected || !supported) return () => controller.abort();
    workspaceRequest<{ riders: DairyRider[]; territoryConfigured: boolean }>(`${api}/riders?workspaceId=${encodeURIComponent(selected.id)}`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) { setRiders(result.riders); if (!result.riders.length) setRiderNotice(result.territoryConfigured ? 'No active delivery riders are available in this store territory.' : 'Complete the store territory to assign delivery riders.'); } })
      .catch(error => { if (!controller.signal.aborted) setRiderNotice(error instanceof Error ? error.message : 'Unable to load riders.'); });
    return () => controller.abort();
  }, [selected?.id, selected?.kind, view]);
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setError(''); setLoading(true);
    if (!selected || !supported) { setLoading(false); return () => controller.abort(); }
    workspaceRequest<DairyOperations>(`${api}?workspaceId=${encodeURIComponent(selected.id)}&date=${date}`, { signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) setData(value); })
      .catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Unable to load recurring delivery operations.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [selected?.id, selected?.kind, date, revision]);

  async function changeSubscription(sub: DairySubscription, action: 'pause' | 'resume' | 'skip', range?: { fromDate: string; toDate: string }) {
    if (!selected || busy) return;
    setBusy(true); setActionError(''); setNotice('');
    try {
      const result = await workspaceRequest<{ message: string }>(`${api}/subscriptions/${sub.id}`, {
        method: 'PATCH', body: JSON.stringify({ workspaceId: selected.id, action, ...(action === 'skip' ? range || { fromDate, toDate } : {}) }),
      });
      setNotice(result.message); setSkipSubscription(null); setRevision(value => value + 1);
    } catch (error) { setActionError(error instanceof Error ? error.message : 'Unable to update subscription.'); }
    finally { setBusy(false); }
  }
  async function changeDelivery(sub: DairySubscription, action: 'assign' | 'start' | 'deliver' | 'fail', details: Record<string, string> = {}) {
    if (!selected || busy) return;
    setBusy(true); setActionError(''); setNotice('');
    try {
      const result = await workspaceRequest<{ message: string }>(`${api}/deliveries/${sub.id}`, { method: 'PATCH', body: JSON.stringify({ workspaceId: selected.id, date, action, ...details }) });
      setNotice(result.message); setRevision(value => value + 1);
    } catch (error) { setActionError(error instanceof Error ? error.message : 'Unable to update delivery.'); }
    finally { setBusy(false); }
  }

  if (!selected || !supported) return <p className="p-6 text-slate-300">Select an approved recurring-delivery business.</p>;
  const filtered = data?.subscriptions.filter(sub =>
    (viewStatus === 'all' || sub.status === viewStatus) && (view !== 'subscriptions' || !paymentFilter || !!sub.pendingPaymentDate) && (slot === 'all' || sub.deliverySlot === slot) && (frequency === 'all' || sub.frequency === frequency) && (view !== 'deliveries' || period === 'all' || sub.deliveryPeriod === period) &&
    `${sub.customerName} ${sub.customerPhone} ${sub.productName} ${sub.address}`.toLowerCase().includes(search.toLowerCase())) || [];
  const deliveries = filtered.filter(sub => sub.due || ['started', 'delivered', 'failed'].includes(sub.deliveryStatus || ''));
  const upcomingSubscription = filtered.filter(sub => sub.status === 'active' && sub.startDate > date).sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const tabs: { id: View; label: string }[] = [{ id: 'overview', label: 'Overview' }, { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'deliveries', label: 'Delivery plan' }, { id: 'demand', label: 'Next day requirements' }, { id: 'stock', label: water ? 'Filled-water stock' : 'Dairy stock' },
    { id: 'routes', label: 'Routes' }, ...(!water ? [{ id: 'ledger' as View, label: 'Collection & wastage' }] : []), { id: 'billing', label: 'Subscriber billing' }, { id: 'reports', label: 'Reports' }, ...(!water ? [{ id: 'reviews' as View, label: 'Dairy reviews' }] : [])];

  return <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
    <div className="flex flex-wrap gap-4 items-start justify-between">
      <div><h1 className="text-2xl md:text-3xl font-bold flex gap-3 items-center">{water ? <Droplets className="text-sky-400" /> : <Milk className="text-amber-400" />}{water ? selected.name : 'Milk and Dairy'}</h1>
        <p className="text-slate-400 mt-2">Manage recurring customers, delivery schedules, and {water ? 'water-can' : 'dairy'} requirements.</p></div>
      <div className="flex flex-wrap gap-2 items-center"><label className="text-sm flex gap-2 items-center"><CalendarDays size={18} /><span>Delivery date</span><input aria-label="Delivery date" type="date" value={date} onChange={event => { if (event.target.value) setDate(event.target.value); }} className={inputClass} /></label>
        <button className={buttonClass} aria-label="Refresh delivery operations" onClick={() => setRevision(value => value + 1)} disabled={loading}><RefreshCw size={16} /></button></div>
    </div>
    <nav aria-label="Recurring delivery sections" className="flex gap-2 overflow-x-auto pb-2">{tabs.map(tab => <button key={tab.id} aria-current={view === tab.id ? 'page' : undefined} onClick={() => water ? setCurrentPage(({overview:'dashboard',subscriptions:'water-subscriptions',deliveries:'water-deliveries',demand:'water-demand',stock:'water-stock',routes:'water-routes',billing:'water-billing',reports:'water-consumption'} as Record<string,string>)[tab.id] || 'dashboard') : setView(tab.id)}
      className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${view === tab.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}>{tab.label}</button>)}</nav>
    {notice && <p role="status" className="text-emerald-300">{notice}</p>}
    {actionError && <p role="alert" className="text-rose-300">{actionError}</p>}
    {view === 'reviews' && <DairyReviewsPanel key={selected.id} workspaceId={selected.id} />}
    {data && ['routes', 'ledger', 'billing', 'reports'].includes(view) && <DairyOperationsPanel key={`${selected.id}-${view}`} view={view as 'routes' | 'ledger' | 'billing' | 'reports'} data={data} onRefresh={() => setRevision(value => value + 1)} />}
    {loading ? <p role="status" className="text-slate-400">Loading dairy records…</p> : error ? <div role="alert" className="space-y-3"><p className="text-rose-300">{error}</p><button className={buttonClass} onClick={() => setRevision(value => value + 1)}>Try again</button></div> : data && <>
      {data.holiday && <p className="text-amber-200">{date} is a recorded holiday. No recurring deliveries are planned for this date.</p>}
      {view === 'overview' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[['Active subscriptions', data.summary.active], ['Paused subscriptions', data.summary.paused], ['Scheduled for this date', data.summary.scheduled], ['Confirmed delivered', data.summary.delivered]].map(([label, count]) =>
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><p className="text-sm text-slate-400">{label}</p><p className="text-3xl font-bold mt-2">{count}</p></div>)}</div>
        {data.settings && <section className="rounded-xl border border-slate-800 p-5 space-y-2"><h2 className="font-bold">Business delivery settings</h2><p>{data.settings.businessType}</p><p className="text-sm text-slate-300">Morning: {data.settings.morningDelivery || 'Not offered'} · Evening: {data.settings.eveningDelivery || 'Not offered'} · Weekly holiday: {data.settings.weeklyHoliday || 'None'}</p></section>}
        <section className="rounded-xl border border-slate-800 p-5 space-y-3"><h2 className="text-lg font-bold">Requirements for {data.tomorrow}</h2><p className="text-slate-400">{data.summary.tomorrowDeliveries} scheduled deliveries after pauses, skipped dates, and recorded holidays.</p><button onClick={() => setView('demand')} className={buttonClass}>View product requirements</button></section>
        {!data.subscriptions.length && <p className="text-slate-400">No subscriptions yet. New subscriptions for this business will appear here.</p>}
      </>}
      {(view === 'subscriptions' || view === 'deliveries') && <>
        <div className="flex flex-wrap gap-3"><input type="search" aria-label="Search subscription customers" placeholder="Search customer, phone, or product" className={`${inputClass} flex-1 min-w-48`} value={search} onChange={event => setSearch(event.target.value)} />
          <select aria-label="Subscription status" className={inputClass} value={viewStatus} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="paused">Paused</option>{view === 'subscriptions' && <><option value="expired">Expired</option><option value="cancelled">Cancelled</option></>}</select>
          <select aria-label="Subscription frequency" className={inputClass} value={frequency} onChange={event => setFrequency(event.target.value)}><option value="all">All delivery schedules</option><option value="daily">Daily</option><option value="alternate">Alternate days</option><option value="custom">Custom days</option><option value="weekly">Once a week</option><option value="monthly">Once a month</option></select>
          <select aria-label="Delivery slot" className={inputClass} value={slot} onChange={event => setSlot(event.target.value)}><option value="all">All delivery slots</option>{[...new Set(data.subscriptions.map(sub => sub.deliverySlot))].map(value => <option key={value}>{value}</option>)}</select>
        </div>
        {view === 'subscriptions' && !water && <div className="flex flex-wrap gap-2" aria-label="Subscriber attention">
          <button type="button" className={buttonClass} aria-pressed={status === 'expired'} onClick={() => { setStatus(status === 'expired' ? 'all' : 'expired'); setPaymentFilter(false); }}>Expired ({data.summary.expired ?? 0})</button>
          <button type="button" className={buttonClass} aria-pressed={paymentFilter} onClick={() => { setStatus('all'); setPaymentFilter(value => !value); }}>Pending payment ({data.summary.pendingPayment ?? 0})</button>
        </div>}
        {view === 'deliveries' && <section className="space-y-3"><div className="flex flex-wrap gap-2" aria-label="Delivery period">{[['all', 'All runs'], ['morning', 'Morning'], ['evening', 'Evening'], ['other', 'Other slots']].map(([value, label]) => <button type="button" key={value} aria-pressed={period === value} onClick={() => setPeriod(value)} className={`rounded-lg border px-3 py-2 text-sm ${period === value ? 'bg-amber-400 text-slate-950 border-amber-400 hover:bg-amber-300' : 'border-slate-600 hover:bg-slate-800'}`}>{label}</button>)}</div><p className="text-sm text-slate-400">{date}: {deliveries.length} runs · {deliveries.reduce((sum, sub) => sum + (sub.componentPacks ?? sub.quantity), 0)} {water ? 'cans / bottles' : 'packs'} · {Math.round(deliveries.reduce((sum, sub) => sum + (sub.litres || 0), 0) * 1000) / 1000} recorded litres</p>{riderNotice && <p role="status" className="text-sm text-amber-200">{riderNotice}</p>}</section>}
        {(view === 'deliveries' ? deliveries : filtered).length ? <div className="space-y-3">{(view === 'deliveries' ? deliveries : filtered).map(sub => <article key={sub.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex flex-wrap justify-between gap-2"><div><h2 className="font-bold">{sub.customerName}</h2><p className="text-sm text-slate-400">{sub.customerPhone}</p></div><span className="text-xs uppercase text-amber-300">{view === 'deliveries' ? sub.deliveryStatus === 'started' ? 'Out for delivery' : sub.deliveryStatus || 'Pending' : sub.status}</span></div>
          <p>{sub.productName} · {sub.quantity} units{sub.packSize ? ` × ${sub.packSize}` : ''}</p>
          <p className="text-sm text-slate-400">{sub.frequency}{sub.customDays?.length ? ` (${sub.customDays.join(', ')})` : ''} · {sub.deliverySlot} · {money(sub.unitPrice)} per unit</p>
          <p className="text-sm text-slate-400">Starts {sub.startDate} · Billing: {sub.billingCycle ? `${sub.billingCycle} cycle` : 'Existing plan'}{sub.litres != null ? ` · ${sub.litres} L per delivery` : ''}</p>
          <p className="text-sm text-slate-300">{sub.address || 'No delivery address recorded'}</p>
          {view === 'subscriptions' && sub.currentPeriodEnd && <p className="text-sm text-slate-400">Current cycle ends {sub.currentPeriodEnd} · Auto-renew {sub.autoRenew === false ? 'off' : 'on'}</p>}
          {view === 'subscriptions' && sub.pendingPaymentDate && <p className="text-sm text-amber-200">Wallet funding pending for {sub.pendingPaymentDate} · {money(sub.quantity * sub.unitPrice)}</p>}
          {view === 'deliveries' ? <><p className="text-sm text-slate-400">Delivery partner: {sub.deliveryAgentName || 'Not assigned'}</p><DairyDeliveryActions key={`${sub.id}-${date}`} sub={sub} riders={riders} date={date} busy={busy} onAction={changeDelivery} /></> : <>
            {!!sub.skippedDates.length && <p className="text-xs text-slate-400">Skipped dates: {sub.skippedDates.slice().sort().join(', ')}</p>}
            {selected.canOfferSubscriptions && ['active', 'paused'].includes(sub.status) && <div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={busy} onClick={() => changeSubscription(sub, sub.status === 'active' ? 'pause' : 'resume')}>{sub.status === 'active' ? 'Pause' : 'Resume'}</button>
              <button className={buttonClass} disabled={busy || sub.skippedDates.includes(earliestSkip)} onClick={() => changeSubscription(sub, 'skip', { fromDate: earliestSkip, toDate: earliestSkip })}>{sub.skippedDates.includes(earliestSkip) ? 'Tomorrow skipped' : 'Skip tomorrow'}</button>
              <button className={buttonClass} disabled={busy} onClick={() => { setSkipSubscription(sub); setFromDate(earliestSkip); setToDate(earliestSkip); setActionError(''); }}>Skip dates</button></div>}
          </>}
        </article>)}</div> : <div className="text-slate-400 py-8 space-y-3"><p>{view === 'deliveries' ? 'No deliveries match this date and your filters.' : 'No subscriptions match your filters.'}</p>{view === 'deliveries' && upcomingSubscription && <><p>An active subscription starts on {upcomingSubscription.startDate}. Deliveries appear from its start date, according to its schedule.</p><button type="button" className={buttonClass} onClick={() => { setDate(upcomingSubscription.startDate); setPeriod('all'); }}>View start date: {upcomingSubscription.startDate}</button></>}</div>}
      </>}
      {view === 'demand' && <section className="space-y-4"><h2 className="text-xl font-bold">Product requirements for {data.tomorrow}</h2><p className="text-sm text-slate-400">{water ? 'Requirements show scheduled cans or bottles and their recorded water volume. Empty-container returns are tracked separately.' : 'Combos are expanded into their individual products. Quantities show component packs, excluding the combo wrapper. Litres use recorded liquid pack sizes; gram packs remain separate.'}</p>
        {data.demand.length ? <div className="grid sm:grid-cols-2 gap-3">{data.demand.map((item, index) => <div key={index} className="rounded-xl border border-slate-800 p-4"><h3 className="font-semibold">{item.productName}</h3><p className="text-2xl font-bold my-2">{item.quantity} {water ? 'cans / bottles' : 'packs'}{item.litres != null ? ` · ${item.litres} L` : ''}</p><p className="text-sm text-slate-400">{item.packSize || 'Pack size not recorded'} · {item.deliveries} deliveries</p>{item.warning && <p role="status" className="text-amber-200 text-sm mt-2">{item.warning} Totals may be incomplete.</p>}</div>)}</div> : <p className="text-slate-400">No recurring deliveries are required for this date.</p>}
      </section>}
      {view === 'stock' && <section className="space-y-4"><h2 className="text-xl font-bold">{water ? 'Filled-water product stock' : 'Dairy product stock'}</h2>{data.products.length ? <div className="grid sm:grid-cols-2 gap-3">{data.products.map(product => <article key={product.id} className="rounded-xl border border-slate-800 p-4 space-y-2"><h3 className="font-semibold">{product.name}</h3><p>{product.stock} units in stock{product.packSize ? ` · ${product.packSize}` : ''}</p><p className="text-sm text-slate-400">{product.status || 'Status not recorded'} · Expiry: {product.expiry || 'Not recorded'}</p></article>)}</div> : <p className="text-slate-400">No products are linked to this business yet.</p>}</section>}
    </>}
    {skipSubscription && <section ref={skipForm} aria-label="Skip subscription dates" className="rounded-xl border border-amber-400/50 bg-slate-900 p-5 space-y-4"><h2 className="font-bold">Skip deliveries for {skipSubscription.customerName}</h2>
      <form onSubmit={event => { event.preventDefault(); changeSubscription(skipSubscription, 'skip'); }} className="flex flex-wrap items-end gap-3">
        <label className="text-sm space-y-2">From<input type="date" required min={earliestSkip} value={fromDate} onChange={event => { setFromDate(event.target.value); if (toDate < event.target.value) setToDate(event.target.value); }} className={`${inputClass} block`} /></label>
        <label className="text-sm space-y-2">Through<input type="date" required min={fromDate} value={toDate} onChange={event => setToDate(event.target.value)} className={`${inputClass} block`} /></label>
        <button type="submit" className={buttonClass} disabled={busy}>Save skipped dates</button><button type="button" className={buttonClass} disabled={busy} onClick={() => setSkipSubscription(null)}>Cancel</button>
      </form><p className="text-sm text-slate-400">Both dates are included. Changes start tomorrow or later.</p>
    </section>}
  </div>;
}
