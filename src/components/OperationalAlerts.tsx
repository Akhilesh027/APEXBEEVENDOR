import { useEffect, useState } from 'react';
import { AlertTriangle, ShoppingBag, X } from 'lucide-react';
import { useOperationalAlerts } from '../context/OperationalAlertsContext';
import type { ExpiryAlert, OrderAlert } from '../context/OperationalAlertsContext';

const titles = { new: 'New order received', due_soon: 'Preparation deadline approaching', overdue: 'Preparation overdue' };
const orderTime = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });

function OrderAlertRow({ order, onNavigate }: { order: OrderAlert; onNavigate?: () => void }) {
  const { open } = useOperationalAlerts();
  return <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
    <div className="min-w-0">
      <p className={`text-sm font-bold ${order.kind === 'overdue' ? 'text-rose-300' : 'text-amber-300'}`}>{titles[order.kind]}</p>
      <p className="break-words text-xs text-muted-foreground">{order.number}{order.deadline && ` · Due ${orderTime.format(new Date(order.deadline))}`}</p>
    </div>
    <button type="button" className="pos-action" aria-label={`View order ${order.number}`} onClick={() => { open(order); onNavigate?.(); }}>View order</button>
  </li>;
}

function BatchAlertRow({ batch, inventory = false, highlighted = false, onNavigate }: { batch: ExpiryAlert; inventory?: boolean; highlighted?: boolean; onNavigate?: () => void }) {
  const { open } = useOperationalAlerts();
  return <li className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2.5 ${highlighted ? 'border-primary' : 'border-border'}`}>
    <div className="min-w-0 break-words">
      <p className={`text-sm font-bold ${batch.status === 'expired' ? 'text-rose-300' : 'text-amber-300'}`}>{batch.status === 'expired' ? 'Batch expired' : 'Batch nearing expiry'} · {batch.productName}</p>
      <p className="text-xs text-muted-foreground">{batch.workspaceName} · Batch {batch.batchCode} · {batch.remaining} remaining · Use by {batch.expiry}{batch.expiryAt && ` at ${orderTime.format(new Date(batch.expiryAt))}`}</p>
    </div>
    {!inventory && <button type="button" className="pos-action" aria-label={`View batch ${batch.batchCode}`} onClick={() => { open(batch); onNavigate?.(); }}>View batch</button>}
  </li>;
}

export function NeedsAttention({ allBusinesses = false, compact = false, ordersOnly = false, onNavigate }: { allBusinesses?: boolean; compact?: boolean; ordersOnly?: boolean; onNavigate?: () => void }) {
  const { all, current, unavailable } = useOperationalAlerts();
  const feed = allBusinesses ? all : current;
  const { orders } = feed;
  const expiry = ordersOnly ? [] : feed.expiry;
  const [expanded, setExpanded] = useState(false);
  const total = orders.length + expiry.length;
  if (!total && !unavailable && !compact) return null;
  const limit = expanded ? total : compact ? 3 : 5;
  return <section aria-label="Needs attention" className={compact ? 'space-y-2 border-b border-border pb-3' : 'space-y-3 rounded-xl border border-border bg-card p-4'}>
    <h2 className="flex items-center gap-2 font-heading text-base font-bold"><AlertTriangle size={17} className="text-primary" aria-hidden="true" />Needs attention{total > 0 && ` (${total})`}</h2>
    {unavailable && <p role="status" className="text-xs text-amber-200">Alert refresh is temporarily unavailable.</p>}
    {!total && !unavailable && <p className="text-xs text-muted-foreground">No active order or stock alerts.</p>}
    {total > 0 && <ul className="space-y-2">
      {orders.slice(0, limit).map(order => <OrderAlertRow key={order.id} order={order} onNavigate={onNavigate} />)}
      {expiry.slice(0, Math.max(0, limit - orders.length)).map(batch => <BatchAlertRow key={batch.id} batch={batch} onNavigate={onNavigate} />)}
    </ul>}
    {total > (compact ? 3 : 5) && <button type="button" className="text-sm font-semibold text-primary underline" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Show fewer' : 'Show all alerts'}</button>}
  </section>;
}

export function StockExpiryAlerts() {
  const { current, target, clearTarget } = useOperationalAlerts();
  const [highlighted, setHighlighted] = useState('');
  useEffect(() => {
    if (target?.type !== 'batch') return;
    setHighlighted(target.id);
    clearTarget();
  }, [target, clearTarget]);
  const focused = current.expiry.find(batch => batch.id === highlighted);
  const batches = focused ? [focused, ...current.expiry.filter(batch => batch.id !== focused.id)] : current.expiry;
  if (!batches.length) return null;
  return <section aria-label="Stock expiry alerts" className="space-y-3 rounded-xl border border-border bg-card p-4">
    <h2 className="font-heading text-base font-bold">Stock expiry alerts</h2>
    <ul className="space-y-2">{batches.map(batch => <BatchAlertRow key={batch.id} batch={batch} inventory highlighted={batch.id === highlighted} />)}</ul>
  </section>;
}

export function NewOrderPopup() {
  const { arriving, open, dismissArrivals } = useOperationalAlerts();
  const latest = arriving[0];
  if (!latest) return null;
  return <aside aria-label="New order alert" className="fixed bottom-3 right-3 z-40 w-[min(24rem,calc(100vw-1.5rem))] rounded-xl border border-primary/50 bg-card p-4 shadow-2xl">
    <div className="flex items-start gap-3">
      <ShoppingBag className="mt-0.5 shrink-0 text-primary" size={22} aria-hidden="true" />
      <div className="min-w-0 flex-1" role="status">
        <p className="font-bold">{arriving.length === 1 ? 'New order received' : `${arriving.length} new orders received`}</p>
        <p className="break-words text-sm text-muted-foreground">{latest.number} · Waiting for acceptance</p>
      </div>
      <button type="button" aria-label="Dismiss new order pop-up" className="shrink-0 rounded p-1 text-muted-foreground" onClick={dismissArrivals}><X size={18} aria-hidden="true" /></button>
    </div>
    <button type="button" className="pos-action pos-action-primary mt-3" onClick={() => open(latest)}>View order</button>
  </aside>;
}
