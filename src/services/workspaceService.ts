const API_ROOT = import.meta.env.VITE_API_ORIGIN || 'https://server.apexbee.in';
const API_URL = import.meta.env.VITE_API_URL || `${API_ROOT}/api`;

export async function workspaceRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token') || localStorage.getItem('vendor_token');
  const response = await fetch(`${API_URL}/vendor/workspace${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to load this business.');
  return data;
}

export interface BusinessWorkspace {
  id: string; categoryId: string; categoryName: string; name: string; slug: string;
  kind: 'dairy' | 'food' | 'flowers' | 'catalog'; canOfferSubscriptions: boolean;
  dailyNeedsProfile?: 'produce' | 'grocery' | 'organic';
}

export async function workspaceDownload(path: string, filename: string) {
  const response = await fetch(`${API_URL}/vendor/workspace${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('vendor_token') || ''}` } });
  if (!response.ok) { const result = await response.json(); throw new Error(result.message || 'Unable to download the document.'); }
  const url = URL.createObjectURL(await response.blob()); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface DairySubscription {
  id: string; productId: string; productName: string; quantity: number; packSize: string;
  unitPrice: number; frequency: string; customDays?: string[]; status: 'active' | 'paused' | 'cancelled' | 'expired';
  currentPeriodEnd?: string; autoRenew?: boolean; pendingPaymentDate?: string;
  billingCycle?: 'weekly' | 'monthly' | null; scheduleVersion?: number; litres?: number | null;
  componentPacks?: number;
  components?: { productId: string; productName: string; packs: number; packSize: string; litres: number | null; warning?: string }[];
  startDate: string; deliverySlot: string; skippedDates: string[];
  customerName: string; customerPhone: string; address: string; deliveryAgentName: string;
  due: boolean; dueTomorrow: boolean; deliveryStatus: string | null;
  deliveryTaskId?: string | null; deliveryRiderId?: string | null; deliveryPeriod?: 'morning' | 'evening' | 'other';
  deliveryProof?: string; otpVerified?: boolean;
}
export interface DairyRider { id: string; name: string; phone: string }

export async function uploadDairyDeliveryPhoto(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPG, PNG or WebP delivery photo up to 5 MB.');
  const form = new FormData(); form.append('file', file);
  const response = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('vendor_token') || ''}` }, body: form });
  const result = await response.json(); if (!response.ok || !result.url) throw new Error(result.message || 'Unable to upload the delivery photo.');
  return String(result.url);
}

export interface DairyOperations {
  workspace: BusinessWorkspace; date: string; tomorrow: string; holiday: boolean;
  settings: { businessType: string; morningDelivery?: string; eveningDelivery?: string; weeklyHoliday?: string; orderMode?: string } | null;
  subscriptions: DairySubscription[];
  demand: { productName: string; packSize: string; quantity: number; deliveries: number; litres?: number | null; warning?: string }[];
  products: { id: string; name: string; stock: number; status: string; packSize: string; expiry: string | null }[];
  summary: { active: number; paused: number; scheduled: number; delivered: number; failed: number; tomorrowDeliveries: number; expired?: number; pendingPayment?: number };
}

export const businessDate = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());
