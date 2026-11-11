export const dairyProductTypes = ['Cow Milk', 'Buffalo Milk', 'Organic Milk', 'Toned Milk', 'Full Cream Milk', 'Double Toned Milk', 'A2 Milk', 'Fresh Curd', 'Organic Curd', 'Butter', 'Ghee', 'Paneer', 'Cheese', 'Cream', 'Buttermilk', 'Flavoured Milk', 'Lassi'];
export const emptyDairyProduct = { dairyType: '', fatPercentage: '', packSize: '500', packUnit: 'ml', expiryDate: '' };
export type DairyProductValue = typeof emptyDairyProduct;
export const dairyToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export function dairyProductError(value: DairyProductValue) {
  if (!dairyProductTypes.includes(value.dairyType)) return 'Choose a dairy product type in Step 2.';
  if ((dairyProductTypes.slice(0, 7).includes(value.dairyType) && !value.fatPercentage.trim()) || (value.fatPercentage !== '' && (!Number.isFinite(Number(value.fatPercentage)) || Number(value.fatPercentage) < 0 || Number(value.fatPercentage) > 100))) return 'Enter a fat percentage from 0 to 100 in Step 2 (required for milk).';
  if (dairyProductTypes.slice(0, 7).includes(value.dairyType) && value.packUnit !== 'ml') return 'Milk pack sizes must use ml.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.expiryDate) || value.expiryDate < dairyToday()) return 'Choose an expiry date of today or later in Step 2.';
  return '';
}
export function readDairyProduct(product: any): DairyProductValue {
  const saved = product.dairyDetails || {};
  const attributes = product.attributes || {};
  const first = (value: any) => Array.isArray(value) ? value[0] : value;
  const aliases: Record<string, string> = { cow: 'Cow Milk', buffalo: 'Buffalo Milk', organic: 'Organic Milk', toned: 'Toned Milk', full_cream: 'Full Cream Milk', double_toned: 'Double Toned Milk', a2: 'A2 Milk', curd: 'Fresh Curd', butter: 'Butter', ghee: 'Ghee', paneer: 'Paneer', cheese: 'Cheese', cream: 'Cream', buttermilk: 'Buttermilk', flavoured_milk: 'Flavoured Milk', lassi: 'Lassi' };
  const oldType = first(attributes.milk_type || attributes['Milk / Dairy Type']);
  const oldVolume = String(first(attributes.volume || attributes['Volume / Weight']) || '');
  const amount = Number.parseFloat(oldVolume);
  const packSize = Number.isFinite(amount) ? amount * (/litre|\bl\b|\bkg\b/i.test(oldVolume) ? 1000 : 1) : 500;
  return { dairyType: saved.dairyType || aliases[oldType] || (dairyProductTypes.includes(oldType) ? oldType : ''),
    fatPercentage: String(saved.fatPercentage ?? first(attributes.fat_percentage) ?? ''),
    packSize: String(saved.packSize || packSize), packUnit: saved.packUnit || (/\bg\b|\bkg\b/i.test(oldVolume) ? 'g' : 'ml'),
    expiryDate: String(saved.expiryDate || product.expiryDate || first(attributes.expiry_date) || '').slice(0, 10) };
}
export function DairyProductFields({ value, onChange }: { value: DairyProductValue; onChange: (value: DairyProductValue) => void }) {
  const inputClass = 'block w-full mt-2 min-h-11 rounded-xl border border-blue-900/60 bg-slate-900 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-amber-400/40';
  const set = (key: keyof DairyProductValue, next: string) => onChange({ ...value, [key]: next });
  return <section className="rounded-2xl border border-blue-900/60 bg-slate-950/80 p-5 space-y-4">
    <h3 className="font-bold text-sm text-amber-400">Milk & Dairy product details</h3>
    <p className="text-xs text-blue-200">Set the type and pack size for this product. Stock below counts sellable packs; pricing applies to one pack.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="text-xs font-semibold text-white">Dairy product type *<select value={value.dairyType} onChange={event => set('dairyType', event.target.value)} className={inputClass}><option value="">Choose dairy type</option>{dairyProductTypes.map(type => <option key={type}>{type}</option>)}</select></label>
      <label className="text-xs font-semibold text-white">Fat percentage (%) {dairyProductTypes.slice(0, 7).includes(value.dairyType) ? '*' : '(optional)'}<input type="number" min="0" max="100" step="0.1" value={value.fatPercentage} onChange={event => set('fatPercentage', event.target.value)} placeholder="For example, 3.5" className={inputClass} /></label>
      <label className="text-xs font-semibold text-white">Pack size *<select value={value.packSize} onChange={event => set('packSize', event.target.value)} className={inputClass}>{['250', '500', '1000', '2000'].map(size => <option key={size} value={size}>{value.packUnit === 'ml' && Number(size) >= 1000 ? `${Number(size) / 1000} L` : `${size} ${value.packUnit}`}</option>)}</select></label>
      <label className="text-xs font-semibold text-white">Pack unit *<select value={value.packUnit} onChange={event => set('packUnit', event.target.value)} className={inputClass}><option value="ml">Millilitres (ml)</option><option value="g">Grams (g)</option></select></label>
      <label className="text-xs font-semibold text-white">Expiry date *<input type="date" min={dairyToday()} value={value.expiryDate} onChange={event => set('expiryDate', event.target.value)} className={inputClass} /></label>
    </div>
  </section>;
}
