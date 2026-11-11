import { useState } from 'react';
import { businessDate, uploadDairyDeliveryPhoto } from '../services/workspaceService';
import type { DairyRider, DairySubscription } from '../services/workspaceService';

export function DairyDeliveryActions({ sub, riders, date, busy, onAction }: {
  sub: DairySubscription; riders: DairyRider[]; date: string; busy: boolean;
  onAction: (sub: DairySubscription, action: 'assign' | 'start' | 'deliver' | 'fail', details?: Record<string, string>) => Promise<void>;
}) {
  const [riderId, setRiderId] = useState(sub.deliveryRiderId || ''); const [otp, setOtp] = useState('');
  const [proof, setProof] = useState(''); const [notes, setNotes] = useState(''); const [uploading, setUploading] = useState(false); const [error, setError] = useState('');
  const status = sub.deliveryStatus || 'pending'; const today = date === businessDate();
  const input = 'rounded-lg border border-slate-600 bg-slate-950 p-2.5 text-sm text-white w-full min-w-0';
  const button = 'rounded-lg border border-slate-600 px-3 py-2 text-sm disabled:opacity-50 hover:bg-slate-800';
  async function upload(file?: File) {
    if (!file) return; setUploading(true); setError('');
    try { setProof(await uploadDairyDeliveryPhoto(file)); } catch (error) { setError(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setUploading(false); }
  }
  if (['delivered', 'failed', 'cancelled'].includes(status)) return <div className="text-sm text-slate-300 space-y-1">{status === 'delivered' && <p>{sub.otpVerified ? 'Confirmed with customer OTP' : sub.deliveryProof ? 'Delivery photo recorded' : 'Delivery completed'}</p>}</div>;
  return <section aria-label={`Delivery actions for ${sub.customerName}`} className="border-t border-slate-700 pt-3 space-y-3">
    {['pending', 'assigned'].includes(status) && <div className="flex flex-wrap items-end gap-2"><label className="text-xs text-slate-300 flex-1 min-w-40">Delivery rider<select aria-label={`Delivery rider for ${sub.customerName}`} value={riderId} onChange={event => setRiderId(event.target.value)} disabled={busy} className={`${input} mt-1`}><option value="">Choose rider</option>{riders.map(rider => <option key={rider.id} value={rider.id}>{rider.name}{rider.phone ? ` · ${rider.phone}` : ''}</option>)}</select></label><button type="button" disabled={busy || !riderId || date < businessDate()} className={button} onClick={() => onAction(sub, 'assign', { riderId })}>{status === 'assigned' ? 'Update rider' : 'Assign rider'}</button></div>}
    {status === 'assigned' && <button type="button" disabled={busy || !today} onClick={() => onAction(sub, 'start')} className={button}>Start delivery</button>}
    {status === 'started' && <div className="rounded-xl border border-slate-700 p-3 space-y-3"><h3 className="text-sm font-semibold">Confirm delivery</h3><p className="text-xs text-slate-400">Enter today’s code from the customer, or attach a delivery photo.</p><div className="grid sm:grid-cols-2 gap-3"><label className="text-xs">Customer OTP<input aria-label={`Customer OTP for ${sub.customerName}`} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="off" maxLength={6} className={`${input} mt-1`} /></label><label className="text-xs min-w-0">Delivery photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || uploading} onChange={event => upload(event.target.files?.[0])} className="block w-full text-xs mt-2" />{proof && <span className="block text-emerald-300 mt-1">Photo attached <button type="button" onClick={() => setProof('')} className="underline">Remove</button></span>}</label></div><button type="button" className={button} disabled={busy || uploading || !today || (!/^\d{6}$/.test(otp) && !proof)} onClick={() => onAction(sub, 'deliver', { ...(otp ? { otp } : { proofPhoto: proof }) })}>Confirm delivered</button></div>}
    {['assigned', 'started'].includes(status) && <div className="flex flex-wrap items-end gap-2"><label className="text-xs flex-1 min-w-40">Failure reason<input aria-label={`Failure reason for ${sub.customerName}`} value={notes} maxLength={500} onChange={event => setNotes(event.target.value)} className={`${input} mt-1`} placeholder="Explain why delivery could not be completed" /></label><button type="button" className={button} disabled={busy || !today || notes.trim().length < 5} onClick={() => onAction(sub, 'fail', { notes })}>Mark failed</button></div>}
    {!today && <p className="text-xs text-slate-400">Start and confirm runs on their delivery date.</p>}{uploading && <p role="status" className="text-xs">Uploading delivery photo…</p>}{error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
  </section>;
}
