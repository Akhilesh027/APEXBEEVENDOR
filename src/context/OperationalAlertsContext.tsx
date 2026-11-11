import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useBusinessWorkspace } from './BusinessWorkspaceContext';
import { useVendor } from './VendorContext';
import { workspaceRequest } from '../services/workspaceService';

export interface OrderAlert {
  kind: 'new' | 'due_soon' | 'overdue';
  id: string;
  number: string;
  deadline?: string;
  productIds: string[];
}

export interface ExpiryAlert {
  id: string;
  workspaceId: string;
  workspaceName: string;
  productName: string;
  batchCode: string;
  expiry: string;
  expiryAt?: string;
  remaining: number;
  status: 'expiring_soon' | 'expired';
}

type Alert = OrderAlert | ExpiryAlert;
type Feed = { orders: OrderAlert[]; expiry: ExpiryAlert[] };
type Target = { type: 'order' | 'batch'; id: string };
const empty: Feed = { orders: [], expiry: [] };

interface OperationalAlerts {
  all: Feed;
  current: Feed;
  arriving: OrderAlert[];
  unavailable: boolean;
  target: Target | null;
  dismissArrivals: () => void;
  clearTarget: () => void;
  open: (alert: Alert) => void;
  openOrder: (id: string) => void;
}

const Context = createContext<OperationalAlerts | null>(null);

export function OperationalAlertsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, profile, setCurrentPage } = useVendor();
  const { selected, workspaces, productIds, select } = useBusinessWorkspace();
  const [all, setAll] = useState<Feed>(empty);
  const [unavailable, setUnavailable] = useState(false);
  const [arriving, setArriving] = useState<OrderAlert[]>([]);
  const [target, setTarget] = useState<Target | null>(null);
  const clearTarget = useCallback(() => setTarget(null), []);

  useEffect(() => {
    setAll(empty);
    setArriving([]);
    setUnavailable(false);
    setTarget(null);
    if (!isAuthenticated || !profile.id) return;
    const controller = new AbortController();
    let seen: Set<string> | null = null;
    let busy = false;
    const refresh = async () => {
      if (busy || document.visibilityState === 'hidden') return;
      busy = true;
      try {
        const feed = await workspaceRequest<Feed>('/alerts', { signal: controller.signal, cache: 'no-store' });
        if (controller.signal.aborted) return;
        const newOrders = feed.orders.filter(order => order.kind === 'new');
        const activeIds = new Set(newOrders.map(order => order.id));
        if (seen) {
          const unseen = newOrders.filter(order => !seen!.has(order.id));
          setArriving(previous => [...unseen, ...previous.filter(order => activeIds.has(order.id))]);
          activeIds.forEach(id => seen!.add(id));
        } else seen = activeIds;
        setAll(feed);
        setUnavailable(false);
      } catch {
        if (!controller.signal.aborted) setUnavailable(true);
      } finally { busy = false; }
    };
    void refresh();
    const timer = window.setInterval(refresh, 15_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [isAuthenticated, profile.id]);

  const inWorkspace = (order: OrderAlert) => !selected || order.productIds.some(id => productIds?.includes(id));
  const current = selected ? {
    orders: all.orders.filter(inWorkspace),
    expiry: all.expiry.filter(batch => batch.workspaceId === selected.id),
  } : all;

  const openOrder = (id: string) => {
    setArriving(previous => previous.filter(order => order.id !== id));
    setTarget({ type: 'order', id });
    setCurrentPage('orders-all');
  };

  const open = (alert: Alert) => {
    if ('workspaceId' in alert) {
      if (selected?.id !== alert.workspaceId) select(alert.workspaceId);
      setTarget({ type: 'batch', id: alert.id });
      setCurrentPage(workspaces.some(workspace => workspace.id === alert.workspaceId && workspace.kind === 'flowers') ? 'daily-needs-stock' : 'inventory-stock');
      return;
    }
    if (!inWorkspace(alert)) select('all');
    openOrder(alert.id);
  };

  return <Context.Provider value={{ all, current, arriving, unavailable, target, open, openOrder,
    dismissArrivals: () => setArriving([]), clearTarget,
  }}>{children}</Context.Provider>;
}

export function useOperationalAlerts() {
  const context = useContext(Context);
  if (!context) throw new Error('Operational alerts provider is required.');
  return context;
}
