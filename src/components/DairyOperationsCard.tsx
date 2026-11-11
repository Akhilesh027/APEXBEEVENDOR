import { useEffect, useState } from 'react';
import { useBusinessWorkspace } from '../context/BusinessWorkspaceContext';
import { useVendor } from '../context/VendorContext';
import { businessDate, workspaceRequest } from '../services/workspaceService';
import type { DairyOperations } from '../services/workspaceService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Milk } from 'lucide-react';

export function DairyOperationsCard({ mode = 'dashboard' }: { mode?: 'dashboard' | 'delivery' | 'inventory' | 'customers' }) {
  const { selected } = useBusinessWorkspace();
  const { setCurrentPage } = useVendor();
  const [data, setData] = useState<DairyOperations | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setData(null); setError('');
    if (selected?.kind !== 'dairy') return () => controller.abort();
    workspaceRequest<DairyOperations>(`/dairy?workspaceId=${encodeURIComponent(selected.id)}&date=${businessDate()}`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Unable to load dairy activity.'); });
    return () => controller.abort();
  }, [selected?.id, selected?.kind, revision]);
  if (selected?.kind !== 'dairy') return null;
  const titles = { dashboard: 'Milk and Dairy Activity', delivery: 'Morning and Evening Dairy Deliveries', inventory: 'Dairy Stock and Expiry', customers: 'Dairy Subscribers' };
  const metrics: [string, number][] = !data ? [] : mode === 'inventory' ? [
    ['Dairy products', data.products.length], ['Low stock at 10 units or less', data.products.filter(product => product.stock <= 10).length],
    ['Products without expiry recorded', data.products.filter(product => !product.expiry).length],
  ] : mode === 'delivery' ? [['Scheduled today', data.summary.scheduled], ['Delivered today', data.summary.delivered], ['Failed today', data.summary.failed], ['Next day deliveries', data.summary.tomorrowDeliveries]] :
    [['Active subscriptions', data.summary.active], ['Paused subscriptions', data.summary.paused], ['Scheduled today', data.summary.scheduled], ['Next day deliveries', data.summary.tomorrowDeliveries]];
  return <Card>
    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Milk className="h-5 w-5 text-amber-400" />{titles[mode]}</CardTitle>
      <CardDescription>{mode === 'inventory' ? 'Monitor dairy pack stock and recorded expiry details.' : 'Daily subscriptions, delivery slots, and next-day requirements for your approved dairy business.'}</CardDescription></CardHeader>
    <CardContent className="space-y-4">
      {error ? <div role="alert" className="text-sm text-rose-300"><p>{error}</p><button className="underline mt-2" onClick={() => setRevision(value => value + 1)}>Try again</button></div> : !data ? <p role="status" className="text-sm text-muted-foreground">Loading dairy activity…</p> : <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-secondary/25 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div>)}</div>
        {data.holiday && <p className="text-sm text-amber-300">Today is a recorded holiday. No recurring dairy deliveries are planned.</p>}
        {mode === 'delivery' && data.settings && <p className="text-sm text-muted-foreground">Morning: {data.settings.morningDelivery || 'Not recorded'} · Evening: {data.settings.eveningDelivery || 'Not recorded'}</p>}
        {mode === 'dashboard' && <p className="text-xs text-muted-foreground">Requirements for {data.tomorrow} account for subscription schedules, pauses, skipped dates, and recorded holidays.</p>}
      </>}
      <div className="flex flex-wrap gap-2">
        {(mode === 'dashboard' || mode === 'customers') && <Button size="sm" variant="outline" onClick={() => setCurrentPage('dairy-subscriptions')}>Manage Dairy Subscriptions</Button>}
        {(mode === 'dashboard' || mode === 'delivery') && <Button size="sm" variant="outline" onClick={() => setCurrentPage('dairy-deliveries')}>Daily Dairy Delivery Plan</Button>}
        {(mode === 'dashboard' || mode === 'delivery') && <Button size="sm" variant="outline" onClick={() => setCurrentPage('dairy-demand')}>Next Day Milk Requirements</Button>}
        {(mode === 'dashboard' || mode === 'inventory') && <Button size="sm" variant="outline" onClick={() => setCurrentPage('dairy-stock')}>Dairy Stock and Expiry</Button>}
      </div>
    </CardContent>
  </Card>;
}
